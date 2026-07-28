<!-- platform-directory-guide:v1 -->

# Durable execution dispatcher

## Purpose

This directory owns the platform worker that resumes Test runs, Evaluation
runs, Agent Optimization jobs, and scoped Mission Control build/handoff tasks
independently of browser requests. PostgreSQL in the control API is the queue
authority; this process only claims, heartbeats, executes, and settles work.

## Trust model

- Worker calls use a 60-second `ComputerAgentsWorker` JWT signed with
  `PLATFORM_CONTROL_PLANE_SECRET`.
- Each claim returns one short-lived workload API key. The runner keeps it only
  in the active call stack and never serializes it into platform state or logs.
- The control API restricts that key to execution routes and revokes it when the
  dispatch is settled or expires.
- Queue delivery is at least once. Evaluation and optimization resource leases
  remain the final write fence.
- Project delivery task claims can run and update only their exact task. Their
  model response is rejected unless it carries closed-schema build or handoff
  evidence bound to the managed topology resources or passed Assurance Run.
  Existing resources, pinned versions, source assets, and Guardrails are
  verified authoritatively by the control plane rather than duplicated in
  model-authored evidence.

## Runtime behavior

`dispatcher.mjs` polls with bounded concurrency, renews claims during execution,
recovers transient blocking-request failures through idempotent replay, and
acknowledges terminal work.
`worker-assertion.mjs` owns the internal signed-identity contract. The worker
starts after the platform HTTP server is listening, allowing optimization jobs
to invoke local Evaluation endpoints safely.

Configuration:

| Variable | Default |
| --- | --- |
| `ENABLE_EXECUTION_DISPATCHER` | enabled when the control-plane secret is valid |
| `EXECUTION_DISPATCH_CONTROL_ORIGIN` | `RUNNER_UPSTREAM_ORIGIN` without `/v1` |
| `EXECUTION_DISPATCH_WORKER_ID` | hostname and process-derived identity |
| `EXECUTION_DISPATCH_POLL_INTERVAL_MS` | `2000` |
| `EXECUTION_DISPATCH_HEARTBEAT_INTERVAL_MS` | `25000` |
| `EXECUTION_DISPATCH_LEASE_TTL_MS` | `120000` |
| `EXECUTION_DISPATCH_BATCH_SIZE` | `4` |
| `EXECUTION_DISPATCH_MAX_CONCURRENCY` | `4` |

Explicitly enabling the worker without a secret of at least 32 bytes fails
startup. Production control origins must use HTTPS; loopback HTTP is permitted
for a co-located control API.

## Working in this directory

Keep queue state and retry policy in the control API. This directory may own
worker identity, polling, heartbeats, and service wake-up only. Never add
browser cookies, session credentials, raw workload-key logging, or durable
worker-local claim storage. Changes to claim fields or outcomes must update the
control API contract, OpenAPI document, and both sides' tests together.

## Verification

```bash
node --test apps/platform/server/execution-dispatch/dispatcher.test.mjs
node --test apps/platform/server/execution-dispatch/project-delivery-task.test.mjs
node --test apps/platform/server/platform-config.test.mjs
```

## Related documentation

- [Platform host](../README.md)
- [Evaluations runtime](../../../../src/platform-services/configure-mode/evaluations/server/README.md)
- [Agent Optimization runtime](../../../../src/platform-services/configure-mode/fine-tuning/server/README.md)
