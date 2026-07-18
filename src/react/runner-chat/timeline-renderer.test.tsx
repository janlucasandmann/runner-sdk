import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { RunnerLog } from "../../types.js";
import {
  renderRunnerNestedTimelineItems,
  type RunnerTimelineRenderContext,
} from "./timeline-renderer.js";
import type { RunnerTurn } from "./turn-types.js";

function timelineContext(): RunnerTimelineRenderContext {
  return {
    agents: [],
    availableEnvironments: [],
    availableProjects: [],
    backendUrl: "https://api.example.test",
    deepResearchSessions: [],
    displayedAgentLabel: "Forge",
    displayedEnvironmentLabel: "Computer",
    environmentId: "environment_1",
    environmentName: "Computer",
    isBrowserDetailOpen: () => false,
    isComputerUseDetailOpen: () => false,
    isDeepResearchDetailOpen: () => false,
    isSubagentDetailOpen: () => false,
    onOpenBrowserDetails: vi.fn(),
    onOpenComputerUseDetails: vi.fn(),
    onOpenDeepResearchDetails: vi.fn(),
    onOpenEnvironmentDesktop: vi.fn(),
    onOpenSubagentDetails: vi.fn(),
    onPermissionDecision: vi.fn(),
    onPreviewDocument: vi.fn(),
    onWorkspacePathClick: vi.fn(),
  };
}

describe("timeline renderer", () => {
  it("owns nested timeline row composition", () => {
    const log: RunnerLog = {
      time: "00:01",
      message: "Checked the repository status",
      type: "success",
      eventType: "command_execution",
      metadata: {
        command: "git status --short",
        status: "completed",
      },
    };
    const turn: RunnerTurn = {
      id: "turn_1",
      prompt: "Inspect the repository",
      logs: [log],
      startedAtMs: 1000,
      status: "completed",
    };
    const content = renderRunnerNestedTimelineItems({
      context: timelineContext(),
      items: [{ kind: "log", log }],
      turn,
    });
    const html = renderToStaticMarkup(content);

    expect(html).toContain("agent-step-item");
    expect(html).toContain("Checked Git Status");
    expect(html).toContain("Working tree clean");
  });
});
