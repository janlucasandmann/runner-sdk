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
9. Cross-instance UI lifecycle belongs in a controller hook rather than in
   ad-hoc composition-root effects.
10. Remote file-browser source caches and request lifecycles remain separate
    from navigation state and presentation so transport changes do not require
    editing the dialog tree.
11. Persisted and controlled workspace selection is one state machine owned by
    a controller, rather than a set of independent effects in the composition
    root.
12. Mutually exclusive composer commands use one atomic controller state so a
    transition cannot leave stale command modes active.
13. Attachment construction is transport-aware domain logic in a tested leaf.
14. Attachment state, preview cleanup, upload deduplication, GitHub
    preparation, and execution-payload resolution belong to one controller;
    the composition root only coordinates user input and file-browser actions.
15. Optional composer capabilities such as quick scheduling own their state,
    validation, and host callbacks in a controller instead of adding lifecycle
    effects to the composition root.
16. Fork request execution stays in the composition root until its thread
    transition boundary is isolated, while dialog configuration and selector
    lifecycle live in a tested controller.
17. Run cancellation is one controller-owned transaction covering the remote
    request, local abort, turn finalization, intentional stream-error
    normalization, and lifecycle callbacks.
18. Thread-context estimates, lazy details, action state, and thread-change
    resets share one remote-state controller; automatic detail loading performs
    at most one request per popup opening and thread.
19. Deep-research session polling is enabled only by observed activity or an
    inspected detail, preserves last-known state across transient failures, and
    terminates when both logs and sessions become inactive.
20. File-browser attachment orchestration owns cross-source validation,
    capacity, construction, upload preparation, and selection cleanup while
    leaving dialog navigation and rendering independent.
21. Communicator routing applies deterministic run controls before model-based
    classification, preserves conservative local fallbacks, and restores the
    composer whenever delivery cannot be confirmed; the composition root only
    supplies UI callbacks.
22. Active-worker instructions are accepted only for the matching canonical
    projection, require a durable worker routing receipt, and restore the
    composer on failure rather than falling through to a duplicate local
    execution path.
23. Permission rulings are one tested transaction: authenticated submission,
    canonical reconciliation feedback, and immutable turn/log state updates
    live outside the composition root.
24. Synthetic communicator/voice turns and context-action notices share one
    controller-owned state transition boundary instead of duplicating turn
    construction and mutation inside the composition root.
25. Slash-command auto-staging is evaluated in deterministic priority order by
    the staged-command controller, with product-specific commands gated by
    explicit capabilities.
26. Thread-context actions are one transaction covering validation, remote
    execution, notice lifecycle, context refresh, and fork handoff ordering;
    the composition root only supplies presentation callbacks.
27. Edit and message-fork truncation resolve through one canonical-message
    boundary algorithm that excludes internal turns and retains explicit
    compatibility fallbacks for older hydrated identities.

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
