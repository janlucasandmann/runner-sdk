<!-- platform-directory-guide:v1 -->

# Platform documentation

## Purpose

This directory is the durable engineering handbook for architecture, development workflows, compatibility contracts, and operational guidance.

## Contents

- [`architecture/`](architecture/) — This directory documents system structure, ownership boundaries, and the decisions that constrain future platform changes.
- [`development/`](development/) — This directory contains contributor workflows for configuration, testing, and repository documentation.
- [`metronome-agentic-workflows-plan.md`](metronome-agentic-workflows-plan.md) — Engineering documentation for Metronome Agentic Workflows Plan.
- [`platform-architecture.md`](platform-architecture.md) — Engineering documentation for Platform Architecture.
- [`platform-video-series-proposals.md`](platform-video-series-proposals.md) — Engineering documentation for Platform Video Series Proposals.
- [`runner-client.md`](runner-client.md) — Engineering documentation for Runner Client.
- [`thread-v2-architecture.md`](thread-v2-architecture.md) — Engineering documentation for Thread V2 Architecture.

## Working in this directory

Write for a developer who does not have historical context. Prefer repository-relative links, executable commands from the repository root, and explicit ownership or safety boundaries. Update documentation in the same change as the contract it describes.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run docs:check
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](platform-architecture.md)
- [Directory README standard](development/readme-standard.md)
