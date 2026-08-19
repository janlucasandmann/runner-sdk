<!-- platform-directory-guide:v1 -->

# Batches client

## Purpose

This directory owns the browser-side public contract for the Create-mode
Batches service. It translates the BFF response into typed page state and does
not own queue persistence or native workload execution.

## Contents

- [`batches-api.ts`](batches-api.ts) — Typed BFF requests and pagination.
- [`batches-types.ts`](batches-types.ts) — Browser-facing Batch contracts.
- [`page/`](page/) — Overview, shared definition modal, and workspace state.
- [`styles/`](styles/) — Owner-scoped style composition.
- [`index.ts`](index.ts) — Public client barrel.

## Working in this directory

Call only the Batches BFF and keep API paths out of page components. Preserve
the one-shot composer event/storage contract used by producer services. Shared
presentation belongs in `src/platform-ui`; Batches-specific orchestration state
belongs in the workspace page. Treat `stay_on_shelf` as a manual policy: the
backend returns it to the held queue after success, and the client must never
interpret it as capacity-triggered work.

## Verification

Run from the platform repository root:

```bash
npm run batches-service-test
npm run build
```

## Related documentation

- [Batches service](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
