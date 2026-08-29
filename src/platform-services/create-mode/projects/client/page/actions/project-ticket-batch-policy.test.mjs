import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./05-reviews-and-full-auto.mjs", import.meta.url),
  "utf8",
);

test("Move to Batch opens the Batch composer without starting a ticket thread", () => {
  assert.match(source, /mainActionKind === "batch"[\s\S]*?addToBatch: true/);
  const batchBranchStart = source.indexOf('if (options?.addToBatch === true)');
  const batchComposerStart = source.indexOf("openBatchComposer({", batchBranchStart);
  const batchBranchReturn = source.indexOf("return;", batchComposerStart);
  const threadRequestStart = source.indexOf("const taskRunRequest =", batchBranchStart);
  assert.ok(batchBranchStart >= 0, "The explicit Add to Batch branch must remain present.");
  assert.ok(batchComposerStart > batchBranchStart, "Add to Batch must open the Batch composer.");
  assert.ok(batchBranchReturn > batchComposerStart, "The Batch branch must return after opening the composer.");
  assert.ok(
    threadRequestStart > batchBranchReturn,
    "The Batch branch must return before the direct thread request is created.",
  );
  const batchBranchSource = source.slice(batchBranchStart, threadRequestStart);
  assert.match(batchBranchSource, /targetKind: "project_ticket_action"/);
  assert.match(batchBranchSource, /startPolicy: "manual"/);
  const threadRequestSource = source.slice(threadRequestStart);
  assert.match(threadRequestSource, /executionMode: "deferred"/);
  assert.match(threadRequestSource, /moveToInProgress: true/);
});
