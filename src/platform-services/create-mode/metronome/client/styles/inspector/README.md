<!-- platform-directory-guide:v1 -->

# Inspector

## Purpose

This directory contains inspector composition and interaction behavior for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-foundation-and-fields.mjs`](01-foundation-and-fields.mjs) — Focused implementation of 01 Foundation And Fields.
- [`02-selectors-and-editors.mjs`](02-selectors-and-editors.mjs) — State and projection logic for 02 Selectors And Editors.
- [`03-modals-and-responsive.mjs`](03-modals-and-responsive.mjs) — Focused implementation of 03 Modals And Responsive.

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
- [Platform architecture](../../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../../docs/development/readme-standard.md)
