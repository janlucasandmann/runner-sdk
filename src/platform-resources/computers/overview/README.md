<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models, analytics, tables, and page composition for the shared Computers resource. Resource-independent UI belongs in `src/platform-ui`.

## Contents

- [`computers-overview-analytics-client.test.ts`](computers-overview-analytics-client.test.ts) — Regression coverage for Computers Overview Analytics Client.
- [`computers-overview-analytics-client.ts`](computers-overview-analytics-client.ts) — Boundary adapter for Computers Overview Analytics Client.
- [`computers-overview-model.test.ts`](computers-overview-model.test.ts) — Regression coverage for Computers Overview Model.
- [`computers-overview-model.ts`](computers-overview-model.ts) — State and projection logic for Computers Overview Model.
- [`computers-overview-page.tsx`](computers-overview-page.tsx) — Presentation composition for Computers Overview Page.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

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
