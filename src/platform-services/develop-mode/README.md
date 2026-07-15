# Develop mode services

Services surfaced in the platform's Develop mode belong in this directory.
Each service is an independent ownership boundary, matching the architecture in
Create and Configure mode.

## Services

- `develop-home/`
- `api-keys/`
- `web-apps/`
- `apis/`
- `functions/`
- `databases/`
- `authentication/`
- `agent-runtime/`
- `voice-agents/`
- `secrets/`
- `payments/`

Each service owns its `client/domain` definition and `client/page` surfaces;
future detail, usage, settings, runtime, styles, and server modules stay within
that service. `shared/` contains only reusable overview mechanics, and
`service-registry.tsx` is the thin composition boundary used by hosts that
select a service dynamically.
