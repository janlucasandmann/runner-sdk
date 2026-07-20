<!-- platform-directory-guide:v1 -->

# Platform checkbox

## Purpose

`PlatformCheckbox` is the shared compact selection control used by data tables,
file explorers, and other collection surfaces. It owns checked, indeterminate,
focus, hover, and disabled presentation while leaving state management with the
consumer.

Every instance requires an accessible `aria-label`. Use `checked` for selected
items and `indeterminate` for partial group selection.

## Working in this directory

Keep this primitive domain-neutral. Collection-specific selection behavior
belongs to the table, explorer, or other composite that consumes it.

## Verification

```bash
npx vitest run src/platform-ui/components/ui/checkbox
npm run platform-component-invariants
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
