<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains remaining legacy browser interaction controllers and effect orchestration for Compute Resources. Migrate behavior toward its typed owner without creating another application runtime.

## Contents

- [`bootstrap-and-effects.js`](bootstrap-and-effects.js) — Focused implementation of Bootstrap And Effects.
- [`computer-detail-view.js`](computer-detail-view.js) — Presentation composition for Computer Detail View.
- [`database-detail-view.js`](database-detail-view.js) — Presentation composition for Database Detail View.
- [`environment-versioning.js`](environment-versioning.js) — Focused implementation of Environment Versioning.
- [`mutations-and-data.js`](mutations-and-data.js) — Focused implementation of Mutations And Data.
- [`overview-and-composition.js`](overview-and-composition.js) — Focused implementation of Overview And Composition.
- [`resource-home-view.js`](resource-home-view.js) — Presentation composition for Resource Home View.
- [`routing-access-and-connections.js`](routing-access-and-connections.js) — Focused implementation of Routing Access And Connections.
- [`server-detail-view.js`](server-detail-view.js) — Presentation composition for Server Detail View.
- [`server-versioning-and-composers.js`](server-versioning-and-composers.js) — Focused implementation of Server Versioning And Composers.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:legacy-syntax-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
