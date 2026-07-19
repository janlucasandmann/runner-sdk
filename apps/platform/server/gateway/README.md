<!-- platform-directory-guide:v1 -->

# Platform gateways

## Purpose

This directory contains authenticated, provider-aware transports between the platform host and upstream control-plane services.

## Contents

- [`thread/`](thread/) — This directory owns focused thread transport, streaming, and protocol helpers used by the platform gateway.
- [`admin-authorization.mjs`](admin-authorization.mjs) — Focused implementation of Admin Authorization.
- [`admin-authorization.test.mjs`](admin-authorization.test.mjs) — Regression coverage for Admin Authorization.
- [`admin-gateway.mjs`](admin-gateway.mjs) — Focused implementation of Admin Gateway.
- [`aios-domain.mjs`](aios-domain.mjs) — Focused implementation of AIOS Domain.
- [`aios-domain.test.mjs`](aios-domain.test.mjs) — Regression coverage for AIOS Domain.
- [`aios-gateway.mjs`](aios-gateway.mjs) — Focused implementation of AIOS Gateway.
- [`core-gateway.mjs`](core-gateway.mjs) — Focused implementation of Core Gateway.
- [`create-platform-gateway.mjs`](create-platform-gateway.mjs) — Focused implementation of Create Platform Gateway.
- [`deployment-vm-admin-client.mjs`](deployment-vm-admin-client.mjs) — Boundary adapter for Deployment VM Admin Client.
- [`deployment-vm-admin-client.test.mjs`](deployment-vm-admin-client.test.mjs) — Regression coverage for Deployment VM Admin Client.
- [`http-utils.mjs`](http-utils.mjs) — Focused helpers for HTTP Utils.
- [`http-utils.test.mjs`](http-utils.test.mjs) — Regression coverage for HTTP Utils.
- [`resource-gateway.mjs`](resource-gateway.mjs) — Focused implementation of Resource Gateway.
- [`resource-overview-domain.mjs`](resource-overview-domain.mjs) — Focused implementation of Resource Overview Domain.
- [`resource-overview-domain.test.mjs`](resource-overview-domain.test.mjs) — Regression coverage for Resource Overview Domain.
- [`runner-stream-utils.mjs`](runner-stream-utils.mjs) — Focused helpers for Runner Stream Utils.

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
