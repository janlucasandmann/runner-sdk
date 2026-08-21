<!-- platform-directory-guide:v1 -->

# Metronome Client

## Purpose

This directory contains browser-side public composition and integration for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`integrations/`](integrations/) — This directory contains explicit adapters consumed across ownership boundaries for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page/`](page/) — This directory contains page composition and page-local interaction behavior for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`runtime/`](runtime/) — This directory contains stateful runtime orchestration for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`shell/`](shell/) — This directory contains application-shell state, lifecycle, and navigation integration for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`styles/`](styles/) — This directory contains ordered, owner-scoped style modules for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`manual-run-context.ts`](manual-run-context.ts) resolves the immutable published or pinned Workflow snapshot plus server-backed selector options. Calendar, Batches, and direct manual-run surfaces share this resolver so they execute the same versioned contract. Consumers pass an `AbortSignal` when selection can change; the resolver retries bounded transient GET failures while never retrying a superseded request.
- [`manual-run-contracts.ts`](manual-run-contracts.ts) derives strict trigger-specific input contracts and canonical execution payloads. Consumers may provide their own composer presentation through [`components/metronome-manual-run-inputs.tsx`](components/metronome-manual-run-inputs.tsx), but must not redefine the execution shape.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.

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
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
