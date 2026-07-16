# Resource detail page

`ResourceDetailPage` is the canonical shell for resource detail screens. It composes:

1. A resource-provided title or rich identity header
2. The shared `PlatformDetailTabBar`
3. Optional resource controls at the right edge of the tab bar
4. The active content panel
5. The shared `PlatformDetailSidebar`

Navigation does not belong to this shell. Breadcrumbs, app-header paths, and back behavior remain the responsibility of the host application.

Resource-specific pages under `platform-resources/<resource>/detail` define their tab set and supply the content and sidebar controls. Use `tabBarActions` for resource-specific controls and `sidebarToggle` for the sidebar visibility control; the shell always renders the sidebar toggle last.
