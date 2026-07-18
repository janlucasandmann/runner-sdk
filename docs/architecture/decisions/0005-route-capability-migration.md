# ADR 0005: Migrate platform routes by capability behind an explicit fallback

- Status: Accepted
- Date: 2026-07-18

## Context

The typed client can render a growing set of platform pages, while the
compatibility browser program still owns important detail and command
controllers. Treating a typed overview as a completed migration hides those
runtime dependencies and makes a root cutover unsafe.

A flag-day replacement would also create a large conflict surface for product
work. We need a migration that can advance one route at a time, proves
behavioral ownership, and always has a deliberate rollback path.

## Decision

Every registered route records ownership of four capabilities:

- presentation;
- queries;
- details;
- commands.

Ownership is `native`, `compatibility`, `mixed`, or `not-applicable`. A route
is native only when every applicable capability is native and its typed
renderer no longer receives a compatibility command fallback.

During migration:

- `/platform-client/...` serves the typed application;
- `/compat` serves the quarantined compatibility application;
- `/` remains on the compatibility application until the root-cutover exit
  criteria are satisfied.

Typed routes may hand an unsupported action to `/compat` with explicit route,
action, and resource identifiers. Native routes may not receive that escape
hatch. API keys are the first route migrated through the complete contract.
Voice Agents now owns typed presentation, queries, configuration details, and
all voice-specific commands; only opening a generated thread remains a
compatibility handoff.
Configure Home owns presentation, resource-count queries, cross-route
navigation, pricing, and documentation links without a compatibility command
handoff.

## Root-cutover exit criteria

The typed application becomes the primary entry only when:

1. the default landing route and global navigation are native;
2. authentication redirects can return to the typed entry;
3. thread opening and the primary create flow are native;
4. direct URL, refresh, back/forward, and cross-mode navigation tests pass;
5. every compatibility handoff targets `/compat`, never `/`;
6. production assets and development HMR serve both entries;
7. the compatibility application can be restored without a rebuild.

The cutover is a routing change, not a renderer rewrite. `/compat` remains
available through the observation period and is removed only after route
telemetry shows no required fallback traffic.

## Consequences

- Route progress is measured by behavior, not by component count.
- Migration work can be isolated to an owning service and its typed route.
- Aggregate tests prevent route ownership from silently moving backward.
- Compatibility code can be deleted capability by capability after the typed
  entry becomes primary.
- The root switch requires a short coordination window because it changes the
  application composition root and global navigation, but service and shared
  UI work can continue during all earlier phases.

## Verification

- `src/platform-app/routing/platform-route-capabilities.test.ts` checks route
  coverage, presentation registration, and migration ratchets.
- `apps/platform/server/routes/page-and-static-routes.test.mjs` preserves the
  explicit `/compat` document route.
- Typed route tests cover domain adapters, commands, and browser behavior.
- Both TypeScript typechecks and `npm run platform:architecture-test` remain
  required for capability ownership changes.
