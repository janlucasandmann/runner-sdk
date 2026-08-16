import { describe, expect, it } from "vitest";
import type { TestCaseDefinition } from "../domain/index.js";
import { applyTestCaseCodeFile, serializeTestCaseCodeFiles } from "./test-case-code-files.js";

const testCase: TestCaseDefinition = {
  id: "case-1",
  name: "Function contract",
  description: "Verifies one Function response.",
  kind: "contract",
  command: "",
  workingDirectory: "",
  timeoutMs: 30_000,
  retries: 1,
  env: { NODE_ENV: "test" },
  secretRefs: ["API_TOKEN"],
  request: {
    target: "computer_agents_function",
    functionId: "function-1",
    method: "POST",
    path: "/",
    body: null,
  },
  assertions: [{ path: "status", equals: "ready" }],
  agentId: "",
  enabled: true,
  tags: ["integration"],
};

describe("test case code files", () => {
  it("projects every case property into one of the five editable files", () => {
    const files = serializeTestCaseCodeFiles(testCase);

    expect(Object.keys(files)).toEqual([
      "case.json",
      "execution.json",
      "request.json",
      "assertions.json",
      "environment.json",
    ]);
    expect(JSON.parse(files["case.json"])).toMatchObject({
      id: "case-1",
      kind: "contract",
      tags: ["integration"],
    });
    expect(JSON.parse(files["execution.json"])).toMatchObject({
      timeoutMs: 30_000,
      retries: 1,
    });
    expect(JSON.parse(files["request.json"])).toMatchObject({
      functionId: "function-1",
    });
    expect(JSON.parse(files["assertions.json"])).toHaveLength(1);
    expect(JSON.parse(files["environment.json"])).toEqual({
      env: { NODE_ENV: "test" },
      secretRefs: ["API_TOKEN"],
    });
  });

  it("applies a valid file without disturbing properties owned by other files", () => {
    const result = applyTestCaseCodeFile(
      testCase,
      "execution.json",
      JSON.stringify({
        command: "npm test",
        workingDirectory: "packages/api",
        timeoutMs: 45_000,
        retries: 2,
        agentId: "agent-1",
      }),
    );

    expect(result.error).toBe("");
    expect(result.testCase).toMatchObject({
      id: "case-1",
      request: testCase.request,
      command: "npm test",
      workingDirectory: "packages/api",
      timeoutMs: 45_000,
      retries: 2,
      agentId: "agent-1",
    });
  });

  it("rejects invalid file shapes without mutating the case", () => {
    const result = applyTestCaseCodeFile(
      testCase,
      "environment.json",
      JSON.stringify({ env: { PORT: 4177 }, secretRefs: [] }),
    );

    expect(result.testCase).toBeNull();
    expect(result.error).toBe("environment.json: every env value must be a string.");
    expect(testCase.env).toEqual({ NODE_ENV: "test" });
  });
});
