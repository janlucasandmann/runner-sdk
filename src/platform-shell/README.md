<!-- platform-directory-guide:v1 -->

# Platform Shell

## Purpose

Shell-owned UI belongs here when it coordinates global navigation, account state,
or overlays that sit above individual create, configure, and develop services.

Each shell feature owns its browser fragments, styles, and contract tests in a
dedicated subdirectory. Product pages remain under `src/platform-services`.

- `app-header` owns the App Header, Breadcrumb Bar, Account Menu, Notifications Popup, and global Search Modal.
- `app-sidebar` owns expanded and collapsed navigation, platform mode selection, thread-list UI, and sidebar layout styles.
- `resource-creation` owns cross-page Agent and Computer creation overlay lifecycle.
- `settings-modal` owns the settings experience opened from the Account Menu.

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
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
