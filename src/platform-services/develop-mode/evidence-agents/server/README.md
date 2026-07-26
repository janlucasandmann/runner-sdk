<!-- platform-directory-guide:v1 -->

# Evidence Agents server proxy

## Purpose

This directory owns the same-origin platform proxy for Evidence Agents. It maps
`/api/real/evidence-agents/:serverId/*` to the cloud API's dedicated,
permission-checked `/servers/:serverId/evidence-agents/*` routes.

## Contents

- [`routes.mjs`](routes.mjs) — Read and decision proxy registration.
- [`index.mjs`](index.mjs) — Public server entry point.

## Working in this directory

Do not proxy directly to a deployed Equal Care function and do not accept a
browser-supplied reviewer identity. Path and query forwarding must remain
allow-listed, authenticated, and tied to the selected service resource.

## Verification

```bash
npm run evidence-agents-service-test
npm run platform:router-test
```

## Related documentation

- [Service guide](../README.md)
- [Platform architecture](../../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../../docs/development/readme-standard.md)
