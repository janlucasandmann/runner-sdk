# Marketplace service

Configure-mode ownership for the reusable resource-template marketplace.

- `domain` owns the Marketplace template catalog and category definitions.
- `client/domain` owns preview metadata, files, databases, and virtual resource materialization.
- `client/page` owns catalog filtering, tables, previews, and publishing dialogs.
- `client/styles` owns the Marketplace page stylesheet.
- `client/shell` owns preview state, lifecycle, navigation, history, branding, sidebar, and page integration.
- `server` exposes the read-only Marketplace catalog API, including the resource-template compatibility route.

Marketplace is the product/service name. Resource template remains the compatibility term in persisted records and APIs.
