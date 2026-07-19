<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Teams service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Teams service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`members.mjs`](members.mjs) — Focused implementation of Members.
- [`overview.mjs`](overview.mjs) — Focused implementation of Overview.
- [`resources-foundation.mjs`](resources-foundation.mjs) — Focused implementation of Resources Foundation.
- [`resources-view.mjs`](resources-view.mjs) — Presentation composition for Resources View.
- [`roles-and-view.mjs`](roles-and-view.mjs) — Presentation composition for Roles And View.
- [`setup.mjs`](setup.mjs) — Initialization for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run teams-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
