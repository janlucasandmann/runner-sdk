<!-- platform-directory-guide:v1 -->

# Projects

## Purpose

This directory owns small, reusable Project identity contracts that are needed
outside the Create-mode Projects service. It provides the canonical project
icon renderer and catalog, normalization of project identity records, and the
metadata-only project identity client used by linked resources such as Project
Knowledge libraries.

Project planning, tickets, delivery orchestration, and persistence remain in
`platform-services/create-mode/projects`. Domain-neutral presentation remains
in `platform-ui`.

## Usage

Import through `platform-resources/projects` or the top-level
`platform-resources` barrel. Use `PlatformProjectIdentityIcon` wherever another
resource needs to reproduce a Project's Lucide or emoji icon. Use
`PlatformProjectIdentityApi` for a current, permission-aware identity and keep
the linked resource's copied metadata as an appliance/offline fallback.

## Contents

- [`project-identity-icon.tsx`](project-identity-icon.tsx) — Canonical icon catalog, icon-ID normalization, and Lucide/emoji renderer.
- [`project-identity.ts`](project-identity.ts) — Project identity and Project Knowledge-reference normalization.
- [`project-identity-api.ts`](project-identity-api.ts) — Minimal metadata-only project identity client.
- [`project-identity.test.tsx`](project-identity.test.tsx) — Renderer, fallback, normalization, and API coverage.
- [`index.ts`](index.ts) — Public barrel.

## Working in this directory

Keep this boundary limited to Project identity that is genuinely reused across
services. Do not move the Projects service's planning runtime or UI composition
here. When adding an icon, keep the catalog aligned with the Projects service's
picker catalog and cover the mapping with a focused test.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npx vitest run src/platform-resources/projects/project-identity.test.tsx
npm run check:boundaries
npm run build
```

## Related documentation

- [Platform resources](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
