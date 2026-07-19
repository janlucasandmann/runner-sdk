<!-- platform-directory-guide:v1 -->

# Page Data

## Purpose

This directory contains page data behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`attachments.mjs`](attachments.mjs) — Focused implementation of Attachments.
- [`draft-factory.mjs`](draft-factory.mjs) — Focused implementation of Draft Factory.
- [`editor-formatting.mjs`](editor-formatting.mjs) — Focused implementation of Editor Formatting.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`loading.mjs`](loading.mjs) — Focused implementation of Loading.
- [`persistence.mjs`](persistence.mjs) — Focused implementation of Persistence.
- [`save-state.mjs`](save-state.mjs) — State and projection logic for Save State.
- [`status.mjs`](status.mjs) — Focused implementation of Status.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run calendar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
