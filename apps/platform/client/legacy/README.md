<!-- platform-directory-guide:v1 -->

# Legacy browser composition

## Purpose

This directory contains the remaining fragment-based browser composition for the single platform document. It is compatibility debt, not a second application.

## Contents

- [`domains/`](domains/) — This directory separates the remaining legacy browser program by product domain so each fragment can be migrated to its typed owner independently.
- [`templates/`](templates/) — This directory contains static templates used by the owning renderer within Legacy. Follow the parent directory's ownership boundary.
- [`create-legacy-platform-application.mjs`](create-legacy-platform-application.mjs) — Focused implementation of Create Legacy Platform Application.
- [`create-legacy-platform-sources.mjs`](create-legacy-platform-sources.mjs) — Focused implementation of Create Legacy Platform Sources.
- [`environment-changes.mjs`](environment-changes.mjs) — Focused implementation of Environment Changes.
- [`platform-sources.test.mjs`](platform-sources.test.mjs) — Regression coverage for Platform Sources.
- [`platform-ui-primitives.mjs`](platform-ui-primitives.mjs) — Focused implementation of Platform UI Primitives.
- [`source-template.mjs`](source-template.mjs) — Focused implementation of Source Template.
- [`source-template.test.mjs`](source-template.test.mjs) — Regression coverage for Source Template.
- [`version-sidebar.mjs`](version-sidebar.mjs) — Focused implementation of Version Sidebar.
- [`versioning-core.mjs`](versioning-core.mjs) — Focused implementation of Versioning Core.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
