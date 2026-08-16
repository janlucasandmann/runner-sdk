# Tests service

Tests is the platform verification service for deployable software components
and agentic workflows.

It owns:

- strict, versioned test plans;
- durable test runs dispatched to Computer Agents environments;
- case-level results, logs, screenshots, traces, reports, and evidence
  fingerprints;
- project, task, release, commit, environment, and executor links;
- team access and permission policy;
- Mission Control handoff metadata.

Tests does not replace Evaluations. Tests answer “does the component or workflow
work and satisfy its engineering contract?” Evaluations answer “how well does
the agent or workflow behave on a representative dataset?” Agent Optimization
uses Evaluation evidence after the software and workflow Test gates pass.

## Execution boundary

The control API persists plans, versions, leases, results, artifacts, and
dispatch state. At run time, each enabled case is routed independently:

- readiness, Computer Agents Function, Metronome workflow, and supported
  service-topology cases execute through deterministic platform adapters;
- command, browser, integration, security, custom, and other agent-guided
  cases execute in a selected Computer Agents environment through a hidden
  executor thread;
- a plan containing both kinds is a hybrid run. It keeps one immutable plan
  snapshot while merging ordered results from both executors.

User commands never execute in the platform web process or control API.
Deterministic adapters accept only their typed, allowlisted request contracts
and cannot carry an arbitrary command.

Test Plans intentionally have no implicit setup or teardown commands. Any
preparation or cleanup that is part of the verification contract must be an
explicit, observable Test Case with its own result and evidence.

## Lifecycle

```text
draft plan -> published version -> queued run -> leased execution
           -> case evidence -> passed | failed | completed_with_errors
```

Each run records the exact plan fingerprint and optional commit SHA. Terminal
evidence is fingerprinted by the control API after case results and the
artifact manifest are persisted. Evidence also carries an explicit per-case
provenance classification. Hidden-thread results are self-reported. Function,
workflow, and topology results are captured directly by the runner, but are not
presented as independently attested. Only the built-in readiness contract is
currently eligible for an execution-worker attestation that can satisfy a
trusted Assurance gate. The control API validates that attestation against the
active dispatch lease and credential plus the exact immutable plan, commit,
results, and artifacts.

## Test Case authoring

The Test Case detail screen provides two synchronized views over one draft:

- **General** is the target-aware builder and includes the case category,
  lifecycle, executor, timeout, retries, tags, environment variables, and
  secret references.
- **Code** exposes the complete case definition through the centralized editor
  as `case.json`, `execution.json`, `request.json`, `assertions.json`, and
  `environment.json`.

Each persisted `TestCaseDefinition` field has one canonical file owner. A valid
code edit updates the General form immediately; a General edit updates the
corresponding file. Invalid JSON remains in the editor as an unsaved draft and
blocks saving without replacing the last valid structured definition.

## Access control

The Settings tab uses the centralized resource-access page. It always exposes
the `All Agents` and `All Organization Members` system principals alongside
explicit team shares. Organization and team role pages configure seven
Test-specific capabilities:

- view the Test Plan;
- inspect run evidence;
- run tests;
- manage the plan definition;
- create and publish versions;
- manage access;
- delete the plan.

Opening a principal switches from the ordinary Test Plan sidebar to the shared
role sidebar. The same permission metadata is persisted on the live plan and
enforced by the Tests API per operation; immutable versions do not capture
mutable access policy.

## Mission Control

Mission Control is expected to create an explicit build → test → evaluation →
optimization dependency chain. Test work links back to project, task, release,
and acceptance criteria; a passing Test run is engineering evidence, not an
Evaluation score.
