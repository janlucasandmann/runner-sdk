<!-- platform-directory-guide:v1 -->

# Inspector

## Purpose

This directory contains inspector composition and interaction behavior for the Metronome service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`01-rich-fields.mjs`](01-rich-fields.mjs) — Focused implementation of 01 Rich Fields.
- [`02-triggers-and-conditions.mjs`](02-triggers-and-conditions.mjs) — Focused implementation of 02 Triggers And Conditions.
- [`03-agent-and-resource-settings.mjs`](03-agent-and-resource-settings.mjs) — Focused implementation of 03 Agent And Resource Settings.
- [`04-integration-and-composition.mjs`](04-integration-and-composition.mjs) — Focused implementation of 04 Integration And Composition.

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
