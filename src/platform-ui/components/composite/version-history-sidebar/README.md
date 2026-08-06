<!-- platform-directory-guide:v1 -->

# Version history sidebar

## Purpose

`PlatformVersionHistorySidebar` composes the floating-sidebar shell with a compact version list. Each item presents its title and creation date, identifies the production version, highlights the currently displayed version, and exposes centralized popup actions. The `All Versions` title toolbar retains production-status filtering. The sidebar also supports loading and error states, creating versions from its header, and an always-present `View Changes` footer action. The shared action is disabled until the resource supplies a comparison handler and at least one version is available.

Version titles default to the canonical shared format: `vN`, or `vN | description` when an optional description is present. Resource domains remain responsible for persistence, creation dates, and actions. Opening the sidebar is deliberately independent from opening a comparison page.

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
