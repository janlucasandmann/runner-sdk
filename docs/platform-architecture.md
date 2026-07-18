# Platform architecture

This document defines the ownership boundaries for the Computer Agents Platform.
It is both a map of the current repository and a constraint for future work.

## Runtime shape

```text
Browser
  |
  | one platform document on :4177
  v
apps/platform/client/legacy        current browser composition
  |
  +--> src/platform-runtime        API client, providers, error/Suspense boundary
  +--> src/platform-shell          global navigation and shell behavior
  |     +--> presentation/         typed page registry and composition facades
  +--> src/platform-resources      shared resource domains
  +--> src/platform-services       Create / Configure / Develop services
  +--> src/platform-ui             shared UI system
  +--> src/react                   Runner and thread compatibility surfaces

HTTP / WebSocket
  |
  v
apps/platform/server/index.mjs     composition root only
  |
  +--> routes/                     ordered request-family matching
  +--> gateway/                    authenticated upstream transports
  +--> integrations/               external providers
  +--> admin/                      restricted operational pages
  +--> static-assets.mjs           production/development asset delivery
```

The browser and server meet only through HTTP, WebSocket, and shared data
contracts. Server modules must not compose frontend source strings, and typed
frontend modules must not depend on server implementation details.

## Single application boundary

The platform deliberately has one document owner and one user-facing runtime:

- `http://localhost:4177/` is the application entry in development;
- port `5173` serves Vite source transforms and Fast Refresh only;
- `/create`, `/configure`, `/develop`, `/platform-client`, `/compat`, and
  `/demo` are retired document roots that permanently redirect to `/`;
- thread deep links use `/?thread=<thread-id>`; raw `/thread_*` links are
  normalized to that form by the host.

There is no standalone preview SPA, alternate route registry, or second session
model. This decision and the guardrails that prevent the duplicate runtime from
returning are recorded in
[`ADR 0006`](architecture/decisions/0006-single-platform-document.md).

The current browser program still contains fragment-based composition under
`apps/platform/client/legacy`. That directory name describes implementation
debt, not a second application. It is reduced in place as behavior moves into
typed owning domains. Every extraction should:

1. introduce a typed domain model and API adapter;
2. expose a typed page or controller from the owning domain;
3. expose it through `src/platform-shell/presentation` when the browser
   composition needs a stable import;
4. remove the equivalent fragment implementation;
5. lower an invariant or budget so the old ownership cannot return.

Legacy browser fragments under `src/platform-services` are transitional domain
assets, not a license to rebuild a central document renderer. They should be
replaced service by service.

The platform host uses an explicit HTML/style/module source contract. The
HTML shell is a static template; production hashes and compresses the style and
module sources directly, while development rewrites them for Vite. The server
does not generate a document containing inline source and then parse that
source back out. This decision is recorded in
[`ADR 0004`](architecture/decisions/0004-explicit-platform-source-assets.md).

## Domain ownership

Platform services mirror the product modes:

```text
src/platform-services/
  create-mode/
  configure-mode/
  develop-mode/
```

A service owns its API adapter, domain model, page/controller, styles, and
service-level tests. Cross-service UI belongs in `src/platform-ui`; shared
resource behavior belongs in `src/platform-resources`. A service must not reach
into another service's page internals.

Develop resources are resolved through the resource-definition and page
registries. Adding a resource type should be a registry addition backed by its
own service module, not a branch in a central page renderer.

## Thread and Runner architecture

The canonical thread model is an event projection:

```text
messages + runs + actions + permission requests + routing receipts
                            |
                            v
                  RunnerThreadProjection
                            |
          +-----------------+------------------+
          |                 |                  |
    conversation       live supervision    run details
      timeline              dock          and action tree
```

`src/react/thread` owns canonical thread presentation. The live supervision
dock remains mounted independently of historical timeline virtualization so a
pending permission cannot scroll out of reach.

`RunnerChat` remains a compatibility composition root while older execution
and composer flows are migrated. The governing decision and extraction rules
are recorded in
[`ADR 0002`](architecture/decisions/0002-runner-chat-composition-root.md).
Its extracted modules have explicit roles:

- `canonical-thread-surface.tsx`: canonical loading, reconnect, and timeline
  composition;
- `public-types.ts`: the stable compatibility contract exported by the
  composition root;
- `canonical-action-log-index.ts` and `turn-timeline-state.ts`: pure adapters
  from execution records to causal timeline presentation;
