<!-- platform-directory-guide:v1 -->

# External agent gateway

## Purpose

This directory owns inbound agent invocation from external work systems. It
turns verified Jira and Linear events into durable platform events, applies
organization policy, creates or continues one platform thread per external
work item, and returns the final run summary through a durable delivery outbox.

## Contents

- [`domain.mjs`](domain.mjs) - Provider-neutral records, identifiers, validation, and sanitized presentation.
- [`repository.mjs`](repository.mjs) - Transactional repository contract and the atomic singleton file-store adapter.
- [`policy.mjs`](policy.mjs) - Linked-member and explicitly allowlisted external-requester authorization.
- [`verification.mjs`](verification.mjs) - Encrypted secrets, bearer verification, Linear HMAC verification, and native JWT verification.
- [`providers/`](providers/) - Jira and Linear payload normalization only; provider details do not leak into orchestration.
- [`thread-invoker.mjs`](thread-invoker.mjs) - Thread creation or continuation and scoped connector-tool injection.
- [`delivery.mjs`](delivery.mjs) - Provider reply delivery with provider-side idempotency metadata.
- [`gateway.mjs`](gateway.mjs) - Durable event processor, retry state machine, conversation mapping, and delivery worker.
- [`management.mjs`](management.mjs) - Authenticated installation, binding, identity, audit, health, and replay APIs.
- [`service.mjs`](service.mjs) - Minimal public webhook/native route and service lifecycle.

## Safety boundary

The public webhook route verifies the provider request and durably records the
normalized event before returning `202`. Provider payloads never become the
visible user message. Provider context is passed as hidden execution context,
and connector actions are restricted to the binding's validated allowlist.

The bundled file repository performs atomic replacement and is suitable only
for a singleton process backed by durable server storage. Local development
uses `~/.computer-agents/platform` rather than an ignored directory inside a
checkout, migrates the former checkout-local state automatically, and keeps a
server-side backup. A multi-replica deployment must inject a shared
transactional repository implementing `snapshot()` and `transact()`; local
container files do not provide cross-node claims or restart durability.

## Working in this directory

Keep provider protocols inside `providers/` and keep policy, thread, delivery,
and persistence behavior provider-neutral. Public webhook handlers must verify
before ingestion and return only after the event is durable. Add focused tests
for every new trigger, authorization branch, retry state, and delivery path.

## Verification

```bash
node --test apps/platform/server/integrations/external-agents/*.test.mjs
npm run typecheck
```

## Related documentation

- [External agent gateway setup](../../../../../docs/development/external-agent-gateway-setup.md)
- [ADR 0007](../../../../../docs/architecture/decisions/0007-external-agent-gateway.md)
- [Parent directory guide](../README.md)
