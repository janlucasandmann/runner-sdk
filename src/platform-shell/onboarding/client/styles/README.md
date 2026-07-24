<!-- platform-directory-guide:v1 -->

# Onboarding Styles

## Purpose

Owns styles used exclusively by the platform onboarding overlay.

## Contents

- [`onboarding.mjs`](onboarding.mjs) - Feature stylesheet composed into the platform document.
- [`index.mjs`](index.mjs) - Public style export.

## Working in this directory

Keep selectors scoped to onboarding classes and rely on centralized platform
primitives for shared modal and button behavior. Move generally reusable styles
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
