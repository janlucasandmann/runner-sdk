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
- `client/domain-runtime.mjs` owns project, task, milestone/release, sprint, and
  Mission Control normalization and presentation helpers. Milestones are the
  canonical project delivery target and own their measurable success criteria;
  legacy strategy outcomes are read only as migration fallbacks. An authoritative
  Mission Control result replaces that legacy strategy branch after migrating its
  useful content into milestones. Calendar-owned fragments are composed through
  `src/platform-services/create-mode/calendar`.
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

## Canonical project delivery

Mission Control uses the Computer Agents `projects delivery apply` command for
deployable and agentic projects. It submits one strict
`computer_agents_project_delivery_contract_v1` document; the platform API then
provisions the deterministic
`build -> test -> evaluate -> optimize -> re_evaluate -> assure -> deliver`
graph and binds its Function, Metronome, Test Plan/version,
Evaluation/version, planned fine-tuning job, Assurance Policy/version, and
dependency-linked tasks atomically.

The client proxies the delivery-plan GET, PUT, and provision routes before the
generic project-detail route. Canonical `deliveryContract` and `deliveryPlan`
metadata is retained during Mission Control autosave. The legacy
`deliveryAssurance` object is a read/UI projection and is never release
authority; only the bound Assurance Run can unlock the final delivery task.

The server-owned delivery supervisor is the sole delivery stage-transition
authority. The Projects client projects its latest execution, polls canonical
execution state while Mission Control is visible, and never reconstructs stage
state from task status. Supervisor-dispatched build and delivery tasks use the
canonical task runner, so their threads also appear in the durable project
agent-session ledger with delivery execution and stage correlation.

## Work graph and agent runs

The project work graph endpoint is the canonical read model for tasks, typed
relations, and task-agent sessions. Blockers and parent-child hierarchy retain
legacy task-field projections for mixed-version compatibility. Thread state is
the execution source of truth and atomically advances its linked task-agent
session through queued, active, paused, and terminal states.

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
