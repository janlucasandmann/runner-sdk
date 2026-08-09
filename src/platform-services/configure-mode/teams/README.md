<!-- platform-directory-guide:v1 -->

# Teams service

## Purpose

Configure-mode ownership for team membership, role permissions, and shared-resource access.

- `client/domain` owns team/member identity normalization and resource-share metadata.
- `client/runtime` owns loading, membership, administration, permission, and sharing actions.
- `client/page/overview` owns the typed Teams overview built from the shared page hero, overview shell, and catalog data table.
- The remaining `client/page` fragments adapt the legacy runtime into the overview model and own member, resource, and role views.
- `client/styles` owns the Teams page foundation, roles/dialogs, and responsive styling.
- `client/shell` owns state, lifecycle, navigation, history, top navigation, and sidebar integration.
- `server` owns the `/teams/*` proxy and member-profile lookup pipeline, including its Firebase fallback.

Cross-service resource consumers retain their own presentation logic; Teams owns the shared access records they consume.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run teams-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
