<!-- platform-directory-guide:v1 -->

# Server Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`costs.mjs`](costs.mjs) — Focused implementation of Costs.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`primitives.mjs`](primitives.mjs) — Focused implementation of Primitives.
- [`records.mjs`](records.mjs) — Focused implementation of Records.
- [`scoring.mjs`](scoring.mjs) — Focused implementation of Scoring.
- [`sets.mjs`](sets.mjs) — Focused implementation of Sets.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
