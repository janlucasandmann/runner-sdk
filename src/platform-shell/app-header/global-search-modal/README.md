<!-- platform-directory-guide:v1 -->

# Global search modal

## Purpose

`PlatformGlobalSearchModal` is the application-shell command search opened with Cmd/Ctrl+K.

The component owns:

- canonical fixed-height modal structure, focus management, and dismissal;
- the controlled search input;
- the shared minimal popup for selecting Threads, Files, Tickets, Agents, or Workflows;
- generic action and grouped resource-result presentation;
- single-line result rows with optional identifiers, resource-native visuals, and right-aligned metadata;
- hover-revealed icon controls for opening, renaming, and requesting deletion;
- contextual Go, Edit, and Delete shortcut hints in the modal footer;
- pointer-targeted result shortcuts for navigation, inline editing, and deletion;
- reusable confirmation-modal deletion with pending and inline error handling;
- the centralized loading-state component and shared empty-state presentation;
- active-result, result-count, and Escape-close footer states;
- accessible section and dialog semantics.

The shell remains responsible for loading only the selected resource type, projecting it into the typed view models, and handling navigation after a result is selected. Organization-scoped resources are cached with the active request scope, preventing stale results from appearing after an organization switch. This keeps data access and routing outside the presentation component.

Use `global-search-modal.css` with the component. The legacy platform adapter injects the same stylesheet as an App Header style fragment.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run app-header-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
