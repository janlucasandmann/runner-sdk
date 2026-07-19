<!-- platform-directory-guide:v1 -->

# Agents

## Purpose

This directory contains agents behavior for the owning feature for the Evaluations service in Configure Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`lifecycle.mjs`](lifecycle.mjs) — Focused implementation of Lifecycle.
- [`modal.mjs`](modal.mjs) — Focused implementation of Modal.
- [`props.mjs`](props.mjs) — Focused implementation of Props.
- [`refs.mjs`](refs.mjs) — Focused implementation of Refs.
- [`state.mjs`](state.mjs) — State ownership for this layer.
- [`styles.mjs`](styles.mjs) — Style composition for Styles.
- [`view.mjs`](view.mjs) — Presentation renderer for this layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run evaluations-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
