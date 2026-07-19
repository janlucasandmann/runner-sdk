<!-- platform-directory-guide:v1 -->

# Server Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`evaluations.mjs`](evaluations.mjs) — Focused implementation of Evaluations.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`jobs.mjs`](jobs.mjs) — Focused implementation of Jobs.
- [`orchestration.mjs`](orchestration.mjs) — Focused implementation of Orchestration.
- [`primitives.mjs`](primitives.mjs) — Focused implementation of Primitives.
- [`responses.mjs`](responses.mjs) — Focused implementation of Responses.
- [`thread-data.mjs`](thread-data.mjs) — Focused implementation of Thread Data.

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

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
