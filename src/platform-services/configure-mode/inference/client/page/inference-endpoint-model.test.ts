import { describe, expect, it } from "vitest";
import {
  buildInferenceEndpointDraft,
  buildInferenceEndpointRows,
  DEPLOYMENT_INFERENCE_ENDPOINT_ID,
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
          description: "Production inference capacity.",
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
      description: "Production inference capacity.",
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
      description: "",
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

  it("projects the appliance fixed model as a private read-only local endpoint", () => {
    const rows = buildInferenceEndpointRows({ endpoints: [] }, {}, {
      profileId: "dgx-spark-appliance-v1",
      topology: "on_prem",
      capabilities: { localInference: true },
      product: {
        inference: {
          mode: "deployment_fixed",
          fixedModelId: "deepseek-v4-flash",
          deploymentEndpoint: {
            id: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
            name: "Stockifi Appliance Inference",
            principal: {
              type: "appliance",
              id: "appliance:stockifi",
              name: "Stockifi Appliance",
            },
            region: {
              code: "hr-zad-1",
              label: "Zadar, Croatia",
              latitude: 44.1194,
              longitude: 15.2314,
            },
          },
        },
      },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
      name: "Stockifi Appliance Inference",
      kind: "local",
      runtimeLabel: "Appliance",
      statusLabel: "Active",
      models: ["deepseek-v4-flash"],
      hostLabel: "Private appliance endpoint",
      readOnly: true,
      isDefault: true,
      deploymentManaged: true,
      creatorId: "appliance:stockifi",
      creatorName: "Stockifi Appliance",
      ownerId: "appliance:stockifi",
      ownerName: "Stockifi Appliance",
      metadata: {
        deploymentRegion: "hr-zad-1",
        deploymentRegionLabel: "Zadar, Croatia",
        deploymentRegionLatitude: 44.1194,
        deploymentRegionLongitude: 15.2314,
      },
    });
    expect(rows[0]?.baseUrl).toBe("");
  });

  it("keeps signed appliance identity, region, and model authoritative while merging access state", () => {
    const rows = buildInferenceEndpointRows({
      defaultEndpointId: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
      endpoints: [{
        id: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
        name: "Untrusted override",
        creatorId: "user-1",
        creatorName: "User One",
        ownerId: "user-2",
        ownerName: "User Two",
        availableModels: ["untrusted-model"],
        metadata: {
          deploymentRegion: "untrusted-region",
          teamAccess: [{ teamId: "team-1", permissionSetId: "use" }],
        },
        permissionSet: { use: true },
      }],
    }, {}, {
      profileId: "dgx-spark-appliance-v1",
      topology: "on_prem",
      capabilities: { localInference: true },
      product: {
        inference: {
          mode: "deployment_fixed",
          fixedModelId: "deepseek-v4-flash",
          deploymentEndpoint: {
            id: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
            name: "Stockifi Appliance Inference",
            principal: {
              type: "appliance",
              id: "appliance:stockifi",
              name: "Stockifi Appliance",
            },
            region: {
              code: "hr-zad-1",
              label: "Zadar, Croatia",
              latitude: 44.1194,
              longitude: 15.2314,
            },
          },
        },
      },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: "Stockifi Appliance Inference",
      models: ["deepseek-v4-flash"],
      creatorId: "appliance:stockifi",
      creatorName: "Stockifi Appliance",
      ownerId: "appliance:stockifi",
      ownerName: "Stockifi Appliance",
      permissionSet: { use: true },
      metadata: {
        deploymentRegion: "hr-zad-1",
        teamAccess: [{ teamId: "team-1", permissionSetId: "use" }],
      },
    });
  });

  it("does not project a deployment endpoint for the cloud catalog profile", () => {
    expect(buildInferenceEndpointRows({ endpoints: [] }, {}, {
      profileId: "cloud-saas-v1",
      topology: "cloud",
      capabilities: { localInference: false },
      product: {
        inference: {
          mode: "managed_catalog",
          fixedModelId: null,
        },
      },
    })).toEqual([]);
  });
});
