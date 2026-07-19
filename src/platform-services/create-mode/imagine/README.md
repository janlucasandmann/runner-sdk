<!-- platform-directory-guide:v1 -->

# Imagine service

## Purpose

This directory is the Create-mode ownership boundary for Imagine.

## Layout

- `client/page/` contains the Explore, My Templates, Favourites, and template-editor runtime in evaluation-order fragments.
- `client/template-page/` contains the selected-template generation experience, including context, settings, sharing, and rendering.
- `client/styles/` owns both page style systems and the Imagine additions to shared toolbar primitives.
- `client/shell/` contains the narrow fragments that Imagine mounts in the platform shell: state, navigation, lifecycle, team integration, sidebar entry, and top navigation.
- `server/` owns the authenticated Imagine preferences proxy routes.

The public `index.mjs` is the only import surface required by `apps/platform/server/index.mjs`. The platform host remains responsible for composing shared services (Runner Chat, projects, environments, agents, teams, billing, and navigation history) and passes those capabilities into Imagine explicitly.

The fragment exports preserve the browser runtime's legacy evaluation order while keeping each source file focused and independently reviewable. The complete `IMAGINE_PAGE_*` and `IMAGINE_TEMPLATE_PAGE_*` exports remain available for the host composition layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run imagine-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
