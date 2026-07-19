<!-- platform-directory-guide:v1 -->

# Client Shell

## Purpose

This directory contains application-shell state, lifecycle, and navigation integration for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`lifecycle.mjs`](lifecycle.mjs) — Focused implementation of Lifecycle.
- [`menu-state.mjs`](menu-state.mjs) — State and projection logic for Menu State.
- [`mode-switch.mjs`](mode-switch.mjs) — Focused implementation of Mode Switch.
- [`origin-threads.mjs`](origin-threads.mjs) — Focused implementation of Origin Threads.
- [`run-action-menu.mjs`](run-action-menu.mjs) — Focused implementation of Run Action Menu.
- [`run-actions.mjs`](run-actions.mjs) — Focused implementation of Run Actions.
- [`run-controller.mjs`](run-controller.mjs) — Interaction orchestration for Run Controller.
- [`run-menu-controls.mjs`](run-menu-controls.mjs) — Focused implementation of Run Menu Controls.
- [`run-trace-view.mjs`](run-trace-view.mjs) — Presentation composition for Run Trace View.
- [`sidebar-entry.mjs`](sidebar-entry.mjs) — Focused implementation of Sidebar Entry.
- [`sidebar-state.mjs`](sidebar-state.mjs) — State and projection logic for Sidebar State.
- [`state.mjs`](state.mjs) — State ownership for this layer.
- [`team-sharing.mjs`](team-sharing.mjs) — Focused implementation of Team Sharing.
- [`top-nav-actions.mjs`](top-nav-actions.mjs) — Focused implementation of Top Nav Actions.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run metronome-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
