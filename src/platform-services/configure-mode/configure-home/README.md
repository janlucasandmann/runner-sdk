<!-- platform-directory-guide:v1 -->

# Configure Home and Notifications service

## Purpose

Configure-mode ownership for the workspace overview and notification center.

- `client/domain` owns notification storage keys, persistence helpers, and upstream record normalization.
- `client/runtime` owns notification projection, polling, permission-request loading, and user actions.
- `client/page/configure-home-overview-page.tsx` maps Configure resources and navigation into the canonical `PlatformHomePage`.
- `client/page/notifications-overview-page.tsx` owns the dedicated Notifications table page and uses the canonical `ResourceOverviewPage`.
- `client/styles` owns only Configure-specific teaser and notification-cell presentation. The overview shell and table layout come from the shared platform modules.
- `client/shell` owns page and notification state, independent Home/Notifications navigation, history restoration, titles, top navigation, and sidebar integration.
- `server` owns the `/notifications/in-app` upstream proxy.

Generic account, billing, data-table, resource-overview, and application-shell primitives remain host-owned dependencies.
The global Notifications Popup is owned by `src/platform-shell/app-header`.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run configure-home-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
