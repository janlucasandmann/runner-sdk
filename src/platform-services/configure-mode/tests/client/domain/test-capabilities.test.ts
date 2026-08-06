import { describe, expect, it } from "vitest";
import type { TestCaseDefinition, TestPlanDefinition } from "./test-types.js";
import {
  applyTestCasePresentation,
  getTestCaseCategory,
  getTestCaseExecutionMethod,
  getTestPlanExecutionProfile,
} from "./test-capabilities.js";

function testCase(overrides: Partial<TestCaseDefinition> = {}): TestCaseDefinition {
  return {
    id: "case-1",
    name: "Readiness",
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
    ...overrides,
  };
}

function definition(cases: TestCaseDefinition[]): TestPlanDefinition {
  return {
    schemaVersion: "computer_agents_test_plan_v1",
    setup: null,
    cases,
    teardown: null,
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: { maxAttempts: 1, backoffMs: 1_000 },
    evidencePolicy: {
      retainLogs: true,
      retainScreenshots: true,
      retainTraces: true,
      retainArtifacts: true,
      redactSecrets: true,
    },
  };
}

describe("test capabilities", () => {
  it("separates execution method from category without breaking the v1 kind", () => {
    const updated = applyTestCasePresentation(testCase(), "agent", "browser");
    expect(updated.kind).toBe("browser");
    expect(getTestCaseExecutionMethod(updated)).toBe("agent");
    expect(getTestCaseCategory(updated)).toBe("browser");
  });

  it("recognizes only all-contract plans as deterministic", () => {
    const contract = testCase({
      kind: "contract",
      command: "",
      request: { target: "control_plane_readiness" },
    });
    expect(getTestPlanExecutionProfile(definition([contract])).method).toBe("deterministic");
    expect(getTestPlanExecutionProfile(definition([contract, testCase()])).method).toBe("agent");
  });
});

