<!-- platform-directory-guide:v1 -->

# Evidence Agents pages

## Purpose

This directory owns the Evidence Agents overview and focused review screen. The
workspace uses centralized page hero, feature-card, data-table, empty-state,
loading-state, label, selector, button, and UI-card components.

## Contents

- [`evidence-agents-workspace-page.tsx`](evidence-agents-workspace-page.tsx) —
  Queue, source-visible review detail, and decision actions.
- [`evidence-agents.css`](evidence-agents.css) — Service-scoped
  layout that preserves the platform dark theme.
- [`index.ts`](index.ts) — Public page exports.

## Working in this directory

Keep persistence and permission decisions behind the API repository. Immutable
source evidence must remain visually distinct from editable normalized fields.
Use centralized platform components before adding any local UI primitive.

## Verification

```bash
npm run evidence-agents-service-test
npx tsc -p tsconfig.build.json --noEmit
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
