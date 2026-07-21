<!-- platform-directory-guide:v1 -->

# File explorer

## Purpose

`PlatformFileExplorerModal` is the low-level canonical split-pane file picker.
It uses the shared modal lifecycle and its sidebar/content primitives and keeps
all pane headers aligned.

`PlatformFileExplorerBrowserModal` is the standard product-facing explorer.
It owns the complete source rail, back/forward navigation, breadcrumbs, search,
file filters, list states, preview slot, and action footer used by task inputs
and resource attachment flows. Prefer it whenever users browse workspace or
integration files; callers provide records and callbacks, not layout markup.

Callers retain ownership of file loading, authorization, selection, navigation,
and attachment mutations. The browser modal filters supplied records for its
standard All Files, Recently Changed, Images, and PDFs tabs. Its `content` slot
is reserved for authorization or provider-specific empty states. The low-level
modal remains available for genuinely different explorer compositions.

`PlatformFileExplorerThumbnail` renders lazy image thumbnails, can retry with
the source file URL, and falls back to the caller's canonical file icon when
neither image source can be rendered.

`PlatformFileExplorerFileIcon` shares the exact folder and document artwork
used by the Files page. Image rows use real thumbnails when available and the
same Lucide image fallback as Files. Use thumbnails only for entries positively
identified as images.

## Working in this directory

Keep the component domain-neutral. Do not import Runner, file-service, or
connector state into this package.

## Verification

```bash
npx vitest run src/platform-ui/components/composite/file-explorer
npm run platform-modal-test
npm run check:boundaries
```

## Related documentation

- [Composite component guide](../README.md)
- [Platform modal](../modal/README.md)
