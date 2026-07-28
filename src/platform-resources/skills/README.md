<!-- platform-directory-guide:v1 -->

# Skills

## Purpose

This directory is the shared resource boundary for Skills. It owns the typed
repository client, normalized overview model, overview guide and page, the
shared Code/Settings detail shell, and public exports.

## Usage

Import through `platform-resources/skills` or the top-level
`platform-resources` barrel. The repository client owns transport; the overview
page consumes normalized rows and host-provided navigation or mutation
callbacks.

## Contents

- [`client/`](client/) — This directory contains browser-side public composition and integration for the shared Skills resource. Resource-independent UI belongs in `src/platform-ui`.
- [`detail/`](detail/) — This directory contains the shared two-tab Skills detail shell and its layout contract.
- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the shared Skills resource. Resource-independent UI belongs in `src/platform-ui`.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-resource-overview-test
npm run platform:skill-source-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
