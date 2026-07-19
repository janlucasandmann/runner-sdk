<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`actions/`](actions/) — This directory contains user and system actions that mutate or navigate the owning feature for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`data/`](data/) — This directory contains data loading, normalization, and projection for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`shell/`](shell/) — This directory contains application-shell state, lifecycle, and navigation integration for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`views/`](views/) — This directory contains focused view renderers for the Projects service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`actions.mjs`](actions.mjs) — Focused implementation of Actions.
- [`connectors.mjs`](connectors.mjs) — Focused implementation of Connectors.
- [`data.mjs`](data.mjs) — Focused implementation of Data.
- [`shell.mjs`](shell.mjs) — Focused implementation of Shell.
- [`views.mjs`](views.mjs) — Focused implementation of Views.

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
