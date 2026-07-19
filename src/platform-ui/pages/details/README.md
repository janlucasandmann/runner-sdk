<!-- platform-directory-guide:v1 -->

# Resource detail page

## Purpose

`ResourceDetailPage` is the canonical shell for resource detail screens. It composes:

1. A resource-provided title or rich identity header
2. The shared `PlatformDetailTabBar`
3. Optional resource controls at the right edge of the tab bar
4. The active content panel
5. The shared `PlatformDetailSidebar`

Navigation does not belong to this shell. Breadcrumbs, app-header paths, and back behavior remain the responsibility of the host application.

Resource-specific pages under `platform-resources/<resource>/detail` define their tab set and supply the content and sidebar controls. Use `tabBarActions` for resource-specific controls and `sidebarToggle` for the sidebar visibility control; the shell always renders the sidebar toggle last.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
