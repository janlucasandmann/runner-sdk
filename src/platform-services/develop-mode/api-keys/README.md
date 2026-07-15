# API Keys service

Owns the Develop mode API Keys domain model, cached data lifecycle, mutations,
current and legacy page projections, navigation integration, styles, and API
proxy routes.

The demo host supplies authenticated transport and shared platform UI
primitives. Route handling returns a boolean so the service composes with the
other modular platform services without owning the HTTP server.
