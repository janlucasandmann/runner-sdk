import { describe, expect, it } from "vitest";
import {
  addTestCaseToDefinition,
  cloneTestPlanDefinition,
  createDefaultTestPlanDefinition,
  duplicateTestCaseInDefinition,
  parseTestPlanDefinition,
} from "./test-plan-draft.js";
import type { TestCaseDefinition, TestPlanDefinition } from "./test-types.js";

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
    const parsed = parseTestPlanDefinition(
      '{"cases":[],"retryPolicy":{"maxAttempts":2,"backoffMs":30000}}',
    );
    expect(parsed.error).toBe("");
    expect(parsed.definition?.retryPolicy.maxAttempts).toBe(2);
    expect(parsed.definition?.retryPolicy).not.toHaveProperty("backoffMs");
  });

  it("removes lifecycle commands from the Test Plan contract", () => {
    const parsed = parseTestPlanDefinition(
      '{"setup":{"command":"prepare"},"cases":[],"teardown":{"command":"cleanup"}}',
    );
    expect(parsed.definition).toBeNull();
    expect(parsed.error).toContain("explicit scenarios");

    const legacyDefinition = {
      ...createDefaultTestPlanDefinition(),
      setup: { command: "prepare" },
      teardown: { command: "cleanup" },
    } as unknown as TestPlanDefinition;
    const sanitized = cloneTestPlanDefinition(legacyDefinition);
    expect(sanitized).not.toHaveProperty("setup");
    expect(sanitized).not.toHaveProperty("teardown");
  });
});
