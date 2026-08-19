<!-- platform-directory-guide:v1 -->

# Batches pages

## Purpose

This directory owns the Batches overview, shared create/edit/view modal, and
their browser lifecycle. The overview deliberately projects Batch rows into the
centralized Skills overview structure.

## Contents

- [`batches-workspace-page.tsx`](batches-workspace-page.tsx) — Loading, polling,
  navigation, mutations, and composer lifecycle.
- [`batches-overview-page.tsx`](batches-overview-page.tsx) — Skills-aligned queue
  overview with independent expandable one-shot shelf, repeatable shelf, and
  capacity-policy sections, filtering, actions, and persisted handle-based row
  ordering. Successfully completed one-shot jobs are omitted from this active
  queue projection.
- [`batch-create-modal.tsx`](batch-create-modal.tsx) — Shared shelf/queue
  composer used for creation, editing held jobs, read-only inspection of jobs
  that have entered execution, and producer-service handoffs. Existing manual
  jobs expose secondary `Save Changes` and primary `Start Job` actions. Starting
  always persists the current modal draft first and releases only the returned
  saved job, so execution cannot race stale inputs.

## Working in this directory

Use centralized page and UI components; do not reproduce tables, empty states,
buttons, selectors, or loading indicators locally. Project persisted
definitions into the shared modal without exposing storage JSON.
Only reorder jobs inside the same owner, organization, start-policy, lane, and
priority partition. The backend enforces the same boundary.

## Verification

Run from the platform repository root:

```bash
npm run batches-service-test
npm run platform-resource-overview-test
```

## Related documentation

- [Batches client](../README.md)
- [Batches service](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
