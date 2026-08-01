const OAUTH2 = "oauth2";
const API_KEY = "api-key";
const SERVICE_ACCOUNT = "service-account";

const MICROSOFT_AUTHORIZE_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const microsoftProvider = ({ id, label, scopes }) => ({
  id,
  label,
  authentication: OAUTH2,
  authorizeUrl: MICROSOFT_AUTHORIZE_URL,
  tokenUrl: MICROSOFT_TOKEN_URL,
  clientIdEnv: "MICROSOFT_CONNECTOR_CLIENT_ID",
  clientSecretEnv: "MICROSOFT_CONNECTOR_CLIENT_SECRET",
  callbackUrlEnv: `${toEnvironmentPrefix(id)}_OAUTH_CALLBACK_URL`,
  scopes: ["offline_access", "openid", "profile", "email", ...scopes],
  authorizeParams: { response_mode: "query" },
  pkce: true,
  profile: {
    url: "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName",
    identityFields: ["mail", "userPrincipalName", "displayName", "id"],
  },
});

const PROVIDERS = [
  {
    id: "linear",
    label: "Linear",
    authentication: OAUTH2,
    authorizeUrl: "https://linear.app/oauth/authorize",
    tokenUrl: "https://api.linear.app/oauth/token",
    clientIdEnv: "LINEAR_OAUTH_CLIENT_ID",
    clientSecretEnv: "LINEAR_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "LINEAR_OAUTH_CALLBACK_URL",
    scopes: ["read", "write", "issues:create", "comments:create"],
    scopeSeparator: ",",
    authorizeParams: { prompt: "consent", actor: "app" },
    pkce: true,
    profile: {
      url: "https://api.linear.app/graphql",
      method: "POST",
      body: JSON.stringify({
        query: "query ConnectorViewer { viewer { id name email displayName } }",
      }),
      headers: { "Content-Type": "application/json" },
      unwrap: ["data", "viewer"],
      identityFields: ["email", "displayName", "name", "id"],
    },
  },
  {
    id: "box",
    label: "Box",
    authentication: OAUTH2,
    authorizeUrl: "https://account.box.com/api/oauth2/authorize",
    tokenUrl: "https://api.box.com/oauth2/token",
    clientIdEnv: "BOX_OAUTH_CLIENT_ID",
    clientSecretEnv: "BOX_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "BOX_OAUTH_CALLBACK_URL",
    scopes: ["root_readwrite"],
    profile: {
      url: "https://api.box.com/2.0/users/me",
      identityFields: ["login", "name", "id"],
    },
  },
  {
    id: "google-calendar",
    label: "Google Calendar",
    authentication: OAUTH2,
    authorizeUrl: GOOGLE_AUTHORIZE_URL,
    tokenUrl: GOOGLE_TOKEN_URL,
    clientIdEnv: "GOOGLE_CONNECTOR_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CONNECTOR_CLIENT_SECRET",
    callbackUrlEnv: "GOOGLE_CALENDAR_OAUTH_CALLBACK_URL",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    authorizeParams: {
      access_type: "offline",
      include_granted_scopes: "true",
      prompt: "consent select_account",
    },
    pkce: true,
    profile: {
      url: "https://openidconnect.googleapis.com/v1/userinfo",
      identityFields: ["email", "name", "sub"],
    },
  },
  microsoftProvider({
    id: "outlook",
    label: "Outlook",
    scopes: ["User.Read", "Mail.ReadWrite", "Mail.Send"],
  }),
  microsoftProvider({
    id: "outlook-calendar",
    label: "Outlook Calendar",
    scopes: ["User.Read", "Calendars.ReadWrite"],
  }),
  {
    id: "bigquery",
    label: "BigQuery",
    authentication: SERVICE_ACCOUNT,
    credentialFields: ["serviceAccountJson"],
    defaultPermissionClass: "read_only",
    scopesByPermissionClass: {
      read_only: "https://www.googleapis.com/auth/bigquery.readonly",
      read_write: "https://www.googleapis.com/auth/bigquery",
    },
    identityFields: ["client_email", "project_id"],
  },
  {
    id: "slack",
    label: "Slack",
    authentication: OAUTH2,
    authorizeUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_OAUTH_CLIENT_ID",
    clientSecretEnv: "SLACK_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "SLACK_OAUTH_CALLBACK_URL",
    scopes: [
      "channels:read",
      "channels:history",
      "groups:read",
      "groups:history",
      "im:read",
      "im:history",
      "mpim:read",
      "mpim:history",
      "users:read",
      "chat:write",
      "files:write",
      "reactions:write",
    ],
    userScopes: ["search:read"],
    profile: {
      url: "https://slack.com/api/auth.test",
      unwrap: [],
      identityFields: ["user", "team", "user_id", "team_id"],
      validate(payload) {
        return payload?.ok === true;
      },
    },
    validateToken(payload) {
      return payload?.ok === true;
    },
  },
  microsoftProvider({
    id: "sharepoint",
    label: "SharePoint",
    scopes: ["User.Read", "Files.ReadWrite.All", "Sites.ReadWrite.All"],
  }),
  {
    id: "stripe",
    label: "Stripe",
    authentication: API_KEY,
    credentialFields: ["apiKey"],
    identityFields: ["accountId", "displayName"],
    validateCredentials(values) {
      const key = String(values?.apiKey || "").trim();
      if (!key.startsWith("rk_")) {
        return "Use a Stripe restricted API key (rk_) so provider permissions remain least-privileged.";
      }
      return "";
    },
    defaultPermissionClass: "read_only",
  },
  {
    id: "dropbox",
    label: "Dropbox",
    authentication: OAUTH2,
    authorizeUrl: "https://www.dropbox.com/oauth2/authorize",
    tokenUrl: "https://api.dropboxapi.com/oauth2/token",
    clientIdEnv: "DROPBOX_OAUTH_CLIENT_ID",
    clientSecretEnv: "DROPBOX_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "DROPBOX_OAUTH_CALLBACK_URL",
    scopes: [
      "account_info.read",
      "files.metadata.read",
      "files.content.read",
      "sharing.read",
      "files.metadata.write",
      "files.content.write",
      "sharing.write",
    ],
    authorizeParams: {
      token_access_type: "offline",
      force_reapprove: "false",
    },
    pkce: true,
    profile: {
      url: "https://api.dropboxapi.com/2/users/get_current_account",
      method: "POST",
      body: "null",
      headers: { "Content-Type": "application/json" },
      identityFields: ["email", "display_name", "account_id"],
    },
  },
  {
    id: "asana",
    label: "Asana",
    authentication: OAUTH2,
    authorizeUrl: "https://app.asana.com/-/oauth_authorize",
    tokenUrl: "https://app.asana.com/-/oauth_token",
    clientIdEnv: "ASANA_OAUTH_CLIENT_ID",
    clientSecretEnv: "ASANA_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "ASANA_OAUTH_CALLBACK_URL",
    scopes: ["default"],
    pkce: true,
    profile: {
      url: "https://app.asana.com/api/1.0/users/me",
      unwrap: ["data"],
      identityFields: ["email", "name", "gid"],
    },
  },
  microsoftProvider({
    id: "microsoft-teams",
    label: "Microsoft Teams",
    scopes: [
      "User.Read",
      "Team.ReadBasic.All",
      "TeamMember.Read.All",
      "Channel.ReadBasic.All",
      "ChannelMessage.Read.All",
      "ChannelMessage.Send",
      "Channel.Create",
      "ChannelSettings.ReadWrite.All",
      "Channel.Delete.All",
    ],
  }),
  {
    id: "figma",
    label: "Figma",
    authentication: OAUTH2,
    authorizeUrl: "https://www.figma.com/oauth",
    tokenUrl: "https://api.figma.com/v1/oauth/token",
    clientIdEnv: "FIGMA_OAUTH_CLIENT_ID",
    clientSecretEnv: "FIGMA_OAUTH_CLIENT_SECRET",
    callbackUrlEnv: "FIGMA_OAUTH_CALLBACK_URL",
    tokenAuth: "basic",
    pkce: true,
    scopes: [
      "current_user:read",
      "file_content:read",
      "file_metadata:read",
      "file_comments:read",
      "file_versions:read",
      "projects:read",
      "file_comments:write",
      "webhooks:write",
    ],
    scopeSeparator: ",",
    profile: {
      url: "https://api.figma.com/v1/me",
      identityFields: ["email", "handle", "id"],
    },
  },
  {
    id: "supabase",
    label: "Supabase",
    authentication: API_KEY,
    credentialFields: ["apiKey"],
    identityFields: ["accountName"],
    validateCredentials(values) {
      return String(values?.apiKey || "").trim()
        ? ""
        : "A Supabase personal access token is required.";
    },
    defaultScope: "projects:read",
    defaultPermissionClass: "read_only",
  },
];

