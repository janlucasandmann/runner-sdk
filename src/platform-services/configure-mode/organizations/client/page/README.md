<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the active organization in Admin Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`identity-access.mjs`](identity-access.mjs) — Legacy-host composition for the centralized organization Identity & Access page.
- [`identity-and-billing.mjs`](identity-and-billing.mjs) — Focused implementation of Identity And Billing.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`members.mjs`](members.mjs) — Focused implementation of Members.
- [`roles-and-view.mjs`](roles-and-view.mjs) — Presentation composition for the standalone Organization, Members, Billing, Usage, Roles, and Identity & Access pages.
- [`setup.mjs`](setup.mjs) — Initialization for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run organizations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
