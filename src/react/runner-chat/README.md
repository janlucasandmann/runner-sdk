# RunnerChat leaf modules

This directory contains the bounded implementation units composed by
[`../runner-chat.tsx`](../runner-chat.tsx). The parent file remains a temporary
compatibility composition root; it is not the default home for new behavior.

## Dependency direction

- Leaf modules may depend on other leaf contracts, shared Runner utilities,
  canonical thread contracts, and shared platform UI.
- Leaf modules must not import `../runner-chat.tsx` or its compiled
  `runner-chat.js` output.
- Shared platform UI must not depend on this directory except through the
  explicitly documented compatibility seams checked by
  `scripts/quality/check-import-boundaries.mjs`.
- Public compatibility types belong in `public-types.ts`; avoid re-declaring
  them in the composition root.

The architecture test enforces the reverse-import rule and a 1,000-line ceiling
for every production leaf module.

## Responsibility map

- `execution/`: run preparation, execution, and active-worker delivery.
- `hydration/`: message/log normalization, history hydration, and run
  reattachment.
- `canonical-*.ts` and `turn-*.ts`: pure timeline and presentation adapters.
- `use-*.ts`: reactive controllers whose state or lifecycle can be tested
  independently.
- `*-dialog.tsx`, `*-surface.tsx`, and `*-chip.tsx`: bounded presentation
  components.
- `public-types.ts`: compatibility API consumed by the parent export.

## Adding or changing behavior

1. Put pure transformations in a dedicated leaf module with colocated tests.
2. Put multi-effect lifecycle behavior in a hook with an explicit options and
   result contract.
3. Keep class names and callback semantics stable when extracting existing
   presentation.
4. Add the seam to the required-module list in
   `apps/platform/testing/platform-architecture.test.mjs` when it is intended
   to be permanent.
5. Lower the composition-root line budget after a meaningful extraction; do
   not raise it to accommodate new behavior.

Run:

```bash
npm run check:static
npx vitest run src/react/runner-chat
npm run platform:architecture-test
```

## Parallel work

Treat `../runner-chat.tsx` as a shared integration file. Coordinate before
editing it in parallel. Work within separate leaf modules whenever possible,
avoid repository-wide formatting during active UI work, and never update a
source-hash compatibility fixture without reviewing the assembled browser
source.
