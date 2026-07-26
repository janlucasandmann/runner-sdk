<!-- platform-directory-guide:v1 -->

# Evaluations Server

## Purpose

This directory contains HTTP routing and server-side domain adapters for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`domain/comparisons.mjs`](domain/comparisons.mjs) — Deterministic paired bootstrap evidence and slice-aware release gates.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`run-persistence.mjs`](run-persistence.mjs) — Ordered, retrying durable-write coordination for evaluation runs.
- [`runtime.mjs`](runtime.mjs) — Lease-fenced, checkpointed execution and restart recovery, including hydration of canonical control-plane run bindings and strict per-case terminal reports.

The public `runs.wake` service method hydrates an active run from its immutable
execution snapshot, resumes only unfinished cases, waits for a terminal durable
checkpoint, and rejects when another resource lease still owns execution. The
platform durable dispatcher calls this method with a claim-scoped workload
credential; no browser session is required.

For a canonical control-plane run, `runs.wake` never reconstructs cases from a
mutable client cache. It hydrates the published Evaluation snapshot and pinned
target from `computer_agents_evaluation_run_binding_v1`, resolves the
credential-free execution/evaluator snapshots, checkpoints each case, and
PATCHes only the canonical report fields accepted by the control API. The
control plane remains the sole owner of aggregate metrics, provenance,
signatures, and the audit ledger.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run evaluations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
