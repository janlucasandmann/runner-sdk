<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models, analytics, tables, and page composition for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`fine-tuning-overview-guide.tsx`](fine-tuning-overview-guide.tsx) — Focused implementation of Fine Tuning Overview Guide.
- [`fine-tuning-overview-page.test.tsx`](fine-tuning-overview-page.test.tsx) — Regression coverage for Fine Tuning Overview Page.
- [`fine-tuning-overview-page.tsx`](fine-tuning-overview-page.tsx) — Presentation composition for Fine Tuning Overview Page.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

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
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
