<!-- platform-directory-guide:v1 -->

# Platform integrations

## Purpose

This directory contains typed browser integrations with external platforms. Each provider must remain isolated behind its own adapter.

## Contents

- [`google-drive/`](google-drive/) — This directory owns the browser-side Google Drive picker adapter and its provider-specific contract.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
