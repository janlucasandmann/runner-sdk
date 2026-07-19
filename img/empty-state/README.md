<!-- platform-directory-guide:v1 -->

# Empty-state images

## Purpose

This directory contains empty-state images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.

## Contents

- [`metronome.webp`](metronome.webp) — Presentation asset.
- [`no-agent-usage.avif`](no-agent-usage.avif) — Presentation asset.
- [`no-chats-yet.avif`](no-chats-yet.avif) — Presentation asset.
- [`no-computer-usage.avif`](no-computer-usage.avif) — Presentation asset.
- [`no-plugin-usage.avif`](no-plugin-usage.avif) — Presentation asset.
- [`no-secrets-yet.avif`](no-secrets-yet.avif) — Presentation asset.
- [`no-skills-usage.avif`](no-skills-usage.avif) — Presentation asset.
- [`no-users-yet.avif`](no-users-yet.avif) — Presentation asset.

## Working in this directory

Reference assets through their owning feature rather than relying on unexplained global paths. Optimize large files before committing, retain source/licensing information when applicable, and remove an asset only after searching both typed and legacy browser sources for consumers.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run build
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
