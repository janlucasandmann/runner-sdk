# Organizations service

Configure-mode ownership for organization tenancy, membership, roles, shared resources, usage, and billing presentation.

- `client/domain` owns organization identity, invitation normalization, active-organization persistence, role definitions, and role permission policies.
- `client/runtime` owns organization loading, administration, membership, and permission actions.
- `client/page` owns the Organizations overview and organization member, resource, role, usage, and billing views.
- `client/styles` owns organization billing and overview styling layered on the shared Teams visual foundation.
- `client/shell` owns organization state, tenancy request headers, workspace switching, lifecycle, navigation, history, and sidebar integration.
- `server` owns the `/organizations/*` upstream proxy.

Generic settings billing and notification-center orchestration remain shared host concerns; this service owns their organization-specific state, records, and rendering.
