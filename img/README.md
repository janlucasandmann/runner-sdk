<!-- platform-directory-guide:v1 -->

# Platform image assets

## Purpose

This directory contains platform image assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.

## Contents

- [`001-docs/`](001-docs/) — This directory contains legacy documentation images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`010-svgs/`](010-svgs/) — This directory contains legacy svg assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`agent-profile-pics/`](agent-profile-pics/) — This directory contains agent profile images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`bg/`](bg/) — This directory contains background images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`empty-state/`](empty-state/) — This directory contains empty-state images consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`file-icons/`](file-icons/) — This directory contains file-type icons consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`imagine/`](imagine/) — This directory contains imagine assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`metronome-bg/`](metronome-bg/) — This directory contains metronome background assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets.
- [`Neuer Ordner/`](<Neuer Ordner/>) — This directory contains legacy miscellaneous image assets consumed by platform presentation. Keep source attribution and usage discoverable, and avoid duplicating equivalent assets. Do not add new assets here; move referenced files into a clearly named owner when touching them.

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
- [Platform architecture](../docs/platform-architecture.md)
- [Directory README standard](../docs/development/readme-standard.md)
