import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createConnectorAdapterRegistry } from "./connector-adapter-registry.mjs";

test("connector adapter registry includes every production connector runtime", () => {
  const registry = createConnectorAdapterRegistry({
    fetchImpl: async () => {
      throw new Error("not used");
    },
  });

  assert.equal(registry.get("jira")?.id, "jira");
  assert.equal(registry.get("atlassian")?.id, "jira");
  assert.equal(registry.get("dropbox")?.id, "dropbox");
  assert.equal(registry.get("asana")?.id, "asana");
  assert.equal(registry.get("bigquery")?.id, "bigquery");
  assert.equal(registry.get("box")?.id, "box");
  assert.equal(registry.get("figma")?.id, "figma");
  assert.equal(registry.get("linear")?.id, "linear");
  assert.equal(registry.get("teams")?.id, "microsoft-teams");
  assert.equal(registry.get("outlook")?.id, "outlook");
  assert.equal(registry.get("outlook-calendar")?.id, "outlook-calendar");
  assert.equal(registry.get("slack")?.id, "slack");
  assert.ok(
    registry.listCapabilities("dropbox").some((capability) => capability.id === "search_files"),
  );
  assert.ok(
    registry
      .listCapabilities("dropbox")
      .some((capability) => capability.id === "upload_file" && capability.access === "interactive"),
  );
  assert.equal(registry.listCapabilities("asana").length, 12);
  assert.equal(registry.listCapabilities("bigquery").length, 11);
  assert.equal(registry.listCapabilities("box").length, 12);
  assert.equal(registry.listCapabilities("figma").length, 11);
  assert.equal(registry.listCapabilities("linear").length, 12);
  assert.equal(registry.listCapabilities("microsoft-teams").length, 11);
  assert.equal(registry.listCapabilities("outlook").length, 12);
  assert.equal(registry.listCapabilities("outlook-calendar").length, 9);
  assert.equal(registry.listCapabilities("slack").length, 11);
});

test("runtime action catalogs stay aligned with the frontend provider catalog", () => {
  const registry = createConnectorAdapterRegistry({
    fetchImpl: async () => {
      throw new Error("not used");
    },
  });
  const providerIds = [
    "asana",
    "bigquery",
    "box",
    "figma",
    "linear",
    "microsoft-teams",
    "outlook",
    "outlook-calendar",
    "slack",
  ];

  for (const providerId of providerIds) {
    const providerSource = readFileSync(
      new URL(
        `../../../../../../src/platform-integrations/connectors/providers/${providerId}/index.ts`,
        import.meta.url,
      ),
      "utf8",
    );
    const capabilityBlock = providerSource.match(
      /const capabilities = defineCapabilities\(\[([\s\S]*?)\]\);/,
    )?.[1];
    assert.ok(capabilityBlock, `Missing frontend capability block for ${providerId}.`);
    const frontendActions = [...capabilityBlock.matchAll(/\bid:\s*"([^"]+)"/g)].map(
      (match) => match[1],
    );
    const runtimeActions = registry.listCapabilities(providerId).map((capability) => capability.id);
    assert.deepEqual(
      runtimeActions,
      frontendActions,
      `${providerId} runtime and frontend capabilities differ.`,
    );
  }
});
