<!-- platform-directory-guide:v1 -->

# Platform formatting

## Purpose

This directory owns domain-neutral, user-facing formatting rules that must stay
identical across platform surfaces. Consumers import the public functions from
`index.ts` instead of maintaining page-local date or label formatters.

`formatPlatformResourceUpdatedAt` is the canonical resource Updated formatter.
It shows only the local time for today, `Yesterday` plus the local time for the
previous calendar day, and a localized date for older values. The resource
Settings sidebar and centralized overview Updated column both use this exact
function.

## Working in this directory

Keep formatters pure and locale-aware, accept an injectable clock when relative
labels are involved, and add deterministic tests for calendar boundaries and
invalid inputs. Avoid coupling formatting utilities to React or a resource
service.

## Verification

```bash
npx vitest run src/platform-ui/formatting
npx tsc -p tsconfig.build.json --noEmit
```

## Related documentation

- [Resource Settings page](../pages/settings/README.md)
- [Resource overview page](../pages/overview/README.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
