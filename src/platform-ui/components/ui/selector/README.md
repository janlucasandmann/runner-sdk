<!-- platform-directory-guide:v1 -->

# PlatformSelector

## Purpose

`PlatformSelector` is the canonical single-value selector for platform interfaces. Its trigger always presents the current label followed by the Lucide `ChevronsUpDown` icon, and its options render inside the shared `PlatformPopup`.

Selector surfaces are portal-positioned by default, so table, panel, and sidebar overflow cannot clip them. The popup follows its trigger during nested scrolling and flips or shifts when needed to remain inside the viewport.

`PlatformButtonSelector` provides the same portaled selector popup with a centralized primary or secondary button trigger. Use `mode="popup"` when the entire button opens the popup, or `mode="split-action"` when the main segment runs an action and only the chevron segment opens the popup.

`popupAlignment` controls which horizontal edge is anchored. It defaults to `"left"`; use `"right"` when the popup should end where the selector column ends. This is independent from `alignment`, which controls the trigger label layout.

Set `closeOnSelect` for action menus whose popup should close as soon as a button, link, menu item, or option is selected. The selected child action still runs before the popup is dismissed.

The component owns controlled or uncontrolled popup state, outside-click and Escape dismissal, keyboard option navigation, selected-state presentation, loading and empty states, and optional leading content such as profile pictures.

```tsx
<PlatformSelector
  value={access}
  options={[
    { value: "full_access", label: "Full access" },
    { value: "read_only", label: "Read only" },
  ]}
  ariaLabel="Ring 1 permissions"
  popupAlignment="right"
  onValueChange={setAccess}
/>
```

```tsx
<PlatformButtonSelector
  mode="split-action"
  buttonVariant="primary"
  label="Save & Publish"
  popupAriaLabel="Version save options"
  onAction={publish}
>
  {versionActions}
</PlatformButtonSelector>
```

Import the component and its styles through:

```ts
import { PlatformSelector } from "@computer-agents/platform/platform-ui/components/ui/selector";
import "@computer-agents/platform/platform-ui/components/ui/selector/styles.css";
```

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
