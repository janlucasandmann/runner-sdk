// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunnerFunctionGithubConnectorSettings } from "./function-github-connector-settings.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RunnerFunctionGithubConnectorSettings", () => {
  it("reuses repository policy and automation components for Function scope", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ object: "list", data: [], hasMore: false }),
    } as unknown as Response);

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
      />,
    );

    expect(screen.getByRole("heading", { name: "Connectors" })).toBeTruthy();
    expect(screen.getByText("GitHub")).toBeTruthy();
    expect(screen.getByText("computer-agents/platform")).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Manage Function deployments" })).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const requestUrl = new URL(String(fetchMock.mock.calls[0][0]), "https://example.test");
    expect(requestUrl.searchParams.get("scopeType")).toBe("function");
    expect(requestUrl.searchParams.get("scopeId")).toBe("function_123");
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

    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
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
