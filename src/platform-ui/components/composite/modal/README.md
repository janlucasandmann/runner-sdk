# Platform modal

`PlatformModal` is the default dialog primitive for the platform. It owns portal rendering, backdrop and Escape dismissal, focus trapping and restoration, document scroll locking, animation state, accessibility attributes, and the visual contract used by the New Issue dialog.

Use the `compact`, `small`, `medium`, `large`, `wide`, or `full` size presets. `width`, `maxWidth`, and `maxHeight` can override those presets for resource-specific layouts without creating another modal shell.

`PlatformModalBackdrop` and `PlatformModalSurface` are composable escape hatches for externally managed portal or transition lifecycles. They retain the same canonical classes and presentation; new modal flows should prefer `PlatformModal`.
