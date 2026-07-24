<!-- platform-directory-guide:v1 -->

# Plugins

## Purpose

This directory is the shared resource boundary for Plugins. It owns plugin
connection contracts and lifecycle behavior as well as the plugin overview.

## Usage

Import plugin connection helpers and `PluginsOverviewPage` through
`platform-resources/plugins`. The host provides navigation and page-specific
return context; provider registration, connection requests, and status caching
remain centralized here. Shared overview and table behavior remains in
`src/platform-ui`.

## Contents

- [`connections/`](connections/) — Typed provider registry and reusable browser connection lifecycle.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the shared Plugins resource. Resource-independent UI belongs in `src/platform-ui`.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-resource-overview-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
