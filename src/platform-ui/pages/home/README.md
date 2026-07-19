<!-- platform-directory-guide:v1 -->

# Platform Home page

## Purpose

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
