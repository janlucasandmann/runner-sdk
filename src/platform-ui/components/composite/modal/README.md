# Platform modal

`PlatformModal` is the default dialog primitive for the platform. It owns portal rendering, backdrop and Escape dismissal, focus trapping and restoration, document scroll locking, animation state, accessibility attributes, and the canonical title area.

The canonical dialog variants are `small` (400px), `medium` (640px), and `large` (880px). `medium` is the default. The specialized `compact`, `wide`, and `full` presets remain available for dense utility dialogs and immersive workflows. `width`, `maxWidth`, and `maxHeight` can override a preset when a resource-specific layout genuinely requires it.

`PlatformModalBackdrop` and `PlatformModalSurface` are composable escape hatches for externally managed portal or transition lifecycles. They retain the same canonical classes and presentation; new modal flows should prefer `PlatformModal`.

Every `PlatformModal` requires exactly one `title`, accepts an optional `description`, and renders its own plain Lucide X close control. The default header displays that title; specialized headers retain it as the accessible dialog name. Consumers provide body and footer content only; they must not render a second modal heading.

Set `headerVariant="search"` and provide `headerSearchProps` for search-first selection dialogs. This variant keeps `title` as the dialog's visually hidden accessible name, renders the shared search input as the header content, and focuses that input whenever the modal opens. Optional `headerActions` appear after the search field for filters or other tightly related controls.

The high-level modal always owns three structural slots: header, body, and footer. Children become body content and the optional `footer` prop becomes footer content. Existing explicit `PlatformModalBody` and `PlatformModalFooter` children are recognized without adding nested slots. Set `showHeader`, `showBody`, or `showFooter` to `false` when a flow intentionally omits that part; an omitted visual header retains the title as the accessible dialog name.

The structured surface itself has no padding. The body owns 24px padding, while the header and footer each own 12px vertical and 24px horizontal padding. Empty body and footer slots collapse visually. Low-level `PlatformModalSurface` usage retains 24px compatibility padding unless it opts into the structured layout.

Opening is synchronous with the render that sets `open=true`; callers must not stage a separate `visible` frame. The browser handles the 60ms transition through `@starting-style`, beginning at 75% scale, so ordinary React rerenders cannot restart the animation. The same duration controls retained rendering during close.

Intrinsic width and height changes animate by default with a 140ms resize transition. The shared surface interrupts and retargets an in-progress resize instead of jumping, observes non-React layout changes, and disables the effect when reduced motion is requested. Set `animateResize={false}` for a modal whose dimensions must change immediately, or override `resizeAnimationDurationMs` when a specialized workflow needs different timing.

The canonical surface is intentionally solid and minimal: `#1a1a1a` background, a `1px` white/7.5 border, 15px radius, no decorative pseudo-border, and visually hidden scrollbars while preserving scrolling. The backdrop applies the shared 10px blur while visible and closing.

`PlatformConfirmationModal` is the reusable confirmation composite for irreversible or consequential actions. It places initial focus on Cancel, blocks dismissal while its async confirmation is pending, and renders rejected mutation errors inside the dialog. Use `tone="destructive"` for deletion while keeping the initiating toolbar icon visually neutral.
