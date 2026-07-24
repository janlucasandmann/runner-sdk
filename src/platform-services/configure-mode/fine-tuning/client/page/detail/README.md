<!-- platform-directory-guide:v1 -->

# Detail

## Purpose

This directory owns the centralized fine-tuning detail-page shell, tab contract, sidebar composition, and focused component tests. Domain behavior and persistence remain in the parent controller and domain modules.

## Contents

- [`fine-tuning-detail-page.tsx`](fine-tuning-detail-page.tsx) — Composes fine-tuning detail tabs, content, and sidebar cards through `ResourceDetailPage`.
- [`fine-tuning-detail-page.test.tsx`](fine-tuning-detail-page.test.tsx) — Protects the shared detail-page composition and tab contract.
- [`index.ts`](index.ts) — Public entry point for the detail page.

## Working in this directory

Keep this layer presentation-focused. Put reusable UI in `src/platform-ui`, fine-tuning interactions in the parent controller directory, and persisted data normalization in the parent domain directory.

## Verification

Run the focused checks from the repository root:

```bash
npm run fine-tuning-service-test
npx vitest run src/platform-services/configure-mode/fine-tuning/client/page/detail
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
