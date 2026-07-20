<!-- platform-directory-guide:v1 -->

# Domain Runtime

## Purpose

This directory contains domain runtime behavior for the owning feature for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-project-and-task-model.mjs`](01-project-and-task-model.mjs) — State and projection logic for 01 Project And Task Model.
- [`02-task-data-and-calendar.mjs`](02-task-data-and-calendar.mjs) — Focused implementation of 02 Task Data And Calendar.
- [`03-thread-status.mjs`](03-thread-status.mjs) — Authoritative ticket-thread status normalization and record reconciliation.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
