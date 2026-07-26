<!-- platform-directory-guide:v1 -->

# Evidence Agents client

## Purpose

This directory composes the Evidence Agents review queue and review-detail
experience. It never calls a deployed function directly and never writes
canonical evidence records.

## Contents

- [`api/`](api/) — Typed platform API repository and React adapter.
- [`domain/`](domain/) — Review, provenance, and decision DTOs.
- [`page/`](page/) — Overview and source-visible review UI.
- [`shell/`](shell/) — Develop Mode navigation and breadcrumb fragments.
- [`index.ts`](index.ts) and [`index.mjs`](index.mjs) — Public entry points.

## Working in this directory

Keep HTTP mapping in `api`, stable transport-independent types in `domain`,
React effects and composition in `page`, and legacy host compatibility in
`shell`. Consumers outside this service should import its parent entry point.

## Verification

```bash
npm run evidence-agents-service-test
npx tsc -p tsconfig.build.json --noEmit
```

## Related documentation

- [Service guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
