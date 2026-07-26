<!-- platform-directory-guide:v1 -->

# Engine provider icons

## Purpose

This directory contains provider marks used by the agent-details engine
selector.

## Contents

- [`claude-code.svg`](claude-code.svg) — Claude Code engine mark.
- [`grok-build.svg`](grok-build.svg) — Grok Build engine mark.

## Working in this directory

Keep these assets presentation-only and reference them through the platform
`/img` route. Retain source and licensing information when replacing an icon.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:legacy-controller-test
npm run docs:readmes
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