const PROVIDER_BY_ID = Object.freeze(
  Object.fromEntries(
    PROVIDERS.map((provider) => [
      provider.id,
      Object.freeze({
        ...provider,
        tokenAuth: provider.tokenAuth || "body",
        scopeSeparator: provider.scopeSeparator || " ",
        authorizeParams: Object.freeze({ ...(provider.authorizeParams || {}) }),
        scopes: Object.freeze([...(provider.scopes || [])]),
        userScopes: Object.freeze([...(provider.userScopes || [])]),
        scopesByPermissionClass: Object.freeze({
          ...(provider.scopesByPermissionClass || {}),
        }),
        credentialFields: Object.freeze([...(provider.credentialFields || [])]),
        encryptionKeyNames: Object.freeze([
          `${toEnvironmentPrefix(provider.id)}_TOKEN_ENCRYPTION_KEY`,
          "CONNECTOR_TOKEN_ENCRYPTION_KEY",
        ]),
      }),
    ]),
  ),
);

export const GENERIC_CONNECTOR_PROVIDER_IDS = Object.freeze(Object.keys(PROVIDER_BY_ID));

export function getGenericConnectorProvider(id) {
  return PROVIDER_BY_ID[normalizeProviderId(id)] || null;
}

export function isGenericConnectorProviderId(id) {
  return Boolean(getGenericConnectorProvider(id));
}

export function listGenericConnectorProviders() {
  return Object.values(PROVIDER_BY_ID);
}

export function buildGenericConnectorCallbackUrl(provider, platformOrigin, override = "") {
  if (override) return override;
  return new URL(
    `/api/aios/connectors/${encodeURIComponent(provider.id)}/callback`,
    `${platformOrigin}/`,
  ).toString();
}

function normalizeProviderId(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toEnvironmentPrefix(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}
