import {
  ChevronDown as LucideChevronDown,
  ChevronRight as LucideChevronRight,
  LoaderCircle as LucideLoaderCircle,
} from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildRunnerPreviewDirectoryListUrl,
  normalizeRunnerPreviewDirectoryEntries,
  normalizeRunnerPreviewWorkspacePath,
  type RunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
  type RunnerPreviewDirectoryEntry,
} from "../../../../react/runner-document-preview.js";
import {
  type AttachmentDirectoryPreviewState,
  formatRunnerPreviewFileDate,
  formatRunnerPreviewFileSize,
  isRunnerPreviewImageEntry,
  toAbsoluteRunnerWorkspacePath,
} from "./preview-state.js";

const RUNNER_FOLDER_ICON_URL = new URL(
  "../../../../react/assets/folder.png",
  import.meta.url,
).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL(
  "../../../../react/assets/imgicon.webp",
  import.meta.url,
).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL(
  "../../../../react/assets/txtfile.png",
  import.meta.url,
).toString();

interface RunnerDirectoryPreviewProps {
  activeDirectoryAbsolutePath: string;
  directoryPath: string;
  state: AttachmentDirectoryPreviewState;
  entriesByPath: Record<string, RunnerPreviewDirectoryEntry[]>;
  loadingPaths: string[];
  errorsByPath: Record<string, string>;
  expandedPaths: string[];
  onEntryOpen: (entry: RunnerPreviewDirectoryEntry) => void;
  onFolderToggle: (entry: RunnerPreviewDirectoryEntry) => void;
}

export interface RunnerDirectoryPreviewController {
  canAttemptDirectoryPreview: boolean;
  shouldRenderDirectoryPreview: boolean;
  isDirectoryLikePreview: boolean;
  previewProps: RunnerDirectoryPreviewProps;
}

export interface UseRunnerDirectoryPreviewOptions {
  attachment: RunnerPreviewAttachment;
  attachmentPreviewKind: RunnerDocumentPreviewKind | null;
  backendUrl?: string;
  environmentId: string;
  isImageAttachment: boolean;
  requestHeaders: HeadersInit;
  onWorkspacePathOpen?: (path: string, options?: { isFolder?: boolean }) => void;
}

