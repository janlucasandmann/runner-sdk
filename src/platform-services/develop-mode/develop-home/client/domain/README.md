<!-- platform-directory-guide:v1 -->

# Client Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Develop Home service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`develop-home-overview-model.test.ts`](develop-home-overview-model.test.ts) — Regression coverage for Develop Home Overview Model.
- [`develop-home-overview-model.ts`](develop-home-overview-model.ts) — State and projection logic for Develop Home Overview Model.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run develop-home-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
