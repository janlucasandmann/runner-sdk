import type { PlatformApiClient } from "../../../../../platform-runtime/platform-api-client.js";
import type {
  EvidenceDirection,
  EvidenceReviewDecision,
  EvidenceReviewList,
  EvidenceReviewOverview,
  EvidenceReviewTaskDetail,
  EvidenceServiceResource,
} from "../domain/index.js";

function unwrapList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value
    && typeof value === "object"
    && Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }
  if (
    value
    && typeof value === "object"
    && Array.isArray((value as { servers?: unknown }).servers)
  ) {
    return (value as { servers: T[] }).servers;
  }
  return [];
}

function id(value: string, label: string) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return encodeURIComponent(normalized);
}

export interface EvidenceAgentsRepository {
  listServices(signal?: AbortSignal): Promise<EvidenceServiceResource[]>;
  getOverview(serverId: string, signal?: AbortSignal): Promise<EvidenceReviewOverview>;
  listReviews(
    serverId: string,
    input?: { status?: string; query?: string; limit?: number; offset?: number },
    signal?: AbortSignal,
  ): Promise<EvidenceReviewList>;
  getReview(
    serverId: string,
    reviewTaskId: string,
    signal?: AbortSignal,
  ): Promise<EvidenceReviewTaskDetail>;
  approveReview(
    serverId: string,
    reviewTaskId: string,
    input: {
      rationale: string;
      candidate_patch?: {
        normalized_statement?: string;
        direction?: EvidenceDirection;
      };
    },
  ): Promise<EvidenceReviewDecision>;
  rejectReview(
    serverId: string,
    reviewTaskId: string,
    input: { rationale: string },
  ): Promise<EvidenceReviewDecision>;
}

export function createEvidenceAgentsRepository(
  apiClient: Pick<PlatformApiClient, "get" | "post">,
): EvidenceAgentsRepository {
  return Object.freeze({
    async listServices(signal) {
      const resources = unwrapList<EvidenceServiceResource>(
        await apiClient.get("/api/real/servers?kind=function&limit=200", { signal }),
      );
      return resources.filter((resource) => (
        resource.metadata?.useCase === "equal-care"
        && resource.metadata?.service === "full-text-acquisition"
      ));
    },
    getOverview: (serverId, signal) => apiClient.get(
      `/api/real/evidence-agents/${id(serverId, "Evidence service id")}/overview`,
      { signal },
    ),
    listReviews: (serverId, input = {}, signal) => {
      const params = new URLSearchParams();
      params.set("status", input.status || "open,in_review");
      if (input.query) params.set("query", input.query);
      params.set("limit", String(input.limit || 100));
      params.set("offset", String(input.offset || 0));
      return apiClient.get(
        `/api/real/evidence-agents/${id(serverId, "Evidence service id")}/reviews?${params}`,
        { signal },
      );
    },
    getReview: (serverId, reviewTaskId, signal) => apiClient.get(
      `/api/real/evidence-agents/${id(serverId, "Evidence service id")}/reviews/${id(reviewTaskId, "Review task id")}`,
      { signal },
    ),
    approveReview: (serverId, reviewTaskId, input) => apiClient.post(
      `/api/real/evidence-agents/${id(serverId, "Evidence service id")}/reviews/${id(reviewTaskId, "Review task id")}/approve`,
      input,
    ),
    rejectReview: (serverId, reviewTaskId, input) => apiClient.post(
      `/api/real/evidence-agents/${id(serverId, "Evidence service id")}/reviews/${id(reviewTaskId, "Review task id")}/reject`,
      input,
    ),
  });
}
