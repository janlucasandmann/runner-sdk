<!-- platform-directory-guide:v1 -->

# Versioning

## Purpose

Reusable UI for versioned platform resources.

`PlatformVersionSaveDialog` reviews pending changes, chooses whether to update
the current version or create the next version, and captures an optional
description before the caller persists and publishes the resource.

The package also re-exports `PlatformVersionLabel` and
`PlatformVersionHistorySidebar` so resource modules can import the complete
versioning surface from one stable entry point.

Mutation logic and resource-specific change mapping stay with the calling
resource. File changes can use the canonical `PlatformDiffViewer` composite,
while the save dialog remains independent of Metronome, Agent, or Computer API
contracts.

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
