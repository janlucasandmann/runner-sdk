# Platform identity boundary

The platform host owns browser authentication. Domain gateways and UI modules
consume a provider-neutral session and do not import Firebase or OIDC SDKs.

Two adapters share this boundary:

- `hosted-identity-service.mjs` preserves the existing Firebase/landing BFF
  behavior for `gcp_saas`;
- `oidc-identity-service.mjs` implements the on-prem OIDC session BFF.

## OIDC flow

1. The browser starts `/api/platform/auth/login`.
2. The platform discovers the configured issuer and sends an Authorization Code
   request with state, nonce, and PKCE S256.
3. The callback validates state, exchanges the code server-side, verifies the
   signed ID token against the provider JWKS, and validates issuer, audience,
   age, algorithm, and nonce.
4. The platform signs a 60-second `ComputerAgentsPrincipal` assertion for the
   control API.
5. The control API resolves `(issuer, subject)` through `identity_links` and
   returns a time-bounded `tb_session_` workload credential once.
6. The platform stores that credential only inside an encrypted, HttpOnly,
   SameSite session cookie. Browser JavaScript receives only
   `__runner_playground_session__`.
7. Gateway calls unwrap the session server-side and attach the workload
   credential to the local control API. Logout revokes it and clears the cookie.

The implementation follows
[OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0-final.html),
[OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0-22.html),
[PKCE](https://www.rfc-editor.org/rfc/rfc7636.html), and the
[OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html).

## Security invariants

- Issuer comparison is exact; it is never normalized after configuration.
- Only HTTPS identity endpoints are accepted, except HTTP loopback endpoints
  for local development.
- Only asymmetric ID-token algorithms from the configured allowlist are
  accepted.
- State, nonce, and code verifier are random 256-bit values.
- Redirect targets remain on `PLATFORM_APP_ORIGIN`.
- Provider tokens and workload API keys are never returned to browser code,
  logged, or persisted in plaintext by the control API.
- Email is profile data, not an identity key. Accounts are never automatically
  linked by matching email.
- The platform/control assertion secret and browser-session secret are distinct
  and contain at least 32 bytes.
- Hosted-only connectors fail closed on an OIDC appliance instead of creating a
  runtime dependency on the landing application.

## Process configuration

The platform process consumes:

- `DEPLOYMENT_TOPOLOGY=on_prem`;
- `IDENTITY_PROVIDER=oidc`;
- `PLATFORM_APP_ORIGIN`;
- `RUNNER_UPSTREAM_ORIGIN`;
- `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, and optionally
  `OIDC_CLIENT_SECRET`;
- `PLATFORM_SESSION_SECRET`;
- `PLATFORM_CONTROL_PLANE_SECRET`.

The control API consumes the same `PLATFORM_CONTROL_PLANE_SECRET` and assertion
issuer/audience settings. It does not need the OIDC client secret or browser
session secret.

## Existing-user migrations

Never attach imported product data to an OIDC account by matching email.
Instead, import users and resources first, then prepare an explicit JSON mapping:

```json
{
  "mappings": [
    {
      "userId": "user_existing_123",
      "provider": "oidc",
      "issuer": "https://identity.enterprise.example/realms/computer-agents",
      "subject": "enterprise-directory-subject"
    }
  ]
}
```

Run a read-only preflight and review every planned mapping:

```bash
cd computer-agents/packages/cloud-infrastructure
npm run identity:provision -- --input /secure/path/identity-links.json
```

Only then apply the same file:

```bash
cd computer-agents/packages/cloud-infrastructure
npm run identity:provision -- --input /secure/path/identity-links.json --apply
```

The apply command performs a read-back verification automatically. It can also
be repeated independently without writing:

```bash
cd computer-agents/packages/cloud-infrastructure
npm run identity:provision -- --input /secure/path/identity-links.json --verify
```

The preflight verifies every target user, rejects duplicate subjects and
existing ownership conflicts before the first write, and never queries users by
email. Updates preserve optional profile fields that are omitted from a later
mapping. Verification checks the target user, provider, ownership, and every
profile field explicitly supplied by the mapping.

See `deployment/topologies/on-prem.env.example` at the workspace root for the
complete profile.
