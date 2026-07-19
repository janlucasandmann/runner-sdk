<!-- platform-directory-guide:v1 -->

# Floating sidebar

## Purpose

`PlatformFloatingSidebar` is the shared shell for application sidebars that slide in from the right. It owns mounting and exit transitions, an app-style header with a required close action, keyboard dismissal, optional portal rendering, sizing, and the standard translucent surface.

Domain components should provide only their body, optional header actions, and optional footer. Use a page-local portal target when the sidebar should align with a platform content shell.

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
