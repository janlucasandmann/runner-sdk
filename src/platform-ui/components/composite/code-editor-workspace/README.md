# Code editor workspace

`PlatformCodeEditorWorkspace` is the canonical multi-file editing surface. It owns:

- the file navigation rail and active-file presentation;
- the editor content region and empty states;
- the status footer;
- primary and secondary footer actions rendered through the shared button primitives.

The caller remains responsible for file data, editor implementation, draft state, and persistence.
Use `variant="full-screen"` when the workspace should occupy the complete width and height exposed by its content container.

```tsx
<PlatformCodeEditorWorkspace
  files={[{ id: "main.py", label: "main.py" }]}
  activeFileId="main.py"
  variant="full-screen"
  onFileSelect={setActiveFileId}
  editor={<Editor value={source} onChange={setSource} />}
  status="Unsaved changes"
  actions={[
    { id: "revert", label: "Revert", onClick: revert },
    { id: "save", label: "Save", variant: "primary", onClick: save },
  ]}
/>
```
