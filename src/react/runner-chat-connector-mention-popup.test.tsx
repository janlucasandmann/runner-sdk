// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RunnerChat } from "./runner-chat.js";

const connector = {
  id: "gmail",
  name: "Gmail",
  kind: "plugin" as const,
  description: "Read and manage Gmail",
  connected: true,
};
const tagConnector = {
  id: "discord",
  name: "Discord",
  kind: "tag" as const,
  description: "Run tasks from Discord",
  connected: true,
};
const atlassianConnector = {
  id: "jira",
  name: "Atlassian",
  kind: "plugin" as const,
  description: "Search Jira and Confluence",
  logoUrl: "/img/plugins/atlassian.svg",
  connected: true,
};
const githubConnector = {
  id: "github",
  name: "GitHub",
  kind: "plugin" as const,
  description: "Manage GitHub repositories",
  logoUrl: "/img/plugins/github.svg",
  connected: true,
};

const originalImageDecodeDescriptor = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  "decode",
);

beforeEach(() => {
  Object.defineProperty(HTMLImageElement.prototype, "decode", {
    configurable: true,
    value: () => Promise.resolve(),
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  if (originalImageDecodeDescriptor) {
    Object.defineProperty(
      HTMLImageElement.prototype,
      "decode",
      originalImageDecodeDescriptor,
    );
  } else {
    delete (HTMLImageElement.prototype as HTMLImageElement & {
      decode?: () => Promise<void>;
    }).decode;
  }
});

async function renderConnectorMentionPopup(threadId?: string) {
  render(
    <RunnerChat
      backendUrl=""
      apiKey=""
      inputMode="computer-agents"
      environments={[]}
      computerAgents={{ connectors: [connector, tagConnector] }}
      autoCreateThread={false}
      threadId={threadId}
    />,
  );

  fireEvent.change(await screen.findByRole("textbox"), {
    target: { value: "@", selectionStart: 1 },
  });

  return screen.findByRole("listbox", { name: "Connectors" });
}

describe("RunnerChat connector mention popup", () => {
  it("keeps connector offsets on the first prompt line only", () => {
    const composerCss = readFileSync(
      resolve(process.cwd(), "src/react/runner-chat/styles/composer.css"),
      "utf8",
    );
    const textareaRule = composerCss.match(
      /\.tb-runner-chat \.sidebar-textarea\s*\{([^}]*)\}/,
    )?.[1] || "";
    const messageFlowRule = composerCss.match(
      /\.tb-runner-chat \.tb-user-turn-prompt-with-connectors\s*\{([^}]*)\}/,
    )?.[1] || "";
    const messageConnectorsRule = composerCss.match(
      /\.tb-runner-chat \.tb-user-turn-connectors\s*\{([^}]*)\}/,
    )?.[1] || "";

    expect(textareaRule).toContain("padding: 16px 16px 2px;");
    expect(textareaRule).toContain(
      "text-indent: var(--tb-composer-first-line-offset);",
    );
    expect(textareaRule).not.toMatch(/padding:[^;]*--tb-staged-thread-command-offset/);
    expect(messageFlowRule).toContain("display: flow-root;");
    expect(messageFlowRule).toContain("width: max-content;");
    expect(messageFlowRule).toContain("max-width: 100%;");
    expect(messageConnectorsRule).toContain("float: left;");
    expect(composerCss).toMatch(
      /\.tb-user-turn-prompt-with-connectors[\s\S]*?\.tb-user-turn-collapsible-copy\s*\{\s*overflow: clip;\s*width: max-content;\s*max-width: 100%;/,
    );
  });

  it("uses the minimal popup below the composer on the initial Home page", async () => {
    const popup = await renderConnectorMentionPopup();

    expect(popup.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(popup.getAttribute("data-platform-popup-animation")).toBe("down-in");
    expect(popup.getAttribute("data-composer-suggestion-placement")).toBe("bottom");
    expect(popup.classList.contains("is-placement-bottom")).toBe(true);
    expect(popup.parentElement?.classList.contains("task-input-box")).toBe(true);
    expect(
      popup.querySelector(
        ".connection-identity-icon.is-catalog.is-plugin.tb-connector-mention-icon-shell",
      ),
    ).not.toBeNull();
    expect(
      popup.querySelector(
        ".connection-identity-icon.is-catalog.is-tag.is-discord.tb-connector-mention-icon-shell",
      ),
    ).not.toBeNull();
  });

  it("opens the minimal popup above the composer on a thread details page", async () => {
    const popup = await renderConnectorMentionPopup("thread-123");

    expect(popup.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(popup.getAttribute("data-platform-popup-animation")).toBe("up-in");
    expect(popup.getAttribute("data-composer-suggestion-placement")).toBe("top");
    expect(popup.classList.contains("is-placement-top")).toBe(true);
  });

  it("lists workflow commands after connectors and starts the selected workflow directly", async () => {
    const onWorkflowSubmit = vi.fn(async () => true);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <RunnerChat
        backendUrl="https://runner.example.test"
        apiKey="runner-key"
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ connectors: [connector] }}
        composerWorkflowTriggers={[
          {
            id: "met_launch",
            name: "Launch Review",
            command: "@launch",
          },
        ]}
        onComposerWorkflowTriggerSubmit={onWorkflowSubmit}
        autoCreateThread={false}
      />,
    );

    const textarea = await screen.findByRole("textbox");
    fireEvent.change(textarea, {
      target: { value: "@", selectionStart: 1 },
    });
    const popup = await screen.findByRole("listbox", { name: "Connectors" });
    const sectionLabels = Array.from(
      popup.querySelectorAll(".tb-composer-mention-section-label"),
    ).map((element) => element.textContent);
    expect(sectionLabels).toEqual(["Connectors", "Workflows"]);
    expect(within(popup).getByText("@launch")).not.toBeNull();

    fireEvent.click(within(popup).getByRole("option", { name: /Launch Review/ }));
    expect(
      await screen.findByRole("button", { name: "Remove Launch Review workflow" }),
    ).not.toBeNull();

    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(onWorkflowSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onWorkflowSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "@launch",
        prompt: "",
        workflow: expect.objectContaining({
          id: "met_launch",
          name: "Launch Review",
        }),
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders a selected connector inline with the textarea", async () => {
    const popup = await renderConnectorMentionPopup();
    fireEvent.click(popup.querySelector('[role="option"]') as HTMLButtonElement);

    const selectedConnectors = await screen.findByRole("group", {
      name: "Selected connectors",
    });
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const textareaShell = textarea.closest(".tb-composer-textarea-shell");

    expect(selectedConnectors.parentElement).toBe(textareaShell);
    expect(textareaShell?.classList.contains("tb-composer-textarea-shell-connectors")).toBe(true);
    expect(textareaShell?.getAttribute("style")).toContain(
      "--tb-selected-connectors-inline-start: 16px",
    );
    expect(textarea.placeholder).toBe("");
    expect(screen.getByRole("button", { name: "Remove Gmail connector" })).not.toBeNull();

    fireEvent.keyDown(textarea, { key: "Backspace" });
    await waitFor(() => {
      expect(screen.queryByRole("group", { name: "Selected connectors" })).toBeNull();
    });
  });

  it("hydrates the submitted Atlassian token inside the user message box", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/messages?")) {
        return new Response(JSON.stringify({
          data: [
            {
              id: "message-user-1",
              role: "user",
              content: "Summarize the current sprint",
              createdAt: "2026-08-03T08:00:00.000Z",
              metadata: { runnerConnectorIds: ["jira"] },
            },
            {
              id: "message-assistant-1",
              role: "assistant",
              content: "Done.",
              createdAt: "2026-08-03T08:00:01.000Z",
            },
          ],
          has_more: false,
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.includes("/logs?")) {
        return new Response(JSON.stringify({ logs: [], status: "completed" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (url.includes("/steps?")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (/\/threads\/thread-connectors(?:\?|$)/.test(url)) {
        return new Response(JSON.stringify({
          thread: {
            id: "thread-connectors",
            status: "completed",
            startedAt: "2026-08-03T08:00:00.000Z",
            completedAt: "2026-08-03T08:00:01.000Z",
          },
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));

    render(
      <RunnerChat
        backendUrl="https://runner.example.test"
        apiKey="runner-key"
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ connectors: [atlassianConnector] }}
        autoCreateThread={false}
        threadId="thread-connectors"
        threadViewMode="legacy"
      />,
    );

    const messageConnectors = await screen.findByRole("group", {
      name: "Message connectors",
    });
    expect(within(messageConnectors).getByText("Atlassian")).not.toBeNull();
    expect(messageConnectors.closest(".task-prompt-in-session-context")).not.toBeNull();
    expect(
      messageConnectors.querySelector(
        '.connection-identity-icon.is-catalog.is-plugin img[src="/img/plugins/atlassian.svg"]',
      ),
    ).not.toBeNull();
  });

  it("restores a historical connector chip from structured turn logs", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/messages?")) {
        return new Response(JSON.stringify({
          data: [
            {
              id: "msg_mTMHJP4BQyBuA1VXZwwEJ",
              role: "user",
              content: "list all my repos",
              createdAt: "2026-08-04T08:20:49.082Z",
              logMetadata: null,
            },
            {
              id: "message-assistant-github",
              role: "assistant",
              content: "Found the repositories.",
              createdAt: "2026-08-04T08:20:51.000Z",
            },
          ],
          has_more: false,
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.includes("/logs?")) {
        return new Response(JSON.stringify({
          logs: [
            {
              createdAt: "2026-08-04T08:20:50.000Z",
              type: "info",
              eventType: "mcp_tool_call",
              message: "Called GitHub",
              metadata: {
                toolName: "mcp__connector_github__search_repositories",
                serverName: "connector_github",
              },
            },
          ],
          status: "completed",
          agentName: "Spark",
          environmentName: "Default",
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.includes("/steps?")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (/\/threads\/thread_EjIYDUE8xy-zd-k_tZieY(?:\?|$)/.test(url)) {
        return new Response(JSON.stringify({
          thread: {
            id: "thread_EjIYDUE8xy-zd-k_tZieY",
            status: "completed",
            startedAt: "2026-08-04T08:20:49.082Z",
            completedAt: "2026-08-04T08:20:51.000Z",
          },
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));

    render(
      <RunnerChat
        backendUrl="https://runner.example.test"
        apiKey="runner-key"
        inputMode="computer-agents"
        environments={[]}
        computerAgents={{ connectors: [githubConnector] }}
        autoCreateThread={false}
        threadId="thread_EjIYDUE8xy-zd-k_tZieY"
        threadViewMode="legacy"
      />,
    );

    const messageConnectors = await screen.findByRole("group", {
      name: "Message connectors",
    });
    expect(within(messageConnectors).getByText("GitHub")).not.toBeNull();
    expect(screen.getByText("list all my repos")).not.toBeNull();
  });
});
