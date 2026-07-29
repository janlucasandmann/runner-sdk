<!-- platform-directory-guide:v1 -->

# Connections

## Purpose

This directory owns the cross-resource connection overview adapter built on the
canonical `ResourceOverviewPage`. Resource domains supply connection rows,
labels, actions, and navigation.

## Contents

- [`connection-identity-icon.tsx`](connection-identity-icon.tsx) — Shared provider icon framing used by connection overview and detail surfaces.
- [`connection-credentials.ts`](connection-credentials.ts) — Provider-neutral named credential metadata, default selection, migration, and lifecycle helpers.
- [`connection-overview-page.tsx`](connection-overview-page.tsx) — Presentation composition for Connection Overview Page.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

Credential objects in this client domain are metadata only. Provider secrets and
OAuth tokens remain server-side. Provider status is authoritative for completed
credentials; locally persisted pending credentials survive only while their
authorization flow is in progress. Normalization always assigns exactly one
default credential when at least one credential exists.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform-resource-overview-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
