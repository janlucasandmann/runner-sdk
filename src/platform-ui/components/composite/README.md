# Composite components

Components that assemble multiple controls, behaviors, or presentation regions into a reusable interface live here.

- `analytics`: KPI summaries, Chart.js rendering, axes, and analytics states.
- `code-preview-box`: quickstart and API example surfaces with language, copy, static preview, and lazy Monaco modes.
- `data-table`: table state, toolbar, sorting, selection, and row presentation.
- `detail-sidebar`: canonical resource-detail sidebars and section surfaces.
- `detail-tab-bar`: accessible, keyboard-navigable resource-detail tabs.
- `empty-state`: shared icon, title, and supporting-copy composition for empty data surfaces.
- `instructions-editor`: shared Markdown instructions editing, history, formatting, and preview rendering.
- `loading-state`: shared animated dot loader and concise status-copy composition.
- `modal`: dialog composition, focus management, sizing, and dismissal.
- `page-hero`: the shared page title, description, and optional action row.
- `popup`: popup surfaces, dismissal layers, positioning, and transitions.
- `settings-section`: reusable settings section lists, headers, content surfaces, and table defaults.
- `ui-card`: the shared neutral card surface for composed platform content.
- `widgets`: the shared home widget shell and its project, calendar, and usage variants.

Import composites through `platform-ui/components/composite`, or through a specific canonical subpath such as `platform-ui/components/composite/data-table`.
