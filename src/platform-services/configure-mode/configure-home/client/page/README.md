<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Configure Home service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`configure-home-overview-page.test.tsx`](configure-home-overview-page.test.tsx) — Regression coverage for Configure Home Overview Page.
- [`configure-home-overview-page.tsx`](configure-home-overview-page.tsx) — Configuration behavior for Configure Home Overview Page.
- [`home.mjs`](home.mjs) — Focused implementation of Home.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`notifications-overview-page.test.tsx`](notifications-overview-page.test.tsx) — Regression coverage for Notifications Overview Page.
- [`notifications-overview-page.tsx`](notifications-overview-page.tsx) — Presentation composition for Notifications Overview Page.
- [`notifications-section.mjs`](notifications-section.mjs) — Focused implementation of Notifications Section.
- [`notifications.mjs`](notifications.mjs) — Focused implementation of Notifications.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run configure-home-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
