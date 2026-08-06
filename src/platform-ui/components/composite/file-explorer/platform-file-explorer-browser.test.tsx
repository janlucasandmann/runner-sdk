// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformFileExplorerBrowser } from "./platform-file-explorer-browser.js";

interface TestFile {
  id: string;
  kind: "folder" | "image" | "pdf" | "file";
  name: string;
  modifiedAt?: string;
}

describe("PlatformFileExplorerBrowser", () => {
  afterEach(() => cleanup());

  it("renders the reusable source rail, navigation, search, filters, and file list", () => {
    const onSourceSelect = vi.fn();
    const onSearchQueryChange = vi.fn();
    const files: TestFile[] = [
      { id: "folder", kind: "folder", name: "Design" },
      { id: "image", kind: "image", name: "hero.png", modifiedAt: "2026-08-04" },
      { id: "pdf", kind: "pdf", name: "brief.pdf", modifiedAt: "2026-08-03" },
    ];

    render(
      <PlatformFileExplorerBrowser
        sourceGroups={[
          {
            id: "connectors",
            label: "Connected Sources",
            items: [
              {
                id: "github",
                label: "GitHub",
                note: "octocat",
                active: true,
                onSelect: onSourceSelect,
              },
            ],
          },
        ]}
        breadcrumbs={[{ id: "root", label: "GitHub" }]}
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        items={files}
        renderItem={(file) => <div key={file.id}>{file.name}</div>}
        getItemKind={(file) => file.kind}
        getItemTimestamp={(file) => file.modifiedAt}
      />,
    );

    expect(screen.getByRole("region", { name: "Connected files" })).toBeTruthy();
    expect(screen.getByText("Connected Sources")).toBeTruthy();
    expect(screen.getByText("octocat")).toBeTruthy();
    expect(screen.getByRole("searchbox", { name: "Search Files" })).toBeTruthy();
    expect(screen.getByText("brief.pdf")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "GitHub octocat" }));
    expect(onSourceSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("tab", { name: "Images" }));
    expect(screen.getByText("hero.png")).toBeTruthy();
    expect(screen.queryByText("brief.pdf")).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Files" }), {
      target: { value: "hero" },
    });
    expect(onSearchQueryChange).toHaveBeenCalledWith("hero");
  });

  it("can render a selected filebase without a second source rail", () => {
    render(
      <PlatformFileExplorerBrowser
        sourceGroups={[]}
        showSourceRail={false}
        breadcrumbs={[{ id: "root", label: "GitHub" }]}
        searchQuery=""
        onSearchQueryChange={() => undefined}
        items={[]}
      />,
    );

    const browser = screen.getByRole("region", { name: "Connected files" });
    expect(browser.classList.contains("without-source-rail")).toBe(true);
    expect(browser.querySelector(".platform-file-explorer-browser__sidebar")).toBeNull();
  });
});
