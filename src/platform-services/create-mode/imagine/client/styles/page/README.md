<!-- platform-directory-guide:v1 -->

# Styles Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Imagine service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`composer.mjs`](composer.mjs) — Focused implementation of Composer.
- [`foundation.mjs`](foundation.mjs) — Focused implementation of Foundation.
- [`gallery.mjs`](gallery.mjs) — Focused implementation of Gallery.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`template-editor.mjs`](template-editor.mjs) — Focused implementation of Template Editor.
- [`top-navigation.mjs`](top-navigation.mjs) — Focused implementation of Top Navigation.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run imagine-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
