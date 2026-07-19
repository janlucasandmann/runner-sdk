<!-- platform-directory-guide:v1 -->

# Client Page

## Purpose

This directory contains page composition and page-local interaction behavior for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`overview/`](overview/) — This directory contains overview models, analytics, tables, and page composition for the Guardrails service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`controller.mjs`](controller.mjs) — Interaction orchestration for Controller.
- [`editor.mjs`](editor.mjs) — Focused implementation of Editor.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`table.mjs`](table.mjs) — Focused implementation of Table.
- [`version-actions.mjs`](version-actions.mjs) — Focused implementation of Version Actions.
- [`version-views.mjs`](version-views.mjs) — Focused implementation of Version Views.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run guardrails-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
