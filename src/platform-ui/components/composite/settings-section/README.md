<!-- platform-directory-guide:v1 -->

# Settings section

## Purpose

`PlatformSettingsSectionList` and `PlatformSettingsSection` provide the canonical
layout for editable resource settings: a compact title row, optional icon and
actions, and a flat content surface.

`PlatformSettingsDataTable` applies the matching table defaults used by
permission rings and other settings grids. Resource pages keep their domain
state and editors while sharing this presentation layer.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
