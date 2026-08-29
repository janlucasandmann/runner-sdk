<!-- platform-directory-guide:v1 -->

# Resource Settings page

## Purpose

`PlatformResourceSettingsPage` is the canonical Settings-tab composition for
resource detail pages across Create, Configure, and Develop. It always owns:

1. The editable resource identity header (`PlatformResourceSettingsIdentity`)
2. The centralized `PlatformResourceDetailSidebar`
3. The resource Access surface

Location and Connectors are ordered optional slots. Resource-specific settings
belong in `additionalSections`, after those standard slots and before Access.
When a nested Access detail is active, optional sections and the details
sidebar are removed while the identity and Access context remain mounted.

The resource page retains domain state, persistence, connector implementations,
and permission adapters. It passes those behaviors into this composition rather
than recreating the Settings layout.

## Working in this directory

Keep resource-specific state and API calls in the owning resource domain. Add
cross-resource layout or identity behavior here, preserve the standard slot
order, and cover contract changes in `platform-resource-settings-page.test.tsx`.
Consumers should supply the existing centralized section components rather than
restyling their internals from this page layer.

## Verification

```bash
npx vitest run src/platform-ui/pages/settings
npm run check:static
```

## Related documentation

- [Resource detail page](../details/README.md)
- [Settings sections](../../components/composite/settings-section/README.md)
- [Access control](../../../platform-resources/access-control/README.md)
