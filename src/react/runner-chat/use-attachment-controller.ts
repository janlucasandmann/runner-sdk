import { useCallback, useEffect, useRef, useState } from "react";

import { uploadAttachment } from "./attachment-api.js";
import { buildRunnerHeaders } from "./api-utils.js";
import type {
  LocalAttachment,
  RunnerAttachment,
  RunnerTurnAttachment,
} from "./attachment-types.js";
import {
  attachmentTypeForFile,
  mergeAttachmentReferenceMetadata,
} from "./attachment-utils.js";
import { prepareGithubRepositorySelection, startEnvironment } from "./environment-api.js";
import { generateRunnerClientId } from "./id-utils.js";
import { resolveRunnerPromptAttachmentSourceUrl } from "./prompt-attachments.js";

type RunnerFileAttachmentMapper = (file: File) => Promise<RunnerAttachment> | RunnerAttachment;

type RunnerFileAttachmentUploader = (files: File[]) => Promise<RunnerAttachment[]>;

interface RunnerAttachmentControllerServices {
  createObjectUrl: (file: File) => string;
  fetchAttachmentSource: (params: {
    filename: string;
    mimeType: string;
    requestHeaders?: HeadersInit;
    url: string;
  }) => Promise<File>;
  now: () => Date;
  prepareGithubRepository: typeof prepareGithubRepositorySelection;
  revokeObjectUrl: (url: string) => void;
  startEnvironment: typeof startEnvironment;
  uploadAttachment: typeof uploadAttachment;
}

