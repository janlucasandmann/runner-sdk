import type {
  TestCaseDefinition,
  TestCaseKind,
  TestPlanDefinition,
  TestTargetType,
} from "./test-types.js";

export type TestCaseExecutionMethod = "command" | "contract" | "agent";
export type TestCaseTargetKind =
  | "command"
  | "control_plane_readiness"
  | "computer_agents_function"
  | "metronome_workflow"
  | "service_topology"
  | "agent";
export type DeterministicTestTargetKind = Exclude<
  TestCaseTargetKind,
  "command" | "agent"
>;
export type TestCaseCategory =
  | "smoke"
  | "integration"
  | "browser"
  | "agent"
  | "security"
  | "custom";
export type TestExecutionTrust =
  | "verified_worker"
  | "runner_captured"
  | "agent_reported"
  | "mixed";

export interface TestCaseExecutionOption {
  value: TestCaseExecutionMethod;
  label: string;
  description: string;
  trust: TestExecutionTrust;
}

export interface TestCaseCategoryOption {
  value: TestCaseCategory;
  label: string;
  description: string;
}

export interface TestPlanExecutionProfile {
  method: "deterministic" | "hybrid" | "agent";
  label: string;
  description: string;
  trust: TestExecutionTrust;
  requiresEnvironment: boolean;
}

export interface TestCaseExecutionProfile {
  method: "deterministic" | "agent";
  executor: "platform_worker" | "computer_agents_thread";
  label: string;
  description: string;
  trust: Exclude<TestExecutionTrust, "mixed">;
  requiresEnvironment: boolean;
  attestationEligible: boolean;
}

export interface TestCaseTypeOption {
  value: TestCaseTargetKind;
  label: string;
  description: string;
}

export const TEST_CASE_EXECUTION_OPTIONS: readonly TestCaseExecutionOption[] = [
  {
    value: "command",
    label: "Command",
    description: "Execute the immutable command in the selected Computer workspace and capture its real exit code.",
    trust: "verified_worker",
  },
  {
    value: "contract",
    label: "Deterministic contract",
    description: "Invoke a supported platform target and evaluate structured assertions in the execution worker.",
    trust: "runner_captured",
  },
  {
    value: "agent",
    label: "Agent-guided test",
    description: "Ask an executor agent to perform a workflow and retain concrete evidence for every result.",
    trust: "agent_reported",
  },
] as const;

export const TEST_CASE_TYPE_OPTIONS: readonly TestCaseTypeOption[] = [
  {
    value: "command",
    label: "Command",
    description: "Run an immutable, secret-redacted command in a selected Computer workspace.",
  },
  {
    value: "computer_agents_function",
    label: "Function",
    description: "Invoke one Computer Agents Function method and inspect its response.",
  },
  {
    value: "metronome_workflow",
    label: "Workflow",
    description: "Start a pinned Metronome workflow and inspect its terminal output.",
  },
  {
    value: "control_plane_readiness",
    label: "Platform readiness",
    description: "Verify the canonical control-plane readiness contract.",
  },
  {
    value: "service_topology",
    label: "Scenario",
    description: "Execute an ordered scenario of deterministic platform contracts.",
  },
  {
    value: "agent",
    label: "Agent-guided verification",
    description: "Ask an executor agent to verify behavior that has no deterministic adapter yet.",
  },
] as const;

export const TEST_CASE_CATEGORY_OPTIONS: readonly TestCaseCategoryOption[] = [
  { value: "smoke", label: "Smoke", description: "Fast readiness or release-blocking coverage." },
  { value: "integration", label: "Integration", description: "Multiple components working together." },
  { value: "browser", label: "Browser", description: "A user-facing browser flow." },
  { value: "agent", label: "Agent behavior", description: "An agent workflow or tool boundary." },
  { value: "security", label: "Security", description: "A security control or negative boundary." },
  { value: "custom", label: "Custom", description: "A purpose-specific verification contract." },
] as const;

