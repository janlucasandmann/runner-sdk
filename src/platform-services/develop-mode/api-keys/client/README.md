<!-- platform-directory-guide:v1 -->

# API Keys Client

## Purpose

This directory contains browser-side public composition and integration for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`analytics/`](analytics/) — This directory contains analytics loading, normalization, and presentation for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`api/`](api/) — This directory contains typed transport and endpoint adapters for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`management/`](management/) — This directory contains mutation and lifecycle orchestration for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page/`](page/) — This directory contains page composition and page-local interaction behavior for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`runtime/`](runtime/) — This directory contains stateful runtime orchestration for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`shell/`](shell/) — This directory contains application-shell state, lifecycle, and navigation integration for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`styles/`](styles/) — This directory contains ordered, owner-scoped style modules for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run api-keys-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
