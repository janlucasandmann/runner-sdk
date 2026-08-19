<!-- platform-directory-guide:v1 -->

# Batches shell integration

## Purpose

This directory owns the narrow presentation bridge between the Batches
workspace and the shared platform shell. It does not own Batch data or
scheduler behavior.

## Contents

- [`state.mjs`](state.mjs) — Selected-job app-header state.
- [`top-navigation.mjs`](top-navigation.mjs) — Overview and detail breadcrumb
  composition, including the overview scope and action portal slots.
- [`index.mjs`](index.mjs) — Public fragment boundary consumed by the legacy
  platform composer.

## Working in this directory

Keep Batch selection inside `BatchesWorkspacePage`; pass only the minimum
identity and back-navigation callback into the shell. New data loading,
mutations, or job-domain rules belong in the Batches client or backend, not in
these source fragments.

## Verification

From the platform repository root:

```bash
npm run batches-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Batches service](../../README.md)
- [Platform app header](../../../../../platform-shell/app-header/README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