export const DETERMINISTIC_TEST_TARGET_OPTIONS = [
  {
    value: "control_plane_readiness",
    label: "Control-plane readiness",
    description: "Verify the canonical platform readiness contract.",
  },
  {
    value: "computer_agents_function",
    label: "Computer Agents Function",
    description: "Invoke one exact Function endpoint.",
  },
  {
    value: "metronome_workflow",
    label: "Metronome workflow",
    description: "Start and inspect one immutable workflow.",
  },
  {
    value: "service_topology",
    label: "Service topology",
    description: "Execute an ordered set of deterministic service contracts.",
  },
] as const;

export const DETERMINISTIC_TEST_TARGETS = new Set(
  DETERMINISTIC_TEST_TARGET_OPTIONS.map((option) => option.value),
);

export interface TestTargetScenarioPolicy {
  targetType: TestTargetType;
  scenarioLabel: string;
  description: string;
  allowedExecutionMethods: readonly TestCaseExecutionMethod[];
  allowedContractTargets: readonly DeterministicTestTargetKind[];
  defaultExecutionMethod: TestCaseExecutionMethod;
  defaultContractTarget: DeterministicTestTargetKind;
  forcedCategory?: TestCaseCategory;
  locked: boolean;
}

const ALL_EXECUTION_METHODS: readonly TestCaseExecutionMethod[] = [
  "command",
  "contract",
  "agent",
];
const ALL_CONTRACT_TARGETS: readonly DeterministicTestTargetKind[] = [
  "control_plane_readiness",
  "computer_agents_function",
  "metronome_workflow",
  "service_topology",
];

const TEST_TARGET_SCENARIO_POLICIES: Readonly<Record<TestTargetType, TestTargetScenarioPolicy>> = {
  function: {
    targetType: "function",
    scenarioLabel: "Function request",
    description: "Invoke the selected Function directly and evaluate its structured response.",
    allowedExecutionMethods: ["contract"],
    allowedContractTargets: ["computer_agents_function"],
    defaultExecutionMethod: "contract",
    defaultContractTarget: "computer_agents_function",
    locked: true,
  },
  workflow: {
    targetType: "workflow",
    scenarioLabel: "Workflow run",
    description: "Run the selected Metronome workflow, node, or connected slice.",
    allowedExecutionMethods: ["contract"],
    allowedContractTargets: ["metronome_workflow"],
    defaultExecutionMethod: "contract",
    defaultContractTarget: "metronome_workflow",
    locked: true,
  },
  web_app: {
    targetType: "web_app",
    scenarioLabel: "Browser journey",
    description: "Exercise the selected web app through browser steps and visual evidence.",
    allowedExecutionMethods: ["agent"],
    allowedContractTargets: [],
    defaultExecutionMethod: "agent",
    defaultContractTarget: "control_plane_readiness",
    forcedCategory: "browser",
    locked: true,
  },
  repository: {
    targetType: "repository",
    scenarioLabel: "Repository command",
    description: "Run a unit, integration, or end-to-end command in the selected repository workspace.",
    allowedExecutionMethods: ["command"],
    allowedContractTargets: [],
    defaultExecutionMethod: "command",
    defaultContractTarget: "control_plane_readiness",
    locked: true,
  },
  agent: {
    targetType: "agent",
    scenarioLabel: "Agent behavior",
    description: "Ask the selected Agent to complete a behavior and retain its evidence.",
    allowedExecutionMethods: ["agent"],
    allowedContractTargets: [],
    defaultExecutionMethod: "agent",
    defaultContractTarget: "control_plane_readiness",
    forcedCategory: "agent",
    locked: true,
  },
  project: {
    targetType: "project",
    scenarioLabel: "Project scenario",
    description: "Compose command, Function, workflow, browser, and cross-resource scenarios.",
    allowedExecutionMethods: ALL_EXECUTION_METHODS,
    allowedContractTargets: ALL_CONTRACT_TARGETS,
    defaultExecutionMethod: "command",
    defaultContractTarget: "control_plane_readiness",
    locked: false,
  },
  custom: {
    targetType: "custom",
    scenarioLabel: "Custom scenario",
    description: "Choose the execution adapter that matches this scenario.",
    allowedExecutionMethods: ALL_EXECUTION_METHODS,
    allowedContractTargets: ALL_CONTRACT_TARGETS,
    defaultExecutionMethod: "command",
    defaultContractTarget: "control_plane_readiness",
    locked: false,
  },
};

