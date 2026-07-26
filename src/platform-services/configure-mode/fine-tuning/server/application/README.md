<!-- platform-directory-guide:v1 -->

# Agent Optimization Application

## Purpose

This directory coordinates one resumable Agent Optimization job across
evaluation, optimizer, candidate-version, verification, and promotion
boundaries. It contains application orchestration, while pure policy and record
normalization remain in the sibling domain directory.

## Contents

- [`job-orchestrator.mjs`](job-orchestrator.mjs) — Executes the checkpointed
  optimization state machine through injected side-effect adapters.
- [`job-orchestrator.test.mjs`](job-orchestrator.test.mjs) — Covers holdout
  isolation, recovery, resumable human-approved publication, budgets,
  statistical and efficiency gates, and slice regressions.

## Working in this directory

Every external side effect must have a stable identity and a durable checkpoint.
Keep holdout contents outside optimizer inputs, treat infrastructure and grader
failures as unscored failures, and delegate promotion decisions to the
versioned statistical policy. New provider calls belong behind injected
adapters so orchestration can be recovered and tested deterministically.

## Verification

Run the focused checks from the repository root:

```bash
npm run fine-tuning-service-test
node --test src/platform-services/configure-mode/fine-tuning/server/application/job-orchestrator.test.mjs
```

## Related documentation

- [Server directory guide](../README.md)
- [Optimization model](../../OPTIMIZATION_MODEL.md)
- [Evaluation statistical methodology](../../../evaluations/STATISTICAL_METHODOLOGY.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
