<!-- platform-directory-guide:v1 -->

# Core

## Purpose

This directory contains core behavior for the owning feature for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-page-and-navigation.mjs`](01-page-and-navigation.mjs) — Presentation composition for 01 Page And Navigation.
- [`02-task-and-editor.mjs`](02-task-and-editor.mjs) — Focused implementation of 02 Task And Editor.
- [`03-dialogs-and-mission-control.mjs`](03-dialogs-and-mission-control.mjs) — Focused implementation of 03 Dialogs And Mission Control.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run projects-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
