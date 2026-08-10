import type {
  TestCaseDefinition,
  TestCaseKind,
  TestPlanDefinition,
} from "./test-types.js";

export type TestCaseExecutionMethod = "command" | "contract" | "agent";
export type TestCaseCategory =
  | "smoke"
  | "integration"
  | "browser"
  | "agent"
  | "security"
  | "custom";
export type TestExecutionTrust = "verified_worker" | "agent_reported";

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
  method: "deterministic" | "agent";
  label: string;
  description: string;
  trust: TestExecutionTrust;
  requiresEnvironment: boolean;
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
    trust: "verified_worker",
  },
  {
    value: "agent",
    label: "Agent-guided test",
    description: "Ask an executor agent to perform a workflow and retain concrete evidence for every result.",
    trust: "agent_reported",
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
  return TEST_CASE_EXECUTION_OPTIONS.find((option) => option.value === method)?.label || method;
}

export function getTestCaseCategoryLabel(testCase: TestCaseDefinition): string {
  const category = getTestCaseCategory(testCase);
  return TEST_CASE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category;
}

export function isSupportedDeterministicTestCase(testCase: TestCaseDefinition): boolean {
  const target = String(asRecord(testCase.request).target || "").trim();
  return testCase.enabled !== false
    && testCase.kind === "contract"
    && DETERMINISTIC_TEST_TARGETS.has(target as typeof DETERMINISTIC_TEST_TARGET_OPTIONS[number]["value"]);
}

export function getTestPlanExecutionProfile(
  definition: TestPlanDefinition,
): TestPlanExecutionProfile {
  const enabledCases = definition.cases.filter((testCase) => testCase.enabled !== false);
  const deterministic = enabledCases.length > 0
    && enabledCases.every(isSupportedDeterministicTestCase);
  if (deterministic) {
    return {
      method: "deterministic",
      label: "Verified worker",
      description: "All enabled cases are enforced and evaluated directly by the deterministic execution worker.",
      trust: "verified_worker",
      requiresEnvironment: false,
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
  const method = getTestCaseExecutionMethod(testCase);
  if (method === "command") {
    return testCase.command.trim().replace(/\s+/g, " ") || "Command not configured";
  }
  if (method === "contract") {
    const request = asRecord(testCase.request);
    const target = String(request.target || "").trim();
    if (target === "computer_agents_function") {
      return String(request.functionId || "Function not selected");
    }
    if (target === "metronome_workflow") {
      return String(request.workflowId || "Workflow not selected");
    }
    if (target === "control_plane_readiness") return "Control-plane readiness";
    if (target === "service_topology") return "Service topology";
    return "Contract target not configured";
  }
  return testCase.command.trim().replace(/\s+/g, " ")
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
