<!-- platform-directory-guide:v1 -->

# Analytics

## Purpose

This directory contains analytics loading, normalization, and presentation for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`api-keys-overview-analytics-client.test.ts`](api-keys-overview-analytics-client.test.ts) — Regression coverage for API Keys Overview Analytics Client.
- [`api-keys-overview-analytics-client.ts`](api-keys-overview-analytics-client.ts) — Boundary adapter for API Keys Overview Analytics Client.
- [`api-keys-overview-analytics.test.ts`](api-keys-overview-analytics.test.ts) — Regression coverage for API Keys Overview Analytics.
- [`api-keys-overview-analytics.ts`](api-keys-overview-analytics.ts) — Focused implementation of API Keys Overview Analytics.
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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
