# Agent Optimization model

## Product boundary

Agent Optimization currently improves a versioned agent instruction snapshot
from evaluation evidence. It creates draft agent versions and can publish only
through the configured publication policy. It does not train foundation-model
weights.

The historical `fine-tuning` route, API paths, database fields, and internal
identifiers remain stable compatibility aliases. New product copy and
documentation use Agent Optimization.

## Split policy

Evaluation cases have one of three roles:

- `train`: input, expected output, rubric, and scored failure evidence may be
  shown to the optimizer.
- `validation`: expected output and rubric remain hidden; aggregate and
  sanitized failure patterns may be used for candidate selection.
- `holdout`: the case is excluded from baseline optimization evidence,
  optimizer inputs, and candidate-selection runs.

Before candidate publication, the orchestrator evaluates both the original
agent version and the selected candidate on the sealed holdout. This produces a
paired, like-for-like final comparison without leaking holdout evidence into
optimization. The original holdout baseline is created only after optimization
has finished.

The orchestrator passes redacted dataset and run snapshots to the optimizer
prompt builder. Holdout rows and holdout run cases are removed before that
boundary rather than relying only on prompt instructions.

## Evidence gate

An optimization evaluation is not scoreable if:

- it has no scored cases;
- any selected case is invalid;
- a grader fails;
- infrastructure execution fails;
- execution is cancelled.

Such a run stops optimization instead of converting the problem into a zero
quality score.

Candidate decisions combine absolute quality targets with paired statistical
evidence. Baseline and candidate trials are matched by dataset row and repeat,
repeated trials are aggregated within row, and deterministic paired bootstrap
intervals are calculated for score and pass-rate deltas. Promotion requires:

- configured paired coverage and minimum paired row count;
- confidence-bound non-inferiority for score and pass rate;
- the configured minimum improvement at the lower confidence bound when the
  target claims an improvement;
- sufficient evidence and non-regression for every required slice.

Teams can also configure maximum relative increases in cost per scored case and
average case latency. These gates compare the independently executed baseline
and candidate runs. Cost is accepted as release evidence only when the
evaluation reports usage-derived provenance, and latency is accepted only when
every scored case has a measured duration. A configured limit fails closed when
either side is missing evidence. Multi-evaluation aggregates are weighted by
their scored-case counts rather than averaging unequal runs.

The default policy requires 10 paired dataset rows overall and 5 paired rows in
each required slice. A hard floor of 2 rows prevents legacy policy values from
treating a one-case comparison as statistical proof. Teams should increase
these defaults for heterogeneous or high-risk production workloads.

Each iteration stores its case comparison, statistical comparison, normalized
gate policy, cost/latency evidence, and complete decision evidence. The Agent
Optimization details page exposes the statistical, cost, and latency gate
outcomes. An aggregate improvement cannot hide a regression in a required
safety slice or exceed an explicitly configured efficiency budget.

## Publication control

Publication is server-controlled. The browser never creates or publishes an
agent version as a side effect of opening or hydrating an optimization job.
Manual mode leaves the independently verified candidate as a draft in
`awaiting_review`. An authorized reviewer can use **Approve & Publish**; the
browser submits the evidence fingerprint but never calls the agent-version
publish API. The backend atomically binds the authenticated reviewer to the
still-current fingerprint and moves the job into resumable server-side
publication. `auto_on_target` may publish only when the release gate accepts
the candidate and the configured target is met.

Every terminal job stores an
`agent_optimization_publication_decision_v1` record. It identifies the
candidate and iteration, records whether publication is pending or approved,
names the versioned policy/actor, and binds the decision to a SHA-256 evidence
fingerprint. The approved record is persisted before the external publish
operation. Evidence schema v2 covers the candidate snapshot, evaluation target
versions and policies, baseline and candidate metrics, paired comparisons, and
cost/latency decisions. A stale review or any post-review evidence mutation is
rejected. If publishing is interrupted, the approved `publishing` phase resumes
under the durable job lease without rerunning optimization.

## Durable orchestration and recovery

The platform database is the source of truth for optimization jobs. The
versioned orchestration envelope persists configuration, iterations, evaluation
references, events, cost entries, deadlines, and failure diagnostics.

Execution ownership is protected by a database-backed lease:

- acquisition is atomic for active jobs;
- every lease has an opaque fencing token, expiry, heartbeat, and monotonic
  attempt number;
- active-job writes require the matching owner and token;
- the public job response exposes lease health but never the token;
- a stale worker cannot overwrite a takeover or revive a cancelled job.

Steps use stable identities where they cross an external side-effect boundary.
Evaluation runs have deterministic IDs, candidate agent versions have stable
candidate keys, and optimizer threads carry job/iteration metadata. On recovery
the runtime finds an existing optimizer thread, observes an already-dispatched
prompt, and reuses a matching candidate version instead of creating duplicates.

An authenticated request can therefore resume an abandoned active job after its
lease expires. Fully unattended recovery still requires an external durable
dispatcher or scheduled sweeper to wake a runtime when no user is polling.

## Compatibility and migration

Do not rename existing route IDs, CSS namespaces, persisted `fineTuning*`
properties, or `/fine-tuning` endpoints without a separately versioned data and
API migration. New aliases can be added incrementally. Read paths must continue
to accept historical records.

## Next production milestones

1. Add an external durable dispatcher with scheduled lease-expiry sweeps,
   operational retry classification, dead-letter handling, and worker
   observability.
2. Make complete provider revision, tool build, skill version, and environment
   image-digest evidence mandatory for production promotion once every runtime
   adapter exposes those values. The current snapshot records and fingerprints
   them when available and reports completeness explicitly.
3. Calibrate organization-level cost and latency defaults and add historical
   efficiency trend dashboards; per-job limits are already supported.
4. Add organization-level approval policies such as required reviewer roles,
   optional two-person approval, and review-expiry windows.
5. Add a separate sandbox executor before enabling legacy code evaluators.
