<!-- platform-directory-guide:v1 -->

# Shell Runtime

## Purpose

This directory contains stateful runtime orchestration for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`actions.mjs`](actions.mjs) — Focused implementation of Actions.
- [`backend.mjs`](backend.mjs) — Focused implementation of Backend.
- [`formatting.mjs`](formatting.mjs) — Focused implementation of Formatting.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`lifecycle.mjs`](lifecycle.mjs) — Focused implementation of Lifecycle.

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
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
