<!-- platform-directory-guide:v1 -->

# Skill Detail

## Purpose

This directory owns the typed Skill detail-page boundary. It composes the
shared Develop detail shell for the Code and Settings views while leaving
source editing, access policy state, and version mutations with the Skills
domain controller.

## Working in this directory

Import `SkillDetailPage` through `platform-resources/skills`. The host provides
the Code workspace and Settings access surface and owns app-header navigation.
Do not add a second local title row or tab bar. Keep source mutations, access
policy persistence, and version operations in the Skills domain controller;
promote resource-neutral presentation changes to `src/platform-ui`.

## Contents

- [`skill-detail-page.tsx`](skill-detail-page.tsx) — Typed Code/Settings detail-shell composition.
- [`skill-detail-page.css`](skill-detail-page.css) — Skill-specific full-height source workspace and identity-header layout.
- [`skill-detail-page.test.tsx`](skill-detail-page.test.tsx) — Shell and tab-content contracts.
- [`index.ts`](index.ts) — Public detail exports.

## Verification

Run:

```bash
npm run platform:skill-source-test
npm run platform:legacy-controller-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Skills resource guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
