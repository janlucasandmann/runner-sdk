<!-- platform-directory-guide:v1 -->

# Architecture decision records

## Purpose

This directory contains immutable Architecture Decision Records. Supersede an accepted decision with a new record instead of silently rewriting its history.

## Contents

- [`0001-private-platform-application.md`](0001-private-platform-application.md) — Engineering documentation for 0001 Private Platform Application.
- [`0002-runner-chat-composition-root.md`](0002-runner-chat-composition-root.md) — Engineering documentation for 0002 Runner Chat Composition Root.
- [`0003-platform-ui-dependency-direction.md`](0003-platform-ui-dependency-direction.md) — Engineering documentation for 0003 Platform UI Dependency Direction.
- [`0004-explicit-platform-source-assets.md`](0004-explicit-platform-source-assets.md) — Engineering documentation for 0004 Explicit Platform Source Assets.
- [`0005-route-capability-migration.md`](0005-route-capability-migration.md) — Engineering documentation for 0005 Route Capability Migration.
- [`0006-single-platform-document.md`](0006-single-platform-document.md) — Engineering documentation for 0006 Single Platform Document.
- [`0007-external-agent-gateway.md`](0007-external-agent-gateway.md) — Provider-neutral gateway for invoking and continuing agent threads from external work systems.

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
- [Platform architecture](../../platform-architecture.md)
- [Directory README standard](../../development/readme-standard.md)
