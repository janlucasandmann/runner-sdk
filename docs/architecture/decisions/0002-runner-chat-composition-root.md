# ADR 0002: Treat RunnerChat as a shrinking compatibility composition root

- Status: Accepted
- Date: 2026-07-17

## Context

`src/react/runner-chat.tsx` accumulated execution orchestration, hydration,
timeline projection, viewport lifecycle, attachment presentation, voice
control, and composer UI in one file. The platform still consumes its public
contract and generated compatibility runtime, so replacing it in one rewrite
would create unnecessary migration and regression risk.

At the same time, allowing new behavior to continue accumulating in the root
would make ownership ambiguous, prevent focused tests, and increase conflicts
between contributors working on long-running thread supervision.

## Decision

RunnerChat remains the compatibility composition root while responsibilities
move into bounded leaf modules under `src/react/runner-chat/`.

We enforce the migration with these rules:

1. Public compatibility contracts live in `public-types.ts` and remain
   re-exported by the root.
2. Pure domain and presentation transformations receive colocated unit tests.
3. Stateful lifecycle clusters move into hooks with explicit contracts.
4. Extracted presentation retains existing class names and callback semantics.
5. Leaf modules cannot import the composition root.
6. Every production leaf module stays below 1,000 lines.
7. The composition-root line budget only moves downward after extractions.
8. Shared log presentation belongs in
   `src/platform-ui/components/thread-components/`; the former Runner path is a
   compatibility facade only.

## Consequences

The platform can continue shipping compatibility behavior while individual
areas become testable, lint-clean, and independently owned. Contributors can
work in separate leaves with fewer merge conflicts, and architecture checks
prevent extracted logic from drifting back into the root.

The root is still larger than the desired end state. Remaining orchestration
must be migrated incrementally, and the compatibility facade cannot be removed
until all product consumers use the typed platform/thread surfaces directly.

## Verification

The decision is enforced by:

- `npm run lint`, which includes the complete RunnerChat leaf tree;
- `npm run platform:architecture-test`, which checks required seams, module
  sizes, dependency direction, and the root budget;
- `npm run test:unit`, which runs colocated extraction tests;
- `npm run build`, which verifies the compatibility export remains consumable.
