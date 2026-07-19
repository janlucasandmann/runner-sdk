<!-- platform-directory-guide:v1 -->

# Resource overview page

## Purpose

This directory contains the canonical page layer for resource overview screens. It owns the shared page structure used by agents, computers, skills, plugins, tags, and future resource types:

1. App-header controls rendered through `controlsPortalId`
2. Shared `PlatformAnalyticsSection` KPI summary and usage chart, or a resource-specific `heroContent` replacement
3. Shared `PlatformDataTable` surface

Resource-specific behavior does not belong here. Each resource module under `platform-resources/<resource>/overview` defines its row model, columns, filters, actions, data mapping, and resource-specific header controls, then renders `ResourceOverviewPage`.

## Modules

- `resource-overview-page.tsx`: generic page composition
- `resource-overview-chart.tsx`: compatibility export for the shared analytics chart
- `resource-overview-cells.tsx`: reusable table cell presentations
- `resource-overview-types.ts`: public page and analytics contracts
- `resource-overview.css`: canonical overview-page styling
- `resource-overview-pages.test.tsx`: cross-resource contract tests
- `index.ts`: public exports

## Usage

```tsx
import {
  ResourceOverviewPage,
  type ResourceOverviewAnalyticsModel,
} from "@computer-agents/platform/platform-ui/pages";

<ResourceOverviewPage
  period={period}
  onPeriodChange={setPeriod}
  analytics={analytics}
  controlsPortalId="resource-overview-controls"
  table={{
    rows,
    columns,
    getRowId: (row) => row.id,
    ariaLabel: "Resources",
  }}
/>
```

Load the shared stylesheet through:

```ts
import "@computer-agents/platform/platform-ui/pages/styles.css";
```

## Extension rules

- Keep the page shell resource-agnostic.
- Add reusable visual cells here only when multiple resource pages need them.
- Keep fetching, mutations, permissions, routing, and domain-specific state in the resource module or application adapter.
- Use `heroContent` with `showPeriodSelector={false}` when an overview needs a task-oriented introduction instead of analytics.
- Provide a stable app-header target through `controlsPortalId`; timeframe and primary actions must not be rendered in the page body.
- Use `PlatformDataTable` configuration instead of introducing resource-specific table markup.
- Update the cross-resource test when adding a new overview page to ensure it renders the canonical shell.

Run the overview contract tests with:

```sh
vitest run src/platform-ui/pages/overview
```

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
