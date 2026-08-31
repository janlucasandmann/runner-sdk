import type {
  TestPlan,
  TestPlanOverviewSummary,
  TestPlanCreateInput,
  TestPlanVersion,
  TestRun,
  TestRunCreateInput,
  TestPreviewRunCreateInput,
  TestImportRunCreateInput,
  TestCapabilities,
  TestCaseDefinition,
  TestTargetType,
  TestWorkspaceResourceOption,
} from "../domain/index.js";
import { getTestWorkspaceResourceProjectIds } from "../domain/index.js";

export interface TestPlanListPage {
  plans: TestPlanOverviewSummary[];
  hasMore: boolean;
  nextOffset: number;
}

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

function resourceArray(payload: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  const source = asRecord(payload);
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  return [];
}

function finiteCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : null;
}

function normalizePlanOverviewSummary(value: unknown): TestPlanOverviewSummary | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const definition = asRecord(source.definition);
  const cases = Array.isArray(definition.cases) ? definition.cases : [];
  const id = String(source.id || "").trim();
  if (!id) return null;
  const caseCount = finiteCount(
    source.caseCount
    ?? source.case_count
    ?? metadata.overviewCaseCount
    ?? metadata.overview_case_count,
  );
  const runCount = finiteCount(
    source.runCount
    ?? source.run_count
    ?? metadata.overviewRunCount
    ?? metadata.overview_run_count,
  );
  const passedRunCount = finiteCount(
    source.passedRunCount
    ?? source.passed_run_count
    ?? metadata.overviewPassedRunCount
    ?? metadata.overview_passed_run_count,
  );
  const lastRunStatus = String(
    source.lastRunStatus
    ?? source.last_run_status
    ?? metadata.overviewLastRunStatus
    ?? metadata.overview_last_run_status
    ?? "",
  ).trim();
  return {
    id,
    projectId: String(source.projectId ?? source.project_id ?? "").trim() || null,
    name: String(source.name || "Untitled Test").trim(),
    description: String(source.description || "").trim(),
    targetType: String(
      source.targetType ?? source.target_type ?? "project",
    ).trim() as TestTargetType,
    targetId: String(source.targetId ?? source.target_id ?? "").trim() || null,
    defaultEnvironmentId: String(
      source.defaultEnvironmentId ?? source.default_environment_id ?? "",
    ).trim() || null,
    caseCount: caseCount ?? cases.filter((testCase) => (
      asRecord(testCase).enabled !== false
    )).length,
    publishedVersionId: String(
      source.publishedVersionId ?? source.published_version_id ?? "",
    ).trim() || null,
    metadata: Object.keys(metadata).length ? metadata : null,
    createdAt: String(source.createdAt ?? source.created_at ?? ""),
    updatedAt: String(source.updatedAt ?? source.updated_at ?? ""),
    overviewSummaryVersion: finiteCount(
      source.overviewSummaryVersion
      ?? source.overview_summary_version
      ?? metadata.overviewSummaryVersion
      ?? metadata.overview_summary_version,
    ) ?? 0,
    runCount,
    passedRunCount,
    lastRunStatus: lastRunStatus
      ? lastRunStatus as TestPlanOverviewSummary["lastRunStatus"]
      : null,
  };
}

