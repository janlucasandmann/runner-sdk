<!-- platform-directory-guide:v1 -->

# Evidence Agents client API

## Purpose

This directory is the sole browser transport boundary for Evidence Agents. The
repository discovers Equal Care function resources through the central server
inventory and calls only `/api/real/evidence-agents/*`. Authentication,
organization scope, resource access, roles, and evidence permissions are
enforced upstream.

## Contents

- [`evidence-agents-repository.ts`](evidence-agents-repository.ts) — Typed
  service discovery, overview, queue, detail, approval, and rejection calls.
- [`evidence-agents-repository.test.ts`](evidence-agents-repository.test.ts) —
  Endpoint mapping and decision-payload coverage.
- [`index.ts`](index.ts) — Public API barrel.

## Working in this directory

Do not call a deployed function or logical database directly. Keep reviewer
identity out of client payloads and extend the cloud OpenAPI contract whenever
the repository surface changes.

## Verification

```bash
npm run evidence-agents-service-test
npx tsc -p tsconfig.build.json --noEmit
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
