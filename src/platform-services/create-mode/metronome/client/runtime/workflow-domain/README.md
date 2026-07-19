<!-- platform-directory-guide:v1 -->

# Workflow Domain

## Purpose

This directory contains workflow domain behavior for the owning feature for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-workflow-model-and-sharing.mjs`](01-workflow-model-and-sharing.mjs) — State and projection logic for 01 Workflow Model And Sharing.
- [`02-graph-runs-and-api.mjs`](02-graph-runs-and-api.mjs) — Focused implementation of 02 Graph Runs And API.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run metronome-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
