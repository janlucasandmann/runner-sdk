# App Sidebar

The App Sidebar owns the platform shell's expanded and collapsed navigation, Create / Configure / Develop mode selector, thread list renderers, thread action overlays, and sidebar layout styles.

Domain data and navigation handlers remain supplied by the host because the same state is consumed by main-content pages. Service-specific sidebar entries are composed through `createAppSidebarScriptFragments` so service modules retain ownership of their links.
