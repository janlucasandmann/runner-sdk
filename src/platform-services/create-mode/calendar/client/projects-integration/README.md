<!-- platform-directory-guide:v1 -->

# Projects Integration

## Purpose

This directory contains projects integration behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.

## Contents

- [`page-actions/`](page-actions/) — This directory contains page actions behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page-connectors/`](page-connectors/) — This directory contains page connectors behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page-data/`](page-data/) — This directory contains page data behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page-shell/`](page-shell/) — This directory contains page shell behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
- [`page-views/`](page-views/) — This directory contains page views behavior for the owning feature for the Calendar service in Create Mode. It remains subordinate to the service boundary and must not become a cross-service utility layer.
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
- [Platform architecture](../../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../../docs/development/readme-standard.md)
