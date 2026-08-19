<!-- platform-directory-guide:v1 -->

# Platform status indicator

## Purpose

`PlatformStatusIndicator` is the canonical transient receipt for completed,
running, or otherwise noteworthy platform actions. It owns the compact title,
supporting copy, optional provider media, progress treatment, entry/exit motion,
and dismissal control used by connector callbacks and composer actions.

Use `PlatformStatusIndicatorStack` when a host manages more than one receipt.
Hosts own placement and receipt lifetime; the component owns presentation and
dismissal motion. Import it from
`platform-ui/components/composite/status-indicator` and load the accompanying
`styles.css` once in standalone hosts.

## Working in this directory

Keep this component domain-neutral. Provider-specific orchestration, API calls,
and persistence belong to the calling service. Preserve the compatibility class
names until the legacy shell has fully migrated its placement rules.

## Verification

```bash
npx vitest run src/platform-ui/components/composite/status-indicator/platform-status-indicator.test.tsx
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
