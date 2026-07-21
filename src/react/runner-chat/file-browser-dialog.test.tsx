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
          "google-drive": { connected: false },
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
    expect(
      document.querySelector(".platform-file-explorer__sidebar")?.contains(search),
    ).toBe(false);
    expect(screen.getByRole("tab", { name: "All Files" })).toBeTruthy();
    expect(screen.getByText("notes.txt")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Images" }));
    expect(screen.getByText("hero.png")).toBeTruthy();
    expect(screen.queryByText("report.pdf")).toBeNull();
    expect(screen.queryByText("notes.txt")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "PDFs" }));
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.queryByText("hero.png")).toBeNull();
  });
});
