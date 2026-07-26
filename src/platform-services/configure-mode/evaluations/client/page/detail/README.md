<!-- platform-directory-guide:v1 -->

# Evaluation Detail Page

## Purpose

This directory owns the Evaluations service adapter for the centralized
resource-detail layout. It renders evaluation configuration and run evidence
without moving evaluation execution or persistence into the presentation layer.

## Contents

- [`evaluation-detail-page.tsx`](evaluation-detail-page.tsx) — Composes the
  evaluation tabs, statistical evidence, and sidebar content.
- [`evaluation-detail-page.test.tsx`](evaluation-detail-page.test.tsx) —
  Focused regression coverage for the detail-page contract.
- [`index.ts`](index.ts) — Public entry point for the detail-page adapter.

## Working in this directory

Keep this layer presentation-focused. Put reusable components in
`src/platform-ui`, evaluation interactions in the parent controller directory,
and evaluation contracts, comparisons, and persistence in the server domain.
Preserve explicit UI states for incomplete, failed, and statistically
insufficient runs rather than converting them into scores.

The Execution evidence card is the canonical provenance projection for a run.
It must use centralized UI cards and display trust level, release eligibility,
evidence/attestation/target fingerprints, and KMS signature state without
claiming browser-side cryptographic verification.

## Verification

Run the focused checks from the repository root:

```bash
npm run evaluations-service-test
npx vitest run src/platform-services/configure-mode/evaluations/client/page/detail
```

## Related documentation

- [Evaluation service guide](../../../README.md)
- [Statistical methodology](../../../STATISTICAL_METHODOLOGY.md)
- [Security and evidence model](../../../SECURITY_AND_EVIDENCE.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
