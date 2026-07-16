# Platform analytics

`PlatformAnalyticsSection` is the shared KPI and Chart.js surface for platform analytics views. It owns metric presentation, chart lifecycle, loading and error states, empty states, value formatting, and optional primary/secondary axes.

Overview pages render line charts by passing `chartType="line"`. Other platform pages can reuse the same section and choose a supported chart type without rebuilding the KPI or chart markup.

Use `variant="framed"` for detail-page analytics cards that need a title, right-aligned header actions, KPIs, and a chart inside the canonical bordered glass surface. Pass `title` and `headerActions` for the top line. Specialized charts can be preserved through `chartContent`; without it, the shared Chart.js renderer is used.

Import the component and its model types from `platform-ui/components/composite/analytics`, and load `platform-ui/components/composite/analytics/styles.css` once in the host application.
