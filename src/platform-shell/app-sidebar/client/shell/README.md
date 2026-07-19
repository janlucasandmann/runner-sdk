<!-- platform-directory-guide:v1 -->

# Client Shell

## Purpose

This directory contains application-shell state, lifecycle, and navigation integration for the App Sidebar shell feature. Product-domain behavior remains with its owning service or resource.

## Contents

- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`lifecycle.mjs`](lifecycle.mjs) — Focused implementation of Lifecycle.
- [`navigation.mjs`](navigation.mjs) — Focused implementation of Navigation.
- [`refs.mjs`](refs.mjs) — Focused implementation of Refs.
- [`state.mjs`](state.mjs) — State ownership for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run app-sidebar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
