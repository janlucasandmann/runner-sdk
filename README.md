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
- automatic full-page reloads when browser-composition or backend modules
  change.

Ports can be overridden with `PLATFORM_API_PORT` and `PLATFORM_VITE_PORT`.
Keep this command running while editing; normal frontend changes are visible in
the open platform automatically.

Port `4177` is the only application URL. Port `5173` is an HMR/source-module
server; browser navigation to it redirects to the platform host.

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
    legacy/            Current fragment-based browser composition
  server/
    admin/             Restricted operational page renderers
    gateway/           Authenticated upstream transports
    integrations/      External provider integrations
    routes/            Ordered route-family modules
  shared/              App-level shared contracts
  development/         Fast Refresh, CSS HMR, and backend reload policies
  testing/             Architecture and composition test helpers
  dev.mjs              Local Vite + watched backend orchestrator

tests/                 Executable integration and smoke tests
examples/              Consumer examples and the thread UI preview

src/
  platform-runtime/    Browser runtime, API client, and React providers
  platform-services/   Create, Configure, and Develop domain services
  platform-resources/  Shared resource domains
  platform-shell/      App shell and presentation composition
  platform-ui/         Shared UI primitives, composites, and thread components
  react/               Runner composition and compatibility facades
```

The platform has exactly one browser document. Its remaining fragment-based
sources are isolated under `apps/platform/client/legacy` and served through an
explicit HTML/style/module contract. New UI belongs in typed modules under its
owning domain in `src`; the fragment composition is reduced in place instead of
being replaced by a parallel application. The complete ownership map and
migration rules are documented in
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
