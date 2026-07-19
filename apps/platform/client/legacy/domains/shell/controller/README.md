<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains remaining legacy browser interaction controllers and effect orchestration for Shell. Migrate behavior toward its typed owner without creating another application runtime.

## Contents

- [`application-lifecycle-and-history.template.js`](application-lifecycle-and-history.template.js) — Ordered source fragment for Application Lifecycle And History.
- [`bootstrap-account-and-connectors.template.js`](bootstrap-account-and-connectors.template.js) — Ordered source fragment for Bootstrap Account And Connectors.
- [`composition-and-modals.template.js`](composition-and-modals.template.js) — Ordered source fragment for Composition And Modals.
- [`data-lifecycle-and-navigation.template.js`](data-lifecycle-and-navigation.template.js) — Ordered source fragment for Data Lifecycle And Navigation.
- [`settings-tools-and-rendering.template.js`](settings-tools-and-rendering.template.js) — Ordered source fragment for Settings Tools And Rendering.

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
