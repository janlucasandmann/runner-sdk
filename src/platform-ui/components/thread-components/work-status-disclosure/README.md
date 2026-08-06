<!-- platform-directory-guide:v1 -->

# Work status disclosure

## Purpose

This directory owns the reusable status row and collapsed raw-log surface for
one agent run. It is presentation-only: callers provide the lifecycle-derived
headline, live state, entries, and controlled expansion state.

While a run is live and collapsed, the component shows a read-only tail of the
latest rendered work entry. Expanding still renders the complete supplied
log, and ending the live state removes the collapsed tail immediately.

The live headline must come from the canonical thread observer contract. The
component intentionally does not infer status text from worker commands or
maintain its own expansion lifecycle.

## Working in this directory

Keep the component controlled and transport-agnostic. Observer status
selection, legacy turn-to-run bridging, and summary lifecycle detection belong
to the thread domain or RunnerChat leaf adapters; this directory should only
render the supplied presentation model.

## Verification

Run the focused checks from the repository root:

```bash
npx vitest run src/react/runner-chat/turn-presentation.test.tsx
npm run typecheck
```

## Related documentation

- [Parent directory guide](../README.md)
- [Thread screen](../thread-screen/README.md)
