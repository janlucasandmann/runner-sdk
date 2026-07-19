<!-- platform-directory-guide:v1 -->

# Platform empty state

## Purpose

`PlatformEmptyState` provides the canonical icon, title, and supporting-description composition for empty tables, charts, and other data surfaces.

Pass an icon component and context-specific copy. The surrounding table, chart, or page remains responsible for sizing and placement.

Import the component from `platform-ui/components/composite/empty-state`, and load `platform-ui/components/composite/empty-state/styles.css` once in standalone hosts.

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
