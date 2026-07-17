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

export function createPlatformConfig(env = process.env) {
  const port = Number(env.PORT || 4177);
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
    defaultUpstreamOrigin,
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
    platformOrigin,
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
