<!-- platform-directory-guide:v1 -->

# Fine Tuning Server

## Purpose

This directory contains HTTP routing and server-side domain adapters for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`application/`](application/) — Resumable optimization orchestration and
  side-effect boundaries.
- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`job-persistence.mjs`](job-persistence.mjs) — Ordered, retrying,
  coalescing durable checkpoint writes.
- [`runtime.mjs`](runtime.mjs) — Runtime composition for this layer.

Active jobs use platform-database leases with heartbeats and fencing tokens.
Runtime recovery reuses deterministic evaluation runs, optimizer threads, exact
prompt dispatches, and candidate-version keys. See the parent optimization
model for the complete execution contract.

The public `jobs.wake` service method hydrates an active job from its durable
orchestration state, resumes the current phase, waits for a terminal checkpoint,
and rejects when another resource lease owns execution. The platform durable
dispatcher calls it with a claim-scoped workload credential, so recovery no
longer depends on a browser reopening the service.

Candidate publication is performed only by the server-side policy. Each
terminal job persists a versioned publication-decision record; browser
hydration cannot auto-publish a draft.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run fine-tuning-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Optimization and holdout model](../OPTIMIZATION_MODEL.md)
- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
