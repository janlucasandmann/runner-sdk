<!-- platform-directory-guide:v1 -->

# Typed shell presentation

## Purpose

This directory exposes typed page and resource registries to the remaining browser composition without leaking owning-domain internals.

## Contents

- [`platform-develop-api.ts`](platform-develop-api.ts) — Focused implementation of Platform Develop API.
- [`platform-pages.tsx`](platform-pages.tsx) — Focused implementation of Platform Pages.
- [`platform-resource-api.ts`](platform-resource-api.ts) — Focused implementation of Platform Resource API.

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
