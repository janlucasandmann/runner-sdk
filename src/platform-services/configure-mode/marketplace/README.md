<!-- platform-directory-guide:v1 -->

# Marketplace service

## Purpose

Configure-mode ownership for the reusable resource-template marketplace.

- `domain` owns the Marketplace template catalog and category definitions.
- `client/domain` owns preview metadata, files, databases, and virtual resource materialization.
- `client/page/overview` owns the typed shared-page hero, cards, filters, and resource table.
- `client/page` bridges legacy shell state into the typed overview and owns preview and publishing dialogs.
- `client/styles` owns the Marketplace page stylesheet.
- `client/shell` owns preview state, lifecycle, navigation, history, branding, sidebar, and page integration.
- `server` exposes the read-only Marketplace catalog API, including the resource-template compatibility route.

Marketplace is the product/service name. Resource template remains the compatibility term in persisted records and APIs.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run marketplace-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
