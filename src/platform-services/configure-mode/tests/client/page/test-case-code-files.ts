import type { TestCaseDefinition, TestCaseKind } from "../domain/index.js";

export type TestCaseCodeFileId =
  | "case.json"
  | "execution.json"
  | "request.json"
  | "assertions.json"
  | "environment.json";

export type TestCaseCodeSources = Record<TestCaseCodeFileId, string>;

export interface ParsedTestCaseCodeFile {
  testCase: TestCaseDefinition | null;
  error: string;
}

export const TEST_CASE_CODE_FILE_IDS: readonly TestCaseCodeFileId[] = [
  "case.json",
  "execution.json",
  "request.json",
  "assertions.json",
  "environment.json",
] as const;

const TEST_CASE_KINDS = new Set<TestCaseKind>([
  "command",
  "contract",
  "integration",
  "browser",
  "agent",
  "security",
  "custom",
]);

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJson(source: string, fileId: TestCaseCodeFileId): unknown {
  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    throw new Error(`${fileId}: ${message}`);
  }
}

function requireRecord(value: unknown, fileId: TestCaseCodeFileId): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${fileId} must contain a JSON object.`);
  return value;
}

function requireString(value: unknown, property: string, fileId: TestCaseCodeFileId): string {
  if (typeof value !== "string") {
    throw new Error(`${fileId}: ${property} must be a string.`);
  }
  return value;
}

function requireFiniteNumber(value: unknown, property: string, fileId: TestCaseCodeFileId): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${fileId}: ${property} must be a finite number.`);
  }
  return value;
}

function requireStringArray(
  value: unknown,
  property: string,
  fileId: TestCaseCodeFileId,
): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${fileId}: ${property} must be an array of strings.`);
  }
  return [...value];
}

export function serializeTestCaseCodeFiles(testCase: TestCaseDefinition): TestCaseCodeSources {
  return {
    "case.json": formatJson({
      id: testCase.id,
      name: testCase.name,
      description: testCase.description,
      kind: testCase.kind,
      enabled: testCase.enabled,
      tags: testCase.tags,
    }),
    "execution.json": formatJson({
      command: testCase.command,
      workingDirectory: testCase.workingDirectory,
      timeoutMs: testCase.timeoutMs,
      retries: testCase.retries,
      agentId: testCase.agentId,
    }),
    "request.json": formatJson(testCase.request),
    "assertions.json": formatJson(testCase.assertions),
    "environment.json": formatJson({
      env: testCase.env,
      secretRefs: testCase.secretRefs,
    }),
  };
}

export function applyTestCaseCodeFile(
  testCase: TestCaseDefinition,
  fileId: TestCaseCodeFileId,
  source: string,
): ParsedTestCaseCodeFile {
  try {
    const parsed = parseJson(source, fileId);

    if (fileId === "case.json") {
      const value = requireRecord(parsed, fileId);
      const id = requireString(value.id, "id", fileId);
      const name = requireString(value.name, "name", fileId);
      const description = requireString(value.description, "description", fileId);
      const kind = requireString(value.kind, "kind", fileId) as TestCaseKind;
      if (!id.trim()) throw new Error(`${fileId}: id cannot be empty.`);
      if (!TEST_CASE_KINDS.has(kind)) {
        throw new Error(`${fileId}: kind is not a supported test case kind.`);
      }
      if (typeof value.enabled !== "boolean") {
        throw new Error(`${fileId}: enabled must be a boolean.`);
      }
      return {
        testCase: {
          ...testCase,
          id,
          name,
          description,
          kind,
          enabled: value.enabled,
          tags: requireStringArray(value.tags, "tags", fileId),
        },
        error: "",
      };
    }

    if (fileId === "execution.json") {
      const value = requireRecord(parsed, fileId);
      return {
        testCase: {
          ...testCase,
          command: requireString(value.command, "command", fileId),
          workingDirectory: requireString(value.workingDirectory, "workingDirectory", fileId),
          timeoutMs: requireFiniteNumber(value.timeoutMs, "timeoutMs", fileId),
          retries: requireFiniteNumber(value.retries, "retries", fileId),
          agentId: requireString(value.agentId, "agentId", fileId),
        },
        error: "",
      };
    }

    if (fileId === "request.json") {
      return {
        testCase: {
          ...testCase,
          request: requireRecord(parsed, fileId),
        },
        error: "",
      };
    }

    if (fileId === "assertions.json") {
      if (!Array.isArray(parsed)) {
        throw new Error(`${fileId} must contain a JSON array.`);
      }
      return {
        testCase: { ...testCase, assertions: parsed },
        error: "",
      };
    }

    const value = requireRecord(parsed, fileId);
    const env = requireRecord(value.env, fileId);
    if (Object.values(env).some((entry) => typeof entry !== "string")) {
      throw new Error(`${fileId}: every env value must be a string.`);
    }
    return {
      testCase: {
        ...testCase,
        env: { ...env } as Record<string, string>,
        secretRefs: requireStringArray(value.secretRefs, "secretRefs", fileId),
      },
      error: "",
    };
  } catch (error) {
    return {
      testCase: null,
      error:
        error instanceof Error
          ? error.message
          : `${fileId} is not a valid test case configuration file.`,
    };
  }
}
