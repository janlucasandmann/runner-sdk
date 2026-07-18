# Contributing

## Local setup

```bash
npm ci
npm run check
```

Use `npm run dev` for the watched platform host and Vite Fast Refresh. Copy
`.env.example` only as a reference; never commit secrets.

## Ownership rules

- Put product behavior in its owning domain under `src/platform-services`,
  `src/platform-resources`, or `src/platform-shell`.
- Put reusable UI in `src/platform-ui`. Thread-specific shared presentation
  belongs in `src/platform-ui/components/thread-components`.
- Treat `src/react` as the Runner composition and compatibility layer. New
  leaf components must not import an oversized composition root.
- Never import `src/react` or an owning product domain from `src/platform-ui`.
  Keep shared implementations in platform UI and expose compatibility
  re-exports from Runner when an old private entry point must survive.
- Treat `apps/platform/client/legacy` as quarantined migration code. Do not add
  new product behavior there when a typed owner exists.
- Keep browser and server ownership separated by HTTP/WebSocket contracts.

## Parallel-work discipline

- Inspect `git status --short` before editing.
- Do not reformat or mechanically rewrite files another contributor is
  changing.
- Preserve unrelated dirty worktree changes.
- Coordinate before moving shared directories, changing generated compatibility
  output, or applying repository-wide formatting.
- Source-hash compatibility fixtures are review gates. Update a hash only after
  inspecting and approving the assembled browser-source change.

## Pull request checklist

- `npm run check` passes.
- Tests cover changed behavior and architecture boundaries.
- Runtime/configuration changes update `.env.example` and the relevant docs.
- New imports respect domain ownership.
- Generated output and compatibility hashes change only when intentionally
  reviewed.
- User-facing deployment remains a separate, explicit operation.
