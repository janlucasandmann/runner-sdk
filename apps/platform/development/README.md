<!-- platform-directory-guide:v1 -->

# Platform development runtime

## Purpose

This directory owns the local Vite bridge, Fast Refresh integration, CSS HMR, and backend reload policy used by `npm run dev`.

## Contents

- [`backend-reload-policy.mjs`](backend-reload-policy.mjs) — Focused implementation of Backend Reload Policy.
- [`backend-reload-policy.test.mjs`](backend-reload-policy.test.mjs) — Regression coverage for Backend Reload Policy.
- [`runner-chat-css-hmr.mjs`](runner-chat-css-hmr.mjs) — Style composition for Runner Chat CSS HMR.
- [`runner-chat-css-hmr.test.mjs`](runner-chat-css-hmr.test.mjs) — Regression coverage for Runner Chat CSS HMR.
- [`vite-base.test.mjs`](vite-base.test.mjs) — Regression coverage for Vite Base.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run platform:development-asset-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
