// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InferenceOverviewPage } from "./inference-overview-page.js";

const CONTROLS_PORTAL_ID = "inference-overview-test-controls";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("InferenceOverviewPage", () => {
  it("uses the shared hero, cards, overview shell, and endpoint table", async () => {
    const user = userEvent.setup();
    const onOpenEndpoint = vi.fn();
    const onConfigureEndpoint = vi.fn(() => true);
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <InferenceOverviewPage
        endpoints={{
          defaultEndpointId: "organization-inference-endpoint",
          endpoints: [{
            id: "organization-inference-endpoint",
            name: "Primary Inference",
            enabled: true,
            providerType: "openai-compatible",
            baseUrl: "https://models.example.com/v1",
            availableModels: ["primary-model"],
            healthStatus: "healthy",
          }],
        }}
        localRunners={{
          status: "ready",
          devices: [{
            id: "runner-1",
            name: "Studio",
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
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpenEndpoint={onOpenEndpoint}
        onConfigureEndpoint={onConfigureEndpoint}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-inference")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Route models through your infrastructure" })).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Inference endpoints" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.getByText("All Endpoints")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search endpoints")).not.toBeNull();

    await user.click(await screen.findByRole("button", { name: "New Endpoint" }));
    expect(onConfigureEndpoint).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "New Inference Endpoint" })).not.toBeNull();
    expect(document.querySelector(".platform-modal-surface")).not.toBeNull();

    await user.type(screen.getByLabelText("Name"), "Production GPU");
    await user.type(
      screen.getByLabelText("Endpoint URL"),
      "https://models.example.com/v1/",
    );
    await user.click(screen.getByRole("button", { name: "Add Endpoint" }));

    expect(onConfigureEndpoint).toHaveBeenCalledWith({
      name: "Production GPU",
      providerType: "openai-compatible",
      baseUrl: "https://models.example.com/v1",
      apiKey: "",
      isDefault: false,
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "New Inference Endpoint" })).toBeNull();
    });

    await user.click(screen.getByText("Primary Inference"));
    expect(onOpenEndpoint).toHaveBeenCalledWith("organization-inference-endpoint");
  });

  it("shows the fixed appliance model as a local read-only endpoint", async () => {
    const user = userEvent.setup();
    const onOpenEndpoint = vi.fn();

    render(
      <InferenceOverviewPage
        endpoints={{ endpoints: [] }}
        localRunners={{ status: "ready", devices: [] }}
        deploymentProfile={{
          profileId: "dgx-spark-appliance-v1",
          topology: "on_prem",
          capabilities: { localInference: true },
          product: {
            inference: {
              mode: "deployment_fixed",
              fixedModelId: "deepseek-v4-flash",
            },
          },
        }}
        onOpenEndpoint={onOpenEndpoint}
        onConfigureEndpoint={vi.fn()}
      />,
    );

    expect(screen.getByText("Local Appliance Inference")).not.toBeNull();
    expect(screen.getByText("OpenAI-Compatible")).not.toBeNull();
    expect(screen.getByText("Active")).not.toBeNull();
    expect(screen.getByText("Appliance · Default")).not.toBeNull();

    await user.click(screen.getByText("Local Appliance Inference"));
    expect(onOpenEndpoint).toHaveBeenCalledWith("deployment-inference-endpoint");
  });
});
