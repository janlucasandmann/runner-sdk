# Global search modal

`PlatformGlobalSearchModal` is the application-shell command search opened with Cmd/Ctrl+K.

The component owns:

- canonical fixed-height modal structure, focus management, and dismissal;
- the controlled search input;
- the shared minimal popup for selecting Threads, Files, Tickets, Agents, or Workflows;
- generic action and grouped resource-result presentation;
- single-line result rows with optional identifiers, resource-native visuals, and right-aligned metadata;
- shared icon-only controls for opening, renaming, and requesting deletion;
- reusable confirmation-modal deletion with pending and inline error handling;
- loading, empty, active-result, and footer states;
- accessible section and dialog semantics.

The shell remains responsible for loading only the selected resource type, projecting it into the typed view models, and handling navigation after a result is selected. Organization-scoped resources are cached with the active request scope, preventing stale results from appearing after an organization switch. This keeps data access and routing outside the presentation component.

Use `global-search-modal.css` with the component. The legacy platform adapter injects the same stylesheet as an App Header style fragment.
