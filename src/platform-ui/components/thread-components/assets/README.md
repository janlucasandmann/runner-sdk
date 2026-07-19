<!-- platform-directory-guide:v1 -->

# Assets

## Purpose

This directory contains static file, attachment, and server-resource imagery
used by platform-owned thread presentation.

## Contents

- [`email-attachment.webp`](email-attachment.webp) — Presentation asset.
- [`folder.png`](folder.png) — Presentation asset.
- [`imgicon.webp`](imgicon.webp) — Presentation asset.
- [`server-app.webp`](server-app.webp) — Presentation asset.
- [`server-auth.webp`](server-auth.webp) — Presentation asset.
- [`server-db.webp`](server-db.webp) — Presentation asset.
- [`server-function.webp`](server-function.webp) — Presentation asset.
- [`server-runtime.webp`](server-runtime.webp) — Presentation asset.
- [`txtfile.png`](txtfile.png) — Presentation asset.

## Working in this directory

Import assets only from their owning thread component. Preserve transparent
backgrounds and intended pixel density, optimize replacements, and verify every
legacy reference before removing or renaming a file.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
