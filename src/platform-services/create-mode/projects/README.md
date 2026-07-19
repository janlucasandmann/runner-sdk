<!-- platform-directory-guide:v1 -->

# Projects service

## Purpose

`src/platform-services/create-mode/projects` is the ownership boundary for the platform
Projects experience.
`apps/platform/server/index.mjs` composes the service, but does not own its domain behavior.

## Structure

- `catalog.mjs` contains the immutable project-type catalog and lookup helpers.
- `client/domain-foundation.mjs` defines project/task constants that must be
  available before dependent browser fragments initialize.
- `client/domain-runtime.mjs` owns project, task, release, sprint, and Mission
  Control normalization and presentation helpers. Calendar-owned fragments are
  composed through `src/platform-services/create-mode/calendar`.
- `client/integrations/` owns the small project contracts consumed by other
  platform surfaces: task markdown, connector restore state, status items,
  project permissions, and project-linked file indexes.
- `client/page-runtime.mjs` composes the Projects/Tasks React surface from the
  focused state, data, action, connector, and view fragments in `client/page/`.
- `client/overview/` separates the project overview charts and UI runtime from
  its styles.
- `client/styles/` contains cascade-preserving project style fragments;
  `client/styles.mjs` is their public composition boundary.
- `server/routes.mjs` owns project, task, release, sprint, cost, skill, and
  trigger route matching. Schedule routes belong to the Calendar service.
- `server/resource-index.mjs` owns project resource aggregation.
- `server/task-upstream.mjs` owns task API routing and cloud fallback behavior.
- `server/task-backlog.mjs` owns task-start execution and stateful ephemeral
  backlog composer sessions.

## Host boundary

`apps/platform/server/index.mjs` is now a composition root. It may mount the Projects page,
pass callbacks to it, and provide generic authentication, transport, binary
file, and JSON response adapters. Project domain behavior, project HTTP route
matching, task execution semantics, and project-owned UI implementations belong
in this directory. Cross-service consumers (for example Files assigning an
attachment to a project) remain explicit integration points in the host.

The client runtime is currently exposed as ordered script fragments consumed by
the single platform document. Keeping those fragments behind this boundary
preserves browser behavior while allowing the project service to evolve
independently of the host and toward typed page composition.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run projects-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
