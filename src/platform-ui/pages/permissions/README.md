# Permissions pages

This directory owns the reusable page layer for platform permission editing.

## Components

- `PlatformPermissionsPage` renders the permission-ring overview and one embedded `PlatformDataTable` per ring for the action-level ring/access editor.
- `PlatformRolePermissionsPage` adds the shared role navigation and selected-role header around `PlatformPermissionsPage`.
- `PlatformPermissionMiniRingIcon` exposes the canonical compact ring visualization for summaries outside the page.
- `permission-catalog.ts` owns the canonical rings, actions, resources, and supported subject types.
- `permission-policy.ts` owns normalization, defaults, immutable policy updates, and policy lookup.

## Ownership

The page layer owns presentation, accessibility, responsive layout, the canonical policy model, and immutable policy operations. Resource modules continue to own:

- Role defaults and resource-specific labels
- Loading and mutation state
- API persistence and optimistic rollback
- Routing and team/member assignment controls

This keeps the page independent from agent, project, team, organization, database, and server APIs while ensuring that every resource renders the same permission editor.

The ring tables use the shared minimal table variant without a toolbar or pagination footer. Their column header remains visible so action, ring, and permission controls keep consistent table semantics across every resource.

Every ring and access control uses the shared `PlatformSelector`, so labels, Lucide chevrons, popup behavior, keyboard interaction, and disabled states remain consistent across permission editors.

## Usage

```tsx
import {
  PlatformPermissionsPage,
  type PlatformPermissionSet,
} from "@computer-agents/runner-web-sdk/platform-ui/pages/permissions";

<PlatformPermissionsPage
  permissionSet={permissionSet}
  subjectType="agent"
  accessOptions={accessOptions}
  ringDefinitions={ringDefinitions}
  actionDefinitions={actionDefinitions}
  onRingAccessChange={updateRing}
  onActionRingChange={moveAction}
  onActionAccessChange={updateAction}
/>;
```

Load either the dedicated stylesheet or the combined page stylesheet:

```ts
import "@computer-agents/runner-web-sdk/platform-ui/pages/permissions/styles.css";
// or
import "@computer-agents/runner-web-sdk/platform-ui/pages/styles.css";
```
