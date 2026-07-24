<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Develop Home service in Develop Mode. Develop Home supplies service-specific links and callbacks to the centralized `PlatformHomePage`; shared Home layout belongs to `src/platform-ui/pages/home`. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`develop-home-overview-page.test.tsx`](develop-home-overview-page.test.tsx) — Regression coverage for Develop Home Overview Page.
- [`develop-home-overview-page.tsx`](develop-home-overview-page.tsx) — Presentation composition for Develop Home Overview Page.
- [`develop-webhooks-overview-page.tsx`](develop-webhooks-overview-page.tsx) — Presentation composition for Develop Webhooks Overview Page.
- [`home.mjs`](home.mjs) — Focused implementation of Home.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run develop-home-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
