<!-- platform-directory-guide:v1 -->

# Client Shell

## Purpose

This directory contains application-shell state, lifecycle, and navigation integration for the Organizations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`billing-state.mjs`](billing-state.mjs) — State and projection logic for Billing State.
- [`history-capture.mjs`](history-capture.mjs) — Focused implementation of History Capture.
- [`history-restore.mjs`](history-restore.mjs) — Focused implementation of History Restore.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`load-lifecycle.mjs`](load-lifecycle.mjs) — Focused implementation of Load Lifecycle.
- [`navigation.mjs`](navigation.mjs) — Focused implementation of Navigation.
- [`request-scope.mjs`](request-scope.mjs) — Focused implementation of Request Scope.
- [`role-lifecycle.mjs`](role-lifecycle.mjs) — Focused implementation of Role Lifecycle.
- [`selected-title.mjs`](selected-title.mjs) — Focused implementation of Selected Title.
- [`sidebar-entry.mjs`](sidebar-entry.mjs) — Focused implementation of Sidebar Entry.
- [`state-dialogs.mjs`](state-dialogs.mjs) — State and projection logic for State Dialogs.
- [`state-primary.mjs`](state-primary.mjs) — State and projection logic for State Primary.
- [`table-lifecycle.mjs`](table-lifecycle.mjs) — Focused implementation of Table Lifecycle.
- [`top-navigation.mjs`](top-navigation.mjs) — Focused implementation of Top Navigation.
- [`workspace-lifecycle.mjs`](workspace-lifecycle.mjs) — Focused implementation of Workspace Lifecycle.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run organizations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
