import { describe, expect, it } from "vitest";
import {
  getRunnerMissionControlAgentName,
  getRunnerMissionControlAgentPhotoUrl,
  getRunnerTaskPreviewColorStyle,
  isRunnerTaskReviewPreview,
  normalizeRunnerTaskPreviewColor,
  normalizeRunnerTaskPreviewPriority,
  normalizeRunnerTaskPreviewType,
} from "./task-preview.js";

describe("task preview presentation", () => {
  it("normalizes backend task fields into the supported variants", () => {
    expect(normalizeRunnerTaskPreviewPriority("CRITICAL")).toBe("critical");
    expect(normalizeRunnerTaskPreviewPriority("unknown")).toBe("medium");
    expect(normalizeRunnerTaskPreviewType("SubTask")).toBe("subtask");
    expect(normalizeRunnerTaskPreviewType("story")).toBe("task");
    expect(normalizeRunnerTaskPreviewColor("rose")).toBe("rose");
    expect(normalizeRunnerTaskPreviewColor("purple")).toBe("gray");
  });

  it("exposes the task color as CSS custom properties", () => {
    expect(getRunnerTaskPreviewColorStyle("green")).toMatchObject({
      "--tb-task-preview-accent": "#2ca36b",
      "--tb-task-preview-surface": "rgba(44, 163, 107, 0.12)",
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
});
