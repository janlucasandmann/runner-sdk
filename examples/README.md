<!-- platform-directory-guide:v1 -->

# Platform examples

## Purpose

This directory contains consumer-oriented examples and manual previews. Automated regression tests belong under `tests/` or beside their source.

## Contents

- [`nextjs-client-usage.ts`](nextjs-client-usage.ts) — Boundary adapter for Next.js Client Usage.
- [`react-runner-chat.tsx`](react-runner-chat.tsx) — Focused implementation of React Runner Chat.
- [`react-runner-panel.tsx`](react-runner-panel.tsx) — Focused implementation of React Runner Panel.
- [`thread-ui-preview.mjs`](thread-ui-preview.mjs) — Focused implementation of Thread UI Preview.

## Running examples

TypeScript examples demonstrate consumer composition and are compiled by the
normal build. The interactive thread preview requires built artifacts:

```bash
npm run thread-preview
```

Examples may use illustrative data, but they must import public entry points
rather than source internals. If an example becomes a regression requirement,
move the assertion into a colocated test or `tests/`.

## Working in this directory

Keep examples small, copyable, and explicit about required providers and
styles. Never include real credentials, customer records, or environment-bound
URLs.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run build
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../docs/platform-architecture.md)
- [Directory README standard](../docs/development/readme-standard.md)
