<!-- platform-directory-guide:v1 -->

# Runner execution controllers

## Purpose

This directory contains execution behavior for the owning feature for RunnerChat. It must not import the RunnerChat composition root.

## Contents

- [`active-run-instruction.test.ts`](active-run-instruction.test.ts) — Regression coverage for Active Run Instruction.
- [`active-run-instruction.ts`](active-run-instruction.ts) — Focused implementation of Active Run Instruction.
- [`external-run-request.test.ts`](external-run-request.test.ts) — Regression coverage for External Run Request.
- [`external-run-request.ts`](external-run-request.ts) — Focused implementation of External Run Request.
- [`page-queue-receipt.tsx`](page-queue-receipt.tsx) — Presentation composition for Page Queue Receipt.
- [`queued-execution.test.ts`](queued-execution.test.ts) — Regression coverage for Queued Execution.
- [`queued-execution.ts`](queued-execution.ts) — Focused implementation of Queued Execution.
- [`thread-run-executor.test.ts`](thread-run-executor.test.ts) — Regression coverage for Thread Run Executor.
- [`thread-run-executor.ts`](thread-run-executor.ts) — Focused implementation of Thread Run Executor.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run thread-ui-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
