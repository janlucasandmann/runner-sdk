<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior
shared by Develop Mode services. The source-backed web app and function pages
use the detail shell here so their tab structure cannot diverge.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`develop-server-detail-page.tsx`](develop-server-detail-page.tsx) — Shared detail shell for web apps and functions, including full-width Code-tab sidebar behavior.
- [`develop-server-detail-page.css`](develop-server-detail-page.css) — Shared source-detail sizing and code-workspace layout.
- [`develop-server-detail-page.test.tsx`](develop-server-detail-page.test.tsx) — Detail-shell tab and composition coverage.
- [`resource-overview-page.tsx`](resource-overview-page.tsx) — Presentation composition for Resource Overview Page.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
