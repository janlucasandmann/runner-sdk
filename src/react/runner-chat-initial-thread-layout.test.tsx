// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerChat } from "./runner-chat.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RunnerChat initial thread layout", () => {
  it("leaves the centered welcome layout as soon as thread creation starts", async () => {
    let resolveAttachmentRequest: ((response: Response) => void) | null = null;
    let resolveThreadRequest: ((response: Response) => void) | null = null;
    const pendingAttachmentRequest = new Promise<Response>((resolve) => {
      resolveAttachmentRequest = resolve;
    });
    const pendingThreadRequest = new Promise<Response>((resolve) => {
      resolveThreadRequest = resolve;
    });

    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "https://assets.example.test/context.txt") {
        return pendingAttachmentRequest;
      }
      if (String(input) === "https://example.test/threads" && init?.method === "POST") {
        return pendingThreadRequest;
      }
      return Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        className="playground-thread-runner is-initial-welcome-runner"
        emptyState={<div>Initial home content</div>}
        emptyStateAfterComposer={<div>Initial home footer</div>}
        implicitAttachments={[
          {
            url: "https://assets.example.test/context.txt",
            filename: "context.txt",
            mimeType: "text/plain",
          },
        ]}
      />,
    );

    const root = container.querySelector(".tb-runner-chat");
    expect(root?.classList.contains("is-run-preparing")).toBe(false);
    expect(root?.classList.contains("is-home-composer-surface")).toBe(true);
    expect(root?.classList.contains("is-thread-composer-surface")).toBe(false);
    expect(screen.getByText("Initial home content")).not.toBeNull();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Start a new thread" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(root?.classList.contains("is-run-preparing")).toBe(true);
    });
    expect(root?.classList.contains("is-home-composer-surface")).toBe(false);
    expect(root?.classList.contains("is-thread-composer-surface")).toBe(true);
    expect(screen.queryByText("Initial home content")).toBeNull();
    expect(screen.queryByText("Initial home footer")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "https://example.test/threads",
      expect.objectContaining({ method: "POST" }),
    );

    await act(async () => {
      resolveAttachmentRequest?.(
        new Response("attachment", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "https://example.test/threads",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(root?.classList.contains("is-run-preparing")).toBe(true);

    await act(async () => {
      resolveThreadRequest?.(
        new Response(JSON.stringify({ message: "Expected test failure" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      );
    });

    await waitFor(() => {
      expect(root?.classList.contains("is-run-preparing")).toBe(false);
    });
    expect(root?.classList.contains("is-home-composer-surface")).toBe(true);
    expect(root?.classList.contains("is-thread-composer-surface")).toBe(false);
  });
});
