# Connector provider setup

This is the single setup checklist for the Asana, BigQuery, Box, Figma, Linear,
Microsoft Teams, Outlook, Outlook Calendar, and Slack connector rollout. The
application code, OAuth callbacks, token refresh, encrypted credential
persistence, and runtime tools are already wired. After registering the
provider apps, add their client IDs and secrets to the runtime environment,
restart the platform, and connect each provider from Configure → Connectors.

## Before creating provider apps

Use these callback URLs exactly. Providers compare redirect URLs literally.

| Connector | Local callback | Production callback |
| --- | --- | --- |
| Asana | `http://localhost:4177/api/aios/connectors/asana/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/asana/callback` |
| Box | `http://localhost:4177/api/aios/connectors/box/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/box/callback` |
| Figma | `http://localhost:4177/api/aios/connectors/figma/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/figma/callback` |
| Linear | `http://localhost:4177/api/aios/connectors/linear/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/linear/callback` |
| Microsoft Teams | `http://localhost:4177/api/aios/connectors/microsoft-teams/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/microsoft-teams/callback` |
| Outlook | `http://localhost:4177/api/aios/connectors/outlook/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/outlook/callback` |
| Outlook Calendar | `http://localhost:4177/api/aios/connectors/outlook-calendar/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/outlook-calendar/callback` |
| Slack | `http://localhost:4177/api/aios/connectors/slack/callback` | `<PLATFORM_APP_ORIGIN>/api/aios/connectors/slack/callback` |

For the hosted production service, `<PLATFORM_APP_ORIGIN>` is normally
`https://platform.computer-agents.com`. Register both local and production
callbacks while creating the apps so the same credentials can be used in both
environments when the provider permits multiple redirects.

The server derives callback URLs from `PLATFORM_APP_ORIGIN`, so callback
environment variables are optional unless a deployment uses a different public
callback. The deployment script also supplies the production defaults.

## Environment values to fill in

For local development, put the following values in
`../../web/hosting/.env.local` relative to this repository, or point
`PLATFORM_RUNTIME_ENV_FILES` at another private environment file. Never commit
the real values.

```dotenv
CONNECTOR_OAUTH_ALLOWED_ORIGINS=http://localhost:4177
CONNECTOR_TOKEN_ENCRYPTION_KEY=<at-least-32-random-bytes>

ASANA_OAUTH_CLIENT_ID=
ASANA_OAUTH_CLIENT_SECRET=

BOX_OAUTH_CLIENT_ID=
BOX_OAUTH_CLIENT_SECRET=

FIGMA_OAUTH_CLIENT_ID=
FIGMA_OAUTH_CLIENT_SECRET=

LINEAR_OAUTH_CLIENT_ID=
LINEAR_OAUTH_CLIENT_SECRET=

MICROSOFT_CONNECTOR_CLIENT_ID=
MICROSOFT_CONNECTOR_CLIENT_SECRET=

SLACK_OAUTH_CLIENT_ID=
SLACK_OAUTH_CLIENT_SECRET=
```

Generate the shared encryption key once if the deployment does not already
have one:

```bash
openssl rand -base64 32
```

One shared key is enough. Provider-specific keys such as
`ASANA_TOKEN_ENCRYPTION_KEY` or `SLACK_TOKEN_ENCRYPTION_KEY` are supported when
separate key rotation domains are required, but are not needed for initial
setup.

After changing local environment values, restart the platform:

```bash
npm run platform:serve
```

For production, add the same variables to the stage environment or Cloud Run
secret bindings before running `deployment/platform/deploy.sh`. The deployment
script already forwards every variable listed above.

## Asana

