<!-- platform-directory-guide:v1 -->

# Repository Security service

## Purpose

This service owns the Develop mode experience for connecting GitHub
repositories, versioning scan policy and threat-model context, starting scans,
triaging findings, and inspecting run artifacts and audit events. Its public
entry points are [`index.ts`](index.ts) for typed React consumers and
[`index.mjs`](index.mjs) for the legacy application-shell composer and server
proxy registration.

The browser never receives a GitHub access or installation token. Account
connection reuses the centralized Plugins GitHub OAuth lifecycle, and the
security control plane synchronizes only provider metadata into its
organization-scoped repository inventory. Where a dedicated GitHub App is
configured, the control plane continues to create short-lived,
repository-scoped credentials for App-backed access.

Repository enrollment is managed from one controlled minimal table. The shared
data-table checkbox column reflects current monitoring state, while branch
choices are loaded on demand through the centralized GitHub plugin client and
persisted as versioned scan-policy changes.

Each monitored repository exposes team access from its Settings tab. The
centralized minimal data table manages workspace-team grants, while the shared
role-permissions page stores Owner, Member, Contributor, and Admin policies in
the repository's audited access metadata. Grants are mirrored into the common
workspace team resource-share registry as `security_repository` records so
Teams and Security Agents stay consistent.

Repository details use the same centralized version-management contract as
Agent details. The app-header breadcrumb shows the selected version, opens the
shared history drawer, and hosts the secondary Run scan action beside the
shared Save Changes split action. Both halves of that split action share one
disabled state. The local detail surface begins with a combined Runs & findings
tab and uses the Project ticket detail card-and-fact-row pattern for its
Details and Safety boundary sidebar sections. A repository version is one
coherent snapshot of scan policy plus threat model; publishing creates the
immutable domain revisions used by future runs. GitHub identity, monitoring
state, access grants, findings, and audit evidence are intentionally excluded
so restoring configuration cannot roll back authority or retained evidence.

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
- OAuth-backed access fails closed when the shared plugin is disconnected.
  Dedicated GitHub App installations remain the production choice for
  selected-repository grants and webhook-driven pull-request scans.
- Organization roles, API scopes, billing entitlement, and the shared
  three-ring resource permission model remain distinct authorization layers.
- Repository version reads require `security:read`; mutations also require
  `security:write` and the same owner, administrator, or developer role used by
  other Security Agents configuration writes.

The control plane currently persists and queues scan requests. A production
deployment must attach the separately isolated security runner before queued
runs execute; the UI deliberately does not claim that a queued run has scanned
code or published a pull request.

## Working in this directory

Keep GitHub and persistence details behind the API repository. Reuse provider
connection lifecycle through `src/platform-resources/plugins/connections` and
put domain-neutral controls in `src/platform-ui`; keep security policy and
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
