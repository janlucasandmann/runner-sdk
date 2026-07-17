# Log boxes

This directory owns the thread working-log presentation layer:

- `runner-log-boxes.tsx`: the `RunnerWorkLogEntry` dispatch/composition root;
- `*-state.ts`: deterministic parsing, normalization, and presentation state;
- `*-view.tsx`: bounded action-specific renderers and interactions;
- `permission-request-view.tsx`: permission request presentation and decisions;
- action-specific detail drawers and preview surfaces;
- focused unit tests for those helpers.

The implementation may consume shared runtime and preview utilities from
`src/react`, but all log-box UI and log-box-specific behavior belongs here.
Consumers should import the public API through `index.ts`.

Leaf renderers must not import `runner-log-boxes.tsx`. The composition root
may import leaves, and a view may import its matching state module. New action
families should follow that dependency direction and include state-level tests
before being registered in `RunnerWorkLogEntry`.
