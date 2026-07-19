<!-- platform-directory-guide:v1 -->

# App Header

## Purpose

Application-shell ownership for the persistent top navigation and its overlays.

- `client/components/app-header.mjs` owns the App Header controls and layout.
- `client/components/breadcrumb-bar.mjs` owns breadcrumb normalization, icons, and navigation.
- `client/components/account-menu.mjs` owns the Account Menu opened from the profile button.
- `client/components/notifications-popup.mjs` owns the shell-level Notifications Popup UI.
- `global-search-modal` owns the typed, reusable `PlatformGlobalSearchModal` UI and its stylesheet.
- `client/components/search-modal.mjs` is the legacy shell adapter that maps host data and callbacks into the standalone Search Modal.
- `client/shell` owns shared overlay state, refs, navigation, and lifecycle behavior.
- `client/runtime` owns organization-scoped, mode-specific loading and result projection for threads, files, tickets, agents, and workflows.
- `client/styles` owns the App Header and overlay presentation.

Feature services continue to own their data and actions. Configure Home, for example, owns notification loading and mutations while App Header owns their global presentation.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run app-header-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
