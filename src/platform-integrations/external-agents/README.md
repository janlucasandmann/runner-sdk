<!-- platform-directory-guide:v1 -->

# External agent contracts

## Purpose

This directory defines typed provider-neutral records used by configuration UI
and server boundaries for external agent invocation.

## Contents

- [`contracts.ts`](contracts.ts) - Providers, transports, triggers, actors, resources, installations, bindings, identities, conversations, and event records.
- [`index.ts`](index.ts) - Public type exports.

## Working in this directory

Keep provider webhook payload types out of these contracts. Add provider details
inside server adapters and normalize them into this stable envelope.

## Verification

```bash
npm run typecheck
```

## Related documentation

- [Parent directory guide](../README.md)
- [External agent gateway setup](../../../docs/development/external-agent-gateway-setup.md)
