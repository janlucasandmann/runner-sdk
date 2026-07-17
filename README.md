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
  platform-ui/         Shared UI primitives, composites, and thread components
  react/               Runner composition and compatibility facades
```

The compatibility browser document is intentionally isolated under
`apps/platform/client/legacy`. New application UI must be implemented as typed
React modules under `apps/platform/client/src` or the owning domain in `src`.
The complete ownership map and migration rules are documented in
[`docs/platform-architecture.md`](docs/platform-architecture.md).

## Verification

Run the complete local/CI gate:

```bash
npm run check
```

Focused commands are also available:

```bash
npm run check:static
npm run test
npm run test:unit
npm run test:contracts
npm run build
```

See [`docs/development/testing.md`](docs/development/testing.md) for the test
matrix and [`docs/development/configuration.md`](docs/development/configuration.md)
for runtime configuration.

## Runner compatibility API

The former SDK surface remains as a private compatibility API for `RunnerClient`,
`RunnerChat`, and embedded execution views. Its documentation is in
[`docs/runner-client.md`](docs/runner-client.md).
