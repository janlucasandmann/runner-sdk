<!-- platform-directory-guide:v1 -->

# Assurance service

## Purpose

Configure-mode ownership for the evidence-bound release decision that sits
above Tests, Evaluations, and Agent Optimization.

The canonical policy, version, run, audit, and fingerprint contracts live in
the control API. This platform module deliberately exposes that API through the
same authenticated `/api/real/*` boundary as the three evidence-producing
services. It does not recompute gate outcomes in the browser or accept
caller-authored scores and decisions.

## Trust boundary

- The control API loads Test, Evaluation, and Agent Optimization evidence from
  authoritative database rows.
- Evidence references are append-only while a run is active.
- Policies are pinned by immutable version and fingerprint.
- Manual approval is bound to the current evidence fingerprint.
- Terminal run decisions are immutable.

## Platform experience

Assurance appears under **Configure → Governance**. The workspace provides:

- a two-card overview and centralized policy table;
- immutable policy-version editing and publishing;
- project- and commit-bound run creation;
- gate decisions, canonical evidence envelopes, fingerprints, and audit events;
- fingerprint-bound human approval and terminal-run cancellation; and
- centralized team access management for `assurance_policy` resources.

The browser never computes a release decision. It only submits canonical
resource IDs and renders the control API's authoritative policy, evidence, and
decision records.

## Mission Control integration

Mission Control records canonical `policyId`, `policyVersionId`, and `runId`
values under `metadata.missionControl.deliveryAssurance.canonicalAssurance`.
Only explicitly designated completion tickets are gated. A ticket transition
to `done` fails closed unless the referenced Assurance Run:

- belongs to the same project and policy version;
- has terminal status `passed`;
- contains the canonical Assurance evidence and decision schema versions; and
- has matching, valid evidence and decision fingerprints.

Agents may create policies, versions, and runs, but they must never
self-approve a manual release gate.

## Working in this directory

Add future Assurance UI, Mission Control integrations, and project release
views here. Reuse centralized platform UI components. Do not duplicate the
server-side evaluator or treat local browser state as release proof.

## Verification

```bash
node src/platform-services/configure-mode/assurance/assurance-service-test.mjs
```
