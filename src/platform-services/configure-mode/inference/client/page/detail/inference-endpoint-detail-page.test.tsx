// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ORGANIZATION_INFERENCE_ENDPOINT_ID } from "../inference-endpoint-model.js";
import { InferenceEndpointDetailPage } from "./inference-endpoint-detail-page.js";

afterEach(cleanup);

describe("InferenceEndpointDetailPage", () => {
  it("uses the shared detail shell and manages an external endpoint", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onSettingsChange = vi.fn();
    const onAddModels = vi.fn(() => true);
    const onTestConnection = vi.fn();

    const { container } = render(
      <InferenceEndpointDetailPage
        endpointId={ORGANIZATION_INFERENCE_ENDPOINT_ID}
        endpoints={{
          defaultEndpointId: ORGANIZATION_INFERENCE_ENDPOINT_ID,
          endpoints: [{
            id: ORGANIZATION_INFERENCE_ENDPOINT_ID,
            name: "Organization Inference",
            enabled: true,
            providerType: "vllm",
            baseUrl: "https://models.example.com/v1",
            availableModels: ["qwen-coder"],
            healthStatus: "healthy",
            apiKeyConfigured: true,
          }],
        }}
        settings={{
          enabled: true,
          providerType: "vllm",
          baseUrl: "https://models.example.com/v1",
          availableModels: ["qwen-coder"],
          healthStatus: "healthy",
          apiKeyConfigured: true,
        }}
        localRunners={{ status: "ready", devices: [], bindings: [] }}
        apiKeyValue="sk-example..."
        apiKeyConfigured
        runtimeContent={<div>Runtime management</div>}
        onBack={onBack}
        onSettingsChange={onSettingsChange}
        onAddModels={onAddModels}
        onRemoveModel={vi.fn()}
        onTestConnection={onTestConnection}
        onRemoveEndpoint={vi.fn()}
      />,
    );

    expect(container.querySelector("[data-resource-detail-page='true']")).not.toBeNull();
    expect(container.querySelector("[data-platform-detail-sidebar='true']")).not.toBeNull();
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Models",
      "Runtime",
    ]);
    expect(screen.getByDisplayValue("https://models.example.com/v1")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Inference provider" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Test Connection" }));
    expect(onTestConnection).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("tab", { name: "Models" }));
    await user.type(screen.getByPlaceholderText("gpt-oss-120b, qwen2.5-coder-32b"), "new-model");
    await user.click(screen.getByRole("button", { name: "Add Model" }));
    expect(onAddModels).toHaveBeenCalledWith("new-model");

    await user.click(screen.getByRole("button", { name: "Back to inference endpoints" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("renders local endpoints as read-only runner details", () => {
    render(
      <InferenceEndpointDetailPage
        endpointId="local-inference:runner-1"
        endpoints={{ endpoints: [] }}
        settings={{}}
        localRunners={{
          status: "ready",
          devices: [{
            id: "runner-1",
            name: "Studio",
            hostname: "studio.local",
            platform: "darwin",
            status: "online",
            capabilities: {
              localRuntime: {
                inference: {
                  enabled: true,
                  status: "available",
                  defaultProvider: "ollama",
                  models: ["llama3.3"],
                },
              },
            },
          }],
        }}
        onBack={vi.fn()}
        onSettingsChange={vi.fn()}
        onAddModels={vi.fn()}
        onRemoveModel={vi.fn()}
        onTestConnection={vi.fn()}
        onRemoveEndpoint={vi.fn()}
      />,
    );

    expect(screen.getByText("Studio Inference")).not.toBeNull();
    expect(screen.getAllByText("Local Endpoint")).toHaveLength(2);
    expect(screen.getAllByText("studio.local")).toHaveLength(2);
    expect(screen.queryByDisplayValue("https://models.example.com/v1")).toBeNull();
  });
});
