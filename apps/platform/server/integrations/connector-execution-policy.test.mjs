import assert from "node:assert/strict";
import test from "node:test";

import {
  ConnectorPolicyError,
  createConnectorExecutionPolicy,
  intersectConnectorActionPolicies,
  normalizeRequestedConnectors,
  resolvePermissionAccess,
} from "./connector-execution-policy.mjs";

function permissionSet({
  read = "full_access",
  write = "full_access",
} = {}) {
  return {
    defaultAccess: "no_access",
    rings: {
      ring_1: { defaultAccess: read },
      ring_2: { defaultAccess: "no_access" },
      ring_3: { defaultAccess: write },
    },
    actions: {
      github_action_get_me: {
        ringId: "ring_1",
        access: read,
      },
      github_action_create_branch: {
        ringId: "ring_3",
        access: write,
      },
    },
  };
}

function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function createFixture({
  connectorId = "github",
  connectorConfig,
  connectorConfigStatus = 200,
  trustedCapabilities = [],
  agentPermissions = permissionSet(),
  connectorPermissions = permissionSet(),
  rolePermissions = permissionSet(),
  credentialOrganizationId = "org_1",
  credentialScope = "repo read:org",
  organizationRole = "member",
  principal = { uid: "user_1" },
  projectId = "",
  projectCredentialId = "",
  resolveCredentialOverride,
} = {}) {
  const calls = [];
  const resourceCalls = [];
  const resourceContexts = [];
  const organizationCalls = [];
  const credentialCalls = [];
  const fetchSessionApi = async (_req, controlPath) => {
    calls.push(controlPath);
    if (controlPath === `/user/tags/${connectorId}`) {
      return response(
        connectorConfig || {
          id: connectorId,
          linked: true,
          capabilities: [
            { id: "get_me", access: "read-only" },
            { id: "create_branch", access: "interactive" },
          ],
          permissionSet: connectorPermissions,
          metadata: {
            accessControl: {
              systemPrincipalRolePermissionSets: {
                all_organization_members: {
                  member: rolePermissions,
                },
              },
            },
          },
        },
        connectorConfigStatus,
      );
    }
    return response({ error: "not found" }, 404);
  };
  const fetchResourceApi = async (_req, controlPath, _init, context) => {
    resourceCalls.push(controlPath);
    resourceContexts.push(context);
    if (controlPath === "/threads/thread_1") {
      return response({
        id: "thread_1",
        agentId: "agent_1",
        ...(projectId ? { projectId } : {}),
      });
    }
    if (controlPath === "/agents/agent_1") {
      return response({
        id: "agent_1",
        permissionSet: agentPermissions,
      });
    }
    if (controlPath === `/projects/${projectId}` && projectId) {
      return response({
        id: projectId,
        organizationId: "org_1",
        metadata: {
          connectorCredentialBindings: projectCredentialId
            ? {
                github: {
                  credentialId: projectCredentialId,
                  credentialName: "Project GitHub",
                },
              }
            : {},
        },
      });
    }
    return response({ error: "not found" }, 404);
  };
  const fetchOrganizationApi = async (_req, controlPath) => {
    organizationCalls.push(controlPath);
    if (controlPath === "/organizations") {
      return response({
        organizations: [{
          id: "org_1",
          role: organizationRole,
        }],
      });
    }
    return response({ error: "not found" }, 404);
  };
  const resolveCredential = async (options) => {
    credentialCalls.push(options);
    if (typeof resolveCredentialOverride === "function") {
      return resolveCredentialOverride(options);
    }
    return {
      credentialId: options.credentialId || "cred_default",
      organizationId: credentialOrganizationId,
      status: "connected",
      token: {
        accessToken: "provider-token",
        scope: credentialScope,
      },
    };
  };
  const policy = createConnectorExecutionPolicy({
    fetchSessionApi,
    fetchResourceApi,
    fetchOrganizationApi,
    identityService: {
      async readPrincipal() {
        return principal;
      },
    },
    resolveCredential,
    listConnectorCapabilities() {
      return trustedCapabilities;
    },
    logger: null,
  });
  const req = {
    headers: {
      "x-computer-agents-organization": "org_1",
    },
  };
  return {
    calls,
    resourceCalls,
    resourceContexts,
    organizationCalls,
    credentialCalls,
    connectorId,
    policy,
    req,
  };
}

async function enrich(fixture, connector = { enabled: true }) {
  return fixture.policy.enrichThreadMessagePayload(
    fixture.req,
    "thread_1",
    "https://api.example.test/v1",
    "",
    { content: "Use GitHub." },
    {
      requestedConnectors: {
        [fixture.connectorId]: connector,
      },
    },
  );
}

