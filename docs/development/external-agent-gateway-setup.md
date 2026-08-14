# External agent gateway setup

The external agent gateway lets Jira and Linear users invoke a configured
Computer Agents agent from an issue and receive its final run summary back as a
provider comment. Replies on the same issue continue the existing platform
thread.

## Model

Use one provider application identity per provider tenant. Do not create a Jira
or Linear account for every platform agent. An installation owns the provider
credential and webhook verification; project bindings choose the platform
agent, environment, triggers, requester policy, and connector tool allowlist.

The stable baseline supports:

- Jira comment mentions, `/ca` commands, and assignment to the app actor;
- Linear comment mentions;
- optional Jira Rovo and Linear native agent transports behind feature flags;
- exactly one platform conversation per installation, binding, and issue;
- automatic final-summary delivery with provider-side duplicate suppression.

## Runtime configuration

Configure the platform server before creating an installation:

```dotenv
PLATFORM_APP_ORIGIN=https://platform.computer-agents.com
EXTERNAL_AGENT_WEBHOOK_ENCRYPTION_KEY=<at-least-32-random-bytes>
EXTERNAL_AGENT_RUNNER_API_KEY=<runner-api-key>
EXTERNAL_AGENT_STORE_PATH=/durable/platform/external-agents.json
```

Generate the encryption key with `openssl rand -base64 32`. The gateway never
persists a plaintext webhook secret and only returns a generated value during
installation creation or rotation.

On loopback development origins only, the platform generates this key on first
use at `.platform-data/external-agent-webhook.key` when no explicit key is
configured. The file is ignored by Git, created with owner-only permissions,
and reused across local restarts. Hosted deployments never generate a fallback
and must provide `EXTERNAL_AGENT_WEBHOOK_ENCRYPTION_KEY` or the platform
control-plane secret explicitly.

`EXTERNAL_AGENT_STORE_PATH` must be on persistent storage. The bundled adapter
is a singleton repository. Deployments with more than one server replica must
inject a shared transactional repository before enabling inbound traffic.

## Create an installation

Management routes require an authenticated platform session and the target
organization header. Writes require an organization owner or admin.

```http
POST /api/integrations/external-agents/installations
X-Computer-Agents-Organization: <organization-id>
Content-Type: application/json

{
  "provider": "jira",
  "tenantId": "<atlassian-cloud-id>",
  "displayName": "Production Jira",
  "credentialId": "<saved-atlassian-connector-credential-id>",
  "siteUrl": "https://example.atlassian.net",
  "appActorId": "<jira-app-account-id>",
  "mentionAliases": ["computer agents", "computer-agents"]
}
```

The response contains `setup.callbackUrl`, `setup.verificationSecret`, and, for
Jira, `setup.callbackUrlWithToken`. The secret is shown once. Jira sites that
cannot add an Authorization header may use the tokenized HTTPS URL. Linear uses
the generated secret as its webhook signing secret.

Configure provider events:

- Jira administrator webhook: comment created/updated and issue
  assigned/updated for the projects that may invoke agents. Use the one-time
  tokenized HTTPS callback URL, or send the shared secret as
  `Authorization: Bearer <secret>` from an intermediary that supports headers.
- Linear: issue comment events, signed by Linear with the installation secret.

This generic Jira callback is intentionally distinct from Atlassian OAuth 2.0
dynamic webhooks, whose bearer value is an Atlassian-signed JWT. Use the
feature-gated native transport for a Forge/Rovo app rather than sending an
OAuth dynamic webhook to the shared-token endpoint.

The normal Atlassian or Linear OAuth connection remains necessary because it
provides the scoped runtime tools used by the agent and the credential used to
post the final reply.

## Bind a provider project to an agent

```http
POST /api/integrations/external-agents/bindings
X-Computer-Agents-Organization: <organization-id>
Content-Type: application/json

{
  "installationId": "<installation-id>",
  "externalProjectId": "<jira-project-id>",
  "displayName": "Support triage",
  "agentId": "<platform-agent-id>",
  "agentName": "Support Agent",
  "environmentId": "<computer-id>",
  "triggerModes": ["mention", "assignment", "command"],
  "permissionMode": "linked_member",
  "allowedOrganizationRoles": ["owner", "admin", "developer", "member"],
  "allowedConnectorActions": ["get_issue", "list_comments", "add_comment"]
}
```

Requested connector actions are checked against the server adapter catalog.
Destructive actions are not accepted. Omitting `allowedConnectorActions`
disables provider tools for that binding; grant only the actions the agent
needs. Bindings may target a computer with
`environmentId` or a platform project with `projectId`.

`linked_member` is the default and recommended requester mode. Link a provider
identity to a platform member:

```http
POST /api/integrations/external-agents/identities
X-Computer-Agents-Organization: <organization-id>
Content-Type: application/json

{
  "installationId": "<installation-id>",
  "providerUserId": "<jira-account-id>",
  "platformUserId": "<platform-user-id>",
  "displayName": "Example User",
  "email": "user@example.com"
}
```

The gateway revalidates organization membership at invocation time. For users
without platform identities, use `permissionMode: "external_requester"` only
with a non-empty `allowedExternalUserIds` allowlist.

For Jira reply idempotency, the Atlassian connector credential must be able to
create and read issue comment properties in addition to comments. Delivery
metadata is stored in a Jira comment property and is not rendered in the
comment body. With classic OAuth scopes this is covered by `read:jira-work`
and `write:jira-work`; granular configurations need the corresponding comment
and `read:comment.property:jira` / `write:comment.property:jira` scopes. Linear
delivery uses an invisible Markdown comment marker.

## User experience

In Jira, a permitted user can mention the configured app alias, write a `/ca`
command, or assign the issue to the app actor. The visible platform message is
the user's clean request; issue metadata and provider instructions are hidden
execution context. The gateway posts the completed run summary automatically.

A later permitted comment on the same issue continues the same platform thread.
The agent must not call `add_comment` merely to return its answer; provider
delivery is owned by the outbox. Connector actions remain available when the
task itself requires reading or updating Jira.

## Operations

Available management routes under `/api/integrations/external-agents`:

- `GET|POST /installations`, `GET|PATCH|DELETE /installations/:id`
- `GET|POST /bindings`, `GET|PATCH|DELETE /bindings/:id`
- `GET|POST /identities`, `GET|PATCH|DELETE /identities/:id`
- `GET /events`, `GET /events/:id`, `POST /events/:id/replay`
- `GET /deliveries`, `GET /deliveries/:id`, `POST /deliveries/:id/replay`
- `GET /health`

All list and item reads are organization-scoped. Events are immutable audit
records. Replay requeues a failed or denied event through the normal policy and
idempotency path.

Enable native provider transports only after their provider registration is
complete:

```dotenv
EXTERNAL_AGENT_JIRA_ROVO_ENABLED=true
EXTERNAL_AGENT_JIRA_NATIVE_ISSUER=
EXTERNAL_AGENT_JIRA_NATIVE_AUDIENCE=
EXTERNAL_AGENT_JIRA_NATIVE_JWKS_URL=
EXTERNAL_AGENT_LINEAR_NATIVE_ENABLED=true
```

Generic webhook invocation remains available when native transport is off.
