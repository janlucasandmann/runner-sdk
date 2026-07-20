<!-- platform-directory-guide:v1 -->

# Agents Client

## Purpose

This directory contains browser-side public composition and integration for the shared Agents resource. Resource-independent UI belongs in `src/platform-ui`.

## Contents

- [`agent-list-cache.test.ts`](agent-list-cache.test.ts) — Regression coverage for scoped Agent list normalization and caching.
- [`agent-list-cache.ts`](agent-list-cache.ts) — Organization- and account-scoped Agent list normalization and stale-while-revalidate cache.
- [`agent-resource-client.test.ts`](agent-resource-client.test.ts) — Regression coverage for Agent Resource Client.
- [`agent-resource-client.ts`](agent-resource-client.ts) — Boundary adapter for Agent Resource Client.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`use-agent-resource-repository.ts`](use-agent-resource-repository.ts) — React controller for Agent Resource Repository.

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
