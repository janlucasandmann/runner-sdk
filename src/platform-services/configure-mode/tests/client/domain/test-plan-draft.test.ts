import { describe, expect, it } from "vitest";
import {
  addTestCaseToDefinition,
  createDefaultTestPlanDefinition,
  duplicateTestCaseInDefinition,
  parseTestPlanDefinition,
} from "./test-plan-draft.js";
import type { TestCaseDefinition } from "./test-types.js";

const testCase: TestCaseDefinition = {
  id: "case-1",
  name: "Smoke test",
  description: "",
  kind: "command",
  command: "npm test",
  workingDirectory: "",
  timeoutMs: 300_000,
  retries: 0,
  env: {},
  secretRefs: [],
  request: {},
  assertions: [],
  agentId: "",
  enabled: true,
  tags: ["smoke"],
};

describe("test plan draft", () => {
  it("creates empty definitions without a passing placeholder case", () => {
    expect(createDefaultTestPlanDefinition().cases).toEqual([]);
  });

  it("supports structured add and duplicate operations", () => {
    const added = addTestCaseToDefinition(createDefaultTestPlanDefinition(), testCase);
    const duplicated = duplicateTestCaseInDefinition(added, testCase);
    expect(duplicated.cases.map((candidate) => candidate.id)).toEqual([
      "case-1",
      "case-1-copy",
    ]);
  });

  it("parses advanced JSON into a normalized draft shape", () => {
    const parsed = parseTestPlanDefinition('{"cases":[]}');
    expect(parsed.error).toBe("");
    expect(parsed.definition?.retryPolicy.maxAttempts).toBe(1);
  });
});

