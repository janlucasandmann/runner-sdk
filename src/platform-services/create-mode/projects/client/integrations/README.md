<!-- platform-directory-guide:v1 -->

# Integrations

## Purpose

This directory contains explicit adapters consumed across ownership boundaries for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`connector-state.mjs`](connector-state.mjs) — State and projection logic for Connector State.
- [`file-index.mjs`](file-index.mjs) — Focused implementation of File Index.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`markdown.mjs`](markdown.mjs) — Focused implementation of Markdown.
- [`permissions.mjs`](permissions.mjs) — Focused implementation of Permissions.
- [`status.mjs`](status.mjs) — Focused implementation of Status.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run projects-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