function normalizeResourceOptions(
  payload: unknown,
  keys: readonly string[],
  fallbackLabel: string,
): TestWorkspaceResourceOption[] {
  return resourceArray(payload, keys).flatMap((value): TestWorkspaceResourceOption[] => {
    const source = asRecord(value);
    const metadata = asRecord(source.metadata);
    const projectIds = getTestWorkspaceResourceProjectIds(source);
    const id = String(
      source.id
      || source.value
      || source.serverId
      || source.functionId
      || source.workflowId
      || source.versionId
      || "",
    ).trim();
    if (!id) return [];
    const ordinal = Number(source.version || source.versionNumber || source.number || 0);
    return [{
      id,
      name: String(
        source.name
        || source.title
        || source.label
        || metadata.name
        || (ordinal > 0 ? `Version ${ordinal}` : `${fallbackLabel} ${id.slice(-6)}`),
      ).trim(),
      description: String(
        source.description
        || metadata.description
        || (ordinal > 0 ? `Immutable version ${ordinal}` : ""),
      ).trim(),
      ...(projectIds.length ? { projectIds } : {}),
    }];
  });
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

  private async listWorkspaceResources(
    path: string,
    query: URLSearchParams,
    keys: readonly string[],
    fallbackLabel: string,
    fallbackMessage: string,
  ): Promise<TestWorkspaceResourceOption[]> {
    const limit = 200;
    const resources = new Map<string, TestWorkspaceResourceOption>();
    let offset = 0;
    for (let page = 0; page < 50; page += 1) {
      const pageQuery = new URLSearchParams(query);
      pageQuery.set("limit", String(limit));
      pageQuery.set("offset", String(offset));
      const payload = await this.request<unknown>(
        `${path}?${pageQuery.toString()}`,
        {},
        fallbackMessage,
      );
      const rawResources = resourceArray(payload, keys);
      for (const resource of normalizeResourceOptions(payload, keys, fallbackLabel)) {
        resources.set(resource.id, resource);
      }
      const source = asRecord(payload);
      const hasMore = source.hasMore === true || source.has_more === true;
      if (!hasMore || rawResources.length === 0) break;
      offset += rawResources.length;
    }
    return Array.from(resources.values());
  }

  async listPlanPage(offset = 0, limit = 20): Promise<TestPlanListPage> {
    const normalizedOffset = Math.max(0, Math.trunc(Number(offset) || 0));
    const normalizedLimit = Math.max(1, Math.trunc(Number(limit) || 20));
    const query = new URLSearchParams({
      view: "summary",
      offset: String(normalizedOffset),
      limit: String(normalizedLimit),
    });
    const payload = await this.request<{
      testPlans?: unknown[];
      data?: unknown[];
      hasMore?: boolean;
      has_more?: boolean;
      nextOffset?: number;
      next_offset?: number;
    }>(`/test-plans?${query.toString()}`, {}, "Failed to load test plans.");
    const rawPlans = Array.isArray(payload.testPlans)
      ? payload.testPlans
      : Array.isArray(payload.data)
        ? payload.data
        : [];
    const plans = rawPlans
      .map(normalizePlanOverviewSummary)
      .filter((plan): plan is TestPlanOverviewSummary => Boolean(plan));
    const rawHasMore = payload.hasMore ?? payload.has_more;
    const rawNextOffset = Number(payload.nextOffset ?? payload.next_offset);
    return {
      plans,
      hasMore: typeof rawHasMore === "boolean"
        ? rawHasMore
        : rawPlans.length >= normalizedLimit,
      nextOffset: Number.isFinite(rawNextOffset) && rawNextOffset > normalizedOffset
        ? rawNextOffset
        : normalizedOffset + rawPlans.length,
    };
  }

  async listPlans(): Promise<TestPlanOverviewSummary[]> {
    return (await this.listPlanPage()).plans;
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

  getCapabilities(): Promise<TestCapabilities> {
    return this.request<TestCapabilities>(
      "/tests/capabilities",
      {},
      "Failed to load Test capabilities.",
    );
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

  async listScenarios(id: string): Promise<TestCaseDefinition[]> {
    const payload = await this.request<{
      data?: TestCaseDefinition[];
      scenarios?: TestCaseDefinition[];
      testCases?: TestCaseDefinition[];
    }>(
      `/tests/${encodeURIComponent(id)}/scenarios`,
      {},
      "Failed to load Test scenarios.",
    );
    return payload.data ?? payload.scenarios ?? payload.testCases ?? [];
  }

  async createScenario(
    id: string,
    input: Partial<TestCaseDefinition> & { name: string; position?: number },
  ): Promise<TestCaseDefinition> {
    const payload = await this.request<{
      scenario?: TestCaseDefinition;
      testCase?: TestCaseDefinition;
    }>(
      `/tests/${encodeURIComponent(id)}/scenarios`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the Test scenario.",
    );
    return payload.scenario ?? payload.testCase as TestCaseDefinition;
  }

  async updateScenario(
    id: string,
    scenarioId: string,
    input: Partial<TestCaseDefinition> & {
      expectedUpdatedAt?: string;
      position?: number;
    },
  ): Promise<TestCaseDefinition> {
    const payload = await this.request<{
      scenario?: TestCaseDefinition;
      testCase?: TestCaseDefinition;
    }>(
      `/tests/${encodeURIComponent(id)}/scenarios/${encodeURIComponent(scenarioId)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      "Failed to update the Test scenario.",
    );
    return payload.scenario ?? payload.testCase as TestCaseDefinition;
  }

  async deleteScenario(
    id: string,
    scenarioId: string,
    expectedUpdatedAt?: string,
  ): Promise<void> {
    await this.request(
      `/tests/${encodeURIComponent(id)}/scenarios/${encodeURIComponent(scenarioId)}`,
      {
        method: "DELETE",
        body: expectedUpdatedAt
          ? JSON.stringify({ expectedUpdatedAt })
          : undefined,
      },
      "Failed to delete the Test scenario.",
    );
  }

  async reorderScenarios(
    id: string,
    scenarioIds: string[],
    expectedUpdatedAt?: string,
  ): Promise<TestCaseDefinition[]> {
    const payload = await this.request<{
      data?: TestCaseDefinition[];
      scenarios?: TestCaseDefinition[];
    }>(
      `/tests/${encodeURIComponent(id)}/scenarios/reorder`,
      {
        method: "POST",
        body: JSON.stringify({ scenarioIds, expectedUpdatedAt }),
      },
      "Failed to reorder Test scenarios.",
    );
    return payload.data ?? payload.scenarios ?? [];
  }

  async listFunctions(_projectId = ""): Promise<TestWorkspaceResourceOption[]> {
    // A Test's project is organizational context, not an ownership boundary for
    // deployable Functions. Load every Function the caller can use so valid
    // organization resources never disappear from the target selector.
    return this.listWorkspaceResources(
      "/servers",
      new URLSearchParams({ kind: "function" }),
      ["servers", "serverResources", "functions", "data", "items", "results"],
      "Function",
      "Failed to load Functions.",
    );
  }

  async listMetronomes(_projectId = ""): Promise<TestWorkspaceResourceOption[]> {
    return this.listWorkspaceResources(
      "/metronomes",
      new URLSearchParams(),
      ["metronomes", "workflows", "data", "items", "results"],
      "Workflow",
      "Failed to load Metronome workflows.",
    );
  }

  async listMetronomeVersions(workflowId: string): Promise<TestWorkspaceResourceOption[]> {
    const normalizedId = workflowId.trim();
    if (!normalizedId) return [];
    const payload = await this.request<unknown>(
      `/metronomes/${encodeURIComponent(normalizedId)}/versions`,
      {},
      "Failed to load workflow versions.",
    );
    return normalizeResourceOptions(
      payload,
      ["versions", "data", "items", "results"],
      "Version",
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

  async listOrganizationMembers(organizationId: string): Promise<unknown[]> {
    const normalizedOrganizationId = String(organizationId || "").trim();
    if (!normalizedOrganizationId) return [];
    const payload = await this.request<unknown>(
      `/organizations/${encodeURIComponent(normalizedOrganizationId)}/members`
        + "?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
      {},
      "Failed to load organization members.",
    );
    if (Array.isArray(payload)) return payload;
    const source = asRecord(payload);
    if (Array.isArray(source.data)) return source.data;
    const nestedData = asRecord(source.data);
    if (Array.isArray(nestedData.members)) return nestedData.members;
    if (Array.isArray(nestedData.organizationMembers)) return nestedData.organizationMembers;
    if (Array.isArray(nestedData.organization_members)) return nestedData.organization_members;
    if (Array.isArray(source.members)) return source.members;
    if (Array.isArray(source.organizationMembers)) return source.organizationMembers;
    if (Array.isArray(source.organization_members)) return source.organization_members;
    return [];
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

  async createPreviewRun(
    testId: string,
    input: TestPreviewRunCreateInput,
  ): Promise<TestRun> {
    const payload = await this.request<{ testRun: TestRun }>(
      `/tests/${encodeURIComponent(testId)}/preview-runs`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to try the Test scenarios.",
    );
    return payload.testRun;
  }

  async cancelRun(runId: string): Promise<TestRun> {
    const payload = await this.request<{ testRun: TestRun }>(
      `/tests/runs/${encodeURIComponent(runId)}/cancel`,
      { method: "POST", body: "{}" },
      "Failed to cancel the Test run.",
    );
    return payload.testRun;
  }

  async importRun(
    testId: string,
    input: TestImportRunCreateInput,
  ): Promise<TestRun> {
    const payload = await this.request<{ testRun: TestRun }>(
      `/tests/${encodeURIComponent(testId)}/import-runs`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to import the Test report.",
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
