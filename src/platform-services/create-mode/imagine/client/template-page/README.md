<!-- platform-directory-guide:v1 -->

# Template Page

## Purpose

This directory contains template page behavior for the owning feature for the Imagine service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`actions.mjs`](actions.mjs) — Focused implementation of Actions.
- [`context.mjs`](context.mjs) — Focused implementation of Context.
- [`controller.mjs`](controller.mjs) — Interaction orchestration for Controller.
- [`foundation.mjs`](foundation.mjs) — Focused implementation of Foundation.
- [`generation.mjs`](generation.mjs) — Focused implementation of Generation.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`settings.mjs`](settings.mjs) — Focused implementation of Settings.
- [`sharing.mjs`](sharing.mjs) — Focused implementation of Sharing.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
