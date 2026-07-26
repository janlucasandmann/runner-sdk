<!-- platform-directory-guide:v1 -->

# Actions

## Purpose

This directory contains user and system actions that mutate or navigate the owning feature for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-draft-and-task-actions.mjs`](01-draft-and-task-actions.mjs) — Focused implementation of 01 Draft And Task Actions.
- [`02-autosave-and-project-actions.mjs`](02-autosave-and-project-actions.mjs) — Focused implementation of 02 Autosave And Project Actions.
- [`03-teams-and-mission-control.mjs`](03-teams-and-mission-control.mjs) — Focused implementation of 03 Teams And Mission Control.
- [`04-task-lifecycle.mjs`](04-task-lifecycle.mjs) — Task execution, thread, review, and lifecycle actions.
- [`05-reviews-and-full-auto.mjs`](05-reviews-and-full-auto.mjs) — Focused implementation of 05 Reviews And Full Auto.

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
