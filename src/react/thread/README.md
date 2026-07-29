<!-- platform-directory-guide:v1 -->

# Canonical thread presentation

## Purpose

This directory renders the canonical event-projected thread timeline, live supervision docks, routing receipts, and permission decisions.

## Contents

- [`active-runs-dock.tsx`](active-runs-dock.tsx) — Focused implementation of Active Runs Dock.
- [`activity-action-list.tsx`](activity-action-list.tsx) — Focused implementation of Activity Action List.
- [`activity-group-tree.tsx`](activity-group-tree.tsx) — Focused implementation of Activity Group Tree.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`live-supervision-dock.tsx`](live-supervision-dock.tsx) — Focused implementation of Live Supervision Dock.
- [`participant-avatar.tsx`](participant-avatar.tsx) — Focused implementation of Participant Avatar.
- [`pending-permissions-dock.tsx`](pending-permissions-dock.tsx) — Focused implementation of Pending Permissions Dock.
- [`permission-request-card.tsx`](permission-request-card.tsx) — Focused implementation of Permission Request Card.
- [`routing-receipt.tsx`](routing-receipt.tsx) — Focused implementation of Routing Receipt.
- [`run-activity-card.tsx`](run-activity-card.tsx) — Focused implementation of Run Activity Card.
- [`run-detail-hydration.ts`](run-detail-hydration.ts) — Focused implementation of Run Detail Hydration.
- [`runner-thread.css`](runner-thread.css) — Styles for Runner Thread.
- [`runner-thread.tsx`](runner-thread.tsx) — Focused implementation of Runner Thread.
- [`thread-message.tsx`](thread-message.tsx) — Focused implementation of Thread Message.
- [`thread-timeline.tsx`](thread-timeline.tsx) — Focused implementation of Thread Timeline.
- [`use-runner-thread-projection.ts`](use-runner-thread-projection.ts) — React controller for Runner Thread Projection.

## Usage

`RunnerThread` is the canonical high-level surface. Supply a canonical
`RunnerThreadProjection` and lifecycle callbacks; the surface renders the
conversation timeline while keeping active-run and permission supervision
mounted independently of timeline virtualization. Hosts that hydrate history
and subscribe to live events can use `useRunnerThreadProjection` to own that
projection lifecycle.

Lower-level exports support specialized hosts:

- `RunnerThreadTimeline` renders ordered messages and run cards.
- `RunnerThreadLiveSupervisionDock` promotes pending judgments without adding
  transient worker or orchestrator status labels above the conversation.
- `RunnerThreadActivityGroupTree` renders observer-maintained causal groups.
- `RunnerThreadPermissionRequestCard` presents a grounded permission decision.
- `RunnerThreadRoutingReceiptView` makes communicator/worker delivery visible.

Domain state comes from `src/thread`. Specialized action rendering may delegate
to platform-owned thread components, but this directory must not recreate tool
log renderers or canonical projection logic.

## Working in this directory

Keep live supervision reachable even when historical timeline content is
virtualized or collapsed. Preserve accessible message, expansion, and
permission semantics. Put pure event transformation in `src/thread` and
reusable thread presentation in `src/platform-ui/components/thread-components`.

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
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
