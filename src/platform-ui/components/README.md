# Platform UI components

Reusable, domain-agnostic platform components are separated by composition level:

- `ui`: small primitives such as buttons, search inputs, and segmented switches.
- `composite`: assembled interfaces such as analytics sections, tables, modals, popups, and home widgets.

Every component keeps its React API, styles, tests, and documentation in its own directory. Feature and resource modules should use the category barrels or canonical category subpaths. The root `platform-ui/components` barrel remains available when a consumer intentionally needs both layers.

Legacy package subpaths remain compatibility aliases only. New code must import from `platform-ui/components/ui/*` or `platform-ui/components/composite/*` so the dependency level is explicit.
