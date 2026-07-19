<!-- platform-directory-guide:v1 -->

# Repository migrations

## Purpose

This directory is reserved for explicit, reviewable repository or persisted-data migrations. Migrations must be idempotent or document their rollback and one-shot semantics.

## Contents

This directory currently has no implementation files. Keep this guide when introducing the first module, and update it with the new contract.

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
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
