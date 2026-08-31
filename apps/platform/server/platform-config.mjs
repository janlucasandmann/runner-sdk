import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(serverRoot, "../../..");

function trimOrigin(value) {
  return String(value || "").replace(/\/+$/, "");
}

function isLocalOrigin(value) {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(
      new URL(value).hostname,
    );
  } catch {
    return false;
  }
}

function splitCommaSeparatedValues(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function splitPathList(value) {
  return String(value || "")
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => path.resolve(entry));
}

function normalizeDeploymentTopology(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["on_prem", "on-prem", "onprem", "self_hosted", "self-hosted", "single_node"].includes(normalized)) {
    return "on_prem";
  }
  if (!normalized || ["gcp_saas", "gcp", "hosted", "saas"].includes(normalized)) {
    return "gcp_saas";
  }
  throw new Error(
    `Invalid deployment topology "${value}". Expected gcp_saas or on_prem.`,
  );
}

function normalizeDeploymentProfileId(value, topology) {
  const normalized = String(value || "").trim().toLowerCase().replaceAll("_", "-");
  const fallback = topology === "on_prem"
    ? "dgx-spark-appliance-v1"
    : "cloud-saas-v1";
  const aliases = new Map([
    ["", fallback],
    ["appliance", "dgx-spark-appliance-v1"],
    ["cloud", "cloud-saas-v1"],
    ["dgx-spark", "dgx-spark-appliance-v1"],
    ["dgx-spark-appliance-v1", "dgx-spark-appliance-v1"],
    ["cloud-saas-v1", "cloud-saas-v1"],
  ]);
  const profileId = aliases.get(normalized);
  if (!profileId) {
    throw new Error(
      `Invalid deployment profile "${value}". Expected cloud-saas-v1 or dgx-spark-appliance-v1.`,
    );
  }
  const expectedTopology = profileId === "dgx-spark-appliance-v1"
    ? "on_prem"
    : "gcp_saas";
  if (expectedTopology !== topology) {
    throw new Error(
      `Deployment profile "${profileId}" requires topology "${expectedTopology}", but "${topology}" was configured.`,
    );
  }
  return profileId;
}

function normalizeDeploymentStage(value, nodeEnvironment) {
  const normalized = String(value || "").trim().toLowerCase();
  const aliases = new Map([
    ["dev", "dev"],
    ["develop", "dev"],
    ["development", "dev"],
    ["cons", "cons"],
    ["consolidation", "cons"],
    ["stage", "cons"],
    ["staging", "cons"],
    ["prod", "prod"],
    ["production", "prod"],
  ]);
  if (!normalized) return nodeEnvironment === "production" ? "prod" : "dev";
  const stage = aliases.get(normalized);
  if (!stage) {
    throw new Error(
      `Invalid deployment stage "${value}". Expected dev, cons, or prod.`,
    );
  }
  return stage;
}

function readPositiveInteger(value, fallback, { minimum, maximum }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(parsed)));
}

function readBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`Expected true or false, received "${value}".`);
}

function normalizeLoopbackGrpcAddress(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "";
  const match = normalized.match(/^([^:]+):(\d{1,5})$/);
  if (!match || !["127.0.0.1", "localhost", "::1"].includes(match[1])) {
    throw new Error(
      "OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS must use a loopback host and port.",
    );
  }
  const port = Number(match[2]);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS has an invalid port.");
  }
  return normalized;
}

function validateSecret(name, value) {
  if (Buffer.byteLength(String(value || ""), "utf8") < 32) {
    throw new Error(`${name} must contain at least 32 bytes.`);
  }
}

const SUPPORTED_OIDC_ID_TOKEN_ALGORITHMS = new Set([
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
]);

function isSecureOrLoopbackUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) return false;
    return parsed.protocol === "https:" || (
      parsed.protocol === "http:"
      && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

function isValidOidcIssuer(value) {
  if (!isSecureOrLoopbackUrl(value)) return false;
  const parsed = new URL(value);
  return !parsed.search && !parsed.hash && value.length <= 2_048;
}

function normalizeOptionalHttpsOrigin(value, name) {
  const normalized = trimOrigin(value);
  if (!normalized) return "";
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`${name} must be a valid HTTPS origin.`);
  }
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
  ) {
    throw new Error(`${name} must be an HTTPS origin without a path, query, or credentials.`);
  }
  return parsed.origin;
}

