# Code preview box

`PlatformCodePreviewBox` is the canonical two-column quickstart and API example surface. It owns:

- the title, description, and optional action;
- the centralized primary button for the optional action;
- language selection and copy controls;
- a lightweight static syntax preview;
- an optional lazy Monaco preview for richer read-only code rendering;
- loading, error, responsive, and accessibility behavior.

Use `mode="static"` for short examples that should render immediately. Use `mode="editor"` when Monaco syntax rendering is required; the editor package is loaded only while an editor-mode instance is mounted.

```tsx
<PlatformCodePreviewBox
  title="Database API"
  description="Read collections from this database."
  action={{ label: "API reference", onClick: openDocs }}
  languages={[
    { value: "javascript", label: "javascript" },
    { value: "python", label: "python" },
  ]}
  language={language}
  onLanguageChange={setLanguage}
  code={snippets[language]}
  mode="editor"
/>
```
