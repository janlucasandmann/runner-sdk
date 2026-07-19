<!-- platform-directory-guide:v1 -->

# Thread gateway

## Purpose

This directory owns focused thread transport, streaming, and protocol helpers used by the platform gateway.

## Contents

- [`create-and-stream.mjs`](create-and-stream.mjs) — Focused implementation of Create And Stream.
- [`create-and-stream.test.mjs`](create-and-stream.test.mjs) — Regression coverage for Create And Stream.
- [`html-preview.mjs`](html-preview.mjs) — Focused implementation of HTML Preview.
- [`index.mjs`](index.mjs) — Public barrel or composition entry point.
- [`message-history.mjs`](message-history.mjs) — Focused implementation of Message History.
- [`message-sanitization.mjs`](message-sanitization.mjs) — Focused implementation of Message Sanitization.
- [`permission-decisions.mjs`](permission-decisions.mjs) — Focused implementation of Permission Decisions.
- [`search.mjs`](search.mjs) — Focused implementation of Search.
- [`search.test.mjs`](search.test.mjs) — Regression coverage for Search.
- [`trace-clusters.mjs`](trace-clusters.mjs) — Focused implementation of Trace Clusters.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

## Verification

Run the narrowest relevant checks from the repository root:

```bash
npm run test:contracts
npm run check:static
```

Escalate to `npm run check` before merging changes that affect shared contracts,
build output, or application composition.

## Related documentation

- [Parent directory guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
