import type {
  TestCaseDefinition,
  TestPlan,
  TestPlanDefinition,
} from "./test-types.js";

export interface TestPlanDraft {
  name: string;
  description: string;
  projectId: string;
  environmentId: string;
  definition: TestPlanDefinition;
}

export interface ParsedTestPlanDefinition {
  definition: TestPlanDefinition | null;
  error: string;
}

export function cloneTestPlanDefinition(
  definition: TestPlanDefinition,
): TestPlanDefinition {
  return sanitizeTestPlanDefinition(JSON.parse(JSON.stringify(definition)));
}

export function createDefaultTestPlanDefinition(): TestPlanDefinition {
  return {
    schemaVersion: "computer_agents_test_plan_v1",
    cases: [],
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: {
      maxAttempts: 1,
    },
    evidencePolicy: {
      retainLogs: true,
      retainScreenshots: true,
      retainTraces: true,
      retainArtifacts: true,
      redactSecrets: true,
    },
  };
}

function asDefinitionRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function finiteNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeTestPlanDefinition(value: unknown): TestPlanDefinition {
  const source = asDefinitionRecord(value);
  const retryPolicy = asDefinitionRecord(source.retryPolicy);
  const evidencePolicy = asDefinitionRecord(source.evidencePolicy);
  return {
    schemaVersion: "computer_agents_test_plan_v1",
    cases: Array.isArray(source.cases)
      ? source.cases as TestCaseDefinition[]
      : [],
    concurrency: finiteNumber(source.concurrency, 1),
    stopOnFailure: source.stopOnFailure === true,
    retryPolicy: {
      maxAttempts: finiteNumber(retryPolicy.maxAttempts, 1),
    },
    evidencePolicy: {
      retainLogs: evidencePolicy.retainLogs !== false,
      retainScreenshots: evidencePolicy.retainScreenshots !== false,
      retainTraces: evidencePolicy.retainTraces !== false,
      retainArtifacts: evidencePolicy.retainArtifacts !== false,
      redactSecrets: evidencePolicy.redactSecrets !== false,
    },
  };
}

export function createTestPlanDraft(plan: TestPlan): TestPlanDraft {
  return {
    name: plan.name,
    description: plan.description,
    projectId: plan.projectId || "",
    environmentId: plan.defaultEnvironmentId || "",
    definition: cloneTestPlanDefinition(plan.definition),
  };
}

export function serializeTestPlanDefinition(definition: TestPlanDefinition): string {
  return JSON.stringify(sanitizeTestPlanDefinition(definition), null, 2);
}

export function parseTestPlanDefinition(value: string): ParsedTestPlanDefinition {
  try {
    const parsed = JSON.parse(value) as Partial<TestPlanDefinition> | null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { definition: null, error: "The definition must be a JSON object." };
    }
    if (!Array.isArray(parsed.cases)) {
      return { definition: null, error: "The definition must contain a cases array." };
    }
    if (
      Object.prototype.hasOwnProperty.call(parsed, "setup")
      || Object.prototype.hasOwnProperty.call(parsed, "teardown")
    ) {
      return {
        definition: null,
        error: "Test lifecycle commands are not supported. Model preparation and cleanup as explicit test cases.",
      };
    }
    return {
      definition: sanitizeTestPlanDefinition(parsed),
      error: "",
    };
  } catch (error) {
    return {
      definition: null,
      error: error instanceof Error ? error.message : "The definition is not valid JSON.",
    };
  }
}

export function getTestPlanDraftSignature(draft: TestPlanDraft): string {
  return JSON.stringify({
    name: draft.name.trim(),
    description: draft.description.trim(),
    projectId: draft.projectId,
    environmentId: draft.environmentId,
    definition: draft.definition,
  });
}

export function isTestPlanDraftDirty(draft: TestPlanDraft, plan: TestPlan): boolean {
  return getTestPlanDraftSignature(draft) !== getTestPlanDraftSignature(
    createTestPlanDraft(plan),
  );
}

export function addTestCaseToDefinition(
  definition: TestPlanDefinition,
  testCase: TestCaseDefinition,
): TestPlanDefinition {
  if (definition.cases.some((candidate) => candidate.id === testCase.id)) {
    throw new Error(`A test case with id "${testCase.id}" already exists.`);
  }
  return {
    ...definition,
    cases: [...definition.cases, testCase],
  };
}

export function updateTestCaseInDefinition(
  definition: TestPlanDefinition,
  testCase: TestCaseDefinition,
): TestPlanDefinition {
  return {
    ...definition,
    cases: definition.cases.map((candidate) => (
      candidate.id === testCase.id ? testCase : candidate
    )),
  };
}

export function removeTestCaseFromDefinition(
  definition: TestPlanDefinition,
  caseId: string,
): TestPlanDefinition {
  return {
    ...definition,
    cases: definition.cases.filter((candidate) => candidate.id !== caseId),
  };
}

export function duplicateTestCaseInDefinition(
  definition: TestPlanDefinition,
  source: TestCaseDefinition,
): TestPlanDefinition {
  const ids = new Set(definition.cases.map((testCase) => testCase.id));
  let ordinal = 2;
  let id = `${source.id}-copy`;
  while (ids.has(id)) {
    id = `${source.id}-copy-${ordinal}`;
    ordinal += 1;
  }
  return addTestCaseToDefinition(definition, {
    ...JSON.parse(JSON.stringify(source)) as TestCaseDefinition,
    id,
    name: `${source.name} copy`,
  });
}
