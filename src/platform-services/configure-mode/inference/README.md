# Inference service

Configure-mode ownership for customer-managed model inference and the execution-runtime surface presented alongside it.

- `client/domain` owns inference normalization, model discovery helpers, and local-runtime record formatting.
- `client/page` owns the Inference page composition, endpoint editor, health summary, and local-runner presentation.
- `client/styles` owns endpoint, runtime, and local-runner styling.
- `client/shell` owns state, lifecycle, navigation, autosave handlers, history, and sidebar integration.
- `server` owns inference connection-test proxying while preserving the existing billing-prefixed route.

Billing retains shared plan, usage, and preference-storage behavior; Inference owns the configuration experience.