test("normalizes connector selection without accepting client authority", () => {
  assert.deepEqual(
    normalizeRequestedConnectors({
      github: {
        enabled: true,
        credentialId: "cred_1",
        allowedActions: ["delete_repository"],
        accessToken: "attacker-token",
      },
    }),
    [{ id: "github", credentialId: "cred_1" }],
  );
});

test("unknown actions fail closed", () => {
  assert.equal(
    resolvePermissionAccess(
      permissionSet(),
      "github_action_delete_repository",
      "ring_3",
      { requireConfiguredAction: true },
    ),
    "no_access",
  );
});

test("read-only access permits reads but rejects interactive actions", () => {
  assert.equal(
    intersectConnectorActionPolicies({
      accessValues: ["read_only", "read_only"],
      interactive: false,
    }),
    "allowed",
  );
  assert.equal(
    intersectConnectorActionPolicies({
      accessValues: ["read_only", "read_only"],
      interactive: true,
    }),
    "denied",
  );
});

test("builds a server-owned connector envelope without provider secrets", async () => {
  const fixture = createFixture();
  const payload = await enrich(fixture, {
    enabled: true,
    credentialId: "cred_1",
    allowedActions: ["delete_repository"],
    accessToken: "attacker-token",
  });

  assert.deepEqual(payload.connectors.github.allowedActions, [
    "get_me",
    "create_branch",
  ]);
  assert.equal(payload.connectors.github.credentialId, "cred_1");
  assert.equal(payload.connectors.github.organizationId, "org_1");
  assert.deepEqual(payload.connectors.github.credentialResolution, {
    source: "explicit",
  });
  assert.equal(payload.connectors.github.accessToken, undefined);
  assert.equal(payload.connectors.github.policyVersion, 1);
});

test("uses the trusted Atlassian catalog when a legacy account record is missing", async () => {
  const fixture = createFixture({
    connectorId: "jira",
    connectorConfig: { error: "Unsupported tag" },
    connectorConfigStatus: 404,
    credentialScope: "read:jira-work write:jira-work",
    organizationRole: "owner",
    trustedCapabilities: [
      { id: "get_myself", access: "read-only" },
      { id: "create_issue", access: "interactive" },
    ],
  });

  const payload = await enrich(fixture);

  assert.deepEqual(payload.connectors.jira.allowedActions, [
    "get_myself",
    "create_issue",
  ]);
  assert.deepEqual(payload.connectors.jira.credentialResolution, {
    source: "organization_default",
  });
  assert.deepEqual(fixture.calls, ["/user/tags/jira"]);
  assert.equal(fixture.credentialCalls[0].provider, "jira");
});

test("a trusted connector adapter rejects client-injected capabilities", async () => {
  const fixture = createFixture({
    connectorId: "jira",
    connectorConfig: {
      id: "jira",
      capabilities: [
        { id: "create_issue", access: "interactive" },
        { id: "delete_everything", access: "interactive" },
      ],
      permissionSet: {
        defaultAccess: "full_access",
        rings: {
          ring_1: { defaultAccess: "full_access" },
          ring_2: { defaultAccess: "full_access" },
          ring_3: { defaultAccess: "full_access" },
        },
        actions: {
          jira_action_delete_everything: {
            ringId: "ring_3",
            access: "full_access",
          },
        },
      },
    },
    credentialScope: "write:jira-work",
    organizationRole: "owner",
    trustedCapabilities: [
      { id: "create_issue", access: "interactive" },
    ],
  });

  const payload = await enrich(fixture);

  assert.deepEqual(payload.connectors.jira.allowedActions, ["create_issue"]);
  assert.equal(
    payload.connectors.jira.actionPolicies.delete_everything,
    undefined,
  );
});

test("an unknown connector still fails when its account record is missing", async () => {
  const fixture = createFixture({
    connectorId: "github",
    connectorConfig: { error: "Unsupported tag" },
    connectorConfigStatus: 404,
  });

  await assert.rejects(
    enrich(fixture),
    (error) => {
      assert.ok(error instanceof ConnectorPolicyError);
      assert.equal(error.code, "connector_connector_lookup_failed");
      assert.equal(error.statusCode, 404);
      assert.deepEqual(error.details, {
        upstreamStatus: 404,
        upstreamMessage: "Unsupported tag",
      });
      return true;
    },
  );
});

test("uses the organization default credential for an ordinary thread", async () => {
  const fixture = createFixture();
  const payload = await enrich(fixture);

  assert.deepEqual(fixture.organizationCalls, ["/organizations"]);
  assert.ok(fixture.resourceCalls.includes("/threads/thread_1"));
  assert.ok(fixture.resourceCalls.includes("/agents/agent_1"));
  assert.equal(fixture.calls.includes("/organizations"), false);
  assert.equal(fixture.calls.includes("/agents/agent_1"), false);
  assert.equal(fixture.calls.includes("/threads/thread_1"), false);
  assert.deepEqual(fixture.calls, ["/user/tags/github"]);
  assert.equal(payload.connectors.github.credentialId, "cred_default");
  assert.deepEqual(payload.connectors.github.credentialResolution, {
    source: "organization_default",
  });
  assert.equal(fixture.credentialCalls[0].organizationId, "org_1");
  assert.equal(fixture.credentialCalls[0].credentialId, "");
  assert.equal(fixture.credentialCalls[0].requestingUserId, "user_1");
});

