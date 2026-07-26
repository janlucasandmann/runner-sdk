<!-- platform-directory-guide:v1 -->

# Evidence Agents shell integration

## Purpose

These compatibility fragments integrate Evidence Agents with the current
application shell. They add the sidebar link under Agent Services, restore
browser-history navigation, render app-header breadcrumbs, and mount the typed
React workspace.

## Contents

- [`sidebar-entry.mjs`](sidebar-entry.mjs), [`navigation.mjs`](navigation.mjs),
  [`history-restore.mjs`](history-restore.mjs),
  [`selected-title.mjs`](selected-title.mjs),
  [`top-navigation.mjs`](top-navigation.mjs), and
  [`page-view.mjs`](page-view.mjs) — Individual shell composition fragments.
- [`index.mjs`](index.mjs) — Public fragment exports.

## Working in this directory

Keep fragments declarative and narrowly scoped to shell integration. Product
logic belongs in the typed client. Update the service boundary test whenever a
new fragment is introduced.

## Verification

```bash
npm run evidence-agents-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
