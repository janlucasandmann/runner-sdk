// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import {
  buildAtlassianActivityPresentation,
  isAtlassianConnectorLog,
} from "./atlassian-activity-view.js";
import { RunnerConnectorActionSidebarPreview } from "../document-preview/specialized-preview-view.js";
import { RunnerWorkLogEntry } from "./runner-log-boxes.js";

afterEach(() => cleanup());

function createLog(overrides: Partial<RunnerLog> = {}): RunnerLog {
  return {
    time: "00:03",
    message: "Called Atlassian",
    type: "success",
    eventType: "mcp_tool_call",
    metadata: {
      toolName: "mcp__connector_jira__update_issue",
      toolInput: {
        issueIdOrKey: "FOU-019",
        fields: { status: "In Progress" },
      },
      result: { key: "FOU-019", fields: { status: "In Progress" } },
      status: "completed",
    },
    ...overrides,
  };
}

describe("Atlassian activity logs", () => {
  it("recognizes qualified and server-scoped Atlassian tools without matching other connectors", () => {
    expect(isAtlassianConnectorLog(createLog())).toBe(true);
    expect(isAtlassianConnectorLog(createLog({
      metadata: {
        serverName: "connector_atlassian",
        toolName: "list_projects",
        status: "completed",
      },
    }))).toBe(true);
    expect(isAtlassianConnectorLog(createLog({
      metadata: {
        serverName: "connector_linear",
        toolName: "list_projects",
        status: "completed",
      },
    }))).toBe(false);
  });

  it("builds concise target-aware descriptions and unwraps MCP results", () => {
    expect(buildAtlassianActivityPresentation(createLog())).toMatchObject({
      actionName: "update_issue",
      description: "Updated Jira issue FOU-019",
      status: "completed",
    });

    const created = buildAtlassianActivityPresentation(createLog({
      metadata: {
        serverName: "connector_jira",
        toolName: "create_issue",
        toolInput: {
          projectKey: "FOU",
          issueType: "Task",
          summary: "Verify production rollout",
        },
        result: {
          content: [{ type: "text", text: "{\"key\":\"FOU-020\"}" }],
          structuredContent: { key: "FOU-020" },
          isError: false,
        },
        status: "completed",
      },
    }));
    expect(created?.description).toBe("Created Jira issue FOU-020");
    expect(created?.outputText).toContain("structuredContent");
  });

  it("opens the canonical inspector payload from the compact Atlassian line", () => {
    const onPreviewDocument = vi.fn();
    render(
      <RunnerWorkLogEntry
        log={createLog()}
        onPreviewDocument={onPreviewDocument}
      />,
    );

    expect(screen.getByText("Atlassian")).toBeTruthy();
    expect(screen.getByText("Updated Jira issue FOU-019")).toBeTruthy();
    const logo = document.querySelector<HTMLImageElement>(
      '.tb-log-connector-action-icon-shell img[src="/img/plugins/atlassian.svg"]',
    );
    expect(logo).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /open atlassian action details/i }));
    expect(onPreviewDocument).toHaveBeenCalledWith(expect.objectContaining({
      filename: "Atlassian",
      previewKindOverride: "connector-action",
      connectorActionPreview: expect.objectContaining({
        connectorId: "jira",
        description: "Updated Jira issue FOU-019",
        inputData: expect.objectContaining({ issueIdOrKey: "FOU-019" }),
        outputData: expect.objectContaining({ key: "FOU-019" }),
        inputText: expect.stringContaining("FOU-019"),
        outputText: expect.stringContaining("In Progress"),
      }),
    }));

    const preview = onPreviewDocument.mock.calls[0]?.[0]?.connectorActionPreview;
    expect(preview).toBeTruthy();
    if (!preview) throw new Error("Expected an Atlassian connector preview.");
    cleanup();
    render(<RunnerConnectorActionSidebarPreview data={preview} />);
    expect(screen.getByRole("heading", { name: "Atlassian" })).toBeTruthy();
    expect(screen.getByText("Update issue")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Changes", level: 2 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Updated item", level: 2 })).toBeTruthy();
    expect(screen.getByText("Completed").classList.contains("platform-label")).toBe(true);
  });
});
