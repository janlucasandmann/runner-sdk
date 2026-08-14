import { useCallback, useState } from "react";

import {
  createRunnerGithubSelectionAttachment,
  createRunnerIntegrationAttachment,
  createRunnerWorkspaceAttachment,
} from "./attachment-factories.js";
import type { LocalAttachment, RunnerAttachment } from "./attachment-types.js";
import type {
  RunnerChatDriveConfig,
  RunnerChatGithubConfig,
  RunnerChatWorkspaceConfig,
} from "./public-types.js";
import type { RunnerChatFileNode } from "./workspace-files.js";

type RunnerIntegrationAttachmentSource = "google-drive" | "one-drive" | "github";

interface RunnerFileBrowserAttachmentServices {
  createGithubAttachment: typeof createRunnerGithubSelectionAttachment;
  createIntegrationAttachment: typeof createRunnerIntegrationAttachment;
  createWorkspaceAttachment: typeof createRunnerWorkspaceAttachment;
}

export interface UseRunnerFileBrowserAttachmentControllerOptions {
  activeWorkspaceEnvironmentId: string;
  addAttachments: (attachments: LocalAttachment[]) => void;
  apiKey: string;
  attachmentCount: number;
  backendUrl: string;
  beginAttachmentUpload: (
    attachment: LocalAttachment,
    options?: { environmentIdOverride?: string | null },
  ) => Promise<RunnerAttachment> | undefined;
  closeInputPopups: () => void;
  getGithubSelectedBranch: (repoFullName: string) => string;
  githubConfig?: RunnerChatGithubConfig;
  githubAccountId?: string;
  githubItems: RunnerChatFileNode[];
  googleDriveConfig?: RunnerChatDriveConfig;
  googleDriveAccountId?: string;
  googleDriveItems: RunnerChatFileNode[];
  maxAttachments: number;
  oneDriveConfig?: RunnerChatDriveConfig;
  oneDriveAccountId?: string;
  oneDriveItems: RunnerChatFileNode[];
  onError: (message: string | null) => void;
  onWorkspaceError: (message: string | null) => void;
  requestHeaders?: HeadersInit;
  resolveUploadEnvironmentId: () => string | null;
  selectedGithubFileIds: string[];
  selectedGoogleDriveFileIds: string[];
  selectedOneDriveFileIds: string[];
  selectedWorkspaceFileIds: string[];
  services?: Partial<RunnerFileBrowserAttachmentServices>;
  setSelectedGithubFileIds: (ids: string[]) => void;
  setSelectedGoogleDriveFileIds: (ids: string[]) => void;
  setSelectedOneDriveFileIds: (ids: string[]) => void;
  setSelectedWorkspaceFileIds: (ids: string[]) => void;
  workspaceConfig?: RunnerChatWorkspaceConfig;
  workspaceItems: RunnerChatFileNode[];
}

