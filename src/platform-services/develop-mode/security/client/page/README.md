<!-- platform-directory-guide:v1 -->

# Repository Security client pages

## Purpose

This directory renders the Develop mode security overview and repository, run,
and finding detail pages. The workspace page owns loading, polling, mutations,
and URL state; leaf pages remain controlled presenters built from shared
platform tables, detail tabs, permission editors, labels, cards, and settings
sections.

## Contents

- [`develop-security-workspace-page.tsx`](develop-security-workspace-page.tsx) —
  Page orchestration and deep-link lifecycle.
- [`security-overview-page.tsx`](security-overview-page.tsx) — Repository and
  posture overview.
- [`security-repository-detail-page.tsx`](security-repository-detail-page.tsx) —
  Policy, threat model, runs, findings, audit, permissions, and settings.
- [`security-run-detail-page.tsx`](security-run-detail-page.tsx) — Immutable
  commit, stage, artifact, audit, finding, and publication detail.
- [`security-finding-detail-page.tsx`](security-finding-detail-page.tsx) —
  Evidence, occurrence, remediation, and triage detail.
- [`security.css`](security.css) — Service-scoped styles.

## Working in this directory

Never present queued work as completed analysis. External repository mutations
must stay visibly separated from advisory scan and triage actions. Promote only
domain-neutral components into shared platform UI.

## Verification

```bash
npm run security-service-test
npm run typecheck
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)

