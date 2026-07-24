<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Fine Tuning service in Configure Mode, including persisted detail settings, ownership, team access, and fine-tuning-specific permissions. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`controller/`](controller/) — This directory contains interaction controllers and effect orchestration for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`entry.mjs`](entry.mjs) — Focused implementation of Entry.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`performance-chart.mjs`](performance-chart.mjs) — Focused implementation of Performance Chart.
- [`runtime.mjs`](runtime.mjs) — Runtime composition for this layer.

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
