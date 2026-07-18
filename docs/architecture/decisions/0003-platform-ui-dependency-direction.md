# ADR 0003: Keep platform UI independent of owning domains and Runner compatibility

- Status: Accepted
- Date: 2026-07-17

## Context

Shared platform components were originally extracted from the Runner
compatibility surface. Some extracted thread and loading components still
imported implementations from `src/react`, creating a reverse dependency:
platform UI depended on the compatibility layer while the compatibility layer
also depended on platform UI.

That cycle made ownership unclear, forced broad import exceptions, and made it
possible for new shared behavior to drift back into compatibility files.

## Decision

`src/platform-ui` is an independent presentation layer. It may depend on
external packages and root data contracts, but it must not import:

- `src/platform-app`;
- `src/platform-resources`;
- `src/platform-services`;
- `src/platform-shell`;
- `src/react`.

Thread presentation, preview contracts, preview surfaces, Markdown rendering,
log-box renderers, shared loading primitives, and the thread style runtime are
owned beneath `src/platform-ui/components`.

When an existing private Runner entry point must remain available,
`src/react` exposes a thin re-export facade pointing to the platform-owned
implementation. Facades contain no behavior and have ratcheted line budgets.
The dependency direction is therefore always:

```text
owning product domains
        |
        v
   platform-ui  <-----  Runner composition / compatibility facades
```

## Consequences

- Shared components can be consumed without pulling in Runner orchestration.
- Runner's private compatibility API remains source-compatible during
  migration.
- Platform UI changes have one implementation owner.
- New reverse imports fail the static quality gate.
- Generated thread CSS and its mount runtime live with the thread components;
  the former Runner paths are facades only.

## Verification

- `npm run check:boundaries` rejects owning-domain and Runner imports from
  platform UI.
- `npm run platform:architecture-test` verifies compatibility facades, source
  budgets, and the ordered thread style cascade.
- `npm run platform:development-asset-test` verifies source-CSS HMR uses the
  platform-owned style runtime.
