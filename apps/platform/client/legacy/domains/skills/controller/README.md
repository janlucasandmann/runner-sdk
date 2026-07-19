<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains remaining legacy browser interaction controllers and effect orchestration for Skills. Migrate behavior toward its typed owner without creating another application runtime.

## Contents

- [`01-state-and-data.js`](01-state-and-data.js) — State and projection logic for 01 State And Data.
- [`02-actions-and-editors.js`](02-actions-and-editors.js) — Focused implementation of 02 Actions And Editors.
- [`03-rendering-and-composition.js`](03-rendering-and-composition.js) — Focused implementation of 03 Rendering And Composition.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:legacy-syntax-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
