import type {
  TestPlan,
  TestPlanCreateInput,
  TestPlanVersion,
  TestRun,
  TestRunCreateInput,
} from "../domain/index.js";

export class TestsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TestsApiError";
    this.status = status;
  }
}

function normalizeBaseUrl(value: string): string {
  return String(value || "").trim().replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text().catch(() => "");
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { message: raw };
  }
  if (!response.ok) {
    const source = asRecord(payload);
    throw new TestsApiError(
      String(source.message || source.error || fallback),
      response.status,
    );
  }
  return payload as T;
}

export class TestsApi {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;

  constructor(baseUrl: string, headers: Readonly<Record<string, string>> = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.headers = headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    fallback = "Tests request failed.",
  ): Promise<T> {
    if (!this.baseUrl) throw new TestsApiError("Tests backend is unavailable.", 503);
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...options,
      headers: {
        ...this.headers,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    return readResponse<T>(response, fallback);
  }

  async listPlans(): Promise<TestPlan[]> {
    const payload = await this.request<{
      testPlans?: TestPlan[];
      data?: TestPlan[];
    }>("/test-plans?limit=500", {}, "Failed to load test plans.");
    return Array.isArray(payload.testPlans)
      ? payload.testPlans
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async listRuns(): Promise<TestRun[]> {
    const payload = await this.request<{
      testRuns?: TestRun[];
      data?: TestRun[];
    }>("/test-plans/runs?limit=500", {}, "Failed to load test runs.");
    return Array.isArray(payload.testRuns)
      ? payload.testRuns
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async getPlan(id: string): Promise<TestPlan> {
    const payload = await this.request<{ testPlan: TestPlan }>(
      `/test-plans/${encodeURIComponent(id)}`,
      {},
      "Failed to load the test plan.",
    );
    return payload.testPlan;
  }

  async getRun(id: string): Promise<{ testRun: TestRun; testPlan: TestPlan }> {
    return this.request(
      `/test-plans/runs/${encodeURIComponent(id)}`,
      {},
      "Failed to load the test run.",
    );
  }

  async createPlan(input: TestPlanCreateInput): Promise<TestPlan> {
    const payload = await this.request<{ testPlan: TestPlan }>(
      "/test-plans",
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the test plan.",
    );
    return payload.testPlan;
  }

  async updatePlan(id: string, input: Partial<TestPlan>): Promise<TestPlan> {
    const payload = await this.request<{ testPlan: TestPlan }>(
      `/test-plans/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      "Failed to update the test plan.",
    );
    return payload.testPlan;
  }

  async deletePlan(id: string): Promise<void> {
    await this.request(
      `/test-plans/${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Failed to delete the test plan.",
    );
  }

  async createVersion(
    planId: string,
    input: { label?: string; description?: string; snapshot?: Record<string, unknown> } = {},
  ): Promise<TestPlanVersion> {
    const payload = await this.request<{ version: TestPlanVersion }>(
      `/test-plans/${encodeURIComponent(planId)}/versions`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the test-plan version.",
    );
    return payload.version;
  }

  async publishVersion(planId: string, versionId: string): Promise<TestPlan> {
    const payload = await this.request<{ testPlan: TestPlan }>(
      `/test-plans/${encodeURIComponent(planId)}/versions/${encodeURIComponent(versionId)}/publish`,
      { method: "POST", body: "{}" },
      "Failed to publish the test-plan version.",
    );
    return payload.testPlan;
  }

  async createRun(planId: string, input: TestRunCreateInput): Promise<TestRun> {
    const payload = await this.request<{ testRun: TestRun }>(
      `/test-plans/${encodeURIComponent(planId)}/runs`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to start the test run.",
    );
    return payload.testRun;
  }

  async addTeamShare(
    teamId: string,
    planId: string,
    metadata: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const payload = await this.request<{ data?: Record<string, unknown> }>(
      `/teams/${encodeURIComponent(teamId)}/resource-shares`,
      {
        method: "POST",
        body: JSON.stringify({
          resourceType: "test_plan",
          resourceId: planId,
          accessLevel: "use",
          metadata,
        }),
      },
      "Failed to grant team access.",
    );
    return asRecord(payload.data);
  }

  async removeTeamShare(teamId: string, shareId: string): Promise<void> {
    await this.request(
      `/teams/${encodeURIComponent(teamId)}/resource-shares/${encodeURIComponent(shareId)}`,
      { method: "DELETE" },
      "Failed to remove team access.",
    );
  }
}
