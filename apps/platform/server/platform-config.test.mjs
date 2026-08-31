import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { createPlatformConfig } from "./platform-config.mjs";

function validOidcEnvironment(overrides = {}) {
  return {
    DEPLOYMENT_TOPOLOGY: "on_prem",
    IDENTITY_PROVIDER: "oidc",
    OIDC_ISSUER_URL: "https://identity.example.test/realm/",
    OIDC_CLIENT_ID: "computer-agents-platform",
    OIDC_CLIENT_SECRET: "provider-client-secret",
    OIDC_TOKEN_ENDPOINT_AUTH_METHOD: "client_secret_basic",
    PLATFORM_APP_ORIGIN: "https://appliance.example.test",
    PLATFORM_SESSION_SECRET: "platform-session-secret-with-at-least-32-bytes",
    PLATFORM_CONTROL_PLANE_SECRET: "control-plane-secret-with-at-least-32-bytes",
    RUNNER_UPSTREAM_ORIGIN: "http://127.0.0.1:8080/v1",
    ...overrides,
  };
}

test("uses fail-closed administrator configuration and portable local roots", () => {
  const config = createPlatformConfig({
    DEPLOYMENT_STAGE: "prod",
  });

  assert.equal(config.feedbackSummaryAllowedEmail, "");
  assert.ok(path.isAbsolute(config.aiosHostingRoot));
  assert.ok(path.isAbsolute(config.playgroundSystemSkillsRoot));
  assert.ok(
    config.feedbackSummaryAdminEnvFileCandidates.some(
      (candidate) => candidate.endsWith(path.join("web", "hosting", ".env.dev")),
    ),
  );
  assert.ok(config.githubOauthAllowedOrigins.includes("http://localhost:4177"));
  assert.equal(
    config.connectorOauthAllowedOrigins,
    config.githubOauthAllowedOrigins,
  );
  assert.equal(config.executionDispatcher.enabled, false);
  assert.equal(config.deploymentProfileId, "cloud-saas-v1");
  assert.equal(config.deploymentStage, "prod");
});

test("does not load development environment files for a production origin", () => {
  const config = createPlatformConfig({
    DEPLOYMENT_STAGE: "prod",
    PLATFORM_APP_ORIGIN: "https://platform.example.test",
  });

  assert.equal(
    config.feedbackSummaryAdminEnvFileCandidates.some(
      (candidate) => candidate.endsWith(path.join("web", "hosting", ".env.dev")),
    ),
    false,
  );
});

test("normalizes explicit origins, paths, and administrator settings", () => {
  const config = createPlatformConfig({
    AIOS_HOSTING_ROOT: "./fixtures/hosting",
    COMPUTER_AGENTS_CLOUD_INFRASTRUCTURE_ROOT: "./fixtures/cloud",
    FEEDBACK_SUMMARY_ALLOWED_EMAIL: " Operator@Example.test ",
    GITHUB_OAUTH_ALLOWED_ORIGINS: "https://one.example, https://two.example ",
    PLATFORM_RUNTIME_ENV_FILES: [
      "./fixtures/first.env",
      "./fixtures/second.env",
    ].join(path.delimiter),
    PLATFORM_SYSTEM_SKILLS_ROOT: "./fixtures/skills",
  });

  assert.equal(config.feedbackSummaryAllowedEmail, "operator@example.test");
  assert.deepEqual(config.githubOauthAllowedOrigins, [
    "https://one.example",
    "https://two.example",
  ]);
  assert.deepEqual(
    config.connectorOauthAllowedOrigins,
    config.githubOauthAllowedOrigins,
  );
  assert.deepEqual(config.feedbackSummaryAdminEnvFileCandidates, [
    path.resolve("./fixtures/first.env"),
    path.resolve("./fixtures/second.env"),
  ]);
  assert.equal(
    config.githubOauthEnvFileCandidates,
    config.feedbackSummaryAdminEnvFileCandidates,
  );
  assert.equal(
    config.connectorOauthEnvFileCandidates,
    config.feedbackSummaryAdminEnvFileCandidates,
  );
  assert.equal(
    config.playgroundSystemSkillsRoot,
    path.resolve("./fixtures/skills"),
  );
});

test("normalizes the optional Stockifi platform redirect origin", () => {
  const config = createPlatformConfig({
    PLATFORM_STOCKIFI_ORIGIN: "https://stockifi.example.test/",
  });
  assert.equal(
    config.stockifiPlatformOrigin,
    "https://stockifi.example.test",
  );
});

test("rejects an unsafe Stockifi platform redirect target", () => {
  assert.throws(
    () => createPlatformConfig({
      PLATFORM_STOCKIFI_ORIGIN: "https://stockifi.example.test/path",
    }),
    /PLATFORM_STOCKIFI_ORIGIN must be an HTTPS origin/,
  );
});

