import { describe, expect, it, vi } from "vitest";

import {
  createPlatformGitHubNodeId,
  createPlatformGitHubRepositoryFolderId,
  fetchPlatformPluginFiles,
  fetchPlatformPluginFileSourceStatuses,
  listPlatformPluginFileSourceDefinitions,
  parsePlatformGitHubFolderId,
} from "./plugin-file-browser-client.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("plugin file browser client", () => {
  it("exposes the canonical file-capable connector sources", () => {
    expect(listPlatformPluginFileSourceDefinitions().map((source) => source.id)).toEqual([
      "github",
      "google-drive",
      "one-drive",
      "gitlab",
      "notion",
      "sharepoint",
    ]);
  });

  it("normalizes connection state through the shared plugin connection registry", async () => {
    const request = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("github")) {
        return jsonResponse({
          connected: true,
          profile: { login: "octocat" },
          credentials: [
            {
              id: "github-personal",
              name: "Personal",
              identity: "octocat",
              status: "valid",
              isDefault: true,
            },
            {
              id: "github-work",
              name: "Work",
              identity: "octocat-work",
              status: "valid",
            },
          ],
          defaultCredentialId: "github-personal",
        });
      }
      if (url.includes("google-drive")) {
        return jsonResponse({ connected: true, profile: { email: "drive@example.com" } });
      }
      return jsonResponse({ connected: false });
    });

    const sources = await fetchPlatformPluginFileSourceStatuses({
      fetch: request as typeof fetch,
      organizationId: "organization-acme",
    });

    expect(sources).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "github",
        connected: true,
        defaultCredentialId: "github-personal",
        identity: "octocat",
        accounts: [
          expect.objectContaining({ id: "github-personal", identity: "octocat", isDefault: true }),
          expect.objectContaining({ id: "github-work", identity: "octocat-work", isDefault: false }),
        ],
      }),
      expect.objectContaining({ id: "google-drive", connected: true }),
      expect.objectContaining({ id: "one-drive", connected: false, accounts: [] }),
      expect.objectContaining({ id: "gitlab", connected: false, accounts: [] }),
      expect.objectContaining({ id: "notion", connected: false, accounts: [] }),
      expect.objectContaining({ id: "sharepoint", connected: false, accounts: [] }),
    ]));
    expect(request).toHaveBeenCalledTimes(6);
    expect(request.mock.calls.every(([input]) => String(input).includes("organizationId=organization-acme"))).toBe(true);
  });

  it("does not route unsupported connector sources through a Drive endpoint", async () => {
    await expect(fetchPlatformPluginFiles("gitlab", "root", {
      fetch: vi.fn(),
    })).rejects.toThrow("GitLab file browsing is not available yet.");
  });

  it("normalizes Google Drive files and folders", async () => {
    const request = vi.fn(async () => jsonResponse({
      files: [
        {
          id: "folder-1",
          name: "Brand assets",
          mimeType: "application/vnd.google-apps.folder",
          modifiedTime: "2026-08-04T08:00:00.000Z",
        },
        {
          id: "file-1",
          name: "brief.pdf",
          mimeType: "application/pdf",
          size: "2048",
          webUrl: "https://drive.example/brief.pdf",
        },
      ],
    }));

    const files = await fetchPlatformPluginFiles("google-drive", "folder-1", {
      fetch: request as typeof fetch,
    });

    expect(request).toHaveBeenCalledWith(
      "/api/aios/google-drive/files?folderId=folder-1",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
    expect(files).toEqual([
      expect.objectContaining({ id: "folder-1", isFolder: true, providerId: "google-drive" }),
      expect.objectContaining({ id: "file-1", isFolder: false, size: 2048, mimeType: "application/pdf" }),
    ]);
  });

  it("scopes connector file requests to the active organization", async () => {
    const request = vi.fn(async () => jsonResponse({ files: [] }));

    await fetchPlatformPluginFiles("google-drive", "root", {
      credentialId: "drive-work",
      fetch: request as typeof fetch,
      organizationId: "organization-acme",
    });

    expect(request).toHaveBeenCalledWith(
      "/api/aios/google-drive/files?folderId=root&organizationId=organization-acme&credentialId=drive-work",
      expect.objectContaining({
        headers: { "X-Computer-Agents-Organization": "organization-acme" },
      }),
    );
  });

  it("normalizes GitHub repositories and nested contents", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({
        repos: [{
          name: "runner-web-sdk",
          full_name: "computer-agents/runner-web-sdk",
          default_branch: "main",
          html_url: "https://github.com/computer-agents/runner-web-sdk",
        }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        ref: "main",
        contents: [
          { name: "src", path: "src", type: "dir", size: 0 },
          { name: "README.md", path: "README.md", type: "file", size: 512 },
        ],
      }));

    const repositories = await fetchPlatformPluginFiles("github", "root", {
      fetch: request as typeof fetch,
    });
    const repositoryId = repositories[0]?.id || "";
    const contents = await fetchPlatformPluginFiles("github", repositoryId, {
      fetch: request as typeof fetch,
    });

    expect(repositoryId).toBe(
      createPlatformGitHubRepositoryFolderId("computer-agents/runner-web-sdk", "main"),
    );
    expect(parsePlatformGitHubFolderId(repositoryId)).toEqual({
      repositoryFullName: "computer-agents/runner-web-sdk",
      path: "",
      ref: "main",
      isRoot: false,
    });
    expect(request.mock.calls[1]?.[0]).toBe(
      "/api/aios/github/repos/computer-agents/runner-web-sdk/contents?ref=main",
    );
    expect(contents).toEqual([
      expect.objectContaining({
        id: createPlatformGitHubNodeId("computer-agents/runner-web-sdk", "src", "main"),
        isFolder: true,
      }),
      expect.objectContaining({ name: "README.md", isFolder: false, size: 512 }),
    ]);
  });
});
