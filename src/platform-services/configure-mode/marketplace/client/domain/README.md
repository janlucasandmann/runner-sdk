<!-- platform-directory-guide:v1 -->

# Client Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Marketplace service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`catalog-runtime.mjs`](catalog-runtime.mjs) — Focused implementation of Catalog Runtime.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`preview-database.mjs`](preview-database.mjs) — Focused implementation of Preview Database.
- [`preview-metadata.mjs`](preview-metadata.mjs) — Focused implementation of Preview Metadata.
- [`preview-resources.mjs`](preview-resources.mjs) — Focused implementation of Preview Resources.
- [`preview-server-files.mjs`](preview-server-files.mjs) — Focused implementation of Preview Server Files.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run marketplace-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
