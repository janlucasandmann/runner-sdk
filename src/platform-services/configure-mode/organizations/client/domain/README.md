<!-- platform-directory-guide:v1 -->

# Client Domain

## Purpose

This directory contains domain contracts, normalization, and pure transformations for the Organizations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`constants.mjs`](constants.mjs) — Constants shared within this boundary.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`invitation-notifications.mjs`](invitation-notifications.mjs) — Focused implementation of Invitation Notifications.
- [`organization-identity.mjs`](organization-identity.mjs) — Focused implementation of Organization Identity.
- [`role-definitions.mjs`](role-definitions.mjs) — Focused implementation of Role Definitions.
- [`role-identity.mjs`](role-identity.mjs) — Focused implementation of Role Identity.
- [`role-permissions.mjs`](role-permissions.mjs) — Focused implementation of Role Permissions.
- [`storage.mjs`](storage.mjs) — Focused implementation of Storage.

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
