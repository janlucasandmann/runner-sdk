// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RunnerFunctionGithubConnectorSettings,
  RunnerSourceGithubConnectorSettings,
} from "./function-github-connector-settings.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockConnectorApi(resourceKind: string, resourceId: string, repositoryFullName: string) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input), "https://example.test");
    if (url.pathname.endsWith("/source-control/bindings")) {
      return new Response(JSON.stringify({
        object: "list",
        data: [{
          id: `binding_${resourceId}`,
          resourceKind,
          resourceId,
          repositoryFullName,
          baseBranch: "main",
          rootPath: "",
          direction: "bidirectional",
          conflictPolicy: "fail",
          enabled: true,
          configuration: {
            inboundTriggers: ["pull_request.merged"],
            outboundTriggers: ["resource.published"],
            branchPrefix: "computer-agents/",
            createPullRequests: true,
            forcePush: false,
          },
          state: {},
        }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ object: "list", data: [], hasMore: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}

describe("RunnerFunctionGithubConnectorSettings", () => {
  it("reuses repository policy and automation components for Function scope", async () => {
    const fetchMock = mockConnectorApi("function", "function_123", "computer-agents/platform");
    const onViewAllConnectors = vi.fn();

    render(
      <RunnerFunctionGithubConnectorSettings
        functionId="function_123"
        repository={{
          repoFullName: "computer-agents/platform",
          ref: "main",
          branchPrefix: "computer-agents/",
          createPullRequests: true,
          forcePushCommits: false,
        }}
        github={{ connected: true }}
        automationAgentOptions={[{ id: "agent_deployer", label: "Deploy Agent" }]}
        onRepositoryChange={vi.fn()}
        onViewAllConnectors={onViewAllConnectors}
      />,
    );

    expect(screen.getByRole("heading", { name: "Connectors" })).toBeTruthy();
    expect(screen.getByText("GitHub")).toBeTruthy();
    expect(screen.getByText("GitLab")).toBeTruthy();
    expect(screen.queryByText("Connected")).toBeNull();
    expect(screen.queryByText("Not connected")).toBeNull();
    expect(screen.getAllByText("Automate exact-revision deployments.")).toHaveLength(2);
    expect(screen.getByText("1 Connection")).toBeTruthy();
    expect(screen.getByText("0 Connections")).toBeTruthy();
    const previewCard = screen.getByRole("button", { name: "Open GitHub connector settings" });
    const gitlabPreviewCard = screen.getByRole("button", { name: "Open GitLab connector settings" });
    const previewCardShell = previewCard.closest("[data-platform-connector-preview-card='true']");
    const gitlabPreviewCardShell = gitlabPreviewCard.closest(
      "[data-platform-connector-preview-card='true']",
    );
    expect(previewCardShell).toBeTruthy();
    expect(gitlabPreviewCardShell).toBeTruthy();
    expect(previewCardShell?.parentElement).toBe(gitlabPreviewCardShell?.parentElement);
    expect(
      previewCard.querySelector(".platform-connector-preview-card__media-image")?.getAttribute("src"),
    ).toBe("/img/bg/blur.webp");
    expect(
      gitlabPreviewCard.querySelector(".platform-connector-preview-card__media-image")?.getAttribute("src"),
    ).toBe("/img/bg/blur3.webp");
    expect(document.querySelector(".playground-project-github-repository-settings")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "GitHub actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "View all Connectors" }));
    expect(onViewAllConnectors).toHaveBeenCalledOnce();

    fireEvent.click(previewCard);
    const connectorDialog = await screen.findByRole("dialog", {
      name: "Function connector settings",
    });
    expect(connectorDialog.querySelector("[data-platform-modal-part='sidebar']")).toBeTruthy();
    expect(connectorDialog.querySelector("[data-platform-modal-part='content']")).toBeTruthy();
    expect(
      connectorDialog.querySelectorAll("[data-platform-modal-pane-part='header']"),
    ).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "GitHub" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GitLab" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "computer-agents/platform" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add another repo" })).toBeTruthy();
    const repositorySettings = connectorDialog.querySelector(
      "[data-github-repository-settings-variant='resource']",
    );
    expect(repositorySettings).toBeTruthy();
    expect(repositorySettings?.getAttribute("data-platform-connector-configuration-surface")).toBe(
      "plain",
    );
    expect(
      repositorySettings?.querySelector(".platform-connector-configuration__header"),
    ).toBeNull();
    const synchronizationHeading = await screen.findByRole("heading", {
      name: "Version synchronization",
    });
    const automationsHeading = screen.getByRole("heading", { name: "Automations" });
    const agentBehaviorHeading = screen.getByRole("heading", { name: "Agent Git behavior" });
    const baseBranch = screen.getByText("Base branch");
    expect(
      synchronizationHeading.compareDocumentPosition(baseBranch)
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      synchronizationHeading.compareDocumentPosition(automationsHeading)
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      automationsHeading.compareDocumentPosition(agentBehaviorHeading)
        & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Manage Function deployments" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const automationCall = fetchMock.mock.calls.find(([input]) => String(input).includes("/github/automations/bindings"));
    expect(automationCall).toBeTruthy();
    const requestUrl = new URL(String(automationCall?.[0]), "https://example.test");
    expect(requestUrl.searchParams.get("scopeType")).toBe("function");
    expect(requestUrl.searchParams.get("scopeId")).toBe("function_123");
  });

  it("reuses the same repository policies with Web App-scoped deployment automation", async () => {
    const fetchMock = mockConnectorApi("web_app", "web_app_123", "computer-agents/customer-portal");

    render(
      <RunnerSourceGithubConnectorSettings
        resourceId="web_app_123"
        resourceKind="web_app"
        resourceName="Customer Portal"
        repository={{ repoFullName: "computer-agents/customer-portal", ref: "main" }}
        github={{ connected: true }}
        automationAgentOptions={[{ id: "agent_deployer", label: "Deploy Agent" }]}
        onRepositoryChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Synchronize this Web App with a GitHub or GitLab repository and automate exact-revision deployments.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open GitHub connector settings" }));
    expect(await screen.findByRole("button", { name: "Manage Web App deployments" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const automationCall = fetchMock.mock.calls.find(([input]) => String(input).includes("/github/automations/bindings"));
    expect(automationCall).toBeTruthy();
    const requestUrl = new URL(String(automationCall?.[0]), "https://example.test");
    expect(requestUrl.searchParams.get("scopeType")).toBe("web_app");
    expect(requestUrl.searchParams.get("scopeId")).toBe("web_app_123");
  });

  it("reuses the same repository policies with Skill-scoped update automation", async () => {
    const fetchMock = mockConnectorApi("skill", "skill_123", "computer-agents/release-notes-skill");

    render(
      <RunnerSourceGithubConnectorSettings
        resourceId="skill_123"
        resourceKind="skill"
        resourceName="Release Notes"
        repository={{ repoFullName: "computer-agents/release-notes-skill", ref: "main" }}
        github={{ connected: true }}
        automationAgentOptions={[{ id: "agent_maintainer", label: "Skill Maintainer" }]}
        onRepositoryChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Synchronize this Skill with a GitHub or GitLab repository and automate exact-revision updates.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open GitHub connector settings" }));
    expect(await screen.findByRole("heading", { name: "Version synchronization" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Automations" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Agent Git behavior" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const automationCall = fetchMock.mock.calls.find(([input]) => String(input).includes("/github/automations/bindings"));
    expect(automationCall).toBeTruthy();
    const requestUrl = new URL(String(automationCall?.[0]), "https://example.test");
    expect(requestUrl.searchParams.get("scopeType")).toBe("skill");
    expect(requestUrl.searchParams.get("scopeId")).toBe("skill_123");
  });

  it("opens the GitLab card in the shared connector settings shell", async () => {
    render(
      <RunnerSourceGithubConnectorSettings
        resourceId="skill_gitlab"
        resourceKind="skill"
        resourceName="GitLab Skill"
        github={{ connected: false }}
        onRepositoryChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open GitLab connector settings" }));

    const dialog = await screen.findByRole("dialog", { name: "Skill connector settings" });
    expect(dialog.querySelector("[data-platform-modal-part='sidebar']")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GitHub" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "GitLab" })).toBeTruthy();
    expect(screen.getByText("No repositories connected")).toBeTruthy();
  });

  it("routes View all Connectors through the shell navigation bridge", () => {
    const openConnectors = vi.fn();
    vi.stubGlobal("computerAgentsOpenConnectors", openConnectors);

    render(
      <RunnerSourceGithubConnectorSettings
        resourceId="skill_navigation"
        resourceKind="skill"
        resourceName="Navigation Skill"
        github={{ connected: false }}
        onRepositoryChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "GitHub actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "View all Connectors" }));

    expect(openConnectors).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Skill connector settings" })).toBeNull();
  });

  it("creates, seeds, and connects a repository from the bottom of the Function explorer", async () => {
    const onCreateRepository = vi.fn().mockResolvedValue({
      id: "42",
      name: "billing-function",
      repoFullName: "computer-agents/billing-function",
      ref: "main",
    });
    const onRepositoryChange = vi.fn().mockResolvedValue(undefined);
    const fetchItems = vi.fn().mockResolvedValue([]);

    render(
      <RunnerFunctionGithubConnectorSettings
        functionId="function_billing1234"
        functionName="Billing Function"
        github={{
          connected: true,
          accounts: [{ id: "github-work", name: "Work", isDefault: true }],
          fetchItems,
        }}
        onCreateRepository={onCreateRepository}
        onRepositoryChange={onRepositoryChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open GitHub connector settings" }));
    fireEvent.click(await screen.findByRole("button", { name: "Add another repo" }));
    expect(
      await screen.findByRole("button", { name: "Create repository for this Function" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Create repository for this Function" }));

    await waitFor(() => {
      expect(onCreateRepository).toHaveBeenCalledWith({
        name: "Billing Function",
        accountId: "github-work",
      });
      expect(onRepositoryChange).toHaveBeenCalledWith({
        id: "42",
        name: "billing-function",
        repoFullName: "computer-agents/billing-function",
        ref: "main",
        accountId: "github-work",
        branchPrefix: "computer-agents/",
        createPullRequests: true,
        forcePushCommits: false,
      });
    });
  });
});