export function useRunnerFileBrowserAttachmentController({
  activeWorkspaceEnvironmentId,
  addAttachments,
  apiKey,
  attachmentCount,
  backendUrl,
  beginAttachmentUpload,
  closeInputPopups,
  getGithubSelectedBranch,
  githubConfig,
  githubAccountId,
  githubItems,
  googleDriveConfig,
  googleDriveAccountId,
  googleDriveItems,
  maxAttachments,
  oneDriveConfig,
  oneDriveAccountId,
  oneDriveItems,
  onError,
  onWorkspaceError,
  requestHeaders,
  resolveUploadEnvironmentId,
  selectedGithubFileIds,
  selectedGoogleDriveFileIds,
  selectedOneDriveFileIds,
  selectedWorkspaceFileIds,
  services,
  setSelectedGithubFileIds,
  setSelectedGoogleDriveFileIds,
  setSelectedOneDriveFileIds,
  setSelectedWorkspaceFileIds,
  workspaceConfig,
  workspaceItems,
}: UseRunnerFileBrowserAttachmentControllerOptions) {
  const [isAttaching, setIsAttaching] = useState(false);
  const createGithubAttachment =
    services?.createGithubAttachment || createRunnerGithubSelectionAttachment;
  const createIntegrationAttachment =
    services?.createIntegrationAttachment || createRunnerIntegrationAttachment;
  const createWorkspaceAttachment =
    services?.createWorkspaceAttachment || createRunnerWorkspaceAttachment;

  const resetAttaching = useCallback(() => {
    setIsAttaching(false);
  }, []);

  const attachWorkspaceFiles = useCallback(async (): Promise<boolean> => {
    const selectedItems = workspaceItems.filter(
      (item) => selectedWorkspaceFileIds.includes(item.id) && !item.isFolder,
    );
    if (!selectedItems.length) return false;

    if (!activeWorkspaceEnvironmentId) {
      onWorkspaceError("Select an environment to browse workspace files.");
      return false;
    }

    const remainingCapacity = Math.max(maxAttachments - attachmentCount, 0);
    const itemsToAttach = selectedItems.slice(0, remainingCapacity);
    if (!itemsToAttach.length) return false;

    onError(null);
    setIsAttaching(true);
    try {
      const createdAttachments = await Promise.all(
        itemsToAttach.map((item) =>
          createWorkspaceAttachment({
            backendUrl,
            item,
            sourceEnvironmentId: activeWorkspaceEnvironmentId,
          }),
        ),
      );
      addAttachments(createdAttachments);
      workspaceConfig?.onAttach?.(itemsToAttach.map((item) => item.id));
      setSelectedWorkspaceFileIds([]);
      closeInputPopups();
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onError(normalizedError.message || "Failed to attach workspace files.");
      return false;
    } finally {
      setIsAttaching(false);
    }
  }, [
    activeWorkspaceEnvironmentId,
    addAttachments,
    attachmentCount,
    backendUrl,
    closeInputPopups,
    createWorkspaceAttachment,
    maxAttachments,
    onError,
    onWorkspaceError,
    selectedWorkspaceFileIds,
    setSelectedWorkspaceFileIds,
    workspaceConfig,
    workspaceItems,
  ]);

  const attachIntegrationFiles = useCallback(
    async (source: RunnerIntegrationAttachmentSource): Promise<boolean> => {
      const config =
        source === "google-drive"
          ? googleDriveConfig
          : source === "one-drive"
            ? oneDriveConfig
            : githubConfig;
      const items =
        source === "google-drive"
          ? googleDriveItems
          : source === "one-drive"
            ? oneDriveItems
            : githubItems;
      const selectedIds =
        source === "google-drive"
          ? selectedGoogleDriveFileIds
          : source === "one-drive"
            ? selectedOneDriveFileIds
            : selectedGithubFileIds;
      const selectedItems = items.filter(
        (item) => selectedIds.includes(item.id) && (source === "github" || !item.isFolder),
      );
      if (!selectedItems.length) return false;

      const targetEnvironmentId = resolveUploadEnvironmentId();
      if (!targetEnvironmentId) {
        onError("Select an environment before attaching files.");
        return false;
      }
      const fetchFileContent = config?.fetchFileContent;
      if (source !== "github" && !fetchFileContent) {
        onError("This integration does not support file downloads.");
        return false;
      }

      if (source === "github") {
        const selectedRepoFullNames = Array.from(
          new Set(
            selectedItems.map((item) => String(item.repoFullName || "").trim()).filter(Boolean),
          ),
        );
        if (selectedRepoFullNames.length > 1) {
          onError("Attach files from a single GitHub repository per message.");
          return false;
        }
      }

      const remainingCapacity = Math.max(maxAttachments - attachmentCount, 0);
      const itemsToAttach = selectedItems.slice(0, remainingCapacity);
      if (!itemsToAttach.length) return false;
      const createDownloadedAttachment = (item: RunnerChatFileNode): Promise<LocalAttachment> => {
        if (!fetchFileContent) {
          return Promise.reject(new Error("This integration does not support file downloads."));
        }
        return createIntegrationAttachment({
          apiKey,
          backendUrl,
          fetchFileContent,
          accountId:
            source === "google-drive"
              ? googleDriveAccountId
              : source === "one-drive"
                ? oneDriveAccountId
                : githubAccountId,
          item,
          requestHeaders,
          source,
          targetEnvironmentId,
        });
      };

      onError(null);
      setIsAttaching(true);
      try {
        const createdAttachments =
          source === "github"
            ? itemsToAttach.map((item) =>
                createGithubAttachment({
                  getSelectedBranch: getGithubSelectedBranch,
                  item,
                  targetEnvironmentId,
                  pendingPreparation: Boolean(backendUrl && apiKey.trim()),
                }),
              )
            : await Promise.all(itemsToAttach.map(createDownloadedAttachment));
        addAttachments(createdAttachments);
        if (source === "github") {
          for (const attachment of createdAttachments) {
            const uploadPromise = beginAttachmentUpload(attachment, {
              environmentIdOverride: targetEnvironmentId,
            });
            if (uploadPromise) {
              void uploadPromise.catch((error) => {
                const normalizedError = error instanceof Error ? error : new Error(String(error));
                onError(normalizedError.message || "Failed to prepare GitHub repository.");
              });
            }
          }
        }

        config?.onAttach?.(itemsToAttach.map((item) => item.id));
        if (source === "google-drive") {
          setSelectedGoogleDriveFileIds([]);
        } else if (source === "one-drive") {
          setSelectedOneDriveFileIds([]);
        } else {
          setSelectedGithubFileIds([]);
        }
        closeInputPopups();
        return true;
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        onError(normalizedError.message || "Failed to attach files.");
        return false;
      } finally {
        setIsAttaching(false);
      }
    },
    [
      addAttachments,
      apiKey,
      attachmentCount,
      backendUrl,
      beginAttachmentUpload,
      closeInputPopups,
      createGithubAttachment,
      createIntegrationAttachment,
      getGithubSelectedBranch,
      githubConfig,
      githubAccountId,
      githubItems,
      googleDriveConfig,
      googleDriveAccountId,
      googleDriveItems,
      maxAttachments,
      onError,
      oneDriveConfig,
      oneDriveAccountId,
      oneDriveItems,
      requestHeaders,
      resolveUploadEnvironmentId,
      selectedGithubFileIds,
      selectedGoogleDriveFileIds,
      selectedOneDriveFileIds,
      setSelectedGithubFileIds,
      setSelectedGoogleDriveFileIds,
      setSelectedOneDriveFileIds,
    ],
  );

  return {
    attachIntegrationFiles,
    attachWorkspaceFiles,
    isAttaching,
    resetAttaching,
  };
}
