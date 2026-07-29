import { describe, expect, it } from "vitest";

import {
  buildRunnerConnectorPayload,
  filterRunnerConnectorOptions,
  mergeRunnerConnectorPayloads,
  replaceRunnerConnectorMention,
  resolveRunnerConnectorMentionInputState,
} from "./composer-connectors.js";

describe("composer connectors", () => {
  it("recognizes connector mentions without matching email addresses", () => {
    expect(resolveRunnerConnectorMentionInputState("@git", 4)).toEqual({
      start: 0,
      end: 4,
      query: "git",
    });
    expect(
      resolveRunnerConnectorMentionInputState("Review with @Git Hub", 20),
    ).toEqual({
      start: 12,
      end: 20,
      query: "git hub",
    });
    expect(
      resolveRunnerConnectorMentionInputState("me@example.com", 14),
    ).toBeNull();
  });

  it("removes only the active mention when a connector is selected", () => {
    expect(
      replaceRunnerConnectorMention("Review with @git before release", {
        start: 12,
        end: 16,
        query: "git",
      }),
    ).toEqual({
      value: "Review with before release",
      selectionStart: 12,
    });
  });

  it("filters connector options by labels, descriptions, and keywords", () => {
    const options = [
      {
        id: "github",
        name: "GitHub",
        description: "Repositories and pull requests",
      },
      {
        id: "jira",
        name: "Jira",
        description: "Issues and project delivery",
        keywords: ["Atlassian"],
      },
    ];

    expect(filterRunnerConnectorOptions(options, "pull")).toHaveLength(1);
    expect(filterRunnerConnectorOptions(options, "atlassian")[0]?.id).toBe(
      "jira",
    );
  });

  it("builds and merges thread API connector payloads", () => {
    expect(buildRunnerConnectorPayload(["GitHub", "github", "jira"])).toEqual({
      github: { enabled: true },
      jira: { enabled: true },
    });
    expect(
      mergeRunnerConnectorPayloads(
        { github: { enabled: true } },
        { github: { credentialId: "cred_1" }, jira: { enabled: true } },
      ),
    ).toEqual({
      github: { enabled: true, credentialId: "cred_1" },
      jira: { enabled: true },
    });
  });
});
