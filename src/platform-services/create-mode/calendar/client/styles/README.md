<!-- platform-directory-guide:v1 -->

# Client Styles

## Purpose

This directory contains ordered, owner-scoped style modules for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`legacy-grid.mjs`](legacy-grid.mjs) — Focused implementation of Legacy Grid.
- [`scheduler.mjs`](scheduler.mjs) — Focused implementation of Scheduler.
- [`standalone-context.mjs`](standalone-context.mjs) — Focused implementation of Standalone Context.
- [`standalone-surface.mjs`](standalone-surface.mjs) — Focused implementation of Standalone Surface.
- [`toolbar-actions.mjs`](toolbar-actions.mjs) — Focused implementation of Toolbar Actions.
- [`toolbar-layout.mjs`](toolbar-layout.mjs) — Focused implementation of Toolbar Layout.
- [`toolbar-main.mjs`](toolbar-main.mjs) — Focused implementation of Toolbar Main.
- [`upgrade.mjs`](upgrade.mjs) — Focused implementation of Upgrade.
- [`welcome-widget.mjs`](welcome-widget.mjs) — Focused implementation of Welcome Widget.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run calendar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
