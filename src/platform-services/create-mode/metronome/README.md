<!-- platform-directory-guide:v1 -->

# Metronome service

## Purpose

`src/platform-services/create-mode/metronome` is the ownership boundary for the platform
Metronome experience. `apps/platform/server/index.mjs` composes the service, but no longer owns
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
- `client/shell/` owns the Metronome state and behavior mounted inside the
  shared platform browser composition: lifecycle, run loading, trace rendering,
  sidebar grouping, run actions, team-share serialization, and top-nav
  controls.
- `server/routes.mjs` owns `/api/real/metronomes` route matching and upstream
  path translation.
- `server/index.mjs` exposes the service factory consumed by the host.

## Host boundary

`apps/platform/server/index.mjs` is now a composition root. It may mount the Metronome page,
provide authentication/transport adapters, and connect Metronome to shared
surfaces such as Threads, Teams, Calendar, Projects, and Resource Templates.
Metronome workflow behavior, run supervision, page rendering, and HTTP route
matching belong in this directory.

The single platform document still composes ordered Metronome script and style
fragments. This preserves the existing evaluation order while making ownership
explicit and allowing typed modules to replace compatibility fragments without
moving domain code back into the host.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run metronome-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
