import { describe, expect, it } from "vitest";
import {
  buildInferenceEndpointDraft,
  buildInferenceEndpointRows,
  ORGANIZATION_INFERENCE_ENDPOINT_ID,
} from "./inference-endpoint-model.js";

describe("inference endpoint model", () => {
  it("normalizes the organization endpoint and enabled local inference runtimes", () => {
    const rows = buildInferenceEndpointRows(
      {
        defaultEndpointId: "inference-primary",
        endpoints: [{
          id: "inference-primary",
          name: "Primary Models",
          enabled: true,
          providerType: "vllm",
          baseUrl: "https://models.example.com/v1",
          availableModels: ["qwen-coder"],
          healthStatus: "healthy",
          lastValidatedAt: "2026-07-19T08:00:00.000Z",
        }],
      },
      {
        devices: [{
          id: "runner-1",
          name: "Studio",
          hostname: "studio.local",
          status: "online",
          lastSeenAt: "2026-07-19T09:00:00.000Z",
          capabilities: {
            localRuntime: {
              inference: {
                enabled: true,
                status: "available",
                defaultProvider: "ollama",
                baseUrlHost: "127.0.0.1:11434",
                models: ["llama3.3"],
              },
            },
          },
        }],
        bindings: [{
          id: "binding-1",
          deviceId: "runner-1",
          environmentId: "environment-1",
        }],
      },
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: "inference-primary",
      name: "Primary Models",
      isDefault: true,
      providerLabel: "vLLM",
      status: "healthy",
      hostLabel: "models.example.com",
      modelCount: 1,
    });
    expect(rows[1]).toMatchObject({
      id: "local-inference:runner-1",
      providerLabel: "Ollama",
      status: "healthy",
      modelCount: 1,
    });
    expect(rows[1]?.bindings).toHaveLength(1);
  });

  it("creates an editable organization draft when no external endpoint exists", () => {
    expect(buildInferenceEndpointRows({ endpoints: [] }, {})).toEqual([]);
    expect(buildInferenceEndpointDraft({ providerType: "custom" })).toMatchObject({
      id: ORGANIZATION_INFERENCE_ENDPOINT_ID,
      name: "New Inference Endpoint",
      providerLabel: "Custom",
      readOnly: false,
    });
  });

  it("renders every configured organization endpoint", () => {
    const rows = buildInferenceEndpointRows({
      defaultEndpointId: "endpoint-a",
      endpoints: [
        {
          id: "endpoint-a",
          name: "Production",
          baseUrl: "https://production.example.com/v1",
        },
        {
          id: "endpoint-b",
          name: "Research",
          baseUrl: "https://research.example.com/v1",
        },
      ],
    }, {});

    expect(rows.map((row) => row.id)).toEqual(["endpoint-a", "endpoint-b"]);
    expect(rows.map((row) => row.name)).toEqual(["Production", "Research"]);
    expect(rows.map((row) => row.isDefault)).toEqual([true, false]);
  });
});
