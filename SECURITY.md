# Security policy

## Reporting

Report suspected vulnerabilities privately to the repository maintainers. Do
not include credentials, customer data, exploit payloads, or active service
details in a public issue.

Rotate any credential that may have been exposed before beginning remediation.
Secrets belong in the deployment secret store or process environment, never in
source, fixtures, screenshots, logs, or committed `.env` files.

## Supported code

The deployed `main` revision is supported. Compatibility code under
`apps/platform/client/legacy` and `src/react` is security-maintained while it
remains reachable, even when a typed replacement is under development.

## Dependency policy

- High and critical production advisories block CI and release.
- Moderate advisories require either an upgrade or a documented,
  time-bounded compatibility decision.
- `npm audit fix --force` is never applied without reviewing major-version
  behavior and running the complete platform gate.

Current exception (reviewed 2026-07-17): `pptx-preview@1.0.7` brings ECharts 5
and UUID 10 advisories. Upstream has no compatible patched dependency release.
The package is isolated to document preview, and uploaded presentations remain
untrusted input. Replace the renderer or validate ECharts 6/UUID 11 overrides
with representative chart-heavy presentations before removing this exception.
