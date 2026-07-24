<!-- platform-directory-guide:v1 -->

# Controller

## Purpose

This directory contains interaction controllers and effect orchestration for the Fine Tuning service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`access.mjs`](access.mjs) — Fine-tuning ownership, team sharing, and resource-specific permission-page orchestration.
- [`actions.mjs`](actions.mjs) — Focused implementation of Actions.
- [`create-modal.mjs`](create-modal.mjs) — Focused implementation of Create Modal.
- [`detail.mjs`](detail.mjs) — Focused implementation of Detail.
- [`editor.mjs`](editor.mjs) — Focused implementation of Editor.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`overview.mjs`](overview.mjs) — Focused implementation of Overview.
- [`setup.mjs`](setup.mjs) — Initialization for this layer.
- [`verification.mjs`](verification.mjs) — Focused implementation of Verification.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run fine-tuning-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
