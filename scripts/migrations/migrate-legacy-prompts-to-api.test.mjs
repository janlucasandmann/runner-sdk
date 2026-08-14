import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  LEGACY_PROMPT_MIGRATION_KIND,
  migrateLegacyPrompts,
} from "./migrate-legacy-prompts-to-api.mjs";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function createPromptApi() {
  const prompts = [];
  let promptSequence = 0;
  let versionSequence = 0;

  const fetchImpl = async (input, init = {}) => {
    assert.equal(init.headers["x-api-key"], "migration-key");
    const url = new URL(input);
    const method = init.method || "GET";
    const segments = url.pathname.split("/").filter(Boolean);
    const promptId = segments[3] || "";
    const versionId = segments[5] || "";
    const body = init.body ? JSON.parse(init.body) : {};

    if (method === "GET" && url.pathname === "/api/real/prompts") {
      return jsonResponse({ prompts: prompts.map(({ versions, ...prompt }) => prompt) });
    }
    if (method === "POST" && url.pathname === "/api/real/prompts") {
      const prompt = {
        id: `prompt_${++promptSequence}`,
        ...body,
        currentVersionId: `version_${++versionSequence}`,
        currentVersionNumber: 1,
        publishedVersionId: "",
        versions: [],
      };
      const version = {
        id: prompt.currentVersionId,
        number: 1,
        name: body.name,
        description: body.description,
        markdown: body.markdown,
      };
      prompt.versions.push(version);
      prompts.push(prompt);
      return jsonResponse({ prompt, version }, 201);
    }
    const prompt = prompts.find((candidate) => candidate.id === promptId);
    if (!prompt) return jsonResponse({ error: "Prompt not found." }, 404);
    if (method === "GET" && segments.length === 4) return jsonResponse({ prompt });
    if (method === "PATCH" && segments.length === 4) {
      Object.assign(prompt, body);
      return jsonResponse({ prompt });
    }
    if (method === "POST" && segments[4] === "versions" && segments.length === 5) {
      const version = {
        id: `version_${++versionSequence}`,
        number: prompt.versions.length + 1,
        ...body,
      };
      prompt.versions.push(version);
      prompt.currentVersionId = version.id;
      prompt.currentVersionNumber = version.number;
      Object.assign(prompt, body);
      return jsonResponse({ prompt, version }, 201);
    }
    const version = prompt.versions.find((candidate) => candidate.id === versionId);
    if (!version) return jsonResponse({ error: "Version not found." }, 404);
    if (method === "PATCH" && segments.length === 6) {
      Object.assign(version, body);
      return jsonResponse({ prompt, version });
    }
    if (method === "POST" && segments[6] === "publish") {
      prompt.publishedVersionId = version.id;
      return jsonResponse({ prompt, version });
    }
    return jsonResponse({ error: "Unhandled request." }, 500);
  };

  return { fetchImpl, prompts };
}

async function createLegacySource() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "prompt-migration-"));
  const source = path.join(directory, "prompts.json");
  await fs.writeFile(source, JSON.stringify({
    version: 1,
    organizations: {
      default: [{
        id: "legacy_prompt_1",
        name: "Current name",
        description: "Current description",
        currentVersionId: "legacy_version_2",
        publishedVersionId: "legacy_version_1",
        metadata: { custom: true, owner: { id: "legacy-user" } },
        permissionSet: null,
        createdAt: "2026-08-01T10:00:00.000Z",
        updatedAt: "2026-08-02T10:00:00.000Z",
        versions: [
          {
            id: "legacy_version_1",
            number: 1,
            name: "Initial name",
            description: "Initial description",
            markdown: "Initial markdown",
          },
          {
            id: "legacy_version_2",
            number: 2,
            name: "Current name",
            description: "Current description",
            markdown: "Current markdown",
          },
        ],
      }],
    },
  }));
  return { directory, source };
}

test("legacy prompt migration preserves versions and is idempotent", async () => {
  const { directory, source } = await createLegacySource();
  const api = createPromptApi();
  try {
    await migrateLegacyPrompts({
      source,
      origin: "https://platform.test",
      apiKey: "migration-key",
      fetchImpl: api.fetchImpl,
      log() {},
    });
    await migrateLegacyPrompts({
      source,
      origin: "https://platform.test",
      apiKey: "migration-key",
      fetchImpl: api.fetchImpl,
      log() {},
    });

    assert.equal(api.prompts.length, 1);
    assert.equal(api.prompts[0].versions.length, 2);
    assert.deepEqual(
      api.prompts[0].versions.map(({ number, name, description, markdown }) => ({
        number,
        name,
        description,
        markdown,
      })),
      [
        {
          number: 1,
          name: "Initial name",
          description: "Initial description",
          markdown: "Initial markdown",
        },
        {
          number: 2,
          name: "Current name",
          description: "Current description",
          markdown: "Current markdown",
        },
      ],
    );
    assert.equal(api.prompts[0].publishedVersionId, api.prompts[0].versions[0].id);
    assert.equal(
      api.prompts[0].metadata.persistenceMigration.kind,
      LEGACY_PROMPT_MIGRATION_KIND,
    );
    assert.equal(api.prompts[0].metadata.persistenceMigration.sourcePromptId, "legacy_prompt_1");
    assert.equal(api.prompts[0].metadata.owner, undefined);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("dry run does not write prompt records", async () => {
  const { directory, source } = await createLegacySource();
  const api = createPromptApi();
  try {
    const results = await migrateLegacyPrompts({
      source,
      origin: "https://platform.test",
      apiKey: "migration-key",
      dryRun: true,
      fetchImpl: api.fetchImpl,
      log() {},
    });
    assert.deepEqual(results, [{ action: "create", sourcePromptId: "legacy_prompt_1" }]);
    assert.equal(api.prompts.length, 0);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
