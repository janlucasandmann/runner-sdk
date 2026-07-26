<!-- platform-directory-guide:v1 -->

# Agent Optimization service

## Purpose

Configure-mode ownership for evaluation-driven agent instruction optimization.
This service creates versioned instruction candidates; it does not currently
train or update model weights.

- `client/page` owns job normalization, overview/detail rendering, creation, and job actions.
- `client/shell` owns platform state, navigation, history, lifecycle, sidebar, and host-page integration.
- `client/styles` exposes the Agent Optimization page stylesheet.
- `server` owns job persistence, orchestration, verification, agent-version publication, and HTTP routes.

The root `index.mjs` is the only integration surface required by the platform host.
The existing `fine-tuning` route, API path, persisted field names, and module
identifiers remain compatibility aliases while product-facing language uses
Agent Optimization.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run fine-tuning-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Optimization and holdout model](./OPTIMIZATION_MODEL.md)
- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
