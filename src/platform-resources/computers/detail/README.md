<!-- platform-directory-guide:v1 -->

# Computer Details

## Purpose

`ComputerDetailPage` owns the computer-specific composition of the shared
General, Runtime, and Settings detail surfaces. General is the initial,
sidebar-free overview for analytics and runtime configuration.
`ComputerRuntimeEditor` adapts the centralized code workspace and Monaco editor
to the complete effective Dockerfile returned by the Computers API. Settings is
the rightmost tab and uses the canonical resource Settings page for editable
identity, deployment location, GitHub connection, team access, and the details
sidebar.
Data mutations remain in the computer resource controller.

The runtime source contract deliberately keeps the generated/effective file
separate from `dockerfileExtensions`. The current API can read the complete
Dockerfile but only writes a base image plus extension suffix. The full file is
therefore displayed and exported to newly connected GitHub repositories without
being written back as an extension (which would duplicate generated build
instructions). A future repository sync implementation should add an explicit
whole-Dockerfile replace/validate/build API before enabling bidirectional edits.

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
