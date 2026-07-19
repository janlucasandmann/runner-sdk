<!-- platform-directory-guide:v1 -->

# Thread event adapters

## Purpose

This directory translates provider- or workflow-specific records into canonical thread events.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`metronome.ts`](metronome.ts) — Focused implementation of Metronome.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run thread-ui-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
