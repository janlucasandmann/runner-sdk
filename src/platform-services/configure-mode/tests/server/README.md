# Tests server

The Tests server adapter owns two boundaries:

- `/api/real/test-plans*` is the authenticated platform proxy for the canonical
  control API.
- `runs.wake(request, runId)` is the runner-owned execution entry point used by
  the shared durable dispatch queue.

User-authored test commands never run in the platform or control-API process.
For general plans, the runtime starts a hidden, project-bound Computer Agents
thread in the selected environment, executes the immutable published plan
snapshot, requires a strict `test_run_json` result, and persists case evidence
while holding a fenced run lease.

The plan contract contains only explicit cases; it has no setup or teardown
lifecycle commands. Preparation and cleanup must therefore be represented as
ordinary cases and receive the same result and evidence treatment.

The hidden thread authors the structured result, so this execution path is
explicitly labeled `self_reported` and `unverified`. It must not be presented as
independently trusted release evidence. Trusted evidence requires a separate
control-plane execution worker that can attest the exact canonical result and
artifact fingerprints; callers cannot upgrade trust through metadata.

The runner includes one narrowly allowlisted deterministic contract:
`kind=contract` with `request.target=control_plane_readiness`. When every enabled
case uses that target, the durable worker checks the canonical `/ready` endpoint
directly without an LLM, environment, or user command. The backend accepts
verified-worker provenance only when it can independently bind the terminal
report to the still-active dispatch lease, short-lived workload credential,
worker assertion, plan/version fingerprint, commit, environment, result set,
and artifact set. Any other contract target follows the unverified thread path.

Execution credentials are short-lived and dispatch-scoped. The control API
further constrains them to the selected plan, run, environment, project,
executor agent discovery, and hidden thread routes.