export function getTestTargetScenarioPolicy(
  targetType: TestTargetType,
): TestTargetScenarioPolicy {
  return TEST_TARGET_SCENARIO_POLICIES[targetType]
    || TEST_TARGET_SCENARIO_POLICIES.custom;
}

export function getTestCaseTypeOptionsForTestTarget(
  targetType: TestTargetType,
): readonly TestCaseTypeOption[] {
  if (targetType === "function") {
    return TEST_CASE_TYPE_OPTIONS.filter((option) => option.value === "computer_agents_function");
  }
  if (targetType === "workflow") {
    return TEST_CASE_TYPE_OPTIONS.filter((option) => option.value === "metronome_workflow");
  }
  if (targetType === "repository") {
    return TEST_CASE_TYPE_OPTIONS.filter((option) => option.value === "command");
  }
  if (targetType === "web_app") {
    return [{
      value: "agent",
      label: "Browser journey",
      description: "Exercise the selected web app through browser steps and visual evidence.",
    }];
  }
  if (targetType === "agent") {
    return [{
      value: "agent",
      label: "Agent behavior",
      description: "Verify the behavior of the selected Agent.",
    }];
  }
  return TEST_CASE_TYPE_OPTIONS;
}

const CATEGORY_VALUES = new Set<TestCaseCategory>(
  TEST_CASE_CATEGORY_OPTIONS.map((option) => option.value),
);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function getTestCaseExecutionMethod(
  testCase: Pick<TestCaseDefinition, "kind">,
): TestCaseExecutionMethod {
  if (testCase.kind === "command") return "command";
  if (testCase.kind === "contract") return "contract";
  return "agent";
}

export function getTestCaseCategory(
  testCase: Pick<TestCaseDefinition, "kind" | "tags">,
): TestCaseCategory {
  if (["integration", "browser", "agent", "security", "custom"].includes(testCase.kind)) {
    return testCase.kind as TestCaseCategory;
  }
  const categoryTag = testCase.tags.find((tag) => (
    CATEGORY_VALUES.has(tag.toLowerCase() as TestCaseCategory)
  ));
  return categoryTag?.toLowerCase() as TestCaseCategory || "smoke";
}

export function getTestCaseExecutionLabel(testCase: TestCaseDefinition): string {
  const method = getTestCaseExecutionMethod(testCase);
  if (method === "contract" && getTestCaseTargetKind(testCase) === "agent") {
    return "Agent-guided test";
  }
  return TEST_CASE_EXECUTION_OPTIONS.find((option) => option.value === method)?.label || method;
}

export function getTestCaseTargetKind(
  testCase: Pick<TestCaseDefinition, "kind" | "request">,
): TestCaseTargetKind {
  const method = getTestCaseExecutionMethod(testCase);
  if (method === "command") return "command";
  if (method === "agent") return "agent";
  const request = asRecord(testCase.request);
  const structuredTarget = asRecord(request.target);
  if (String(structuredTarget.kind || "").toLowerCase() === "service_topology") {
    return "service_topology";
  }
  const target = String(request.target || "").trim().toLowerCase();
  if (DETERMINISTIC_TEST_TARGETS.has(
    target as typeof DETERMINISTIC_TEST_TARGET_OPTIONS[number]["value"],
  )) {
    return target as Exclude<TestCaseTargetKind, "command" | "agent">;
  }
  return "agent";
}

export function getDefaultTestCaseRequest(
  target: Exclude<TestCaseTargetKind, "command" | "agent">,
): Record<string, unknown> {
  if (target === "computer_agents_function") {
    return { target, functionId: "", method: "POST", path: "/", body: null };
  }
  if (target === "metronome_workflow") {
    return {
      target,
      workflowId: "",
      workflowVersionId: null,
      input: null,
      selection: { type: "full" },
    };
  }
  if (target === "service_topology") {
    return { target, steps: [], stopOnFailure: true };
  }
  return {
    target: "control_plane_readiness",
    requireDatabase: true,
    requireAgentRuntime: true,
  };
}

