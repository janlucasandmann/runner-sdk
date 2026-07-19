<!-- platform-directory-guide:v1 -->

# Architecture documentation

## Purpose

This directory documents system structure, ownership boundaries, and the decisions that constrain future platform changes.

## Contents

- [`decisions/`](decisions/) — This directory contains immutable Architecture Decision Records. Supersede an accepted decision with a new record instead of silently rewriting its history.

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
- [Directory README standard](../development/readme-standard.md)
