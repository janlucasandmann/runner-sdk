// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerChat } from "./runner-chat.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("RunnerChat workspace selector", () => {
  it("remains visible while computer and project options are loading", () => {
    render(
      <RunnerChat
        backendUrl=""
        apiKey=""
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ projects: { items: [] } }}
        autoCreateThread={false}
      />
    );

    expect(screen.getByRole("button", { name: "Default" })).not.toBeNull();
  });

  it("focuses the task input whenever an external composer focus request changes", async () => {
    const animationFrame = vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const renderChat = (composerFocusRequest: number | null) => (
      <RunnerChat
        backendUrl=""
        apiKey=""
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ projects: { items: [] } }}
        autoCreateThread={false}
        composerFocusRequest={composerFocusRequest}
      />
    );
    const { rerender } = render(renderChat(null));
    const workspaceSelector = screen.getByRole("button", { name: "Default" });
    const taskInput = screen.getByRole("textbox");

    workspaceSelector.focus();
    expect(document.activeElement).toBe(workspaceSelector);

    rerender(renderChat(1));

    await waitFor(() => expect(document.activeElement).toBe(taskInput));
    animationFrame.mockRestore();
  });
});