export function useRunnerDirectoryPreview({
  attachment,
  attachmentPreviewKind,
  backendUrl,
  environmentId,
  isImageAttachment,
  requestHeaders,
  onWorkspacePathOpen,
}: UseRunnerDirectoryPreviewOptions): RunnerDirectoryPreviewController {
  const directoryPath = normalizeRunnerPreviewWorkspacePath(
    attachment.workspacePath || attachment.id,
  );
  const [state, setState] = useState<AttachmentDirectoryPreviewState>({
    status: "idle",
    folderPath: directoryPath,
    entries: [],
  });
  const [entriesByPath, setEntriesByPath] = useState<Record<string, RunnerPreviewDirectoryEntry[]>>(
    {},
  );
  const [loadingPaths, setLoadingPaths] = useState<string[]>([]);
  const [errorsByPath, setErrorsByPath] = useState<Record<string, string>>({});
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);
  const entriesByPathRef = useRef(entriesByPath);
  const loadingPathSetRef = useRef(new Set<string>());
  const requestHeadersRef = useRef(requestHeaders);
  const resetAttachmentId = attachment.id;
  requestHeadersRef.current = requestHeaders;
  const requestHeadersSignature = JSON.stringify(
    Array.from(new Headers(requestHeaders).entries()).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey),
    ),
  );

  const isExplicitDirectoryAttachment = Boolean(
    attachment.isFolder || attachmentPreviewKind === "directory",
  );
  const canAttemptDirectoryPreview = Boolean(
    !isImageAttachment &&
      backendUrl &&
      environmentId &&
      directoryPath &&
      (isExplicitDirectoryAttachment || attachmentPreviewKind === "unsupported"),
  );
  const shouldRenderDirectoryPreview =
    canAttemptDirectoryPreview &&
    state.status !== "idle" &&
    (state.status !== "not-directory" || isExplicitDirectoryAttachment);

  useEffect(() => {
    void resetAttachmentId;
    entriesByPathRef.current = {};
    loadingPathSetRef.current = new Set();
    setState({
      status: "idle",
      folderPath: directoryPath,
      entries: [],
      error: null,
    });
    setEntriesByPath({});
    setLoadingPaths([]);
    setErrorsByPath({});
    setExpandedPaths([]);
  }, [directoryPath, resetAttachmentId]);

  const loadDirectoryFolder = useCallback(
    async (folderPath: string, options?: { root?: boolean; signal?: AbortSignal }) => {
      void requestHeadersSignature;
      const normalizedFolderPath = normalizeRunnerPreviewWorkspacePath(folderPath);
      const isRootRequest = Boolean(options?.root);
      const requestUrl = buildRunnerPreviewDirectoryListUrl(
        backendUrl,
        environmentId,
        normalizedFolderPath,
        1,
      );
      if (!requestUrl) {
        const errorMessage = "Folder preview is unavailable for this environment.";
        if (isRootRequest) {
          setState({
            status: isExplicitDirectoryAttachment ? "error" : "not-directory",
            folderPath: normalizedFolderPath,
            entries: [],
            error: errorMessage,
          });
        }
        setErrorsByPath((current) => ({
          ...current,
          [normalizedFolderPath]: errorMessage,
        }));
        return;
      }

      if (loadingPathSetRef.current.has(normalizedFolderPath)) {
        return;
      }

      loadingPathSetRef.current.add(normalizedFolderPath);
      setLoadingPaths(Array.from(loadingPathSetRef.current));
      setErrorsByPath((current) => ({
        ...current,
        [normalizedFolderPath]: "",
      }));
      if (isRootRequest) {
        setState({
          status: "loading",
          folderPath: normalizedFolderPath,
          entries: entriesByPathRef.current[normalizedFolderPath] || [],
          error: null,
        });
      }

      try {
        const response = await fetch(requestUrl, {
          method: "GET",
          headers: requestHeadersRef.current,
          signal: options?.signal,
        });
        const text = await response.text();
        let parsed: unknown = {};
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          parsed = { message: text };
        }
        if (!response.ok) {
          const record =
            parsed && typeof parsed === "object" && !Array.isArray(parsed)
              ? (parsed as Record<string, unknown>)
              : {};
          const message =
            typeof record.message === "string"
              ? record.message
              : typeof record.error === "string"
                ? record.error
                : `Failed to load folder (${response.status})`;
          const error = new Error(message);
          (error as Error & { status?: number }).status = response.status;
          throw error;
        }

        const entries = normalizeRunnerPreviewDirectoryEntries(parsed, normalizedFolderPath);
        const nextEntriesByPath = {
          ...entriesByPathRef.current,
          [normalizedFolderPath]: entries,
        };
        entriesByPathRef.current = nextEntriesByPath;
        setEntriesByPath(nextEntriesByPath);
        setErrorsByPath((current) => ({
          ...current,
          [normalizedFolderPath]: "",
        }));
        if (isRootRequest) {
          setState({
            status: "ready",
            folderPath: normalizedFolderPath,
            entries,
            error: null,
          });
        }
      } catch (error) {
        if (options?.signal?.aborted) {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        const status =
          typeof (normalizedError as Error & { status?: unknown }).status === "number"
            ? (normalizedError as Error & { status: number }).status
            : 0;
        const shouldTreatAsNotDirectory =
          !isExplicitDirectoryAttachment && (status === 400 || status === 404);
        const errorMessage = normalizedError.message || "Failed to load folder.";
        setErrorsByPath((current) => ({
          ...current,
          [normalizedFolderPath]: errorMessage,
        }));
        if (isRootRequest) {
          setState({
            status: shouldTreatAsNotDirectory ? "not-directory" : "error",
            folderPath: normalizedFolderPath,
            entries: [],
            error: errorMessage,
          });
        }
      } finally {
        loadingPathSetRef.current.delete(normalizedFolderPath);
        setLoadingPaths(Array.from(loadingPathSetRef.current));
      }
    },
    [backendUrl, environmentId, isExplicitDirectoryAttachment, requestHeadersSignature],
  );

  useEffect(() => {
    if (!canAttemptDirectoryPreview) {
      setState({
        status: "idle",
        folderPath: directoryPath,
        entries: [],
        error: null,
      });
      return;
    }

    const controller = new AbortController();
    void loadDirectoryFolder(directoryPath, {
      root: true,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [canAttemptDirectoryPreview, directoryPath, loadDirectoryFolder]);

  const handleEntryOpen = useCallback(
    (entry: RunnerPreviewDirectoryEntry) => {
      onWorkspacePathOpen?.(toAbsoluteRunnerWorkspacePath(entry.path), {
        isFolder: entry.isFolder,
      });
    },
    [onWorkspacePathOpen],
  );

  const handleFolderToggle = useCallback(
    (entry: RunnerPreviewDirectoryEntry) => {
      if (!entry.isFolder) {
        return;
      }
      const normalizedPath = normalizeRunnerPreviewWorkspacePath(entry.path);
      if (!normalizedPath) {
        return;
      }
      const isExpanded = expandedPaths.includes(normalizedPath);
      setExpandedPaths((current) =>
        current.includes(normalizedPath)
          ? current.filter((path) => path !== normalizedPath)
          : [...current, normalizedPath],
      );
      if (!isExpanded && !entriesByPathRef.current[normalizedPath]) {
        void loadDirectoryFolder(normalizedPath);
      }
    },
    [expandedPaths, loadDirectoryFolder],
  );

  const previewProps = useMemo<RunnerDirectoryPreviewProps>(
    () => ({
      activeDirectoryAbsolutePath: toAbsoluteRunnerWorkspacePath(directoryPath),
      directoryPath,
      state,
      entriesByPath,
      loadingPaths,
      errorsByPath,
      expandedPaths,
      onEntryOpen: handleEntryOpen,
      onFolderToggle: handleFolderToggle,
    }),
    [
      directoryPath,
      entriesByPath,
      errorsByPath,
      expandedPaths,
      handleEntryOpen,
      handleFolderToggle,
      loadingPaths,
      state,
    ],
  );

  return {
    canAttemptDirectoryPreview,
    shouldRenderDirectoryPreview,
    isDirectoryLikePreview: shouldRenderDirectoryPreview || isExplicitDirectoryAttachment,
    previewProps,
  };
}

function RunnerDirectoryEntryIcon({ entry }: { entry: RunnerPreviewDirectoryEntry }) {
  const iconUrl = entry.isFolder
    ? RUNNER_FOLDER_ICON_URL
    : isRunnerPreviewImageEntry(entry)
      ? RUNNER_IMAGE_FILE_ICON_URL
      : RUNNER_TEXT_FILE_ICON_URL;
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`tb-attachment-preview-directory-icon-asset ${
        entry.isFolder ? "is-folder" : "is-file"
      }`.trim()}
    />
  );
}

