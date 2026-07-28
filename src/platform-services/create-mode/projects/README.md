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

Mission Control first uses the read-only Computer Agents
`projects delivery preview` command and only then uses
`projects delivery apply` for deployable and agentic projects. Preview returns
the normalized contract, topology, stage graph, evidence-service summary,
repair scope, and budget without persisting anything. Apply submits the exact
unchanged strict
`computer_agents_project_delivery_contract_v3` document; the platform API then
provisions the deterministic
`build -> test -> evaluate -> optimize -> re_evaluate -> acceptance_evaluate -> assure -> deliver`
graph and binds its Function, Metronome, pinned Guardrail versions, Test
Plan/version, component Evaluation/version and immutable dataset asset,
optional independent workflow-acceptance Evaluation/version and dataset asset,
planned Agent Optimization job, Assurance Policy/version, and dependency-linked
tasks atomically.

Uploaded CSV, JSON, JSONL, and NDJSON benchmarks are imported through the
standalone Evaluations service before the contract is applied. The resulting
Evaluation ID, published version ID, and dataset-asset ID are pinned as the
contract's component or workflow-acceptance Evaluation source. Component
optimization and whole-workflow acceptance use independent immutable Evaluation
versions. The importer retains source bytes by hash and addresses CSV fields by
physical column position, including duplicate headers. Projects and Mission
Control do not own or copy Evaluation datasets.

When Agent Optimization feeds whole-workflow acceptance, that acceptance target
is a Metronome-entrypoint service topology containing the exact target Agent.
The published candidate Agent version is pinned into both Evaluation evidence
and Metronome execution. The Metronome must invoke that Agent by exact ID; a
successful graph path that never uses the candidate fails closed.

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

Retryable failed stages receive a new immutable attempt while prior evidence
and audit history remain visible. Optimization failures require a revised
contract. Manual Assurance approval is performed against the exact current
evidence fingerprint and is never delegated to Mission Control.

An optional `repairPolicy` lets the delivery supervisor turn a trusted failed
Test gate, or a fully verified completed Evaluation that missed its quality
threshold, into a bounded repair episode. The supervisor creates a dedicated
repair ticket carrying the immutable diagnostic fingerprint, dispatches the
execution Agent, requires a changed revision for an allowed target resource,
reruns the pinned Test Plan, and then reruns the affected component or
whole-workflow Evaluation. Infrastructure errors, partial evidence, failed
attestation or signatures, and changed resources outside the diagnostic scope
fail closed. Test definitions, Evaluations, datasets, graders, Guardrails, and
release thresholds cannot be changed by the repair episode.
The component `evaluate` stage is an optimization baseline and therefore cannot
also be configured as repairable while Agent Optimization is enabled.

## Full Auto relationship

Full Auto is the durable Projects-level coordinator. It orders eligible project
tasks, creates task-agent sessions, follows authoritative thread completion,
and pauses, resumes, retries, or cancels safely. It does not implement
Functions, Metronomes, Tests, Evaluations, Agent Optimization, Guardrails, or
Assurance. Those services remain independently callable and retain their own
versioning, permissions, execution, audit, and evidence boundaries.

Mission Control turns project intent into the strict delivery contract and
canonical dependency graph. Full Auto can initiate and monitor that plan, but
only the delivery supervisor may advance its evidence-gated stages. This keeps
Projects useful as a composition surface without making any lower-level service
depend on Projects or Mission Control.

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