- `legacy-timeline.ts`: pure log grouping and causal timeline projection;
- `legacy-timeline-presentation.ts`: pure group presentation models;
- `use-thinking-status.ts`, `use-log-auto-scroll.ts`, and
  `use-thread-history-rail.ts`: independently tested viewport and live-status
  controllers;
- `use-composer-popup-controller.ts`: popup lifecycle, animation cleanup, and
  cross-composer exclusivity;
- `use-composer-quoted-selection.ts`: composer quote state and enter/exit
  lifecycle;
- `use-document-preview-controller.ts`: preview selection, external-open
  synchronization, resizing, global presentation state, and lifecycle
  callbacks;
- `use-file-browser-navigation.ts`: source switching, navigation history,
  selection isolation, preview targeting, and modal lifecycle;
- `use-file-browser-preview.ts`: connector/workspace preview loading,
  stale-response cancellation, and object-URL cleanup;
- `use-thread-feedback-controller.ts`: feedback hydration, optimistic ratings,
  stale-response protection, and grounded issue-report commands;
- `attachment-preview-chip.tsx`: attachment rendering and preview activation;
- `file-browser-dialog.tsx`: file-browser presentation;
- `workflow-dialogs.tsx`: report, fork, and edit-confirmation presentation;
- `execution/active-run-instruction.ts`: durable checkpoint delivery for
  instructions sent to an active worker;
- `communicator-router.ts`: deterministic control precedence and grounded
  communicator-versus-worker delivery;
- `editable-turn-boundary.ts`: canonical message identity for edit and fork
  truncation;
- `permission-decision.ts`: authenticated permission rulings and canonical
  turn reconciliation;
- `thread-context-action.ts`: lifecycle-safe context command transactions;
- `use-turn-notice-controller.ts`: synthetic communicator, voice, and context
  notice state.

`src/react/runner-log-boxes.tsx` is a compatibility facade. The renderer
dispatch point and specialized renderers live under
`src/platform-ui/components/thread-components/log-boxes/` and share types
through leaf contracts such as `log-entry-types.ts`. Preview contracts,
Markdown/media presentation, and the mounted thread style runtime are also
owned by thread components. Platform UI must not import the Runner
compatibility layer; former Runner entry points re-export platform-owned
implementations instead. This dependency rule is recorded in
[`ADR 0003`](architecture/decisions/0003-platform-ui-dependency-direction.md).

## Development and HMR

Run:

```bash
npm run dev
```

The development orchestrator starts the platform API on port `4177` and Vite on
port `5173`.

- Typed React modules use Vite React Fast Refresh.
- RunnerChat and shared source CSS update in place through the development
  asset bridge.
- Browser-composition or backend module changes trigger a full browser
  reload and, when required, a watched backend restart.
- HTML navigation on Vite's port redirects to the canonical application host;
  Vite does not own or serve another application document.
- Production still uses generated, content-hashed assets.

The old one-shot server process does not acquire HMR retroactively. Start the
development command once and leave it running while editing.

## Architectural budgets

`apps/platform/testing/platform-architecture.test.mjs` enforces:

- a small server composition root;
- bounded server route/gateway modules;
- bounded RunnerChat, log-renderer, and canonical-thread modules;
- required extracted seams;
- no reverse imports from RunnerChat leaf modules into the composition root;
- no platform UI imports from owning domains or Runner compatibility modules;
- bounded compatibility facades for platform-owned thread implementations;
- ordered, bounded thread feature styles backed by the shared HMR manifest;
- lint-clean RunnerChat leaf modules as part of the mandatory static gate;
- production HTML and compressed asset budgets;
- assembled browser JavaScript and CSS line budgets that only move downward as
  typed domain capabilities replace browser fragments;
- permanent absence of the retired standalone client sources, route/session
  registry, package export, and production artifacts;
- permanent removal of retired demo-server paths.

Run it directly with:

```bash
npm run platform:architecture-test
```

Budgets are ceilings, not design targets. When a module approaches a ceiling,
split by responsibility and lower the budget in the same change.

## Verification policy

At minimum, changes should run the closest domain test, both TypeScript
typechecks when frontend code is involved, and the architecture test when
ownership changes. Before release:

```bash
npm run check
```

Production deployment and user-facing server restarts are separate operational
actions; refactoring or verification does not imply either one.
