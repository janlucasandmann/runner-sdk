// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformGitHubAutomations } from "./platform-github-automations.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("PlatformGitHubAutomations", () => {
  it.each([
    ["project", "project_123"],
    ["organization", "organization_123"],
    ["function", "function_123"],
  ] as const)(
    "loads %s bindings through the shared scoped control plane",
    async (scopeType, scopeId) => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(jsonResponse({ object: "list", data: [], hasMore: false }));

      render(
        <PlatformGitHubAutomations
          apiBaseUrl="https://api.example.test/v1"
          scopeType={scopeType}
          scopeId={scopeId}
          repositoryFullName="computer-agents/platform"
        />,
      );

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const [requestUrl] = fetchMock.mock.calls[0];
      const url = new URL(String(requestUrl));
      expect(url.pathname).toBe("/v1/github/automations/bindings");
      expect(url.searchParams.get("scopeType")).toBe(scopeType);
      expect(url.searchParams.get("scopeId")).toBe(scopeId);
      expect(url.searchParams.get("repositoryFullName")).toBe("computer-agents/platform");
    },
  );

  it("persists organization bindings through the same request shape used by Projects", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ object: "list", data: [], hasMore: false }))
      .mockImplementationOnce(async (_url, init) => {
        const request = JSON.parse(String(init?.body || "{}"));
        return jsonResponse(
          {
            binding: {
              id: "binding_123",
              ...request,
            },
          },
          201,
        );
      });

    render(
      <PlatformGitHubAutomations
        scopeType="organization"
        scopeId="organization_123"
        repositoryFullName="computer-agents/platform"
      />,
    );

    const toggle = await screen.findByRole("switch", { name: "Enable Security scans" });
    await waitFor(() => expect((toggle as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(toggle);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [, request] = fetchMock.mock.calls[1];
    const body = JSON.parse(String(request?.body || "{}"));
    expect(body).toMatchObject({
      scopeType: "organization",
      scopeId: "organization_123",
      repositoryFullName: "computer-agents/platform",
      kind: "security_scan",
      enabled: true,
    });
  });

  it("opens each automation modal from a secondary Manage button", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ object: "list", data: [], hasMore: false }),
    );

    render(
      <PlatformGitHubAutomations
        scopeType="project"
        scopeId="project_123"
        repositoryFullName="computer-agents/platform"
      />,
    );

    const securityManage = await screen.findByRole("button", { name: "Manage Security scans" });
    expect(screen.getByRole("button", { name: "Manage Pull request reviews" })).toBeTruthy();
    fireEvent.click(securityManage);

    expect(screen.getByRole("button", { name: "Save automation" })).toBeTruthy();
    expect(screen.getByText("Protected branch pushed")).toBeTruthy();
  });

  it("adds exact-revision deployment automation only for an opted-in Function surface", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ object: "list", data: [], hasMore: false }),
    );

    render(
      <PlatformGitHubAutomations
        scopeType="function"
        scopeId="function_123"
        repositoryFullName="computer-agents/platform"
        defaultBranch="main"
        automationKinds={["security_scan", "pull_request_review", "deploy_function"]}
        agentOptions={[{ id: "agent_deployer", label: "Deploy Agent" }]}
      />,
    );

    const manageDeployment = await screen.findByRole("button", {
      name: "Manage Function deployments",
    });
    fireEvent.click(manageDeployment);

    expect(screen.getByText("Pull request merged")).toBeTruthy();
    expect(screen.getByText("Branch pushed")).toBeTruthy();
    expect(screen.getByDisplayValue("main")).toBeTruthy();
    expect(screen.getByText("Deployment Agent")).toBeTruthy();
  });
});
