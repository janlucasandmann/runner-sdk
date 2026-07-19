<!-- platform-directory-guide:v1 -->

# Platform widgets

## Purpose

The initial platform home screen widgets share one compositional base:

- `PlatformDefaultWidget` owns the common shell, class composition, and accessible keyboard activation.
- `PlatformProjectWidget` renders the active project and task surface.
- `PlatformCalendarWidget` renders the compact week and schedule view.
- `PlatformUsageWidget` renders remaining usage and its meter.

Concrete widgets compose `PlatformDefaultWidget`; they do not duplicate shell interaction behavior. Their existing `playground-thread-widget*` DOM classes and inline CSS custom properties are intentionally preserved because the platform stylesheet remains the source of truth for their visual design.

Keep data loading, normalization, routing, and billing calculations outside this directory. Pass display-ready values and callbacks into the widgets.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
