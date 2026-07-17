import { describe, expect, it } from "vitest";
import {
  buildEnvironmentFileListUrl,
  buildWorkspaceSelectionStorageKey,
  childFolderPath,
  fileItemsForParent,
  formatBrowserFileDate,
  formatBrowserFileSize,
  isBrowserFilePreviewable,
  mergeDriveFolderItems,
  notionDatabasesToFileItems,
  normalizeEnvironmentWorkspaceItems,
  normalizeRunnerWorkspaceFolderPath,
  normalizeWorkspaceSelectorMode,
} from "./workspace-files.js";

describe("workspace file normalization", () => {
  it("normalizes environment file envelopes and derives hierarchy metadata", () => {
    expect(normalizeEnvironmentWorkspaceItems({
      files: [
        {
          path: "/src/components/Button.tsx/",
          type: "file",
          mimeType: "text/typescript",
          size: 42,
          updatedAt: "2026-07-16T10:00:00.000Z",
        },
        {
          path: "src/assets",
          type: "directory",
          childCount: 2,
        },
        { path: "" },
      ],
    })).toEqual([
      {
        id: "src/components/Button.tsx",
        name: "Button.tsx",
        path: "/src/components/Button.tsx",
        parentId: "src/components",
        isFolder: false,
        hasChildren: undefined,
        mimeType: "text/typescript",
        size: 42,
        modifiedTime: "2026-07-16T10:00:00.000Z",
        createdTime: undefined,
      },
      {
        id: "src/assets",
        name: "assets",
        path: "/src/assets",
        parentId: "src",
        isFolder: true,
        hasChildren: true,
        mimeType: undefined,
        size: undefined,
        modifiedTime: undefined,
        createdTime: undefined,
      },
    ]);
  });

  it("builds encoded environment folder URLs", () => {
    expect(normalizeRunnerWorkspaceFolderPath(" /src/components/ ")).toBe("src/components");
    expect(buildEnvironmentFileListUrl(
      "https://api.example.com/",
      "computer a",
      "/src/components/",
      2,
    )).toBe(
      "https://api.example.com/environments/computer%20a/files?depth=2&path=src%2Fcomponents",
    );
    expect(buildEnvironmentFileListUrl("", "computer a")).toBeNull();
  });

  it("scopes persisted workspace selections to the app and backend", () => {
    expect(buildWorkspaceSelectionStorageKey(
      "platform",
      "https://api.example.com/",
    )).toBe(
      "tb_runner_chat_workspace_selection_v1:platform:https://api.example.com",
    );
    expect(normalizeWorkspaceSelectorMode("projects")).toBe("projects");
    expect(normalizeWorkspaceSelectorMode("unknown")).toBe("computers");
  });

  it("replaces only the requested folder children", () => {
    const merged = mergeDriveFolderItems(
      [
        { id: "old-root", name: "old-root", parentId: null },
        { id: "nested", name: "nested", parentId: "folder" },
      ],
      "root",
      [{ id: "new-root", name: "new-root" }],
    );
    expect(merged).toEqual([
      { id: "nested", name: "nested", parentId: "folder" },
      { id: "new-root", name: "new-root", parentId: null },
    ]);
  });

  it("limits browser previews to supported media and text formats", () => {
    expect(isBrowserFilePreviewable({ id: "1", name: "notes.md" })).toBe(true);
    expect(isBrowserFilePreviewable({ id: "2", name: "archive.bin" })).toBe(false);
  });

  it("projects integration items and folder breadcrumbs", () => {
    expect(notionDatabasesToFileItems([
      { id: "db_1", name: "Roadmap" },
    ])).toHaveLength(2);
    const items = [
      { id: "src", name: "src", parentId: null, isFolder: true },
      { id: "components", name: "components", parentId: "src", isFolder: true },
      { id: "button", name: "Button.tsx", parentId: "components" },
    ];
    expect(fileItemsForParent(items, "components").map((item) => item.id)).toEqual([
      "button",
    ]);
    expect(childFolderPath(items, "Workspace", "components")).toEqual([
      { id: null, name: "Workspace" },
      { id: "src", name: "src" },
      { id: "components", name: "components" },
    ]);
  });

  it("formats file metadata for the browser", () => {
    expect(formatBrowserFileSize(1536)).toBe("1.5 KB");
    const now = Date.parse("2026-07-16T12:00:00.000Z");
    expect(formatBrowserFileDate("2026-07-16T11:30:00.000Z", now)).toBe("30m ago");
    expect(formatBrowserFileDate("not-a-date", now)).toBe("");
  });
});
