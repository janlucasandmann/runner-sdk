# GitHub automations

`PlatformGitHubAutomations` is the canonical UI for repository event automations.
It deliberately has no Project or Develop-mode dependencies: callers provide a
scope and the component uses the shared GitHub automation control-plane API.

Project settings mount it with:

```tsx
<PlatformGitHubAutomations scopeType="project" scopeId={projectId} {...props} />
```

Function settings opt into the same checks plus exact-revision deployments:

```tsx
<PlatformGitHubAutomations
  scopeType="function"
  scopeId={functionId}
  automationKinds={["security_scan", "pull_request_review", "deploy_function"]}
  {...props}
/>
```

Develop → Webhooks must mount the same component with:

```tsx
<PlatformGitHubAutomations
  scopeType="organization"
  scopeId={organizationId}
  {...props}
/>
```

All variants persist the same binding shape and receive events through the
same signed GitHub ingress. Scope affects authorization, available resources,
and execution context; it does not create another webhook mechanism.
