# Computer Agents Platform

The product application for creating, configuring, developing, and supervising
autonomous AI agents. This repository contains the platform frontend, its local
HTTP/WebSocket host, domain services, shared UI system, and the compatibility
runner client used by embedded agent surfaces.

## Run locally

Install dependencies once:

```bash
npm install
```

Start the development stack:

```bash
npm run dev
```

Open `http://127.0.0.1:4177`.

`npm run platform:dev` is retained as the explicit equivalent. The command starts:

- the platform host on port `4177`;
- Vite on port `5173`;
- React Fast Refresh for typed frontend modules;
- in-place HMR for RunnerChat and shared platform source CSS, without running
  the generated-asset build;
- automatic full-page reloads when compatibility shell or backend modules
  change.

Ports can be overridden with `PLATFORM_API_PORT` and `PLATFORM_VITE_PORT`.
Keep this command running while editing; normal frontend changes are visible in
the open platform automatically.

## Production

Build and start the platform:

```bash
npm run platform:start
```

The production host emits a small HTML document and immutable, content-hashed
CSS and JavaScript assets with Brotli/gzip support.

Deployment files live in [`deployment/platform`](deployment/platform).

## Repository layout

```text
apps/platform/
  client/
    src/               Typed Vite/React application
    legacy/            Quarantined compatibility composition
  server/
    admin/             Restricted operational page renderers
    gateway/           Authenticated upstream transports
    integrations/      External provider integrations
    routes/            Ordered route-family modules
  shared/              App-level shared contracts
  development/         Fast Refresh, CSS HMR, and backend reload policies
  testing/             Architecture and composition test helpers
  dev.mjs              Local Vite + watched backend orchestrator

src/
  platform-services/   Create, Configure, and Develop domain services
  platform-resources/  Shared resource domains
  platform-shell/      App shell modules
  platform-ui/         Shared UI primitives and composite components
  react/               Runner compatibility components
```

The compatibility browser document is intentionally isolated under
`apps/platform/client/legacy`. New application UI must be implemented as typed
React modules under `apps/platform/client/src` or the owning domain in `src`.
The complete ownership map and migration rules are documented in
[`docs/platform-architecture.md`](docs/platform-architecture.md).

## Verification

Useful checks:

```bash
npm run build
npm run platform:asset-test
npm run platform:architecture-test
npm run thread-proxy-test
```

Domain-specific service tests are exposed as npm scripts in `package.json`.

## Runner compatibility API

The former SDK surface remains available internally for `RunnerClient`,
`RunnerChat`, and embedded execution views. Its documentation is in
[`docs/runner-client.md`](docs/runner-client.md).
