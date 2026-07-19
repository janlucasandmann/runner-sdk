<!-- platform-directory-guide:v1 -->

# Voice Agents service

## Purpose

`src/platform-services/develop-mode/voice-agents` is the ownership boundary for
the Develop-mode Voice Agents experience. It owns voice-agent normalization,
configuration contracts, and the specialized overview page built on the shared
Develop overview foundation.

The typed service is split into three layers:

- `client/api`: encoded API access for list, configuration, phone-number, and
  test-session operations;
- `client/domain`: normalization, editable drafts, options, and mutation
  payloads;
- `client/management`: the tested lifecycle controller that sequences saves
  before provisioning or test-session creation.

The service owns the full Voice Agents workflow. Generated threads open through
the canonical platform thread query on the single application document.

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
