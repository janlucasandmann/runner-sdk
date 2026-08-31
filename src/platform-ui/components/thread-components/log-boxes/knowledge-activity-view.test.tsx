// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunnerLog } from "../../../../types.js";
import { RunnerWorkLogEntry } from "./runner-log-boxes.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Knowledge activity logs", () => {
  it("resolves the library name and opens the immutable library identity", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            library: { id: "knowledge_library_123", name: "Project Research" },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const onKnowledgeLibraryPreviewClick = vi.fn();
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Read Knowledge documents",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents list knowledge_library_123",
        output: JSON.stringify({ object: "list", documents: [] }),
        exitCode: 0,
      },
    };

    render(
      <RunnerWorkLogEntry
        log={log}
        backendUrl="/api/real"
        onKnowledgeLibraryPreviewClick={onKnowledgeLibraryPreviewClick}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Read Knowledge Library Project Research")).toBeTruthy();
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Open Knowledge library Project Research" }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/real/knowledge/knowledge_library_123",
      expect.objectContaining({ credentials: "include", cache: "no-store" }),
    );
    expect(onKnowledgeLibraryPreviewClick).toHaveBeenCalledWith({
      libraryId: "knowledge_library_123",
      libraryName: "Project Research",
    });
  });

  it("renders successful document proposals as one library update line", () => {
    const onKnowledgeLibraryPreviewClick = vi.fn();
    const log: RunnerLog = {
      time: "2026-08-25T06:00:00.000Z",
      message: "Updated Knowledge document",
      type: "info",
      eventType: "command_execution",
      metadata: {
        command:
          "python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py knowledge documents propose knowledge_library_123 --operation update_document",
        output: JSON.stringify({
          libraryName: "Project Research",
          id: "knowledge_proposal_1",
        }),
        exitCode: 0,
      },
    };

    render(
      <RunnerWorkLogEntry
        log={log}
        onKnowledgeLibraryPreviewClick={onKnowledgeLibraryPreviewClick}
      />,
    );

    const updateLine = screen.getByRole("button", {
      name: "Open Knowledge library Project Research",
    });
    expect(screen.getByText("Updated Knowledge Library Project Research")).toBeTruthy();
    expect(updateLine.querySelector(".hugeicons-library-big")).toBeTruthy();
    fireEvent.click(updateLine);
    expect(onKnowledgeLibraryPreviewClick).toHaveBeenCalledWith({
      libraryId: "knowledge_library_123",
      libraryName: "Project Research",
    });
  });
});
