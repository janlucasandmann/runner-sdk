<!-- platform-directory-guide:v1 -->

# Platform button

## Purpose

`PlatformButton` owns the shared action-button contract used across the platform. The primary variant follows the blue New Issue action; the secondary variant follows the transparent Mission Control action.

Use `PlatformPrimaryButton` and `PlatformSecondaryButton` when the action hierarchy is static. Use `PlatformButton` when the variant is selected dynamically.

Available sizes are `compact`, `small` (default), `medium`, and `large`. Native button props, refs, custom width/min-width, full-width layout, disabled state, and active state are supported.

Import `@computer-agents/platform/platform-ui/components/ui/button/styles.css` once in applications that consume the button package directly. RunnerChat and the platform application bundle the stylesheet automatically.

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
