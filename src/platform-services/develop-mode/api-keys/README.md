# API Keys service

Owns the Develop mode API Keys domain model, canonical overview page, cached
data lifecycle, mutations, legacy settings projection, navigation integration,
styles, and API proxy routes.

The demo host supplies authenticated transport and shared platform UI
primitives. Route handling returns a boolean so the service composes with the
other modular platform services without owning the HTTP server.

`DevelopApiKeysOverviewPage` consumes the central `ResourceOverviewPage` and
`PlatformDataTable` components. The demo host only normalizes API records and
adapts authenticated create, reveal, and revoke operations.
