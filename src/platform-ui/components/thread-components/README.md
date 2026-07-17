# Thread components

Thread components are reusable presentation modules that understand thread,
run, and working-log concepts. They are intentionally separate from the
domain-agnostic `ui` primitives and `composite` building blocks.

- `log-boxes`: typed working-log renderers, detail drawers, parsing helpers,
  and their colocated tests.
- `document-preview`: the attachment-preview composition shell plus isolated
  directory, PDF, and specialized preview renderers.

New thread UI should import from this category or one of its canonical
subpaths. The former `src/react/runner-log-boxes.tsx` and
`src/react/runner-document-preview-drawer.tsx` modules are compatibility
facades only.
