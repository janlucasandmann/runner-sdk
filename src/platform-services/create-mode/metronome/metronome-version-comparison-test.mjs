import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import { METRONOME_WORKFLOW_DOMAIN_03_FRAGMENT } from "./client/runtime/workflow-domain/03-version-comparison.mjs";

function createComparisonApi() {
  const context = {
    createMetronomePersistedNodes: (nodes) => nodes,
    createMetronomePersistedEdges: (edges) => edges,
    normalizeMetronomeEdgesForNodes: (edges) => edges,
  };
  vm.createContext(context);
  vm.runInContext(
    `${METRONOME_WORKFLOW_DOMAIN_03_FRAGMENT}\n`
      + `globalThis.metronomeVersionComparisonApi = {\n`
      + `  createDefinition: createMetronomeVersionComparableDefinition,\n`
      + `  signature: createMetronomeVersionGraphSignature,\n`
      + `  equal: areMetronomeVersionGraphsEqual,\n`
      + `  readGraph: readMetronomeVersionGraph,\n`
      + `  resolveBase: resolveMetronomeVersionGraphBase,\n`
      + `};`,
    context,
  );
  return context.metronomeVersionComparisonApi;
}

test("metronome version comparison ignores editor-only node decorations", () => {
  const comparison = createComparisonApi();
  const persistedNodes = [{
    id: "node-1",
    type: "action",
    data: {
      label: "Run agent",
      config: { agentId: "agent-1" },
    },
  }];
  const renderedNodes = [{
    ...persistedNodes[0],
    ioContract: { inputs: ["prompt"], outputs: ["result"] },
    dynamicReferences: [{ source: "trigger", path: "input" }],
    data: {
      ...persistedNodes[0].data,
      runState: "running",
      onNodeSelect: () => {},
      onInlineNoteChange: () => {},
      onLoopResizeStart: () => {},
    },
  }];

  assert.equal(comparison.equal(renderedNodes, [], persistedNodes, []), true);
});

test("metronome version comparison preserves real nested configuration changes", () => {
  const comparison = createComparisonApi();
  const createNodes = (runState) => [{
    id: "node-1",
    type: "action",
    data: {
      label: "Run agent",
      config: { runState },
    },
  }];

  assert.equal(comparison.equal(createNodes("manual"), [], createNodes("automatic"), []), false);
});

test("metronome version comparison is stable across graph and object ordering", () => {
  const comparison = createComparisonApi();
  const leftNodes = [
    { id: "node-b", data: { config: { beta: 2, alpha: 1 }, label: "B" }, type: "action" },
    { id: "node-a", type: "trigger", data: { label: "A" } },
  ];
  const rightNodes = [
    { data: { label: "A" }, type: "trigger", id: "node-a" },
    { type: "action", id: "node-b", data: { label: "B", config: { alpha: 1, beta: 2 } } },
  ];
  const leftEdges = [
    { id: "edge-b", source: "node-b", target: "node-a" },
    { id: "edge-a", source: "node-a", target: "node-b" },
  ];
  const rightEdges = [...leftEdges].reverse().map((edge) => ({
    target: edge.target,
    source: edge.source,
    id: edge.id,
  }));

  assert.equal(comparison.equal(leftNodes, leftEdges, rightNodes, rightEdges), true);
});

test("metronome version graphs preserve explicit empty top-level arrays", () => {
  const comparison = createComparisonApi();
  const graph = comparison.readGraph({
    nodes: [],
    edges: [],
    definition: {
      nodes: [{ id: "stale-node" }],
      edges: [{ id: "stale-edge" }],
    },
  });

  assert.deepEqual(JSON.parse(JSON.stringify(graph)), { nodes: [], edges: [] });
});

test("metronome version baseline follows the persisted graph over stale restored metadata", () => {
  const comparison = createComparisonApi();
  const sourceNodes = [{ id: "current-node", type: "trigger", data: { label: "Current" } }];
  const baseline = comparison.resolveBase([
    {
      id: "stale-version",
      nodes: [{ id: "stale-node", type: "trigger", data: { label: "Stale" } }],
      edges: [],
    },
    {
      id: "current-version",
      nodes: sourceNodes,
      edges: [],
    },
  ], sourceNodes, [], "stale-version");

  assert.equal(baseline?.id, "current-version");
});
