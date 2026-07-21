<!-- platform-directory-guide:v1 -->

# Repository Security server adapter

## Purpose

This directory owns the authenticated same-origin proxy boundary between the
platform browser and the control-plane Repository Security API. Browser routes
under `/api/real/security` and `/api/real/github/security` are translated to
their corresponding upstream paths without exposing GitHub credentials.

## Contents

- [`routes.mjs`](routes.mjs) — Method allowlist, path matching, safe segment
  encoding, and upstream route translation.
- [`index.mjs`](index.mjs) — Host-facing service factory.

## Working in this directory

Keep this adapter transport-only. Authorization, organization scope, GitHub
installation access, and security policy validation belong to the control
plane. Add route coverage to the service contract whenever the proxy surface
changes.

## Verification

```bash
npm run security-service-test
npm run platform:static-asset-test
```

## Related documentation

- [Service guide](../README.md)
- [Platform HTTP routes](../../../../../apps/platform/server/routes/README.md)
