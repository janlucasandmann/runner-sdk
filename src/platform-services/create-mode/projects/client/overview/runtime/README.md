<!-- platform-directory-guide:v1 -->

# Overview Runtime

## Purpose

This directory contains stateful runtime orchestration for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`activity-and-analytics.mjs`](activity-and-analytics.mjs) — Focused implementation of Activity And Analytics.
- [`files-and-activity.mjs`](files-and-activity.mjs) — Focused implementation of Files And Activity.
- [`metrics-files-and-foundation.mjs`](metrics-files-and-foundation.mjs) — Focused implementation of Metrics Files And Foundation.
- [`resources-and-creators.mjs`](resources-and-creators.mjs) — Focused implementation of Resources And Creators.
- [`sidebar-and-composition.mjs`](sidebar-and-composition.mjs) — Focused implementation of Sidebar And Composition.

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
