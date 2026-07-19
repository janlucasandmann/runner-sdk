<!-- platform-directory-guide:v1 -->

# Template Page

## Purpose

This directory contains template page behavior for the owning feature for the Imagine service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`composer-settings.mjs`](composer-settings.mjs) — Focused implementation of Composer Settings.
- [`configuration.mjs`](configuration.mjs) — Configuration behavior for Configuration.
- [`detail-surface.mjs`](detail-surface.mjs) — Focused implementation of Detail Surface.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`legacy-preview.mjs`](legacy-preview.mjs) — Focused implementation of Legacy Preview.

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
