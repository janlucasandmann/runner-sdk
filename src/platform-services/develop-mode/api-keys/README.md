<!-- platform-directory-guide:v1 -->

# API Keys service

## Purpose

Owns the Develop mode API Keys domain model, canonical overview page, cached
data lifecycle, mutations, legacy settings projection, navigation integration,
styles, and API proxy routes.

The platform host supplies authenticated transport and shared platform UI
primitives. Route handling returns a boolean so the service composes with the
other modular platform services without owning the HTTP server.

`DevelopApiKeysOverviewPage` consumes the central `ResourceOverviewPage` and
`PlatformDataTable` components. The platform host only normalizes API records and
adapts authenticated create, reveal, and revoke operations.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run api-keys-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
