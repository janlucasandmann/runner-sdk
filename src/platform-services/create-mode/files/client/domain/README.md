<!-- platform-directory-guide:v1 -->

# Client Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Files service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`filename.mjs`](filename.mjs) — Focused implementation of Filename.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`inventory.mjs`](inventory.mjs) — Focused implementation of Inventory.
- [`list-url.mjs`](list-url.mjs) — Focused implementation of List URL.
- [`preview.mjs`](preview.mjs) — Focused implementation of Preview.
- [`transfer.mjs`](transfer.mjs) — Focused implementation of Transfer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run files-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
