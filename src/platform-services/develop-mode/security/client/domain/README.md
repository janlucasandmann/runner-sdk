<!-- platform-directory-guide:v1 -->

# Repository Security client domain

## Purpose

This directory owns browser-safe repository security contracts and pure
transformations. It contains no React state, network access, GitHub secrets, or
persistence logic.

## Contents

- [`security-types.ts`](security-types.ts) — API, workspace, and coherent
  repository-version snapshot contracts.
- [`security-access.ts`](security-access.ts) — Team-access and nested
  team-member identity normalization, owner-candidate merging, role-permission
  presets, and immutable repository metadata transforms.
- [`security-model.ts`](security-model.ts) — Formatting and URL route helpers.
- [`security-model.test.ts`](security-model.test.ts) — Route precedence and
  severity regression coverage.
- [`index.ts`](index.ts) — Public barrel.

## Working in this directory

Keep types aligned with the OpenAPI contract and preserve the precedence of
finding, run, then repository route parameters so copied detail links restore
unambiguously.

## Verification

```bash
npm run security-service-test
npm run typecheck
```

## Related documentation

- [Client guide](../README.md)
- [Service guide](../../README.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
