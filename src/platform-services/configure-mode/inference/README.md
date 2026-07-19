<!-- platform-directory-guide:v1 -->

# Inference service

## Purpose

Configure-mode ownership for customer-managed model inference and the execution-runtime surface presented alongside it.

- `client/domain` owns inference normalization, model discovery helpers, and local-runtime record formatting.
- `client/page/overview` owns the typed endpoint inventory built on the shared overview, hero, card, and table components.
- `client/page/detail` owns endpoint management through the shared detail shell, tabs, settings sections, selectors, tables, sidebar, and confirmation modal.
- `client/page` bridges the existing organization inference and local-runner state into the typed overview and detail pages.
- `client/styles` owns endpoint, runtime, and local-runner styling.
- `client/shell` owns state, lifecycle, navigation, autosave handlers, history, and sidebar integration.
- `server` owns inference connection-test proxying while preserving the existing billing-prefixed route.

Billing retains shared plan, usage, and preference-storage behavior; Inference owns the configuration experience.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run inference-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
