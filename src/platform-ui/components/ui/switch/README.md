<!-- platform-directory-guide:v1 -->

# Platform switch

## Purpose

`PlatformSwitch` is the shared controlled segmented switch used for compact mutually exclusive view and mode choices. Its default presentation matches the Agents/Squads selector in the task-input agent popup.

The switch has the same 28px outer height as default platform buttons and shared search inputs.

Pass stable string-valued `options`, the current `value`, and `onValueChange`. The component owns option rendering, active state, radio-group semantics, roving focus, and arrow/Home/End keyboard navigation.

Use `fullWidth` when a switch should fill its parent. The shared variant
distributes each option evenly without requiring page-specific option styles.

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
