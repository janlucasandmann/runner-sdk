<!-- platform-directory-guide:v1 -->

# Agent detail resource

## Purpose

This directory owns the reusable Agent Details page shell and its resource-specific controls.

- `AgentDetailPage` composes the canonical resource detail layout and agent tabs.
- `AgentPermissionsPage` binds the shared permission editor to immutable agent policy updates.
- `AgentPermissionMeters` and `AgentPermissionRingIcons` provide canonical agent permission summaries.
- `AgentPublishControl` owns the Save & Publish split button and version-actions popup.
- Host applications provide agent state, persistence callbacks, and version actions as props.

Agent-specific UI should be added here rather than embedded in a demo or application shell.

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
