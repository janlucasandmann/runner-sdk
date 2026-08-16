import { describe, expect, it } from "vitest";
import type { TestCaseDefinition, TestPlanDefinition } from "./test-types.js";
import {
  applyTestCasePresentation,
  getTestCaseCategory,
  getTestCaseExecutionProfile,
  getTestCaseExecutionMethod,
  getTestCaseTargetKind,
  getTestPlanExecutionProfile,
  validateTestCaseConfiguration,
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
    cases,
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: { maxAttempts: 1 },
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

  it("distinguishes deterministic, hybrid, and agent execution", () => {
    const contract = testCase({
      kind: "contract",
      command: "",
      request: { target: "control_plane_readiness" },
    });
    expect(getTestPlanExecutionProfile(definition([contract])).method).toBe("deterministic");
    expect(getTestPlanExecutionProfile(definition([contract, testCase()])).method).toBe("hybrid");
    expect(getTestPlanExecutionProfile(definition([testCase()])).method).toBe("agent");
  });

  it("keeps target, executor, and evidence trust separate", () => {
    const functionCase = testCase({
      kind: "contract",
      command: "",
      request: {
        target: "computer_agents_function",
        functionId: "function-1",
        method: "POST",
        path: "/",
      },
    });
    expect(getTestCaseTargetKind(functionCase)).toBe("computer_agents_function");
    expect(getTestCaseExecutionProfile(functionCase)).toMatchObject({
      executor: "platform_worker",
      trust: "runner_captured",
      attestationEligible: false,
    });
  });

  it("does not present an unsupported contract target as verified readiness", () => {
    const unsupportedContract = testCase({
      kind: "contract",
      command: "Inspect the external service.",
      request: { target: "external_http_request" },
    });
    expect(getTestCaseTargetKind(unsupportedContract)).toBe("agent");
    expect(getTestCaseExecutionProfile(unsupportedContract)).toMatchObject({
      executor: "computer_agents_thread",
      trust: "agent_reported",
      attestationEligible: false,
    });
  });

  it("requires every deterministic scenario step to be executable", () => {
    const incompleteScenario = testCase({
      kind: "contract",
      command: "",
      request: {
        target: "service_topology",
        steps: [{
          id: "invoke-function",
          request: {
            target: "computer_agents_function",
            functionId: "",
            method: "POST",
            path: "/",
          },
        }],
      },
    });
    expect(validateTestCaseConfiguration(incompleteScenario)).toBe(
      "Scenario step 1 must select a Function.",
    );
    expect(getTestPlanExecutionProfile(definition([incompleteScenario]))).toMatchObject({
      method: "agent",
      trust: "agent_reported",
      requiresEnvironment: true,
    });
  });
});
