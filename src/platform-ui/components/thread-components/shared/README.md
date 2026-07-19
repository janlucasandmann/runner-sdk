<!-- platform-directory-guide:v1 -->

# Shared thread presentation

## Purpose

This directory owns presentation helpers used by multiple thread features:
entry animation metadata, deferred media mounting, and grounded Markdown
rendering.

Runner compatibility entry points under `src/react` re-export these
implementations. New platform UI code must import this owned module directly.

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
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
