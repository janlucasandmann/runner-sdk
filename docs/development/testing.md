# Testing and quality gates

## Complete gate

`npm run check` is the local equivalent of CI. It runs, in order:

1. both TypeScript typechecks, the ratcheted Biome lint scope, and formatting
   checks;
2. all Vitest unit/component tests;
3. all discovered Node contract and service tests;
4. the production library build and Vite client build;
5. architecture budgets and production-artifact verification.

The production build uses `tsconfig.build.json`, which excludes test sources.
`check:artifacts` then verifies that no tests leaked into `dist` and every
declared package export resolves.

## Focused commands

```bash
npm run check:static
npm run test:unit
npm run test:contracts
npm run build
npm run platform:client:build
npm run platform:architecture-test
```

Node contract discovery includes `*.test.mjs` and `*-service-test.mjs` beneath
`apps` and `src`. The architecture suite is intentionally separate because it
inspects production build output.

## Compatibility fixtures

Several legacy browser-source tests compare a reviewed SHA-256 fixture with the
assembled runtime. A mismatch means source changed; it does not mean the test
should automatically be updated. Inspect the assembled diff, confirm browser
syntax and behavior, then update the fixture in the owning change.

## Formatting ratchet

Biome formatting is initially enforced for repository quality tooling and root
configuration. Linting covers the typed application/runtime seams and the full
decomposed `src/react/runner-chat/` leaf-module tree. The oversized
compatibility composition root remains protected by architecture budgets while
its extracted modules satisfy the normal lint gate. Expand these scopes as
legacy or oversized files are migrated; do not mass-format active
compatibility/UI files during parallel development.

## Adding tests

- Pure domain behavior: colocated `*.test.ts`.
- React behavior: colocated `*.test.tsx` with Testing Library.
- Server or source-composition contracts: `*.test.mjs`.
- Service-wide compatibility contracts: `*-service-test.mjs`.
- Ownership, import direction, and size budgets:
  `apps/platform/testing/platform-architecture.test.mjs`.
