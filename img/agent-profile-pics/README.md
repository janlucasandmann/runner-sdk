<!-- platform-directory-guide:v1 -->

# Agent profile images

## Purpose

This directory contains agent profile images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.

## Contents

- Asset inventory — 1 .gif file, 1 .jpeg file, 1 .jpg file, 1 .mp4 source file, 4 .png files, 9 .webp files.
- `exp-spark.mp4` — retained source animation for the active Spark identity.
- `exp-spark.gif` — optimized 96×96, 15 fps ping-pong derivative; it traverses the source in about two seconds, reverses through the exact same frames, and loops indefinitely.

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
