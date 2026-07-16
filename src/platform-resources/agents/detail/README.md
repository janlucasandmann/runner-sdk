# Agent detail resource

This directory owns the reusable Agent Details page shell and its resource-specific controls.

- `AgentDetailPage` composes the canonical resource detail layout and agent tabs.
- `AgentPermissionsPage` binds the shared permission editor to immutable agent policy updates.
- `AgentPermissionMeters` and `AgentPermissionRingIcons` provide canonical agent permission summaries.
- `AgentPublishControl` owns the Save & Publish split button and version-actions popup.
- Host applications provide agent state, persistence callbacks, and version actions as props.

Agent-specific UI should be added here rather than embedded in a demo or application shell.
