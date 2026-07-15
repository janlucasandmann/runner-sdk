# Configure Home service

Configure-mode ownership for the workspace overview and notification data.

- `client/domain` owns notification storage keys, persistence helpers, and upstream record normalization.
- `client/runtime` owns notification projection, polling, permission-request loading, and user actions.
- `client/page` owns the notification table and Configure Home overview.
- `client/styles` owns the dashboard and notification table presentation.
- `client/shell` owns page and notification state, navigation, history restore, title, top navigation, and sidebar integration.
- `server` owns the `/notifications/in-app` upstream proxy.

Generic account, billing, data-table, and application-shell primitives remain host-owned dependencies.
The global Notifications Popup is owned by `src/platform-shell/app-header`.
