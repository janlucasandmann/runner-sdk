<!-- platform-directory-guide:v1 -->

# Platform HTTP routes

## Purpose

This directory owns ordered HTTP route-family matching. Route modules translate requests and delegate to gateways or owning services.

## Contents

- [`agent-resource-routes.mjs`](agent-resource-routes.mjs) — Route composition for Agent Resource Routes.
- [`aios-and-admin-routes.mjs`](aios-and-admin-routes.mjs) — Route composition for AIOS And Admin Routes.
- [`compute-resource-routes.mjs`](compute-resource-routes.mjs) — Route composition for Compute Resource Routes.
- [`database-routes.mjs`](database-routes.mjs) — Route composition for Database Routes.
- [`identity-routes.mjs`](identity-routes.mjs) — Route composition for Identity Routes.
- [`legacy-compatibility-routes.mjs`](legacy-compatibility-routes.mjs) — Route composition for Legacy Compatibility Routes.
- [`page-and-static-routes.mjs`](page-and-static-routes.mjs) — Presentation composition for Page And Static Routes.
- [`page-and-static-routes.test.mjs`](page-and-static-routes.test.mjs) — Regression coverage for Page And Static Routes.
- [`platform-resource-routes.mjs`](platform-resource-routes.mjs) — Route composition for Platform Resource Routes.
- [`request-router.mjs`](request-router.mjs) — Focused implementation of Request Router.
- [`request-router.test.mjs`](request-router.test.mjs) — Regression coverage for Request Router.
- [`resource-routes.mjs`](resource-routes.mjs) — Route composition for Resource Routes.
- [`service-routes.mjs`](service-routes.mjs) — Route composition for Service Routes.
- [`thread-proxy-contract.mjs`](thread-proxy-contract.mjs) — Focused implementation of Thread Proxy Contract.
- [`thread-proxy-contract.test.mjs`](thread-proxy-contract.test.mjs) — Regression coverage for Thread Proxy Contract.
- [`thread-routes.mjs`](thread-routes.mjs) — Route composition for Thread Routes.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run test:contracts
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
