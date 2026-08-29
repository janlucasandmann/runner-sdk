// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEPLOYMENT_INFERENCE_ENDPOINT_ID,
  ORGANIZATION_INFERENCE_ENDPOINT_ID,
} from "../inference-endpoint-model.js";
import { InferenceEndpointDetailPage } from "./inference-endpoint-detail-page.js";

afterEach(cleanup);

describe("InferenceEndpointDetailPage", () => {
  it("uses the shared detail shell and manages an external endpoint", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onSettingsChange = vi.fn();
    const onAddModels = vi.fn(() => true);
    const onTestConnection = vi.fn();
    const onAnalyticsTimeframeChange = vi.fn();
    const onOpenSaveDialog = vi.fn();
    const onAccessMetadataChange = vi.fn(async () => undefined);
    const onAddTeamShare = vi.fn(async () => ({ id: "share-1" }));

    const props = {
      endpointId: ORGANIZATION_INFERENCE_ENDPOINT_ID,
      endpoints: {
          defaultEndpointId: ORGANIZATION_INFERENCE_ENDPOINT_ID,
          endpoints: [{
            id: ORGANIZATION_INFERENCE_ENDPOINT_ID,
            name: "Organization Inference",
            description: "Primary endpoint for production inference.",
            enabled: true,
            providerType: "vllm",
            baseUrl: "https://models.example.com/v1",
            availableModels: ["qwen-coder"],
            healthStatus: "healthy",
            apiKeyConfigured: true,
            updatedAt: "2026-08-19T08:00:00.000Z",
            creatorUserId: "user-1",
            creatorName: "Ada Lovelace",
            creatorEmail: "ada@example.com",
            ownerUserId: "user-1",
            ownerName: "Ada Lovelace",
            ownerEmail: "ada@example.com",
            metadata: { storageRegion: "europe-west1" },
            currentVersionId: `${ORGANIZATION_INFERENCE_ENDPOINT_ID}:version:1`,
            currentVersionNumber: 1,
            publishedVersionId: "",
            versions: [{
              id: `${ORGANIZATION_INFERENCE_ENDPOINT_ID}:version:1`,
              number: 1,
              versionNumber: 1,
              label: "v1",
              description: "Initial version",
              status: "saved",
              snapshot: {
                name: "Organization Inference",
                description: "Primary endpoint for production inference.",
                enabled: true,
                providerType: "vllm",
                baseUrl: "https://models.example.com/v1",
                defaultModel: "",
                availableModels: ["qwen-coder"],
              },
              createdAt: "2026-08-19T08:00:00.000Z",
              updatedAt: "2026-08-19T08:00:00.000Z",
              publishedAt: null,
            }],
          }],
        },
      settings: {
          name: "Organization Inference",
          description: "Primary endpoint for production inference.",
          enabled: true,
          providerType: "vllm",
          baseUrl: "https://models.example.com/v1",
          availableModels: ["qwen-coder"],
          healthStatus: "healthy",
          apiKeyConfigured: true,
          currentVersionId: `${ORGANIZATION_INFERENCE_ENDPOINT_ID}:version:1`,
          currentVersionNumber: 1,
        },
      localRunners: { status: "ready", devices: [], bindings: [] },
      apiKeyValue: "sk-example...",
      apiKeyConfigured: true,
      currentUser: {
        id: "user-1",
        userId: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
      onBack,
      onSettingsChange,
      onRemoveSavedApiKey: vi.fn(),
      onAddModels,
      onRemoveModel: vi.fn(),
      onTestConnection,
      onAnalyticsTimeframeChange,
      selectedVersionId: `${ORGANIZATION_INFERENCE_ENDPOINT_ID}:version:1`,
      onOpenSaveDialog,
      onVersionHistoryOpenChange: vi.fn(),
      onVersionSelect: vi.fn(),
      onVersionPublish: vi.fn(),
      onCloseSaveDialog: vi.fn(),
      onSaveVersion: vi.fn(),
      onRevertChanges: vi.fn(),
      onRemoveEndpoint: vi.fn(),
      onOwnerCandidatesRequest: vi.fn(async () => []),
      onOwnerTransfer: vi.fn(),
      workspaceTeams: [{ id: "team-1", name: "Research", role: "admin" }],
      onAccessMetadataChange,
      onAddTeamShare,
      onRemoveTeamShare: vi.fn(async () => undefined),
    } as const;

    const { container, rerender } = render(
      <InferenceEndpointDetailPage {...props} activeTab="general" />,
    );

    const page = container.querySelector("[data-resource-detail-page='true']");
    expect(page).not.toBeNull();
    expect(page?.classList.contains("is-headerless")).toBe(true);
    expect(page?.classList.contains("is-tabless")).toBe(true);
    expect(container.querySelector("[data-platform-detail-sidebar='true']")).not.toBeNull();
    expect(container.querySelectorAll(".platform-service-detail-page__sidebar-card")).toHaveLength(1);
    expect(screen.queryByRole("tab")).toBeNull();
    const nameInput = screen.getByRole("textbox", { name: "Inference endpoint name" });
    const descriptionInput = screen.getByRole("textbox", {
      name: "Inference endpoint description",
    });
    expect((nameInput as HTMLInputElement).value).toBe("Organization Inference");
    expect((descriptionInput as HTMLInputElement).value).toBe(
      "Primary endpoint for production inference.",
    );
    fireEvent.change(nameInput, { target: { value: "Production GPU" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Runs the production model catalog." },
    });
    expect(onSettingsChange).toHaveBeenCalledWith({ name: "Production GPU" });
    expect(onSettingsChange).toHaveBeenCalledWith({
      description: "Runs the production model catalog.",
    });
    expect(container.querySelector("#inference-endpoint-name")).toBeNull();
    expect(screen.getByRole("region", { name: "Inference endpoint activity" })).not.toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Inference activity time frame" })).not.toBeNull();
    await user.click(screen.getByRole("radio", { name: "24H" }));
    expect(onAnalyticsTimeframeChange).toHaveBeenCalledWith("day");
    expect(screen.getByDisplayValue("https://models.example.com/v1")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Inference provider" })).not.toBeNull();
    const apiKeyInput = screen.getByLabelText("API Key");
    expect(apiKeyInput.closest(".inference-endpoint-detail__input-shell")?.classList)
      .toContain("inference-endpoint-detail__settings-control");
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull();
    const endpointConfigurationSection = screen
      .getByRole("heading", { name: "Endpoint Configuration" })
      .closest("section");
    expect(endpointConfigurationSection?.classList).toContain(
      "inference-endpoint-detail__configuration-section",
    );
    expect(endpointConfigurationSection?.querySelectorAll(
      ".platform-service-detail-page__property",
    )).toHaveLength(3);
    expect(endpointConfigurationSection?.querySelector(
      ".platform-settings-section__icon",
    )).toBeNull();
    expect(screen.getByRole("button", { name: "Inference provider" })
      .closest(".platform-selector")?.classList).toContain("is-align-end");
    expect(screen.queryByRole("heading", { name: "Health" })).toBeNull();
    const modelsTable = screen.getByRole("table", { name: "Inference endpoint models" });
    const modelsSurface = modelsTable.closest(".platform-resource-access-table");
    expect(modelsSurface).not.toBeNull();
    expect(screen.getByText("Available Models")).not.toBeNull();
    expect(
      (modelsSurface as Node).compareDocumentPosition(endpointConfigurationSection as Node)
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Add Model" }));
    const modelModal = screen.getByRole("dialog", { name: "Add Model" });
    await user.type(within(modelModal).getByLabelText("Model name"), "new-model");
    await user.click(within(modelModal).getByRole("button", { name: "Add Model" }));
    expect(onAddModels).toHaveBeenCalledWith("new-model");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Add Model" })).toBeNull();
    });
    expect(screen.getByText("Creator")).not.toBeNull();
    expect(screen.getByText("Owner")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Choose inference endpoint owner" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Test Connection" }));
    expect(onTestConnection).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Inference endpoint actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByText("Delete inference endpoint?")).not.toBeNull();

    rerender(<InferenceEndpointDetailPage {...props} activeTab="settings" />);
    expect(screen.getByText("Deployment region")).not.toBeNull();
    expect(screen.getByText("Manage Inference Access")).not.toBeNull();
    expect(screen.queryByText("Available Models")).toBeNull();
    await user.click(screen.getByRole("button", {
      name: "Add teams with inference endpoint access options",
    }));
    await user.click(screen.getByRole("menuitem", { name: "Research Admin" }));
    expect(onAddTeamShare).toHaveBeenCalledOnce();
    expect(onAccessMetadataChange).toHaveBeenCalledOnce();

    expect(onBack).not.toHaveBeenCalled();

    rerender(<InferenceEndpointDetailPage {...props} activeTab="general" dirty />);
    fireEvent.keyDown(window, { key: "s", metaKey: true });
    expect(onOpenSaveDialog).toHaveBeenCalledWith("new");

    rerender(
      <InferenceEndpointDetailPage
        {...props}
        activeTab="general"
        versionsOpen
        versionSaveDialog={{ open: true, initialMode: "new", instanceKey: 1 }}
      />,
    );
    expect(screen.getByText("Version history")).not.toBeNull();
    expect(screen.getByText("Review changes")).not.toBeNull();
    expect(
      container.querySelector("[data-resource-detail-page='true']")?.classList,
    ).toContain("is-sidebar-collapsed");
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

    expect(screen.queryByText("Local Endpoint")).toBeNull();
    expect(screen.getByText("studio.local")).not.toBeNull();
    expect(screen.queryByDisplayValue("https://models.example.com/v1")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.getByText("Available Models")).not.toBeNull();
    expect(screen.queryByText("Local Runtime")).toBeNull();
    expect(screen.queryByText("Workspace Bindings")).toBeNull();
  });

  it("renders the deployment-managed endpoint in Zadar with immutable appliance ownership", () => {
    const props = {
      endpointId: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
      endpoints: {
        defaultEndpointId: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
        endpoints: [{
          id: DEPLOYMENT_INFERENCE_ENDPOINT_ID,
          permissionSet: { use: true },
          metadata: { sharedTeamIds: ["team-1"] },
          deploymentManaged: true,
        }],
      },
      settings: {},
      localRunners: { status: "ready", devices: [], bindings: [] },
      deploymentProfile: {
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
      },
      onBack: vi.fn(),
      onSettingsChange: vi.fn(),
      onAddModels: vi.fn(),
      onRemoveModel: vi.fn(),
      onTestConnection: vi.fn(),
      onRemoveEndpoint: vi.fn(),
      workspaceTeams: [{ id: "team-1", name: "Research", role: "admin" }],
      onAccessMetadataChange: vi.fn(async () => undefined),
      onAddTeamShare: vi.fn(async () => ({ id: "share-1" })),
      onRemoveTeamShare: vi.fn(async () => undefined),
    } as const;

    const { rerender } = render(
      <InferenceEndpointDetailPage {...props} activeTab="general" />,
    );

    expect(screen.getByDisplayValue("Stockifi Appliance Inference")).not.toBeNull();
    expect(screen.getAllByText("Stockifi Appliance").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("deepseek-v4-flash")).not.toBeNull();
    const ownerControl = screen.queryByRole("button", {
      name: "Choose inference endpoint owner",
    });
    expect(ownerControl == null || (ownerControl as HTMLButtonElement).disabled).toBe(true);

    rerender(<InferenceEndpointDetailPage {...props} activeTab="settings" />);
    expect(screen.getByText("Zadar, Croatia", { exact: false })).not.toBeNull();
    expect(screen.getAllByText("hr-zad-1", { exact: false }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Manage Inference Access")).not.toBeNull();
  });

  it("uses the centralized iconless empty state when no models are configured", () => {
    const { container } = render(
      <InferenceEndpointDetailPage
        endpointId={ORGANIZATION_INFERENCE_ENDPOINT_ID}
        endpoints={{
          endpoints: [{
            id: ORGANIZATION_INFERENCE_ENDPOINT_ID,
            name: "Empty Inference",
            enabled: true,
            providerType: "openai-compatible",
            baseUrl: "https://models.example.com/v1",
            availableModels: [],
          }],
        }}
        settings={{
          name: "Empty Inference",
          enabled: true,
          providerType: "openai-compatible",
          baseUrl: "https://models.example.com/v1",
          availableModels: [],
        }}
        localRunners={{ status: "ready", devices: [], bindings: [] }}
        onBack={vi.fn()}
        onSettingsChange={vi.fn()}
        onAddModels={vi.fn()}
        onRemoveModel={vi.fn()}
        onTestConnection={vi.fn()}
        onRemoveEndpoint={vi.fn()}
      />,
    );

    const emptyState = screen
      .getByText("No models are configured for this endpoint.")
      .closest(".platform-empty-state");
    expect(emptyState).not.toBeNull();
    expect(emptyState?.querySelector(".platform-empty-state__icon")).toBeNull();
    expect(container.querySelector(".inference-endpoint-detail__models-empty-state"))
      .not.toBeNull();
  });
});
