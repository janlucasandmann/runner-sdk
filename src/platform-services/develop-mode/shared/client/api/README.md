<!-- platform-directory-guide:v1 -->

# API

## Purpose

This directory contains typed transport and endpoint adapters for the Shared service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`develop-resource-client.test.ts`](develop-resource-client.test.ts) — Regression coverage for Develop Resource Client.
- [`develop-resource-client.ts`](develop-resource-client.ts) — Boundary adapter for Develop Resource Client.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`use-develop-resource-repository.ts`](use-develop-resource-repository.ts) — React controller for Develop Resource Repository.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
