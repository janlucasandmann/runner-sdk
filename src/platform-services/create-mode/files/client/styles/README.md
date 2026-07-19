<!-- platform-directory-guide:v1 -->

# Client Styles

## Purpose

This directory contains ordered, owner-scoped style modules for the Files service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`chat.mjs`](chat.mjs) — Focused implementation of Chat.
- [`content.mjs`](content.mjs) — Focused implementation of Content.
- [`context-menu.mjs`](context-menu.mjs) — Focused implementation of Context Menu.
- [`editor.mjs`](editor.mjs) — Focused implementation of Editor.
- [`foundation.mjs`](foundation.mjs) — Focused implementation of Foundation.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`preview.mjs`](preview.mjs) — Focused implementation of Preview.
- [`responsive.mjs`](responsive.mjs) — Focused implementation of Responsive.
- [`toolbar.mjs`](toolbar.mjs) — Focused implementation of Toolbar.

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
