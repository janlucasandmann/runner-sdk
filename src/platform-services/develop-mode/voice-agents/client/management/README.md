<!-- platform-directory-guide:v1 -->

# Management

## Purpose

This directory contains mutation and lifecycle orchestration for the Voice Agents service in Develop Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`use-voice-agent-management.test.ts`](use-voice-agent-management.test.ts) — Regression coverage for Use Voice Agent Management.
- [`use-voice-agent-management.ts`](use-voice-agent-management.ts) — React controller for Voice Agent Management.

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
