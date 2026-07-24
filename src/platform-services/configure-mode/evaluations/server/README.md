<!-- platform-directory-guide:v1 -->

# Evaluations Server

## Purpose

This directory contains HTTP routing and server-side domain adapters for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`run-persistence.mjs`](run-persistence.mjs) — Ordered, retrying durable-write coordination for evaluation runs.
- [`runtime.mjs`](runtime.mjs) — Runtime composition for this layer.

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
