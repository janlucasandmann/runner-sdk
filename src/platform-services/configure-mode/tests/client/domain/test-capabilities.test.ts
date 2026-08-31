import { describe, expect, it } from "vitest";
import type { TestCaseDefinition, TestPlanDefinition } from "./test-types.js";
import {
  applyTestCasePresentation,
  configureTestCaseForTestTarget,
  getTestCaseCategory,
  getTestCaseExecutionProfile,
  getTestCaseExecutionMethod,
  getTestCaseTargetKind,
  getTestPlanExecutionProfile,
  getTestTargetScenarioPolicy,
  validateTestCaseConfiguration,
  validateTestCaseTargetCompatibility,
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
    const browser = testCase({
      kind: "browser",
      command: "Open the home page.",
      request: { startUrl: "https://example.com", screenshotMode: "on_failure" },
    });
    expect(getTestPlanExecutionProfile(definition([contract])).method).toBe("deterministic");
    expect(getTestPlanExecutionProfile(definition([contract, browser])).method).toBe("hybrid");
    expect(getTestPlanExecutionProfile(definition([browser])).method).toBe("agent");
    expect(getTestPlanExecutionProfile(definition([testCase()]))).toMatchObject({
      method: "deterministic",
      trust: "verified_worker",
      requiresEnvironment: true,
    });
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

  it("validates the structured browser and visual comparison contract", () => {
    const browser = testCase({
      kind: "browser",
      command: "Open the page and verify the hero.",
      request: {
        startUrl: "https://example.com",
        screenshotMode: "each_step",
        visualComparison: {
          enabled: true,
          baselineArtifactUri: "artifact://baseline/home.png",
          maxDiffPercent: 0.5,
        },
      },
    });
    expect(validateTestCaseConfiguration(browser)).toBe("");
    expect(validateTestCaseConfiguration({
      ...browser,
      request: { ...browser.request, startUrl: "file:///tmp/index.html" },
    })).toBe("The browser start URL must use http or https.");
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

  it("binds single-resource Tests to their only compatible scenario adapter", () => {
    const workflowScenario = configureTestCaseForTestTarget(
      testCase(),
      "workflow",
      "workflow-1",
    );
    expect(getTestTargetScenarioPolicy("workflow")).toMatchObject({
      allowedExecutionMethods: ["contract"],
      allowedContractTargets: ["metronome_workflow"],
      locked: true,
    });
    expect(workflowScenario).toMatchObject({
      kind: "contract",
      command: "",
      request: {
        target: "metronome_workflow",
        workflowId: "workflow-1",
      },
    });
    expect(validateTestCaseTargetCompatibility(
      workflowScenario,
      "workflow",
      "workflow-1",
    )).toBe("");
    expect(validateTestCaseTargetCompatibility(
      testCase(),
      "workflow",
      "workflow-1",
    )).toContain("selected workflow");
  });

  it("creates browser journeys for web-app sources and commands for repositories", () => {
    const browserScenario = configureTestCaseForTestTarget(
      testCase({ command: "Verify the landing page." }),
      "web_app",
      "https://app.example.com/dashboard",
    );
    expect(browserScenario).toMatchObject({
      kind: "browser",
      request: {
        startUrl: "https://app.example.com/dashboard",
        screenshotMode: "on_failure",
      },
    });
    expect(validateTestCaseTargetCompatibility(
      browserScenario,
      "web_app",
      "https://app.example.com",
    )).toBe("");
    expect(getTestCaseTargetKind(configureTestCaseForTestTarget(
      testCase({ kind: "agent" }),
      "repository",
      "github.com/example/repo",
    ))).toBe("command");
  });
});
