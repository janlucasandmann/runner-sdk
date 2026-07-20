<!-- platform-directory-guide:v1 -->

# Code editor workspace

## Purpose

`PlatformCodeEditorWorkspace` is the canonical multi-file editing surface. It owns:

- the file navigation rail and active-file presentation;
- a VS Code-style tab strip with persistent open files, keyboard navigation, close controls, and dirty-state markers;
- a two-line Explorer header with actions above full-width file search;
- file filtering through the shared `PlatformSearch` primitive;
- centered file-loading feedback through the shared `PlatformLoadingState`;
- nested-file disclosure and optional sidebar actions;
- the editor content region and empty states;
- the status footer;
- Undo and Redo controls rendered through the shared icon-button primitive.

The caller remains responsible for file data, editor implementation, draft state, and persistence.
Set `openInTab={false}` on navigational file rows such as folders. File rows can expose
`dirty`, `closable`, `tabLabel`, and `tabIcon` metadata for the editor tab strip.
Use `variant="full-screen"` when the workspace should occupy the complete width and height exposed by its content container.

```tsx
<PlatformCodeEditorWorkspace
  files={[{ id: "main.py", label: "main.py" }]}
  activeFileId="main.py"
  variant="full-screen"
  onFileSelect={setActiveFileId}
  editor={<Editor value={source} onChange={setSource} />}
  status="Unsaved changes"
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
