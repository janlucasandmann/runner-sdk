<!-- platform-directory-guide:v1 -->

# Realtime client

## Purpose

This directory owns the provider-neutral realtime session contract used to receive execution and thread events.

## Contents

- [`index.ts`](index.ts) — Public barrel or composition entry point.
- [`session.ts`](session.ts) — Focused implementation of Session.
- [`types.ts`](types.ts) — Type contracts for this boundary.

## Integration contract

A realtime media session belongs to a thread and a communicator participant,
not to a worker run. The communicator can dispatch, steer, control, or inspect
workers through short-lived tool calls while those runs continue independently.

Hosts provide three explicit adapters:

- a `RunnerRealtimeCredentialBroker` that returns ephemeral, server-minted
  provider credentials;
- a `RunnerRealtimeProviderConnection` for WebRTC, WebSocket, SIP, or another
  provider transport;
- a `RunnerRealtimeWorkerToolGateway` that durably acknowledges worker
  dispatch and steering without waiting for run completion.

Create the provider-neutral session through
`createRunnerRealtimeCommunicatorSession`. Subscribe to immutable snapshots and
events, and persist final transcript messages through the host's canonical
thread API. Long-lived provider secrets, raw email addresses, and workload
credentials must never enter browser configuration.

## Lifecycle invariants

- Partial, final, and interrupted transcripts are independent from worker turn
  completion.
- Tool calls use stable idempotency keys and return accepted/delivered state.
- Barge-in may interrupt communicator audio but does not implicitly cancel a
  worker.
- Stop and cancel controls must reach the deterministic run-control path.
- Provider events are normalized before being exposed to thread presentation.

## Working in this directory

Keep provider SDKs behind host-supplied adapters and preserve the distinction
between ephemeral media state and durable thread state. Add transcript-reducer,
tool-gateway, reconnect, and interruption coverage when extending the protocol.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run realtime-metronome-test
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../docs/platform-architecture.md)
- [Directory README standard](../../docs/development/readme-standard.md)
