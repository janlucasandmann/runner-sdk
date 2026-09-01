// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RunnerKnowledgeNotionResourceSettings,
  RunnerProjectNotionResourceSettings,
} from "./project-notion-resource-settings.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RunnerProjectNotionResourceSettings", () => {
  it("presents and persists independent Strategy Knowledge sync directions", async () => {
    const onChange = vi.fn();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: false,
              syncToNotion: false,
              syncFromNotion: false,
              status: "disabled",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: false,
              status: "synced",
              documentCount: 2,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    const { container } = render(
      <RunnerProjectNotionResourceSettings
        organizationId="organization-1"
        projectId="project-1"
        requestHeaders={{ Authorization: "Bearer test" }}
        resourceId="database-1"
        resourceName="Product requirements"
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Product requirements")).toBeTruthy();
    expect(screen.queryByText("Database")).toBeNull();
    expect(container.querySelector('[data-project-notion-resource="database-1"]')).toBeTruthy();
    const toNotionToggle = await screen.findByRole("switch", {
      name: "Sync Strategy Knowledge to Product requirements",
    });
    const fromNotionToggle = screen.getByRole("switch", {
      name: "Sync Product requirements to Strategy Knowledge",
    });
    await waitFor(() => expect(toNotionToggle.hasAttribute("disabled")).toBe(false));
    expect(fromNotionToggle.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(toNotionToggle);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/aios/notion/strategy-sync");
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      authorization: "Bearer test",
      "x-computer-agents-organization": "organization-1",
    });
    expect(fetchMock.mock.calls[1]?.[1]?.headers).toMatchObject({
      authorization: "Bearer test",
      "x-computer-agents-organization": "organization-1",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      projectId: "project-1",
      databaseId: "database-1",
      databaseName: "Product requirements",
      enabled: true,
      syncToNotion: true,
      syncFromNotion: false,
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        strategyKnowledgeSyncEnabled: true,
        strategyKnowledgeSyncToNotionEnabled: true,
        strategyKnowledgeSyncFromNotionEnabled: false,
      }),
    );
    expect(screen.queryByText("Synced")).toBeNull();
    expect(screen.queryByText("Off")).toBeNull();
  });

  it("shows the shared loading indicator and locks toggles while synchronization is pending", async () => {
    let resolveUpdate!: (response: Response) => void;
    const updateResponse = new Promise<Response>((resolve) => {
      resolveUpdate = resolve;
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: false,
              status: "synced",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockReturnValueOnce(updateResponse);

    render(
      <RunnerProjectNotionResourceSettings
        projectId="project-1"
        resourceId="database-1"
        resourceName="Product requirements"
      />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Sync Strategy Knowledge to Product requirements",
    });
    await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toggle.hasAttribute("disabled")).toBe(true);
      expect(
        screen.getAllByRole("img", { name: "Synchronizing Product requirements" }),
      ).toHaveLength(2);
    });

    resolveUpdate(
      new Response(
        JSON.stringify({
          sync: {
            enabled: false,
            syncToNotion: false,
            syncFromNotion: false,
            status: "disabled",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await waitFor(() => {
      expect(toggle.hasAttribute("disabled")).toBe(false);
      expect(
        screen.queryAllByRole("img", { name: "Synchronizing Product requirements" }),
      ).toHaveLength(0);
    });
  });

  it("stops active Strategy Knowledge sync before disconnecting the database", async () => {
    const onDisconnect = vi.fn().mockResolvedValue(undefined);
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: true,
              status: "synced",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: false,
              syncToNotion: false,
              syncFromNotion: false,
              status: "disabled",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    render(
      <RunnerProjectNotionResourceSettings
        projectId="project-1"
        resourceId="database-1"
        resourceName="Product requirements"
        onDisconnect={onDisconnect}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Actions for Product requirements" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Disconnect connector" }));

    await waitFor(() => expect(onDisconnect).toHaveBeenCalledOnce());
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      projectId: "project-1",
      databaseId: "database-1",
      enabled: false,
      syncToNotion: false,
      syncFromNotion: false,
    });
  });

  it("targets a standalone Knowledge library through the same settings component", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: { enabled: false, status: "disabled" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: false,
              status: "synced",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    render(
      <RunnerKnowledgeNotionResourceSettings
        libraryId="library-1"
        resourceId="database-1"
        resourceName="Product handbook"
        knowledgeLabel="this Knowledge library"
      />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Sync this Knowledge library to Product handbook",
    });
    await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "libraryId=library-1&databaseId=database-1",
    );
    fireEvent.click(toggle);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      libraryId: "library-1",
      databaseId: "database-1",
      databaseName: "Product handbook",
      enabled: true,
      syncToNotion: true,
      syncFromNotion: false,
    });
  });

  it("targets a versioned Prompt through the shared document settings component", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sync: { enabled: false, status: "disabled" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: false,
              status: "synced",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    render(
      <RunnerKnowledgeNotionResourceSettings
        promptId="prompt-1"
        resourceId="database-1"
        resourceName="Prompt catalog"
        knowledgeLabel="this Prompt"
      />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Sync this Prompt to Prompt catalog",
    });
    await waitFor(() => expect(toggle.hasAttribute("disabled")).toBe(false));
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "promptId=prompt-1&databaseId=database-1",
    );
    fireEvent.click(toggle);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      promptId: "prompt-1",
      databaseId: "database-1",
      databaseName: "Prompt catalog",
      enabled: true,
      syncToNotion: true,
      syncFromNotion: false,
    });
  });
});
