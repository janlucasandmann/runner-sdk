# Evaluation security and evidence contract

## Trust boundary

Evaluation datasets, candidate outputs, retrieved documents, tool output, and
grader output are untrusted data. They must not be interpreted as platform
instructions or executable code.

The supported grader types are:

- `exact`: deterministic normalized string comparison.
- `agent`: structured scoring by a separately configured evaluator agent.
- `code`: retained as a legacy data type, but unavailable until execution can be
  delegated to an isolated grader sandbox.

The browser and server must never execute evaluator source with `eval`,
`Function`, `vm` in the application process, or an equivalent mechanism. A
future code-grader executor must provide process and network isolation, an
allowlisted input/output contract, CPU and memory quotas, a wall-clock timeout,
read-only fixtures, no platform credentials, and an auditable image digest.

## Case outcome taxonomy

Case status is evidence, not decoration:

| Status | Meaning | Included in quality metrics |
| --- | --- | --- |
| `passed` | Valid score at or above the threshold | Yes |
| `failed` | Valid score below the threshold | Yes |
| `completed` | Legacy terminal case with a valid score | Yes |
| `invalid` | Case cannot be scored because its contract is incomplete | No |
| `grader_error` | Grader did not produce a valid score | No |
| `infrastructure_error` | Platform execution failed | No |
| `cancelled` | Execution was cancelled | No |
| `error` | Legacy infrastructure failure | No |

`averageScore` and `passRate` are calculated over `scoredCount`, never
`totalCount`. If no case is scoreable, both metrics are `null` and the run fails.
If valid scores and terminal case problems coexist, the run is
`completed_with_errors` rather than appearing fully successful.
Runs also expose `invalidCount`, `graderErrorCount`,
`infrastructureErrorCount`, `cancelledCount`, and `unscoredCount`.

## Reproducibility

Every newly created run records SHA-256 fingerprints for:

- the complete normalized dataset;
- the selected case subset and optimization roles;
- the evaluator configuration;
- the target system snapshot (agent version, guardrail, environment, project);
- the composite run contract.

Fingerprints use stable key ordering and exclude run IDs, labels, and timestamps.
Two equivalent contracts therefore produce the same fingerprints. A change to
expected output, guidance, evaluator, selected split, target version, or
guardrail changes the corresponding fingerprint.

The credential-free `evaluation_system_snapshot_v1` records pinned agent and
environment references plus:

- hashes of agent configuration and instructions;
- model and sampling contracts;
- sorted skill and tool identities with configuration hashes;
- guardrail and environment snapshot hashes;
- environment revision/image digests when the resource adapter exposes them;
- the evaluation runtime contract version.

Secret-, credential-, session-, cookie-, and token-shaped properties are
removed before hashing or persistence. The snapshot includes completeness flags
so a release policy can distinguish a fully resolved contract from a
reference-only run. Fingerprints identify configuration; they do not make a
nondeterministic model run deterministic.

Agent graders have their own independently pinned agent-version reference and
credential-free system snapshot. Evaluator threads receive the evaluator
version—not the candidate version—and the evaluator fingerprint covers that
version and snapshot. This prevents an apparently identical comparison from
silently changing its judge.

## Durable execution and recovery

The platform database is the source of truth for a run. Before execution starts,
the runtime persists a credential-free `evaluation_execution_snapshot_v1`
containing the normalized dataset rows, evaluator contract, pinned target
references, resolved system contract, and guardrail snapshot required to resume
the run.

Execution ownership uses a database-backed lease:

- acquisition is atomic and limited to queued or running runs;
- the lease has an opaque token, expiry, heartbeat, and monotonic attempt;
- active-run writes are fenced by the matching owner and token;
- the token is never included in public run projections;
- terminal workers release the lease, while abandoned leases expire.

Each case checkpoints before and after external side effects. Hidden case and
evaluator threads carry the run/case/kind identity. During recovery the runtime
locates an already-created thread when its ID was not checkpointed, checks for
the exact persisted user message, and observes that execution instead of
re-sending it. Terminal cases are skipped.

This provides safe resumption after a process restart. The platform's durable
execution dispatcher is browser-independent: PostgreSQL is the queue
authority, a signed worker assertion acquires a bounded claim, and the worker
holds only the claim-scoped workload credential while it wakes the run.

Control-plane-created runs use
`computer_agents_evaluation_run_binding_v1`. The worker hydrates the exact
published cases and pinned Agent/environment snapshot from that binding, runs
each canonical case once, and reports the strict per-case result contract. It
does not calculate authoritative aggregate metrics or author provenance.
The control API derives metrics, validates the active claim, emits the
verified-worker attestation, signs evidence when configured, and appends the
audit-ledger event.

Queue delivery remains at least once. The dispatch claim and the resource lease
are independent fences: the former limits workload credentials and retry
ownership, while the latter prevents stale workers from writing a run.

## Publication gate

Downstream optimizers and release gates must reject:

- runs with zero scored cases;
- runs containing invalid, grader-error, infrastructure-error, or cancelled
  cases;
- runs whose dataset, case-selection, or evaluator fingerprint differs from the
  comparison contract;
- incomplete or active runs.

Baseline and candidate system fingerprints are retained separately and are
expected to differ when the candidate changes. The optimizer constrains that
difference to the versioned candidate snapshot; it must not treat unequal
system fingerprints as an evaluator-contract mismatch.

Leased writes with a stale token are rejected. Operational failures and
unmatched comparison cases remain visible and are never imputed as score zero.

Failure evidence remains visible for diagnosis but cannot silently lower or
improve an agent quality score.

## Evidence shown in the product

The Evaluation detail page treats provenance as a first-class state rather than
an informational badge. Its centralized evidence card and sidebar disclose:

- verified worker, self-reported, legacy, invalid, or pending provenance;
- release eligibility and the reason an artifact is ineligible;
- the canonical evidence fingerprint;
- worker attestation and pinned target fingerprints;
- Google Cloud KMS signature state, key version, and algorithm.

The UI never upgrades an envelope from `kms_signed` to cryptographically
verified itself. Cryptographic verification belongs to the control API and is
repeated by Assurance before a signed release gate can pass.

Legacy runs are read-only and non-release evidence. The supported remediation
is an explicit rerun against the immutable version through the durable
dispatcher.
