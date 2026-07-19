<!-- platform-directory-guide:v1 -->

# Management

## Purpose

This directory contains mutation and lifecycle orchestration for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`api-key-management-dialogs.test.tsx`](api-key-management-dialogs.test.tsx) — Regression coverage for API Key Management Dialogs.
- [`api-key-management-dialogs.tsx`](api-key-management-dialogs.tsx) — Focused implementation of API Key Management Dialogs.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`use-api-key-management.test.ts`](use-api-key-management.test.ts) — Regression coverage for Use API Key Management.
- [`use-api-key-management.ts`](use-api-key-management.ts) — React controller for API Key Management.

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
