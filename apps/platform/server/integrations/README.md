<!-- platform-directory-guide:v1 -->

# Server integrations

## Purpose

This directory contains server-side adapters for external providers. Provider credentials and protocol behavior must remain behind these modules.

## Contents

- [`connector-oauth-core.mjs`](connector-oauth-core.mjs) — Provider-neutral OAuth state, identity verification, encrypted named-credential persistence, and response helpers.
- [`github-oauth.mjs`](github-oauth.mjs) — GitHub OAuth and repository API adapter.
- [`jira-oauth.mjs`](jira-oauth.mjs) — Jira OAuth 2.0 (3LO), Atlassian site discovery, identity validation, and rotating refresh-token adapter.

## Working in this directory

Keep changes inside this directory's stated ownership boundary and use the parent's public entry point instead of importing sibling internals. Update this guide when responsibilities, entry points, or verification commands change. Place focused tests beside the behavior they protect and promote reusable, domain-neutral presentation to `src/platform-ui`.

Named connection metadata may be returned to the browser, but access and refresh
tokens must remain encrypted and server-side. Organization identifiers carried
through OAuth state are routing metadata, not authorization by themselves;
cross-user credential access requires separately verified organization
membership.

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

## Jira authorization contract

Jira uses Atlassian OAuth 2.0 (3LO). The platform stores one-time state before
redirecting to Atlassian, exchanges the callback code server-side, discovers
the accessible Jira Cloud sites, validates the account against the selected
site, and encrypts access and rotating refresh tokens in the shared connector
credential store. The browser receives only sanitized account, site, and
credential metadata.

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
