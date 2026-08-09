<!-- platform-directory-guide:v1 -->

# Platform toggle

## Purpose

`PlatformToggle` is the shared controlled binary switch for compact on/off
settings. It owns the platform's 22px pill presentation, switch semantics,
disabled state, focus treatment, and blue active state.

Pass `checked`, an accessible `aria-label`, and `onCheckedChange`. Keep durable
state in the consuming feature; the primitive only requests the next value.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the
parent's public entry point instead of importing sibling internals. Place
focused tests beside behavior protected by this primitive.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npx vitest run src/platform-ui/components/ui/toggle
```

Escalate to `npm run check` before merging changes that affect shared contracts
or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
