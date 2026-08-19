import { describe, expect, it } from "vitest";
import type { InferenceEndpointRow } from "../inference-endpoint-model.js";
import { buildInferenceEndpointAnalytics } from "./inference-endpoint-analytics.js";

const endpoint: InferenceEndpointRow = {
  id: "inference_endpoint_1",
  name: "Studio vLLM",
  description: "Primary coding endpoint",
  kind: "external",
  kindLabel: "External Endpoint",
  providerType: "vllm",
  providerLabel: "vLLM",
  runtimeLabel: "Organization",
  status: "healthy",
  statusLabel: "Healthy",
  statusVariant: "green",
  models: ["qwen-coder"],
  modelCount: 1,
  baseUrl: "https://models.example.test/v1",
  hostLabel: "models.example.test",
  lastCheckedAt: 0,
  lastCheckedLabel: "Never",
  apiKeyConfigured: true,
  lastError: "",
  readOnly: false,
  isDefault: true,
  createdAt: "2026-08-19T08:00:00.000Z",
  updatedAt: "2026-08-19T08:00:00.000Z",
  creatorId: "user-1",
  creatorUserId: "user-1",
  creatorName: "Ada Lovelace",
  creatorEmail: "ada@example.com",
  creatorAvatarUrl: "",
  ownerId: "user-1",
  ownerUserId: "user-1",
  ownerName: "Ada Lovelace",
  ownerEmail: "ada@example.com",
  ownerAvatarUrl: "",
  currentVersionId: "inference_endpoint_1:version:1",
  currentVersionNumber: 1,
  publishedVersionId: "",
  versions: [],
  bindings: [],
  searchText: "Studio vLLM",
};

describe("buildInferenceEndpointAnalytics", () => {
  it("attributes token activity through endpoint-scoped external model references", () => {
    const now = new Date("2026-08-19T12:00:00.000Z").getTime();
    const analytics = buildInferenceEndpointAnalytics({
      endpoint,
      timeframe: "week",
      now,
      agents: [{
        id: "agent_1",
        model: "external:inference_endpoint_1:vllm:qwen-coder",
      }],
      threads: [{
        id: "thread_1",
        agentId: "agent_1",
        completedAt: "2026-08-19T10:00:00.000Z",
        inputTokens: 1_200,
        outputTokens: 300,
      }],
    });

    expect(analytics.hasData).toBe(true);
    expect(analytics.metrics.map((metric) => metric.value)).toEqual([
      "1",
      "1.5K",
      "1.2K",
      "300",
    ]);
    expect(analytics.series[0]?.values.reduce((sum, value) => sum + value, 0)).toBe(1_500);
    expect(analytics.series[1]?.values.reduce((sum, value) => sum + value, 0)).toBe(1);
  });

  it("does not mix activity from another inference endpoint", () => {
    const analytics = buildInferenceEndpointAnalytics({
      endpoint,
      timeframe: "month",
      now: new Date("2026-08-19T12:00:00.000Z").getTime(),
      agents: [{
        id: "agent_2",
        model: "external:inference_endpoint_2:vllm:qwen-coder",
      }],
      threads: [{
        agentId: "agent_2",
        completedAt: "2026-08-19T10:00:00.000Z",
        inputTokens: 900,
        outputTokens: 100,
      }],
    });

    expect(analytics.hasData).toBe(false);
    expect(analytics.metrics.map((metric) => metric.value)).toEqual(["0", "0", "0", "0"]);
  });
});
