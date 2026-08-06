<!-- platform-directory-guide:v1 -->

# Code editor workspace

## Purpose

`PlatformCodeEditorWorkspace` is the canonical multi-file editing surface. It owns:

- the file navigation rail and active-file presentation;
- a compact `Files` sidebar header with shared create-file, upload, and create-folder actions;
- one active-file header instead of persistent editor tabs;
- file multi-selection through the shared `PlatformCheckbox` primitive;
- hierarchical file and folder rows with drag-and-drop moves into folders or back to the root;
- single-file rename/delete and multi-file delete menus through the shared minimal `PlatformPopup`;
- centered file-loading feedback through the shared `PlatformLoadingState`;
- nested-file disclosure and optional sidebar actions;
- the editor content region and empty states;
- automatic Markdown-file detection with the centralized live
  `PlatformInstructionsEditor` and formatting toolbar;
- an optional lazy, editable `PlatformMonacoCodeEditor` for language-aware
  source and structured-data editing;
- Undo and Redo controls rendered through the shared icon-button primitive in the active-file header.

The caller remains responsible for file data, editor implementation, draft
state, and persistence. Pass `markdownEditor` with the active file value and
change handler to enable rich Markdown editing for `.md`, `.markdown`,
`.mdown`, `.mkd`, and `.mkdn` files; other files continue to render `editor`.
Use `variant="full-screen"` when the workspace should occupy the complete width and height exposed by its content container.

```tsx
<PlatformCodeEditorWorkspace
  files={[{ id: "main.py", label: "main.py" }]}
  activeFileId="main.py"
  variant="full-screen"
  onFileSelect={setActiveFileId}
  onFileRename={renameFile}
  onFilesDelete={deleteFiles}
  onFilesMove={moveFiles}
  onCreateFile={createFile}
  onUploadFiles={uploadFiles}
  onCreateFolder={createFolder}
  editor={(
    <PlatformMonacoCodeEditor
      value={source}
      onChange={setSource}
      language="python"
      path={activeFileId}
    />
  )}
  markdownEditor={{
    value: source,
    onChange: setSource,
    historyKey: activeFileId,
  }}
  historyControls={{
    onUndo: undo,
    onRedo: redo,
    undoDisabled: !canUndo,
    redoDisabled: !canRedo,
  }}
/>
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
