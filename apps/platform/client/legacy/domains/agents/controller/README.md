<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains remaining legacy browser interaction controllers and effect orchestration for Agents. Migrate behavior toward its typed owner without creating another application runtime.

## Contents

- [`assistant-and-composition.template.js`](assistant-and-composition.template.js) — Ordered source fragment for Assistant And Composition.
- [`bootstrap-and-lifecycle.template.js`](bootstrap-and-lifecycle.template.js) — Ordered source fragment for Bootstrap And Lifecycle.
- [`composer-and-overview.template.js`](composer-and-overview.template.js) — Ordered source fragment for Composer And Overview.
- [`dialogs-and-detail-view.template.js`](dialogs-and-detail-view.template.js) — Ordered source fragment for Dialogs And Detail View.
- [`mutations-access-and-versioning.template.js`](mutations-access-and-versioning.template.js) — Ordered source fragment for Mutations Access And Versioning.

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
