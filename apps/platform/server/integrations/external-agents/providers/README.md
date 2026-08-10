<!-- platform-directory-guide:v1 -->

# External agent providers

## Purpose

This directory isolates provider webhook/native payloads behind the external
agent event envelope. Adapters identify supported triggers, suppress app-authored
events, derive a stable work-item conversation key, and expose only sanitized
visible text plus structured hidden context.

## Contents

- [`jira.mjs`](jira.mjs) - Jira comment mention, command, assignment, and optional native invocation normalization.
- [`linear.mjs`](linear.mjs) - Linear mention and optional native agent invocation normalization.

## Working in this directory

Do not start threads, authorize organization access, or deliver replies in a
provider adapter. Those responsibilities belong to policy, gateway, thread
invocation, and delivery modules. A new provider is complete only when its
normalization, verification, continuation key, self-event suppression, and
delivery idempotency contracts have focused tests.

## Verification

```bash
node --test apps/platform/server/integrations/external-agents/providers.test.mjs
```

## Related documentation

- [Parent directory guide](../README.md)
- [External agent gateway setup](../../../../../../docs/development/external-agent-gateway-setup.md)
