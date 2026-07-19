<!-- platform-directory-guide:v1 -->

# Agents

## Purpose

This directory contains agents behavior for the owning feature for the Models service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`catalog-lifecycle.mjs`](catalog-lifecycle.mjs) — Focused implementation of Catalog Lifecycle.
- [`catalog-loader.mjs`](catalog-loader.mjs) — Focused implementation of Catalog Loader.
- [`catalog-state.mjs`](catalog-state.mjs) — State and projection logic for Catalog State.
- [`host-props.mjs`](host-props.mjs) — Focused implementation of Host Props.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`overview-action.mjs`](overview-action.mjs) — Focused implementation of Overview Action.
- [`props.mjs`](props.mjs) — Focused implementation of Props.
- [`resolved-catalog.mjs`](resolved-catalog.mjs) — Focused implementation of Resolved Catalog.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run models-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
