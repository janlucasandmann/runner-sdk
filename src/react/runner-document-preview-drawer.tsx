import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Code2 as LucideCode2,
  FileText as LucideFileText,
  LoaderCircle as LucideLoaderCircle,
  Minus as LucideMinus,
  Plus as LucidePlus,
  X as LucideX,
} from "lucide-react";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";
import {
  buildRunnerPreviewHeaders,
  buildRunnerPreviewDirectoryListUrl,
  buildRunnerPreviewHtmlDocument,
  buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl,
  getRunnerDocumentPreviewKind,
  normalizeRunnerPreviewDirectoryEntries,
  normalizeRunnerPreviewWorkspacePath,
  resolveRunnerPreviewAssetUrl,
  type RunnerDocumentPreviewKind,
  type RunnerPreviewDirectoryEntry,
  type RunnerPreviewAttachment,
} from "./runner-document-preview.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { RunnerCodeViewer } from "./runner-log-boxes.js";
import { RunnerMarkdown } from "./runner-markdown.js";

const RUNNER_FOLDER_ICON_URL = new URL("./assets/folder.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("./assets/imgicon.webp", import.meta.url).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();

interface AttachmentDocumentPreviewState {
  status: "idle" | "loading" | "ready" | "error";
  kind: RunnerDocumentPreviewKind | null;
  blob?: Blob | null;
  text?: string | null;
  error?: string | null;
}

interface AttachmentDirectoryPreviewState {
  status: "idle" | "loading" | "ready" | "error" | "not-directory";
  folderPath: string;
  entries: RunnerPreviewDirectoryEntry[];
  error?: string | null;
}

export interface RunnerDocumentPreviewDrawerProps {
  attachment: RunnerPreviewAttachment;
  backendUrl?: string;
  environmentId?: string;
  requestHeaders?: HeadersInit;
  apiKey?: string;
  className?: string;
  inline?: boolean;
  surface?: boolean;
  onClose?: () => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  headerCopy?: ReactNode;
  headerActions?: ReactNode;
  headerActionsAfterPreviewToggle?: ReactNode;
  showPreviewCodeToggle?: boolean;
  showCloseButton?: boolean;
  showResizeHandle?: boolean;
  onWorkspacePathOpen?: (path: string, options?: { isFolder?: boolean }) => void;
}

function isRunnerPreviewImageAttachment(attachment: RunnerPreviewAttachment): boolean {
  return attachment.type === "image" || String(attachment.mimeType || "").toLowerCase().startsWith("image/");
}

function getRunnerPreviewAttachmentEnvironmentId(attachment: RunnerPreviewAttachment, explicitEnvironmentId?: string | null): string {
  const directEnvironmentId = String(explicitEnvironmentId || attachment.environmentId || "").trim();
  if (directEnvironmentId) {
    return directEnvironmentId;
  }
  const idMatch = String(attachment.id || "").match(/^[^:]+:([^:]+):(?:\/workspace\/|workspace\/|.+)/);
  return String(idMatch?.[1] || "").trim();
}

function getRunnerPreviewAttachmentWorkspacePath(attachment: RunnerPreviewAttachment): string {
  const directWorkspacePath = normalizeRunnerPreviewWorkspacePath(attachment.workspacePath);
  if (directWorkspacePath) {
    return `/workspace/${directWorkspacePath}`;
  }
  const idMatch = String(attachment.id || "").match(/:(\/workspace\/.+)$/);
  return String(idMatch?.[1] || "").trim();
}

function toAbsoluteRunnerWorkspacePath(path: string): string {
  const normalizedPath = normalizeRunnerPreviewWorkspacePath(path);
  return normalizedPath ? `/workspace/${normalizedPath}` : "/workspace";
}

function formatRunnerPreviewFileSize(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "";
  }
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let nextValue = value / 1024;
  let unitIndex = 0;
  while (nextValue >= 1024 && unitIndex < units.length - 1) {
    nextValue /= 1024;
    unitIndex += 1;
  }
  return `${nextValue.toFixed(nextValue >= 10 ? 0 : 1).replace(/\.0$/, "")} ${units[unitIndex]}`;
}

function formatRunnerPreviewFileDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isRunnerPreviewImageEntry(entry: RunnerPreviewDirectoryEntry): boolean {
  const mimeType = String(entry.mimeType || "").toLowerCase();
  const name = String(entry.name || "").toLowerCase();
  return mimeType.startsWith("image/") || /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)$/.test(name);
}

