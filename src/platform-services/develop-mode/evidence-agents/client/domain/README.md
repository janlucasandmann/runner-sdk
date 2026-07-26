<!-- platform-directory-guide:v1 -->

# Evidence Agents client domain

## Purpose

This directory owns stable TypeScript DTOs for service discovery, review
summaries, task details, provenance spans, candidate edits, and decision
results. These are browser transport contracts; Equal Care owns the canonical
scientific schemas.

## Contents

- [`evidence-types.ts`](evidence-types.ts) — Evidence service and human-review
  response/request types.
- [`index.ts`](index.ts) — Public domain barrel.

## Working in this directory

Keep these types free of React and HTTP behavior. Match the dedicated cloud API
and function response contracts, but do not duplicate canonical validation
logic or weaken fields into unbounded maps.

## Verification

```bash
npm run evidence-agents-service-test
npx tsc -p tsconfig.build.json --noEmit
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
