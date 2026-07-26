<!-- platform-directory-guide:v1 -->

# Platform host server

## Purpose

This directory is the Node platform host. It composes identity, routes, gateways, static assets, integrations, and WebSocket proxies without owning product-domain behavior.

## Contents

- [`admin/`](admin/) — This directory owns restricted operational pages and their safe HTML rendering boundary.
- [`gateway/`](gateway/) — This directory contains authenticated, provider-aware transports between the platform host and upstream control-plane services.
- [`identity/`](identity/) — Provider-neutral browser identity, hosted Firebase
  and on-prem OIDC adapters, encrypted sessions, and short-lived principal
  assertions.
- [`execution-dispatch/`](execution-dispatch/) — Browser-independent durable
  Evaluation and Agent Optimization worker, signed worker assertions, claim
  heartbeats, and retry acknowledgements.
- [`integrations/`](integrations/) — This directory contains server-side adapters for external providers. Provider credentials and protocol behavior must remain behind these modules.
- [`routes/`](routes/) — This directory owns ordered HTTP route-family matching. Route modules translate requests and delegate to gateways or owning services.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`platform-assets.mjs`](platform-assets.mjs) — Focused implementation of Platform Assets.
- [`platform-assets.test.mjs`](platform-assets.test.mjs) — Regression coverage for Platform Assets.
- [`platform-config.mjs`](platform-config.mjs) — Configuration behavior for Platform Config.
- [`platform-config.test.mjs`](platform-config.test.mjs) — Regression coverage for Platform Config.
- [`platform-development-assets.mjs`](platform-development-assets.mjs) — Focused implementation of Platform Development Assets.
- [`platform-development-assets.test.mjs`](platform-development-assets.test.mjs) — Regression coverage for Platform Development Assets.
- [`platform-services.mjs`](platform-services.mjs) — Focused implementation of Platform Services.
- [`request-handler.mjs`](request-handler.mjs) — Focused implementation of Request Handler.
- [`static-assets.mjs`](static-assets.mjs) — Focused implementation of Static Assets.
- [`static-assets.test.mjs`](static-assets.test.mjs) — Regression coverage for Static Assets.
- [`system-skill-sources.mjs`](system-skill-sources.mjs) — Focused implementation of System Skill Sources.
- [`system-skill-sources.test.mjs`](system-skill-sources.test.mjs) — Regression coverage for System Skill Sources.
- [`vnc-websocket-proxy.mjs`](vnc-websocket-proxy.mjs) — Focused implementation of VNC WebSocket Proxy.

## Request flow

`index.mjs` resolves configuration and service bindings, then creates one
gateway and one request handler. `request-handler.mjs` applies route families
in explicit precedence order through `routes/request-router.mjs`. A route
returns `true` only when it owns the request; unmatched requests become a
plain-text `404`.

Routes parse and authorize requests, gateways perform authenticated upstream
transport, and `src/platform-services/*/server` modules own service-specific
translation. Static asset delivery and browser source assembly remain separate
from JSON and streaming proxies.

## Security boundaries

- Browser credentials are resolved by `identity/`; route and gateway modules
  consume the resulting provider-neutral session.
- Durable service execution uses signed worker assertions and claim-scoped
  workload keys; browser sessions and cookies are never persisted for recovery.
- Admin routes fail closed unless the configured administrator is authorized.
- Secrets and upstream workload credentials must never be serialized into
  browser JavaScript or logged.
- Keep request-body limits, redirect validation, origin policy, and streaming
  cancellation intact when changing transport code.
- Preserve route precedence and add a contract test when two families could
  match the same path.

## Working in this directory

Add routes to the narrowest route family, place reusable transport in
`gateway/`, and keep external-provider details in `integrations/`. The server
composition root should wire dependencies only. Product state and rendering
belong to their owning modules under `src`.

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
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
