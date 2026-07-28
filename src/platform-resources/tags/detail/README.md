<!-- platform-directory-guide:v1 -->

# Tag Details

## Purpose

`TagDetailPage` owns the Tag and Plugin composition of the shared
`ResourceDetailPage`, including the connector identity header and the Overview,
Authentication, and Permissions views. The local page navigation is
authoritative so connector credentials, access roles, and provider context stay
stable across every shell consumer. The Overview view owns the shared connector
information and included-action surfaces while allowing each resource to append
its operational analytics or capability content.

Connection state, authentication flows, analytics data, and persistence remain
in the resource controller. Shared page structure, navigation, sidebar
transitions, authentication empty/loading states, analytics, instructions
editing, selectors, cards, and permissions UI must use the centralized platform
components.

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
