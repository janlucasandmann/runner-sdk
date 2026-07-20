<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Inference service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`detail/`](detail/) — This directory contains resource-detail composition and controls for the Inference service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Inference service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`inference-provider-options.ts`](inference-provider-options.ts) — Shared provider choices for endpoint creation and details.
- [`inference-endpoint-model.test.ts`](inference-endpoint-model.test.ts) — Regression coverage for Inference Endpoint Model.
- [`inference-endpoint-model.ts`](inference-endpoint-model.ts) — State and projection logic for Inference Endpoint Model.
- [`local-runners.mjs`](local-runners.mjs) — Focused implementation of Local Runners.
- [`setup.mjs`](setup.mjs) — Initialization for this layer.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run inference-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
