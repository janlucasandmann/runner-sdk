<!-- platform-directory-guide:v1 -->

# Client Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Voice Agents service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`overview-model.ts`](overview-model.ts) — State and projection logic for Overview Model.
- [`resource-definition.ts`](resource-definition.ts) — Focused implementation of Resource Definition.
- [`voice-agent-configuration.test.ts`](voice-agent-configuration.test.ts) — Regression coverage for Voice Agent Configuration.
- [`voice-agent-configuration.ts`](voice-agent-configuration.ts) — Configuration behavior for Voice Agent Configuration.
- [`voice-agent-types.ts`](voice-agent-types.ts) — Focused implementation of Voice Agent Types.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
