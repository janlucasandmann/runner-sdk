<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the API Keys service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`api-keys-overview-page.test.tsx`](api-keys-overview-page.test.tsx) — Regression coverage for API Keys Overview Page.
- [`api-keys-overview-page.tsx`](api-keys-overview-page.tsx) — Presentation composition for API Keys Overview Page.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`legacy-card.mjs`](legacy-card.mjs) — Focused implementation of Legacy Card.
- [`legacy-settings-case.mjs`](legacy-settings-case.mjs) — Focused implementation of Legacy Settings Case.
- [`management.mjs`](management.mjs) — Focused implementation of Management.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run api-keys-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
