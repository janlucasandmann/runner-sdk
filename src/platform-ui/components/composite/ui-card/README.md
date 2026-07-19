<!-- platform-directory-guide:v1 -->

# Platform UI card

## Purpose

`PlatformUiCard` is the canonical neutral card surface for platform layouts. It
owns the shared 15px radius, white/7.5 border, and white/7.5 background. The
`feature` variant owns the card layout and content slots used by platform
Home-style feature cards. The compact `sidebar` variant adds a standardized
16px inset plus a reusable title and optional actions row.

Consumers choose the semantic element and provide only domain-specific content,
layout, and interaction:

```tsx
<PlatformUiCard as="article" className="product-card">
  ...
</PlatformUiCard>

<PlatformUiCard as="article" variant="feature">
  <h2 className="platform-ui-card__feature-title">Create</h2>
  ...
</PlatformUiCard>

<PlatformUiCard
  as="section"
  variant="sidebar"
  cardTitle="Properties"
  headerActions={<button type="button">Add</button>}
>
  ...
</PlatformUiCard>
```

Import it from `platform-ui/components/composite/ui-card`, and load
`platform-ui/components/composite/ui-card/styles.css` once in standalone hosts.

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
