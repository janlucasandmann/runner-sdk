<!-- platform-directory-guide:v1 -->

# Batches styles

## Purpose

This directory owns the small set of Batches-specific layout styles that are
not already provided by centralized platform components.

## Contents

- [`page.mjs`](page.mjs) — Composer fields, error placement, and local motion.
- [`index.mjs`](index.mjs) — Ordered CSS export consumed by platform composition.

## Working in this directory

Keep selectors scoped to Batches and prefer shared component tokens. Do not
fork centralized table, card, button, modal, or detail-page styling. Any new CSS
must remain valid in the platform's dark theme and compatibility template.

## Verification

Run from the platform repository root:

```bash
npm run batches-service-test
npm run platform-component-invariants
```

## Related documentation

- [Batches client](../README.md)
- [Batches service](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
