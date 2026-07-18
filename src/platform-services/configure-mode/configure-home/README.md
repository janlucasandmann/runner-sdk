# Configure Home and Notifications service

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
