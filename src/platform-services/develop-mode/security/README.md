<!-- platform-directory-guide:v1 -->

# Repository Security service

## Purpose

This service owns the Develop mode experience for connecting GitHub
repositories, versioning scan policy and threat-model context, starting scans,
triaging findings, and inspecting run artifacts and audit events. Its public
entry points are [`index.ts`](index.ts) for typed React consumers and
[`index.mjs`](index.mjs) for the legacy application-shell composer and server
proxy registration.

The browser never receives a GitHub installation token. It talks only to the
authenticated platform API through the shared `PlatformApiClient`; the control
plane creates short-lived, repository-scoped GitHub credentials.

## Structure

- [`client/api/`](client/api/) — Typed HTTP repository and React adapter.
- [`client/domain/`](client/domain/) — API contracts, route state, and pure
  presentation helpers.
- [`client/page/`](client/page/) — Overview plus repository, run, and finding
  detail pages built from shared platform primitives.
- [`client/shell/`](client/shell/) — Compatibility fragments for sidebar,
  history, top navigation, setup-return handling, and page composition.
- [`server/`](server/) — Authenticated `/api/real` proxy route ownership for
  the security and dedicated GitHub App control-plane APIs.
- [`security-service-test.mjs`](security-service-test.mjs) — Ownership and shell
  integration contract.

## Security invariants

- Scan runs identify an immutable full commit SHA, never only a mutable branch.
- The default policy is advisory-only. Remediation publication is separately
  approval-gated, draft-only, and cannot modify workflow files.
- GitHub setup, policy changes, triage decisions, and runs are represented in
  the control-plane audit stream.
- Organization roles, API scopes, billing entitlement, and the shared
  three-ring resource permission model remain distinct authorization layers.

The control plane currently persists and queues scan requests. A production
deployment must attach the separately isolated security runner before queued
runs execute; the UI deliberately does not claim that a queued run has scanned
code or published a pull request.

## Working in this directory

Keep GitHub and persistence details behind the API repository. Put reusable,
domain-neutral controls in `src/platform-ui`, but keep security policy and
finding semantics here. Add new detail views to the typed workspace router and
the shell history contract together.

## Verification

Run from the repository root:

```bash
npm run security-service-test
npm run typecheck
npm run platform:legacy-source-test
```

## Related documentation

- [Develop mode services](../README.md)
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
