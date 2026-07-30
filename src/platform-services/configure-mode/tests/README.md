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
dispatch state. The runner executes the immutable plan snapshot inside a
selected Computer Agents environment through a hidden executor thread. User
commands never execute in the platform web process or control API. A narrowly
allowlisted built-in `control_plane_readiness` contract is executed directly by
the durable platform worker; it checks only the canonical readiness endpoint
and cannot carry a user command.

## Lifecycle

```text
draft plan -> published version -> queued run -> leased execution
           -> case evidence -> passed | failed | completed_with_errors
```

Each run records the exact plan fingerprint and optional commit SHA. Terminal
evidence is fingerprinted by the control API after case results and the
artifact manifest are persisted. Evidence also carries an explicit provenance
classification. The current hidden-thread executor is self-reported; only an
independently verified execution-worker attestation can satisfy a trusted
Assurance gate. The built-in readiness contract supplies that attestation, and
the control API validates it against the active dispatch lease and credential
plus the exact immutable plan, commit, results, and artifacts.

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
