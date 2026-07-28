<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models and the full-screen grouped catalog
composition for the shared Skills resource. System and custom Skills share one
collapsible table, while resource-independent UI belongs in `src/platform-ui`.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`skills-overview-guide.tsx`](skills-overview-guide.tsx) — Focused implementation of Skills Overview Guide.
- [`skills-overview-model.test.ts`](skills-overview-model.test.ts) — Regression coverage for Skills Overview Model.
- [`skills-overview-model.ts`](skills-overview-model.ts) — State and projection logic for Skills Overview Model.
- [`skills-overview-page.tsx`](skills-overview-page.tsx) — Presentation composition for Skills Overview Page.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-resource-overview-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
