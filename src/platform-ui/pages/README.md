<!-- platform-directory-guide:v1 -->

# Shared platform pages

## Purpose

This directory owns reusable page-level layouts for overview, detail, home, and permission experiences.

Canonical home, overview, and detail shells share the
`--platform-page-content-max-width` layout token. The platform defines it as
`87.5rem`; standalone consumers receive the same value as a CSS fallback and
can override the token at their application shell.

## Contents

- [`details/`](details/) — This directory owns the shared Details page contract and presentation used by resource and service domains.
- [`home/`](home/) — This directory owns the shared Home page contract and presentation used by resource and service domains.
- [`overview/`](overview/) — This directory owns the shared Overview page contract and presentation used by resource and service domains.
- [`permissions/`](permissions/) — This directory owns the shared Permissions page contract and presentation used by resource and service domains.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

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
