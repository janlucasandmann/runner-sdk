<!-- platform-directory-guide:v1 -->

# Computers

## Purpose

This directory is the shared resource boundary for Computers. It owns the typed
repository client, overview analytics and table model, detail composition, and
public exports.

## Usage

Import through `platform-resources/computers` or the top-level
`platform-resources` barrel. Use the repository factory for non-React code and
the repository hook for provider-backed pages. The host supplies lifecycle
operations and navigation to `ComputersOverviewPage` and `ComputerDetailPage`.

## Contents

- [`client/`](client/) — This directory contains browser-side public composition and integration for the shared Computers resource. Resource-independent UI belongs in `src/platform-ui`.
- [`detail/`](detail/) — This directory contains resource-detail composition and controls for the shared Computers resource. Resource-independent UI belongs in `src/platform-ui`.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the shared Computers resource. Resource-independent UI belongs in `src/platform-ui`.
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
