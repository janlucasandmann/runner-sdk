<!-- platform-directory-guide:v1 -->

# App Sidebar

## Purpose

The App Sidebar owns the platform shell's expanded and collapsed navigation, Create / Configure / Develop mode selector, thread list renderers, thread action overlays, and sidebar layout styles.

Domain data and navigation handlers remain supplied by the host because the same state is consumed by main-content pages. Service-specific sidebar entries are composed through `createAppSidebarScriptFragments` so service modules retain ownership of their links.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run app-sidebar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
