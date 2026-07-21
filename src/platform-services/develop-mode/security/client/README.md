<!-- platform-directory-guide:v1 -->

# Repository Security client

## Purpose

This directory composes the typed browser boundary for the Repository Security
service. It owns transport adaptation, domain contracts, React pages, styles,
and legacy-shell fragments while the platform host supplies authentication and
the shared API client.

## Contents

- [`api/`](api/) — Control-plane transport.
- [`domain/`](domain/) — Types and pure models.
- [`page/`](page/) — Workspace surfaces and styling.
- [`shell/`](shell/) — Legacy application composition fragments.
- [`index.ts`](index.ts) and [`index.mjs`](index.mjs) — Public entry points.

## Working in this directory

Use the parent service entry point outside this ownership boundary. Keep raw
API response normalization in `api`, navigation encoding in `domain`, and
effects in the workspace page.

## Verification

```bash
npm run security-service-test
npm run typecheck
```

## Related documentation

- [Service guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)

