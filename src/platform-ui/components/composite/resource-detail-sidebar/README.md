<!-- platform-directory-guide:v1 -->

# Resource detail sidebars

## Purpose

This directory owns the centralized metadata sidebar surfaces used by resource
detail pages. `PlatformResourceDetailSidebar` is the low-level extensible
composition. `PlatformResourceSettingsDetailsSidebar` is the stricter Settings
contract built on top of it.

The Settings variant renders resource-specific `customAttributes` first, then
the invariant Scope, Updated, Creator, and Owner rows, followed by one primary
button or a primary split selector. Project Settings alone omit Scope because a
Project cannot be scoped to itself. Button labels remain icon-free.

Scope UI supports Independent, one Project, or several Projects. Consumers own
the resource mutation and pass the controlled values and project options into
the component; this directory owns only presentation and interaction.

## Working in this directory

Keep resource-domain data fetching and mutations out of these components.
Changes to invariant row order, ownership behavior, scope selection, or footer
actions must be implemented here and covered in the colocated test. Export all
public contracts through `index.ts`.

## Verification

```bash
npx vitest run src/platform-ui/components/composite/resource-detail-sidebar
npm run platform-component-invariants
```

## Related documentation

- [Resource Settings page](../../../pages/settings/README.md)
- [Resource detail page](../../../pages/details/README.md)
- [Owner selector](../owner-selector/README.md)
