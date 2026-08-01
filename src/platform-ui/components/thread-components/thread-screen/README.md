<!-- platform-directory-guide:v1 -->

# Thread screen

## Purpose

This directory owns the reusable presentation shells for the canonical thread
screen: compact execution receipts, the conversation/workbench layout, and the
workbench frame. Domain hydration and action-specific rendering remain in
`src/react/thread`; these components consume bounded presentation models and
React slots instead of transport data.

## Working in this directory

Keep these components free of API calls and legacy Runner state. Add thread
semantics to `src/thread/presentation.ts`, then adapt them at the canonical
React boundary. Styles are owned by `thread-screen.css` and composed through
the shared Runner style manifest.

## Verification

Run the focused checks from the repository root:

```bash
npx vitest run src/thread/presentation.test.ts src/react/runner-chat/canonical-thread-surface.test.tsx
npm run typecheck
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
