<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models, analytics, tables, and page composition for the Teams service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`teams-overview-guide.tsx`](teams-overview-guide.tsx) — Focused hero composition for Teams Overview.
- [`teams-overview-page.test.tsx`](teams-overview-page.test.tsx) — Regression coverage for Teams Overview Page.
- [`teams-overview-page.tsx`](teams-overview-page.tsx) — Presentation composition for Teams Overview Page.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run teams-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
