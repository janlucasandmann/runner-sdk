# Metronome node inspector UI

Node inspectors share their controls and popup behavior through
`runtime/inspector-components.mjs`. Keep node-specific files focused on data and
configuration semantics rather than rebuilding UI primitives.

## Shared primitives

- `MetronomeInspectorField`, `MetronomeInspectorFieldTitle`, and
  `MetronomeInspectorFieldHint` define field structure.
- `MetronomeInspectorSelect` is the searchable minimal selector. Use it for new
  inspector selectors.
- `MetronomeInspectorNativeSelect` is the compatibility adapter for existing
  option-based call sites. It also renders `MetronomeInspectorSelect`; it does
  not render a native `select`.
- `MetronomeInspectorPickerPopup`, `MetronomeInspectorPickerRow`, and
  `MetronomeInspectorPickerState` define searchable inspector pickers and their
  loading, empty, and error states.
- `MetronomeInspectorToolbarPopup` is the shared shell for specialized toolbar
  content such as attachments.

Do not add node-specific popup geometry, global selector listeners, raw
`PlatformPopupSurface` selector menus, or duplicate selector option styles.
Instruction-side pickers use `left-start` placement anchored to the inspector's
left edge so the picker and inspector remain visible together.
