<!-- platform-directory-guide:v1 -->

# Onboarding Client

## Purpose

Composes the onboarding domain, page, shell integration, and feature-specific
styles without introducing a second application runtime.

## Contents

- [`domain/`](domain/) - Pure flow and snapshot rules.
- [`page/`](page/) - Full-screen onboarding presentation.
- [`shell/`](shell/) - Legacy host bridge and lifecycle orchestration.
- [`styles/`](styles/) - Onboarding-owned styles.

## Working in this directory

Compose browser-facing onboarding code through this directory's public entry
point. Keep pure step and snapshot rules in `domain`, screen rendering in `page`,
global runtime integration in `shell`, and feature-only CSS in `styles`.

## Verification

Run the focused checks from the repository root:

```bash
npm run onboarding-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
