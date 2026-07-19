<!-- platform-directory-guide:v1 -->

# Canonical thread domain

## Purpose

This directory owns canonical thread types, normalization, event projection, selectors, and compatibility adaptation independently of React.

## Contents

- [`adapters/`](adapters/) — This directory translates provider- or workflow-specific records into canonical thread events.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`legacy-adapter.ts`](legacy-adapter.ts) — Boundary adapter for Legacy Adapter.
- [`normalize.ts`](normalize.ts) — Input normalization for Normalize.
- [`projection.ts`](projection.ts) — State and projection logic for Projection.
- [`selectors.ts`](selectors.ts) — State and projection logic for Selectors.
- [`types.ts`](types.ts) — Type contracts for this boundary.

## Data model

The thread is an event projection rather than an alternating chat transcript.
Messages, worker/observer/communicator runs, action groups, actions, routing
receipts, and permission requests share a monotonic sequence but link to one
another by ID. Concurrent voice conversation, scheduled work, Metronome runs,
and human steering therefore do not require a different schema.

`types.ts` is the transport-independent contract. `normalize.ts` is the
untrusted-input boundary. `projection.ts` incrementally reduces timeline pages
and live mutations while retaining stable timeline anchors. `selectors.ts`
derives presentation-ready state without adding React concerns.

## Usage

```ts
const initial = createInitialRunnerThreadProjection({ threadId });
const hydrated = projectRunnerThreadTimelinePage(initial, page);
const live = reduceRunnerThreadEvents(hydrated, incomingEvents);
const activeRuns = selectRunnerThreadActiveRuns(live);
```

Normalize external records before projection. Reducers must remain
deterministic, preserve monotonic cursor semantics, and tolerate replayed or
out-of-order updates. Provider-specific translation belongs in `adapters/`;
React composition belongs in `src/react/thread`.

## Working in this directory

Keep this layer pure and transport-independent. Extend canonical types and
normalizers before teaching a UI about a new event shape. Add reducer and
selector coverage for replay, ordering, partial records, and legacy sequence
zero whenever projection behavior changes.

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
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
