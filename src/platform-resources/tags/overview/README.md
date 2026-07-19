<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models, analytics, tables, and page composition for the shared Tags resource. Resource-independent UI belongs in `src/platform-ui`.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`tags-overview-guide.tsx`](tags-overview-guide.tsx) — Focused implementation of Tags Overview Guide.
- [`tags-overview-page.tsx`](tags-overview-page.tsx) — Presentation composition for Tags Overview Page.

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
