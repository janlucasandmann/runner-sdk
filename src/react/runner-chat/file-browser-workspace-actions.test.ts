import { describe, expect, it, vi } from "vitest";

import {
  deleteRunnerWorkspaceFile,
  remapRunnerWorkspaceItemPath,
  renameRunnerWorkspaceFile,
} from "./file-browser-workspace-actions.js";

describe("runner workspace file actions", () => {
  it("renames a workspace file through the move endpoint", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));

    const result = await renameRunnerWorkspaceFile({
      apiKey: "test-key",
      backendUrl: "https://api.example.com/",
      environmentId: "computer 1",
      fetchImpl,
      item: {
        id: "output/report.txt",
        path: "/output/report.txt",
        name: "report.txt",
      },
      nextName: "summary.txt",
    });

    expect(result).toEqual({
      parentId: "output",
      sourcePath: "output/report.txt",
      targetPath: "output/summary.txt",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.com/environments/computer%201/files/move",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual({
      sourcePath: "output/report.txt",
      destPath: "output/summary.txt",
    });
  });

  it("deletes a workspace item with each path segment encoded", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));

    await deleteRunnerWorkspaceFile({
      apiKey: "test-key",
      backendUrl: "https://api.example.com",
      environmentId: "computer_1",
      fetchImpl,
      item: {
        id: "output/My Report.pdf",
        path: "/output/My Report.pdf",
        name: "My Report.pdf",
      },
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.com/environments/computer_1/files/output/My%20Report.pdf",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("remaps descendants when a folder is renamed", () => {
    expect(
      remapRunnerWorkspaceItemPath(
        {
          id: "output/reports/july.pdf",
          path: "/output/reports/july.pdf",
          parentId: "output/reports",
          name: "july.pdf",
        },
        "output/reports",
        "output/archive",
      ),
    ).toMatchObject({
      id: "output/archive/july.pdf",
      path: "/output/archive/july.pdf",
      parentId: "output/archive",
      name: "july.pdf",
    });
  });
});
