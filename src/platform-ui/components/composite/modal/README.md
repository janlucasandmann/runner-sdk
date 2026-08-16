<!-- platform-directory-guide:v1 -->

# Platform modal

## Purpose

`PlatformModal` is the default dialog primitive for the platform. It owns portal rendering, backdrop and Escape dismissal, focus trapping and restoration, document scroll locking, animation state, accessibility attributes, and the canonical title area.

The canonical dialog variants are `small` (400px), `medium` (640px), and `large` (880px). `medium` is the default. The specialized `compact`, `wide`, and `full` presets remain available for dense utility dialogs and immersive workflows. `width`, `maxWidth`, and `maxHeight` can override a preset when a resource-specific layout genuinely requires it.

`PlatformModalBackdrop` and `PlatformModalSurface` are composable escape hatches for externally managed portal or transition lifecycles. They retain the same canonical classes and presentation; new modal flows should prefer `PlatformModal`.

Every `PlatformModal` requires exactly one `title`, accepts an optional `description`, and renders its own plain Lucide X close control. The default header displays that title; specialized headers retain it as the accessible dialog name. Consumers provide body and footer content only; they must not render a second modal heading.

Set `headerVariant="search"` and provide `headerSearchProps` for search-first selection dialogs. This variant keeps `title` as the dialog's visually hidden accessible name, renders the shared search input as the header content, and focuses that input whenever the modal opens. Optional `headerActions` appear after the search field for filters or other tightly related controls.

Set `headerVariant="media"` and provide `headerMedia` when a workflow needs a visual identity or preview area in place of the standard title row. The slot accepts arbitrary React content, including a background-image container and editable identity controls, and imposes no minimum height of its own. The required `title` and optional `description` remain visually hidden as the accessible dialog name and description, while the modal retains its canonical close behavior.

The high-level modal always owns three structural slots: header, body, and footer. Children become body content and the optional `footer` prop becomes footer content. Existing explicit `PlatformModalBody` and `PlatformModalFooter` children are recognized without adding nested slots. Set `showHeader`, `showBody`, or `showFooter` to `false` when a flow intentionally omits that part; an omitted visual header retains the title as the accessible dialog name.

Split workflows use `PlatformModalSplitLayout`, `PlatformModalSidebar`, and
`PlatformModalContent`. The sidebar and content primitives own matching 49px
header rows with identical horizontal and vertical padding. Put the dialog
title in the sidebar and the active workflow controls in the content header;
the required `PlatformModal` title remains the accessible dialog name.

Guided setup flows use `PlatformSetupModal` and `PlatformSetupModalStep`. This
variant keeps the same modal lifecycle and accessibility contract while
providing a large responsive two-pane composition: context, benefits, and
supporting actions on the left; numbered configuration steps and final actions
on the right. Keep domain-specific form controls in the step content instead of
reimplementing the split shell, close control, focus handling, or responsive
stacking in a feature stylesheet.

The structured surface itself has no padding. The body owns 24px padding, while the header and footer each own 12px vertical and 24px horizontal padding. Empty body and footer slots collapse visually. Low-level `PlatformModalSurface` usage retains 24px compatibility padding unless it opts into the structured layout.

Opening mounts synchronously with the render that sets `open=true`, then the shared modal lifecycle advances the backdrop and surface from their opening state on the next animation frame. Closing uses the inverse state and retains the dialog for the same canonical 60ms duration before unmounting. Consumers must not implement their own visibility frame or exit timer; every modal built with `PlatformModal` therefore receives the same appearance and disappearance transition. `@starting-style` remains as compatibility coverage for the low-level backdrop and surface escape hatches.

Intrinsic width and height changes animate by default with a 140ms resize transition. The shared surface interrupts and retargets an in-progress resize instead of jumping, observes non-React layout changes, and disables the effect when reduced motion is requested. Set `animateResize={false}` for a modal whose dimensions must change immediately, or override `resizeAnimationDurationMs` when a specialized workflow needs different timing.

The canonical surface is intentionally solid and minimal: `#1a1a1a` background, a `1px` white/7.5 border, 15px radius, no decorative pseudo-border, and visually hidden scrollbars while preserving scrolling. The backdrop applies the shared 10px blur while visible and closing.

`PlatformConfirmationModal` is the reusable confirmation composite for irreversible or consequential actions. It places initial focus on Cancel, blocks dismissal while its async confirmation is pending, and renders rejected mutation errors inside the dialog. Use `tone="destructive"` for deletion while keeping the initiating toolbar icon visually neutral.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-modal-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
