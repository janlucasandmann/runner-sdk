// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerChat } from "./runner-chat.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RunnerChat Batch capability", () => {
  it("shows Batch as the first capability in the slash popup", () => {
    render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        autoCreateThread={false}
        inputMode="computer-agents"
        onBatchJobCreate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "/", selectionStart: 1 },
    });

    const popup = screen.getByRole("listbox", { name: "Slash commands" });
    const capabilityRows = popup.querySelectorAll(
      "button.tb-popup-row-core-action:not(.tb-popup-row-composer-action)",
    );
    expect(capabilityRows[0]?.textContent).toContain("Batch");
    expect(capabilityRows[0]?.textContent).toContain("Save work to Batches");
  });

  it("saves staged work on the shelf without starting a thread", async () => {
    let resolveBatchSave: ((value: boolean) => void) | null = null;
    const onBatchJobCreate = vi.fn(() => new Promise<boolean>((resolve) => {
      resolveBatchSave = resolve;
    }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        autoCreateThread={false}
        inputMode="computer-agents"
        environmentId="computer-1"
        agentId="agent-1"
        agents={[{ id: "agent-1", name: "Spark" }]}
        environments={[{ id: "computer-1", name: "Build Computer" }]}
        onBatchJobCreate={onBatchJobCreate}
      />,
    );

    const input = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(input, {
      target: {
        value: "/Batch audit authentication boundaries",
        selectionStart: 38,
      },
    });

    expect(screen.getByText("/Batch")).not.toBeNull();
    expect(input.value).toBe("audit authentication boundaries");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(onBatchJobCreate).toHaveBeenCalledTimes(1));
    expect(container.querySelector(".tb-runner-chat")?.classList.contains("is-run-preparing")).toBe(false);
    expect(input.value).toBe("audit authentication boundaries");
    expect(onBatchJobCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "audit authentication boundaries",
        targetKind: "thread_run",
        startPolicy: "manual",
        environmentId: "computer-1",
        agentId: "agent-1",
      }),
    );
    await act(async () => {
      resolveBatchSave?.(true);
    });
    await waitFor(() => expect(input.value).toBe(""));
    const savedReceipt = screen.getByText("Batch job saved").closest(".tb-runner-page-status-indicator");
    expect(savedReceipt).not.toBeNull();
    expect(savedReceipt?.parentElement).toBe(document.body);
    expect(screen.getByText("Kept on shelf in Batches.")).not.toBeNull();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url) === "https://example.test/threads" &&
          (init as RequestInit | undefined)?.method === "POST",
      ),
    ).toBe(false);
  });

  it("preserves the draft when the host declines the save", async () => {
    const onBatchJobCreate = vi.fn().mockResolvedValue(false);

    render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        autoCreateThread={false}
        inputMode="computer-agents"
        onBatchJobCreate={onBatchJobCreate}
      />,
    );

    const input = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(input, {
      target: { value: "/batch keep this draft", selectionStart: 22 },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(onBatchJobCreate).toHaveBeenCalledTimes(1));
    expect(input.value).toBe("keep this draft");
    expect(screen.queryByText("Batch job saved")).toBeNull();
  });
});
