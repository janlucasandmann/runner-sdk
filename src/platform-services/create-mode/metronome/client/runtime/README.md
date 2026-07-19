<!-- platform-directory-guide:v1 -->

# Client Runtime

## Purpose

This directory contains stateful runtime orchestration for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`templates-and-graph/`](templates-and-graph/) — This directory contains templates and graph behavior for the owning feature for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`triggers-and-contracts/`](triggers-and-contracts/) — This directory contains triggers and contracts behavior for the owning feature for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`workflow-domain/`](workflow-domain/) — This directory contains workflow domain behavior for the owning feature for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`canvas-components.mjs`](canvas-components.mjs) — Focused implementation of Canvas Components.
- [`execution-and-code.mjs`](execution-and-code.mjs) — Focused implementation of Execution And Code.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`templates-and-graph.mjs`](templates-and-graph.mjs) — Focused implementation of Templates And Graph.
- [`triggers-and-contracts.mjs`](triggers-and-contracts.mjs) — Focused implementation of Triggers And Contracts.
- [`workflow-domain.mjs`](workflow-domain.mjs) — Focused implementation of Workflow Domain.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
