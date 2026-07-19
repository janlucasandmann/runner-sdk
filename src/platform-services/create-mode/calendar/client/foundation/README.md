<!-- platform-directory-guide:v1 -->

# Foundation

## Purpose

This directory contains initialization and third-party foundation adapters for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`date-imports.mjs`](date-imports.mjs) — Focused implementation of Date Imports.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`localizer.mjs`](localizer.mjs) — Focused implementation of Localizer.
- [`vendor-import.mjs`](vendor-import.mjs) — Focused implementation of Vendor Import.

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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
