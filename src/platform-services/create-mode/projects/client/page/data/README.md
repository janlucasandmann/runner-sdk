<!-- platform-directory-guide:v1 -->

# Data

## Purpose

This directory contains data loading, normalization, and projection for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-project-and-attachment-data.mjs`](01-project-and-attachment-data.mjs) — Focused implementation of 01 Project And Attachment Data.
- [`02-editor-and-file-data.mjs`](02-editor-and-file-data.mjs) — Focused implementation of 02 Editor And File Data.
- [`03-project-persistence.mjs`](03-project-persistence.mjs) — Focused implementation of 03 Project Persistence.
- [`04-task-overlay-lifecycle.mjs`](04-task-overlay-lifecycle.mjs) — Focused implementation of 04 Task Overlay Lifecycle.

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
