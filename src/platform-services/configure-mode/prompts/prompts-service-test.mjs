import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createPromptsService } from "./server/index.mjs";

test("prompts persist versions per organization", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "platform-prompts-"));
  const storePath = path.join(directory, "prompts.json");
  const service = createPromptsService({
    storePath,
    readRequestBody: async (request) => request.body || {},
    sendJson: (response, status, body, headers) => {
      response.resolve({ status, body, headers });
    },
  });

  async function request(method, pathname, body, organizationId = "org-test") {
    return new Promise((resolve, reject) => {
      const response = { resolve };
      const handled = service.handleRequest(
        {
          method,
          body,
          headers: {
            "x-computer-agents-organization": organizationId,
            "x-runner-user-name": "Test User",
          },
        },
        response,
        new URL(`https://platform.test${pathname}`),
      );
      if (!handled) reject(new Error(`Prompt service did not handle ${pathname}`));
    });
  }

  try {
    const initial = await request("GET", "/api/real/prompts");
    assert.equal(initial.status, 200);
    assert.deepEqual(initial.body.data, []);

    const created = await request("POST", "/api/real/prompts", {
      name: "Release notes",
      description: "Summarize a release for the team.",
      markdown: "# Release notes\n\nKeep it concise.",
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.version.number, 1);
    assert.equal(created.body.prompt.currentVersionNumber, 1);

    const promptId = created.body.prompt.id;
    const reloaded = await request("GET", `/api/real/prompts/${promptId}`);
    assert.equal(reloaded.status, 200);
    assert.equal(reloaded.body.prompt.versions.length, 1);
    assert.equal(reloaded.body.prompt.markdown, "# Release notes\n\nKeep it concise.");
    assert.equal(reloaded.body.prompt.versions[0].markdown, "# Release notes\n\nKeep it concise.");

    const nextVersion = await request("POST", `/api/real/prompts/${promptId}/versions`, {
      name: "Release notes",
      description: "Updated release guidance.",
      markdown: "# Release notes\n\nLead with the impact.",
    });
    assert.equal(nextVersion.status, 201);
    assert.equal(nextVersion.body.version.number, 2);
    assert.equal(nextVersion.body.prompt.currentVersionNumber, 2);
    assert.equal(nextVersion.body.prompt.versions.length, 2);

    const published = await request(
      "POST",
      `/api/real/prompts/${promptId}/versions/${nextVersion.body.version.id}/publish`,
    );
    assert.equal(published.status, 200);
    assert.equal(published.body.publishedVersionId, nextVersion.body.version.id);
    assert.equal(published.body.version.status, "published");
    assert.equal(published.body.prompt.publishedVersionId, nextVersion.body.version.id);

    const currentVersionId = nextVersion.body.prompt.currentVersionId;
    const savedCurrentVersion = await request(
      "PATCH",
      `/api/real/prompts/${promptId}/versions/${currentVersionId}`,
      {
        name: "Release notes",
        description: "Saved in place.",
        markdown: "# Release notes\n\nSaved without creating a version.",
      },
    );
    assert.equal(savedCurrentVersion.status, 200);
    assert.equal(savedCurrentVersion.body.savedToCurrentVersion, true);
    assert.equal(savedCurrentVersion.body.version.number, 2);
    assert.equal(savedCurrentVersion.body.prompt.currentVersionNumber, 2);
    assert.equal(savedCurrentVersion.body.prompt.versions.length, 2);
    assert.equal(
      savedCurrentVersion.body.prompt.versions.at(-1).markdown,
      "# Release notes\n\nSaved without creating a version.",
    );

    const reloadedAfterCurrentSave = await request("GET", `/api/real/prompts/${promptId}`);
    assert.equal(reloadedAfterCurrentSave.status, 200);
    assert.equal(
      reloadedAfterCurrentSave.body.prompt.versions.at(-1).markdown,
      "# Release notes\n\nSaved without creating a version.",
    );

    const accessUpdated = await request("PATCH", `/api/real/prompts/${promptId}`, {
      metadata: { sharedTeamIds: ["team-alpha"] },
      permissionSet: { subjectType: "prompt", defaultAccess: "full_access" },
    });
    assert.equal(accessUpdated.status, 200);
    assert.deepEqual(accessUpdated.body.prompt.metadata.sharedTeamIds, ["team-alpha"]);
    assert.equal(accessUpdated.body.prompt.permissionSet.subjectType, "prompt");

    const reloadedAccess = await request("GET", `/api/real/prompts/${promptId}`);
    assert.deepEqual(reloadedAccess.body.prompt.metadata.sharedTeamIds, ["team-alpha"]);

    const otherOrganization = await request("GET", "/api/real/prompts", {}, "org-other");
    assert.deepEqual(otherOrganization.body.data, []);

    const deleted = await request("DELETE", `/api/real/prompts/${promptId}`);
    assert.equal(deleted.status, 200);
    const afterDelete = await request("GET", "/api/real/prompts");
    assert.deepEqual(afterDelete.body.data, []);

    const persisted = JSON.parse(await fs.readFile(storePath, "utf8"));
    assert.deepEqual(persisted.organizations["org-test"], []);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("prompt ownership metadata projects to stable identity fields", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "platform-prompts-owner-"));
  const storePath = path.join(directory, "prompts.json");
  const service = createPromptsService({
    storePath,
    readRequestBody: async (request) => request.body || {},
    sendJson: (response, status, body, headers) => {
      response.resolve({ status, body, headers });
    },
  });

  async function request(method, pathname, body) {
    return new Promise((resolve, reject) => {
      const response = { resolve };
      const handled = service.handleRequest(
        {
          method,
          body,
          headers: {
            "x-computer-agents-organization": "org-owner-test",
            "x-runner-user-id": "user-one",
            "x-runner-user-name": "First Owner",
            "x-runner-user-email": "first@example.com",
          },
        },
        response,
        new URL(`https://platform.test${pathname}`),
      );
      if (!handled) reject(new Error(`Prompt service did not handle ${pathname}`));
    });
  }

  try {
    const created = await request("POST", "/api/real/prompts", {
      name: "Ownership test",
      markdown: "# Ownership",
      metadata: {
        creator: { id: "user-one", name: "First Owner", email: "first@example.com" },
        owner: { id: "user-one", name: "First Owner", email: "first@example.com" },
      },
    });
    assert.equal(created.status, 201);
    const promptId = created.body.prompt.id;

    const transferred = await request("PATCH", `/api/real/prompts/${promptId}`, {
      metadata: {
        creator: { id: "user-one", name: "First Owner", email: "first@example.com" },
        owner: { id: "user-two", name: "Second Owner", email: "second@example.com" },
      },
    });
    assert.equal(transferred.status, 200);
    assert.equal(transferred.body.prompt.ownerId, "user-two");
    assert.equal(transferred.body.prompt.ownerName, "Second Owner");
    assert.equal(transferred.body.prompt.ownerEmail, "second@example.com");

    const reloaded = await request("GET", `/api/real/prompts/${promptId}`);
    assert.equal(reloaded.status, 200);
    assert.equal(reloaded.body.prompt.ownerId, "user-two");
    assert.equal(reloaded.body.prompt.ownerName, "Second Owner");
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
