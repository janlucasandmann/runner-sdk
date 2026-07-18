// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformGlobalSearchModal } from "./platform-global-search-modal.js";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

const defaultProps = {
  open: true,
  query: "",
  onQueryChange: vi.fn(),
  onClose: vi.fn(),
};

describe("PlatformGlobalSearchModal", () => {
  it("does not render a dialog while closed", () => {
    render(<PlatformGlobalSearchModal {...defaultProps} open={false} />);

    expect(screen.queryByRole("dialog", { name: "Global search" })).toBeNull();
  });

  it("centers the shared empty state with mode-specific content", () => {
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        mode="files"
        emptyTitle="Search files"
        emptyDescription="Enter a file name or path to search across your computers."
      />,
    );

    const centerState = document.querySelector(
      ".platform-global-search-modal__center-state.is-empty",
    );
    expect(centerState).toBeTruthy();
    expect(centerState?.querySelector(".platform-empty-state")).toBeTruthy();
    expect(centerState?.querySelector(".lucide-file-text")).toBeTruthy();
    expect(screen.getByText("Search files")).toBeTruthy();
    expect(
      screen.getByText("Enter a file name or path to search across your computers."),
    ).toBeTruthy();
  });

  it("centers the shared loading-state component while results are loading", () => {
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        resultsLoading
        loadingLabel="Loading threads..."
        resultGroups={[
          {
            id: "stale-results",
            label: "Threads",
            items: [{ id: "thread-stale", title: "Stale thread" }],
          },
        ]}
      />,
    );

    const loadingState = screen.getByRole("status", { name: "Loading threads..." });
    const loader = loadingState.querySelector(".platform-loading-state__loader");
    expect(loadingState.classList.contains("platform-loading-state")).toBe(true);
    expect(loadingState.classList.contains("is-centered")).toBe(true);
    expect(screen.getByText("Loading threads...")).toBeTruthy();
    expect(loader).toBeTruthy();
    expect(loadingState.querySelector(".platform-empty-state")).toBeNull();
    expect(screen.queryByRole("button", { name: "Stale thread" })).toBeNull();
  });

  it("renders actions and grouped results inside a fixed-height modal", async () => {
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        query="report"
        actions={[{ id: "create-chat", label: "Create New Chat" }]}
        resultGroups={[
          {
            id: "files",
            label: "Files",
            items: [
              {
                id: "computer-1:reports/q2.csv",
                title: "q2.csv",
                meta: "Research Computer",
              },
            ],
          },
          {
            id: "today",
            label: "Today",
            items: [
              {
                id: "thread-1",
                title: "Analyze Q2 report",
                meta: "10:42",
                active: true,
              },
            ],
          },
        ]}
        resultCount={2}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Global search" });
    expect(dialog.style.height).toBe("min(78dvh, 720px)");
    expect(dialog.getAttribute("data-platform-modal-resize")).toBeNull();
    expect(screen.getByRole("button", { name: "Create New Chat" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^q2\.csv Research Computer$/i })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /^Analyze Q2 report 10:42$/i })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByText("2 results")).toBeTruthy();
    expect(dialog.querySelector(".platform-global-search-modal__result-subtitle")).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("searchbox", { name: "Search threads" }),
      );
    });
  });

  it("renders single-line identifiers, custom visuals, and right-aligned metadata", () => {
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        mode="tickets"
        resultGroups={[
          {
            id: "tickets",
            label: "Tickets",
            items: [
              {
                id: "ticket-1",
                identifier: "RUN-42",
                title: "Ship global search",
                meta: "Platform",
                icon: <span data-testid="ticket-icon" />,
                iconClassName: "is-ticket",
              },
            ],
          },
        ]}
        onResultSelect={vi.fn()}
      />,
    );

    const result = screen.getByRole("button", { name: /RUN-42 Ship global search Platform/i });
    expect(
      result.querySelector(".platform-global-search-modal__result-identifier")?.textContent,
    ).toBe("RUN-42");
    expect(
      result
        .querySelector(".platform-global-search-modal__result-icon")
        ?.classList.contains("is-ticket"),
    ).toBe(true);
    expect(screen.getByTestId("ticket-icon")).toBeTruthy();
    expect(result.querySelector(".platform-global-search-modal__result-meta")?.textContent).toBe(
      "Platform",
    );
  });

  it("forwards controlled search, action, and result events", () => {
    const onQueryChange = vi.fn();
    const onActionSelect = vi.fn();
    const onResultSelect = vi.fn();

    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        query="q2"
        onQueryChange={onQueryChange}
        actions={[{ id: "create-chat", label: "Create New Chat" }]}
        onActionSelect={onActionSelect}
        resultGroups={[
          {
            id: "files",
            label: "Files",
            items: [{ id: "file-1", title: "q2.csv" }],
          },
        ]}
        onResultSelect={onResultSelect}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search threads" }), {
      target: { value: "forecast" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create New Chat" }));
    fireEvent.click(screen.getByRole("button", { name: /^q2\.csv$/i }));

    expect(onQueryChange).toHaveBeenLastCalledWith("forecast");
    expect(onActionSelect).toHaveBeenLastCalledWith("create-chat");
    expect(onResultSelect).toHaveBeenLastCalledWith("file-1");
  });

  it("provides reusable open, inline rename, and delete controls for results", async () => {
    const onResultOpenInNewTab = vi.fn();
    const onResultRename = vi.fn();
    const onResultDelete = vi.fn();

    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        mode="agents"
        resultGroups={[
          {
            id: "agents",
            label: "Agents",
            items: [{ id: "agent-1", title: "Research Agent", meta: "Gemini 3 Flash" }],
          },
        ]}
        onResultSelect={vi.fn()}
        onResultOpenInNewTab={onResultOpenInNewTab}
        onResultRename={onResultRename}
        onResultDelete={onResultDelete}
      />,
    );

    const resultTrigger = screen.getByRole("button", {
      name: /^Research Agent Gemini 3 Flash$/i,
    });
    fireEvent.click(resultTrigger, { metaKey: true });
    await waitFor(() => {
      expect(onResultOpenInNewTab).toHaveBeenCalledWith("agent-1");
    });

    fireEvent.mouseEnter(resultTrigger.closest(".platform-global-search-modal__result")!);
    expect(screen.getByText("\u2318 \u21e7 E").tagName).toBe("KBD");

    fireEvent.click(screen.getByRole("button", { name: "Rename Research Agent" }));
    const renameInput = screen.getByRole("textbox", { name: "Rename Research Agent" });
    fireEvent.change(renameInput, { target: { value: "Evidence Agent" } });
    fireEvent.keyDown(renameInput, { key: "Enter" });

    await waitFor(() => {
      expect(onResultRename).toHaveBeenCalledWith("agent-1", "Evidence Agent");
    });
    expect(screen.queryByRole("textbox", { name: "Rename Research Agent" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Delete Research Agent" }));
    expect(onResultDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "Delete Research Agent?" })).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(onResultDelete).toHaveBeenCalledWith("agent-1");
    });

    expect(
      screen
        .getByRole("button", { name: "Open Research Agent in a new tab" })
        .classList.contains("platform-icon-button"),
    ).toBe(true);
  });

  it("keeps immutable result actions visible but disabled", () => {
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        mode="workflows"
        resultGroups={[
          {
            id: "workflows",
            label: "Workflows",
            items: [
              {
                id: "builtin-loop",
                title: "Loop",
                renameDisabled: true,
                deleteDisabled: true,
              },
            ],
          },
        ]}
        onResultSelect={vi.fn()}
        onResultOpenInNewTab={vi.fn()}
        onResultRename={vi.fn()}
        onResultDelete={vi.fn()}
      />,
    );

    expect(
      (screen.getByRole("button", { name: "Open Loop in a new tab" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    expect(
      (screen.getByRole("button", { name: "Rename Loop" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Delete Loop" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("runs Go, Edit, and Delete against the hovered result with keyboard shortcuts", () => {
    const onResultSelect = vi.fn();
    const onResultRename = vi.fn();
    const onResultDelete = vi.fn();

    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        mode="agents"
        resultGroups={[
          {
            id: "agents",
            label: "Agents",
            items: [
              { id: "agent-1", title: "Research Agent" },
              { id: "agent-2", title: "Support Agent" },
            ],
          },
        ]}
        onResultSelect={onResultSelect}
        onResultRename={onResultRename}
        onResultDelete={onResultDelete}
      />,
    );

    const supportResult = screen
      .getByRole("button", { name: /^Support Agent$/i })
      .closest(".platform-global-search-modal__result");
    expect(supportResult).toBeTruthy();
    expect(screen.queryByLabelText("Actions for Support Agent")).toBeNull();
    fireEvent.mouseEnter(supportResult!);
    expect(screen.getByLabelText("Actions for Support Agent")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Enter" });
    expect(onResultSelect).toHaveBeenLastCalledWith("agent-2");

    fireEvent.keyDown(document, { key: "E", metaKey: true, shiftKey: true });
    expect(screen.getByRole("textbox", { name: "Rename Support Agent" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cancel renaming Support Agent" }));

    fireEvent.keyDown(document, { key: "D", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("alertdialog", { name: "Delete Support Agent?" })).toBeTruthy();
    expect(onResultDelete).not.toHaveBeenCalled();
  });

  it("keeps the result count left-aligned and exposes a labeled Escape close control", () => {
    const onClose = vi.fn();
    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        onClose={onClose}
        resultCount={4}
      />,
    );

    const footer = document.querySelector(".platform-global-search-modal__footer");
    expect(footer?.firstElementChild?.textContent).toBe("4 results");
    expect(screen.queryByText("Open result")).toBeNull();

    const closeButton = footer?.querySelector<HTMLButtonElement>(
      ".platform-global-search-modal__footer-close",
    );
    expect(closeButton).toBeTruthy();
    expect(closeButton?.textContent).toBe("CloseEsc");
    expect(closeButton?.querySelector("kbd")?.textContent).toBe("Esc");
    fireEvent.click(closeButton!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("exposes the optional actions expansion control independently of the query", () => {
    const onShowAllActions = vi.fn();

    render(
      <PlatformGlobalSearchModal
        {...defaultProps}
        actions={[{ id: "create-chat", label: "Create New Chat" }]}
        onActionSelect={vi.fn()}
        onShowAllActions={onShowAllActions}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show All" }));
    expect(onShowAllActions).toHaveBeenCalledOnce();
  });

  it("switches search scope through the shared minimal popup", () => {
    const onModeChange = vi.fn();
    render(<PlatformGlobalSearchModal {...defaultProps} onModeChange={onModeChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Search mode: Threads" }));

    const modeMenu = screen.getByRole("menu", { name: "Search mode" });
    expect(modeMenu.getAttribute("data-platform-popup-variant")).toBe("minimal");
    expect(screen.getByRole("menuitemradio", { name: /Files/i })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: /Tickets/i })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: /Agents/i })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: /Workflows/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitemradio", { name: /Files/i }));

    expect(onModeChange).toHaveBeenCalledWith("files");
    expect(screen.queryByRole("menu", { name: "Search mode" })).toBeNull();
  });

  it("closes the search-mode popup before dismissing the modal", () => {
    const onClose = vi.fn();
    render(<PlatformGlobalSearchModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Search mode: Threads" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu", { name: "Search mode" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("delegates Escape dismissal to the shared modal lifecycle", () => {
    const onClose = vi.fn();
    render(<PlatformGlobalSearchModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
