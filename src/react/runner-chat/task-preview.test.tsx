import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getRunnerMissionControlAgentName,
  getRunnerMissionControlAgentPhotoUrl,
  getRunnerTaskPreviewColorStyle,
  isRunnerTaskReviewPreview,
  normalizeRunnerTaskPreviewColor,
  normalizeRunnerTaskPreviewPriority,
  normalizeRunnerTaskPreviewType,
  renderRunnerTaskPreviewCard,
} from "./task-preview.js";

describe("task preview presentation", () => {
  it("normalizes backend task fields into the supported variants", () => {
    expect(normalizeRunnerTaskPreviewPriority("CRITICAL")).toBe("critical");
    expect(normalizeRunnerTaskPreviewPriority("unknown")).toBe("medium");
    expect(normalizeRunnerTaskPreviewType("SubTask")).toBe("subtask");
    expect(normalizeRunnerTaskPreviewType("LOOP")).toBe("loop");
    expect(normalizeRunnerTaskPreviewType("story")).toBe("task");
    expect(normalizeRunnerTaskPreviewColor("rose")).toBe("rose");
    expect(normalizeRunnerTaskPreviewColor("purple")).toBe("gray");
  });

  it("exposes the task color as CSS custom properties", () => {
    expect(getRunnerTaskPreviewColorStyle("green")).toMatchObject({
      "--tb-task-preview-accent": "#2ca36b",
      "--tb-task-preview-surface": "rgba(255, 255, 255, 0.075)",
    });
  });

  it("recognizes review runs and applies mission-control fallbacks", () => {
    expect(isRunnerTaskReviewPreview({
      taskId: "task_1",
      projectId: "project_1",
      ticketNumber: "T-1",
      title: "Review",
      runKind: " REVIEW ",
    })).toBe(true);
    expect(getRunnerMissionControlAgentName(undefined)).toBe("Mission Control");
    expect(getRunnerMissionControlAgentPhotoUrl(undefined)).toBe("");
  });

  it("renders thread ticket context with the same centralized card as Progress Spotlight", () => {
    const html = renderToStaticMarkup(renderRunnerTaskPreviewCard({
      taskId: "task_1",
      projectId: "project_1",
      ticketNumber: "PRO-007",
      title: "Verify shared preview",
      createdAt: "2026-08-25T12:00:00.000Z",
      description: "Shown for ticket and mention threads.",
      taskType: "loop",
      priority: "high",
      assigneeName: "Spark",
    }));

    expect(html).toContain('data-platform-ticket-item="true"');
    expect(html).toContain('data-platform-ticket-item-variant="card"');
    expect(html).toContain("playground-tasks-lane-card");
    expect(html).toContain("playground-tasks-lane-card-type-badge is-loop");
    expect(html).toContain("playground-tasks-lane-card-status-icon");
    expect(html).toContain("playground-tasks-lane-card-priority");
    expect(html).toContain("playground-tasks-board-assignee-avatar");
    expect(html).toContain("Verify shared preview");
    expect(html).not.toContain("Shown for ticket and mention threads.");
    expect(html).toContain("PRO-007");
    expect(html).toContain("playground-tasks-lane-card-created-at");
    expect(html).toContain('dateTime="2026-08-25T12:00:00.000Z"');
  });
});
