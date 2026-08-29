<!-- platform-directory-guide:v1 -->

# Popup

## Purpose

This directory owns the Popup composite component, including its public API, presentation, styles, and colocated tests.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`platform-info-tooltip.tsx`](platform-info-tooltip.tsx) — Portaled hover/focus information affordance with optional runtime guidance.
- [`platform-info-tooltip.test.tsx`](platform-info-tooltip.test.tsx) — Interaction and accessibility coverage for information tooltips.
- [`platform-popup.test.tsx`](platform-popup.test.tsx) — Regression coverage for Platform Popup.
- [`platform-popup-search-header.tsx`](platform-popup-search-header.tsx) — Reusable popup search row with optional icon and shortcut hint.
- [`platform-popup.tsx`](platform-popup.tsx) — Focused implementation of Platform Popup.
- [`popup.css`](popup.css) — Styles for Popup.

## Usage

`PlatformPopup` is controlled: the caller owns `open`, trigger interaction,
Escape handling, outside-click dismissal, and focus return. The component keeps
the anchor mounted and owns the canonical surface and optional portal
positioning.

```tsx
const [open, setOpen] = useState(false);

<PlatformPopup
  open={open}
  portal
  placement="bottom-end"
  variant="minimal"
  trigger={
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
    >
      More
    </button>
  }
  surfaceProps={{ role: "menu", maxHeight: "min(420px, 70vh)" }}
>
  <PopupActions onSelect={() => setOpen(false)} />
</PlatformPopup>
```

Use `portal` when an overflow ancestor could clip the surface. Portaled popups
track anchor resize, viewport resize, and ancestor scrolling; placement flips
when the requested side lacks room. `portalMatchAnchorWidth` is appropriate for
selectors, while action menus normally size to content.

`PlatformPopupSurface` is the lower-level surface for context menus or hosts
that already own positioning. `PlatformPopupDismissLayer` supplies canonical
backdrop geometry but deliberately does not decide how state closes.

`PlatformPopupSearchHeader` provides the standard searchable popup header.
Prefer the first-class `searchHeader` option on `PlatformPopup`, or
`popupSearch` on the centralized selector controls, so spacing, the divider,
and focus behavior remain consistent. The lower-level component stays
available for composite popup layouts that own their own header structure.

`PlatformInfoTooltip` is the centralized compact information sign for form and
settings labels. It opens on hover or keyboard focus, uses a portaled minimal
surface to avoid clipping, and can separate a plain-language description from
an optional “At runtime” enforcement note.

## Variants and animation

- `default` is the full platform popup treatment.
- `minimal` is the compact surface used by mode and account-style menus.
- `animation={false}` disables entry animation; otherwise use a typed
  `PlatformPopupAnimation`.
- `animateHeight` opt-in animates content-height changes and respects reduced
  motion.

## Working in this directory

Keep positioning, portal behavior, surface variants, and animation centralized.
Feature-specific menu items and open-state policy belong to the caller. Every
new interaction contract needs keyboard and portal regression coverage.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-popup-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
