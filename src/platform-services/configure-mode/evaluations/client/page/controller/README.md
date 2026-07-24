<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains interaction controllers and effect orchestration for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`actions.mjs`](actions.mjs) — Focused implementation of Actions.
- [`case-detail.mjs`](case-detail.mjs) — Focused implementation of Case Detail.
- [`charts.mjs`](charts.mjs) — Focused implementation of Charts.
- [`dialogs.mjs`](dialogs.mjs) — Focused implementation of Dialogs.
- [`editors.mjs`](editors.mjs) — Focused implementation of Editors.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`run-history.mjs`](run-history.mjs) — Per-evaluation run-history hydration and stale-response protection.
- [`setup.mjs`](setup.mjs) — Initialization for this layer.
- [`tables.mjs`](tables.mjs) — Focused implementation of Tables.
- [`thread-cases.mjs`](thread-cases.mjs) — Focused implementation of Thread Cases.
- [`version-dialogs.mjs`](version-dialogs.mjs) — Focused implementation of Version Dialogs.
- [`versions.mjs`](versions.mjs) — Focused implementation of Versions.
- [`views.mjs`](views.mjs) — Focused implementation of Views.

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
