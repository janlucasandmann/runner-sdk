<!-- platform-directory-guide:v1 -->

# Platform icon button

## Purpose

`PlatformIconButton` is the shared icon-only action control. Its default `small` size matches the controls in the expanded app-sidebar header: a 28px hit area, 14px icon, 5px radius, white/70 foreground, and white/7.5 hover surface.

Every instance requires an `aria-label`. Use the native `title` prop for a concise visual tooltip when the action is not already obvious from nearby context.

The `compact`, `small`, and `medium` sizes provide 24px, 28px, and 32px controls. Semantic danger styling deliberately does not belong to this primitive; destructive actions should communicate risk in a confirmation flow rather than changing the hover treatment of the toolbar icon.

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
