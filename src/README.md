<!-- platform-directory-guide:v1 -->

# Platform source

## Purpose

This directory contains reusable platform domains, runtime adapters, shell features, shared UI, and compatibility surfaces.

## Contents

- [`platform-integrations/`](platform-integrations/) — This directory contains typed browser integrations with external platforms. Each provider must remain isolated behind its own adapter.
- [`platform-resources/`](platform-resources/) — This directory owns reusable resource domains such as Agents, Computers, Skills, Tags, and Plugins.
- [`platform-runtime/`](platform-runtime/) — This directory owns the typed browser API client, provider, Suspense/error boundary, and runtime composition used by platform pages.
- [`platform-services/`](platform-services/) — This directory contains product services organized exactly by Create, Configure, and Develop mode.
- [`platform-shell/`](platform-shell/) — This directory owns application-wide navigation, overlays, creation flows, and presentation composition that sit above individual services.
- [`platform-ui/`](platform-ui/) — This directory is the provider-neutral shared UI system. It may not import owning services, resources, shell features, or Runner compatibility modules.
- [`react/`](react/) — This directory contains the Runner compatibility composition and public React facades that are still consumed by embedded execution surfaces.
- [`realtime/`](realtime/) — This directory owns the provider-neutral realtime session contract used to receive execution and thread events.
- [`thread/`](thread/) — This directory owns canonical thread types, normalization, event projection, selectors, and compatibility adaptation independently of React.
- [`client.ts`](client.ts) — Boundary adapter for Client.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`normalize-event.ts`](normalize-event.ts) — Input normalization for Normalize Event.
- [`sse.ts`](sse.ts) — Focused implementation of SSE.
- [`types.ts`](types.ts) — Type contracts for this boundary.

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
