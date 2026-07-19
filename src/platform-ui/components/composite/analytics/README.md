<!-- platform-directory-guide:v1 -->

# Platform analytics

## Purpose

`PlatformAnalyticsSection` is the shared KPI and Chart.js surface for platform analytics views. It owns metric presentation, chart lifecycle, loading and error states, empty states, value formatting, and optional primary/secondary axes.

Overview pages render line charts by passing `chartType="line"`. Other platform pages can reuse the same section and choose a supported chart type without rebuilding the KPI or chart markup.

Use `variant="framed"` for detail-page analytics cards that need a title, a right-aligned timeframe control, KPIs, and a chart inside the canonical analytics surface. Pass `title` and the typed `timeframe` configuration for the top line. The timeframe configuration is rendered with the centralized `PlatformSwitch`.

Both variants always render `PlatformAnalyticsChart`. Framing is strictly presentational, so chart styling and behavior stay synchronized across overview and detail pages.

Line series use the canonical smooth area treatment by default: layered blue fills, a purple contour, and dashed horizontal guides. Set `fill: false` on a series only when the data must be presented as an unfilled line.

Empty charts always render the shared `PlatformAnalyticsEmptyState`, which uses the
`ChartColumnIncreasing` icon and canonical, resource-neutral copy. Analytics producers
only provide data, loading, and error state; they do not define page-specific empty
states.

Import the component and its model types from `platform-ui/components/composite/analytics`, and load `platform-ui/components/composite/analytics/styles.css` once in the host application.

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
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
