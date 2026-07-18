# ADR 0006: Keep one platform document and migrate domains in place

- Status: Accepted
- Date: 2026-07-18

## Context

The repository temporarily contained two browser applications:

- the mature platform assembled from the existing browser composition; and
- a standalone typed preview with its own shell, route registry, session
  provider, history model, styles, Vite entry, and production bundle.

Both applications reused some typed pages, but they did not share the complete
product shell or behavior. Navigating through the development ports could
therefore open a visually and functionally different platform. Maintaining
authentication, deep links, commands, navigation, and presentation parity
across both runtimes increased risk without delivering user value.

## Decision

The mature platform is the only application document.

- The application server on port `4177` owns all HTML navigation.
- Vite on port `5173` is an HMR and source-transformation service only. It uses
  `appType: "custom"` and redirects HTML navigation to the application host.
- `/create`, `/configure`, `/develop`, `/platform-client`, `/compat`, and
  `/demo` are retired document roots. The application host redirects them to
  `/` while preserving query parameters.
- Raw thread paths are normalized to `/?thread=<thread-id>`.
- The standalone client entry, shell styles, route registry, route outlet,
  compatibility handoff, session provider, package export, build script, and
  static asset service are removed.

Reusable code is retained under neutral ownership:

- request clients and React providers live in `src/platform-runtime`;
- lazy page registration and browser-presentation facades live in
  `src/platform-shell/presentation`;
- resource, service, UI, and Runner modules remain with their owning domains.

Typed migration continues inside this single document. Extracted pages are
composed into the existing platform while equivalent browser fragments are
removed. A second shell is not an accepted migration mechanism.

## Consequences

- Users cannot enter a partial or differently styled platform by using the HMR
  port or a stale preview URL.
- Authentication and deep-link semantics have one owner.
- Typed domain work remains reusable without depending on a duplicate
  application scaffold.
- The remaining assembled browser program is still migration debt, but its
  reduction no longer requires maintaining two products.
- A future routing rewrite must replace the canonical document deliberately; it
  may not be introduced as a parallel runtime.

## Verification

- `apps/platform/development/vite-base.test.mjs` verifies HMR-only Vite
  navigation.
- `apps/platform/server/routes/page-and-static-routes.test.mjs` verifies the
  single-document and retired-path redirects.
- `apps/platform/testing/platform-architecture.test.mjs` verifies that the
  standalone source tree, scripts, exports, and route contract remain absent.
- `scripts/quality/check-build-artifacts.mjs` rejects emitted
  `platform-app` or `platform-client` artifacts.
