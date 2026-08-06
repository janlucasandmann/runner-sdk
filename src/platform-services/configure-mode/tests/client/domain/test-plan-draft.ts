import type {
  TestCaseDefinition,
  TestPlan,
  TestPlanDefinition,
  TestPlanStatus,
} from "./test-types.js";

export interface TestPlanDraft {
  name: string;
  description: string;
  status: TestPlanStatus;
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
  return JSON.parse(JSON.stringify(definition)) as TestPlanDefinition;
}

export function createDefaultTestPlanDefinition(): TestPlanDefinition {
  return {
    schemaVersion: "computer_agents_test_plan_v1",
    setup: null,
    cases: [],
    teardown: null,
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: {
      maxAttempts: 1,
      backoffMs: 1_000,
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

export function createTestPlanDraft(plan: TestPlan): TestPlanDraft {
  return {
    name: plan.name,
    description: plan.description,
    status: plan.status,
    projectId: plan.projectId || "",
    environmentId: plan.defaultEnvironmentId || "",
    definition: cloneTestPlanDefinition(plan.definition),
  };
}

export function serializeTestPlanDefinition(definition: TestPlanDefinition): string {
  return JSON.stringify(definition, null, 2);
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
    const fallback = createDefaultTestPlanDefinition();
    return {
      definition: {
        ...fallback,
        ...parsed,
        cases: parsed.cases as TestCaseDefinition[],
        retryPolicy: {
          ...fallback.retryPolicy,
          ...(parsed.retryPolicy || {}),
        },
        evidencePolicy: {
          ...fallback.evidencePolicy,
          ...(parsed.evidencePolicy || {}),
        },
      },
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
    status: draft.status,
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

