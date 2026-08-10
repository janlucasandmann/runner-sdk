import { describe, expect, it } from "vitest";
import {
  getPlatformConnectorCatalogEntry,
  getPlatformConnectorPermissionActionId,
  listPlatformConnectorCatalogEntries,
  listPlatformConnectorPermissionActionDescriptors,
  PLATFORM_CONNECTOR_IDS,
} from "./index.js";

describe("platform connector catalog", () => {
  const expandedProviderIds = [
    "linear",
    "box",
    "google-calendar",
    "outlook",
    "outlook-calendar",
    "bigquery",
    "slack",
    "sharepoint",
    "stripe",
    "dropbox",
    "asana",
    "microsoft-teams",
    "figma",
    "supabase",
  ] as const;

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

  it("presents the compatibility Jira ID as the Atlassian connector", () => {
    expect(getPlatformConnectorCatalogEntry("jira")).toMatchObject({
      label: "Atlassian",
      logoUrl: "/img/plugins/atlassian.svg",
    });
  });

  it("uses the bundled Box artwork across connector surfaces", () => {
    expect(getPlatformConnectorCatalogEntry("box")?.logoUrl).toBe(
      "/img/plugins/box.svg",
    );
  });

  it("uses the bundled Linear artwork across connector surfaces", () => {
    expect(getPlatformConnectorCatalogEntry("linear")?.logoUrl).toBe(
      "/img/plugins/linear.svg",
    );
  });

  it("exposes bidirectional work-item surfaces for Jira and Linear", () => {
    expect(getPlatformConnectorCatalogEntry("jira")?.surfaces).toEqual([
      "tools",
      "inbound",
      "delivery",
    ]);
    expect(getPlatformConnectorCatalogEntry("linear")?.surfaces).toEqual([
      "tools",
      "inbound",
      "delivery",
    ]);
  });

  it("uses the requested Wikimedia artwork for Figma", () => {
    expect(getPlatformConnectorCatalogEntry("figma")?.logoUrl).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    );
  });

  it("uses the requested Wikimedia artwork for Microsoft Teams", () => {
    expect(
      getPlatformConnectorCatalogEntry("microsoft-teams")?.logoUrl,
    ).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/0/07/Microsoft_Office_Teams_%282025%E2%80%93present%29.svg",
    );
  });

  it("uses the requested Wikimedia artwork for Outlook", () => {
    expect(getPlatformConnectorCatalogEntry("outlook")?.logoUrl).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Microsoft_Outlook_Icon_%282025%E2%80%93present%29.svg",
    );
  });

  it("uses the bundled Outlook Calendar artwork", () => {
    expect(getPlatformConnectorCatalogEntry("outlook-calendar")?.logoUrl).toBe(
      "/img/plugins/outlook-calendar.png",
    );
  });

  it("uses the bundled SharePoint artwork", () => {
    expect(getPlatformConnectorCatalogEntry("sharepoint")?.logoUrl).toBe(
      "/img/plugins/sharepoint.svg",
    );
  });

  it("uses the bundled Stripe artwork", () => {
    expect(getPlatformConnectorCatalogEntry("stripe")?.logoUrl).toBe(
      "/img/plugins/stripe.png",
    );
  });

  it("uses the bundled Supabase artwork", () => {
    expect(getPlatformConnectorCatalogEntry("supabase")?.logoUrl).toBe(
      "/img/plugins/supabase.svg",
    );
  });

  it("uses the requested Wikimedia artwork for Slack", () => {
    expect(getPlatformConnectorCatalogEntry("slack")?.logoUrl).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    );
  });

  it("publishes the expanded provider set from the canonical catalog", () => {
    for (const id of expandedProviderIds) {
      const connector = getPlatformConnectorCatalogEntry(id);
      expect(connector?.id).toBe(id);
      expect(connector?.kind).toBe("plugin");
      expect(connector?.authentication).toBeTruthy();
      expect(new Set(connector?.capabilities.map((item) => item.id)).size).toBe(
        connector?.capabilities.length,
      );
    }
  });
});
