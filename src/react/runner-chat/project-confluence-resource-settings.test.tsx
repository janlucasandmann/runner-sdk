// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RunnerKnowledgeConfluenceResourceSettings,
  RunnerProjectConfluenceResourceSettings,
} from "./project-confluence-resource-settings.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RunnerProjectConfluenceResourceSettings", () => {
  it("presents and persists independent Strategy Knowledge sync directions", async () => {
    const onChange = vi.fn();
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: {
          enabled: false,
          syncToConfluence: false,
          syncFromConfluence: false,
          status: "disabled",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: {
          enabled: true,
          syncToConfluence: true,
          syncFromConfluence: false,
          status: "synced",
          documentCount: 2,
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    render(
      <RunnerProjectConfluenceResourceSettings
        organizationId="organization-1"
        projectId="project-1"
        requestHeaders={{ Authorization: "Bearer test" }}
        resourceId="atlassian:confluence-space:cloud-1:space-1"
        resourceName="Product strategy"
        spaceId="space-1"
        cloudId="cloud-1"
        siteUrl="https://example.atlassian.net"
        onChange={onChange}
      />,
    );

    const toConfluenceToggle = await screen.findByRole("switch", {
      name: "Sync Strategy Knowledge to Product strategy",
    });
    const fromConfluenceToggle = screen.getByRole("switch", {
      name: "Sync Product strategy to Strategy Knowledge",
    });
    await waitFor(() => expect(toConfluenceToggle.hasAttribute("disabled")).toBe(false));
    expect(fromConfluenceToggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toConfluenceToggle);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "/api/aios/confluence/strategy-sync?projectId=project-1&spaceId=space-1",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/aios/confluence/strategy-sync");
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      authorization: "Bearer test",
      "x-computer-agents-organization": "organization-1",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      projectId: "project-1",
      spaceId: "space-1",
      spaceName: "Product strategy",
      cloudId: "cloud-1",
      siteUrl: "https://example.atlassian.net",
      enabled: true,
      syncToConfluence: true,
      syncFromConfluence: false,
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith({
      strategyKnowledgeSyncEnabled: true,
      strategyKnowledgeSyncToConfluenceEnabled: true,
      strategyKnowledgeSyncFromConfluenceEnabled: false,
    }));
  });

  it("stops active synchronization before disconnecting a Confluence space", async () => {
    const onDisconnect = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: {
          enabled: true,
          syncToConfluence: true,
          syncFromConfluence: true,
          status: "synced",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: { enabled: false, status: "disabled" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    render(
      <RunnerProjectConfluenceResourceSettings
        projectId="project-1"
        resourceId="space-resource-1"
        resourceName="Product strategy"
        spaceId="space-1"
        cloudId="cloud-1"
        onDisconnect={onDisconnect}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Actions for Product strategy" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect connector" }));

    await waitFor(() => expect(onDisconnect).toHaveBeenCalledOnce());
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      projectId: "project-1",
      spaceId: "space-1",
      enabled: false,
      syncToConfluence: false,
      syncFromConfluence: false,
    });
  });

  it("targets a standalone Knowledge library through the same settings component", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: { enabled: false, status: "disabled" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: {
          enabled: true,
          syncToConfluence: true,
          syncFromConfluence: false,
          status: "synced",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    render(
      <RunnerKnowledgeConfluenceResourceSettings
        libraryId="library-1"
        resourceId="space-resource-1"
        resourceName="Product strategy"
        spaceId="space-1"
        cloudId="cloud-1"
        knowledgeLabel="this Knowledge library"
      />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Sync this Knowledge library to Product strategy",
    });
    await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "libraryId=library-1&spaceId=space-1",
    );
    fireEvent.click(toggle);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      libraryId: "library-1",
      spaceId: "space-1",
      spaceName: "Product strategy",
      cloudId: "cloud-1",
      enabled: true,
      syncToConfluence: true,
      syncFromConfluence: false,
    });
  });

  it("targets a versioned Prompt through the shared document settings component", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: { enabled: false, status: "disabled" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sync: {
          enabled: true,
          syncToConfluence: true,
          syncFromConfluence: false,
          status: "synced",
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));

    render(
      <RunnerKnowledgeConfluenceResourceSettings
        promptId="prompt-1"
        resourceId="space-resource-1"
        resourceName="Prompt space"
        spaceId="space-1"
        cloudId="cloud-1"
        knowledgeLabel="this Prompt"
      />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Sync this Prompt to Prompt space",
    });
    await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "promptId=prompt-1&spaceId=space-1",
    );
    fireEvent.click(toggle);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      promptId: "prompt-1",
      spaceId: "space-1",
      spaceName: "Prompt space",
      cloudId: "cloud-1",
      enabled: true,
      syncToConfluence: true,
      syncFromConfluence: false,
    });
  });
});
