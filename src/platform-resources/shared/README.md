<!-- platform-directory-guide:v1 -->

# Shared

## Purpose

This directory contains narrow presentation adapters genuinely shared by
multiple resource domains. It is not itself a user-facing resource and must not
become a second generic component directory.

## Contents

- [`connections/`](connections/) — Cross-resource connection overview
  composition built on the canonical overview page.

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
