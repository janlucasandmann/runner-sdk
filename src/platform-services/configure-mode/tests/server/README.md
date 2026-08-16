# Tests server

The Tests server adapter owns two boundaries:

- `/api/real/test-plans*` is the authenticated platform proxy for the canonical
  control API.
- `runs.wake(request, runId)` is the runner-owned execution entry point used by
  the shared durable dispatch queue.

User-authored test commands never run in the platform or control-API process.
The runtime partitions the immutable published plan by case. Supported typed
contracts execute directly through the durable worker; all other cases are
sent to one hidden, project-bound Computer Agents thread in the selected
environment. Hybrid plans merge both result streams back into the original
plan order while holding one fenced run lease. The thread path requires a
strict `test_run_json` result.

The plan contract contains only explicit cases; it has no setup or teardown
lifecycle commands. Preparation and cleanup must therefore be represented as
ordinary cases and receive the same result and evidence treatment.

The hidden thread authors the structured result, so this execution path is
explicitly labeled `self_reported` and `unverified`. It must not be presented as
independently trusted release evidence. Trusted evidence requires a separate
control-plane execution worker that can attest the exact canonical result and
artifact fingerprints; callers cannot upgrade trust through metadata.

The runner includes four narrowly typed deterministic targets:

- `control_plane_readiness` checks the canonical `/ready` endpoint;
- `computer_agents_function` invokes one owned Function method and safe path;
- `metronome_workflow` starts one workflow, optionally pinned to a version, and
  waits for its terminal output;
- `service_topology` executes an ordered list of the preceding contracts (or a
  bound Function/Metronome entrypoint) with structured assertions.

These adapters run without an LLM, environment, or user command. Their evidence
is runner-captured. The backend accepts `verified_worker` provenance only for
eligible readiness evidence when it can independently bind the terminal report
to the active dispatch lease, short-lived workload credential, worker
assertion, plan/version fingerprint, commit, result set, and artifact set.
Function, workflow, and topology evidence must not be labeled independently
attested merely because it used a deterministic adapter.

Execution credentials are short-lived and dispatch-scoped. The control API
further constrains them to the selected plan, run, environment, project,
executor agent discovery, and hidden thread routes.
