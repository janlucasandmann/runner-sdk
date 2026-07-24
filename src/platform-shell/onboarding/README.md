<!-- platform-directory-guide:v1 -->

# Onboarding

## Purpose

Owns the platform-wide first-run experience, including flow state, modal
presentation, URL/session restoration, shell composition, and completion
lifecycle. Onboarding coordinates service-owned capabilities through callbacks;
it does not own computers, connectors, projects, or billing.

## Contents

- [`client/`](client/) - Browser domain, page, shell, and style ownership.
- [`index.mjs`](index.mjs) - Public shell feature entry point.
- [`onboarding-service-test.mjs`](onboarding-service-test.mjs) - Domain and composition contract coverage.

## Working in this directory

Keep global first-run orchestration here, but leave computer, connector, billing,
and project behavior with their service owners. Integrate those capabilities
through the shell host callback contract instead of importing service internals
into the modal. Update the focused contract test whenever lifecycle or
persistence semantics change.

## Verification

```bash
npm run onboarding-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Platform Shell](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
