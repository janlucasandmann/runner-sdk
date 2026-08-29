import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeMetronomeThreadLifecycleRecords,
  resolveMetronomeThreadLifecycle,
} from "./thread-lifecycle.mjs";

test("a terminal child-thread projection beats a stale running step", () => {
  const lifecycle = resolveMetronomeThreadLifecycle([
    { record: { status: "running", updatedAt: "2026-08-29T07:00:00.000Z" }, source: "step", priority: 100 },
    { record: { status: "completed", completedAt: "2026-08-29T07:00:05.000Z" }, source: "thread", priority: 400 },
  ]);
  assert.deepEqual(
    { status: lifecycle.status, phase: lifecycle.phase, isRunning: lifecycle.isRunning },
    { status: "completed", phase: "terminal", isRunning: false },
  );
});

test("only the active node is running when a compact step status is stale", () => {
  const previousNode = resolveMetronomeThreadLifecycle(
    [{ record: { status: "running", startedAt: "2026-08-29T07:00:00.000Z" }, source: "step" }],
    {
      nodeId: "node-a",
      activeNodeIds: ["node-b"],
      hasActiveNodeProjection: true,
      startedAt: "2026-08-29T07:00:00.000Z",
      runStatus: "running",
    },
  );
  const activeNode = resolveMetronomeThreadLifecycle(
    [{ record: { status: "running", startedAt: "2026-08-29T07:00:05.000Z" }, source: "step" }],
    {
      nodeId: "node-b",
      activeNodeIds: ["node-b"],
      hasActiveNodeProjection: true,
      startedAt: "2026-08-29T07:00:05.000Z",
      runStatus: "running",
    },
  );
  assert.equal(previousNode.status, "completed");
  assert.equal(previousNode.isRunning, false);
  assert.equal(activeNode.status, "running");
  assert.equal(activeNode.isRunning, true);
});

test("a sequential workflow never presents multiple stale nodes as running", () => {
  const nodeIds = ["knowledge", "milestones", "strategy", "issues"];
  const lifecycles = nodeIds.map((nodeId, index) => resolveMetronomeThreadLifecycle(
    [{ record: { status: "running", startedAt: `2026-08-29T07:00:0${index}.000Z` }, source: "compact-step" }],
    {
      nodeId,
      activeNodeIds: ["strategy"],
      hasActiveNodeProjection: true,
      startedAt: `2026-08-29T07:00:0${index}.000Z`,
      runStatus: "running",
    },
  ));
  assert.deepEqual(
    lifecycles.map((lifecycle) => lifecycle.isRunning),
    [false, false, true, false],
  );
});

test("queued nodes do not show as actively executing", () => {
  const lifecycle = resolveMetronomeThreadLifecycle([{ record: { status: "queued" }, source: "thread" }]);
  assert.equal(lifecycle.status, "queued");
  assert.equal(lifecycle.phase, "pending");
  assert.equal(lifecycle.isRunning, false);
});

test("the newest nonterminal ground truth can resume a paused thread", () => {
  const lifecycle = resolveMetronomeThreadLifecycle([
    { record: { status: "paused", updatedAt: "2026-08-29T07:00:00.000Z" }, source: "old-thread", priority: 500 },
    { record: { status: "running", updatedAt: "2026-08-29T07:00:01.000Z" }, source: "thread", priority: 500 },
  ]);
  assert.equal(lifecycle.status, "running");
  assert.equal(lifecycle.isRunning, true);
});

test("a failed run marks the projected active node failed", () => {
  const lifecycle = resolveMetronomeThreadLifecycle(
    [{ record: { status: "running", startedAt: "2026-08-29T07:00:00.000Z" }, source: "step" }],
    {
      nodeId: "node-a",
      activeNodeIds: ["node-a"],
      hasActiveNodeProjection: true,
      runStatus: "failed",
      startedAt: "2026-08-29T07:00:00.000Z",
    },
  );
  assert.equal(lifecycle.status, "failed");
  assert.equal(lifecycle.isTerminal, true);
});

test("out-of-order polling cannot regress a completed thread to running", () => {
  const merged = mergeMetronomeThreadLifecycleRecords(
    { id: "thread-1", status: "completed", completedAt: "2026-08-29T07:00:05.000Z", title: "Node" },
    { id: "thread-1", status: "running", updatedAt: "2026-08-29T07:00:02.000Z", title: "Node" },
  );
  assert.equal(merged.status, "completed");
  assert.equal(merged.metadata, undefined);
});

test("a running projection advances a queued thread immediately", () => {
  const merged = mergeMetronomeThreadLifecycleRecords(
    { id: "thread-1", status: "queued", updatedAt: "2026-08-29T07:00:00.000Z" },
    { id: "thread-1", status: "running", updatedAt: "2026-08-29T07:00:01.000Z" },
  );
  assert.equal(merged.status, "running");
});
