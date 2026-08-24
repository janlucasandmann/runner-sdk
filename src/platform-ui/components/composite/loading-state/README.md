<!-- platform-directory-guide:v1 -->

# Platform loading state

## Purpose

`PlatformLoadingState` is the canonical inline loading composition for platform
surfaces. It renders the shared 24px animated spinner without visible status
copy. The `message` remains the accessible status label for assistive technology.

Use `centered` for page-level and fill-layout loading states. Otherwise the
component remains an inline-flex element that can be placed inside controls,
panels, or table regions.

Import it from `platform-ui/components/composite/loading-state`, and load
`platform-ui/components/composite/loading-state/styles.css` once in standalone
hosts.

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