export function applyTestCaseTargetKind(
  testCase: TestCaseDefinition,
  target: TestCaseTargetKind,
): TestCaseDefinition {
  const category = getTestCaseCategory(testCase);
  if (target === "command") {
    return {
      ...applyTestCasePresentation(testCase, "command", category),
      request: {},
    };
  }
  if (target === "agent") {
    const instructions = testCase.command.trim()
      || String(asRecord(testCase.request).instructions || "").trim();
    return {
      ...applyTestCasePresentation(testCase, "agent", category),
      command: instructions,
      request: instructions ? { instructions } : {},
    };
  }
  const currentTarget = getTestCaseTargetKind(testCase);
  return {
    ...applyTestCasePresentation(testCase, "contract", category),
    command: "",
    request: currentTarget === target
      ? asRecord(testCase.request)
      : getDefaultTestCaseRequest(target),
  };
}

export function configureTestCaseForTestTarget(
  testCase: TestCaseDefinition,
  targetType: TestTargetType,
  targetId: string | null | undefined,
): TestCaseDefinition {
  const normalizedTargetId = String(targetId || "").trim();
  if (targetType === "function") {
    const next = applyTestCaseTargetKind(testCase, "computer_agents_function");
    return {
      ...next,
      request: {
        ...asRecord(next.request),
        target: "computer_agents_function",
        functionId: normalizedTargetId,
      },
    };
  }
  if (targetType === "workflow") {
    const next = applyTestCaseTargetKind(testCase, "metronome_workflow");
    return {
      ...next,
      request: {
        ...asRecord(next.request),
        target: "metronome_workflow",
        workflowId: normalizedTargetId,
      },
    };
  }
  if (targetType === "web_app") {
    const next = applyTestCasePresentation(testCase, "agent", "browser");
    const request = asRecord(next.request);
    return {
      ...next,
      kind: "browser",
      request: {
        ...request,
        startUrl: String(request.startUrl || normalizedTargetId),
        screenshotMode: String(request.screenshotMode || "on_failure"),
        instructions: next.command,
      },
      agentId: "",
    };
  }
  if (targetType === "repository") {
    return applyTestCaseTargetKind(testCase, "command");
  }
  if (targetType === "agent") {
    const next = applyTestCasePresentation(testCase, "agent", "agent");
    return {
      ...next,
      kind: "agent",
      agentId: normalizedTargetId,
      request: next.command ? { ...asRecord(next.request), instructions: next.command } : {},
    };
  }
  return testCase;
}

export function validateTestCaseTargetCompatibility(
  testCase: TestCaseDefinition,
  targetType: TestTargetType,
  targetId: string | null | undefined,
): string {
  const normalizedTargetId = String(targetId || "").trim();
  const scenarioTarget = getTestCaseTargetKind(testCase);
  const request = asRecord(testCase.request);
  if (targetType === "function") {
    if (!normalizedTargetId) return "Select the Function this Test protects.";
    if (
      scenarioTarget !== "computer_agents_function"
      || String(request.functionId || "").trim() !== normalizedTargetId
    ) {
      return "Function Tests can only contain scenarios bound to the selected Function.";
    }
  }
  if (targetType === "workflow") {
    if (!normalizedTargetId) return "Select the Metronome workflow this Test protects.";
    if (
      scenarioTarget !== "metronome_workflow"
      || String(request.workflowId || "").trim() !== normalizedTargetId
    ) {
      return "Workflow Tests can only contain scenarios bound to the selected workflow.";
    }
  }
  if (targetType === "web_app") {
    if (scenarioTarget !== "agent" || testCase.kind !== "browser") {
      return "Web app Tests can only contain browser journey scenarios.";
    }
    const startUrl = String(request.startUrl || "").trim();
    if (normalizedTargetId && startUrl) {
      try {
        if (new URL(normalizedTargetId).origin !== new URL(startUrl).origin) {
          return "Browser scenarios must stay on the selected web app origin.";
        }
      } catch {
        return "The Test target and browser start URL must be valid web URLs.";
      }
    }
  }
  if (targetType === "repository" && scenarioTarget !== "command") {
    return "Repository Tests can only contain workspace command scenarios.";
  }
  if (targetType === "agent") {
    if (scenarioTarget !== "agent" || testCase.kind === "browser") {
      return "Agent Tests can only contain Agent behavior scenarios.";
    }
    if (normalizedTargetId && testCase.agentId !== normalizedTargetId) {
      return "Agent scenarios must remain bound to the selected Agent.";
    }
  }
  return "";
}

