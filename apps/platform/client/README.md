<!-- platform-directory-guide:v1 -->

# Platform browser client

## Purpose

This directory owns browser-entry composition that has not yet moved behind a typed domain boundary.

## Contents

- [`legacy/`](legacy/) — This directory contains the remaining fragment-based browser composition for the single platform document. It is compatibility debt, not a second application.

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
