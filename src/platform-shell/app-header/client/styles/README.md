<!-- platform-directory-guide:v1 -->

# Client Styles

## Purpose

This directory contains ordered, owner-scoped style modules for the App Header shell feature. Product-domain behavior remains with its owning service or resource.

## Contents

- [`account-menu.mjs`](account-menu.mjs) — Focused implementation of Account Menu.
- [`header.mjs`](header.mjs) — Focused implementation of Header.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`notifications-popup.mjs`](notifications-popup.mjs) — Focused implementation of Notifications Popup.
- [`notifications-scrim.mjs`](notifications-scrim.mjs) — Focused implementation of Notifications Scrim.
- [`overlay-scrims.mjs`](overlay-scrims.mjs) — Focused implementation of Overlay Scrims.
- [`search-modal.mjs`](search-modal.mjs) — Focused implementation of Search Modal.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run app-header-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
