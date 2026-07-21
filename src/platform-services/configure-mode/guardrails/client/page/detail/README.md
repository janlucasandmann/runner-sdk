<!-- platform-directory-guide:v1 -->

# Guardrail Detail Page

## Purpose

This directory owns the Guardrails service adapter for the centralized
`ResourceDetailPage`. It composes guardrail-specific content and sidebar cards
without duplicating the shared detail-page layout.

## Contents

- [`index.ts`](index.ts) — Public entry point for the guardrail detail adapter.
- [`guardrail-detail-page.tsx`](guardrail-detail-page.tsx) — Guardrail composition for the centralized detail page and sidebar cards.
- [`guardrail-detail-page.test.tsx`](guardrail-detail-page.test.tsx) — Focused composition coverage.

## Working in this directory

Keep guardrail-specific presentation in this directory and compose shared page,
card, and editor primitives from `src/platform-ui`. Do not duplicate generic
detail-page layout here. Keep the legacy runtime adapter limited to translating
guardrail state and actions into this component's props.

## Verification

Run the focused component and service checks from the repository root:

```bash
npx vitest run src/platform-services/configure-mode/guardrails/client/page/detail/guardrail-detail-page.test.tsx
npm run guardrails-service-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
