<!-- platform-directory-guide:v1 -->

# Runner hydration

## Purpose

This directory contains history and execution-state hydration for RunnerChat. It must not import the RunnerChat composition root.

## Contents

- [`api.test.ts`](api.test.ts) — Regression coverage for API.
- [`api.ts`](api.ts) — Focused implementation of API.
- [`file-paths.test.ts`](file-paths.test.ts) — Regression coverage for File Paths.
- [`file-paths.ts`](file-paths.ts) — Focused implementation of File Paths.
- [`lifecycle-status.test.ts`](lifecycle-status.test.ts) — Regression coverage for Lifecycle Status.
- [`lifecycle-status.ts`](lifecycle-status.ts) — Focused implementation of Lifecycle Status.
- [`live-refresh.test.ts`](live-refresh.test.ts) — Regression coverage for Live Refresh.
- [`live-refresh.ts`](live-refresh.ts) — Focused implementation of Live Refresh.
- [`log-normalization.test.ts`](log-normalization.test.ts) — Regression coverage for Log Normalization.
- [`log-normalization.ts`](log-normalization.ts) — Input normalization for Log Normalization.
- [`message-turns.test.ts`](message-turns.test.ts) — Regression coverage for Message Turns.
- [`message-turns.ts`](message-turns.ts) — Focused implementation of Message Turns.
- [`step-diffs.test.ts`](step-diffs.test.ts) — Regression coverage for Step Diffs.
- [`step-diffs.ts`](step-diffs.ts) — Focused implementation of Step Diffs.
- [`turn-builders.test.ts`](turn-builders.test.ts) — Regression coverage for Turn Builders.
- [`turn-builders.ts`](turn-builders.ts) — Focused implementation of Turn Builders.
- [`turn-merge.test.ts`](turn-merge.test.ts) — Regression coverage for Turn Merge.
- [`turn-merge.ts`](turn-merge.ts) — Focused implementation of Turn Merge.
- [`turn-state.test.ts`](turn-state.test.ts) — Regression coverage for Turn State.
- [`turn-state.ts`](turn-state.ts) — State and projection logic for Turn State.
- [`types.ts`](types.ts) — Type contracts for this boundary.
- [`use-running-thread-reattachment.test.ts`](use-running-thread-reattachment.test.ts) — Regression coverage for Use Running Thread Reattachment.
- [`use-running-thread-reattachment.ts`](use-running-thread-reattachment.ts) — React controller for Running Thread Reattachment.
- [`use-thread-history-hydration.test.ts`](use-thread-history-hydration.test.ts) — Regression coverage for Use Thread History Hydration.
- [`use-thread-history-hydration.ts`](use-thread-history-hydration.ts) — React controller for Thread History Hydration.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run thread-ui-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
