# Metronome service

`src/platform-services/create-mode/metronome` is the ownership boundary for the platform
Metronome experience. `demo-server.mjs` composes the service, but no longer owns
its page implementation, workflow domain, run supervision UI, or HTTP routing.

## Structure

- `client/runtime/` contains trigger contracts, workflow graph/domain helpers,
  execution helpers, code-mode behavior, and canvas components.
- `client/page/` contains the Metronome React surface, split into the shell,
  controller, overview, inspector, editor, and modal fragments.
- `client/styles/` contains cascade-preserving overview, editor, inspector,
  runs, and modal style fragments.
- `client/integrations/` owns the shared shell contracts for Metronome thread
  metadata, run summaries, sidebar presentation, drawers, and trace styling.
- `client/shell/` owns the Metronome state and behavior mounted inside the shared
  demo application: lifecycle, run loading, trace rendering, sidebar grouping,
  run actions, team-share serialization, and top-nav controls.
- `server/routes.mjs` owns `/api/real/metronomes` route matching and upstream
  path translation.
- `server/index.mjs` exposes the service factory consumed by the host.

## Host boundary

`demo-server.mjs` is now a composition root. It may mount the Metronome page,
provide authentication/transport adapters, and connect Metronome to shared
surfaces such as Threads, Teams, Calendar, Projects, and Resource Templates.
Metronome workflow behavior, run supervision, page rendering, and HTTP route
matching belong in this directory.

The browser application is currently emitted as one inline module. The client
modules therefore expose compiled script and style fragments. This preserves
the existing evaluation order while making ownership explicit and allowing a
future bundled-client migration without moving domain code back into the host.
