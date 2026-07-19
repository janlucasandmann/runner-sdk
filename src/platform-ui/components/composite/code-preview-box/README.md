<!-- platform-directory-guide:v1 -->

# Code preview box

## Purpose

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
