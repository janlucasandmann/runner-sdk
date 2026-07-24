<!-- platform-directory-guide:v1 -->

# Repository Security client pages

## Purpose

This directory renders the Develop mode security overview and repository, run,
and finding detail pages. The workspace page owns loading, polling, mutations,
and URL state; leaf pages remain controlled presenters built from shared
platform tables, detail tabs, permission editors, labels, cards, and settings
sections.

The overview intentionally has no persistent lifecycle, success, or integration
banner channel. Connection and repository-management failures belong inside the
specific control that can resolve them, never in a full-width page label.

## Contents

- [`develop-security-workspace-page.tsx`](develop-security-workspace-page.tsx) —
  Page orchestration, shared plugin connection synchronization, and deep-link
  lifecycle.
- [`security-overview-page.tsx`](security-overview-page.tsx) — Shared
  two-card service introduction, centralized GitHub account selector and
  sign-out action, repository-management table with header search,
  monitored-repository preselection, and branch selectors, and the monitored
  repository overview.
- [`security-detail-layout.tsx`](security-detail-layout.tsx) — Shared detail
  viewport and resource-detail composition that deliberately reuses the Agent
  detail page's centered width, scroll gutters, grid, tabs, content, and
  sidebar sizing. Detail-route loading keeps this frame mounted and centers the
  centralized loading indicator in its content viewport.
- [`security-repository-detail-page.tsx`](security-repository-detail-page.tsx) —
  Combined Runs & findings, policy, threat model, audit, and settings
  composition. Runs & findings starts with centralized KPI cards for open and
  critical findings, completed fixes, and run activity. Its tab bar is the
  first local content element because the repository identity and actions live
  in the app header.
- [`security-repository-sidebar.tsx`](security-repository-sidebar.tsx) —
  Project-ticket-compatible Details and Safety boundary cards with the direct
  property-list and creator/owner identity treatment from Evaluation details.
  Owner uses the centralized selector, lazy-loads human members of teams with
  repository access, and permits reassignment only by the current owner.
  Policy and threat-model versions stay in their dedicated editors rather than
  duplicating them in Details. Legacy repositories resolve missing creator
  metadata against the signed-in platform identity and fall back from owner to
  creator, matching Evaluations.
- [`security-repository-version-control.tsx`](security-repository-version-control.tsx)
  — Agent-compatible breadcrumb state, local configuration draft, shared
  Run scan and publish controls, review diff, version-history drawer, comparison
  view, and unsaved-navigation guard. The publish action and its selector share
  one disabled state.
- [`security-repository-access-settings.tsx`](security-repository-access-settings.tsx)
  — Centralized minimal Manage access table plus All Agents and team-role
  permission editors. Repository access intentionally lives inside Settings,
  not in a standalone permissions tab.
- [`security-run-detail-page.tsx`](security-run-detail-page.tsx) — Immutable
  commit, stage, artifact, audit, finding, and publication detail.
- [`security-finding-detail-page.tsx`](security-finding-detail-page.tsx) —
  Evidence, occurrence, remediation, and triage detail.
- [`security.css`](security.css) — Service-scoped styles.

## Working in this directory

Never present queued work as completed analysis. External repository mutations
must stay visibly separated from advisory scan and triage actions. Promote only
domain-neutral components into shared platform UI. Successful mutations update
their controlled views without persistent confirmation banners; actionable
errors remain visible in context. Version snapshots must never include access
grants, GitHub identity, findings, or audit evidence.

## Verification

```bash
npm run security-service-test
npm run typecheck
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
