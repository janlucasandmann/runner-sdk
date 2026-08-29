import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildMetronomeWorkflowBranchMiniMap,
  buildMetronomeWorkflowLinearPath,
  buildMetronomeWorkflowPathAroundActive,
  getMetronomeWorkflowCanvasContentWidth,
  getMetronomeWorkflowStepNodeIds,
  type MetronomeWorkflowMiniEdge,
  type MetronomeWorkflowMiniNode,
  normalizeMetronomeWorkflowMiniMap,
} from "./metronome-workflow-state.js";

const activityCoreCss = readFileSync(
  fileURLToPath(new URL("./activity-core.css", import.meta.url)),
  "utf8",
);

describe("metronome workflow log state", () => {
  it("subtracts canvas padding from the graph layout width", () => {
    expect(getMetronomeWorkflowCanvasContentWidth({
      clientWidth: 896,
      paddingLeft: 20,
      paddingRight: 20,
    })).toBe(856);
  });

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

  it("ends the branch canvas at the right edge of the rightmost rendered node", () => {
    const nodes: MetronomeWorkflowMiniNode[] = [
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "condition", kind: "condition", label: "Check" },
      { id: "left", kind: "end", label: "Left" },
      { id: "right", kind: "thread", label: "Right" },
    ];
    const edges: MetronomeWorkflowMiniEdge[] = [
      { id: "trigger-condition", source: "trigger", target: "condition" },
      { id: "condition-left", source: "condition", target: "left" },
      { id: "condition-right", source: "condition", target: "right" },
    ];

    const branchMap = buildMetronomeWorkflowBranchMiniMap({
      activeNodeId: "right",
      path: ["trigger", "condition", "right"],
      nodes,
      edges,
    });
    const rightmostNodeEdge = Math.max(
      ...(branchMap?.items.map(({ x }) => x + branchMap.nodeWidth) || []),
    );

    expect(branchMap?.width).toBe(rightmostNodeEdge);
  });

  it("keeps a shared convergence node after the longest incoming branch", () => {
    const nodes: MetronomeWorkflowMiniNode[] = [
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "condition", kind: "condition", label: "Maintain knowledge?" },
      { id: "action", kind: "thread", label: "Maintain project knowledge" },
      { id: "end", kind: "end", label: "Mission Control complete" },
    ];
    const edges: MetronomeWorkflowMiniEdge[] = [
      { id: "trigger-condition", source: "trigger", target: "condition" },
      { id: "condition-skip", source: "condition", target: "end" },
      { id: "condition-action", source: "condition", target: "action" },
      { id: "action-end", source: "action", target: "end" },
    ];

    const branchMap = buildMetronomeWorkflowBranchMiniMap({
      activeNodeId: "action",
      path: ["trigger", "condition", "action", "end"],
      nodes,
      edges,
    });
    const action = branchMap?.items.find(({ node }) => node.id === "action");
    const end = branchMap?.items.find(({ node }) => node.id === "end");

    expect(action).toBeDefined();
    expect(end).toBeDefined();
    expect(end!.x).toBeGreaterThan(action!.x);
    expect(branchMap?.links.every((link) => link.targetX > link.sourceX)).toBe(true);
  });

  it("uses available minimap width to delay node-title truncation", () => {
    const nodes: MetronomeWorkflowMiniNode[] = [
      { id: "trigger", kind: "trigger", label: "Trigger" },
      { id: "condition", kind: "condition", label: "Maintain knowledge?" },
      { id: "action", kind: "thread", label: "Maintain project knowledge" },
      { id: "end", kind: "end", label: "Mission Control complete" },
    ];
    const edges: MetronomeWorkflowMiniEdge[] = [
      { id: "trigger-condition", source: "trigger", target: "condition" },
      { id: "condition-skip", source: "condition", target: "end" },
      { id: "condition-action", source: "condition", target: "action" },
      { id: "action-end", source: "action", target: "end" },
    ];

    const branchMap = buildMetronomeWorkflowBranchMiniMap({
      activeNodeId: "action",
      path: ["trigger", "condition", "action", "end"],
      nodes,
      edges,
      availableWidth: 760,
    });

    expect(branchMap?.width).toBe(760);
    expect(branchMap?.nodeWidth).toBe(172);
  });

  it("keeps every workflow minimap independent from user-message width", () => {
    expect(activityCoreCss).toMatch(
      /\.tb-log-card-metronome-workflow\s*\{[^}]*width:\s*100%/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap\s*\{[^}]*width:\s*100%/,
    );
    expect(activityCoreCss).not.toMatch(
      /\.tb-log-card\.tb-log-card-metronome-workflow\s*\{[^}]*width:\s*fit-content/,
    );
  });

  it("keeps spacing inside the workflow canvas and preserves its current surface styling", () => {
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap\s*\{[^}]*border-radius:\s*20px/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap\s*\{[^}]*overflow:\s*hidden/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap\s*\{[^}]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-workflow-header\s*\{[^}]*background:\s*#262626/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-canvas\s*\{[^}]*padding:\s*20px/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-canvas\s*\{[^}]*background-image:\s*radial-gradient\(\s*circle,\s*rgba\(255,\s*255,\s*255,\s*0\.12\)\s*1px,\s*transparent\s*1px\s*\)/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-canvas\s*\{[^}]*background-size:\s*18px\s+18px/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-node-title\s*\{[^}]*text-overflow:\s*ellipsis/,
    );
    expect(activityCoreCss).toMatch(
      /\.tb-log-metronome-minimap-node\s*\{[^}]*background:\s*#262626/,
    );
  });

  it("uses regular weight for compact activity titles", () => {
    expect(activityCoreCss).toMatch(
      /\.tb-log-compact-action-title\s*\{[^}]*font-weight:\s*400/,
    );
  });

  it("keeps centralized compact log lines visually transparent", () => {
    expect(activityCoreCss).toMatch(
      /\.tb-log-compact-action\s*\{[^}]*background:\s*transparent/,
    );
  });
});
