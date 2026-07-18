# Platform routing ownership

The route registry defines the stable product navigation model. Capability
ownership records whether each route's presentation, queries, details, and
commands are implemented by the typed application or by the quarantined
compatibility runtime.

A typed overview is not a fully migrated route. A route reaches `native` only
when every applicable capability is native and the route no longer receives an
`onOpenLegacy` escape hatch.

The typed application is mounted under `/platform-client/...` during the
migration. Compatibility handoffs target `/compat`; `/` is not used as an
implicit fallback because it will eventually become the typed entry.

`platform-compatibility-navigation.ts` owns the fallback URL contract. It
preserves route/action diagnostics and translates supported cross-route deep
links, such as a Voice Agent test session opening a legacy thread by
`threadId`.

## Migration procedure

1. Capture the existing behavior with route and browser tests.
2. Implement typed queries and commands in the owning resource or service.
3. Add typed detail routing when the resource has a detail surface.
4. Remove the corresponding compatibility controller behavior.
5. Update the capability ownership entry in the same change.
6. Lower the migration baseline when a meaningful group of routes advances.

The capability test checks registry coverage, aligns native presentation with
the typed route outlet, and prevents the aggregate migration from moving
backwards silently.
