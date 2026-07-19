<!-- platform-directory-guide:v1 -->

# Overview Styles

## Purpose

This directory contains ordered, owner-scoped style modules for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-foundation.mjs`](01-foundation.mjs) — Focused implementation of 01 Foundation.
- [`02-analytics-and-charts.mjs`](02-analytics-and-charts.mjs) — Focused implementation of 02 Analytics And Charts.
- [`03-resources-and-tables.mjs`](03-resources-and-tables.mjs) — Focused implementation of 03 Resources And Tables.
- [`04-sidebar-and-responsive.mjs`](04-sidebar-and-responsive.mjs) — Focused implementation of 04 Sidebar And Responsive.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run projects-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
