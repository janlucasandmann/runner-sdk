# Guardrails service

This directory is the Configure-mode ownership boundary for Guardrails.

## Layout

- `client/domain/` owns Guardrail Set normalization, defaults, persistence payloads, and version/diff behavior.
- `client/page/` owns the Guardrails overview, editor, publishing, restore, comparison, and version-management UI.
- `client/shell/` owns Guardrails state, backend synchronization, lifecycle, navigation history, top navigation, and the Configure sidebar entry.
- `client/integrations/agents/` owns Guardrails selection, rendering, and version-diff integration inside the Agents service.
- `client/styles/` owns the Guardrails page, version comparison, and Agents-integration styles.
- `server/` owns Guardrail Set and Agent Guardrail proxy routes plus enforcement-time thread-payload enrichment.

`examples/demo-server.mjs` remains the composition root. It supplies transport, auth, organization, Runner Chat, Agents, and shared versioning adapters through the public `index.mjs`; Guardrails owns the behavior mounted through those adapters.

The client fragment exports preserve the legacy browser evaluation order while keeping individual modules focused and reviewable.
