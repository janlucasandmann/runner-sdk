<!-- platform-directory-guide:v1 -->

# Platform page hero

## Purpose

`PlatformPageHero` is the canonical title, description, and optional action row
for platform content pages. It owns the shared typography, spacing, responsive
layout, and action treatment while leaving page-specific content with the
consumer.

Use `actions` for the standard lightweight hero actions. Use `actionsContent`
when the right side requires another centralized control, such as a selector
button, while retaining the shared hero layout.

```tsx
<PlatformPageHero
  title="Tags"
  description="Connect communication channels to your agents."
/>
```

Import it from `platform-ui/components/composite/page-hero`, and load
`platform-ui/components/composite/page-hero/styles.css` once in standalone
hosts.

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
