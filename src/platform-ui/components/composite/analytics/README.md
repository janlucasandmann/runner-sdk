# Platform analytics

`PlatformAnalyticsSection` is the shared KPI and Chart.js surface for platform analytics views. It owns metric presentation, chart lifecycle, loading and error states, empty states, value formatting, and optional primary/secondary axes.

Overview pages render line charts by passing `chartType="line"`. Other platform pages can reuse the same section and choose a supported chart type without rebuilding the KPI or chart markup.

Use `variant="framed"` for detail-page analytics cards that need a title, a right-aligned timeframe control, KPIs, and a chart inside the canonical analytics surface. Pass `title` and the typed `timeframe` configuration for the top line. The timeframe configuration is rendered with the centralized `PlatformSwitch`.

Both variants always render `PlatformAnalyticsChart`. Framing is strictly presentational, so chart styling and behavior stay synchronized across overview and detail pages.

Empty charts always render the shared `PlatformAnalyticsEmptyState`, which uses the
`ChartColumnIncreasing` icon and canonical, resource-neutral copy. Analytics producers
only provide data, loading, and error state; they do not define page-specific empty
states.

Import the component and its model types from `platform-ui/components/composite/analytics`, and load `platform-ui/components/composite/analytics/styles.css` once in the host application.
