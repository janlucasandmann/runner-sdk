<!-- platform-directory-guide:v1 -->

# Resource Settings page

## Purpose

`PlatformResourceSettingsPage` is the canonical Settings-tab composition for
resource detail pages across Create, Configure, and Develop. It always owns:

1. The editable resource identity header (`PlatformResourceSettingsIdentity`)
2. The centralized `PlatformResourceSettingsDetailsSidebar`
3. The resource Access surface

Location and Connectors are ordered optional slots. Resource-specific settings
belong in `additionalSections`, after those standard slots and before Access.
When a nested Access detail is active, optional sections and the details
sidebar are removed while the identity and Access context remain mounted.

The resource page retains domain state, persistence, connector implementations,
and permission adapters. It passes those behaviors into this composition rather
than recreating the Settings layout.

The page also owns the details-sidebar positioning shell and width. On desktop,
every Settings details sidebar occupies the same 340px grid track; below the
shared responsive breakpoint it becomes a full-width row. Its single 42px top
inset aligns the sidebar with the identity header and remains sticky while the
Settings content scrolls. `detailsSidebarClassName` decorates only the nested
sidebar content; resource adapters must not attach project, ticket, or other
layout classes to the sticky shell.

The same contract is used by Knowledge, Prompts, Skills, Tests, Evaluations,
Agent Optimization, Assurance, Guardrails, Inference, Agents, Computers,
Workflows, Voice Agents, Security repositories, Databases, Functions, Web Apps,
APIs, Authentication, Agent Runtimes, Secrets, and Payments. Run and nested-item
views remain specialized because they do not own a resource Settings tab.

The standard details sidebar has a fixed contract: resource-specific
`customAttributes` render first, followed by Scope, Updated, Creator, Owner,
and the primary action. Scope defaults to Independent, supports one or several
Projects, and is omitted only for Project Settings. A single primary action is
rendered as a full-width primary button; additional actions are exposed through
the centralized split selector. Actions are text-only in this surface.

Updated values use the same `formatPlatformResourceUpdatedAt` formatter as the
centralized resource-overview Updated column: today's values show a time,
yesterday shows its relative label and time, and older values show their date.

## Working in this directory

Keep resource-specific state and API calls in the owning resource domain. Add
cross-resource layout or identity behavior here, preserve the standard slot
order, and cover contract changes in `platform-resource-settings-page.test.tsx`.
Consumers should supply the existing centralized section components rather than
restyling their internals from this page layer.

## Verification

```bash
npx vitest run src/platform-ui/pages/settings
npm run check:static
```

## Related documentation

- [Resource detail page](../details/README.md)
- [Settings sections](../../components/composite/settings-section/README.md)
- [Access control](../../../platform-resources/access-control/README.md)
