<!-- platform-directory-guide:v1 -->

# Templates

## Purpose

This directory contains static templates used by the owning renderer within Legacy. Follow the parent directory's ownership boundary.

## Contents

- [`platform-shell.template.html`](platform-shell.template.html) — Ordered source fragment for Platform Shell.
- [`platform.template.css`](platform.template.css) — Styles for Platform.
- [`platform.template.js`](platform.template.js) — Ordered source fragment for Platform.
- [`template-bindings.mjs`](template-bindings.mjs) — Focused implementation of Template Bindings.

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
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
