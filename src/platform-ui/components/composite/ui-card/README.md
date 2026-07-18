# Platform UI card

`PlatformUiCard` is the canonical neutral card surface for platform layouts. It
owns the shared 15px radius, white/7.5 border, and white/7.5 background. The
`feature` variant also owns the card layout and content slots used by platform
Home-style feature cards.

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
```

Import it from `platform-ui/components/composite/ui-card`, and load
`platform-ui/components/composite/ui-card/styles.css` once in standalone hosts.
