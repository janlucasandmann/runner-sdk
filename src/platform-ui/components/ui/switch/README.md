# Platform switch

`PlatformSwitch` is the shared controlled segmented switch used for compact mutually exclusive view and mode choices. Its default presentation matches the Agents/Squads selector in the task-input agent popup.

The switch has the same 28px outer height as default platform buttons and shared search inputs.

Pass stable string-valued `options`, the current `value`, and `onValueChange`. The component owns option rendering, active state, radio-group semantics, roving focus, and arrow/Home/End keyboard navigation.