test("builds a fail-closed on-prem OIDC profile without normalizing its issuer identifier", () => {
  const config = createPlatformConfig(validOidcEnvironment({
    PLATFORM_CONTROL_PLANE_SECRET:
      "control-plane-secret-with-at-least-32-bytes\n",
  }));

  assert.equal(config.deploymentTopology, "on_prem");
  assert.equal(config.deploymentProfileId, "dgx-spark-appliance-v1");
  assert.equal(config.deploymentStage, "dev");
  assert.equal(config.identityProvider, "oidc");
  assert.equal(config.oidc.issuerUrl, "https://identity.example.test/realm/");
  assert.equal(config.oidc.clientId, "computer-agents-platform");
  assert.deepEqual(config.oidc.scopes, ["openid", "profile", "email"]);
  assert.equal(config.platformCookieSecure, true);
  assert.equal(config.executionDispatcher.enabled, false);
  assert.equal(
    config.platformControlPlaneSecret,
    "control-plane-secret-with-at-least-32-bytes",
  );
  assert.equal(
    config.executionDispatcher.controlOrigin,
    "http://127.0.0.1:8080",
  );
});

test("rejects deployment profiles that do not match the selected topology", () => {
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      DEPLOYMENT_PROFILE_ID: "cloud-saas-v1",
    })),
    /requires topology "gcp_saas"/,
  );
});

test("enables local account registration only through a loopback Dex API", () => {
  const config = createPlatformConfig(validOidcEnvironment({
    OIDC_LOCAL_ACCOUNTS_ENABLED: "true",
    OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS: "127.0.0.1:5557",
  }));
  assert.deepEqual(config.oidc.localAccounts, {
    enabled: true,
    grpcAddress: "127.0.0.1:5557",
  });
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_LOCAL_ACCOUNTS_ENABLED: "true",
      OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS: "10.0.0.2:5557",
    })),
    /must use a loopback host and port/,
  );
});

test("configures password reset email only for local Dex accounts", () => {
  const config = createPlatformConfig(validOidcEnvironment({
    OIDC_LOCAL_ACCOUNTS_ENABLED: "true",
    OIDC_LOCAL_ACCOUNTS_GRPC_ADDRESS: "127.0.0.1:5557",
    PASSWORD_RESET_EMAIL_PROVIDER: "sendgrid",
    PASSWORD_RESET_SENDGRID_API_KEY: "sendgrid-secret-with-at-least-32-bytes",
    PASSWORD_RESET_FROM_ADDRESS: "accounts@example.test",
    PASSWORD_RESET_FROM_NAME: "Example Appliance",
    PASSWORD_RESET_TOKEN_TTL_SECONDS: "1200",
    PLATFORM_DATA_ROOT: "/var/lib/computer-agents/platform",
  }));
  assert.deepEqual(config.passwordReset, {
    enabled: true,
    provider: "sendgrid",
    apiKey: "sendgrid-secret-with-at-least-32-bytes",
    fromAddress: "accounts@example.test",
    fromName: "Example Appliance",
    tokenTtlSeconds: 1200,
    statePath: "/var/lib/computer-agents/platform/identity/password-reset-tokens.json",
  });

  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      PASSWORD_RESET_EMAIL_PROVIDER: "sendgrid",
      PASSWORD_RESET_SENDGRID_API_KEY: "sendgrid-secret-with-at-least-32-bytes",
    })),
    /requires OIDC local accounts/,
  );
});

test("enables execution dispatch only when explicitly requested", () => {
  const config = createPlatformConfig(validOidcEnvironment({
    ENABLE_EXECUTION_DISPATCHER: "true",
  }));

  assert.equal(config.executionDispatcher.enabled, true);
  assert.equal(config.executionDispatcher.pollIntervalMs, 2_000);
  assert.equal(config.executionDispatcher.maximumIdlePollIntervalMs, 8_000);
});

test("rejects incomplete or unsafe OIDC trust configuration", () => {
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_CLIENT_ID: "",
    })),
    /OIDC_CLIENT_ID is required/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_CLIENT_SECRET: "",
    })),
    /OIDC_CLIENT_SECRET is required/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_ISSUER_URL: "http://identity.example.test/realm",
    })),
    /OIDC_ISSUER_URL must use HTTPS/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_ISSUER_URL: "https://user:password@identity.example.test/realm",
    })),
    /OIDC_ISSUER_URL must use HTTPS/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      PLATFORM_APP_ORIGIN: "http://appliance.internal",
    })),
    /PLATFORM_APP_ORIGIN must use HTTPS/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_SCOPES: "profile,email",
    })),
    /must include openid/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      OIDC_ALLOWED_ID_TOKEN_ALGORITHMS: "HS256",
    })),
    /only supported asymmetric/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      PLATFORM_SESSION_SECRET: "too-short",
    })),
    /PLATFORM_SESSION_SECRET must contain at least 32 bytes/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      PLATFORM_CONTROL_PLANE_SECRET: "too-short",
    })),
    /PLATFORM_CONTROL_PLANE_SECRET must contain at least 32 bytes/,
  );
  assert.throws(
    () => createPlatformConfig(validOidcEnvironment({
      RUNNER_UPSTREAM_ORIGIN: "",
    })),
    /RUNNER_UPSTREAM_ORIGIN must explicitly target/,
  );
  assert.throws(
    () => createPlatformConfig({
      ENABLE_EXECUTION_DISPATCHER: "true",
      PLATFORM_CONTROL_PLANE_SECRET: "too-short",
    }),
    /PLATFORM_CONTROL_PLANE_SECRET must contain at least 32 bytes/,
  );
});
