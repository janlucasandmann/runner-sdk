<!-- platform-directory-guide:v1 -->

# Log boxes

## Purpose

This directory owns the thread working-log presentation layer:

- `runner-log-boxes.tsx`: the `RunnerWorkLogEntry` dispatch/composition root;
- `*-state.ts`: deterministic parsing, normalization, and presentation state;
- `*-view.tsx`: bounded action-specific renderers and interactions;
- `permission-request-view.tsx`: permission request presentation and decisions;
- action-specific detail drawers and preview surfaces;
- focused unit tests for those helpers.

The activity cascade is split by presentation responsibility and composed in
order by `scripts/runner-chat-style-sources.mjs`:

- `activity-core.css`: shared cards, media previews, and base activity rows;
- `activity-resources.css`: git, list, resource, and permission activities;
- `activity-specialists.css`: browser, subagent, deep-research, and platform
  action surfaces;
- `activity-output.css`: diffs, terminal output, web results, and structured
  extraction views.

The implementation may consume shared runtime and preview utilities from
adjacent thread-component packages, but it must not import `src/react`.
List-resource and git log boxes are owned here; their former Runner paths are
compatibility facades. Consumers should import the public API through
`index.ts`.

Leaf renderers must not import `runner-log-boxes.tsx`. The composition root
may import leaves, and a view may import its matching state module. New action
families should follow that dependency direction and include state-level tests
before being registered in `RunnerWorkLogEntry`.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
