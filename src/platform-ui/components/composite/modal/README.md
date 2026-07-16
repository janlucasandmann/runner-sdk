# Platform modal

`PlatformModal` is the default dialog primitive for the platform. It owns portal rendering, backdrop and Escape dismissal, focus trapping and restoration, document scroll locking, animation state, accessibility attributes, and the canonical title area.

The canonical dialog variants are `small` (400px), `medium` (640px), and `large` (880px). `medium` is the default. The specialized `compact`, `wide`, and `full` presets remain available for dense utility dialogs and immersive workflows. `width`, `maxWidth`, and `maxHeight` can override a preset when a resource-specific layout genuinely requires it.

`PlatformModalBackdrop` and `PlatformModalSurface` are composable escape hatches for externally managed portal or transition lifecycles. They retain the same canonical classes and presentation; new modal flows should prefer `PlatformModal`.

Every `PlatformModal` requires exactly one visible `title`, accepts an optional `description`, and renders its own plain Lucide X close control. Consumers provide body and footer content only; they must not render a second modal heading.

The title area ends with 12px bottom padding and a white/10 divider. Because the description is part of the same header, the divider naturally appears below the description when one exists and below the title otherwise.

The canonical surface is intentionally solid and minimal: `#1a1a1a` background, a `1px` white/7.5 border, 15px radius, 24px padding, no decorative pseudo-border, no backdrop blur, and visually hidden scrollbars while preserving scrolling.
