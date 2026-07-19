<!-- platform-directory-guide:v1 -->

# Agents Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`adaptations.mjs`](adaptations.mjs) — Focused implementation of Adaptations.
- [`bundle.mjs`](bundle.mjs) — Focused implementation of Bundle.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`selection.mjs`](selection.mjs) — Focused implementation of Selection.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run guardrails-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../../docs/development/readme-standard.md)
