<!-- platform-directory-guide:v1 -->

# Models service

## Purpose

Configure-mode ownership for the managed model catalog and Models page.

- `client/page` owns catalog normalization, filtering, pricing, sorting, and rendering.
- `client/styles` owns the Models page stylesheet.
- `client/shell` owns platform state, catalog loading, navigation, history, top navigation, sidebar, and page integration.
- `client/integrations/agents` owns the Models link embedded in Agent overview actions.
- `server` owns the managed agent-model catalog proxy route.

The root `index.mjs` is the only integration surface required by the platform host.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run models-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
