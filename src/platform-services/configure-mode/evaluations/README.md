# Evaluations service

Configure-mode ownership for evaluation sets, versions, cases, and runs.

- `client/page` owns evaluation normalization, versioning, execution, analytics, tables, editors, and dialogs.
- `client/shell` owns platform state, navigation, history, lifecycle, sidebar, and page integration.
- `client/integrations/agents` owns the evaluation surface embedded in Agent details.
- `client/styles` owns the standalone Evaluations page stylesheet.
- `server/domain` owns normalization, refinement, scoring, and cost accounting.
- `server/runtime` owns stateful evaluation execution and the service routes.

The root `index.mjs` is the only integration surface required by the platform host.

