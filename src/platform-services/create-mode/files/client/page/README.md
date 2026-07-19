<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Files service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`browser-view.mjs`](browser-view.mjs) — Presentation composition for Browser View.
- [`dialogs.mjs`](dialogs.mjs) — Focused implementation of Dialogs.
- [`entry-views.mjs`](entry-views.mjs) — Focused implementation of Entry Views.
- [`filesystem-actions.mjs`](filesystem-actions.mjs) — Focused implementation of Filesystem Actions.
- [`image-overlays.mjs`](image-overlays.mjs) — Focused implementation of Image Overlays.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`preview-actions.mjs`](preview-actions.mjs) — Focused implementation of Preview Actions.
- [`sharing-actions.mjs`](sharing-actions.mjs) — Focused implementation of Sharing Actions.
- [`shell.mjs`](shell.mjs) — Focused implementation of Shell.
- [`workspace.mjs`](workspace.mjs) — Focused implementation of Workspace.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run files-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
