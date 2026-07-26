<!-- platform-directory-guide:v1 -->

# Evidence Agents service

## Purpose

Evidence Agents is the Develop Mode boundary for human review and controlled
publication of structured scientific evidence. The first supported service
profile is Equal Care.

The service discovers an organization-scoped Equal Care function, presents
extraction candidates with exact source provenance, and routes approval and
rejection through dedicated evidence permissions. Canonical validation and
promotion stay inside the evidence function, so a browser cannot construct or
write canonical records.

An approval requires `evidence:promote`, an owner or admin organization role,
and manage access to the function resource. Rejection requires
`evidence:review`, an owner/admin/developer role, and edit access. Reads require
`evidence:read` and use access.

## Structure

- [`client/`](client/) — Browser contracts, API adapter, workspace pages, and
  application-shell fragments.
- [`server/`](server/) — Same-origin `/api/real` proxy route ownership.
- [`evidence-agents-service-test.mjs`](evidence-agents-service-test.mjs) —
  Module, shell, styling, and registration boundary checks.
- [`index.ts`](index.ts) and [`index.mjs`](index.mjs) — Typed and server-side
  public entry points.

Canonical schemas, review decisions, atomic promotion, and the verified query
projection are owned by `repos/equal-care/services/canonical-evidence`.

## Working in this directory

Keep scientific rules and database writes out of the browser service. Add
transport behavior to `client/api`, response contracts to `client/domain`, UI
composition to `client/page`, and legacy navigation integration to
`client/shell`. Reuse centralized platform UI components and preserve the
platform dark theme.

## Verification

Run from the Runner Web SDK repository root:

```bash
npm run evidence-agents-service-test
npx tsc -p tsconfig.build.json --noEmit
npm run check:boundaries
```

## Related documentation

- [Develop Mode services](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
- [Equal Care review and MCP runbook](../../../../../equal-care/human-review-and-evidence-mcp.md)
