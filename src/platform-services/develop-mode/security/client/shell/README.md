<!-- platform-directory-guide:v1 -->

# Repository Security client shell

## Purpose

This directory owns the small compatibility-source fragments that place the
typed security workspace in the legacy platform application. The fragments add
the Develop sidebar entry, navigation and history behavior, header portal, page
renderer, title, and GitHub setup return lifecycle.

## Contents

- [`index.mjs`](index.mjs) — Frozen fragment contract consumed by the shell
  composer.
- `navigation.mjs`, `history-restore.mjs`, and `selected-title.mjs` — Page state
  integration.
- `sidebar-entry.mjs` and `top-navigation.mjs` — Develop navigation surfaces.
- `page-view.mjs` — Typed React page bridge.
- `setup-return-lifecycle.mjs` — GitHub App callback restoration.

## Working in this directory

Keep fragments syntactically valid inside the host function and free of domain
data fetching. Change the source composer and shell contract test whenever a
fragment key is added or reordered.

## Verification

```bash
npm run security-service-test
npm run platform:legacy-source-test
```

## Related documentation

- [Client guide](../README.md)
- [Legacy shell guide](../../../../../../apps/platform/client/legacy/domains/shell/README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)

