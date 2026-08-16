import type {
  TestCaseDefinition,
  TestCaseKind,
  TestPlanDefinition,
} from "./test-types.js";

export type TestCaseExecutionMethod = "command" | "contract" | "agent";
export type TestCaseTargetKind =
  | "command"
  | "control_plane_readiness"
  | "computer_agents_function"
  | "metronome_workflow"
  | "service_topology"
  | "agent";
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
    description: "Execute a shell command in a Computer Agents environment and use its real exit code.",
    trust: "agent_reported",
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
    description: "Run a command in a selected Computer Agents environment.",
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
    return { target, workflowId: "", workflowVersionId: null, input: null };
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

export function getTestCaseExecutionProfile(
  testCase: TestCaseDefinition,
): TestCaseExecutionProfile {
  const target = getTestCaseTargetKind(testCase);
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
    return String(request.workflowId || "").trim()
      ? ""
      : "Select a Metronome workflow.";
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

export function isSupportedDeterministicTestCase(testCase: TestCaseDefinition): boolean {
  return testCase.enabled !== false
    && testCase.kind === "contract"
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
      (testCase) => getTestCaseTargetKind(testCase) === "control_plane_readiness",
    );
    return {
      method: "deterministic",
      label: attestationEligible ? "Attestation-capable worker" : "Deterministic worker",
      description: attestationEligible
        ? "Every enabled case is executed directly and can receive independently verified readiness evidence."
        : "Every enabled case is executed directly by a supported deterministic adapter without an LLM.",
      trust: attestationEligible ? "verified_worker" : "runner_captured",
      requiresEnvironment: false,
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
