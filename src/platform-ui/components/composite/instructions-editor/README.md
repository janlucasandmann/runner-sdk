<!-- platform-directory-guide:v1 -->

# Instructions editor

## Purpose

`PlatformInstructionsEditor` is the canonical instruction-writing surface for agents and other configurable resources. It owns:

- Markdown preview rendering and safe underline compatibility
- Bold, italic, underline, list, ordered-list, code, and link controls
- Undo and redo history
- Keyboard shortcuts
- Edit/preview behavior and textarea sizing
- Read-only presentation

Consumers provide a controlled value and persist changes through `onChange`; they must not duplicate Markdown toolbar or renderer logic.

Use `variant="minimalistic-ui"` for modal and compact composition surfaces that need the same editing behavior without the editor's framed header and body treatment. This variant uses transparent, zero-padding, square container surfaces while preserving the Markdown controls and interaction model.

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
