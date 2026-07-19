<!-- platform-directory-guide:v1 -->

# Platform label

## Purpose

`PlatformLabel` is the shared compact label primitive for statuses, tiers, profiles, and other short categorical values.

Use the `gray`, `green`, `blue`, `yellow`, or `red` variant to apply the system color treatment. The component forwards native span attributes and defaults to `gray`.

Pass a decorative React node through `icon` to render the label's icon-leading variant. `PlatformPriorityBarsIcon` exposes the shared three-bar project priority glyph and accepts `activeBars` from `0` through `3`.

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