export function getTestCaseExecutionProfile(
  testCase: TestCaseDefinition,
): TestCaseExecutionProfile {
  const target = getTestCaseTargetKind(testCase);
  if (target === "command") {
    return {
      method: "deterministic",
      executor: "platform_worker",
      label: "Verified command worker",
      description: "The durable worker executes the exact immutable command in the selected Computer workspace and captures its exit code with secret-redacted evidence.",
      trust: "verified_worker",
      requiresEnvironment: true,
      attestationEligible: true,
    };
  }
  if (target === "control_plane_readiness") {
    return {
      method: "deterministic",
      executor: "platform_worker",
      label: "Attestation-capable worker",
      description: "The durable worker performs the readiness check directly. Trust is confirmed only when the terminal evidence contains a valid worker attestation.",
      trust: "verified_worker",
      requiresEnvironment: false,
      attestationEligible: true,
    };
  }
  if (["computer_agents_function", "metronome_workflow", "service_topology"].includes(target)) {
    return {
      method: "deterministic",
      executor: "platform_worker",
      label: "Deterministic worker",
      description: "The durable worker invokes this supported target directly without asking an LLM to determine the result.",
      trust: "runner_captured",
      requiresEnvironment: false,
      attestationEligible: false,
    };
  }
  return {
    method: "agent",
    executor: "computer_agents_thread",
    label: "Agent-executed",
    description: "An executor agent performs this case in the selected environment. Its result is retained as self-reported evidence.",
    trust: "agent_reported",
    requiresEnvironment: true,
    attestationEligible: false,
  };
}

export function getTestCaseCategoryLabel(testCase: TestCaseDefinition): string {
  const category = getTestCaseCategory(testCase);
  return TEST_CASE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category;
}

function validateFunctionRequest(request: Record<string, unknown>, prefix = "Function"): string {
  if (!String(request.functionId || "").trim()) return `${prefix} must select a Function.`;
  const method = String(request.method || "POST").toUpperCase();
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return `${prefix} must use a supported request method.`;
  }
  const path = String(request.path || "/").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return `${prefix} path must be a safe absolute path beginning with /.`;
  }
  return "";
}

function validateBoundTopologyRequest(request: Record<string, unknown>): string {
  const target = asRecord(request.target);
  const resources = Array.isArray(target.resources)
    ? target.resources.slice(0, 51).map(asRecord)
    : [];
  if (resources.length === 0 || resources.length > 50) {
    return "The bound topology must contain between 1 and 50 resources.";
  }
  const entrypointKey = String(
    target.entrypoint || target.entrypointResourceKey || "",
  ).trim();
  if (!entrypointKey) return "The bound topology needs an entrypoint.";
  const entrypoint = resources.find(
    (resource) => String(resource.key || "").trim() === entrypointKey,
  );
  const entrypointId = String(entrypoint?.id || entrypoint?.resourceId || "").trim();
  const entrypointKind = String(entrypoint?.kind || "").trim().toLowerCase();
  if (!entrypoint || !entrypointId || !["function", "metronome"].includes(entrypointKind)) {
    return "The bound topology entrypoint must reference a Function or Metronome resource.";
  }
  if (entrypointKind === "function") {
    const invocation = asRecord(request.invocation || target.invocation);
    return validateFunctionRequest({
      functionId: entrypointId,
      method: invocation.method || request.method || "POST",
      path: invocation.path || request.path || "/",
    }, "The bound Function entrypoint");
  }
  return "";
}

