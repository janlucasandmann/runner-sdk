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

function readPositiveInteger(value, fallback, { minimum, maximum }) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.floor(parsed)));
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
  const defaultUpstreamOrigin = trimOrigin(
    env.RUNNER_UPSTREAM_ORIGIN
    || "https://api.computer-agents.com/v1",
  );
  const platformSessionSecret = String(env.PLATFORM_SESSION_SECRET || "");
  const platformControlPlaneSecret = String(
    env.PLATFORM_CONTROL_PLANE_SECRET || "",
  );
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
        path.join(aiosHostingRoot, ".env.production"),
        path.join(aiosHostingRoot, ".env"),
        path.join(cloudInfrastructureRoot, ".env"),
      ];
  const configuredGithubOrigins = splitCommaSeparatedValues(
    env.GITHUB_OAUTH_ALLOWED_ORIGINS,
  );

  return Object.freeze({
    aiosHostingRoot,
    aiosOrigin,
    aiosPublicRoot: path.join(aiosHostingRoot, "public"),
    bindAddress,
    defaultUpstreamOrigin,
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
    githubOauthAllowedOrigins: configuredGithubOrigins.length > 0
      ? configuredGithubOrigins
      : [
          "https://computer-agents.com",
          "https://platform.computer-agents.com",
          "https://testbaseai.web.app",
          "http://localhost:3000",
          "http://localhost:4177",
        ],
    githubOauthEnvFileCandidates: runtimeEnvFileCandidates,
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