async function fetchAttachmentSource({
  filename,
  mimeType,
  requestHeaders,
  url,
}: {
  filename: string;
  mimeType: string;
  requestHeaders?: HeadersInit;
  url: string;
}): Promise<File> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: requestHeaders,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to load saved prompt attachment ${filename} (${response.status}).`,
    );
  }
  const blob = await response.blob();
  if (blob.size <= 0) {
    throw new Error(`Saved prompt attachment ${filename} is empty.`);
  }
  const responseMimeType = String(response.headers.get("content-type") || "")
    .split(";", 1)[0]
    .trim();
  const normalizedMimeType = !mimeType || mimeType.endsWith("/*")
    ? responseMimeType || "application/octet-stream"
    : mimeType;
  return new File([blob], filename, {
    type: normalizedMimeType,
  });
}

export interface UseRunnerAttachmentControllerOptions {
  apiKey: string;
  backendUrl: string;
  mapFileToAttachment?: RunnerFileAttachmentMapper;
  maxAttachments: number;
  onTurnAttachmentPatch: (attachmentId: string, patch: Partial<RunnerTurnAttachment>) => void;
  requestHeaders?: HeadersInit;
  selectedAgentId?: string | null;
  services?: Partial<RunnerAttachmentControllerServices>;
  uploadEnvironmentId?: string | null;
  uploadFiles?: RunnerFileAttachmentUploader;
}

function createDefaultAttachment(file: File, now: () => Date): RunnerAttachment {
  return {
    id: generateRunnerClientId("att"),
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    type: file.type.startsWith("image/") ? "image" : "document",
    uploadedAt: now().toISOString(),
  };
}

export function useRunnerAttachmentController({
  apiKey,
  backendUrl,
  mapFileToAttachment,
  maxAttachments,
  onTurnAttachmentPatch,
  requestHeaders,
  selectedAgentId,
  services,
  uploadEnvironmentId = null,
  uploadFiles,
}: UseRunnerAttachmentControllerOptions) {
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const attachmentsRef = useRef<LocalAttachment[]>([]);
  const attachmentUploadPromisesRef = useRef<Record<string, Promise<RunnerAttachment> | undefined>>(
    {},
  );
  const githubPreparationPromisesRef = useRef<Record<string, Promise<void> | undefined>>({});
  const serviceRef = useRef<RunnerAttachmentControllerServices>({
    createObjectUrl: (file) => URL.createObjectURL(file),
    fetchAttachmentSource,
    now: () => new Date(),
    prepareGithubRepository: prepareGithubRepositorySelection,
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
    startEnvironment,
    uploadAttachment,
    ...services,
  });

  useEffect(() => {
    serviceRef.current = {
      createObjectUrl: (file) => URL.createObjectURL(file),
      fetchAttachmentSource,
      now: () => new Date(),
      prepareGithubRepository: prepareGithubRepositorySelection,
      revokeObjectUrl: (url) => URL.revokeObjectURL(url),
      startEnvironment,
      uploadAttachment,
      ...services,
    };
  }, [services]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => {
      for (const attachment of attachmentsRef.current) {
        if (attachment.previewUrl) {
          serviceRef.current.revokeObjectUrl(attachment.previewUrl);
        }
      }
    },
    [],
  );

  const applyAttachmentStatePatch = useCallback(
    (attachmentId: string, patch: Partial<LocalAttachment> & Partial<RunnerTurnAttachment>) => {
      setAttachments((current) =>
        current.map((entry) =>
          entry.id === attachmentId
            ? {
                ...entry,
                ...patch,
              }
            : entry,
        ),
      );
      onTurnAttachmentPatch(attachmentId, patch);
    },
    [onTurnAttachmentPatch],
  );

  const getOrCreateGithubPreparation = useCallback(
    (key: string, prepare: () => Promise<void>): Promise<void> => {
      let preparationPromise = githubPreparationPromisesRef.current[key];
      if (!preparationPromise) {
        preparationPromise = prepare().finally(() => {
          delete githubPreparationPromisesRef.current[key];
        });
        githubPreparationPromisesRef.current[key] = preparationPromise;
      }
      return preparationPromise;
    },
    [],
  );

  const ensureGithubSelectionPrepared = useCallback(
    async (attachment: LocalAttachment, targetEnvironmentId: string): Promise<RunnerAttachment> => {
      if (!attachment.resolvedAttachment) {
        throw new Error("Missing GitHub attachment metadata.");
      }

      const repoFullName = String(attachment.githubRepoFullName || "").trim();
      const branch = String(attachment.githubRef || "").trim() || "main";
      if (!repoFullName) {
        throw new Error("Missing GitHub repository metadata.");
      }

      if (!backendUrl || !apiKey.trim()) {
        return attachment.resolvedAttachment;
      }

      const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
      await getOrCreateGithubPreparation(preparationKey, async () => {
        await serviceRef.current.startEnvironment({
          backendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          ...(selectedAgentId ? { agentId: selectedAgentId } : {}),
          force: true,
        });
        await serviceRef.current.prepareGithubRepository({
          backendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          repoFullName,
          branch,
        });
      });

      return attachment.resolvedAttachment;
    },
    [apiKey, backendUrl, getOrCreateGithubPreparation, requestHeaders, selectedAgentId],
  );

  const prepareGithubRepoForThreadRun = useCallback(
    async (
      repoSelection: { repoFullName: string; branch: string },
      targetEnvironmentId: string,
    ): Promise<void> => {
      const repoFullName = String(repoSelection?.repoFullName || "").trim();
      const branch = String(repoSelection?.branch || "").trim() || "main";
      if (!repoFullName || !targetEnvironmentId || !backendUrl || !apiKey.trim()) {
        return;
      }

      const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
      await getOrCreateGithubPreparation(preparationKey, () =>
        serviceRef.current.prepareGithubRepository({
          backendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          repoFullName,
          branch,
        }),
      );
    },
    [apiKey, backendUrl, getOrCreateGithubPreparation, requestHeaders],
  );

  const resolveSingleAttachment = useCallback(
    async (
      attachment: LocalAttachment,
      environmentIdOverride?: string | null,
    ): Promise<RunnerAttachment> => {
      if (attachment.integrationSource === "github") {
        const targetEnvironmentId =
          environmentIdOverride === undefined ? uploadEnvironmentId : environmentIdOverride;
        if (!targetEnvironmentId) {
          throw new Error("Select an environment before attaching GitHub repositories.");
        }
        return ensureGithubSelectionPrepared(attachment, targetEnvironmentId);
      }

      if (attachment.resolvedAttachment) {
        return attachment.resolvedAttachment;
      }

      let uploadFile = attachment.file;
      if (attachment.sourceAttachmentUrl && attachment.sourceAttachmentId) {
        const trustedSourceUrl = resolveRunnerPromptAttachmentSourceUrl(
          attachment.sourceAttachmentUrl,
          attachment.sourceAttachmentId,
          { backendUrl },
        );
        if (!trustedSourceUrl) {
          throw new Error(
            `Saved prompt attachment ${attachment.file.name} has an invalid source.`,
          );
        }
        uploadFile = await serviceRef.current.fetchAttachmentSource({
          filename: attachment.file.name,
          mimeType: attachment.file.type,
          requestHeaders: buildRunnerHeaders(requestHeaders, apiKey.trim()),
          url: trustedSourceUrl,
        });
        attachment.file = uploadFile;
        attachment.type = attachmentTypeForFile(uploadFile.type, uploadFile.name);
      }

      if (uploadFiles) {
        const uploaded = await uploadFiles([uploadFile]);
        const uploadedAttachment = uploaded[0];
        if (!uploadedAttachment) {
          throw new Error(`Failed to upload ${uploadFile.name}.`);
        }
        return uploadedAttachment;
      }

      if (mapFileToAttachment) {
        return mapFileToAttachment(uploadFile);
      }

      if (backendUrl && apiKey.trim()) {
        return serviceRef.current.uploadAttachment({
          backendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          file: uploadFile,
          ...(environmentIdOverride ? { environmentId: environmentIdOverride } : {}),
        });
      }

      return createDefaultAttachment(uploadFile, serviceRef.current.now);
    },
    [
      apiKey,
      backendUrl,
      ensureGithubSelectionPrepared,
      mapFileToAttachment,
      requestHeaders,
      uploadEnvironmentId,
      uploadFiles,
    ],
  );

  const beginAttachmentUpload = useCallback(
    (
      attachment: LocalAttachment,
      options?: { environmentIdOverride?: string | null },
    ): Promise<RunnerAttachment> | undefined => {
      // Knowledge references are durable library/version bindings, not files.
      // The execution gateway resolves them server-side through the Knowledge
      // retrieval context, so never upload a synthetic markdown copy here.
      if (attachment.referenceType === "knowledge") {
        return undefined;
      }

      if (attachment.resolvedAttachment && attachment.integrationSource !== "github") {
        return Promise.resolve(attachment.resolvedAttachment);
      }

      if (
        attachment.integrationSource === "github" &&
        attachment.resolvedAttachment &&
        attachment.uploadStatus === "uploaded"
      ) {
        return Promise.resolve(attachment.resolvedAttachment);
      }

      const existingPromise = attachmentUploadPromisesRef.current[attachment.id];
      if (existingPromise) {
        return existingPromise;
      }

      const targetEnvironmentId =
        options?.environmentIdOverride === undefined
          ? uploadEnvironmentId
          : options.environmentIdOverride;
      const uploadPromise = resolveSingleAttachment(attachment, targetEnvironmentId)
        .then((resolvedAttachment) => {
          const resolvedWithReferenceMetadata = mergeAttachmentReferenceMetadata(
            attachment,
            resolvedAttachment,
          );
          attachment.resolvedAttachment = resolvedWithReferenceMetadata;
          attachment.uploadStatus = "uploaded";
          attachment.uploadError = null;
          applyAttachmentStatePatch(attachment.id, {
            resolvedAttachment: resolvedWithReferenceMetadata,
            uploadStatus: "uploaded",
            uploadError: null,
          });
          return resolvedWithReferenceMetadata;
        })
        .catch((error) => {
          const normalizedError = error instanceof Error ? error : new Error(String(error));
          const uploadError =
            normalizedError.message || `Failed to upload ${attachment.file.name}.`;
          attachment.uploadStatus = "failed";
          attachment.uploadError = uploadError;
          applyAttachmentStatePatch(attachment.id, {
            uploadStatus: "failed",
            uploadError,
          });
          throw normalizedError;
        })
        .finally(() => {
          delete attachmentUploadPromisesRef.current[attachment.id];
        });

      attachmentUploadPromisesRef.current[attachment.id] = uploadPromise;
      attachment.uploadStatus = "uploading";
      attachment.uploadError = null;
      applyAttachmentStatePatch(attachment.id, {
        uploadStatus: "uploading",
        uploadError: null,
      });

      return uploadPromise;
    },
    [applyAttachmentStatePatch, resolveSingleAttachment, uploadEnvironmentId],
  );

  const appendFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      const remainingCapacity = Math.max(maxAttachments - attachmentsRef.current.length, 0);
      const incoming: LocalAttachment[] = files.slice(0, remainingCapacity).map((file) => ({
        id: generateRunnerClientId("local"),
        file,
        type: attachmentTypeForFile(file.type, file.name),
        previewUrl: file.type.startsWith("image/")
          ? serviceRef.current.createObjectUrl(file)
          : undefined,
        source: "local",
        uploadStatus:
          uploadFiles || mapFileToAttachment || (backendUrl && apiKey.trim())
            ? "uploading"
            : "idle",
        uploadError: null,
      }));
      if (!incoming.length) return;

      setAttachments((current) => [...current, ...incoming]);
      for (const attachment of incoming) {
        if (attachment.uploadStatus !== "uploading") continue;
        const uploadPromise = beginAttachmentUpload(attachment);
        if (uploadPromise) {
          void uploadPromise.catch(() => undefined);
        }
      }
    },
    [apiKey, backendUrl, beginAttachmentUpload, mapFileToAttachment, maxAttachments, uploadFiles],
  );

  const addAttachments = useCallback((entries: LocalAttachment[]) => {
    if (!entries.length) return;
    setAttachments((current) => [...current, ...entries]);
  }, []);

  const clearComposerAttachments = useCallback(
    (entries?: LocalAttachment[], options?: { revokePreviews?: boolean }) => {
      const attachmentsToClear = entries || attachmentsRef.current;
      if (options?.revokePreviews !== false) {
        for (const attachment of attachmentsToClear) {
          if (attachment.previewUrl) {
            serviceRef.current.revokeObjectUrl(attachment.previewUrl);
          }
        }
      }
      setAttachments([]);
    },
    [],
  );

  const pruneWorkspaceAttachmentsForEnvironment = useCallback((nextEnvironmentId: string) => {
    setAttachments((current) => {
      const removed: LocalAttachment[] = [];
      const kept = current.filter((attachment) => {
        const shouldRemove =
          attachment.source === "workspace" &&
          Boolean(attachment.sourceEnvironmentId) &&
          attachment.sourceEnvironmentId !== nextEnvironmentId;
        if (shouldRemove) removed.push(attachment);
        return !shouldRemove;
      });
      for (const attachment of removed) {
        if (attachment.previewUrl) {
          serviceRef.current.revokeObjectUrl(attachment.previewUrl);
        }
      }
      return removed.length > 0 ? kept : current;
    });
  }, []);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === attachmentId);
      if (target?.previewUrl) {
        serviceRef.current.revokeObjectUrl(target.previewUrl);
      }
      delete attachmentUploadPromisesRef.current[attachmentId];
      return current.filter((item) => item.id !== attachmentId);
    });
  }, []);

  const resolveAttachmentPayload = useCallback(
    async (
      files: LocalAttachment[],
      environmentIdOverride?: string | null,
    ): Promise<RunnerAttachment[] | undefined> => {
      const materializedFiles = files.filter(
        (entry) => entry.referenceType !== "knowledge",
      );
      if (!materializedFiles.length) return undefined;

      await Promise.all(
        materializedFiles
          .map((entry) => attachmentUploadPromisesRef.current[entry.id])
          .filter((uploadPromise): uploadPromise is Promise<RunnerAttachment> =>
            Boolean(uploadPromise),
          )
          .map((uploadPromise) => uploadPromise.catch(() => undefined)),
      );

      const resolvedAttachments = materializedFiles
        .map((entry) => (
          entry.resolvedAttachment
            ? mergeAttachmentReferenceMetadata(entry, entry.resolvedAttachment)
            : null
        ))
        .filter((attachment): attachment is RunnerAttachment => Boolean(attachment));
      const unresolvedFiles = materializedFiles.filter((entry) => !entry.resolvedAttachment);
      if (!unresolvedFiles.length) {
        return resolvedAttachments.length ? resolvedAttachments : undefined;
      }

      const targetEnvironmentId =
        environmentIdOverride === undefined ? uploadEnvironmentId : environmentIdOverride;
      const uploaded = await Promise.all(
        unresolvedFiles.map(
          (entry) =>
            beginAttachmentUpload(entry, {
              environmentIdOverride: targetEnvironmentId,
            }) || resolveSingleAttachment(entry, targetEnvironmentId),
        ),
      );
      const combined = [...resolvedAttachments, ...uploaded];
      return combined.length ? combined : undefined;
    },
    [beginAttachmentUpload, resolveSingleAttachment, uploadEnvironmentId],
  );

  return {
    addAttachments,
    appendFiles,
    attachments,
    beginAttachmentUpload,
    clearComposerAttachments,
    prepareGithubRepoForThreadRun,
    pruneWorkspaceAttachmentsForEnvironment,
    removeAttachment,
    resolveAttachmentPayload,
    resolveAttachmentUploadEnvironmentId: () => uploadEnvironmentId,
  };
}
