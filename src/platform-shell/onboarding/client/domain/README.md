<!-- platform-directory-guide:v1 -->

# Onboarding Domain

## Purpose

Defines versioned onboarding steps, resumable snapshots, and automatic-open
rules independently from React and browser persistence.

## Contents

- [`state.mjs`](state.mjs) - Pure step normalization, snapshot, and auto-open rules plus their browser-source adapter.
- [`index.mjs`](index.mjs) - Public domain exports.

## Working in this directory

Keep functions deterministic and independent from React, network calls, and
browser storage. Version persisted snapshot shapes deliberately and cover any
migration or completion-rule change in the onboarding service test.

## Verification

```bash
npm run onboarding-service-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
