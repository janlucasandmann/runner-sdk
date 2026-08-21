<!-- platform-directory-guide:v1 -->

# Instructions editor

## Purpose

`PlatformInstructionsEditor` is the canonical instruction-writing surface for agents and other configurable resources. It owns:

- Rendered rich-text editing with Markdown-compatible persistence
- Safe read-only Markdown rendering and underline compatibility
- Native keyboard undo/redo plus a centralized Style menu for paragraphs, headings,
  paragraph quotes, block quotes, and unboxed preformatted text
- Bold, italic, underline, list, and ordered-list controls plus a centralized
  insert menu for code, links, optional files, and dividers
- A selection-aware right-click menu for toggling bold, italic, and underline
  plus persistent left, center, and right paragraph/heading alignment
- A slash-anchored, scrollable `/` command menu that exposes formatting,
  alignment, and insert commands with shortcut hints, filtering, and full
  keyboard navigation; the same menu opens at the caret when unselected editor
  text is right-clicked
- Explicit character deletion and deterministic link insertion for both text
  selections and collapsed cursors
- GFM table insertion from the toolbar, slash menu, or `Shift+Alt+T`, with a
  three-column header-first default, native cell navigation, and a table-local
  hover/focus ellipsis menu with grouped row, column, and whole-table actions
  that preserve Markdown round trips
- ProseMirror-backed selection, keyboard shortcuts, and undo/redo history
- Optional multi-file upload, caret/drop-position insertion, and drag-and-drop handling
- Optional centralized prompt search with selection-aware Markdown insertion from
  the header's Insert menu
- Inline image rendering with persisted small, medium, and full-width sizing,
  durable attachment metadata, and hover actions for copy, rename, and removal,
  plus reusable attachment rows for documents and other non-image files
- Read-only presentation

Consumers provide a controlled Markdown value and persist changes through
`onChange`; they must not duplicate toolbar, serialization, or renderer logic.
Use `contentVariant="file-enabled"` with a `fileUpload.upload(files)` adapter
when the owning resource can persist attachments. The adapter returns durable
URLs plus file metadata and an optional attachment ID. Opaque adapter metadata
is returned with the same upload transaction through the `onChange` context so
resource owners can commit editor content and attachment records atomically; it
is never serialized into Markdown. Images remain compatible Markdown images
with an editor-owned title marker for display size and durable attachment
identity; their destinations are canonicalized so spaces and parentheses cannot
escape into visible document text. Other files use the editor-owned `:::attachment` Markdown
node so editable and read-only views render the same attachment row. The editor
never persists local blob or base64 URLs.

Protected image integrations provide `fileUpload.resolvePreviewSource(file,
signal)` and return an authenticated `Blob` (or a directly renderable URL).
The editor owns the temporary object URL and revokes it when the image changes
or unmounts; the protected durable URL remains the only value persisted in
Markdown.

`contentVariant="image-enabled"` and `imageUpload` remain compatibility aliases
for existing image-only consumers. New resource integrations should use the
generic file API.

Provide `promptInsertion.openSearch(onSelect)` only on surfaces that should
offer the Insert → Prompt action. The host keeps ownership of global search,
access checks, and loading the selected prompt's current version; the editor
captures the current selection and inserts the returned Markdown at that
position (or appends it when the editor was not focused).

The toolbar popup behavior lives in `platform-instructions-editor-toolbar-popup.tsx`;
the slash-command presentation lives in `platform-instructions-editor-slash-menu.tsx`.
The Tiptap and read-only Markdown support for paragraph quotes lives in
`paragraph-quote.ts`; keep its editor and renderer representations in sync.
Generic file-node serialization, keyboard deletion, and read-only rendering
live in `platform-instructions-editor-file-node.tsx`.
Image serialization, metadata, sizing, actions, and malformed-destination repair
live in `platform-instructions-editor-image-node.tsx`.

Use `variant="minimalistic-ui"` for modal and compact composition surfaces that need the same editing behavior without the editor's framed header and body treatment. This variant uses transparent, zero-padding, square container surfaces while preserving the Markdown controls and interaction model.

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
