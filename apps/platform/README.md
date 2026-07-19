<!-- platform-directory-guide:v1 -->

# Platform application

## Purpose

This directory owns the executable platform host, browser composition, local development orchestration, and architecture tests.

## Contents

- [`client/`](client/) — This directory owns browser-entry composition that has not yet moved behind a typed domain boundary.
- [`development/`](development/) — This directory owns the local Vite bridge, Fast Refresh integration, CSS HMR, and backend reload policy used by `npm run dev`.
- [`server/`](server/) — This directory is the Node platform host. It composes identity, routes, gateways, static assets, integrations, and WebSocket proxies without owning product-domain behavior.
- [`shared/`](shared/) — This directory contains contracts shared across application-level client and server composition. Domain-specific contracts remain with their owners.
- [`testing/`](testing/) — This directory owns architecture budgets, compatibility audits, and source-composition test helpers for the platform application.
- [`dev.mjs`](dev.mjs) — Focused implementation of Dev.
- [`vite.config.mjs`](vite.config.mjs) — Configuration behavior for Vite.config.

## Running the application

From the repository root:

```bash
npm run dev
```

Use `http://127.0.0.1:4177` as the application origin. Vite on port `5173` is a
source-module and HMR server, not another application. The production entry is:

```bash
npm run platform:start
```

`dev.mjs` coordinates the API host, Vite, backend reloads, and browser refresh.
`server/index.mjs` is the production composition root. Neither entry point
should absorb service behavior that has a typed owner in `src`.

## Dependency direction

The browser and server communicate through HTTP, WebSocket, and shared data
contracts. Browser modules must not import server implementations. The server
may compose service route adapters but must not generate new product behavior
or UI source. The compatibility client under `client/legacy` is reduced in
place; do not introduce a parallel document, router, or session model.

## Working in this directory

Keep composition roots small. Extract product behavior into its owning service
or resource, shared presentation into `src/platform-ui`, and reusable browser
transport into `src/platform-runtime`. Lower the relevant architecture budget
when removing compatibility code.

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
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
