import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConnectorSettingsDocumentId,
  createConnectorSettingsStore,
} from "./connector-settings-store.mjs";

test("builds document ids compatible with the hosted connection settings store", () => {
  assert.equal(
    buildConnectorSettingsDocumentId("user.1", "jira", "org/1"),
    "user_1_org_1_jira",
  );
});

test("resolves organization-scoped settings before legacy settings", async () => {
  const calls = [];
  const store = createConnectorSettingsStore({
    async getDocument(path) {
      calls.push(path);
      if (path === "user_tag_settings/user_1_org_1_jira") {
        return { permissionSet: { defaultAccess: "read_only" } };
      }
      return null;
    },
  });

  const settings = await store.resolve({
    userId: "user_1",
    organizationId: "org_1",
    connectorIds: ["jira", "atlassian"],
  });

  assert.equal(settings.permissionSet.defaultAccess, "read_only");
  assert.deepEqual(calls, ["user_tag_settings/user_1_org_1_jira"]);
});

test("falls back to legacy user settings and connector aliases", async () => {
  const calls = [];
  const store = createConnectorSettingsStore({
    async getDocument(path) {
      calls.push(path);
      return path === "user_tag_settings/user_1_atlassian"
        ? { accessControl: { version: 1 } }
        : null;
    },
  });

  const settings = await store.resolve({
    userId: "user_1",
    organizationId: "org_1",
    connectorIds: ["jira", "atlassian"],
  });

  assert.equal(settings.accessControl.version, 1);
  assert.deepEqual(calls, [
    "user_tag_settings/user_1_org_1_jira",
    "user_tag_settings/user_1_jira",
    "user_tag_settings/user_1_org_1_atlassian",
    "user_tag_settings/user_1_atlassian",
  ]);
});

test("returns an empty policy record when no settings have been saved", async () => {
  const store = createConnectorSettingsStore({
    async getDocument() {
      return null;
    },
  });

  assert.deepEqual(
    await store.resolve({
      userId: "user_1",
      organizationId: "org_1",
      connectorIds: ["jira"],
    }),
    {},
  );
});
