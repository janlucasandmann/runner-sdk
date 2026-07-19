<!-- platform-directory-guide:v1 -->

# Shared application contracts

## Purpose

This directory contains contracts shared across application-level client and server composition. Domain-specific contracts remain with their owners.

## Contents

- [`billing/`](billing/) — Billing catalog hydration, resilient browser
  fallback, and billing proxy route composition.
- [`development-style-resolution.mjs`](development-style-resolution.mjs) — Style composition for Development Style Resolution.
- [`legacy-source-resolution.mjs`](legacy-source-resolution.mjs) — Focused implementation of Legacy Source Resolution.
- [`platform-source-contract.mjs`](platform-source-contract.mjs) — Focused implementation of Platform Source Contract.

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
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
