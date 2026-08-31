<!-- platform-directory-guide:v1 -->

# Templates

## Purpose

This directory contains escaped HTML templates used only by restricted administrative page renderers.

## Contents

- [`admin-access-denied.html`](admin-access-denied.html) — Restricted-page access-denied and account-switch surface.
- [`environment-gui.html`](environment-gui.html) — Focused implementation of Environment Gui.
- [`feedback-summary.html`](feedback-summary.html) — Focused implementation of Feedback Summary.
- [`product-usage-summary-v2.html`](product-usage-summary-v2.html) — Focused implementation of Product Usage Summary V2.
- [`product-usage-summary.html`](product-usage-summary.html) — Focused implementation of Product Usage Summary.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run test:contracts
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
