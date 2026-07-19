<!-- platform-directory-guide:v1 -->

# Views

## Purpose

This directory contains focused view renderers for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-project-and-backlog-views.mjs`](01-project-and-backlog-views.mjs) — Focused implementation of 01 Project And Backlog Views.
- [`02-project-details-and-calendar.mjs`](02-project-details-and-calendar.mjs) — Focused implementation of 02 Project Details And Calendar.
- [`03-overview-and-task-previews.mjs`](03-overview-and-task-previews.mjs) — Focused implementation of 03 Overview And Task Previews.
- [`04-task-detail-and-modals.mjs`](04-task-detail-and-modals.mjs) — Focused implementation of 04 Task Detail And Modals.

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
