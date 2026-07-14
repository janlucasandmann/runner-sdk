# Fine-Tuning service

Configure-mode ownership for fine-tuning jobs.

- `client/page` owns job normalization, overview/detail rendering, creation, and job actions.
- `client/shell` owns platform state, navigation, history, lifecycle, sidebar, and host-page integration.
- `client/styles` exposes the fine-tuning page stylesheet.
- `server` owns job persistence, orchestration, verification, agent-version publication, and HTTP routes.

The root `index.mjs` is the only integration surface required by the platform host.

