<!-- platform-directory-guide:v1 -->

# Plugin connections

## Purpose

This directory owns the provider registry and browser-side connection lifecycle shared by the Plugins resource and product services that consume plugins.

## Contents

- [`plugin-connection-types.ts`](plugin-connection-types.ts) — Stable provider, status, and redirect-state contracts.
- [`plugin-connection-registry.ts`](plugin-connection-registry.ts) — Provider metadata, endpoint registration, status normalization, and identity formatting.
- [`plugin-connection-client.ts`](plugin-connection-client.ts) — Authenticated status, authorization-start, disconnect, and provider-resource requests, including GitHub branch discovery.
- [`plugin-connection-storage.ts`](plugin-connection-storage.ts) — Backward-compatible cached status and OAuth return-state persistence.
- [`index.ts`](index.ts) — Public connection entry point.

## Working in this directory

Register a provider once and keep provider-specific endpoint details here. Consumers may add page-specific return context, but must not duplicate OAuth request or cache behavior. Keep secrets and token exchange on the server.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run typecheck
npm run platform-resource-overview-test
```

## Related documentation

- [Plugins](../README.md)
- [Platform integrations](../../../platform-integrations/README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
