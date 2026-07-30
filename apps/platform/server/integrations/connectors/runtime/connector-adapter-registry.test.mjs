import assert from "node:assert/strict";
import test from "node:test";

import { createConnectorAdapterRegistry } from "./connector-adapter-registry.mjs";

test("connector adapter registry includes Atlassian and Dropbox runtimes", () => {
  const registry = createConnectorAdapterRegistry({
    fetchImpl: async () => {
      throw new Error("not used");
    },
  });

  assert.equal(registry.get("jira")?.id, "jira");
  assert.equal(registry.get("atlassian")?.id, "jira");
  assert.equal(registry.get("dropbox")?.id, "dropbox");
  assert.ok(
    registry.listCapabilities("dropbox").some((capability) => capability.id === "search_files"),
  );
  assert.ok(
    registry
      .listCapabilities("dropbox")
      .some((capability) => capability.id === "upload_file" && capability.access === "interactive"),
  );
});