export function createPlatformConfig(env = process.env) {
  const port = Number(env.PORT || 4177);
  const bindAddress = String(
    env.PLATFORM_BIND_ADDRESS || env.HOST || "0.0.0.0",
  ).trim();
  if (!/^[A-Za-z0-9_.:-]+$/.test(bindAddress)) {
    throw new Error("PLATFORM_BIND_ADDRESS is invalid.");
  }
  const deploymentTopology = normalizeDeploymentTopology(
    env.DEPLOYMENT_TOPOLOGY || env.PLATFORM_TOPOLOGY,
  );
  const deploymentProfileId = normalizeDeploymentProfileId(
    env.DEPLOYMENT_PROFILE_ID,
    deploymentTopology,
  );
  const deploymentStage = normalizeDeploymentStage(
    env.DEPLOYMENT_STAGE || env.PLATFORM_STAGE,
    env.NODE_ENV,
  );
  const identityProvider = String(
    env.IDENTITY_PROVIDER || (deploymentTopology === "on_prem" ? "oidc" : "firebase"),
  ).trim().toLowerCase();
  if (!["firebase", "oidc"].includes(identityProvider)) {
    throw new Error(
      `Invalid IDENTITY_PROVIDER "${identityProvider}". Expected firebase or oidc.`,
    );
  }
  if (deploymentTopology === "on_prem" && identityProvider !== "oidc") {
    throw new Error("On-prem platform deployments require IDENTITY_PROVIDER=oidc.");
  }
  const aiosOrigin = trimOrigin(
    env.AIOS_APP_ORIGIN || "http://localhost:3001",
  );
  const platformOrigin = trimOrigin(
    env.PLATFORM_APP_ORIGIN
    || env.NEXT_PUBLIC_PLATFORM_APP_URL
    || `http://localhost:${port}`,
  );
  const stockifiPlatformOrigin = normalizeOptionalHttpsOrigin(
    env.PLATFORM_STOCKIFI_ORIGIN,
    "PLATFORM_STOCKIFI_ORIGIN",
  );
  const defaultUpstreamOrigin = trimOrigin(
    env.RUNNER_UPSTREAM_ORIGIN
    || "https://api.computer-agents.com/v1",
  );
  const platformSessionSecret = String(env.PLATFORM_SESSION_SECRET || "");
  const platformControlPlaneSecret = String(
    env.PLATFORM_CONTROL_PLANE_SECRET || "",
  ).replace(/(?:\r\n|\r|\n)+$/, "");
  const executionDispatcherRequested = String(
    env.ENABLE_EXECUTION_DISPATCHER || "",
  ).trim().toLowerCase();
  if (
    executionDispatcherRequested
    && !["true", "false"].includes(executionDispatcherRequested)
  ) {
    throw new Error("ENABLE_EXECUTION_DISPATCHER must be true or false.");
  }
  const executionDispatcherEnabled = executionDispatcherRequested === "true";
  if (executionDispatcherEnabled) {
    validateSecret(
      "PLATFORM_CONTROL_PLANE_SECRET",
      platformControlPlaneSecret,
    );
  }
  const executionDispatchControlOrigin = trimOrigin(
    env.EXECUTION_DISPATCH_CONTROL_ORIGIN
    || defaultUpstreamOrigin.replace(/\/v1$/i, ""),
  );
  if (
    executionDispatcherEnabled
    && !isSecureOrLoopbackUrl(executionDispatchControlOrigin)
  ) {
    throw new Error(
      "EXECUTION_DISPATCH_CONTROL_ORIGIN must use HTTPS, except for a loopback origin in local development.",
    );
  }
  // OIDC issuer comparison is deliberately exact. A trailing slash is part of
  // the issuer identifier and must not be normalized away.
  const oidcIssuerUrl = String(env.OIDC_ISSUER_URL || "").trim();
  const oidcClientId = String(env.OIDC_CLIENT_ID || "").trim();
  const oidcClientSecret = String(env.OIDC_CLIENT_SECRET || "");
  const oidcScopes = splitCommaSeparatedValues(
    env.OIDC_SCOPES || "openid,profile,email",
  );
  const oidcAllowedAlgorithms = splitCommaSeparatedValues(
    env.OIDC_ALLOWED_ID_TOKEN_ALGORITHMS || "RS256,PS256,ES256,EdDSA",
  );
  const oidcTokenEndpointAuthMethod = String(
    env.OIDC_TOKEN_ENDPOINT_AUTH_METHOD
    || (oidcClientSecret ? "client_secret_basic" : "none"),
  ).trim();
  const oidcLocalAccountsEnabled = readBoolean(
    env.OIDC_LOCAL_ACCOUNTS_ENABLED,
    false,
  );
  const oidcLocalAccountsGrpcAddress = normalizeLoopbackGrpcAddress(
    env.OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS,
  );
  const passwordResetEmailProvider = String(
    env.PASSWORD_RESET_EMAIL_PROVIDER || "disabled",
  ).trim().toLowerCase();
  const passwordResetApiKey = String(
    env.PASSWORD_RESET_SENDGRID_API_KEY || env.SENDGRID_API_KEY || "",
  ).trim();
  const passwordResetFromAddress = String(
    env.PASSWORD_RESET_FROM_ADDRESS
    || env.EMAIL_FROM_ADDRESS
    || "noreply@computer-agents.com",
  ).trim().toLowerCase();
  const passwordResetFromName = String(
    env.PASSWORD_RESET_FROM_NAME
    || env.EMAIL_FROM_NAME
    || "Computer Agents",
  ).trim();
  const passwordResetTokenTtlSeconds = readPositiveInteger(
    env.PASSWORD_RESET_TOKEN_TTL_SECONDS,
    30 * 60,
    { minimum: 5 * 60, maximum: 2 * 60 * 60 },
  );
  const platformDataRoot = String(env.PLATFORM_DATA_ROOT || "").trim();
  const passwordResetStatePath = String(
    env.PASSWORD_RESET_STATE_PATH
    || (platformDataRoot
      ? path.join(platformDataRoot, "identity", "password-reset-tokens.json")
      : ""),
  ).trim();
  if (!["disabled", "sendgrid"].includes(passwordResetEmailProvider)) {
    throw new Error(
      "PASSWORD_RESET_EMAIL_PROVIDER must be disabled or sendgrid.",
    );
  }
  if (!["client_secret_basic", "client_secret_post", "none"].includes(oidcTokenEndpointAuthMethod)) {
    throw new Error(
      `Invalid OIDC_TOKEN_ENDPOINT_AUTH_METHOD "${oidcTokenEndpointAuthMethod}".`,
    );
  }
  if (identityProvider === "oidc") {
    if (!oidcIssuerUrl || !isValidOidcIssuer(oidcIssuerUrl)) {
      throw new Error(
        "OIDC_ISSUER_URL must use HTTPS, except for an HTTP loopback issuer in local development.",
      );
    }
    if (!oidcClientId) {
      throw new Error("OIDC_CLIENT_ID is required when IDENTITY_PROVIDER=oidc.");
    }
    if (!isSecureOrLoopbackUrl(platformOrigin)) {
      throw new Error(
        "PLATFORM_APP_ORIGIN must use HTTPS, except for a loopback origin in local development.",
      );
    }
    if (
      oidcTokenEndpointAuthMethod !== "none"
      && !oidcClientSecret
    ) {
      throw new Error(
        `OIDC_CLIENT_SECRET is required when OIDC_TOKEN_ENDPOINT_AUTH_METHOD=${oidcTokenEndpointAuthMethod}.`,
      );
    }
    if (!oidcScopes.includes("openid")) {
      throw new Error("OIDC_SCOPES must include openid.");
    }
    if (oidcLocalAccountsEnabled && !oidcLocalAccountsGrpcAddress) {
      throw new Error(
        "OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS is required when local account registration is enabled.",
      );
    }
    if (passwordResetEmailProvider !== "disabled" && !oidcLocalAccountsEnabled) {
      throw new Error(
        "Password reset email requires OIDC local accounts to be enabled.",
      );
    }
    if (passwordResetEmailProvider === "sendgrid") {
      validateSecret("PASSWORD_RESET_SENDGRID_API_KEY", passwordResetApiKey);
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passwordResetFromAddress)
        || /[\r\n\0]/.test(passwordResetFromAddress)
      ) {
        throw new Error("PASSWORD_RESET_FROM_ADDRESS must be a valid email address.");
      }
      if (!passwordResetFromName || passwordResetFromName.length > 100) {
        throw new Error("PASSWORD_RESET_FROM_NAME must contain between 1 and 100 characters.");
      }
      if (!passwordResetStatePath || !path.isAbsolute(passwordResetStatePath)) {
        throw new Error(
          "PASSWORD_RESET_STATE_PATH or PLATFORM_DATA_ROOT must provide an absolute durable password reset state path.",
        );
      }
    }
    if (
      oidcAllowedAlgorithms.length === 0
      || oidcAllowedAlgorithms.some(
        (algorithm) => !SUPPORTED_OIDC_ID_TOKEN_ALGORITHMS.has(algorithm),
      )
    ) {
      throw new Error(
        "OIDC_ALLOWED_ID_TOKEN_ALGORITHMS must contain only supported asymmetric signing algorithms.",
      );
    }
    validateSecret("PLATFORM_SESSION_SECRET", platformSessionSecret);
    validateSecret(
      "PLATFORM_CONTROL_PLANE_SECRET",
      platformControlPlaneSecret,
    );
    if (deploymentTopology === "on_prem" && !String(env.RUNNER_UPSTREAM_ORIGIN || "").trim()) {
      throw new Error(
        "RUNNER_UPSTREAM_ORIGIN must explicitly target the local control API for on-prem deployments.",
      );
    }
  }
  const aiosHostingRoot = path.resolve(
    env.AIOS_HOSTING_ROOT
    || path.join(packageRoot, "..", "..", "web", "hosting"),
  );
  const cloudInfrastructureRoot = path.resolve(
    env.COMPUTER_AGENTS_CLOUD_INFRASTRUCTURE_ROOT
    || path.join(
      packageRoot,
      "..",
      "..",
      "computer-agents",
      "packages",
      "cloud-infrastructure",
    ),
  );
  const configuredRuntimeEnvFiles = splitPathList(
    env.PLATFORM_RUNTIME_ENV_FILES,
  );
  const runtimeEnvFileCandidates = configuredRuntimeEnvFiles.length > 0
    ? configuredRuntimeEnvFiles
    : [
        path.join(aiosHostingRoot, ".env.local"),
        ...(env.NODE_ENV === "development"
          || deploymentStage === "dev"
          || isLocalOrigin(platformOrigin)
          ? [
              path.join(aiosHostingRoot, ".env.development"),
              path.join(aiosHostingRoot, ".env.dev"),
            ]
          : []),
        path.join(aiosHostingRoot, ".env.production"),
        path.join(aiosHostingRoot, ".env"),
        path.join(cloudInfrastructureRoot, ".env"),
      ];
  const configuredConnectorOauthOrigins = splitCommaSeparatedValues(
    env.CONNECTOR_OAUTH_ALLOWED_ORIGINS
    || env.GITHUB_OAUTH_ALLOWED_ORIGINS,
  );
  const connectorOauthAllowedOrigins =
    configuredConnectorOauthOrigins.length > 0
      ? configuredConnectorOauthOrigins
      : [
          "https://computer-agents.com",
          "https://platform.computer-agents.com",
          "https://testbaseai.web.app",
          "http://localhost:3000",
          "http://localhost:4177",
        ];

  return Object.freeze({
    aiosHostingRoot,
    aiosOrigin,
    aiosPublicRoot: path.join(aiosHostingRoot, "public"),
    bindAddress,
    defaultUpstreamOrigin,
    deploymentProfileId,
    deploymentStage,
    deploymentTopology,
    deploymentVmNameOverride: String(
      env.TESTBASE_DEPLOYMENT_VM_NAME || "",
    ).trim(),
    deploymentVmNamePrefix: String(
      env.TESTBASE_DEPLOYMENT_VM_NAME_PREFIX || "testbase-mig-",
    ).trim(),
    deploymentVmProject: String(
      env.TESTBASE_DEPLOYMENT_VM_PROJECT
      || env.GOOGLE_CLOUD_PROJECT
      || env.GCLOUD_PROJECT
      || "firechatbot-a9654",
    ).trim(),
    distRoot: path.join(packageRoot, "dist"),
    feedbackSummaryAdminEnvFileCandidates: runtimeEnvFileCandidates,
    feedbackSummaryAllowedEmail: String(
      env.PLATFORM_ADMIN_EMAIL
      || env.FEEDBACK_SUMMARY_ALLOWED_EMAIL
      || "",
    ).trim().toLowerCase(),
    connectorOauthAllowedOrigins,
    connectorOauthEnvFileCandidates: runtimeEnvFileCandidates,
    // Compatibility aliases for downstream deployments that still reference
    // the original GitHub-specific configuration names.
    githubOauthAllowedOrigins: connectorOauthAllowedOrigins,
    githubOauthEnvFileCandidates: runtimeEnvFileCandidates,
    executionDispatcher: Object.freeze({
      enabled: executionDispatcherEnabled,
      controlOrigin: executionDispatchControlOrigin,
      workerId: String(env.EXECUTION_DISPATCH_WORKER_ID || "").trim(),
      pollIntervalMs: readPositiveInteger(
        env.EXECUTION_DISPATCH_POLL_INTERVAL_MS,
        2_000,
        { minimum: 250, maximum: 60_000 },
      ),
      maximumIdlePollIntervalMs: readPositiveInteger(
        env.EXECUTION_DISPATCH_MAX_IDLE_POLL_INTERVAL_MS,
        8_000,
        { minimum: 250, maximum: 60_000 },
      ),
      heartbeatIntervalMs: readPositiveInteger(
        env.EXECUTION_DISPATCH_HEARTBEAT_INTERVAL_MS,
        25_000,
        { minimum: 5_000, maximum: 60_000 },
      ),
      leaseTtlMs: readPositiveInteger(
        env.EXECUTION_DISPATCH_LEASE_TTL_MS,
        120_000,
        { minimum: 30_000, maximum: 5 * 60_000 },
      ),
      batchSize: readPositiveInteger(
        env.EXECUTION_DISPATCH_BATCH_SIZE,
        4,
        { minimum: 1, maximum: 20 },
      ),
      maxConcurrency: readPositiveInteger(
        env.EXECUTION_DISPATCH_MAX_CONCURRENCY,
        4,
        { minimum: 1, maximum: 20 },
      ),
    }),
    noVncNextRoot: path.join(packageRoot, "node_modules", "novnc-next"),
    notionOauthCallbackUri: String(
      env.NOTION_OAUTH_REDIRECT_URI
      || env.NOTION_OAUTH_REDIRECT_URL
      || "https://computer-agents.com/api/notion/callback",
    ).trim(),
    packageRoot,
    identityProvider,
    oidc: Object.freeze({
      issuerUrl: oidcIssuerUrl,
      clientId: oidcClientId,
      clientSecret: oidcClientSecret,
      audience: String(env.OIDC_AUDIENCE || oidcClientId).trim(),
      scopes: oidcScopes,
      callbackPath: "/api/platform/auth/callback",
      tokenEndpointAuthMethod: oidcTokenEndpointAuthMethod,
      allowedAlgorithms: oidcAllowedAlgorithms,
      localAccounts: Object.freeze({
        enabled: oidcLocalAccountsEnabled,
        grpcAddress: oidcLocalAccountsGrpcAddress,
      }),
    }),
    passwordReset: Object.freeze({
      enabled: passwordResetEmailProvider !== "disabled",
      provider: passwordResetEmailProvider,
      apiKey: passwordResetApiKey,
      fromAddress: passwordResetFromAddress,
      fromName: passwordResetFromName,
      tokenTtlSeconds: passwordResetTokenTtlSeconds,
      statePath: passwordResetStatePath,
    }),
    platformControlPlaneSecret,
    platformPrincipalAssertionAudience: String(
      env.PLATFORM_PRINCIPAL_ASSERTION_AUDIENCE
      || "computer-agents-control-api",
    ).trim(),
    platformPrincipalAssertionIssuer: String(
      env.PLATFORM_PRINCIPAL_ASSERTION_ISSUER
      || "computer-agents-platform",
    ).trim(),
    platformOrigin,
    stockifiPlatformOrigin,
    platformSessionCookieName: String(
      env.PLATFORM_SESSION_COOKIE_NAME || "computer_agents_session",
    ).trim(),
    platformSessionSecret,
    platformSessionTtlSeconds: readPositiveInteger(
      env.PLATFORM_SESSION_TTL_SECONDS,
      8 * 60 * 60,
      { minimum: 5 * 60, maximum: 24 * 60 * 60 },
    ),
    platformCookieSecure: env.PLATFORM_COOKIE_SECURE
      ? env.PLATFORM_COOKIE_SECURE === "true"
      : !isLocalOrigin(platformOrigin),
    platformViteOrigin: trimOrigin(env.PLATFORM_VITE_ORIGIN),
    playgroundSystemSkillsRoot: path.resolve(
      env.PLATFORM_SYSTEM_SKILLS_ROOT
      || path.join(cloudInfrastructureRoot, "skills"),
    ),
    port,
    shouldForwardLocalCloudApiOverride: isLocalOrigin(defaultUpstreamOrigin),
    xlsxRoot: path.join(packageRoot, "node_modules", "xlsx"),
  });
}
