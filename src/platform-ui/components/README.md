<!-- platform-directory-guide:v1 -->

# Platform UI components

## Purpose

Platform components are separated by composition level and domain ownership:

- `ui`: small primitives such as buttons, search inputs, and segmented switches.
- `composite`: assembled interfaces such as analytics sections, tables, modals, popups, and home widgets.
- `thread-components`: reusable interfaces that understand thread, run, and working-log concepts.

Every component keeps its React API, styles, tests, and documentation in its own directory. Feature and resource modules should use the category barrels or canonical category subpaths. The root `platform-ui/components` barrel remains available when a consumer intentionally needs multiple categories.

Legacy package subpaths remain compatibility aliases only. New code must import from `platform-ui/components/ui/*`, `platform-ui/components/composite/*`, or `platform-ui/components/thread-components/*` so the dependency level and ownership are explicit.

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
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
