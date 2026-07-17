import { describe, expect, it } from "vitest";
import {
  buildMetronomeWorkflowBranchMiniMap,
  buildMetronomeWorkflowLinearPath,
  buildMetronomeWorkflowPathAroundActive,
  getMetronomeWorkflowStepNodeIds,
  type MetronomeWorkflowMiniEdge,
  type MetronomeWorkflowMiniNode,
  normalizeMetronomeWorkflowMiniMap,
} from "./metronome-workflow-state.js";

describe("metronome workflow log state", () => {
  it("normalizes workflow maps and removes dangling edges", () => {
    const map = normalizeMetronomeWorkflowMiniMap({
      workflowMap: {
        nodes: [
          { id: "trigger", kind: "trigger" },
          {
            id: "thread",
            kind: "thread",
            name: "Start agent thread",
          },
          {
            id: "database",
            type: "database",
            display_name: "Store result",
          },
          { id: "", kind: "action", name: "Invalid" },
        ],
        edges: [
          { source: "trigger", target: "thread" },
          { source: "thread", target: "database" },
          { source: "database", target: "missing" },
        ],
      },
    });

    expect(map.startNodeId).toBe("trigger");
    expect(map.nodes).toEqual([
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "thread", kind: "thread", label: "Thread" },
      {
        id: "database",
        kind: "database",
        label: "Store result",
      },
    ]);
    expect(map.edges.map(({ source, target }) => [source, target])).toEqual([
      ["trigger", "thread"],
      ["thread", "database"],
    ]);
  });

  it("deduplicates recorded steps and extends the visible linear path", () => {
    const nodes: MetronomeWorkflowMiniNode[] = [
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "thread", kind: "thread", label: "Thread" },
      { id: "database", kind: "database", label: "Database" },
      { id: "end", kind: "end", label: "End" },
    ];
    const edges: MetronomeWorkflowMiniEdge[] = [
      {
        id: "trigger-thread",
        source: "trigger",
        target: "thread",
      },
      {
        id: "thread-database",
        source: "thread",
        target: "database",
      },
      { id: "database-end", source: "database", target: "end" },
    ];
    const workflow = {
      steps: [{ nodeId: "thread" }, { nodeId: "thread" }, { nodeId: "database" }],
    };

    const stepNodeIds = getMetronomeWorkflowStepNodeIds(workflow);
    expect(stepNodeIds).toEqual(["thread", "database"]);
    expect(
      buildMetronomeWorkflowLinearPath({
        nodes,
        edges,
        startNodeId: "trigger",
        stepNodeIds,
      }),
    ).toEqual(["thread", "database", "end"]);
    expect(
      buildMetronomeWorkflowPathAroundActive({
        activeNodeId: "database",
        edges,
      }),
    ).toEqual(["trigger", "thread", "database", "end"]);
  });

  it("builds a bounded branch map around the active condition path", () => {
    const nodes: MetronomeWorkflowMiniNode[] = [
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "condition", kind: "condition", label: "Check" },
      { id: "left", kind: "thread", label: "Left" },
      { id: "right", kind: "thread", label: "Right" },
      { id: "left-end", kind: "end", label: "Left end" },
      { id: "right-end", kind: "end", label: "Right end" },
    ];
    const edges: MetronomeWorkflowMiniEdge[] = [
      {
        id: "trigger-condition",
        source: "trigger",
        target: "condition",
      },
      { id: "condition-left", source: "condition", target: "left" },
      {
        id: "condition-right",
        source: "condition",
        target: "right",
      },
      { id: "left-end", source: "left", target: "left-end" },
      { id: "right-end", source: "right", target: "right-end" },
    ];

    const branchMap = buildMetronomeWorkflowBranchMiniMap({
      activeNodeId: "right-end",
      path: ["trigger", "condition", "right", "right-end"],
      nodes,
      edges,
    });

    expect(branchMap?.condition.id).toBe("condition");
    expect(branchMap?.items.map(({ node }) => node.id)).toEqual(
      expect.arrayContaining(["trigger", "condition", "left", "right", "left-end", "right-end"]),
    );
    expect(branchMap?.links).toHaveLength(5);
    expect(branchMap?.width).toBeGreaterThan(0);
    expect(branchMap?.height).toBeGreaterThan(0);
  });
});
