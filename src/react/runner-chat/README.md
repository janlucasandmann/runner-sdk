# RunnerChat leaf modules

This directory contains the bounded implementation units composed by
[`../runner-chat.tsx`](../runner-chat.tsx). The parent file remains a temporary
compatibility composition root; it is not the default home for new behavior.

## Dependency direction

- Leaf modules may depend on other leaf contracts, shared Runner utilities,
  canonical thread contracts, and shared platform UI.
- Leaf modules must not import `../runner-chat.tsx` or its compiled
  `runner-chat.js` output.
- Shared platform UI must not depend on this directory except through the
  explicitly documented compatibility seams checked by
  `scripts/quality/check-import-boundaries.mjs`.
- Public compatibility types belong in `public-types.ts`; avoid re-declaring
  them in the composition root.

The architecture test enforces the reverse-import rule and a 1,000-line ceiling
for every production leaf module.

## Responsibility map

- `execution/`: run preparation, execution, and active-worker delivery,
  including durable checkpoint routing and composer restoration when delivery
  cannot be confirmed.
- `hydration/`: message/log normalization, history hydration, and run
  reattachment.
- `attachment-factories.ts`: deterministic workspace, implicit, connector, and
  GitHub-selection attachment construction.
- `canonical-*.ts` and `turn-*.ts`: pure timeline and presentation adapters.
- `use-*.ts`: reactive controllers whose state or lifecycle can be tested
  independently.
- `use-file-browser-navigation.ts`: file-browser modal, source, history,
  selection, and preview-navigation state.
- `use-file-browser-source-state.ts` and
  `use-file-browser-source-loaders.ts`: source-specific caches, reset
  semantics, workspace transport, connector loading, and guarded automatic
  loading. These controllers deliberately do not own dialog markup.
- `use-file-browser-attachment-controller.ts`: workspace and connector
  attachment validation, capacity enforcement, construction, GitHub
  preparation, and post-attach selection cleanup.
- `use-workspace-selection-controller.ts`: persisted computer/project
  selection, controlled-project synchronization, stale-selection repair, and
  environment ordering.
- `use-integration-selection-controller.ts`: normalized GitHub and Notion
  selections plus legacy connector-folder navigation state.
- `use-custom-skills-controller.ts`: lazy custom-skill loading and the shared
  state boundary used by execution hydration.
- `use-agent-selection-controller.ts`: controlled/default agent selection,
  reasoning synchronization, popup-mode initialization, and stable ordering.
- `use-staged-composer-commands.ts`: the atomic state machine and deterministic
  auto-stage router for mutually exclusive slash, context, backlog, and
  creation commands.
- `use-external-composer-command-staging.ts`: token-deduplicated staging of
  commands initiated by platform surfaces outside RunnerChat.
- `use-enabled-skills-controller.ts`: controlled and persisted skill
  selection plus normalized toggle behavior.
- `use-schedule-controller.ts`: quick-schedule state, preset repair,
  validation, submission, and schedule-label formatting.
- `use-run-stop-controller.ts`: remote/local cancellation coordination,
  intentional-abort normalization, queued/running turn finalization, and
  lifecycle callback isolation.
- `communicator-router.ts`: deterministic run-control precedence,
  communicator classification and fallback routing, delivery confirmation,
  and composer-restoration semantics.
- `editable-turn-boundary.ts`: canonical user-message resolution for edit and
  fork truncation, with stable compatibility fallbacks for older turns.
- `permission-decision.ts`: authenticated permission rulings, canonical
  reconciliation notices, and deterministic turn/log state transitions.
- `thread-context-action.ts`: transactional `/compact`, `/clear`, `/fork`, and
  `/btw` execution, including notice lifecycle, context refresh, and fork
  handoff ordering.
- `use-thread-context-controller.ts`: context estimates, lazy detail loading,
  action lifecycle, thread-change resets, and bounded automatic retry
  semantics.
- `use-turn-notice-controller.ts`: synthetic communicator/voice turns and
  immutable context-action notice creation, completion, and failure state.
- `use-deep-research-sessions-controller.ts`: conditional session discovery,
  active-session selection, resilient polling, and stale-session cleanup.
- `use-github-branch-selection.ts`: branch resolution, root normalization,
  request deduplication, and per-repository branch caching.
- `use-file-drop-controller.ts`: screen and popup drop-target state, browser
  drag lifecycle, and file delivery.
- `use-attachment-controller.ts`: local attachment ownership, preview cleanup,
  upload and GitHub-preparation deduplication, turn-state mirroring, and
  execution payload resolution.
- `use-fork-configuration-controller.ts`: fork-dialog state, environment
  defaults, open/reset/cancel transitions, copy-mode derivation, and popup
  lifecycle.
- `*-dialog.tsx`, `*-surface.tsx`, `*-control.tsx`, `*-item.tsx`,
  `*-presentation.tsx`, and `*-chip.tsx`: bounded presentation components.
- `public-types.ts`: compatibility API consumed by the parent export.

## Adding or changing behavior

1. Put pure transformations in a dedicated leaf module with colocated tests.
2. Put multi-effect lifecycle behavior in a hook with an explicit options and
   result contract.
3. Keep class names and callback semantics stable when extracting existing
   presentation.
4. Add the seam to the required-module list in
   `apps/platform/testing/platform-architecture.test.mjs` when it is intended
   to be permanent.
5. Lower the composition-root line budget after a meaningful extraction; do
   not raise it to accommodate new behavior.

Run:

```bash
npm run check:static
npx vitest run src/react/runner-chat
npm run platform:architecture-test
```

## Parallel work

Treat `../runner-chat.tsx` as a shared integration file. Coordinate before
editing it in parallel. Work within separate leaf modules whenever possible,
avoid repository-wide formatting during active UI work, and never update a
source-hash compatibility fixture without reviewing the assembled browser
source.
