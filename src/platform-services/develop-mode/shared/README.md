<!-- platform-directory-guide:v1 -->

# Shared Develop-mode overview foundation

## Purpose

This directory contains only reusable mechanics shared by Develop-mode
services: normalized overview records, operational analytics projection, and
the canonical overview surface built from `platform-ui/pages/overview`.

Service identity, labels, icons, metrics, and concrete pages belong to the
individual service directories next to this one.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