export function RunnerDocumentPreviewDrawer({
  attachment,
  backendUrl,
  environmentId,
  requestHeaders,
  apiKey,
  className,
  inline = false,
  surface = false,
  onClose,
  onResizeStart,
  headerCopy,
  headerActions,
  headerActionsAfterPreviewToggle,
  showPreviewCodeToggle = true,
  showCloseButton = true,
  showResizeHandle = false,
  onWorkspacePathOpen,
}: RunnerDocumentPreviewDrawerProps) {
  const documentPreviewDocxRef = useRef<HTMLDivElement | null>(null);
  const documentPreviewPdfViewportRef = useRef<HTMLDivElement | null>(null);
  const documentPreviewObjectUrlRef = useRef<string | null>(null);
  const documentPreviewLoadKeyRef = useRef<string>("");
  const documentPreviewPdfCanvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const documentPreviewPdfPageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pdfPreviewRenderTasksRef = useRef<Array<{ cancel?: () => void; promise?: Promise<unknown> }>>([]);
  const pdfPreviewDocumentRef = useRef<any>(null);
  const [documentPreviewState, setDocumentPreviewState] = useState<AttachmentDocumentPreviewState>({
    status: "idle",
    kind: null,
  });
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewPageCount, setPdfPreviewPageCount] = useState(0);
  const [pdfPreviewPage, setPdfPreviewPage] = useState(1);
  const [pdfPreviewZoom, setPdfPreviewZoom] = useState(1);
  const [pdfPreviewViewportSize, setPdfPreviewViewportSize] = useState({ width: 0, height: 0 });
  const [isPdfPreviewRendering, setIsPdfPreviewRendering] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState<string | null>(null);
  const [markdownPreviewMode, setMarkdownPreviewMode] = useState<"rendered" | "code">("rendered");
  const initialDirectoryPath = normalizeRunnerPreviewWorkspacePath(attachment.workspacePath || attachment.id);
  const [directoryPreviewPath, setDirectoryPreviewPath] = useState(initialDirectoryPath);
  const [directoryPreviewState, setDirectoryPreviewState] = useState<AttachmentDirectoryPreviewState>({
    status: "idle",
    folderPath: initialDirectoryPath,
    entries: [],
  });
  const [directoryEntriesByPath, setDirectoryEntriesByPath] = useState<Record<string, RunnerPreviewDirectoryEntry[]>>({});
  const [directoryLoadingPaths, setDirectoryLoadingPaths] = useState<string[]>([]);
  const [directoryErrorByPath, setDirectoryErrorByPath] = useState<Record<string, string>>({});
  const [expandedDirectoryPaths, setExpandedDirectoryPaths] = useState<string[]>([]);

  const isImageAttachment = isRunnerPreviewImageAttachment(attachment);
  const attachmentPreviewKind = !isImageAttachment
    ? attachment.previewKindOverride ?? getRunnerDocumentPreviewKind(attachment)
    : null;
  const resolvedEnvironmentId = getRunnerPreviewAttachmentEnvironmentId(attachment, environmentId);
  const resolvedWorkspacePath = getRunnerPreviewAttachmentWorkspacePath(attachment);
  const isExplicitDirectoryAttachment = Boolean(attachment.isFolder || attachmentPreviewKind === "directory");
  const canAttemptDirectoryPreview = Boolean(
    !isImageAttachment &&
    backendUrl &&
    resolvedEnvironmentId &&
    initialDirectoryPath &&
    (isExplicitDirectoryAttachment || attachmentPreviewKind === "unsupported")
  );
  const shouldRenderDirectoryPreview =
    canAttemptDirectoryPreview &&
    directoryPreviewState.status !== "idle" &&
    (directoryPreviewState.status !== "not-directory" || isExplicitDirectoryAttachment);
  const isDirectoryLikePreview = shouldRenderDirectoryPreview || isExplicitDirectoryAttachment;
  const activeDirectoryAbsolutePath = toAbsoluteRunnerWorkspacePath(directoryPreviewPath);
  const canTogglePreviewCode = showPreviewCodeToggle && (attachmentPreviewKind === "markdown" || attachmentPreviewKind === "html");
  const requestHeadersWithApiKey = useMemo(
    () => buildRunnerPreviewHeaders(requestHeaders, apiKey),
    [apiKey, requestHeaders]
  );
  const requestHeadersWithApiKeySignature = useMemo(
    () => JSON.stringify(Array.from(requestHeadersWithApiKey.entries()).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))),
    [requestHeadersWithApiKey]
  );
  const resolvedImagePreviewUrl = useMemo(
    () =>
      resolveRunnerPreviewAssetUrl(attachment.previewUrl || attachment.url, backendUrl, attachment.id) ||
      resolveRunnerPreviewAssetUrl(attachment.url, backendUrl, attachment.id) ||
      "",
    [attachment.id, attachment.previewUrl, attachment.url, backendUrl]
  );
  const resolvedDirectHtmlPreviewUrl = useMemo(
    () => {
      if (typeof attachment.htmlPreviewUrl !== "string" || !attachment.htmlPreviewUrl.trim()) {
        const derivedPreviewUrl = buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl(
          attachment.previewUrl || attachment.url,
          attachment.filename,
          attachment.mimeType
        );
        return resolveRunnerPreviewAssetUrl(derivedPreviewUrl, backendUrl, attachment.id) || "";
      }
      return resolveRunnerPreviewAssetUrl(attachment.htmlPreviewUrl, backendUrl, attachment.id) || "";
    },
    [attachment.filename, attachment.htmlPreviewUrl, attachment.id, attachment.mimeType, attachment.previewUrl, attachment.url, backendUrl]
  );
  const htmlIframeSandbox = attachment.htmlSandbox === null
    ? undefined
    : attachment.htmlSandbox ?? "allow-scripts allow-same-origin";

  useEffect(() => {
    mountRunnerChatStyles();
  }, []);

  useEffect(() => {
    const handleClose = onClose;
    if (!handleClose) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setPdfPreviewPageCount(0);
    setPdfPreviewPage(1);
    setPdfPreviewZoom(1);
    setPdfPreviewError(null);
    setIsPdfPreviewRendering(false);
    setMarkdownPreviewMode("rendered");
    setDirectoryPreviewPath(initialDirectoryPath);
    setDirectoryPreviewState({
      status: "idle",
      folderPath: initialDirectoryPath,
      entries: [],
      error: null,
    });
    setDirectoryEntriesByPath({});
    setDirectoryLoadingPaths([]);
    setDirectoryErrorByPath({});
    setExpandedDirectoryPaths([]);
    documentPreviewLoadKeyRef.current = "";
    documentPreviewPdfCanvasRefs.current = {};
    documentPreviewPdfPageRefs.current = {};
  }, [attachment.id, initialDirectoryPath]);

  useEffect(() => {
    const viewport = documentPreviewPdfViewportRef.current;
    if (!viewport) {
      setPdfPreviewViewportSize({ width: 0, height: 0 });
      return;
    }

    const updateSize = () => {
      setPdfPreviewViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [attachment.id, documentPreviewState.kind, pdfPreviewPageCount]);

  useEffect(() => {
    if (documentPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(documentPreviewObjectUrlRef.current);
      documentPreviewObjectUrlRef.current = null;
    }

    if (documentPreviewState.status === "ready" && documentPreviewState.blob) {
      const objectUrl = URL.createObjectURL(documentPreviewState.blob);
      documentPreviewObjectUrlRef.current = objectUrl;
      setDocumentPreviewUrl(objectUrl);
      return;
    }

    setDocumentPreviewUrl(null);
  }, [documentPreviewState]);

  useEffect(() => {
    if (!canAttemptDirectoryPreview) {
      setDirectoryPreviewState({
        status: "idle",
        folderPath: directoryPreviewPath,
        entries: [],
        error: null,
      });
      return;
    }

    const controller = new AbortController();
    void loadDirectoryFolder(directoryPreviewPath, { root: true, signal: controller.signal });
    return () => controller.abort();
  }, [
    backendUrl,
    canAttemptDirectoryPreview,
    directoryPreviewPath,
    isExplicitDirectoryAttachment,
    requestHeadersWithApiKeySignature,
    resolvedEnvironmentId,
  ]);

  useEffect(() => {
    if (documentPreviewDocxRef.current) {
      documentPreviewDocxRef.current.innerHTML = "";
    }

    const previewKind = attachment.previewKindOverride ?? getRunnerDocumentPreviewKind(attachment);
    const previewUrl =
      resolveRunnerPreviewAssetUrl(attachment.url, backendUrl, attachment.id) ||
      resolveRunnerPreviewAssetUrl(attachment.previewUrl, backendUrl, attachment.id);
    const nextLoadKey = JSON.stringify([
      attachment.id,
      attachment.filename,
      attachment.mimeType,
      attachment.isFolder === true,
      previewKind,
      previewUrl || "",
      resolvedDirectHtmlPreviewUrl || "",
      backendUrl || "",
      requestHeadersWithApiKeySignature,
    ]);

    if (documentPreviewLoadKeyRef.current === nextLoadKey) {
      return;
    }
    documentPreviewLoadKeyRef.current = nextLoadKey;

    if (isImageAttachment) {
      setDocumentPreviewState({
        status: "idle",
        kind: null,
      });
      return;
    }

    if (previewKind === "directory" || (previewKind === "unsupported" && canAttemptDirectoryPreview)) {
      setDocumentPreviewState({
        status: "idle",
        kind: previewKind,
      });
      return;
    }
    if (previewKind === "unsupported") {
      setDocumentPreviewState({
        status: "ready",
        kind: "unsupported",
      });
      return;
    }

    if (previewKind === "html" && resolvedDirectHtmlPreviewUrl && !previewUrl) {
      setDocumentPreviewState({
        status: "ready",
        kind: "html",
      });
      return;
    }
    if (!previewUrl) {
      setDocumentPreviewState({
        status: "error",
        kind: previewKind,
        error: "Preview unavailable for this attachment.",
      });
      return;
    }

    const controller = new AbortController();
    setDocumentPreviewState({
      status: "loading",
      kind: previewKind,
    });

    void fetch(previewUrl, {
      method: "GET",
      headers: requestHeadersWithApiKey,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview (${response.status})`);
        }

        if (previewKind === "text" || previewKind === "markdown") {
          const text = await response.text();
          setDocumentPreviewState({
            status: "ready",
            kind: previewKind,
            text,
          });
          return;
        }

        if (previewKind === "html") {
          const html = await response.text();
          const previewDocument = buildRunnerPreviewHtmlDocument(html, previewUrl);
          setDocumentPreviewState({
            status: "ready",
            kind: "html",
            text: resolvedDirectHtmlPreviewUrl ? html : previewDocument,
          });
          return;
        }

        const blob = await response.blob();
        setDocumentPreviewState({
          status: "ready",
          kind: previewKind,
          blob,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setDocumentPreviewState({
          status: "error",
          kind: previewKind,
          error: normalizedError.message || "Failed to load attachment preview.",
        });
      });

    return () => controller.abort();
  }, [
    attachment.filename,
    attachment.id,
    attachment.isFolder,
    attachment.mimeType,
    attachment.previewKindOverride,
    attachment.previewUrl,
    attachment.url,
    backendUrl,
    canAttemptDirectoryPreview,
    isImageAttachment,
    requestHeadersWithApiKeySignature,
    resolvedDirectHtmlPreviewUrl,
  ]);

  useEffect(() => {
    if (
      documentPreviewState.status !== "ready" ||
      documentPreviewState.kind !== "docx" ||
      !documentPreviewState.blob ||
      !documentPreviewDocxRef.current
    ) {
      if (documentPreviewDocxRef.current) {
        documentPreviewDocxRef.current.innerHTML = "";
      }
      return;
    }

    const container = documentPreviewDocxRef.current;
    let cancelled = false;
    container.innerHTML = "";

    void import("docx-preview")
      .then(async ({ renderAsync }) => {
        if (cancelled) {
          return;
        }
        await renderAsync(documentPreviewState.blob!, container, container, {
          className: "tb-attachment-docx",
          inWrapper: false,
          useBase64URL: true,
        });
        if (cancelled) {
          container.innerHTML = "";
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setDocumentPreviewState({
          status: "error",
          kind: "docx",
          error: normalizedError.message || "Failed to render document preview.",
        });
      });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [documentPreviewState]);

  useEffect(() => {
    if (
      documentPreviewState.status !== "ready" ||
      documentPreviewState.kind !== "pdf" ||
      !documentPreviewState.blob
    ) {
      for (const task of pdfPreviewRenderTasksRef.current) {
        if (task?.cancel) {
          try {
            task.cancel();
          } catch {}
        }
      }
      pdfPreviewRenderTasksRef.current = [];
      if (pdfPreviewDocumentRef.current?.destroy) {
        void pdfPreviewDocumentRef.current.destroy();
      }
      pdfPreviewDocumentRef.current = null;
      setPdfPreviewPageCount(0);
      return;
    }

    let cancelled = false;
    let loadingTask: { promise: Promise<any>; destroy?: () => void } | null = null;
    setIsPdfPreviewRendering(true);
    setPdfPreviewError(null);

    void import("pdfjs-dist/build/pdf.mjs")
      .then(async (pdfjs) => {
        if (cancelled) {
          return;
        }
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
        const task = pdfjs.getDocument({
          data: await documentPreviewState.blob!.arrayBuffer(),
        });
        loadingTask = task;
        const pdfDocument = await task.promise;
        if (cancelled) {
          void pdfDocument.destroy();
          return;
        }
        pdfPreviewDocumentRef.current = pdfDocument;
        setPdfPreviewPageCount(pdfDocument.numPages);
        setPdfPreviewPage((current) => Math.max(1, Math.min(current, pdfDocument.numPages)));
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setPdfPreviewError(normalizedError.message || "Failed to load PDF preview.");
        setIsPdfPreviewRendering(false);
      });

    return () => {
      cancelled = true;
      if (loadingTask?.destroy) {
        loadingTask.destroy();
      }
      for (const task of pdfPreviewRenderTasksRef.current) {
        if (task?.cancel) {
          try {
            task.cancel();
          } catch {}
        }
      }
      pdfPreviewRenderTasksRef.current = [];
      if (pdfPreviewDocumentRef.current?.destroy) {
        void pdfPreviewDocumentRef.current.destroy();
      }
      pdfPreviewDocumentRef.current = null;
    };
  }, [documentPreviewState]);

  useEffect(() => {
    if (
      documentPreviewState.kind !== "pdf" ||
      documentPreviewState.status !== "ready" ||
      !pdfPreviewDocumentRef.current ||
      !documentPreviewPdfViewportRef.current ||
      pdfPreviewPageCount === 0 ||
      pdfPreviewViewportSize.width === 0
    ) {
      return;
    }

    let cancelled = false;
    const viewportElement = documentPreviewPdfViewportRef.current;
    const pdfDocument = pdfPreviewDocumentRef.current;

    setIsPdfPreviewRendering(true);
    setPdfPreviewError(null);

    for (const task of pdfPreviewRenderTasksRef.current) {
      if (task?.cancel) {
        try {
          task.cancel();
        } catch {}
      }
    }
    pdfPreviewRenderTasksRef.current = [];

    void (async () => {
      const availableWidth = Math.max(viewportElement.clientWidth - 36, 200);
      const devicePixelRatio = window.devicePixelRatio || 1;

      for (let pageNumber = 1; pageNumber <= pdfPreviewPageCount; pageNumber += 1) {
        if (cancelled) {
          return;
        }

        const canvas = documentPreviewPdfCanvasRefs.current[pageNumber];
        if (!canvas) {
          continue;
        }

        const page = await pdfDocument.getPage(pageNumber);
        if (cancelled) {
          return;
        }

        const initialViewport = page.getViewport({ scale: 1 });
        const baseScale = availableWidth / initialViewport.width;
        const renderScale = Math.max(0.2, Math.min(6, baseScale * pdfPreviewZoom));
        const viewport = page.getViewport({ scale: renderScale });
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Failed to initialize PDF canvas.");
        }

        canvas.width = Math.floor(viewport.width * devicePixelRatio);
        canvas.height = Math.floor(viewport.height * devicePixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: context,
          viewport,
          transform: devicePixelRatio === 1 ? undefined : [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0],
        });
        pdfPreviewRenderTasksRef.current.push(renderTask);
        await renderTask.promise;
      }
    })()
      .catch((error: any) => {
        if (cancelled || error?.name === "RenderingCancelledException") {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setPdfPreviewError(normalizedError.message || "Failed to render PDF preview.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsPdfPreviewRendering(false);
        }
        pdfPreviewRenderTasksRef.current = [];
      });

    return () => {
      cancelled = true;
      for (const task of pdfPreviewRenderTasksRef.current) {
        if (task?.cancel) {
          try {
            task.cancel();
          } catch {}
        }
      }
      pdfPreviewRenderTasksRef.current = [];
    };
  }, [documentPreviewState, pdfPreviewPageCount, pdfPreviewViewportSize, pdfPreviewZoom]);

  useEffect(() => {
    if (
      documentPreviewState.kind !== "pdf" ||
      documentPreviewState.status !== "ready" ||
      pdfPreviewPageCount === 0 ||
      !documentPreviewPdfViewportRef.current
    ) {
      return;
    }

    const viewport = documentPreviewPdfViewportRef.current;
    let animationFrameId: number | null = null;

    const updateVisiblePage = () => {
      animationFrameId = null;
      const viewportCenter = viewport.scrollTop + viewport.clientHeight / 2;
      let bestPage = 1;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let pageNumber = 1; pageNumber <= pdfPreviewPageCount; pageNumber += 1) {
        const pageElement = documentPreviewPdfPageRefs.current[pageNumber];
        if (!pageElement) {
          continue;
        }
        const pageCenter = pageElement.offsetTop + pageElement.clientHeight / 2;
        const distance = Math.abs(pageCenter - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPage = pageNumber;
        }
      }

      setPdfPreviewPage((current) => (current === bestPage ? current : bestPage));
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = window.requestAnimationFrame(updateVisiblePage);
    };

    updateVisiblePage();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [documentPreviewState, pdfPreviewPageCount, pdfPreviewViewportSize, pdfPreviewZoom]);

  useEffect(() => {
    return () => {
      if (documentPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(documentPreviewObjectUrlRef.current);
      }
      for (const task of pdfPreviewRenderTasksRef.current) {
        if (task?.cancel) {
          try {
            task.cancel();
          } catch {}
        }
      }
      if (pdfPreviewDocumentRef.current?.destroy) {
        void pdfPreviewDocumentRef.current.destroy();
      }
    };
  }, []);

  function scrollToPdfPage(pageNumber: number) {
    const viewport = documentPreviewPdfViewportRef.current;
    const pageElement = documentPreviewPdfPageRefs.current[pageNumber];
    if (!viewport || !pageElement) {
      return;
    }
    viewport.scrollTo({
      top: Math.max(pageElement.offsetTop - 20, 0),
      behavior: "smooth",
    });
    setPdfPreviewPage(pageNumber);
  }

  function openDirectoryEntryInFiles(entry: RunnerPreviewDirectoryEntry) {
    if (typeof onWorkspacePathOpen !== "function") {
      return;
    }
    onWorkspacePathOpen(toAbsoluteRunnerWorkspacePath(entry.path), { isFolder: entry.isFolder });
  }

  async function loadDirectoryFolder(
    folderPath: string,
    options?: { root?: boolean; signal?: AbortSignal }
  ) {
    const normalizedFolderPath = normalizeRunnerPreviewWorkspacePath(folderPath);
    const isRootRequest = Boolean(options?.root);
    const requestUrl = buildRunnerPreviewDirectoryListUrl(backendUrl, resolvedEnvironmentId, normalizedFolderPath, 1);
    if (!requestUrl) {
      const errorMessage = "Folder preview is unavailable for this environment.";
      if (isRootRequest) {
        setDirectoryPreviewState({
          status: isExplicitDirectoryAttachment ? "error" : "not-directory",
          folderPath: normalizedFolderPath,
          entries: [],
          error: errorMessage,
        });
      }
      setDirectoryErrorByPath((current) => ({ ...current, [normalizedFolderPath]: errorMessage }));
      return;
    }

    if (directoryLoadingPaths.includes(normalizedFolderPath)) {
      return;
    }

    setDirectoryLoadingPaths((current) => (
      current.includes(normalizedFolderPath) ? current : [...current, normalizedFolderPath]
    ));
    setDirectoryErrorByPath((current) => ({ ...current, [normalizedFolderPath]: "" }));
    if (isRootRequest) {
      setDirectoryPreviewState({
        status: "loading",
        folderPath: normalizedFolderPath,
        entries: directoryEntriesByPath[normalizedFolderPath] || [],
        error: null,
      });
    }

    try {
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: requestHeadersWithApiKey,
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
        const record = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
        const message = typeof record.message === "string"
          ? record.message
          : typeof record.error === "string"
            ? record.error
            : `Failed to load folder (${response.status})`;
        const error = new Error(message);
        (error as Error & { status?: number }).status = response.status;
        throw error;
      }

      const entries = normalizeRunnerPreviewDirectoryEntries(parsed, normalizedFolderPath);
      setDirectoryEntriesByPath((current) => ({
        ...current,
        [normalizedFolderPath]: entries,
      }));
      setDirectoryErrorByPath((current) => ({ ...current, [normalizedFolderPath]: "" }));
      if (isRootRequest) {
        setDirectoryPreviewState({
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
      const status = typeof (normalizedError as Error & { status?: unknown }).status === "number"
        ? (normalizedError as Error & { status: number }).status
        : 0;
      const shouldTreatAsNotDirectory = !isExplicitDirectoryAttachment && (status === 400 || status === 404);
      const errorMessage = normalizedError.message || "Failed to load folder.";
      setDirectoryErrorByPath((current) => ({ ...current, [normalizedFolderPath]: errorMessage }));
      if (isRootRequest) {
        setDirectoryPreviewState({
          status: shouldTreatAsNotDirectory ? "not-directory" : "error",
          folderPath: normalizedFolderPath,
          entries: [],
          error: errorMessage,
        });
      }
    } finally {
      setDirectoryLoadingPaths((current) => current.filter((path) => path !== normalizedFolderPath));
    }
  }

  function toggleDirectoryFolder(entry: RunnerPreviewDirectoryEntry) {
    if (!entry.isFolder) {
      return;
    }
    const normalizedPath = normalizeRunnerPreviewWorkspacePath(entry.path);
    if (!normalizedPath) {
      return;
    }
    const isExpanded = expandedDirectoryPaths.includes(normalizedPath);
    setExpandedDirectoryPaths((current) => (
      current.includes(normalizedPath)
        ? current.filter((path) => path !== normalizedPath)
        : [...current, normalizedPath]
    ));
    if (!isExpanded && !directoryEntriesByPath[normalizedPath]) {
      void loadDirectoryFolder(normalizedPath);
    }
  }

  function renderDirectoryEntryIcon(entry: RunnerPreviewDirectoryEntry) {
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
        className={`tb-attachment-preview-directory-icon-asset ${entry.isFolder ? "is-folder" : "is-file"}`.trim()}
      />
    );
  }

  function renderDirectoryEntry(entry: RunnerPreviewDirectoryEntry, depth = 0): ReactNode {
    const normalizedPath = normalizeRunnerPreviewWorkspacePath(entry.path);
    const isExpanded = entry.isFolder && expandedDirectoryPaths.includes(normalizedPath);
    const isLoading = entry.isFolder && directoryLoadingPaths.includes(normalizedPath);
    const error = entry.isFolder ? directoryErrorByPath[normalizedPath] || "" : "";
    const childEntries = entry.isFolder ? directoryEntriesByPath[normalizedPath] || [] : [];

    return (
      <div key={entry.id} className="tb-attachment-preview-directory-node" role="listitem">
        <button
          type="button"
          className={`tb-attachment-preview-directory-row ${entry.isFolder ? "is-folder" : "is-file"}`.trim()}
          title={toAbsoluteRunnerWorkspacePath(entry.path)}
          style={{ paddingLeft: `${9 + depth * 18}px` }}
          onClick={() => {
            if (entry.isFolder) {
              toggleDirectoryFolder(entry);
              return;
            }
            openDirectoryEntryInFiles(entry);
          }}
          onDoubleClick={() => {
            if (entry.isFolder) {
              openDirectoryEntryInFiles(entry);
            }
          }}
        >
          <span className="tb-attachment-preview-directory-chevron-slot" aria-hidden="true">
            {entry.isFolder ? (
              isLoading ? (
                <LucideLoaderCircle className="tb-attachment-preview-directory-chevron tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
              ) : isExpanded ? (
                <LucideChevronDown className="tb-attachment-preview-directory-chevron is-expanded" strokeWidth={1.8} />
              ) : (
                <LucideChevronRight className="tb-attachment-preview-directory-chevron" strokeWidth={1.8} />
              )
            ) : null}
          </span>
          <span className="tb-attachment-preview-directory-icon-slot" aria-hidden="true">
            {renderDirectoryEntryIcon(entry)}
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
          <div className="tb-attachment-preview-directory-children" role="list">
            {childEntries.length > 0
              ? childEntries.map((childEntry) => renderDirectoryEntry(childEntry, depth + 1))
              : !isLoading && !error
                ? <div className="tb-attachment-preview-directory-empty-row" style={{ paddingLeft: `${47 + (depth + 1) * 18}px` }}>Empty folder</div>
                : null}
            {error && childEntries.length === 0 ? (
              <div className="tb-attachment-preview-directory-empty-row is-error" style={{ paddingLeft: `${47 + (depth + 1) * 18}px` }}>
                {error}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  function renderDirectoryPreview() {
    const entries = directoryEntriesByPath[directoryPreviewPath] || directoryPreviewState.entries;
    return (
      <div className="tb-attachment-preview-directory">
        <div className="tb-attachment-preview-directory-path" title={activeDirectoryAbsolutePath}>
          {activeDirectoryAbsolutePath}
        </div>
        {directoryPreviewState.status === "loading" ? (
          <div className="tb-attachment-preview-state">
            <LucideLoaderCircle className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
            <span>Loading folder…</span>
          </div>
        ) : directoryPreviewState.status === "error" ? (
          <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
            <img
              src={RUNNER_FOLDER_ICON_URL}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="tb-attachment-preview-state-icon-asset"
            />
            <span>{directoryPreviewState.error || "Failed to load folder."}</span>
          </div>
        ) : entries.length === 0 ? (
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
          <div className="tb-attachment-preview-directory-list" role="list">
            {entries.map((entry) => renderDirectoryEntry(entry, 0))}
          </div>
        )}
      </div>
    );
  }

  const previewRootClassName = surface
    ? `tb-attachment-preview-surface${inline ? " tb-attachment-preview-surface-inline" : ""}${className ? ` ${className}` : ""}`
    : `tb-attachment-preview-drawer${inline ? " tb-attachment-preview-drawer-inline" : ""}${className ? ` ${className}` : ""}`;

  return (
    <div className={`tb-runner-document-preview-host${inline ? " tb-runner-document-preview-host-inline" : ""}`}>
      <aside
        className={previewRootClassName}
        aria-label={`${attachment.filename} preview`}
      >
        {showResizeHandle ? (
          <button
            type="button"
            className="tb-attachment-preview-drawer-resize-handle"
            onPointerDown={onResizeStart}
            aria-label="Resize file preview"
            tabIndex={-1}
          />
        ) : null}
        <div className="tb-attachment-preview-drawer-header">
          {headerCopy ? (
            <div className="tb-attachment-preview-drawer-header-copy">
              {headerCopy}
            </div>
          ) : (
            <div className="tb-attachment-preview-drawer-header-copy">
              {isDirectoryLikePreview ? (
                <img
                  src={RUNNER_FOLDER_ICON_URL}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="tb-attachment-preview-drawer-header-icon-asset"
                />
              ) : (
                <img
                  src={RUNNER_TEXT_FILE_ICON_URL}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="tb-attachment-preview-drawer-header-icon-asset"
                />
              )}
              <div className="tb-attachment-preview-drawer-header-text">
                <div className="tb-attachment-preview-drawer-name" title={attachment.filename}>
                  {attachment.filename}
                </div>
              </div>
            </div>
          )}
          {headerActions || canTogglePreviewCode || headerActionsAfterPreviewToggle || (showCloseButton && onClose) ? (
            <div className="tb-attachment-preview-drawer-header-actions">
              {headerActions}
              {canTogglePreviewCode ? (
                <button
                  type="button"
                  className={`tb-attachment-preview-drawer-action${markdownPreviewMode === "code" ? " is-active" : ""}`}
                  onClick={() => setMarkdownPreviewMode((current) => current === "code" ? "rendered" : "code")}
                  aria-label={markdownPreviewMode === "code" ? "Show preview" : "Show code"}
                  aria-pressed={markdownPreviewMode === "code"}
                  title={markdownPreviewMode === "code" ? "Show preview" : "Show code"}
                >
                  {markdownPreviewMode === "code" ? (
                    <LucideFileText className="tb-attachment-preview-drawer-action-icon" strokeWidth={2} />
                  ) : (
                    <LucideCode2 className="tb-attachment-preview-drawer-action-icon" strokeWidth={2} />
                  )}
                </button>
              ) : null}
              {headerActionsAfterPreviewToggle}
              {showCloseButton && onClose ? (
                <button
                  type="button"
                  className="tb-attachment-preview-drawer-action"
                  onClick={onClose}
                  aria-label="Close file preview"
                >
                  <LucideX className="tb-attachment-preview-drawer-action-icon" strokeWidth={2} />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="tb-attachment-preview-drawer-body">
          {shouldRenderDirectoryPreview ? (
            renderDirectoryPreview()
          ) : isImageAttachment && resolvedImagePreviewUrl ? (
            <RunnerImagePreviewSurface
              src={resolvedImagePreviewUrl}
              alt={attachment.filename}
              mimeType={attachment.mimeType}
              fetchHeaders={requestHeadersWithApiKey}
              className={inline ? "tb-attachment-preview-image-surface" : undefined}
              imageClassName={inline ? "tb-attachment-preview-image" : undefined}
            />
          ) : documentPreviewState.status === "loading" ? (
            <div className="tb-attachment-preview-state">
              <LucideLoaderCircle className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
              <span>Loading preview…</span>
            </div>
          ) : documentPreviewState.status === "error" ? (
            <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
              <LucideFileText className="tb-attachment-preview-state-icon" strokeWidth={1.8} />
              <span>{documentPreviewState.error || "Failed to load preview."}</span>
            </div>
          ) : documentPreviewState.kind === "pdf" ? (
            pdfPreviewError ? (
              <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
                <LucideFileText className="tb-attachment-preview-state-icon" strokeWidth={1.8} />
                <span>{pdfPreviewError}</span>
              </div>
            ) : pdfPreviewPageCount === 0 ? (
              <div className="tb-attachment-preview-state">
                <LucideLoaderCircle className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
                <span>Preparing PDF preview…</span>
              </div>
            ) : (
              <div className="tb-attachment-preview-pdf">
                <div ref={documentPreviewPdfViewportRef} className="tb-attachment-preview-pdf-viewport">
                  <div className="tb-attachment-preview-pdf-pages">
                    {Array.from({ length: pdfPreviewPageCount }, (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <div
                          key={`${attachment.id}:page:${pageNumber}`}
                          ref={(element) => {
                            documentPreviewPdfPageRefs.current[pageNumber] = element;
                          }}
                          className="tb-attachment-preview-pdf-page-shell"
                        >
                          <div className="tb-attachment-preview-pdf-page">
                            <canvas
                              ref={(element) => {
                                documentPreviewPdfCanvasRefs.current[pageNumber] = element;
                              }}
                              className="tb-attachment-preview-pdf-canvas"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isPdfPreviewRendering ? (
                    <div className="tb-attachment-preview-pdf-rendering">
                      <LucideLoaderCircle className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner" strokeWidth={1.8} />
                    </div>
                  ) : null}
                </div>
                <div className="tb-attachment-preview-pdf-controls">
                  <button
                    type="button"
                    className="tb-attachment-preview-pdf-control-button"
                    onClick={() => scrollToPdfPage(Math.max(1, pdfPreviewPage - 1))}
                    disabled={pdfPreviewPage <= 1}
                    aria-label="Previous page"
                  >
                    <LucideChevronLeft className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
                  </button>
                  <div className="tb-attachment-preview-pdf-page-indicator">
                    {pdfPreviewPageCount > 0 ? `${pdfPreviewPage}/${pdfPreviewPageCount}` : "0/0"}
                  </div>
                  <div className="tb-attachment-preview-pdf-divider" />
                  <button
                    type="button"
                    className="tb-attachment-preview-pdf-control-button"
                    onClick={() => setPdfPreviewZoom((current) => Math.max(0.4, Number((current - 0.2).toFixed(2))))}
                    disabled={pdfPreviewZoom <= 0.4}
                    aria-label="Zoom out"
                  >
                    <LucideMinus className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
                  </button>
                  <div className="tb-attachment-preview-pdf-zoom-label">{Math.round(pdfPreviewZoom * 100)}%</div>
                  <button
                    type="button"
                    className="tb-attachment-preview-pdf-control-button"
                    onClick={() => setPdfPreviewZoom((current) => Math.min(3, Number((current + 0.2).toFixed(2))))}
                    disabled={pdfPreviewZoom >= 3}
                    aria-label="Zoom in"
                  >
                    <LucidePlus className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
                  </button>
                  <div className="tb-attachment-preview-pdf-divider" />
                  <button
                    type="button"
                    className="tb-attachment-preview-pdf-control-button"
                    onClick={() => scrollToPdfPage(Math.min(pdfPreviewPageCount || pdfPreviewPage, pdfPreviewPage + 1))}
                    disabled={pdfPreviewPageCount === 0 || pdfPreviewPage >= pdfPreviewPageCount}
                    aria-label="Next page"
                  >
                    <LucideChevronRight className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
                  </button>
                </div>
              </div>
            )
          ) : documentPreviewState.kind === "html" && (resolvedDirectHtmlPreviewUrl || typeof documentPreviewState.text === "string" || documentPreviewUrl) ? (
            markdownPreviewMode === "code" && typeof documentPreviewState.text === "string" ? (
              <div className="tb-attachment-preview-code-shell">
                <RunnerCodeViewer
                  content={documentPreviewState.text}
                  filePath={attachment.filename}
                  language="html"
                  maxHeight={inline ? 520 : 980}
                  showLineNumbers
                  className="tb-log-card-code-hide-scrollbars"
                />
              </div>
            ) : (
              <iframe
                src={resolvedDirectHtmlPreviewUrl || documentPreviewUrl || undefined}
                srcDoc={resolvedDirectHtmlPreviewUrl ? undefined : (typeof documentPreviewState.text === "string" ? documentPreviewState.text : undefined)}
                sandbox={htmlIframeSandbox}
                title={attachment.filename}
                className="tb-attachment-preview-frame"
              />
            )
          ) : documentPreviewState.kind === "markdown" && typeof documentPreviewState.text === "string" ? (
            markdownPreviewMode === "code" ? (
              <div className="tb-attachment-preview-code-shell">
                <RunnerCodeViewer
                  content={documentPreviewState.text}
                  filePath={attachment.filename}
                  language="markdown"
                  maxHeight={inline ? 520 : 980}
                  showLineNumbers
                  className="tb-log-card-code-hide-scrollbars"
                />
              </div>
            ) : (
              <div className="tb-attachment-preview-markdown-shell">
                <RunnerMarkdown
                  content={documentPreviewState.text}
                  className="tb-attachment-preview-markdown tb-message-markdown"
                  softBreaks
                  imageBackendUrl={backendUrl}
                  imageEnvironmentId={resolvedEnvironmentId}
                  imageRequestHeaders={requestHeadersWithApiKey}
                  imageBaseWorkspacePath={resolvedWorkspacePath}
                  imageMaxHeight={1200}
                />
              </div>
            )
          ) : documentPreviewState.kind === "text" && typeof documentPreviewState.text === "string" ? (
            <div className="tb-attachment-preview-code-shell">
              <RunnerCodeViewer
                content={documentPreviewState.text}
                filePath={attachment.filename}
                maxHeight={inline ? 520 : 980}
                showLineNumbers
                className="tb-log-card-code-hide-scrollbars"
              />
            </div>
          ) : documentPreviewState.kind === "docx" ? (
            <div className="tb-attachment-preview-docx-shell">
              <div ref={documentPreviewDocxRef} className="tb-attachment-preview-docx-stage" />
            </div>
          ) : (
            <div className="tb-attachment-preview-state">
              <LucideFileText className="tb-attachment-preview-state-icon" strokeWidth={1.8} />
              <span>Preview is not available for this file type yet.</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
