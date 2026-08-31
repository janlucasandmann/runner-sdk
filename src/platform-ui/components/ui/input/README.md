<!-- platform-directory-guide:v1 -->

# Platform input

## Purpose

`PlatformInput` is the canonical single-line text input for platform interfaces. It owns shared sizing, surface, focus, disabled, full-width, and invalid states while retaining the native input API.

Import the component and its styles through:

```ts
import { PlatformInput } from "@computer-agents/platform/platform-ui/components/ui/input";
import "@computer-agents/platform/platform-ui/components/ui/input/styles.css";
```

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npx vitest run src/platform-ui/components/ui/input
```

Escalate to `npm run check` before merging changes that affect shared contracts, build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