test("passes the thread runner credentials only to protected resource reads", async () => {
  const fixture = createFixture();
  await fixture.policy.enrichThreadMessagePayload(
    fixture.req,
    "thread_1",
    "https://api.example.test/v1",
    "api_key_1",
    { content: "Use GitHub." },
    {
      requestedConnectors: {
        github: { enabled: true },
      },
    },
  );

  assert.deepEqual(
    fixture.resourceContexts,
    [
      {
        upstreamUrl: "https://api.example.test/v1",
        apiKey: "api_key_1",
      },
      {
        upstreamUrl: "https://api.example.test/v1",
        apiKey: "api_key_1",
      },
    ],
  );
  assert.deepEqual(fixture.organizationCalls, ["/organizations"]);
  assert.deepEqual(fixture.calls, ["/user/tags/github"]);
});

test("uses a trusted project credential binding for project threads", async () => {
  const fixture = createFixture({
    projectId: "project_1",
    projectCredentialId: "cred_project",
  });
  const payload = await enrich(fixture);

  assert.equal(payload.connectors.github.credentialId, "cred_project");
  assert.deepEqual(payload.connectors.github.credentialResolution, {
    source: "project",
    projectId: "project_1",
  });
  assert.equal(fixture.credentialCalls[0].credentialId, "cred_project");
  assert.ok(fixture.resourceCalls.includes("/projects/project_1"));
});

test("an explicit thread credential overrides the project binding", async () => {
  const fixture = createFixture({
    projectId: "project_1",
    projectCredentialId: "cred_project",
  });
  const payload = await enrich(fixture, {
    enabled: true,
    credentialId: "cred_explicit",
  });

  assert.equal(payload.connectors.github.credentialId, "cred_explicit");
  assert.equal(
    payload.connectors.github.credentialResolution.source,
    "explicit",
  );
  assert.equal(fixture.credentialCalls[0].credentialId, "cred_explicit");
});

test("a missing project-bound credential fails closed without default fallback", async () => {
  const fixture = createFixture({
    projectId: "project_1",
    projectCredentialId: "cred_missing",
    resolveCredentialOverride: async () => null,
  });

  await assert.rejects(
    enrich(fixture),
    (error) => {
      assert.ok(error instanceof ConnectorPolicyError);
      assert.equal(error.code, "connector_credentials_required");
      assert.equal(error.details.credentialSource, "project");
      assert.equal(error.details.projectId, "project_1");
      return true;
    },
  );
  assert.equal(fixture.credentialCalls.length, 1);
  assert.equal(fixture.credentialCalls[0].credentialId, "cred_missing");
});

test("agent denial overrides user, role, connector, and provider grants", async () => {
  const fixture = createFixture({
    agentPermissions: permissionSet({
      read: "no_access",
      write: "no_access",
    }),
  });

  await assert.rejects(
    enrich(fixture),
    (error) => {
      assert.ok(error instanceof ConnectorPolicyError);
      assert.equal(error.statusCode, 403);
      assert.equal(error.code, "connector_actions_denied");
      return true;
    },
  );
});

test("approval requirements survive the complete policy intersection", async () => {
  const fixture = createFixture({
    rolePermissions: permissionSet({
      read: "full_access",
      write: "ask_for_permission",
    }),
  });
  const payload = await enrich(fixture);

  assert.deepEqual(payload.connectors.github.allowedActions, ["get_me"]);
  assert.deepEqual(
    payload.connectors.github.approvalRequiredActions,
    ["create_branch"],
  );
  assert.equal(
    payload.connectors.github.actionPolicies.create_branch,
    "approval_required",
  );
});

test("rejects credentials bound to another organization", async () => {
  const fixture = createFixture({
    credentialOrganizationId: "org_other",
  });

  await assert.rejects(
    enrich(fixture),
    (error) => {
      assert.ok(error instanceof ConnectorPolicyError);
      assert.equal(
        error.code,
        "connector_credential_organization_mismatch",
      );
      return true;
    },
  );
});

test("requires a verified session principal", async () => {
  const fixture = createFixture({ principal: {} });

  await assert.rejects(
    enrich(fixture),
    (error) => {
      assert.ok(error instanceof ConnectorPolicyError);
      assert.equal(error.statusCode, 401);
      assert.equal(error.code, "connector_session_required");
      return true;
    },
  );
});
