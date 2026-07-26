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
commands never execute in the platform web process or control API.

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
Assurance gate.

## Mission Control

Mission Control is expected to create an explicit build → test → evaluation →
optimization dependency chain. Test work links back to project, task, release,
and acceptance criteria; a passing Test run is engineering evidence, not an
Evaluation score.
