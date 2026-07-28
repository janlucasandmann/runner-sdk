<!-- platform-directory-guide:v1 -->

# Overview

## Purpose

This directory contains overview models, analytics, tables, and page composition for the shared Agents resource. Resource-independent UI belongs in `src/platform-ui`.

## Contents

- [`agents-overview-analytics-client.test.ts`](agents-overview-analytics-client.test.ts) — Regression coverage for Agents Overview Analytics Client.
- [`agents-overview-analytics-client.ts`](agents-overview-analytics-client.ts) — Boundary adapter for Agents Overview Analytics Client.
- [`agents-overview-analytics.test.ts`](agents-overview-analytics.test.ts) — Regression coverage for Agents Overview Analytics.
- [`agents-overview-analytics.ts`](agents-overview-analytics.ts) — Focused implementation of Agents Overview Analytics.
- [`agents-overview-model.test.ts`](agents-overview-model.test.ts) — Regression coverage for Agents Overview Model.
- [`agents-overview-model.ts`](agents-overview-model.ts) — State and projection logic for Agents Overview Model.
- [`agents-overview-page.test.tsx`](agents-overview-page.test.tsx) — Regression coverage for the Agents, Squads, and Functional Agents overview modes.
- [`agents-overview-page.tsx`](agents-overview-page.tsx) — Presentation composition for Agents Overview Page.
- [`functional-agent-catalog.ts`](functional-agent-catalog.ts) — Shared role identifiers for persisted, editable functional agents.
- [`index.ts`](index.ts) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-resource-overview-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
