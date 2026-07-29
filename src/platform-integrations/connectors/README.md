<!-- platform-directory-guide:v1 -->

# Connector domain

## Purpose

This directory owns the canonical browser-facing contract for external
connectors. Provider metadata, capability schemas, connection eligibility, and
permission action identifiers must be defined here so connector pages,
authentication adapters, and access controls cannot drift.

Provider-specific transport and OAuth implementations remain isolated in their
own adapters. Presentation components consume this directory through
[`index.ts`](index.ts).

## Verification

```bash
npm run check:static
npm test -- --runInBand
```
