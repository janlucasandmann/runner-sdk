<!-- platform-directory-guide:v1 -->

# Access control

## Purpose

This domain owns the cross-resource principal contract used by resource sharing
and Manage Access surfaces. It defines immutable system principals, legacy ID
normalization, versioned access-control metadata, and the canonical access
table. Permission-ring policy editing remains in `platform-ui/pages/permissions`.

`PlatformResourceAccessSettings` is the canonical table-to-policy flow.
`All Agents` opens a single machine-access permission page. Physical teams and
`All Organization Members` open `PlatformRolePermissionsPage`, including the
shared Owner, Admin, Contributor, and Member sidebar. Organization-member
policies are persisted per organization role in
`accessControl.systemPrincipalRolePermissionSets`. The canonical role list and
resource-settings layout are owned by this component: permissions render in
the primary content column while role navigation lives in a standard `Details`
sidebar card. Resource adapters therefore cannot accidentally omit or relocate
the sidebar. The selected role title, ring overview, full-width permission
search, and one ring-grouped minimal table share a single access surface; the
generic permission page keeps its separate-ring presentation for other
contexts. Resource adapters provide separate system and role-scoped subject
types when their policy namespaces differ.

The canonical system principals are:

- `all_agents` — every agent in the active organization;
- `all_organization_members` — every active human member of the active
  organization.

Both rows are always present and cannot be removed. Their permission sets can
be changed by an authorized resource owner or administrator. Organization
members receive the policy for their organization role; Owner remains an
immutable full-control policy.

Team-role edits are persisted by the owning resource adapter and synchronized
to the corresponding team resource-share projection. This keeps resource
details and team resource views on the same policy snapshot.

The canonical table also owns team identity rendering. Resource adapters pass
their team records through the shared profile-image normalizer; the table
renders saved team images at `20x20px` and uses aligned initials for principals
without an image.

`PlatformResourceAccessSettings` also owns the Add Teams selector. Resource
adapters provide the currently available teams and their add mutation through
the `addTeams` contract; the shared control eagerly hydrates the authoritative
organization-team directory so persisted team IDs resolve to their durable
names and profile images after a reload. It also owns plan and empty states,
circular team avatars, fallback initials, the current user's team-role
subtitle, popup behavior, and toolbar placement.

Selecting a physical team, `All Agents`, or `All Organization Members`
promotes its permission editor into the shared resource-access detail route.
The component publishes the active principal through the centralized
app-header navigation contract, which turns the resource breadcrumb into the
back target, appends the principal breadcrumb (including the saved circular
team image or initials fallback), hides the parent tab switch and unrelated
settings sections, and applies the normal resource-detail content width while
the access page is open. Resource adapters therefore do not build access
breadcrumbs or detail-sidebar behavior independently.

## Compatibility

Readers accept the former `all-agents` and `system:*` IDs plus the legacy
`organizationMemberPermissionSet` metadata field. Writers persist the
versioned `accessControl` envelope and retain the legacy organization-member
field during the migration window.

## Verification

```bash
npm run platform-resource-overview-test
npm run check:static
```

## Related documentation

- [Platform resources](../README.md)
- [Permission UI](../../platform-ui/pages/permissions/README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
