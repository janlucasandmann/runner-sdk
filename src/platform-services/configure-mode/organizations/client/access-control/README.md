<!-- platform-directory-guide:v1 -->

# Organization identity and access

## Purpose

This module owns the organization-level identity and authorization control
plane. It complements, rather than replaces, the resource permission UI in
`platform-ui/pages/permissions` and the canonical resource sharing flow in
`platform-resources/access-control`.

The page provides four bounded administration surfaces:

- enterprise OIDC and Microsoft Entra connections, SCIM token lifecycle, and
  immutable external-group mappings;
- expiring authorization approval requests;
- short-lived agent delegations constrained to explicit actions and resource
  IDs;
- explainable authorization decision audit.

All requests carry the active organization header. Mutation controls are
hidden or disabled when the current member cannot manage the organization.
The client repository is the only module that owns the HTTP contract and
normalization of camel-case and snake-case API records.

## UI ownership

This directory composes existing centralized UI components:

- `PlatformDataTable`
- `PlatformModal` and `PlatformConfirmationModal`
- `PlatformSelector`
- `PlatformSwitch`
- centralized buttons, labels, and checkboxes

Permission rings, role policies, `All Agents`, `All Organization Members`, and
team access remain owned by the canonical permission and access-control
packages.

## Working in this directory

Keep transport changes inside `organization-access-repository.ts`, API record
compatibility inside `organization-access-normalization.ts`, and bounded
feature behavior inside the corresponding panel. Reuse the centralized
permission, access-control, table, modal, selector, button, label, checkbox,
and switch components rather than introducing organization-local copies.

Do not move resource permission rings or team-share policy behavior into this
module. New mutations must be enforced by the server and represented by a
focused repository contract and regression test before they are exposed here.

## Verification

```bash
npx vitest run src/platform-services/configure-mode/organizations/client/access-control
npm run organizations-service-test
```

## Related documentation

- [Organizations service](../../README.md)
- [Resource access control](../../../../../platform-resources/access-control/README.md)
- [Permission UI](../../../../../platform-ui/pages/permissions/README.md)
