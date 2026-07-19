<!-- platform-directory-guide:v1 -->

# Page Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`execution.mjs`](execution.mjs) — Focused implementation of Execution.
- [`formatting.mjs`](formatting.mjs) — Focused implementation of Formatting.
- [`foundation.mjs`](foundation.mjs) — Focused implementation of Foundation.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`persistence.mjs`](persistence.mjs) — Focused implementation of Persistence.
- [`records.mjs`](records.mjs) — Focused implementation of Records.
- [`resources.mjs`](resources.mjs) — Focused implementation of Resources.
- [`runs.mjs`](runs.mjs) — Focused implementation of Runs.
- [`source-threads.mjs`](source-threads.mjs) — Focused implementation of Source Threads.
- [`versions.mjs`](versions.mjs) — Focused implementation of Versions.

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
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
