# Models service

Configure-mode ownership for the managed model catalog and Models page.

- `client/page` owns catalog normalization, filtering, pricing, sorting, and rendering.
- `client/styles` owns the Models page stylesheet.
- `client/shell` owns platform state, catalog loading, navigation, history, top navigation, sidebar, and page integration.
- `client/integrations/agents` owns the Models link embedded in Agent overview actions.
- `server` owns the managed agent-model catalog proxy route.

The root `index.mjs` is the only integration surface required by the platform host.
