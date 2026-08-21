<!-- platform-directory-guide:v1 -->

# Platform search

## Purpose

`PlatformSearch` is the controlled, system-wide search input primitive. It owns the standard search icon, focus and disabled states, and the 28px control height shared by default platform buttons and segmented switches. Pass another Lucide component through `icon`, or `icon={null}` when a neighboring interactive control owns the leading position.

Use `className` for container layout such as width or flex behavior. Native input attributes, including `value`, `onChange`, `placeholder`, and accessibility labels, are forwarded to the search input.

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
