<!-- platform-directory-guide:v1 -->

# Client Styles

## Purpose

This directory contains ordered, owner-scoped style modules for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`inspector/`](inspector/) — This directory contains inspector composition and interaction behavior for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`editor.mjs`](editor.mjs) — Focused implementation of Editor.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`inspector.mjs`](inspector.mjs) — Focused implementation of Inspector.
- [`modals.mjs`](modals.mjs) — Focused implementation of Modals.
- [`overview.mjs`](overview.mjs) — Focused implementation of Overview.
- [`runs.mjs`](runs.mjs) — Focused implementation of Runs.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run metronome-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
