<!-- platform-directory-guide:v1 -->

# Page Shell

## Purpose

This directory contains application-shell state, lifecycle, and navigation integration for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-state-and-loading.mjs`](01-state-and-loading.mjs) — State and projection logic for 01 State And Loading.
- [`02-editor-and-project-state.mjs`](02-editor-and-project-state.mjs) — State and projection logic for 02 Editor And Project State.
- [`03-derived-task-state.mjs`](03-derived-task-state.mjs) — Derived task state plus durable attachment URL projection and inline-image reconciliation.
- [`04-release-state-and-navigation.mjs`](04-release-state-and-navigation.mjs) — State and projection logic for 04 Release State And Navigation.

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
