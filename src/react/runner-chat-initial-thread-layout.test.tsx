// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerChat } from "./runner-chat.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RunnerChat initial thread layout", () => {
  it("supports a thread-styled composer without loading a synthetic thread", () => {
    const fetchMock = vi.fn(() => Promise.resolve(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ));
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        composerSurfaceMode="thread"
        emptyState={<div>Workflow run content</div>}
      />,
    );

    const root = container.querySelector(".tb-runner-chat");
    expect(root?.classList.contains("is-thread-composer-surface")).toBe(true);
    expect(root?.classList.contains("is-home-composer-surface")).toBe(false);
    expect(screen.getByText("Workflow run content")).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("holds a synthetic thread behind the shared loader and reveals its complete surface together", async () => {
    const fetchMock = vi.fn(() => Promise.resolve(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ));
    vi.stubGlobal("fetch", fetchMock);

    const renderChat = (initialSurfaceLoading: boolean) => (
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        composerSurfaceMode="thread"
        initialSurfaceLoading={initialSurfaceLoading}
        emptyState={<div>Complete workflow run content</div>}
      />
    );
    const { container, rerender } = render(renderChat(true));
    const root = container.querySelector(".tb-runner-chat");

    expect(root?.classList.contains("is-initial-surface-loading")).toBe(true);
    expect(root?.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status", { name: "Loading thread..." })).not.toBeNull();

    rerender(renderChat(false));

    await waitFor(() => {
      expect(root?.classList.contains("is-initial-surface-entering")).toBe(true);
    });
    expect(root?.classList.contains("is-initial-surface-loading")).toBe(false);
    expect(screen.queryByRole("status", { name: "Loading thread..." })).toBeNull();
    expect(screen.getByText("Complete workflow run content")).not.toBeNull();

    await waitFor(() => {
      expect(root?.classList.contains("is-initial-surface-entering")).toBe(false);
    }, { timeout: 1_000 });
  });

  it("keeps a fast message preview hidden until authoritative thread hydration settles", async () => {
    let resolveThreadRequest: ((response: Response) => void) | null = null;
    let resolveLogsRequest: ((response: Response) => void) | null = null;
    let resolveStepsRequest: ((response: Response) => void) | null = null;
    const pendingThreadRequest = new Promise<Response>((resolve) => {
      resolveThreadRequest = resolve;
    });
    const pendingLogsRequest = new Promise<Response>((resolve) => {
      resolveLogsRequest = resolve;
    });
    const pendingStepsRequest = new Promise<Response>((resolve) => {
      resolveStepsRequest = resolve;
    });
    const threadUrl = "https://example.test/threads/thread_existing";

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/threads/thread_existing/messages?")) {
        return Promise.resolve(new Response(JSON.stringify({
          data: [
            {
              id: "message_user",
              role: "user",
              content: "Fast preview message",
              createdAt: "2026-08-24T10:00:00.000Z",
            },
            {
              id: "message_assistant",
              role: "assistant",
              content: "Fast preview response",
              createdAt: "2026-08-24T10:00:01.000Z",
            },
          ],
          has_more: false,
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }));
      }
      if (url === threadUrl) return pendingThreadRequest;
      if (url.includes("/threads/thread_existing/logs?")) return pendingLogsRequest;
      if (url.includes("/threads/thread_existing/steps?")) return pendingStepsRequest;
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <RunnerChat
        backendUrl="https://example.test"
        apiKey="test-key"
        composerSurfaceMode="thread"
        threadId="thread_existing"
      />,
    );
    const root = container.querySelector(".tb-runner-chat");

    await waitFor(() => {
      expect(screen.getByText("Fast preview message")).not.toBeNull();
    });
    expect(root?.classList.contains("is-initial-surface-loading")).toBe(true);
    expect(screen.getByRole("status", { name: "Loading thread..." })).not.toBeNull();

    await act(async () => {
      resolveThreadRequest?.(new Response(JSON.stringify({
        thread: {
          id: "thread_existing",
          status: "completed",
          task: "Fast preview message",
          startedAt: "2026-08-24T10:00:00.000Z",
          completedAt: "2026-08-24T10:00:01.000Z",
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      resolveLogsRequest?.(new Response(JSON.stringify({
        logs: [],
        status: "completed",
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      resolveStepsRequest?.(new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
    });

    await waitFor(() => {
      expect(root?.classList.contains("is-initial-surface-entering")).toBe(true);
    });
    expect(root?.classList.contains("is-initial-surface-loading")).toBe(false);
    expect(screen.queryByRole("status", { name: "Loading thread..." })).toBeNull();
    expect(screen.getByText("Fast preview response")).not.toBeNull();
  });

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
