<!-- platform-directory-guide:v1 -->

# Repository automation

## Purpose

This directory contains deterministic repository automation and architectural invariant checks invoked by package scripts and CI.

## Contents

- [`migrations/`](migrations/) — This directory is reserved for explicit, reviewable repository or persisted-data migrations. Migrations must be idempotent or document their rollback and one-shot semantics.
- [`quality/`](quality/) — This directory owns static quality gates, artifact checks, documentation policy, import boundaries, and test discovery.
- [`platform-button-invariants.mjs`](platform-button-invariants.mjs) — Architecture invariant check for Platform Button Invariants.
- [`platform-component-invariants.mjs`](platform-component-invariants.mjs) — Architecture invariant check for Platform Component Invariants.
- [`platform-overlay-invariants.mjs`](platform-overlay-invariants.mjs) — Architecture invariant check for Platform Overlay Invariants.
- [`platform-resource-invariants.mjs`](platform-resource-invariants.mjs) — Architecture invariant check for Platform Resource Invariants.
- [`platform-table-invariants.mjs`](platform-table-invariants.mjs) — Architecture invariant check for Platform Table Invariants.
- [`platform-widget-invariants.mjs`](platform-widget-invariants.mjs) — Architecture invariant check for Platform Widget Invariants.
- [`runner-chat-assets.mjs`](runner-chat-assets.mjs) — Focused implementation of Runner Chat Assets.
- [`runner-chat-style-sources.mjs`](runner-chat-style-sources.mjs) — Style composition for Runner Chat Style Sources.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../docs/platform-architecture.md)
- [Directory README standard](../docs/development/readme-standard.md)
