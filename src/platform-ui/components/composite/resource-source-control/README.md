# Resource source control

`PlatformResourceSourceControl` is the canonical UI for synchronizing a Computer Agents resource with a GitHub repository. It owns direction, lifecycle triggers, monorepo path, conflict policy, manual runs, and synchronization health.

Repository selection, base-branch selection, and provider connection remain in the owning connector surface. Resource pages should pass a stable `resourceKind`, `resourceId`, and `repositoryFullName`; they should not implement their own webhook or polling behavior.

Repository disconnect flows must call `disconnectPlatformResourceSourceControl` before removing page-owned connector metadata. This prevents a hidden durable binding from continuing to react to webhooks after the UI connection disappears.

The component supports Functions, Web Apps, Skills, Agents, and Computers. New source-backed resource types should first add a backend resource adapter and then extend the shared kind union rather than create a resource-specific sync UI.

Repository discovery may use the connected GitHub account, but durable synchronization deliberately requires the Computer Agents GitHub App installation for that repository. The backend returns an actionable setup error until the repository-scoped App permissions and webhook events are available.
