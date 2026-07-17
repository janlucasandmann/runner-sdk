# Platform UI components

Platform components are separated by composition level and domain ownership:

- `ui`: small primitives such as buttons, search inputs, and segmented switches.
- `composite`: assembled interfaces such as analytics sections, tables, modals, popups, and home widgets.
- `thread-components`: reusable interfaces that understand thread, run, and working-log concepts.

Every component keeps its React API, styles, tests, and documentation in its own directory. Feature and resource modules should use the category barrels or canonical category subpaths. The root `platform-ui/components` barrel remains available when a consumer intentionally needs multiple categories.

Legacy package subpaths remain compatibility aliases only. New code must import from `platform-ui/components/ui/*`, `platform-ui/components/composite/*`, or `platform-ui/components/thread-components/*` so the dependency level and ownership are explicit.
