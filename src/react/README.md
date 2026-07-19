<!-- platform-directory-guide:v1 -->

# React compatibility surfaces

## Purpose

This directory contains the Runner compatibility composition and public React facades that are still consumed by embedded execution surfaces.

## Contents

- [`runner-chat/`](runner-chat/) — Bounded implementation modules composed by
  the RunnerChat compatibility root.
- [`thread/`](thread/) — This directory renders the canonical event-projected thread timeline, live supervision docks, routing receipts, and permission decisions.
- [`dot-loader.tsx`](dot-loader.tsx) — Focused implementation of Dot Loader.
- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`pdfjs-dist-shim.d.ts`](pdfjs-dist-shim.d.ts) — Type contracts for this boundary.
- [`react-dom-shim.d.ts`](react-dom-shim.d.ts) — Type contracts for this boundary.
- [`runner-agents-list-log-box.tsx`](runner-agents-list-log-box.tsx) — Focused implementation of Runner Agents List Log Box.
- [`runner-chat-animations.ts`](runner-chat-animations.ts) — Focused implementation of Runner Chat Animations.
- [`runner-chat-css.ts`](runner-chat-css.ts) — Style composition for Runner Chat CSS.
- [`runner-chat-styles.ts`](runner-chat-styles.ts) — Style composition for Runner Chat Styles.
- [`runner-chat-workspace-selector.test.tsx`](runner-chat-workspace-selector.test.tsx) — Regression coverage for Runner Chat Workspace Selector.
- [`runner-chat.css`](runner-chat.css) — Styles for Runner Chat.
- [`runner-chat.tsx`](runner-chat.tsx) — Focused implementation of Runner Chat.
- [`runner-document-preview-drawer.tsx`](runner-document-preview-drawer.tsx) — Focused implementation of Runner Document Preview Drawer.
- [`runner-document-preview.ts`](runner-document-preview.ts) — Focused implementation of Runner Document Preview.
- [`runner-environments-list-log-box.tsx`](runner-environments-list-log-box.tsx) — Focused implementation of Runner Environments List Log Box.
- [`runner-file-diff-surface.tsx`](runner-file-diff-surface.tsx) — Focused implementation of Runner File Diff Surface.
- [`runner-git-commit-log-box.tsx`](runner-git-commit-log-box.tsx) — Focused implementation of Runner Git Commit Log Box.
- [`runner-git-diff-log-box.tsx`](runner-git-diff-log-box.tsx) — Focused implementation of Runner Git Diff Log Box.
- [`runner-git-log-utils.ts`](runner-git-log-utils.ts) — Focused helpers for Runner Git Log Utils.
- [`runner-git-status-log-box.tsx`](runner-git-status-log-box.tsx) — Focused implementation of Runner Git Status Log Box.
- [`runner-image-edit-overlays.tsx`](runner-image-edit-overlays.tsx) — Focused implementation of Runner Image Edit Overlays.
- [`runner-image-preview-surface.tsx`](runner-image-preview-surface.tsx) — Focused implementation of Runner Image Preview Surface.
- [`runner-lazy-media-preview.tsx`](runner-lazy-media-preview.tsx) — Focused implementation of Runner Lazy Media Preview.
- [`runner-log-boxes.tsx`](runner-log-boxes.tsx) — Focused implementation of Runner Log Boxes.
- [`runner-log-card.tsx`](runner-log-card.tsx) — Focused implementation of Runner Log Card.
- [`runner-log-list.tsx`](runner-log-list.tsx) — Focused implementation of Runner Log List.
- [`runner-markdown.tsx`](runner-markdown.tsx) — Focused implementation of Runner Markdown.
- [`runner-presentation-preview.tsx`](runner-presentation-preview.tsx) — Focused implementation of Runner Presentation Preview.
- [`runner-presentation-utils.ts`](runner-presentation-utils.ts) — Focused helpers for Runner Presentation Utils.
- [`runner-projects-list-log-box.tsx`](runner-projects-list-log-box.tsx) — Focused implementation of Runner Projects List Log Box.
- [`runner-resources-list-log-box.tsx`](runner-resources-list-log-box.tsx) — Focused implementation of Runner Resources List Log Box.
- [`runner-spreadsheet-preview.tsx`](runner-spreadsheet-preview.tsx) — Focused implementation of Runner Spreadsheet Preview.
- [`runner-spreadsheet-utils.ts`](runner-spreadsheet-utils.ts) — Focused helpers for Runner Spreadsheet Utils.
- [`runner-threads-list-log-box.tsx`](runner-threads-list-log-box.tsx) — Focused implementation of Runner Threads List Log Box.
- [`task-composer.tsx`](task-composer.tsx) — Focused implementation of Task Composer.
- [`use-runner-execution.ts`](use-runner-execution.ts) — React controller for Runner Execution.

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
