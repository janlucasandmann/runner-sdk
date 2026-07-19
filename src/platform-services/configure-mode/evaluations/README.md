<!-- platform-directory-guide:v1 -->

# Evaluations service

## Purpose

Configure-mode ownership for evaluation sets, versions, cases, and runs.

- `client/page` owns evaluation normalization, versioning, execution, analytics, tables, editors, and dialogs.
- `client/shell` owns platform state, navigation, history, lifecycle, sidebar, and page integration.
- `client/integrations/agents` owns the evaluation surface embedded in Agent details.
- `client/styles` owns the standalone Evaluations page stylesheet.
- `server/domain` owns normalization, refinement, scoring, and cost accounting.
- `server/runtime` owns stateful evaluation execution and the service routes.

The root `index.mjs` is the only integration surface required by the platform host.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run evaluations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
