<!-- platform-directory-guide:v1 -->

# Detail tab bar

## Purpose

`PlatformDetailTabBar` is the canonical tab navigation for resource detail pages. It owns tab semantics, keyboard navigation, icon sizing, active-state presentation, and horizontal overflow.

Resource pages provide only their tab definitions, active value, and change callback. Page-specific tab markup must not be introduced.

Use `endActions` for compact controls that belong on the right edge of the tab bar. The tab list keeps the available width and remains horizontally scrollable while the action group stays visible.

Set `showDivider` when the tab bar should render the shared `1px` bottom divider. The option is disabled by default so existing detail pages retain their current presentation.

Use `variant="minimal"` for compact navigation where selection is communicated only through text color. The minimal variant has no component divider, individual tab underlines, or bottom tab padding; its active tab uses solid white text.

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
