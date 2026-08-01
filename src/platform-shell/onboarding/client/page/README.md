<!-- platform-directory-guide:v1 -->

# Onboarding Page

## Purpose

Owns the full-screen onboarding presentation and step-specific interactions. Service
operations are accepted as callbacks from the shell host.

## Contents

- [`screen.mjs`](screen.mjs) - Full-viewport shell, focus lifecycle, scroll locking, and video background.
- [`experience.mjs`](experience.mjs) - Step transitions, uploads, connector actions, and plan selection.
- [`index.mjs`](index.mjs) - Public page export.

## Working in this directory

Keep this layer presentation-focused. New service actions must enter through
the host callback contract; do not read unrelated shell state directly. The
experience is a screen-level route overlay and must not use modal primitives.
Preserve keyboard and dismissal behavior.

## Verification

```bash
npm run onboarding-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
