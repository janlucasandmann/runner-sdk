// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformFileExplorerBrowserModal } from "./platform-file-explorer-browser-modal.js";

interface TestFile {
  id: string;
  kind: "folder" | "image" | "pdf" | "file";
  name: string;
  modifiedAt?: string;
}

describe("PlatformFileExplorerBrowserModal", () => {
  afterEach(() => cleanup());

  it("owns the canonical explorer rail, toolbar, filters, list, and footer", () => {
    const onConfirm = vi.fn();
    const onSearchQueryChange = vi.fn();
    const files: TestFile[] = [
      { id: "image", kind: "image", name: "hero.png", modifiedAt: "2026-07-20" },
      { id: "pdf", kind: "pdf", name: "report.pdf", modifiedAt: "2026-07-19" },
      { id: "text", kind: "file", name: "notes.txt" },
    ];

    render(
      <PlatformFileExplorerBrowserModal
        open
        visible
        portal={false}
        title="Attach files"
        onClose={vi.fn()}
        sourceGroups={[
          {
            id: "computers",
            label: "Computers",
            items: [{ id: "computer", label: "Default Computer", active: true }],
          },
        ]}
        breadcrumbs={[{ id: "root", label: "Default Computer" }]}
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        items={files}
        renderItem={(file) => <div key={file.id}>{file.name}</div>}
        getItemKind={(file) => file.kind}
        getItemTimestamp={(file) => file.modifiedAt}
        listFooter={<button type="button">Create repository</button>}
        confirmLabel="Attach Files"
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Attach files" });
    expect(dialog.classList.contains("is-browser-layout")).toBe(true);
    expect(screen.getByText("Computers")).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "Search Files" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "File filters" })).toBeTruthy();
    expect(screen.getByText("notes.txt")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create repository" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Create repository" })
        .closest(".tb-file-browser-list-footer"),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Images" }));
    expect(screen.getByText("hero.png")).toBeTruthy();
    expect(screen.queryByText("report.pdf")).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Files" }), {
      target: { value: "report" },
    });
    expect(onSearchQueryChange).toHaveBeenCalledWith("report");

    fireEvent.click(screen.getByRole("button", { name: "Attach Files" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
