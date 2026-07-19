<!-- platform-directory-guide:v1 -->

# Calendar Client

## Purpose

This directory contains browser-side public composition and integration for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`domain/`](domain/) — This directory contains domain contracts, normalization, and pure transformations for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`foundation/`](foundation/) — This directory contains initialization and third-party foundation adapters for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`projects-integration/`](projects-integration/) — This directory contains projects integration behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`shell/`](shell/) — This directory contains application-shell state, lifecycle, and navigation integration for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`styles/`](styles/) — This directory contains ordered, owner-scoped style modules for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`vendor/`](vendor/) — This directory contains third-party loading and compatibility adapters for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run calendar-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
