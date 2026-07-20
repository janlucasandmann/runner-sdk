<!-- platform-directory-guide:v1 -->

# Attachments

## Purpose

`PlatformAttachments` is the canonical attachment card for resource detail
pages. It owns the shared card surface, upload actions, hidden file input,
drag-and-drop behavior, empty state, add-file row, attachment list, and removal
controls.

Callers provide normalized rows and domain callbacks. Preview retrieval,
authorization headers, persistence, and resource-specific upload targets remain
outside this component.

```tsx
<PlatformAttachments
  items={attachments}
  onFilesDrop={(files) => upload(files)}
  onInputChange={(event) => upload(Array.from(event.target.files ?? []))}
  onUploadFromComputer={openComputerPicker}
/>
```

Import it from `platform-ui/components/composite/attachments`.

## Working in this directory

Keep the component domain-neutral. Add new row capabilities through optional
slots or callbacks instead of importing project, file-service, or backend code.

## Verification

Run the focused component tests and platform component invariants:

```bash
npx vitest run src/platform-ui/components/composite/attachments
npm run platform-component-invariants
```

## Related documentation

- [Composite component guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
