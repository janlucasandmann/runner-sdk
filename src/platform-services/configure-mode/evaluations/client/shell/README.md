<!-- platform-directory-guide:v1 -->

# Client Shell

## Purpose

This directory contains application-shell state, lifecycle, and navigation integration for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`history-capture.mjs`](history-capture.mjs) — Focused implementation of History Capture.
- [`history-restore.mjs`](history-restore.mjs) — Focused implementation of History Restore.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`lifecycle.mjs`](lifecycle.mjs) — Focused implementation of Lifecycle.
- [`navigation.mjs`](navigation.mjs) — Focused implementation of Navigation.
- [`page-view.mjs`](page-view.mjs) — Presentation composition for Page View.
- [`sidebar-entry.mjs`](sidebar-entry.mjs) — Focused implementation of Sidebar Entry.
- [`state.mjs`](state.mjs) — State ownership for this layer.
- [`top-navigation.mjs`](top-navigation.mjs) — Focused implementation of Top Navigation.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run evaluations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
