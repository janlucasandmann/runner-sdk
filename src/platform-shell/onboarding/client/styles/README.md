<!-- platform-directory-guide:v1 -->

# Onboarding Styles

## Purpose

Owns styles used exclusively by the platform onboarding screen.

## Contents

- [`screen.mjs`](screen.mjs) - Viewport ownership, scroll locking, responsive shell, and screen isolation.
- [`flow.mjs`](flow.mjs) - Step content, transitions, controls, and onboarding-specific visuals.
- [`index.mjs`](index.mjs) - Public style export.

## Working in this directory

Keep selectors scoped to onboarding classes and rely on centralized platform
primitives for shared button behavior. The screen shell must remain independent
of modal sizing and presentation rules. Move generally reusable styles
to `src/platform-ui` instead of duplicating them here.

## Verification

```bash
npm run onboarding-service-test
npm run platform:legacy-template-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
