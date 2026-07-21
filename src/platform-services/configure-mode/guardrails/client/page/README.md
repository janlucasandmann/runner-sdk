<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`detail/`](detail/) — Guardrail-specific composition over the centralized resource detail page.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`controller.mjs`](controller.mjs) — Interaction orchestration for Controller.
- [`access.mjs`](access.mjs) — Guardrail ownership, eligible owner discovery, team sharing, default access, and dedicated permission-page composition.
- [`evaluation.mjs`](evaluation.mjs) — Evaluation-set selection, run orchestration, and guardrail-scoped run history.
- [`editor.mjs`](editor.mjs) — Focused implementation of Editor.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`table.mjs`](table.mjs) — Focused implementation of Table.
- [`version-actions.mjs`](version-actions.mjs) — Guardrail version persistence, restore, comparison, and combined save-and-publish orchestration.
- [`version-views.mjs`](version-views.mjs) — Adapters for the centralized publish selector, version history sidebar, save review dialog, and diff views.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Guardrail version UI must remain composed from the centralized versioning components in `src/platform-ui`; this directory owns only guardrail-specific state and API orchestration. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run guardrails-service-test
npx vitest run src/client-guardrail-version.test.ts src/platform-services/configure-mode/guardrails/client/page/detail/guardrail-detail-page.test.tsx
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
