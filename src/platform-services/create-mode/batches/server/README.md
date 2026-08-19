<!-- platform-directory-guide:v1 -->

# Batches server adapter

## Purpose

This directory owns the platform BFF route boundary for Batches. It forwards
authenticated browser requests to the canonical backend API without
reimplementing scheduling behavior.

## Contents

- [`routes.mjs`](routes.mjs) — Exact `/api/real/batch-jobs` route matching and
  upstream translation.
- [`index.mjs`](index.mjs) — Server adapter public entry point.

## Working in this directory

Keep this adapter transport-only. Validation, authorization, persistence,
capacity admission, and dispatch belong to the cloud-infrastructure Batches
service. Preserve URL encoding and forward only explicitly supported HTTP
methods.

## Verification

Run from the platform repository root:

```bash
npm run batches-service-test
npm run platform:router-test
```

## Related documentation

- [Batches service](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