export function RunnerDirectoryPreview({
  activeDirectoryAbsolutePath,
  directoryPath,
  state,
  entriesByPath,
  loadingPaths,
  errorsByPath,
  expandedPaths,
  onEntryOpen,
  onFolderToggle,
}: RunnerDirectoryPreviewProps) {
  const rootEntries = entriesByPath[directoryPath] || state.entries;

  function renderEntry(entry: RunnerPreviewDirectoryEntry, depth = 0): ReactNode {
    const normalizedPath = normalizeRunnerPreviewWorkspacePath(entry.path);
    const isExpanded = entry.isFolder && expandedPaths.includes(normalizedPath);
    const isLoading = entry.isFolder && loadingPaths.includes(normalizedPath);
    const error = entry.isFolder ? errorsByPath[normalizedPath] || "" : "";
    const childEntries = entry.isFolder ? entriesByPath[normalizedPath] || [] : [];

    return (
      <li
        key={entry.id}
        className="tb-attachment-preview-directory-node"
        style={{ listStyle: "none" }}
      >
        <button
          type="button"
          className={`tb-attachment-preview-directory-row ${
            entry.isFolder ? "is-folder" : "is-file"
          }`.trim()}
          title={toAbsoluteRunnerWorkspacePath(entry.path)}
          style={{ paddingLeft: `${9 + depth * 18}px` }}
          onClick={() => {
            if (entry.isFolder) {
              onFolderToggle(entry);
              return;
            }
            onEntryOpen(entry);
          }}
          onDoubleClick={() => {
            if (entry.isFolder) {
              onEntryOpen(entry);
            }
          }}
        >
          <span className="tb-attachment-preview-directory-chevron-slot" aria-hidden="true">
            {entry.isFolder ? (
              isLoading ? (
                <LucideLoaderCircle
                  className="tb-attachment-preview-directory-chevron tb-context-action-notice-icon-spinner"
                  strokeWidth={1.8}
                />
              ) : isExpanded ? (
                <LucideChevronDown
                  className="tb-attachment-preview-directory-chevron is-expanded"
                  strokeWidth={1.8}
                />
              ) : (
                <LucideChevronRight
                  className="tb-attachment-preview-directory-chevron"
                  strokeWidth={1.8}
                />
              )
            ) : null}
          </span>
          <span className="tb-attachment-preview-directory-icon-slot" aria-hidden="true">
            <RunnerDirectoryEntryIcon entry={entry} />
          </span>
          <span className="tb-attachment-preview-directory-copy">
            <span className="tb-attachment-preview-directory-name">{entry.name}</span>
            <span className="tb-attachment-preview-directory-meta">
              {entry.isFolder
                ? "Folder"
                : formatRunnerPreviewFileSize(entry.size) || entry.mimeType || "File"}
              {formatRunnerPreviewFileDate(entry.modifiedTime)
                ? ` • ${formatRunnerPreviewFileDate(entry.modifiedTime)}`
                : ""}
            </span>
          </span>
        </button>
        {isExpanded ? (
          <ul
            className="tb-attachment-preview-directory-children"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {childEntries.length > 0 ? (
              childEntries.map((childEntry) => renderEntry(childEntry, depth + 1))
            ) : !isLoading && !error ? (
              <li
                className="tb-attachment-preview-directory-empty-row"
                style={{
                  listStyle: "none",
                  paddingLeft: `${47 + (depth + 1) * 18}px`,
                }}
              >
                Empty folder
              </li>
            ) : null}
            {error && childEntries.length === 0 ? (
              <li
                className="tb-attachment-preview-directory-empty-row is-error"
                style={{
                  listStyle: "none",
                  paddingLeft: `${47 + (depth + 1) * 18}px`,
                }}
              >
                {error}
              </li>
            ) : null}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="tb-attachment-preview-directory">
      <div className="tb-attachment-preview-directory-path" title={activeDirectoryAbsolutePath}>
        {activeDirectoryAbsolutePath}
      </div>
      {state.status === "loading" ? (
        <div className="tb-attachment-preview-state">
          <LucideLoaderCircle
            className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner"
            strokeWidth={1.8}
          />
          <span>Loading folder…</span>
        </div>
      ) : state.status === "error" ? (
        <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
          <img
            src={RUNNER_FOLDER_ICON_URL}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="tb-attachment-preview-state-icon-asset"
          />
          <span>{state.error || "Failed to load folder."}</span>
        </div>
      ) : rootEntries.length === 0 ? (
        <div className="tb-attachment-preview-directory-empty">
          <img
            src={RUNNER_FOLDER_ICON_URL}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="tb-attachment-preview-directory-empty-icon"
          />
          <span>This folder is empty.</span>
        </div>
      ) : (
        <ul
          className="tb-attachment-preview-directory-list"
          style={{ listStyle: "none", margin: 0 }}
        >
          {rootEntries.map((entry) => renderEntry(entry))}
        </ul>
      )}
    </div>
  );
}