function validateDeterministicRequest(request: Record<string, unknown>): string {
  const structuredTarget = asRecord(request.target);
  if (String(structuredTarget.kind || "").toLowerCase() === "service_topology") {
    return validateBoundTopologyRequest(request);
  }
  const target = String(request.target || "").trim().toLowerCase();
  if (target === "control_plane_readiness") return "";
  if (target === "computer_agents_function") return validateFunctionRequest(request);
  if (target === "metronome_workflow") {
    if (!String(request.workflowId || "").trim()) {
      return "Select a Metronome workflow.";
    }
    const selection = asRecord(request.selection);
    const selectionType = String(selection.type || "full").trim().toLowerCase();
    if (selectionType === "node" && !String(selection.nodeId || "").trim()) {
      return "Enter the workflow node ID to test.";
    }
    if (
      selectionType === "slice"
      && !(Array.isArray(selection.nodeIds) && selection.nodeIds.length > 0)
    ) {
      return "Enter at least one workflow node ID for the connected slice.";
    }
    return "";
  }
  if (target !== "service_topology") {
    return "Choose a supported deterministic target or convert this case to agent-guided verification.";
  }
  const steps = Array.isArray(request.steps) ? request.steps.slice(0, 51).map(asRecord) : [];
  if (steps.length === 0) return "Add at least one scenario step.";
  if (steps.length > 50) return "A scenario can contain at most 50 steps.";
  const ids = steps.map((step) => String(step.id || "").trim());
  if (ids.some((id) => !/^[a-z][a-z0-9_-]*$/.test(id))) {
    return "Every scenario step ID must start with a letter and use lowercase letters, numbers, underscores, or hyphens.";
  }
  if (new Set(ids).size !== ids.length) return "Every scenario step must have a unique ID.";
  for (const [index, step] of steps.entries()) {
    const stepRequest = asRecord(step.request);
    const stepTarget = String(stepRequest.target || "").trim().toLowerCase();
    if (stepTarget === "service_topology" || !DETERMINISTIC_TEST_TARGETS.has(
      stepTarget as typeof DETERMINISTIC_TEST_TARGET_OPTIONS[number]["value"],
    )) {
      return `Scenario step ${index + 1} must use Function, Workflow, or Platform readiness.`;
    }
    const stepError = stepTarget === "computer_agents_function"
      ? validateFunctionRequest(stepRequest, `Scenario step ${index + 1}`)
      : stepTarget === "metronome_workflow" && !String(stepRequest.workflowId || "").trim()
        ? `Scenario step ${index + 1} must select a Metronome workflow.`
        : "";
    if (stepError) return stepError;
  }
  return "";
}

function validateBrowserRequest(request: Record<string, unknown>): string {
  const startUrl = String(request.startUrl || "").trim();
  if (!startUrl) return "Enter the browser journey start URL.";
  try {
    const parsed = new URL(startUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "The browser start URL must use http or https.";
    }
  } catch {
    return "Enter a valid browser start URL.";
  }
  const screenshotMode = String(request.screenshotMode || "on_failure");
  if (!["off", "on_failure", "final", "each_step"].includes(screenshotMode)) {
    return "Choose a supported screenshot evidence policy.";
  }
  const visualComparison = asRecord(request.visualComparison);
  if (visualComparison.enabled === true) {
    if (!String(visualComparison.baselineArtifactUri || "").trim()) {
      return "Select a baseline artifact for visual comparison.";
    }
    const maxDiffPercent = Number(visualComparison.maxDiffPercent ?? 0.1);
    if (!Number.isFinite(maxDiffPercent) || maxDiffPercent < 0 || maxDiffPercent > 100) {
      return "Visual difference tolerance must be between 0 and 100 percent.";
    }
  }
  return "";
}

export function isSupportedDeterministicTestCase(testCase: TestCaseDefinition): boolean {
  if (testCase.enabled === false) return false;
  if (getTestCaseTargetKind(testCase) === "command") {
    return Boolean(testCase.command.trim());
  }
  return testCase.kind === "contract"
    && !validateDeterministicRequest(asRecord(testCase.request));
}

export function validateTestCaseConfiguration(testCase: TestCaseDefinition): string {
  const target = getTestCaseTargetKind(testCase);
  const request = asRecord(testCase.request);
  if (target === "command" && !testCase.command.trim()) {
    return "Enter the command this case should execute.";
  }
  if (getTestCaseExecutionMethod(testCase) === "contract" && target === "agent") {
    return validateDeterministicRequest(request);
  }
  if (target === "agent" && !testCase.command.trim()) {
    return "Describe the verification workflow for the executor agent.";
  }
  if (target === "agent" && testCase.kind === "browser") {
    return validateBrowserRequest(request);
  }
  return [
    "computer_agents_function",
    "metronome_workflow",
    "control_plane_readiness",
    "service_topology",
  ].includes(target) ? validateDeterministicRequest(request) : "";
}

