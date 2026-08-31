<!-- platform-directory-guide:v1 -->

# UI components

## Purpose

Small, domain-agnostic primitives live in this directory. A UI component should have a narrow API, remain useful without platform-specific data, and compose naturally into larger interfaces.

- `button`: primary and secondary action hierarchy and sizing.
- `checkbox`: compact checked and indeterminate selection states.
- `icon-button`: accessible icon-only controls with shared sizing and interaction states.
- `input`: canonical single-line text inputs with shared sizing, focus, disabled, and invalid states.
- `label`: compact categorical labels with shared color variants.
- `search`: controlled search input with the shared icon, states, and control height.
- `selector`: single-value and button-triggered popup selectors with consistent portaled surfaces and keyboard behavior, including the canonical searchable agent selector used by ticket details, workflow nodes, and task input.
- `switch`: controlled segmented selection and keyboard behavior.
- `ticket-item`: shared list and card presentation for tickets across backlog, board, activity, and nested work views.
- `toggle`: compact controlled binary settings with accessible switch semantics.
- `version-label`: canonical clickable `vN` labels and shared version-title formatting.

Import primitives through `platform-ui/components/ui`, or through a specific canonical subpath such as `platform-ui/components/ui/button`.

`selector` is the only UI control allowed to depend on a composite component: it deliberately composes the canonical popup surface so selectors cannot introduce another overlay implementation.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