Official references: [OAuth](https://developers.asana.com/docs/oauth) and
[app overview](https://developers.asana.com/docs/overview).

1. Open the Asana Developer Console from the user menu and create a new app.
2. In OAuth, add both required redirect URLs from the callback table.
3. Under OAuth → Permission scopes, enable **Full permissions**. The runtime
   requests Asana's `default` scope because its task, project, story,
   attachment, and task-search actions span endpoints that are not all covered
   by one stable granular scope set.
4. Configure distribution for the organizations that should be allowed to
   install the app. Keeping the app organization-only is sufficient for
   internal use.
5. Copy the client ID and client secret into
   `ASANA_OAUTH_CLIENT_ID` and `ASANA_OAUTH_CLIENT_SECRET`.

The platform uses authorization-code OAuth with S256 PKCE and refreshes
expiring access tokens on the server.

## Box

Official references: [OAuth 2.0
setup](https://developer.box.com/guides/authentication/oauth2/oauth2-setup),
[Box scopes](https://developer.box.com/guides/api-calls/permissions-and-errors/scopes),
and [refresh-token
behavior](https://developer.box.com/guides/authentication/tokens/refresh).

1. Open the Box Developer Console and choose **Create Platform App**.
2. Select **User Authentication (OAuth 2.0)**. This authentication choice
   cannot be changed later.
3. On Configuration, add both required OAuth 2.0 redirect URIs.
4. Under Application Scopes, enable **Read and write all files and folders
   stored in Box**. This corresponds to `root_readwrite`.
5. Do not enable Global Content Manager or enterprise-wide scopes; the runtime
   acts with the connected user's existing Box permissions.
6. Copy the client ID and client secret into `BOX_OAUTH_CLIENT_ID` and
   `BOX_OAUTH_CLIENT_SECRET`.

Box access tokens last about one hour. Its refresh tokens are single-use and
expire after 60 days of inactivity. The runtime serializes refresh attempts and
persists every rotated refresh token, but a connection unused for more than 60
days must be connected again.

## Figma

Official references: [OAuth app
registration](https://developers.figma.com/docs/rest-api/oauth-apps/),
[REST API scopes](https://developers.figma.com/docs/rest-api/scopes/), and the
[OAuth endpoint changelog](https://developers.figma.com/docs/rest-api/changelog/).

1. Open [Figma My Apps](https://www.figma.com/developers/apps) and create a new
   OAuth app associated with the intended team or organization.
2. Copy the client secret immediately. Figma only displays it once.
3. On OAuth credentials, add both required redirect URLs.
4. Enable these exact scopes:

   - `current_user:read`
   - `file_content:read`
   - `file_metadata:read`
   - `file_comments:read`
   - `file_versions:read`
   - `projects:read`
   - `file_comments:write`
   - `webhooks:write`

5. Publish as a private app for organization-only use. This is required for the
   connector's team-project and project-file actions because Figma does not
   permit the Projects endpoints in public OAuth apps. A public app must also
   pass Figma review before other organizations can authorize it.
6. Copy the values into `FIGMA_OAUTH_CLIENT_ID` and
   `FIGMA_OAUTH_CLIENT_SECRET`.

The platform uses S256 PKCE, HTTP Basic client authentication for token
exchange, and the current `/v1/oauth/token` endpoint for both initial exchange
and refresh. API results are still limited to files, projects, and teams the
authorizing user can access.

## Linear

Official references: [OAuth
2.0](https://linear.app/developers/oauth-2-0-authentication) and [OAuth actor
authorization](https://linear.app/developers/oauth-actor-authorization).

1. In the Linear workspace settings, open API → OAuth applications and create
   an application. A dedicated workspace for managing production applications
   is recommended by Linear.
2. Add both required callback URLs.
3. Enable these scopes:

   - `read`
   - `write`
   - `issues:create`
   - `comments:create`

4. Copy the client ID and client secret into `LINEAR_OAUTH_CLIENT_ID` and
   `LINEAR_OAUTH_CLIENT_SECRET`.

The authorization request already sends `actor=app`, `prompt=consent`, and S256
PKCE. Consequently, Linear changes are attributed to the application rather
than silently impersonating the installing user. Installing an app actor
requires a workspace admin. Since April 1, 2026, Linear uses rotating refresh
tokens; the runtime persists every replacement.

## Microsoft Teams, Outlook, and Outlook Calendar

These three connectors intentionally share one confidential Microsoft Entra
application but store independent user grants. Official references:
[register an Entra
application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app),
[add redirect
URIs](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-redirect-uri),
and [delegated Microsoft Graph
access](https://learn.microsoft.com/en-us/graph/auth-v2-user).

1. Open the Microsoft Entra admin center, then Identity → Applications → App
   registrations → New registration.
2. Choose **Accounts in any organizational directory and personal Microsoft
   accounts** if Outlook must support both Microsoft 365 and consumer Outlook.
   Teams actions still require a work or school account.
3. Under Authentication, add a **Web** platform—not a Single-page application.
4. Add all six local and production redirect URLs for Teams, Outlook, and
   Outlook Calendar from the callback table.
5. Under Certificates & secrets, create a client secret and copy its **Value**
   immediately.
6. Under API permissions → Microsoft Graph → Delegated permissions, add this
   union:

   - `User.Read`
   - `Mail.ReadWrite`
   - `Mail.Send`
   - `Calendars.ReadWrite`
   - `Team.ReadBasic.All`
   - `TeamMember.Read.All`
   - `Channel.ReadBasic.All`
   - `ChannelMessage.Read.All`
   - `ChannelMessage.Send`
   - `Channel.Create`
   - `ChannelSettings.ReadWrite.All`
   - `Channel.Delete.All`

7. Grant tenant-wide admin consent. Several Teams permissions require
   administrator consent; without it, the Outlook connectors may work while
   Teams reads or channel administration fail.
8. Copy the application/client ID and secret value into
   `MICROSOFT_CONNECTOR_CLIENT_ID` and
   `MICROSOFT_CONNECTOR_CLIENT_SECRET`.

The platform also requests `offline_access`, `openid`, `profile`, and `email`
at authorization time. It uses the delegated authorization-code flow with S256
PKCE and refreshes tokens through the Entra `common` tenant endpoint.

## Slack

Official references: [installing with
OAuth](https://docs.slack.dev/authentication/installing-with-oauth/),
[`search.messages`](https://docs.slack.dev/reference/methods/search.messages/),
and [the current external file-upload
flow](https://docs.slack.dev/messaging/working-with-files/).

1. Open [Your Slack Apps](https://api.slack.com/apps), create an app from
   scratch, and select its development workspace.
2. Under OAuth & Permissions, add both required redirect URLs.
3. Add these **Bot Token Scopes**:

   - `channels:read`
   - `channels:history`
   - `groups:read`
   - `groups:history`
   - `im:read`
   - `im:history`
   - `mpim:read`
   - `mpim:history`
   - `users:read`
   - `chat:write`
   - `files:write`
   - `reactions:write`

4. Add `search:read` under **User Token Scopes**. Slack's
   `search.messages` method does not accept a bot token, so the platform stores
   the returned bot and user tokens separately and uses the user token only for
   search.
5. Optional but recommended: enable token rotation. The runtime supports both
   non-expiring installations and Slack's rotating bot/user refresh tokens.
6. If users outside the development workspace need access, complete Slack's
   app distribution settings.
7. Copy the Basic Information → App Credentials values into
   `SLACK_OAUTH_CLIENT_ID` and `SLACK_OAUTH_CLIENT_SECRET`.
8. Install or reinstall the app after changing scopes.

The implementation uses `files.getUploadURLExternal` followed by
`files.completeUploadExternal`; it does not use the retired `files.upload`
method.

## BigQuery

BigQuery is the exception: it uses a service-account JSON credential, not an
OAuth client ID and secret. Official references: [BigQuery
authentication](https://docs.cloud.google.com/bigquery/docs/authentication),
[IAM roles](https://docs.cloud.google.com/bigquery/docs/access-control), and
[service-account
keys](https://docs.cloud.google.com/iam/docs/keys-create-delete).

1. In Google Cloud, select the project that owns the BigQuery jobs and enable
   the BigQuery API.
2. Create a dedicated service account, for example
   `computer-agents-bigquery`.
3. For read-only use, grant:

   - `roles/bigquery.jobUser` on the job/billing project
   - `roles/bigquery.metadataViewer` on the projects or datasets to inspect
   - `roles/bigquery.dataViewer` on the datasets to query

4. For approved write actions, additionally grant
   `roles/bigquery.dataEditor` only on the target datasets. If the connector
   must create datasets, grant `roles/bigquery.user` on that project.
5. Create a JSON key for the service account and download it. Treat it as a
   production secret.
6. In Configure → Connectors → BigQuery → Authentication, paste the complete
   JSON key and choose **Read only** or **Read & write**. This selection limits
   both the Google OAuth scope and the platform action grant; IAM remains the
   final authority.

Prefer workload identity or service-account impersonation for a future
keyless production hardening step. The current connector UI deliberately
accepts the JSON key because it works across hosted and on-prem deployments.

## Connect and verify

1. Restart the local server after filling the environment values.
2. Open Configure → Connectors.
3. Open a provider, select Authentication, and connect an account.
4. Confirm that the connection row shows the expected identity or workspace.
5. Attach the connector to a project or agent and run one read-only action.
6. Test an interactive action only after the read path succeeds; the platform's
   existing approval policy remains in force for writes and deletes.

OAuth credentials and refresh tokens stay encrypted on the server. The browser
receives only sanitized identity and connection metadata. A provider app's
scopes are an upper bound; the connected user's provider permissions and the
platform's per-action grant policy can further reduce access.
