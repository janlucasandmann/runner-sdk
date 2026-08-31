import { describe, expect, it } from "vitest";
import { inferTestTargetProjectId } from "./test-target-project-scope.js";
import { normalizeTestWorkspaceOption } from "./test-types.js";

describe("inferTestTargetProjectId", () => {
  it("uses direct resource scope and prefers the current project when scope is shared", () => {
    expect(inferTestTargetProjectId({
      targetType: "function",
      targetId: "function-1",
      targetResource: {
        id: "function-1",
        name: "Checkout",
        projectIds: ["project-1", "project-2"],
      },
      projects: [],
      preferredProjectId: "project-2",
    })).toBe("project-2");
  });

  it("recognizes resources attached through a Project's Resources tab", () => {
    const project = normalizeTestWorkspaceOption({
      id: "project-1",
      name: "Checkout",
      metadata: {
        linkedResources: [{ resourceId: "workflow-1", resourceType: "metronome" }],
      },
    }, "Project");

    expect(inferTestTargetProjectId({
      targetType: "workflow",
      targetId: "workflow-1",
      projects: project ? [project] : [],
    })).toBe("project-1");
  });

  it("only uses an explicit selector for Project targets", () => {
    expect(inferTestTargetProjectId({
      targetType: "project",
      targetId: "project-1",
      projects: [],
    })).toBe("project-1");
    expect(inferTestTargetProjectId({
      targetType: "custom",
      targetId: "custom-resource",
      projects: [],
    })).toBeNull();
  });
});
