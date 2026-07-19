<!-- platform-directory-guide:v1 -->

# Playground billing adapter

## Purpose

`playground-billing-catalog.mjs` is the billing boundary for the platform. It contains
the resilient UI fallback catalog, injects catalog hydration into the browser bundle, and
maps billing proxy routes to the cloud API.

The backend `GET /billing/catalog` response is authoritative. Do not add plan prices,
entitlements, or legacy tier aliases directly to `apps/platform/server/index.mjs`; extend the backend
catalog and keep only the matching offline fallback in this directory.

Checkout requests must include the active organization id. Subscription and top-up
responses are therefore credited to the same organization whose resources the user is
viewing.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
