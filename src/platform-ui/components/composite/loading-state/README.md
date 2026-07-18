# Platform loading state

`PlatformLoadingState` is the canonical inline loading composition for platform
surfaces. It pairs the shared animated dot loader with concise status copy.

Use `centered` for page-level and fill-layout loading states. Otherwise the
component remains an inline-flex element that can be placed inside controls,
panels, or table regions.

Import it from `platform-ui/components/composite/loading-state`, and load
`platform-ui/components/composite/loading-state/styles.css` once in standalone
hosts.
