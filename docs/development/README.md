<!-- platform-directory-guide:v1 -->

# Development documentation

## Purpose

This directory contains contributor workflows for configuration, testing, and repository documentation.

## Contents

- [`configuration.md`](configuration.md) — Engineering documentation for Configuration.
- [`readme-standard.md`](readme-standard.md) — Engineering documentation for README Standard.
- [`testing.md`](testing.md) — Engineering documentation for Testing.

## Working in this directory

Write for a developer who does not have historical context. Prefer repository-relative links, executable commands from the repository root, and explicit ownership or safety boundaries. Update documentation in the same change as the contract it describes.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run docs:check
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../platform-architecture.md)
- [Directory README standard](readme-standard.md)
