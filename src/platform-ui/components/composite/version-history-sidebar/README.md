# Version history sidebar

`PlatformVersionHistorySidebar` composes the floating-sidebar shell with an embedded minimal `PlatformDataTable`. The table uses the shared title toolbar and dedicated version and creation-date columns. It supports active and selected versions, restoring, publishing, centralized per-version row actions, loading and error states, creating versions from the sidebar header, and an explicit comparison action.

Resource domains remain responsible for persistence and for mapping their version records into titles, creation dates, and actions. Opening the sidebar is deliberately independent from opening a comparison page.
