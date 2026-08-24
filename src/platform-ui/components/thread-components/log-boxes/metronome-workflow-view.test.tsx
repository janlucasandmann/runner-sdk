// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import { MetronomeWorkflowLogBox } from "./metronome-workflow-view.js";

afterEach(cleanup);

function createWorkflowLog(): RunnerLog {
  return {
    time: "00:01",
    message: "Workflow started",
    type: "info",
    eventType: "metronome_workflow",
    metadata: {
      metronomeWorkflow: {
        metronomeId: "workflow_1",
        runId: "run_1",
        metronomeName: "Mission Control",
        userMessage: "Maintain this project",
        activeNodeId: "end",
        workflowMap: {
          startNodeId: "trigger",
          nodes: [
            { id: "trigger", kind: "trigger", name: "Start" },
            { id: "end", kind: "end", name: "Complete" },
          ],
          edges: [{ id: "trigger-end", source: "trigger", target: "end" }],
        },
      },
    },
  };
}

describe("MetronomeWorkflowLogBox", () => {
  it("renders the workflow identity as the minimap header", () => {
    const log = createWorkflowLog();

    const html = renderToStaticMarkup(<MetronomeWorkflowLogBox log={log} />);
    const minimapIndex = html.indexOf('class="tb-log-metronome-minimap"');
    const headerIndex = html.indexOf('class="tb-log-metronome-workflow-header"');
    const canvasIndex = html.indexOf('class="tb-log-metronome-minimap-canvas"');

    expect(minimapIndex).toBeGreaterThanOrEqual(0);
    expect(headerIndex).toBeGreaterThan(minimapIndex);
    expect(canvasIndex).toBeGreaterThan(headerIndex);
    expect(html).toContain("Mission Control");
    expect(html).toContain('aria-label="Workflow actions"');
    expect(
      html.slice(headerIndex, canvasIndex),
    ).not.toContain("tb-log-compact-action-icon");
  });

  it("opens the run overview and workflow details from the shared minimal actions menu", () => {
    const navigationEvents: Array<Record<string, unknown>> = [];
    const handleNavigation = (event: Event) => {
      navigationEvents.push((event as CustomEvent<Record<string, unknown>>).detail);
    };
    window.addEventListener("playground:open-metronome-workflow", handleNavigation);

    render(<MetronomeWorkflowLogBox log={createWorkflowLog()} />);

    fireEvent.click(screen.getByRole("button", { name: "Workflow actions" }));
    expect(
      screen.getByRole("menu", { name: "Workflow actions" }).getAttribute("data-platform-popup-placement"),
    ).toBe("bottom-end");
    fireEvent.click(screen.getByRole("menuitem", { name: "View Run Overview" }));

    expect(navigationEvents.at(-1)).toMatchObject({
      workflowId: "workflow_1",
      runId: "run_1",
      workflowName: "Mission Control",
      mode: "run-overview",
    });

    fireEvent.click(screen.getByRole("button", { name: "Workflow actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Workflow Details" }));

    expect(navigationEvents.at(-1)).toMatchObject({
      workflowId: "workflow_1",
      runId: "run_1",
      mode: "edit",
    });

    window.removeEventListener("playground:open-metronome-workflow", handleNavigation);
  });
});
