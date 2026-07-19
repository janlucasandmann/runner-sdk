<!-- platform-directory-guide:v1 -->

# Quality gates

## Purpose

This directory owns static quality gates, artifact checks, documentation policy, import boundaries, and test discovery.

## Contents

- [`check-build-artifacts.mjs`](check-build-artifacts.mjs) — Focused implementation of Check Build Artifacts.
- [`check-documentation-links.mjs`](check-documentation-links.mjs) — Focused implementation of Check Documentation Links.
- [`check-import-boundaries.mjs`](check-import-boundaries.mjs) — Focused implementation of Check Import Boundaries.
- [`directory-readmes.mjs`](directory-readmes.mjs) — Focused implementation of Directory Readmes.
- [`run-node-contract-tests.mjs`](run-node-contract-tests.mjs) — Focused implementation of Run Node Contract Tests.

## Gate map

- `check-build-artifacts.mjs` verifies declared exports and prevents tests from
  leaking into production output.
- `check-documentation-links.mjs` verifies local Markdown targets.
- `check-import-boundaries.mjs` enforces platform UI dependency direction.
- `directory-readmes.mjs` scaffolds and enforces one guide per maintained
  directory.
- `run-node-contract-tests.mjs` discovers Node service and contract tests
  without maintaining a duplicate list.

Quality tools must be deterministic, read-only in check mode, independent of
developer-specific paths, and actionable when they fail. A write mode must be
explicit and documented.

## Working in this directory

Prefer structural checks over snapshots of incidental formatting. When adding a
new invariant, wire it into `check:static` or the appropriate build gate and
include enough failure context for a developer to fix the owning file.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
