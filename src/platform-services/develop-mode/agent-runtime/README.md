<!-- platform-directory-guide:v1 -->

# Agent Runtime service

## Purpose

`src/platform-services/develop-mode/agent-runtime` is the ownership boundary
for the Develop-mode Agent Runtime experience. Its client domain owns the
service definition and its client page owns the overview surface. Future
detail, settings, usage, and server modules for this service belong here.

## Usage

Import `AGENT_RUNTIME_RESOURCE_DEFINITION` and
`DevelopAgentRuntimeOverviewPage` from this service root. The definition feeds
Develop-mode registries; the page accepts the shared overview rows, period,
analytics, lifecycle state, and host-owned resource actions.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
