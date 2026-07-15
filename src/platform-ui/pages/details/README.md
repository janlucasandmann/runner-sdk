# Resource detail page

`ResourceDetailPage` is the canonical shell for resource detail screens. It composes:

1. A resource-provided title or rich identity header
2. The shared `PlatformDetailTabBar`
3. A page action row
4. The active content panel
5. The shared `PlatformDetailSidebar`

Navigation does not belong to this shell. Breadcrumbs, app-header paths, and back behavior remain the responsibility of the host application.

Resource-specific pages under `platform-resources/<resource>/detail` define their tab set and supply the content, actions, and sidebar controls.
