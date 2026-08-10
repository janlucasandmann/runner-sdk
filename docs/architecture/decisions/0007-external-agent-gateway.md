# ADR 0007: Use a provider-neutral external agent gateway

- Status: Accepted
- Date: 2026-08-10

## Context

Jira, Linear, and future work systems must be able to invoke platform agents
from comments, assignments, commands, or native provider agent surfaces. A
reply on the same external work item must continue the existing platform
thread. Provider retries must not create duplicate runs or duplicate comments,
and external identities must not bypass organization access controls.

Implementing this independently in every connector would duplicate thread,
authorization, idempotency, retry, and delivery logic while making behavior
diverge across providers.

## Decision

The platform uses one provider-neutral external agent gateway.

- Provider adapters verify and normalize incoming payloads into a stable event
  envelope and suppress app-authored events.
- An installation represents one provider tenant and credential. A binding maps
  a provider project to one platform agent and default environment or project.
- A provider work item and binding map to one durable platform conversation;
  later comments continue that thread regardless of which permitted user wrote
  them.
- Identity authorization is explicit. Linked identities require current
  organization membership; external requesters require a non-empty allowlist.
- The event is persisted before the webhook receives `202`. Event processing
  and provider delivery are retryable and independently idempotent.
- The agent sees clean user text plus invisible structured provider context and
  only the connector actions allowed by the binding.
- The final platform run summary is delivered automatically. Agents do not
  compose or post the provider reply themselves.
- Jira and Linear native agent transports remain feature-gated. Generic
  webhooks are the stable baseline.

One provider app identity is used per provider installation. Individual
platform agents are selected by project binding; separate Jira or Linear users
are not created for every agent.

## Consequences

- Jira and Linear have consistent thread continuation and user experience.
- Adding a provider requires a small verification/normalization/delivery
  adapter rather than another orchestration stack.
- Provider credentials remain in the existing server-side connector runtime.
- Operators gain auditable installation, binding, identity, event, replay, and
  health APIs.
- Multi-replica production requires a shared transactional repository. The
  bundled atomic file adapter is limited to a singleton persistent-volume
  deployment.

## Verification

- Provider normalization tests protect stable conversations and app-event
  suppression.
- Policy tests protect membership and explicit external-requester allowlists.
- Repository and gateway tests protect durable claims and exactly-once logical
  processing.
- Delivery tests protect provider-side duplicate suppression after retries.
- Service tests verify rejection before durable acceptance.
