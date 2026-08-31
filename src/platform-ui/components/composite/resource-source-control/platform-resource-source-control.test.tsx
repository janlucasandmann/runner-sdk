// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  disconnectPlatformResourceSourceControl,
  PlatformResourceSourceControl,
} from "./platform-resource-source-control.js";

function response(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const binding = {
  id: "binding_1",
  resourceKind: "skill",
  resourceId: "skill_1",
  repositoryFullName: "acme/repository",
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
    createVersionOnMerge: true,
  },
  state: {
    lastSyncAt: "",
    lastStatus: "",
    lastError: "",
  },
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PlatformResourceSourceControl", () => {
  it("creates the canonical safe binding defaults for an attached repository", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [] }))
      .mockResolvedValueOnce(response(binding, 201));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PlatformResourceSourceControl
        apiBaseUrl="/api/real"
        resourceKind="skill"
        resourceId="skill_1"
        repositoryFullName="acme/repository"
      />,
    );

    expect(await screen.findByText("Source synchronization")).not.toBeNull();
    expect(screen.getByText("Push Computer Agents changes to GitHub")).not.toBeNull();
    expect(screen.getByText("Import merged GitHub changes")).not.toBeNull();
    expect(screen.getByText("Create a new version after merge")).not.toBeNull();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [, createInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(String(createInit.body))).toMatchObject({
      resourceKind: "skill",
      resourceId: "skill_1",
      repositoryFullName: "acme/repository",
      direction: "bidirectional",
      conflictPolicy: "fail",
      configuration: {
        inboundTriggers: ["pull_request.merged"],
        outboundTriggers: ["resource.updated"],
        createPullRequests: true,
        forcePush: false,
        createVersionOnMerge: true,
      },
    });
    expect(screen.getByText("Not synchronized yet")).not.toBeNull();
  });

  it("keeps resource lifecycle controls visible when repository setup is required", async () => {
    const openSetupUrl = vi.fn();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [] }))
      .mockResolvedValueOnce(response({
        error: "Install the Computer Agents GitHub App for this repository before enabling synchronization.",
        code: "RESOURCE_SOURCE_CONTROL_REPOSITORY_NOT_CONNECTED",
      }, 409))
      .mockResolvedValueOnce(response({
        installUrl: "https://github.com/apps/computer-agents/installations/new?state=setup_state",
        expiresAt: "2026-08-31T10:00:00.000Z",
      }, 201));
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <PlatformResourceSourceControl
        apiBaseUrl="/api/real"
        resourceKind="skill"
        resourceId="skill_1"
        repositoryFullName="acme/repository"
        openSetupUrl={openSetupUrl}
      />,
    );

    expect(await screen.findByText("Push Computer Agents changes to GitHub")).not.toBeNull();
    expect(screen.getByText("Import merged GitHub changes")).not.toBeNull();
    expect(screen.getByText("Create a new version after merge")).not.toBeNull();
    expect((await screen.findByRole("alert")).textContent).toContain("Connect this repository");
    expect(
      container.querySelector("[data-source-control-status='setup-required']"),
    ).not.toBeNull();
    for (const control of screen.getAllByRole("switch")) {
      expect((control as HTMLButtonElement).disabled).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: "Connect repository" }));
    await waitFor(() => expect(openSetupUrl).toHaveBeenCalledWith(
      "https://github.com/apps/computer-agents/installations/new?state=setup_state",
    ));
    expect(fetchMock.mock.calls[2]?.[0]).toBe("/api/real/github/security/setup");
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toMatchObject({
      redirectPath: expect.stringMatching(/^\//),
    });
  });

  it("retries binding creation after the connected GitHub account is synchronized", async () => {
    const openSetupUrl = vi.fn();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [] }))
      .mockResolvedValueOnce(response({
        error: "Connect a GitHub account with access to this repository before enabling synchronization.",
        code: "RESOURCE_SOURCE_CONTROL_REPOSITORY_NOT_CONNECTED",
      }, 409))
      .mockResolvedValueOnce(response({
        connectionType: "oauth",
        connected: true,
        repositoryCount: 4,
      }))
      .mockResolvedValueOnce(response({ data: [] }))
      .mockResolvedValueOnce(response(binding, 201));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PlatformResourceSourceControl
        apiBaseUrl="/api/real"
        resourceKind="skill"
        resourceId="skill_1"
        repositoryFullName="acme/repository"
        openSetupUrl={openSetupUrl}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Connect repository" }));
    expect(await screen.findByText("Not synchronized yet")).not.toBeNull();
    expect(openSetupUrl).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[4]?.[0]).toBe("/api/real/source-control/bindings");
  });

  it("deletes durable bindings before connector metadata is removed", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [binding] }))
      .mockResolvedValueOnce(response({}, 204));
    vi.stubGlobal("fetch", fetchMock);

    await disconnectPlatformResourceSourceControl({
      apiBaseUrl: "/api/real",
      resourceKind: "skill",
      resourceId: "skill_1",
      requestHeaders: { Authorization: "Bearer test" },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/real/source-control/bindings?resourceKind=skill&resourceId=skill_1",
      { headers: { Authorization: "Bearer test" } },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/real/source-control/bindings/binding_1",
      {
        method: "DELETE",
        headers: { Authorization: "Bearer test" },
      },
    );
  });

  it("persists the visible Computer Agents to GitHub lifecycle policy", async () => {
    const updatedBinding = {
      ...binding,
      configuration: {
        ...binding.configuration,
        outboundTriggers: ["resource.published", "resource.updated"],
      },
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [binding] }))
      .mockResolvedValueOnce(response(updatedBinding));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PlatformResourceSourceControl
        apiBaseUrl="/api/real"
        resourceKind="skill"
        resourceId="skill_1"
        repositoryFullName="acme/repository"
      />,
    );

    fireEvent.click(await screen.findByRole("switch", {
      name: "Push Computer Agents changes to GitHub",
    }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      configuration: {
        outboundTriggers: ["resource.published", "resource.updated"],
        createVersionOnMerge: true,
      },
    });
  });

  it("reconciles repository settings on the first load instead of leaving a stale binding", async () => {
    const staleBinding = {
      ...binding,
      baseBranch: "develop",
      configuration: { ...binding.configuration, branchPrefix: "legacy/" },
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: [staleBinding] }))
      .mockResolvedValueOnce(response(binding));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <PlatformResourceSourceControl
        apiBaseUrl="/api/real"
        resourceKind="skill"
        resourceId="skill_1"
        repositoryFullName="acme/repository"
        baseBranch="main"
        branchPrefix="computer-agents/"
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/real/source-control/bindings/binding_1");
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      baseBranch: "main",
      configuration: { branchPrefix: "computer-agents/" },
    });
  });
});
