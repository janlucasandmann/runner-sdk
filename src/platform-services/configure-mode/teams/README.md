# Teams service

Configure-mode ownership for team membership, role permissions, and shared-resource access.

- `client/domain` owns team/member identity normalization and resource-share metadata.
- `client/runtime` owns loading, membership, administration, permission, and sharing actions.
- `client/page/overview` owns the typed Teams overview built from the shared page hero, UI cards, overview shell, and data table.
- The remaining `client/page` fragments adapt the legacy runtime into the overview model and own member, resource, and role views.
- `client/styles` owns the Teams page foundation, roles/dialogs, and responsive styling.
- `client/shell` owns state, lifecycle, navigation, history, top navigation, and sidebar integration.
- `server` owns the `/teams/*` proxy and member-profile lookup pipeline, including its Firebase fallback.

Cross-service resource consumers retain their own presentation logic; Teams owns the shared access records they consume.
