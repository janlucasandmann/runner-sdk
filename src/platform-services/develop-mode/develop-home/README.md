<!-- platform-directory-guide:v1 -->

# Develop Home service

## Purpose

Owns the Develop mode landing composition, navigation projection,
resource-level operational-metrics loader, responsive service styling, and the
browser renderer used by the platform host. The landing surface composes the
centralized `PlatformHomePage` instead of maintaining a parallel overview,
analytics, or table implementation.

The host supplies shared transport, resource, settings, and shell primitives.
This package retains ordered browser-script fragments while the single
platform document migrates toward typed page composition.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run develop-home-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
