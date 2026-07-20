<!-- platform-directory-guide:v1 -->

# File explorer

## Purpose

`PlatformFileExplorerModal` is the canonical split-pane file picker. It uses
the shared modal lifecycle and its sidebar/content primitives, keeps both pane
headers at the same height and padding, and owns the responsive file-list,
preview, and action-footer layout.

Callers retain ownership of file loading, integration authorization,
selection, navigation, and attachment mutations. Supply those controls through
the optional sidebar-header, sidebar, content-header, main-content, preview, and
footer slots. The preview is a separate right-hand pane with its own header and
close action; closing it must clear the caller-owned preview state without
closing the explorer. The dialog `title` remains its accessible name when a
custom sidebar header replaces the visible title.

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
