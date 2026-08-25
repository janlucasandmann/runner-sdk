// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RunnerFileBrowserDialog } from "./file-browser-dialog.js";

describe("RunnerFileBrowserDialog", () => {
  afterEach(() => cleanup());

  it("filters the file list through the centralized tab bar", () => {
    render(
      <RunnerFileBrowserDialog
        open
        apiKeyPromptOpen={false}
        source="workspace"
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        environments={[{ id: "computer_1", name: "Default" }]}
        selectedEnvironmentId="computer_1"
        onEnvironmentSelect={vi.fn()}
        onSourceChange={vi.fn()}
        connections={{
          "google-drive": { connected: true },
          notion: { connected: false },
          "one-drive": { connected: false },
          github: { connected: false },
        }}
        authSource={null}
        path={[{ id: null, name: "Default Computer" }]}
        historyIndex={0}
        historyLength={1}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onBreadcrumbSelect={vi.fn()}
        googleDriveItemCount={0}
        isGoogleDrivePickerLoading={false}
        loading={false}
        error={null}
        showGoogleDrivePickerPrompt={false}
        items={[
          {
            id: "hero.png",
            name: "hero.png",
            mimeType: "image/png",
            modifiedTime: "2026-07-20T09:00:00.000Z",
          },
          {
            id: "report.pdf",
            name: "report.pdf",
            mimeType: "application/pdf",
            modifiedTime: "2026-07-19T09:00:00.000Z",
          },
          { id: "notes.txt", name: "notes.txt", mimeType: "text/plain" },
        ]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        previewItem={null}
        previewContent={null}
        previewKind={null}
        isPreviewLoading={false}
        renderPreviewIcon={() => null}
        selectedItemCount={0}
        selectedItemLabel="0 files"
        isAttaching={false}
        onAttach={vi.fn()}
        onPreviewClose={vi.fn()}
        onClose={vi.fn()}
        onApiKeyPromptClose={vi.fn()}
      />,
    );

    const tabBar = screen.getByRole("navigation", { name: "File filters" });
    expect(tabBar.classList.contains("has-divider")).toBe(true);
    const search = screen.getByRole("searchbox", { name: "Search Files" });
    expect(
      document.querySelector(".platform-file-explorer__content-header")?.contains(search),
    ).toBe(true);
    expect(document.querySelector(".platform-file-explorer__sidebar")?.contains(search)).toBe(
      false,
    );
    expect(screen.getByRole("tab", { name: "All Files" })).toBeTruthy();
    expect(screen.getByText("notes.txt")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Google Drive/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Notion/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /OneDrive/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /GitHub/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /GitLab/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /SharePoint/ })).toBeNull();
    expect(
      screen.queryByText("Computers", { selector: ".tb-file-browser-sidebar-title" }),
    ).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Images" }));
    expect(screen.getByText("hero.png")).toBeTruthy();
    expect(screen.queryByText("report.pdf")).toBeNull();
    expect(screen.queryByText("notes.txt")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "PDFs" }));
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.queryByText("hero.png")).toBeNull();
  });

  it("renders a default-first connector account selector and resets through its callback", () => {
    const onAccountChange = vi.fn();
    render(
      <RunnerFileBrowserDialog
        open
        apiKeyPromptOpen={false}
        source="github"
        showSourceSidebar={false}
        showFilterTabs={false}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        environments={[]}
        selectedEnvironmentId={null}
        onEnvironmentSelect={vi.fn()}
        onSourceChange={vi.fn()}
        connections={{
          "google-drive": { connected: false },
          notion: { connected: false },
          "one-drive": { connected: false },
          github: {
            connected: true,
            accounts: [
              { id: "work", name: "Work", identity: "work@example.com" },
              { id: "personal", name: "Personal", identity: "me@example.com", isDefault: true },
            ],
            selectedAccountId: "personal",
            onAccountChange,
          },
        }}
        authSource={null}
        path={[{ id: null, name: "Repositories" }]}
        historyIndex={0}
        historyLength={1}
        onBack={vi.fn()}
        onForward={vi.fn()}
        onBreadcrumbSelect={vi.fn()}
        googleDriveItemCount={0}
        isGoogleDrivePickerLoading={false}
        loading={false}
        error={null}
        showGoogleDrivePickerPrompt={false}
        items={[]}
        renderItem={() => null}
        previewItem={null}
        previewContent={null}
        previewKind={null}
        isPreviewLoading={false}
        renderPreviewIcon={() => null}
        selectedItemCount={0}
        selectedItemLabel="0 files"
        isAttaching={false}
        onAttach={vi.fn()}
        onPreviewClose={vi.fn()}
        onClose={vi.fn()}
        onApiKeyPromptClose={vi.fn()}
      />,
    );

    const selector = screen.getByRole("button", { name: "Select GitHub account" });
    expect(document.querySelector("[data-platform-modal-part='sidebar']")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "File filters" })).toBeNull();
    expect(selector.textContent).toContain("me@example.com");
    fireEvent.click(selector);
    expect(screen.getByRole("option", { name: /work@example\.com/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: /work@example\.com/i }));
    expect(onAccountChange).toHaveBeenCalledWith("work");
  });
});
