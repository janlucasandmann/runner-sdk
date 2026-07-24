<!-- platform-directory-guide:v1 -->

# Repository Security client API

## Purpose

This directory is the sole typed browser transport boundary for repository
security. `createSecurityServiceRepository` maps user actions to authenticated
platform API calls; `useSecurityServiceRepository` obtains the centralized
`PlatformApiClient` from context.

## Contents

- [`security-repository.ts`](security-repository.ts) — Service contract and HTTP
  endpoint mapping, including repository version list/create/update/publish/
  delete operations and the shared workspace-team resource-share lifecycle
  used by repository Settings. It also exposes the centralized expanded
  team-member lookup used to populate the repository Owner selector; raw
  membership payloads are normalized in the domain layer.
- [`use-security-repository.ts`](use-security-repository.ts) — Stable React
  adapter.
- [`security-repository.test.ts`](security-repository.test.ts) — Endpoint and
  identifier-encoding coverage.
- [`index.ts`](index.ts) — Public barrel.

## Working in this directory

Do not call `fetch` directly or handle GitHub credentials here. Extend the
repository contract and backend OpenAPI description in the same change.

## Verification

```bash
npm run security-service-test
npm run typecheck
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
