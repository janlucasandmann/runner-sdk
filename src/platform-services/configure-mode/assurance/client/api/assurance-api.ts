import type {
  AssuranceEvidenceReferences,
  AssurancePolicy,
  AssurancePolicyCreateInput,
  AssurancePolicyVersion,
  AssuranceRun,
  AssuranceRunCreateInput,
  AssuranceWorkspaceOption,
} from "../domain/index.js";

export class AssuranceApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AssuranceApiError";
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
    throw new AssuranceApiError(
      String(source.message || source.error || fallback),
      response.status,
    );
  }
  return payload as T;
}

export class AssuranceApi {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;

  constructor(baseUrl: string, headers: Readonly<Record<string, string>> = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.headers = headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    fallback = "Assurance request failed.",
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new AssuranceApiError("Assurance backend is unavailable.", 503);
    }
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

  async listPolicies(): Promise<AssurancePolicy[]> {
    const payload = await this.request<{
      assurancePolicies?: AssurancePolicy[];
      data?: AssurancePolicy[];
    }>("/assurance/policies?limit=500", {}, "Failed to load Assurance Policies.");
    return Array.isArray(payload.assurancePolicies)
      ? payload.assurancePolicies
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async listRuns(): Promise<AssuranceRun[]> {
    const payload = await this.request<{
      assuranceRuns?: AssuranceRun[];
      data?: AssuranceRun[];
    }>("/assurance/runs?limit=500", {}, "Failed to load Assurance Runs.");
    return Array.isArray(payload.assuranceRuns)
      ? payload.assuranceRuns
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async getPolicy(id: string): Promise<AssurancePolicy> {
    const payload = await this.request<{ assurancePolicy: AssurancePolicy }>(
      `/assurance/policies/${encodeURIComponent(id)}`,
      {},
      "Failed to load the Assurance Policy.",
    );
    return payload.assurancePolicy;
  }

  async getRun(id: string): Promise<{
    assuranceRun: AssuranceRun;
    assurancePolicy: AssurancePolicy;
  }> {
    return this.request(
      `/assurance/runs/${encodeURIComponent(id)}`,
      {},
      "Failed to load the Assurance Run.",
    );
  }

  async createPolicy(input: AssurancePolicyCreateInput): Promise<AssurancePolicy> {
    const payload = await this.request<{ assurancePolicy: AssurancePolicy }>(
      "/assurance/policies",
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the Assurance Policy.",
    );
    return payload.assurancePolicy;
  }

  async updatePolicy(
    id: string,
    input: Partial<AssurancePolicy>,
  ): Promise<AssurancePolicy> {
    const payload = await this.request<{ assurancePolicy: AssurancePolicy }>(
      `/assurance/policies/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      "Failed to update the Assurance Policy.",
    );
    return payload.assurancePolicy;
  }

  async createVersion(
    policyId: string,
    input: {
      label?: string;
      description?: string;
      snapshot?: Record<string, unknown>;
    },
  ): Promise<AssurancePolicyVersion> {
    const payload = await this.request<{ version: AssurancePolicyVersion }>(
      `/assurance/policies/${encodeURIComponent(policyId)}/versions`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the Assurance Policy version.",
    );
    return payload.version;
  }

  async publishVersion(
    policyId: string,
    versionId: string,
  ): Promise<AssurancePolicy> {
    const payload = await this.request<{ assurancePolicy: AssurancePolicy }>(
      `/assurance/policies/${encodeURIComponent(policyId)}/versions/${encodeURIComponent(versionId)}/publish`,
      { method: "POST", body: "{}" },
      "Failed to publish the Assurance Policy version.",
    );
    return payload.assurancePolicy;
  }

  async createRun(
    policyId: string,
    input: AssuranceRunCreateInput,
  ): Promise<AssuranceRun> {
    const payload = await this.request<{ assuranceRun: AssuranceRun }>(
      `/assurance/policies/${encodeURIComponent(policyId)}/runs`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to start the Assurance Run.",
    );
    return payload.assuranceRun;
  }

  async attachEvidence(
    runId: string,
    evidenceReferences: Partial<AssuranceEvidenceReferences>,
    expectedRevision?: number,
  ): Promise<AssuranceRun> {
    const payload = await this.request<{ assuranceRun: AssuranceRun }>(
      `/assurance/runs/${encodeURIComponent(runId)}/evidence`,
      {
        method: "POST",
        body: JSON.stringify({ evidenceReferences, expectedRevision }),
      },
      "Failed to attach Assurance evidence.",
    );
    return payload.assuranceRun;
  }

  async evaluateRun(runId: string): Promise<AssuranceRun> {
    const payload = await this.request<{ assuranceRun: AssuranceRun }>(
      `/assurance/runs/${encodeURIComponent(runId)}/evaluate`,
      { method: "POST", body: "{}" },
      "Failed to evaluate the Assurance Run.",
    );
    return payload.assuranceRun;
  }

  async approveRun(
    runId: string,
    evidenceFingerprint: string,
  ): Promise<AssuranceRun> {
    const payload = await this.request<{ assuranceRun: AssuranceRun }>(
      `/assurance/runs/${encodeURIComponent(runId)}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ evidenceFingerprint }),
      },
      "Failed to approve the Assurance Run.",
    );
    return payload.assuranceRun;
  }

  async cancelRun(runId: string): Promise<AssuranceRun> {
    const payload = await this.request<{ assuranceRun: AssuranceRun }>(
      `/assurance/runs/${encodeURIComponent(runId)}/cancel`,
      { method: "POST", body: "{}" },
      "Failed to cancel the Assurance Run.",
    );
    return payload.assuranceRun;
  }

  async listTestPlans(): Promise<AssuranceWorkspaceOption[]> {
    const payload = await this.request<{
      testPlans?: AssuranceWorkspaceOption[];
      data?: AssuranceWorkspaceOption[];
    }>("/test-plans?limit=500", {}, "Failed to load Test Plans.");
    return Array.isArray(payload.testPlans)
      ? payload.testPlans
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async addTeamShare(
    teamId: string,
    policyId: string,
    metadata: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const payload = await this.request<{ data?: Record<string, unknown> }>(
      `/teams/${encodeURIComponent(teamId)}/resource-shares`,
      {
        method: "POST",
        body: JSON.stringify({
          resourceType: "assurance_policy",
          resourceId: policyId,
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
