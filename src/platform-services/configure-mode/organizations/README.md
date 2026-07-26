<!-- platform-directory-guide:v1 -->

# Organizations service

## Purpose

Configure-mode ownership for organization tenancy, membership, roles, shared resources, usage, and billing presentation.

- `client/domain` owns organization identity, invitation normalization, active-organization persistence, role definitions, and role permission policies.
- `client/access-control` owns enterprise identity connections, SCIM and group mappings, authorization approvals, agent delegations, and decision audit. It composes the shared permission and resource-access components rather than duplicating resource policy UI.
- `client/runtime` owns organization loading, administration, membership, and permission actions.
- `client/page/overview` owns the typed Organizations overview page and guide, composed from shared page, hero, card, and table components.
- The remaining `client/page` modules bridge organization member, resource, role, usage, and billing views into the legacy host.
- `client/styles` owns organization billing and overview styling layered on the shared Teams visual foundation.
- `client/shell` owns organization state, tenancy request headers, workspace switching, lifecycle, navigation, history, and sidebar integration.
- `server` owns the bounded `/organizations/*`, `/identity-connections/*`, and `/authorization/*` upstream proxies used by this service.

Generic settings billing and notification-center orchestration remain shared host concerns; this service owns their organization-specific state, records, and rendering.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run organizations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
