<!-- platform-directory-guide:v1 -->

# Settings Modal

## Purpose

The account settings experience is a shell overlay rather than a Configure
page. This module owns its modal lifecycle, navigation contract, UI renderer,
and modal-specific styles.

The settings surface still accepts embedded sections used by organization
billing and inference. Those callers render the shared surface directly while
the profile menu opens it through the central `PlatformModal` component.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run settings-modal-service-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../docs/platform-architecture.md)
- [Directory README standard](../../../docs/development/readme-standard.md)
