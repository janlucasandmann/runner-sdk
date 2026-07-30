<!-- platform-directory-guide:v1 -->

# Server integrations

## Purpose

This directory contains server-side adapters for external providers. Provider credentials and protocol behavior must remain behind these modules.

## Contents

- [`connector-oauth-core.mjs`](connector-oauth-core.mjs) — Provider-neutral OAuth state, identity verification, encrypted named-credential persistence, and response helpers.
- [`generic-connector-oauth.mjs`](generic-connector-oauth.mjs) — Registry-driven OAuth and direct-credential routes for connector providers.
- [`github-oauth.mjs`](github-oauth.mjs) — GitHub OAuth and repository API adapter.
- [`jira-oauth.mjs`](jira-oauth.mjs) — Atlassian OAuth 2.0 (3LO), Jira and Confluence scope negotiation, site discovery, identity validation, and rotating refresh-token adapter.
- [`connectors/runtime`](connectors/runtime) — Server-owned connector tool catalogs and provider API adapters exposed through the authenticated connector MCP bridge.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

Named connection metadata may be returned to the browser, but access and refresh
tokens must remain encrypted and server-side. Organization identifiers carried
through OAuth state are routing metadata, not authorization by themselves;
cross-user credential access requires separately verified organization
membership.

## Connector execution transport

Connector authorization deliberately uses three transports. Thread, agent, and
project records are runner resources and use the thread's runner API key when
one is present, otherwise the authenticated cloud-resource proxy. Organization
membership always uses the authenticated identity/session transport. Connector
configuration remains on the account API. Keep these boundaries separate:
provider credentials and runner API keys must never be forwarded to the
organization or connector-configuration endpoints.

## GitHub authorization contract

GitHub renders the account chooser and authorization consent screens. The
platform starts an authorization-code flow with `prompt=select_account`, PKCE,
and one-time server-side state, then returns to the exact connector
Authentication tab encoded in a validated same-origin redirect URL. The app
name, logo, homepage, and authorization copy shown by GitHub come from the
GitHub OAuth App registration rather than platform CSS.

The GitHub OAuth App's registered callback is owned by the public web service.
Platform-created state records therefore include an explicit callback owner and
a validated platform callback target. The public callback must route those
requests without consuming their one-time state; the platform callback owns
PKCE redemption and named credential persistence. Website-created GitHub flows
continue to use the public callback's existing exchange path.

## Atlassian authorization contract

Atlassian uses OAuth 2.0 (3LO). The platform stores one-time state before
redirecting to Atlassian, exchanges the callback code server-side, discovers
the accessible cloud sites, validates the account against the selected
site, and encrypts access and rotating refresh tokens in the shared connector
credential store. The browser receives only sanitized account, site, and
credential metadata.

Configure one Atlassian OAuth 2.0 integration per deployment with
`ATLASSIAN_OAUTH_CLIENT_ID`, `ATLASSIAN_OAUTH_CLIENT_SECRET`, and the exact
callback URL in `ATLASSIAN_OAUTH_REDIRECT_URI`. The equivalent
`JIRA_OAUTH_*` names remain accepted for compatibility. Local development uses
`http://localhost:4177/api/jira/callback`; production normally uses
`https://platform.computer-agents.com/api/jira/callback`. Login refuses to
start when either client credential is missing so users never enter a provider
flow that cannot complete.

## Dropbox authorization and runtime contract

Dropbox uses the registry-driven OAuth 2.0 authorization-code flow with S256
PKCE and offline access. Register the exact local callback
`http://localhost:4177/api/aios/connectors/dropbox/callback` and the equivalent
production callback under the deployment's `PLATFORM_APP_ORIGIN`. Configure the
server with `DROPBOX_OAUTH_CLIENT_ID`, `DROPBOX_OAUTH_CLIENT_SECRET`, and
`DROPBOX_OAUTH_CALLBACK_URL`. Dropbox tokens use
`DROPBOX_TOKEN_ENCRYPTION_KEY` when present and otherwise use the shared
`CONNECTOR_TOKEN_ENCRYPTION_KEY`.

The Dropbox App Console must enable `account_info.read`,
`files.metadata.read`, `files.content.read`, `sharing.read`,
`files.metadata.write`, `files.content.write`, and `sharing.write`. The runtime
adapter refreshes expiring access tokens server-side, persists the replacement,
and supports the capability catalog in
`src/platform-integrations/connectors/providers/dropbox`. Binary downloads are
returned as base64 with provider metadata. Uploads accept UTF-8 text or base64
content; the remote platform service never reads an arbitrary runner workspace
path from its own filesystem.

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
- [Platform architecture](../../../../docs/platform-architecture.md)
- [Directory README standard](../../../../docs/development/readme-standard.md)
