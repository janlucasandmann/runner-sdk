import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";

import { createAsanaConnectorAdapter } from "./asana-connector-adapter.mjs";
import { createBigQueryConnectorAdapter } from "./bigquery-connector-adapter.mjs";
import { createBoxConnectorAdapter } from "./box-connector-adapter.mjs";
import { createFigmaConnectorAdapter } from "./figma-connector-adapter.mjs";
import { createLinearConnectorAdapter } from "./linear-connector-adapter.mjs";
import {
  createMicrosoftTeamsConnectorAdapter,
  createOutlookCalendarConnectorAdapter,
  createOutlookConnectorAdapter,
} from "./microsoft-graph-connector-adapters.mjs";
import { createSlackConnectorAdapter } from "./slack-connector-adapter.mjs";

const GRANT = Object.freeze({
  organizationId: "org_test",
  credentialId: "credential_test",
});

function oauthCredential(token = {}) {
  return {
    organizationId: GRANT.organizationId,
    credentialId: GRANT.credentialId,
    credentialOwnerId: "user_test",
    name: "Test connection",
    identity: "user@example.com",
    profile: {},
    token: {
      accessToken: "access-token",
      access_token: "access-token",
      ...token,
    },
  };
}

function oauthOptions(fetchImpl, token) {
  return {
    fetchImpl,
    resolveCredential: async () => oauthCredential(token),
    persistCredential: async () => {},
    getEnvironmentValue: async () => "test-oauth-client-value",
  };
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(payload === undefined ? "" : JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

test("Asana runtime paginates reads and sends normalized task mutations", async () => {
  const requests = [];
  const adapter = createAsanaConnectorAdapter(
    oauthOptions(async (input, init) => {
      const url = new URL(input);
      requests.push({ url, init });
      if (url.pathname.endsWith("/workspaces")) {
        return jsonResponse({
          data: [{ gid: "workspace-1", name: "Computer Agents" }],
          next_page: { offset: "next-offset" },
        });
      }
      return jsonResponse({
        data: { gid: "task-1", name: "Ship connector" },
      });
    }),
  );

  const workspaces = await adapter.invoke({
    grant: GRANT,
    name: "list_workspaces",
    arguments: { limit: 25, cursor: "offset-1" },
  });
  assert.equal(workspaces.items[0].gid, "workspace-1");
  assert.equal(workspaces.cursor, "next-offset");
  assert.equal(requests[0].url.searchParams.get("limit"), "25");
  assert.equal(requests[0].url.searchParams.get("offset"), "offset-1");
  assert.equal(requests[0].init.headers.Authorization, "Bearer access-token");

  await adapter.invoke({
    grant: GRANT,
    name: "create_task",
    arguments: {
      workspaceId: "workspace-1",
      name: "Ship connector",
      projectIds: ["project-1"],
      dueOn: "2026-08-01",
    },
  });
  const createBody = JSON.parse(requests[1].init.body);
  assert.deepEqual(createBody.data.projects, ["project-1"]);
  assert.equal(createBody.data.due_on, "2026-08-01");
});

test("Box runtime uses multipart uploads with supplied inline content", async () => {
  const requests = [];
  const adapter = createBoxConnectorAdapter(
    oauthOptions(async (input, init) => {
      requests.push({ url: new URL(input), init });
      return jsonResponse({
        entries: [{ id: "file-1", name: "notes.txt" }],
      });
    }),
  );

  const result = await adapter.invoke({
    grant: GRANT,
    name: "upload_file",
    arguments: {
      folderId: "0",
      name: "notes.txt",
      content: "Connector ready",
    },
  });

  assert.equal(result.entries[0].id, "file-1");
  assert.equal(requests[0].url.origin, "https://upload.box.com");
  assert.equal(requests[0].url.pathname, "/api/2.0/files/content");
  assert.deepEqual(JSON.parse(requests[0].init.body.get("attributes")), {
    name: "notes.txt",
    parent: { id: "0" },
  });
  assert.equal(await requests[0].init.body.get("file").text(), "Connector ready");
});

test("Figma runtime creates context webhooks using the current lowercase request enum", async () => {
  let request;
  const adapter = createFigmaConnectorAdapter(
    oauthOptions(async (input, init) => {
      request = { url: new URL(input), init };
      return jsonResponse({ id: "webhook-1", status: "ACTIVE" });
    }),
  );

  await adapter.invoke({
    grant: GRANT,
    name: "create_webhook",
    arguments: {
      eventType: "file_update",
      contextType: "project",
      contextId: "project-1",
      endpoint: "https://hooks.example.com/figma",
      passcode: "verification-secret",
    },
  });

  assert.equal(request.url.pathname, "/v2/webhooks");
  assert.deepEqual(JSON.parse(request.init.body), {
    event_type: "FILE_UPDATE",
    context: "project",
    context_id: "project-1",
    endpoint: "https://hooks.example.com/figma",
    passcode: "verification-secret",
  });
});

test("Figma runtime refreshes with the dedicated endpoint and Basic authentication", async () => {
  const requests = [];
  const persisted = [];
  const adapter = createFigmaConnectorAdapter({
    ...oauthOptions(async (input, init) => {
      const url = new URL(input);
      requests.push({ url, init });
      if (url.pathname === "/v1/oauth/refresh") {
        return jsonResponse({
          access_token: "fresh-figma-access-token",
          token_type: "bearer",
          expires_in: 7_776_000,
        });
      }
      if (url.pathname === "/v1/me") {
        return jsonResponse({ id: "figma-user", handle: "Computer Agents" });
      }
      throw new Error(`Unexpected Figma request: ${url}`);
    }, {
      refreshToken: "figma-refresh-token",
      refresh_token: "figma-refresh-token",
      expiresAt: Date.now() - 1,
    }),
    persistCredential: async (value) => {
      persisted.push(value);
    },
  });

  const profile = await adapter.invoke({
    grant: GRANT,
    name: "get_current_user",
    arguments: {},
  });

  assert.equal(profile.id, "figma-user");
  assert.equal(requests[0].url.href, "https://api.figma.com/v1/oauth/refresh");
  assert.match(requests[0].init.headers.Authorization, /^Basic /);
  const refreshBody = new URLSearchParams(requests[0].init.body);
  assert.equal(refreshBody.get("refresh_token"), "figma-refresh-token");
  assert.equal(refreshBody.has("grant_type"), false);
  assert.equal(requests[1].init.headers.Authorization, "Bearer fresh-figma-access-token");
  assert.equal(persisted.length, 1);
});

test("Linear runtime sends typed GraphQL mutation variables", async () => {
  let requestBody;
  const adapter = createLinearConnectorAdapter(
    oauthOptions(async (_input, init) => {
      requestBody = JSON.parse(init.body);
      return jsonResponse({
        data: {
          issueCreate: {
            success: true,
            issue: {
              id: "issue-1",
              identifier: "CA-1",
              title: "Ship connectors",
            },
          },
        },
      });
    }),
  );

  const result = await adapter.invoke({
    grant: GRANT,
    name: "create_issue",
    arguments: {
      teamId: "team-1",
      title: "Ship connectors",
      projectId: "project-1",
      labelIds: ["label-1"],
    },
  });

  assert.match(requestBody.query, /issueCreate/);
  assert.deepEqual(requestBody.variables.input, {
    teamId: "team-1",
    title: "Ship connectors",
    projectId: "project-1",
    labelIds: ["label-1"],
  });
  assert.equal(result.issue.identifier, "CA-1");
});

test("Slack runtime separates user search from bot actions and uses external uploads", async () => {
  const requests = [];
  const adapter = createSlackConnectorAdapter(
    oauthOptions(
      async (input, init) => {
        const url = new URL(input);
        requests.push({ url, init });
        if (url.pathname === "/api/search.messages") {
          return jsonResponse({
            ok: true,
            messages: {
              matches: [{ ts: "1.1", text: "connector" }],
              pagination: { next_cursor: "search-next" },
              total: 1,
            },
          });
        }
        if (url.pathname === "/api/files.getUploadURLExternal") {
          return jsonResponse({
            ok: true,
            file_id: "file-1",
            upload_url: "https://files.slack.com/upload/v1/ticket",
          });
        }
        if (url.hostname === "files.slack.com") {
          return new Response("OK - 15", { status: 200 });
        }
        if (url.pathname === "/api/files.completeUploadExternal") {
          return jsonResponse({
            ok: true,
            files: [{ id: "file-1", name: "notes.txt" }],
          });
        }
        throw new Error(`Unexpected Slack request: ${url}`);
      },
      {
        userAccessToken: "user-access-token",
        user_access_token: "user-access-token",
      },
    ),
  );

  const search = await adapter.invoke({
    grant: GRANT,
    name: "search_messages",
    arguments: { query: "connector", limit: 10 },
  });
  assert.equal(search.cursor, "search-next");
  assert.equal(requests[0].init.headers.Authorization, "Bearer user-access-token");

  const upload = await adapter.invoke({
    grant: GRANT,
    name: "upload_file",
    arguments: {
      channelId: "channel-1",
      filename: "notes.txt",
      content: "Connector ready",
      title: "Notes",
    },
  });
  assert.equal(upload.files[0].id, "file-1");
  assert.equal(requests[1].init.headers.Authorization, "Bearer access-token");
  assert.equal(JSON.parse(requests[1].init.body).length, 15);
  assert.equal(Buffer.from(requests[2].init.body).toString("utf8"), "Connector ready");
  assert.deepEqual(JSON.parse(requests[3].init.body).files, [{ id: "file-1", title: "Notes" }]);
});

test("Outlook runtime creates drafts with Microsoft Graph recipient objects", async () => {
  let request;
  const adapter = createOutlookConnectorAdapter(
    oauthOptions(async (input, init) => {
      request = { url: new URL(input), init };
      return jsonResponse({ id: "draft-1", isDraft: true }, 201);
    }),
  );

  await adapter.invoke({
    grant: GRANT,
    name: "create_draft",
    arguments: {
      subject: "Connector review",
      body: "<p>Ready</p>",
      bodyType: "html",
      to: ["owner@example.com"],
      cc: ["reviewer@example.com"],
    },
  });

  assert.equal(request.url.pathname, "/v1.0/me/messages");
  const body = JSON.parse(request.init.body);
  assert.equal(body.body.contentType, "HTML");
  assert.equal(body.toRecipients[0].emailAddress.address, "owner@example.com");
  assert.equal(body.ccRecipients[0].emailAddress.address, "reviewer@example.com");
});

test("Outlook Calendar runtime sends the Graph meeting-time attendee shape", async () => {
  let requestBody;
  const adapter = createOutlookCalendarConnectorAdapter(
    oauthOptions(async (_input, init) => {
      requestBody = JSON.parse(init.body);
      return jsonResponse({ meetingTimeSuggestions: [] });
    }),
  );

  await adapter.invoke({
    grant: GRANT,
    name: "find_meeting_times",
    arguments: {
      attendees: ["owner@example.com"],
      startDateTime: "2026-08-01T09:00:00",
      endDateTime: "2026-08-01T17:00:00",
      duration: "PT30M",
      timeZone: "UTC",
    },
  });

  assert.deepEqual(requestBody.attendees, [
    {
      type: "required",
      emailAddress: { address: "owner@example.com" },
    },
  ]);
  assert.equal(requestBody.meetingDuration, "PT30M");
});

test("Microsoft Teams runtime makes the connected user owner of private channels", async () => {
  const requests = [];
  const adapter = createMicrosoftTeamsConnectorAdapter(
    oauthOptions(async (input, init) => {
      const url = new URL(input);
      requests.push({ url, init });
      if (url.pathname === "/v1.0/me") {
        return jsonResponse({ id: "user-o'hara" });
      }
      return jsonResponse({ id: "channel-1", displayName: "Private review" }, 201);
    }),
  );

  await adapter.invoke({
    grant: GRANT,
    name: "create_channel",
    arguments: {
      teamId: "team-1",
      displayName: "Private review",
      membershipType: "private",
    },
  });

  const body = JSON.parse(requests[1].init.body);
  assert.equal(body.membershipType, "private");
  assert.deepEqual(body.members[0].roles, ["owner"]);
  assert.match(body.members[0]["user@odata.bind"], /user-o''hara/);
});

test("BigQuery runtime exchanges a signed service-account assertion and gates read-only SQL", async () => {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const credential = {
    organizationId: GRANT.organizationId,
    credentialId: GRANT.credentialId,
    credentialOwnerId: "user_test",
    token: {
      scope: "https://www.googleapis.com/auth/bigquery.readonly",
      serviceAccount: {
        type: "service_account",
        project_id: "project-1",
        private_key_id: "key-1",
        private_key: privateKey.export({
          type: "pkcs8",
          format: "pem",
        }),
        client_email: "connector@project-1.iam.gserviceaccount.com",
      },
    },
  };
  const requests = [];
  let statementType = "SELECT";
  const adapter = createBigQueryConnectorAdapter({
    resolveCredential: async () => credential,
    now: () => Date.parse("2026-07-30T12:00:00Z"),
    fetchImpl: async (input, init) => {
      const url = new URL(input);
      requests.push({ url, init });
      if (url.origin === "https://oauth2.googleapis.com") {
        const assertion = new URLSearchParams(init.body).get("assertion");
        const [, encodedClaims] = assertion.split(".");
        const claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8"));
        assert.equal(claims.iss, "connector@project-1.iam.gserviceaccount.com");
        assert.equal(claims.scope, "https://www.googleapis.com/auth/bigquery.readonly");
        return jsonResponse({
          access_token: "google-access-token",
          expires_in: 3600,
          token_type: "Bearer",
        });
      }
      if (url.pathname.endsWith("/jobs")) {
        return jsonResponse({
          statistics: {
            query: {
              statementType,
              totalBytesProcessed: "12",
            },
          },
        });
      }
      if (url.pathname.endsWith("/queries")) {
        return jsonResponse({
          jobComplete: true,
          rows: [{ f: [{ v: "1" }] }],
        });
      }
      throw new Error(`Unexpected BigQuery request: ${url}`);
    },
  });

  const result = await adapter.invoke({
    grant: GRANT,
    name: "query",
    arguments: {
      projectId: "project-1",
      query: "SELECT 1",
      maximumBytesBilled: "1000",
    },
  });

  assert.equal(result.jobComplete, true);
  assert.equal(requests[1].init.headers.Authorization, "Bearer google-access-token");
  assert.equal(JSON.parse(requests[1].init.body).configuration.query.maximumBytesBilled, "1000");
  assert.equal(JSON.parse(requests[2].init.body).useLegacySql, false);

  const executedQueryCount = requests.filter((request) =>
    request.url.pathname.endsWith("/queries"),
  ).length;
  statementType = "DELETE";
  await assert.rejects(
    adapter.invoke({
      grant: GRANT,
      name: "query",
      arguments: {
        projectId: "project-1",
        query: "DELETE FROM dataset.table WHERE true",
      },
    }),
    (error) =>
      error?.code === "connector_input_invalid" &&
      /read-only BigQuery action only accepts SELECT/.test(error.message),
  );
  assert.equal(
    requests.filter((request) => request.url.pathname.endsWith("/queries")).length,
    executedQueryCount,
  );
});
