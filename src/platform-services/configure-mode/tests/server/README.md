# Tests server

The Tests server adapter owns two boundaries:

- `/api/real/test-plans*` is the authenticated platform proxy for the canonical
  control API.
- `runs.wake(request, runId)` is the runner-owned execution entry point used by
  the shared durable dispatch queue.

Test commands never run in the platform or control-API process. The runtime
starts a hidden, project-bound Computer Agents thread in the selected
environment, executes the immutable published plan snapshot, requires a strict
`test_run_json` result, and persists case evidence while holding a fenced run
lease.

The hidden thread authors the structured result, so this execution path is
explicitly labeled `self_reported` and `unverified`. It must not be presented as
independently trusted release evidence. Trusted evidence requires a separate
control-plane execution worker that can attest the exact canonical result and
artifact fingerprints; callers cannot upgrade trust through metadata.

Execution credentials are short-lived and dispatch-scoped. The control API
further constrains them to the selected plan, run, environment, project,
executor agent discovery, and hidden thread routes.
