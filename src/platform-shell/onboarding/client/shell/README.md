<!-- platform-directory-guide:v1 -->

# Onboarding Shell

## Purpose

Owns the host bridge for opening, dismissing, completing, restoring, warming,
and composing onboarding inside the single platform runtime.

## Contents

- [`state.mjs`](state.mjs) - React state injected into the application shell.
- [`navigation.mjs`](navigation.mjs) - Open, dismiss, complete, and redirect-restoration actions.
- [`lifecycle.mjs`](lifecycle.mjs) - URL synchronization and automatic-open effects.
- [`runtime.mjs`](runtime.mjs) - Default-computer provisioning and warmup adapter.
- [`host.mjs`](host.mjs) - Modal dependency and callback composition.
- [`index.mjs`](index.mjs) - Public shell fragment map.

## Working in this directory

Treat these files as adapters to the existing single application runtime. Keep
product logic behind callbacks, keep dismissal separate from durable
completion, and avoid adding a second state store or router.

## Verification

```bash
npm run onboarding-service-test
npm run platform:legacy-syntax-test
```

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
