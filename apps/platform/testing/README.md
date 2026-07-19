<!-- platform-directory-guide:v1 -->

# Platform architecture testing

## Purpose

This directory owns architecture budgets, compatibility audits, and source-composition test helpers for the platform application.

## Contents

- [`legacy-browser-source-contract.mjs`](legacy-browser-source-contract.mjs) — Focused implementation of Legacy Browser Source Contract.
- [`legacy-client-audit.mjs`](legacy-client-audit.mjs) — Boundary adapter for Legacy Client Audit.
- [`platform-architecture.test.mjs`](platform-architecture.test.mjs) — Regression coverage for Platform Architecture.
- [`platform-composition-source.mjs`](platform-composition-source.mjs) — Focused implementation of Platform Composition Source.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:architecture-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
