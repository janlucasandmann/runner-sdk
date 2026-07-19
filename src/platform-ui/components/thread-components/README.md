<!-- platform-directory-guide:v1 -->

# Thread components

## Purpose

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
