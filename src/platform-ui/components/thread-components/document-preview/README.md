<!-- platform-directory-guide:v1 -->

# Document preview

## Purpose

This directory owns the thread-facing attachment preview experience. The
public entry point is `index.ts`; the former
`src/react/runner-document-preview-drawer.tsx` path is a compatibility facade
and must not regain implementation logic.
`document-preview.css` owns the drawer and specialized preview cascade and is
composed through `scripts/runner-chat-style-sources.mjs`.
Preview contracts, image editing/preview surfaces, file diffs, presentations,
and spreadsheets are owned here as well. Their former `src/react` entry points
are compatibility facades only.
Shared thread file/icon assets live in the adjacent `assets/` directory; the
production asset copier retains the private `dist/react/assets` output path for
compatibility.

## Responsibility map

- `document-preview-drawer.tsx` is the composition shell. It selects the
  attachment mode, coordinates shared header controls, and composes the
  specialized renderers.
- `directory-preview.tsx` owns directory probing, request cancellation,
  expansion state, recursive rendering, and file-open delivery.
- `pdf-preview.tsx` owns PDF.js loading, canvas rendering, cancellation,
  visible-page tracking, pagination, and zoom.
- `image-preview-state.ts` contains bounded image zoom transitions and pure
  crop geometry used by the drawer's image tools.
- `preview-state.ts` contains attachment, path, MIME, editability, and file
  metadata helpers that can be tested without React.
- `pdf-preview-state.ts` contains bounded PDF page and zoom transitions.
- `specialized-preview-view.tsx` renders web-search, image-understanding, and
  media-generation summaries.

Tests are colocated with their state or view boundary. New preview behavior
should be placed in the narrowest responsible module instead of expanding the
drawer shell.

## Dependency direction

```text
document-preview-drawer
  -> directory-preview -> preview-state
  -> image tools       -> image-preview-state
  -> pdf-preview       -> pdf-preview-state
  -> specialized-preview-view
```

The modules still consume a small set of legacy Runner preview contracts and
renderers through the documented temporary import-boundary seam. Dependencies
must not flow from reusable platform UI into `platform-resources`,
`platform-runtime`, `platform-services`, or `platform-shell`.

## Verification

Run the focused suite with:

```sh
npx vitest run src/platform-ui/components/thread-components/document-preview
npm run lint:thread-document-preview-boundaries
npm run format:check:thread-document-preview-boundaries
npm run platform:architecture-test
```

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
