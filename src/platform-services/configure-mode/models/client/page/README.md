<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Models service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`catalog.mjs`](catalog.mjs) — Focused implementation of Catalog.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`model-details-modal.test.tsx`](model-details-modal.test.tsx) — Regression coverage for Model Details Modal.
- [`model-details-modal.tsx`](model-details-modal.tsx) — State and projection logic for Model Details Modal.
- [`models-overview-page.test.tsx`](models-overview-page.test.tsx) — Regression coverage for Models Overview Page.
- [`models-overview-page.tsx`](models-overview-page.tsx) — Presentation composition for Models Overview Page.
- [`models-overview-presentation.tsx`](models-overview-presentation.tsx) — Focused implementation of Models Overview Presentation.
- [`presentation.mjs`](presentation.mjs) — Focused implementation of Presentation.
- [`query.mjs`](query.mjs) — Focused implementation of Query.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run models-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
