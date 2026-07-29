import { describe, expect, it } from "vitest";
import {
  getPlatformConnectorCatalogEntry,
  getPlatformConnectorPermissionActionId,
  listPlatformConnectorCatalogEntries,
  listPlatformConnectorPermissionActionDescriptors,
  PLATFORM_CONNECTOR_IDS,
} from "./index.js";

describe("platform connector catalog", () => {
  it("defines metadata and capabilities for every connector", () => {
    expect(listPlatformConnectorCatalogEntries()).toHaveLength(
      PLATFORM_CONNECTOR_IDS.length,
    );
    for (const id of PLATFORM_CONNECTOR_IDS) {
      const connector = getPlatformConnectorCatalogEntry(id);
      expect(connector?.label).toBeTruthy();
      expect(connector?.capabilities.length).toBeGreaterThan(0);
      expect(connector?.permissionSubjectType).toContain(
        connector?.kind === "tag" ? "_tag" : "_plugin",
      );
    }
  });

  it("generates exact permission actions for every capability", () => {
    for (const connector of listPlatformConnectorCatalogEntries()) {
      const actions = listPlatformConnectorPermissionActionDescriptors(
        connector.id,
      );
      expect(actions).toHaveLength(connector.capabilities.length);
      expect(actions.map((action) => action.capabilityId)).toEqual(
        connector.capabilities.map((capability) => capability.id),
      );
    }
  });

  it("preserves the established GitHub permission action IDs", () => {
    expect(
      getPlatformConnectorPermissionActionId("github", "search_code"),
    ).toBe("github_action_search_code");
  });
});
