<!-- platform-directory-guide:v1 -->

# Legacy browser domains

## Purpose

This directory separates the remaining legacy browser program by product domain so each fragment can be migrated to its typed owner independently.

## Contents

- [`agents/`](agents/) — This directory contains remaining legacy browser composition for Agents. Migrate behavior toward its typed owner without creating another application runtime.
- [`compute-resources/`](compute-resources/) — This directory contains remaining legacy browser composition for Compute Resources. Migrate behavior toward its typed owner without creating another application runtime.
- [`shell/`](shell/) — This directory contains remaining legacy browser composition for Shell. Migrate behavior toward its typed owner without creating another application runtime.
- [`skills/`](skills/) — This directory contains remaining legacy browser composition for Skills. Migrate behavior toward its typed owner without creating another application runtime.
- [`controller-fragments.test.mjs`](controller-fragments.test.mjs) — Regression coverage for Controller Fragments.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:legacy-syntax-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
