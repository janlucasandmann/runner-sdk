import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./05-reviews-and-full-auto.mjs", import.meta.url),
  "utf8",
);

test("Move to Batch creates a deferred ticket thread and keeps the job on shelf", () => {
  assert.match(source, /mainActionKind === "batch"[\s\S]*?addToBatch: true/);
  assert.match(source, /executionMode: "deferred"/);
  assert.match(source, /moveToInProgress: options\?\.addToBatch === true \? false : true/);
  assert.match(source, /if \(options\?\.addToBatch === true\)[\s\S]*?startPolicy: "manual"/);
});

