<!-- platform-directory-guide:v1 -->

# Repository integration tests

## Purpose

This directory contains build-dependent integration and smoke tests that exercise public artifacts and cross-module behavior.

## Contents

- [`history-api.test.mjs`](history-api.test.mjs) — Regression coverage for History API.
- [`metronome-dynamic-content-runtime.test.mjs`](metronome-dynamic-content-runtime.test.mjs) — Regression coverage for Metronome Dynamic Content Runtime.
- [`realtime-metronome-adapters.test.mjs`](realtime-metronome-adapters.test.mjs) — Regression coverage for Realtime Metronome Adapters.
- [`smoke.test.mjs`](smoke.test.mjs) — Regression coverage for Smoke.
- [`thread-domain.test.mjs`](thread-domain.test.mjs) — Regression coverage for Thread Domain.
- [`thread-ui.test.mjs`](thread-ui.test.mjs) — Regression coverage for Thread UI.

## Working in this directory

Use this directory only when a test consumes built artifacts, spans multiple
ownership boundaries, or verifies an executable smoke path. Pure behavior and
React component tests stay beside their source. Tests must use temporary state,
avoid production mutations, and clean up servers, sockets, and generated files.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../docs/platform-architecture.md)
- [Directory README standard](../docs/development/readme-standard.md)