export function getTestPlanExecutionProfile(
  definition: TestPlanDefinition,
): TestPlanExecutionProfile {
  const enabledCases = definition.cases.filter((testCase) => testCase.enabled !== false);
  const deterministicCases = enabledCases.filter(isSupportedDeterministicTestCase);
  const deterministicCount = deterministicCases.length;
  const agentCount = enabledCases.length - deterministicCount;
  if (enabledCases.length > 0 && agentCount === 0) {
    const attestationEligible = deterministicCases.every(
      (testCase) => ["command", "control_plane_readiness"].includes(
        getTestCaseTargetKind(testCase),
      ),
    );
    const requiresEnvironment = deterministicCases.some(
      (testCase) => getTestCaseTargetKind(testCase) === "command",
    );
    return {
      method: "deterministic",
      label: attestationEligible ? "Attestation-capable worker" : "Deterministic worker",
      description: attestationEligible
        ? "Every enabled case is executed directly and can receive independently verified readiness evidence."
        : "Every enabled case is executed directly by a supported deterministic adapter without an LLM.",
      trust: attestationEligible ? "verified_worker" : "runner_captured",
      requiresEnvironment,
    };
  }
  if (deterministicCount > 0 && agentCount > 0) {
    return {
      method: "hybrid",
      label: "Hybrid execution",
      description: `${deterministicCount} ${deterministicCount === 1 ? "case runs" : "cases run"} in the deterministic worker; ${agentCount} ${agentCount === 1 ? "case is" : "cases are"} delegated to an executor agent.`,
      trust: "mixed",
      requiresEnvironment: true,
    };
  }
  return {
    method: "agent",
    label: "Agent-executed",
    description: "One bound executor agent performs the immutable plan in the selected Computer Agents environment.",
    trust: "agent_reported",
    requiresEnvironment: true,
  };
}

export function getTestCaseTargetSummary(testCase: TestCaseDefinition): string {
  const target = getTestCaseTargetKind(testCase);
  if (target === "command") {
    return testCase.command.trim().replace(/\s+/g, " ") || "Command not configured";
  }
  const request = asRecord(testCase.request);
  if (target === "computer_agents_function") {
    return String(request.functionId || "Function not selected");
  }
  if (target === "metronome_workflow") {
    return String(request.workflowId || "Workflow not selected");
  }
  if (target === "control_plane_readiness") return "Control-plane readiness";
  if (target === "service_topology") {
    const structuredTarget = asRecord(request.target);
    const entrypoint = String(structuredTarget.entrypoint || "").trim();
    return entrypoint ? `Service topology · ${entrypoint}` : "Service topology";
  }
  return testCase.command.trim().replace(/\s+/g, " ")
    || String(request.instructions || "").trim().replace(/\s+/g, " ")
    || testCase.description.trim()
    || "Verification instructions not configured";
}

function kindForPresentation(
  method: TestCaseExecutionMethod,
  category: TestCaseCategory,
): TestCaseKind {
  if (method === "command") return "command";
  if (method === "contract") return "contract";
  if (["integration", "browser", "agent", "security", "custom"].includes(category)) {
    return category as TestCaseKind;
  }
  return "custom";
}

export function applyTestCasePresentation(
  testCase: TestCaseDefinition,
  method: TestCaseExecutionMethod,
  category: TestCaseCategory,
): TestCaseDefinition {
  const tags = [
    category,
    ...testCase.tags.filter((tag) => !CATEGORY_VALUES.has(tag.toLowerCase() as TestCaseCategory)),
  ];
  const request = method === "contract"
    ? {
        target: "control_plane_readiness",
        ...asRecord(testCase.request),
      }
    : testCase.request;
  return {
    ...testCase,
    kind: kindForPresentation(method, category),
    tags: Array.from(new Set(tags)),
    request,
  };
}
