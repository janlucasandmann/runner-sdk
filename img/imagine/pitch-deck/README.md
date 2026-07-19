<!-- platform-directory-guide:v1 -->

# Pitch-deck assets

## Purpose

This directory contains pitch-deck assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.

## Contents

- Asset inventory — 5 .png files, 5 .webp files.

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
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
