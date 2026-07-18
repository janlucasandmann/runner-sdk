# Platform Home page

`PlatformHomePage` is the canonical shell for product and mode home screens. It
owns the shared dark-mode composition:

1. Product title, description, and optional header actions
2. A focused feature-card grid
3. Quick-start, documentation, and other link sections

The shell is deliberately domain-agnostic. Service modules supply labels,
counts, icons, destinations, and callbacks. Fetching, permissions, routing, and
product-specific state do not belong in this directory.

## Usage

```tsx
import { PlatformHomePage } from "@computer-agents/platform/platform-ui/pages/home";

<PlatformHomePage
  title="Workspace Studio"
  description="Create and manage intelligent services."
  featureCards={featureCards}
  sections={sections}
/>
```

Load either the dedicated stylesheet or the aggregate page stylesheet:

```ts
import "@computer-agents/platform/platform-ui/pages/home/styles.css";
// or
import "@computer-agents/platform/platform-ui/pages/styles.css";
```
