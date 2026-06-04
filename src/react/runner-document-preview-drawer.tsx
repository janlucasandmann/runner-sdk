import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";
import {
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Code2 as LucideCode2,
  Crop as LucideCrop,
  Eye as LucideEye,
  FileDiff as LucideFileDiff,
  FileText as LucideFileText,
  Globe as LucideGlobe,
  HardDrive as LucideHardDrive,
  Check as LucideCheck,
  LassoSelect as LucideLassoSelect,
  LoaderCircle as LucideLoaderCircle,
  Minus as LucideMinus,
  Plus as LucidePlus,
  RotateCcw as LucideRotateCcw,
  RotateCw as LucideRotateCw,
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
  type RunnerImageUnderstandingPreviewData,
  type RunnerImageUnderstandingPreviewItem,
  type RunnerPreviewDirectoryEntry,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
  type RunnerWebSearchPreviewSource,
} from "./runner-document-preview.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { RunnerFileDiffSurface } from "./runner-file-diff-surface.js";
import {
  RunnerImageCropOverlay,
  RunnerImageSelectionMaskOverlay,
  type RunnerImageCropRect,
  type RunnerImageCropTarget,
  type RunnerImageMaskStroke,
  type RunnerImageNaturalSize,
  type RunnerImagePoint,
} from "./runner-image-edit-overlays.js";
import { RunnerCodeViewer } from "./runner-log-boxes.js";
import { RunnerMarkdown } from "./runner-markdown.js";
import { RunnerPresentationPreview } from "./runner-presentation-preview.js";
import {
  RunnerSpreadsheetPreview,
  type RunnerSpreadsheetPreviewControls,
  type RunnerSpreadsheetSaveOptions,
} from "./runner-spreadsheet-preview.js";

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

function getWebSearchPreviewSourceDomain(source: RunnerWebSearchPreviewSource): string {
  if (source.domain) {
    return source.domain;
  }
  try {
    return new URL(source.url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function getWebSearchPreviewFaviconUrl(domain: string): string {
  return domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32` : "";
}

function RunnerWebSearchSidebarSourceLink({ source }: { source: RunnerWebSearchPreviewSource }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = getWebSearchPreviewSourceDomain(source);
  const faviconUrl = faviconFailed ? "" : getWebSearchPreviewFaviconUrl(domain);
  const label = source.title || domain || source.url;

  return (
    <a className="tb-web-search-sidebar-source" href={source.url} target="_blank" rel="noopener noreferrer">
      {faviconUrl ? (
        <img
          src={faviconUrl}
          alt=""
          className="tb-web-search-sidebar-source-favicon"
          onError={() => setFaviconFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <LucideGlobe className="tb-web-search-sidebar-source-icon" strokeWidth={1.5} />
      )}
      <span title={label}>{label}</span>
    </a>
  );
}

function RunnerWebSearchSidebarPreview({ data }: { data: RunnerWebSearchPreviewData }) {
  const images = Array.isArray(data.images) ? data.images.filter((image) => image && (image.url || image.thumbnail)).slice(0, 4) : [];
  const sources = Array.isArray(data.sources) ? data.sources.filter((source) => source?.url) : [];
  const hasRawJson = Boolean(data.rawJsonText && data.rawJsonText.trim());

  return (
    <main className="tb-web-search-sidebar-preview">
      <header className="tb-web-search-sidebar-title">
        <h1>Web Search</h1>
        {data.query ? <p>{data.query}</p> : null}
      </header>
      {data.isError ? (
        <section className="tb-web-search-sidebar-error">
          {data.errorMessage || "Web search failed."}
        </section>
      ) : null}
      {images.length > 0 ? (
        <section className="tb-web-search-sidebar-section">
          <div className="tb-web-search-sidebar-image-grid">
            {images.map((image, index) => {
              const imageUrl = image.url || image.thumbnail || "";
              return (
                <figure key={`${imageUrl}:${index}`} className="tb-web-search-sidebar-image-card">
                  <img
                    src={imageUrl}
                    alt={image.title || `Search image ${index + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {image.title ? <figcaption>{image.title}</figcaption> : null}
                </figure>
              );
            })}
          </div>
        </section>
      ) : null}
      {data.summary ? (
        <section className="tb-web-search-sidebar-summary">
          <RunnerMarkdown
            content={data.summary}
            className="tb-message-markdown tb-message-markdown-summary"
            softBreaks
          />
        </section>
      ) : null}
      {sources.length > 0 ? (
        <section className="tb-web-search-sidebar-section">
          <h2>Sources</h2>
          <div className="tb-web-search-sidebar-source-list">
            {sources.map((source, index) => (
              <RunnerWebSearchSidebarSourceLink key={`${source.url}:${index}`} source={source} />
            ))}
          </div>
        </section>
      ) : null}
      {hasRawJson ? (
        <details className="tb-web-search-sidebar-raw">
          <summary>Raw JSON</summary>
          <pre>{data.rawJsonText}</pre>
        </details>
      ) : null}
    </main>
  );
}

function RunnerImageUnderstandingSidebarPreview({
  data,
  requestHeaders,
}: {
  data: RunnerImageUnderstandingPreviewData;
  requestHeaders: HeadersInit;
}) {
  const images = Array.isArray(data.images) ? data.images.filter((image) => image && (image.url || image.path)) : [];
  const layoutClassName = [
    "tb-image-understanding-layout",
    images.length > 1 ? "is-multiple" : "",
  ].filter(Boolean).join(" ");

  return (
    <main className="tb-image-understanding-sidebar-preview">
      <header className="tb-image-understanding-title">
        <h1>Image Understanding</h1>
        <p>{data.imageName || (images.length === 1 ? images[0]?.name : `${images.length} images`)}</p>
      </header>
      <section className={layoutClassName}>
        <div className="tb-image-understanding-preview">
          <div className="tb-image-understanding-preview-title">Image Understanding</div>
          {images.length > 0 ? (
            <div className="tb-image-understanding-preview-list">
              {images.map((image, index) => {
                const imageId = image.path || image.url || image.name || `image-${index}`;
                return (
                  <figure key={`${imageId}:${index}`} className="tb-image-understanding-preview-item">
                    {image.url ? (
                      <RunnerImagePreviewSurface
                        src={image.url}
                        alt={image.name || "Image"}
                        fetchHeaders={requestHeaders}
                        className="tb-image-understanding-preview-surface"
                        imageClassName="tb-image-understanding-preview-image"
                      />
                    ) : (
                      <div className="tb-image-understanding-empty">Image preview unavailable.</div>
                    )}
                    <figcaption>{image.name || image.path || "Image"}</figcaption>
                  </figure>
                );
              })}
            </div>
          ) : (
            <div className="tb-image-understanding-empty">Image preview unavailable.</div>
          )}
        </div>
        <div className="tb-image-understanding-result">
          {data.resultText ? (
            data.isError ? (
              <div className="tb-image-understanding-error">{data.resultText}</div>
            ) : (
              <RunnerMarkdown
                content={data.resultText}
                className="tb-image-understanding-markdown tb-message-markdown tb-message-markdown-summary"
                softBreaks
              />
            )
          ) : (
            <div className="tb-image-understanding-empty">No image description returned.</div>
          )}
        </div>
      </section>
    </main>
  );
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
  imagePreviewInteractive?: boolean;
  imagePreviewOverlay?: ReactNode;
  imagePreviewReservedBottom?: number;
  imagePreviewFullscreen?: boolean;
  enableImageWheelZoom?: boolean;
  enableImagePreviewTools?: boolean;
  onImagePreviewLoad?: (dimensions: { naturalWidth: number; naturalHeight: number }) => void;
  onImageSelectionChange?: (selection: {
    attachmentId: string;
    naturalSize: RunnerImageNaturalSize;
    strokes: RunnerImageMaskStroke[];
  } | null) => void;
  showCloseButton?: boolean;
  showResizeHandle?: boolean;
  onDocumentBlobSave?: (blob: Blob, options: RunnerSpreadsheetSaveOptions) => Promise<void> | void;
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
  imagePreviewInteractive = true,
  imagePreviewOverlay,
  imagePreviewReservedBottom = 0,
  imagePreviewFullscreen = false,
  enableImageWheelZoom = false,
  enableImagePreviewTools = false,
  onImagePreviewLoad,
  onImageSelectionChange,
  showCloseButton = true,
  showResizeHandle = false,
  onDocumentBlobSave,
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
  const [spreadsheetPreviewMode, setSpreadsheetPreviewMode] = useState<"preview" | "code">("preview");
  const [attachmentDiffMode, setAttachmentDiffMode] = useState(false);
  const [spreadsheetPreviewControls, setSpreadsheetPreviewControls] = useState<RunnerSpreadsheetPreviewControls | null>(null);
  const [imagePreviewZoom, setImagePreviewZoom] = useState(1);
  const [imagePreviewToolMode, setImagePreviewToolMode] = useState<"idle" | "select" | "crop">("idle");
  const [imageNaturalSize, setImageNaturalSize] = useState<RunnerImageNaturalSize>({ width: 0, height: 0 });
  const [imageMaskStrokes, setImageMaskStrokes] = useState<RunnerImageMaskStroke[]>([]);
  const [imageMaskRedoStrokes, setImageMaskRedoStrokes] = useState<RunnerImageMaskStroke[]>([]);
  const [imageMaskDraftStroke, setImageMaskDraftStroke] = useState<RunnerImageMaskStroke | null>(null);
  const [imageCropRect, setImageCropRect] = useState<RunnerImageCropRect | null>(null);
  const [imageCropDraftRect, setImageCropDraftRect] = useState<RunnerImageCropRect | null>(null);
  const [imageCropDragTarget, setImageCropDragTarget] = useState<RunnerImageCropTarget>("new");
  const [imageCropHistory, setImageCropHistory] = useState<Array<{ blob: Blob; url: string; width: number; height: number }>>([]);
  const [imageCropHistoryIndex, setImageCropHistoryIndex] = useState(0);
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [isSavingImageCrop, setIsSavingImageCrop] = useState(false);
  const [imagePreviewCacheBuster, setImagePreviewCacheBuster] = useState("");
  const imageCropHistoryRef = useRef<Array<{ blob: Blob; url: string; width: number; height: number }>>([]);
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
  const imagePreviewWheelRegionRef = useRef<HTMLDivElement | null>(null);
  const imageMaskStrokeIdRef = useRef(0);
  const imageCropDraftRectRef = useRef<RunnerImageCropRect | null>(null);
  const imageCropDragStateRef = useRef<{
    mode: RunnerImageCropTarget;
    startPoint: RunnerImagePoint;
    startRect: RunnerImageCropRect | null;
  } | null>(null);

  const isImageAttachment = isRunnerPreviewImageAttachment(attachment);
  const attachmentPreviewKind = !isImageAttachment
    ? attachment.previewKindOverride ?? getRunnerDocumentPreviewKind(attachment)
    : null;
  const isImageUnderstandingAttachment = attachmentPreviewKind === "image-understanding" && Boolean(attachment.imageUnderstandingPreview);
  const isWebSearchAttachment = attachmentPreviewKind === "web-search" && Boolean(attachment.webSearchPreview);

  useEffect(() => {
    imageCropHistoryRef.current = imageCropHistory;
  }, [imageCropHistory]);
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
  const isSpreadsheetAttachment = attachmentPreviewKind === "spreadsheet";
  const canTogglePreviewCode = showPreviewCodeToggle && (
    attachmentPreviewKind === "markdown" ||
    attachmentPreviewKind === "html" ||
    isSpreadsheetAttachment
  );
  const isPreviewCodeMode = isSpreadsheetAttachment
    ? spreadsheetPreviewMode === "code"
    : markdownPreviewMode === "code";
  const canShowAttachmentDiff = Boolean(
    !isImageAttachment &&
    typeof attachment.diffContent === "string" &&
    attachment.diffContent.trim()
  );
  const isAttachmentDiffMode = canShowAttachmentDiff && attachmentDiffMode;
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
  const activeImageCropHistoryEntry = imagePreviewToolMode === "crop" && imageCropHistoryIndex > 0
    ? (imageCropHistory[imageCropHistoryIndex - 1] || null)
    : null;
  const effectiveImagePreviewUrl = useMemo(() => {
    if (activeImageCropHistoryEntry?.url) {
      return activeImageCropHistoryEntry.url;
    }
    if (!imagePreviewCacheBuster || !resolvedImagePreviewUrl || /^(?:blob:|data:)/i.test(resolvedImagePreviewUrl)) {
      return resolvedImagePreviewUrl;
    }
    return `${resolvedImagePreviewUrl}${resolvedImagePreviewUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(imagePreviewCacheBuster)}`;
  }, [activeImageCropHistoryEntry?.url, imagePreviewCacheBuster, resolvedImagePreviewUrl]);

  useEffect(() => {
    if (!onImageSelectionChange) {
      return;
    }
    if (
      !isImageAttachment
      || !effectiveImagePreviewUrl
      || !imageNaturalSize.width
      || !imageNaturalSize.height
      || imageMaskStrokes.length === 0
    ) {
      onImageSelectionChange(null);
      return;
    }
    onImageSelectionChange({
      attachmentId: String(attachment.id || attachment.workspacePath || attachment.filename || ""),
      naturalSize: imageNaturalSize,
      strokes: imageMaskStrokes,
    });
  }, [
    attachment.filename,
    attachment.id,
    attachment.workspacePath,
    effectiveImagePreviewUrl,
    imageMaskStrokes,
    imageNaturalSize,
    isImageAttachment,
    onImageSelectionChange,
  ]);

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
    setSpreadsheetPreviewMode("preview");
    setAttachmentDiffMode(false);
    setSpreadsheetPreviewControls(null);
    setImagePreviewZoom(1);
    setImagePreviewToolMode("idle");
    setImageNaturalSize({ width: 0, height: 0 });
    setImageMaskStrokes([]);
    setImageMaskRedoStrokes([]);
    setImageMaskDraftStroke(null);
    setImageCropRect(null);
    setImageCropDraftRect(null);
    setImageCropDragTarget("new");
    setImageCropHistory((current) => {
      current.forEach((entry) => {
        try {
          URL.revokeObjectURL(entry.url);
        } catch {}
      });
      return [];
    });
    setImageCropHistoryIndex(0);
    setIsCroppingImage(false);
    setIsSavingImageCrop(false);
    setImagePreviewCacheBuster("");
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
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

    if (isImageAttachment || previewKind === "image-understanding" || previewKind === "web-search") {
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
    if (!isSpreadsheetAttachment) {
      return undefined;
    }

    function handleSpreadsheetSaveShortcut(event: globalThis.KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || String(event.key || "").toLowerCase() !== "s") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      spreadsheetPreviewControls?.onSave();
    }

    window.addEventListener("keydown", handleSpreadsheetSaveShortcut, true);
    return () => window.removeEventListener("keydown", handleSpreadsheetSaveShortcut, true);
  }, [isSpreadsheetAttachment, spreadsheetPreviewControls]);

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
      imageCropHistoryRef.current.forEach((entry) => {
        try {
          URL.revokeObjectURL(entry.url);
        } catch {}
      });
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

  function applyImagePreviewWheelDelta(deltaY: number, options?: { modified?: boolean }) {
    if (!enableImageWheelZoom || imagePreviewToolMode !== "idle" || !isImageAttachment || !effectiveImagePreviewUrl) {
      return;
    }
    if (!Number.isFinite(deltaY) || deltaY === 0) {
      return;
    }
    const sensitivity = options?.modified ? 0.004 : 0.0022;
    const nextFactor = Math.exp(-deltaY * sensitivity);
    setImagePreviewZoom((current) => {
      const base = Number.isFinite(current) && current > 0 ? current : 1;
      const next = Math.max(0.35, Math.min(5, base * nextFactor));
      return Math.abs(next - 1) < 0.025 ? 1 : next;
    });
  }

  function handleImagePreviewWheel(event: ReactWheelEvent<HTMLElement>) {
    if (!enableImageWheelZoom || imagePreviewToolMode !== "idle" || !isImageAttachment || !effectiveImagePreviewUrl) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    applyImagePreviewWheelDelta(Number(event.deltaY || 0), { modified: event.ctrlKey || event.metaKey });
  }

  function applyImagePreviewZoomStep(direction: -1 | 1) {
    if (!isImageAttachment || !effectiveImagePreviewUrl) {
      return;
    }
    const step = direction > 0 ? 1.2 : 1 / 1.2;
    setImagePreviewZoom((current) => {
      const base = Number.isFinite(current) && current > 0 ? current : 1;
      const next = Math.max(0.35, Math.min(5, base * step));
      return Math.abs(next - 1) < 0.025 ? 1 : next;
    });
  }

  useEffect(() => {
    const node = imagePreviewWheelRegionRef.current;
    if (!node || !enableImageWheelZoom || !isImageAttachment || !effectiveImagePreviewUrl) {
      return;
    }
    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (imagePreviewToolMode === "idle") {
        applyImagePreviewWheelDelta(Number(event.deltaY || 0), { modified: event.ctrlKey || event.metaKey });
      }
    };
    const preventGesture = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    node.addEventListener("wheel", handleNativeWheel, { passive: false, capture: true });
    node.addEventListener("gesturestart", preventGesture, { passive: false } as AddEventListenerOptions);
    node.addEventListener("gesturechange", preventGesture, { passive: false } as AddEventListenerOptions);
    return () => {
      node.removeEventListener("wheel", handleNativeWheel, { capture: true } as EventListenerOptions);
      node.removeEventListener("gesturestart", preventGesture);
      node.removeEventListener("gesturechange", preventGesture);
    };
  }, [effectiveImagePreviewUrl, enableImageWheelZoom, imagePreviewToolMode, isImageAttachment]);

  function resetImageSelectionTool() {
    setImagePreviewToolMode("idle");
    setImageMaskStrokes([]);
    setImageMaskRedoStrokes([]);
    setImageMaskDraftStroke(null);
  }

  function resetImageCropTool() {
    setImagePreviewToolMode("idle");
    setImageCropRect(null);
    setImageCropDraftRect(null);
    setImageCropDragTarget("new");
    setImageCropHistory((current) => {
      current.forEach((entry) => {
        try {
          URL.revokeObjectURL(entry.url);
        } catch {}
      });
      return [];
    });
    setImageCropHistoryIndex(0);
    setIsCroppingImage(false);
    setIsSavingImageCrop(false);
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
  }

  function beginImageSelectionTool() {
    if (!enableImagePreviewTools || !isImageAttachment) return;
    resetImageCropTool();
    setImagePreviewZoom(1);
    setImagePreviewToolMode("select");
    setImageMaskRedoStrokes([]);
  }

  function beginImageCropTool() {
    if (!enableImagePreviewTools || !isImageAttachment) return;
    resetImageSelectionTool();
    setImagePreviewZoom(1);
    setImagePreviewToolMode("crop");
    setImageCropRect(null);
    setImageCropDraftRect(null);
    setImageCropDragTarget("new");
    setImageCropHistory((current) => {
      current.forEach((entry) => {
        try {
          URL.revokeObjectURL(entry.url);
        } catch {}
      });
      return [];
    });
    setImageCropHistoryIndex(0);
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
  }

  function undoImageSelectionStroke() {
    setImageMaskStrokes((current) => {
      if (!current.length) return current;
      const next = current.slice(0, -1);
      const removed = current[current.length - 1];
      setImageMaskRedoStrokes((redoCurrent) => [removed, ...redoCurrent]);
      return next;
    });
    setImageMaskDraftStroke(null);
  }

  function redoImageSelectionStroke() {
    setImageMaskRedoStrokes((current) => {
      if (!current.length) return current;
      const [restored, ...remaining] = current;
      setImageMaskStrokes((strokeCurrent) => [...strokeCurrent, restored]);
      return remaining;
    });
    setImageMaskDraftStroke(null);
  }

  function handleImageMaskPointerStart(point: RunnerImagePoint) {
    const nextStroke: RunnerImageMaskStroke = {
      id: `image-mask-stroke-${++imageMaskStrokeIdRef.current}`,
      brushSize: Number(point.brushSize || 44),
      points: [{ x: point.x, y: point.y }],
    };
    setImageMaskDraftStroke(nextStroke);
    setImageMaskRedoStrokes([]);
  }

  function handleImageMaskPointerMove(point: RunnerImagePoint) {
    setImageMaskDraftStroke((current) => {
      if (!current) return current;
      const previousPoint = current.points[current.points.length - 1];
      const distance = previousPoint
        ? Math.hypot(Number(point.x) - Number(previousPoint.x), Number(point.y) - Number(previousPoint.y))
        : Number.POSITIVE_INFINITY;
      if (distance < Math.max(1.5, Number(current.brushSize || 1) * 0.04)) {
        return current;
      }
      return {
        ...current,
        points: [...current.points, { x: point.x, y: point.y }],
      };
    });
  }

  function handleImageMaskPointerEnd() {
    setImageMaskDraftStroke((current) => {
      if (!current || !Array.isArray(current.points) || current.points.length === 0) {
        return null;
      }
      setImageMaskStrokes((strokesCurrent) => [...strokesCurrent, current]);
      return null;
    });
  }

  function buildImageCropRect(startPoint: RunnerImagePoint, endPoint: RunnerImagePoint): RunnerImageCropRect {
    const width = Math.max(1, Number(imageNaturalSize.width || 1));
    const height = Math.max(1, Number(imageNaturalSize.height || 1));
    const startX = Math.max(0, Math.min(width, Number(startPoint?.x || 0)));
    const startY = Math.max(0, Math.min(height, Number(startPoint?.y || 0)));
    const endX = Math.max(0, Math.min(width, Number(endPoint?.x || 0)));
    const endY = Math.max(0, Math.min(height, Number(endPoint?.y || 0)));
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    return {
      x,
      y,
      width: Math.max(0, Math.abs(endX - startX)),
      height: Math.max(0, Math.abs(endY - startY)),
    };
  }

  function buildImageCropRectFromDrag(point: RunnerImagePoint): RunnerImageCropRect | null {
    const dragState = imageCropDragStateRef.current;
    if (!dragState) return null;
    if (dragState.mode === "new") {
      return buildImageCropRect(dragState.startPoint, point);
    }

    const imageWidth = Math.max(1, Number(imageNaturalSize.width || 1));
    const imageHeight = Math.max(1, Number(imageNaturalSize.height || 1));
    const minSize = 8;
    const startRect = dragState.startRect || { x: 0, y: 0, width: 0, height: 0 };
    let left = Number(startRect.x || 0);
    let top = Number(startRect.y || 0);
    let right = left + Number(startRect.width || 0);
    let bottom = top + Number(startRect.height || 0);
    const target = String(dragState.mode || "new");

    if (target.includes("w")) left = Math.max(0, Math.min(right - minSize, Number(point.x || 0)));
    if (target.includes("e")) right = Math.min(imageWidth, Math.max(left + minSize, Number(point.x || 0)));
    if (target.includes("n")) top = Math.max(0, Math.min(bottom - minSize, Number(point.y || 0)));
    if (target.includes("s")) bottom = Math.min(imageHeight, Math.max(top + minSize, Number(point.y || 0)));

    const clampedLeft = Math.max(0, Math.min(imageWidth, left));
    const clampedTop = Math.max(0, Math.min(imageHeight, top));
    const clampedRight = Math.max(0, Math.min(imageWidth, right));
    const clampedBottom = Math.max(0, Math.min(imageHeight, bottom));
    return {
      x: clampedLeft,
      y: clampedTop,
      width: Math.max(0, clampedRight - clampedLeft),
      height: Math.max(0, clampedBottom - clampedTop),
    };
  }

  function handleImageCropPointerStart(point: RunnerImagePoint, target: RunnerImageCropTarget = "new") {
    const normalizedTarget = target && target !== "new" && imageCropRect ? target : "new";
    const currentCropRect: RunnerImageCropRect | null = normalizedTarget === "new" || !imageCropRect
      ? null
      : {
          x: Number(imageCropRect.x || 0),
          y: Number(imageCropRect.y || 0),
          width: Number(imageCropRect.width || 0),
          height: Number(imageCropRect.height || 0),
        };
    imageCropDragStateRef.current = {
      mode: normalizedTarget,
      startPoint: point,
      startRect: currentCropRect,
    };
    setImageCropDragTarget(normalizedTarget);
    const nextRect = normalizedTarget === "new"
      ? buildImageCropRect(point, point)
      : currentCropRect;
    imageCropDraftRectRef.current = nextRect;
    setImageCropDraftRect(nextRect);
    if (normalizedTarget === "new") {
      setImageCropRect(null);
    }
  }

  function handleImageCropPointerMove(point: RunnerImagePoint) {
    if (!imageCropDragStateRef.current) return;
    const nextRect = buildImageCropRectFromDrag(point);
    if (!nextRect) return;
    imageCropDraftRectRef.current = nextRect;
    setImageCropDraftRect(nextRect);
  }

  function handleImageCropPointerEnd() {
    const draftRect = imageCropDraftRectRef.current || imageCropDraftRect;
    const dragState = imageCropDragStateRef.current;
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
    setImageCropDragTarget("new");
    setImageCropDraftRect(null);
    if (!draftRect || Number(draftRect.width || 0) < 8 || Number(draftRect.height || 0) < 8) {
      if (!dragState || dragState.mode === "new") {
        setImageCropRect(null);
      }
      return;
    }
    setImageCropRect({
      x: Math.round(Number(draftRect.x || 0)),
      y: Math.round(Number(draftRect.y || 0)),
      width: Math.round(Number(draftRect.width || 0)),
      height: Math.round(Number(draftRect.height || 0)),
    });
  }

  async function loadImageForCrop(sourceUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load image for cropping."));
      image.src = sourceUrl;
    });
  }

  async function getImageCropSourceBlob(): Promise<Blob> {
    if (activeImageCropHistoryEntry?.blob) {
      return activeImageCropHistoryEntry.blob;
    }
    if (!resolvedImagePreviewUrl) {
      throw new Error("No source image is available for cropping.");
    }
    const response = await fetch(resolvedImagePreviewUrl, {
      headers: requestHeadersWithApiKey,
      credentials: "same-origin",
    });
    if (!response.ok) {
      throw new Error(`Failed to load image for cropping (${response.status}).`);
    }
    return response.blob();
  }

  async function createCroppedImageBlob(sourceBlob: Blob, cropRect: RunnerImageCropRect): Promise<Blob> {
    const imageSourceUrl = URL.createObjectURL(sourceBlob);
    try {
      const imageSource = await loadImageForCrop(imageSourceUrl);
      const rect = {
        x: Math.max(0, Math.round(Number(cropRect.x || 0))),
        y: Math.max(0, Math.round(Number(cropRect.y || 0))),
        width: Math.max(1, Math.round(Number(cropRect.width || 0))),
        height: Math.max(1, Math.round(Number(cropRect.height || 0))),
      };
      const sourceWidth = Math.max(1, Number(imageSource.width || imageSource.naturalWidth || imageNaturalSize.width || rect.width));
      const sourceHeight = Math.max(1, Number(imageSource.height || imageSource.naturalHeight || imageNaturalSize.height || rect.height));
      const safeRect = {
        x: Math.max(0, Math.min(sourceWidth - 1, rect.x)),
        y: Math.max(0, Math.min(sourceHeight - 1, rect.y)),
        width: Math.max(1, Math.min(sourceWidth - Math.max(0, rect.x), rect.width)),
        height: Math.max(1, Math.min(sourceHeight - Math.max(0, rect.y), rect.height)),
      };
      const canvas = document.createElement("canvas");
      canvas.width = safeRect.width;
      canvas.height = safeRect.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Image crop canvas is unavailable.");
      }
      ctx.drawImage(
        imageSource,
        safeRect.x,
        safeRect.y,
        safeRect.width,
        safeRect.height,
        0,
        0,
        safeRect.width,
        safeRect.height,
      );
      const mimeType = sourceBlob.type || attachment.mimeType || "image/png";
      return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create cropped image."));
        }, mimeType);
      });
    } finally {
      URL.revokeObjectURL(imageSourceUrl);
    }
  }

  async function applyImageCropToPreview() {
    if (!imageCropRect || isCroppingImage || isSavingImageCrop) return;
    setIsCroppingImage(true);
    try {
      const sourceBlob = await getImageCropSourceBlob();
      const croppedBlob = await createCroppedImageBlob(sourceBlob, imageCropRect);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      const nextIndex = imageCropHistoryIndex + 1;
      setImageCropHistory((current) => {
        const kept = current.slice(0, imageCropHistoryIndex);
        current.slice(imageCropHistoryIndex).forEach((entry) => {
          try {
            URL.revokeObjectURL(entry.url);
          } catch {}
        });
        return [
          ...kept,
          {
            blob: croppedBlob,
            url: croppedUrl,
            width: Math.round(Number(imageCropRect.width || 0)),
            height: Math.round(Number(imageCropRect.height || 0)),
          },
        ];
      });
      setImageCropHistoryIndex(nextIndex);
      setImageCropRect(null);
      setImageCropDraftRect(null);
    } catch {
      try {
        // The crop UI should fail quietly instead of breaking preview controls.
      } catch {}
    } finally {
      setIsCroppingImage(false);
    }
  }

  useEffect(() => {
    if (imagePreviewToolMode !== "crop" || !imageCropRect || isCroppingImage || isSavingImageCrop) {
      return;
    }

    function handleImageCropEnterKey(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey || event.repeat || event.isComposing) {
        return;
      }
      const target = event.target;
      const editableTarget = target instanceof HTMLElement
        && (
          target.tagName === "INPUT"
          || target.tagName === "TEXTAREA"
          || target.tagName === "SELECT"
          || target.isContentEditable
        );
      if (editableTarget) {
        return;
      }
      event.preventDefault();
      void applyImageCropToPreview();
    }

    window.addEventListener("keydown", handleImageCropEnterKey);
    return () => window.removeEventListener("keydown", handleImageCropEnterKey);
  }, [imageCropRect, imagePreviewToolMode, isCroppingImage, isSavingImageCrop]);

  async function saveImageCropToPreview() {
    if (!activeImageCropHistoryEntry?.blob || isCroppingImage || isSavingImageCrop) return;
    const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
    const normalizedEnvironmentId = String(resolvedEnvironmentId || "").trim();
    const normalizedWorkspacePath = normalizeRunnerPreviewWorkspacePath(resolvedWorkspacePath);
    if (!normalizedBackendUrl || !normalizedEnvironmentId || !normalizedWorkspacePath) return;
    setIsSavingImageCrop(true);
    try {
      const pathParts = normalizedWorkspacePath.split("/").filter(Boolean);
      const filename = pathParts.pop() || attachment.filename || "image.png";
      const parentPath = pathParts.join("/");
      const formData = new FormData();
      formData.append("file", activeImageCropHistoryEntry.blob, filename);
      formData.append("path", parentPath);
      const uploadResponse = await fetch(
        `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files/upload`,
        {
          method: "POST",
          headers: requestHeadersWithApiKey,
          body: formData,
        },
      );
      if (!uploadResponse.ok) {
        return;
      }
      setImagePreviewCacheBuster(Date.now().toString(36));
      resetImageCropTool();
    } finally {
      setIsSavingImageCrop(false);
    }
  }

  function undoImageCropHistory() {
    setImageCropHistoryIndex((current) => Math.max(0, current - 1));
    setImageCropRect(null);
    setImageCropDraftRect(null);
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
  }

  function redoImageCropHistory() {
    setImageCropHistoryIndex((current) => Math.min(imageCropHistory.length, current + 1));
    setImageCropRect(null);
    setImageCropDraftRect(null);
    imageCropDraftRectRef.current = null;
    imageCropDragStateRef.current = null;
  }

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

  const imagePreviewRootClassName = isImageAttachment ? " tb-attachment-preview-image-drawer" : "";
  const imageUnderstandingPreviewRootClassName = isImageUnderstandingAttachment ? " tb-attachment-preview-image-understanding-drawer" : "";
  const webSearchPreviewRootClassName = isWebSearchAttachment ? " tb-attachment-preview-web-search-drawer" : "";
  const previewRootClassName = surface
    ? `tb-attachment-preview-surface${inline ? " tb-attachment-preview-surface-inline" : ""}${imagePreviewRootClassName}${imageUnderstandingPreviewRootClassName}${webSearchPreviewRootClassName}${className ? ` ${className}` : ""}`
    : `tb-attachment-preview-drawer${inline ? " tb-attachment-preview-drawer-inline" : ""}${imagePreviewRootClassName}${imageUnderstandingPreviewRootClassName}${webSearchPreviewRootClassName}${className ? ` ${className}` : ""}`;
  const canUseBuiltInImageTools = Boolean(enableImagePreviewTools && isImageAttachment && effectiveImagePreviewUrl);
  const isBuiltInImageToolModeActive = canUseBuiltInImageTools && imagePreviewToolMode !== "idle";
  const canSaveImageCrop = Boolean(
    activeImageCropHistoryEntry?.blob
    && backendUrl
    && resolvedEnvironmentId
    && normalizeRunnerPreviewWorkspacePath(resolvedWorkspacePath)
  );
  const builtInImagePreviewOverlay = canUseBuiltInImageTools && imagePreviewToolMode === "select"
    ? (
      <RunnerImageSelectionMaskOverlay
        active
        naturalSize={imageNaturalSize}
        strokes={imageMaskStrokes}
        draftStroke={imageMaskDraftStroke}
        brushSize={44}
        onPointerStart={handleImageMaskPointerStart}
        onPointerMove={handleImageMaskPointerMove}
        onPointerEnd={handleImageMaskPointerEnd}
      />
    )
    : canUseBuiltInImageTools && imagePreviewToolMode === "crop"
      ? (
        <RunnerImageCropOverlay
          active
          naturalSize={imageNaturalSize}
          cropRect={imageCropRect}
          draftRect={imageCropDraftRect}
          dragTarget={imageCropDragTarget}
          onPointerStart={handleImageCropPointerStart}
          onPointerMove={handleImageCropPointerMove}
          onPointerEnd={handleImageCropPointerEnd}
        />
      )
      : null;
  const builtInImagePreviewHeaderActions = canUseBuiltInImageTools
    ? imagePreviewToolMode === "select"
      ? (
        <div className="tb-image-preview-selection-controls">
          <button
            type="button"
            className="tb-image-preview-selection-button is-icon is-plain"
            onClick={undoImageSelectionStroke}
            disabled={imageMaskStrokes.length === 0}
            title="Undo selection stroke"
            aria-label="Undo selection stroke"
          >
            <LucideChevronLeft width={16} height={16} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="tb-image-preview-selection-button is-icon is-plain"
            onClick={redoImageSelectionStroke}
            disabled={imageMaskRedoStrokes.length === 0}
            title="Redo selection stroke"
            aria-label="Redo selection stroke"
          >
            <LucideChevronRight width={16} height={16} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            className="tb-image-preview-selection-button is-plain"
            onClick={resetImageSelectionTool}
          >
            Cancel
          </button>
        </div>
      )
      : imagePreviewToolMode === "crop"
        ? (
          <div className="tb-image-preview-selection-controls">
            <button
              type="button"
              className="tb-image-preview-selection-button is-icon is-plain"
              onClick={undoImageCropHistory}
              disabled={imageCropHistoryIndex <= 0 || isCroppingImage || isSavingImageCrop}
              title="Undo crop"
              aria-label="Undo crop"
            >
              <LucideChevronLeft width={16} height={16} strokeWidth={1.9} />
            </button>
            <button
              type="button"
              className="tb-image-preview-selection-button is-icon is-plain"
              onClick={redoImageCropHistory}
              disabled={imageCropHistoryIndex >= imageCropHistory.length || isCroppingImage || isSavingImageCrop}
              title="Redo crop"
              aria-label="Redo crop"
            >
              <LucideChevronRight width={16} height={16} strokeWidth={1.9} />
            </button>
            <button
              type="button"
              className="tb-image-preview-selection-button is-plain"
              onClick={resetImageCropTool}
              disabled={isCroppingImage || isSavingImageCrop}
            >
              Cancel
            </button>
            <button
              type="button"
              className="tb-image-preview-selection-button"
              onClick={() => void applyImageCropToPreview()}
              disabled={!imageCropRect || isCroppingImage || isSavingImageCrop}
            >
              {isCroppingImage ? (
                <LucideLoaderCircle className="tb-context-action-notice-icon-spinner" width={14} height={14} strokeWidth={1.9} />
              ) : (
                <LucideCrop width={14} height={14} strokeWidth={1.9} />
              )}
              <span>{isCroppingImage ? "Cropping..." : "Apply Crop"}</span>
            </button>
            <button
              type="button"
              className="tb-image-preview-selection-button"
              onClick={() => void saveImageCropToPreview()}
              disabled={!canSaveImageCrop || isCroppingImage || isSavingImageCrop}
            >
              {isSavingImageCrop ? (
                <LucideLoaderCircle className="tb-context-action-notice-icon-spinner" width={14} height={14} strokeWidth={1.9} />
              ) : (
                <LucideCheck width={14} height={14} strokeWidth={1.9} />
              )}
              <span>{isSavingImageCrop ? "Saving..." : "Save"}</span>
            </button>
          </div>
        )
        : (
          <>
            <button
              type="button"
              className="tb-image-preview-select-button"
              onClick={beginImageSelectionTool}
              title="Select image area"
            >
              <LucideLassoSelect width={14} height={14} strokeWidth={1.9} />
              <span>Select</span>
            </button>
            <button
              type="button"
              className="tb-image-preview-select-button is-crop"
              onClick={beginImageCropTool}
              title="Crop image"
            >
              <LucideCrop width={14} height={14} strokeWidth={1.9} />
              <span>Crop</span>
            </button>
            <span className="tb-image-preview-header-divider" aria-hidden="true" />
          </>
        )
    : null;
  const spreadsheetPreviewHeaderActions = isSpreadsheetAttachment && spreadsheetPreviewControls?.canSave
    ? (
      <>
        <button
          type="button"
          className="tb-attachment-preview-drawer-action"
          onClick={spreadsheetPreviewControls.onUndo}
          disabled={!spreadsheetPreviewControls.canUndo || spreadsheetPreviewControls.isSaving}
          title="Undo change"
          aria-label="Undo change"
        >
          <LucideRotateCcw className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.9} />
        </button>
        <button
          type="button"
          className="tb-attachment-preview-drawer-action"
          onClick={spreadsheetPreviewControls.onRedo}
          disabled={!spreadsheetPreviewControls.canRedo || spreadsheetPreviewControls.isSaving}
          title="Redo change"
          aria-label="Redo change"
        >
          <LucideRotateCw className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.9} />
        </button>
        <button
          type="button"
          className="playground-code-preview-header-save-button tb-spreadsheet-preview-header-save-button"
          onClick={spreadsheetPreviewControls.onSave}
          disabled={!spreadsheetPreviewControls.isDirty || spreadsheetPreviewControls.isSaving}
          title="Save spreadsheet"
        >
          {spreadsheetPreviewControls.isSaving ? (
            <LucideLoaderCircle className="tb-context-action-notice-icon-spinner" width={14} height={14} strokeWidth={1.9} />
          ) : (
            <LucideHardDrive width={14} height={14} strokeWidth={1.9} />
          )}
          <span>{spreadsheetPreviewControls.isSaving ? "Saving..." : "Save"}</span>
        </button>
      </>
    )
    : null;
  const hasDrawerHeaderActions = Boolean(
    (isBuiltInImageToolModeActive ? builtInImagePreviewHeaderActions : (
      spreadsheetPreviewHeaderActions || headerActions || builtInImagePreviewHeaderActions || canShowAttachmentDiff || canTogglePreviewCode || headerActionsAfterPreviewToggle || (showCloseButton && onClose)
    ))
  );
  const shouldRenderImagePreviewZoomControl = Boolean(imagePreviewFullscreen && isImageAttachment && effectiveImagePreviewUrl);
  const imagePreviewZoomPercent = `${Math.round(Math.max(0.35, Math.min(5, imagePreviewZoom)) * 100)}%`;

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
          {shouldRenderImagePreviewZoomControl ? (
            <div className="tb-attachment-preview-drawer-header-center">
              <div className="tb-image-preview-zoom-control" aria-label="Image zoom controls">
                <button
                  type="button"
                  className="tb-image-preview-zoom-button"
                  onClick={() => applyImagePreviewZoomStep(-1)}
                  disabled={imagePreviewZoom <= 0.351}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <LucideMinus width={14} height={14} strokeWidth={1.9} />
                </button>
                <span className="tb-image-preview-zoom-label">{imagePreviewZoomPercent}</span>
                <button
                  type="button"
                  className="tb-image-preview-zoom-button"
                  onClick={() => applyImagePreviewZoomStep(1)}
                  disabled={imagePreviewZoom >= 4.99}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <LucidePlus width={14} height={14} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          ) : null}
          {hasDrawerHeaderActions ? (
            <div className="tb-attachment-preview-drawer-header-actions">
              {isBuiltInImageToolModeActive ? (
                builtInImagePreviewHeaderActions
              ) : (
	                <>
	                  {spreadsheetPreviewHeaderActions}
	                  {builtInImagePreviewHeaderActions}
	                  {canShowAttachmentDiff ? (
	                    <button
	                      type="button"
	                      className={`tb-image-preview-select-button tb-document-preview-mode-toggle${isAttachmentDiffMode ? " is-active" : ""}`}
	                      onClick={() => setAttachmentDiffMode((current) => !current)}
	                      aria-label={isAttachmentDiffMode ? "Show preview" : "Show diff"}
	                      aria-pressed={isAttachmentDiffMode}
	                      title={isAttachmentDiffMode ? "Show preview" : "Show diff"}
	                    >
	                      {isAttachmentDiffMode ? (
	                        <LucideEye width={14} height={14} strokeWidth={1.9} />
	                      ) : (
	                        <LucideFileDiff width={14} height={14} strokeWidth={1.9} />
	                      )}
	                      <span>{isAttachmentDiffMode ? "Preview" : "Diff"}</span>
	                    </button>
	                  ) : null}
	                  {canTogglePreviewCode ? (
	                    <button
	                      type="button"
	                      className={`tb-image-preview-select-button tb-document-preview-mode-toggle${isPreviewCodeMode ? " is-active" : ""}`}
	                      onClick={() => {
	                        setAttachmentDiffMode(false);
	                        if (isSpreadsheetAttachment) {
	                          setSpreadsheetPreviewMode((current) => current === "code" ? "preview" : "code");
	                          return;
                        }
                        setMarkdownPreviewMode((current) => current === "code" ? "rendered" : "code");
                      }}
                      aria-label={isPreviewCodeMode ? "Show preview" : "Show code"}
                      aria-pressed={isPreviewCodeMode}
                      title={isPreviewCodeMode ? "Show preview" : "Show code"}
                    >
                      {isPreviewCodeMode ? (
                        <LucideEye width={14} height={14} strokeWidth={1.9} />
                      ) : (
                        <LucideCode2 width={14} height={14} strokeWidth={1.9} />
                      )}
                      <span>{isPreviewCodeMode ? "Preview" : "Code"}</span>
                    </button>
                  ) : null}
                  {headerActions}
                  {headerActionsAfterPreviewToggle && !builtInImagePreviewHeaderActions ? (
                    <span className="tb-image-preview-header-divider" aria-hidden="true" />
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
                </>
              )}
            </div>
          ) : null}
        </div>
        <div className="tb-attachment-preview-drawer-body">
          {isImageUnderstandingAttachment && attachment.imageUnderstandingPreview ? (
            <RunnerImageUnderstandingSidebarPreview
              data={attachment.imageUnderstandingPreview}
              requestHeaders={requestHeadersWithApiKey}
            />
          ) : isWebSearchAttachment && attachment.webSearchPreview ? (
            <RunnerWebSearchSidebarPreview data={attachment.webSearchPreview} />
          ) : isAttachmentDiffMode ? (
            <RunnerFileDiffSurface
              filePath={resolvedWorkspacePath || attachment.workspacePath || attachment.filename}
              diffContent={attachment.diffContent || ""}
              fileContent={attachment.fileContent}
              additions={typeof attachment.diffAdditions === "number" ? attachment.diffAdditions : undefined}
              deletions={typeof attachment.diffDeletions === "number" ? attachment.diffDeletions : undefined}
              emptyMessage="Diff unavailable."
              embedded
            />
          ) : shouldRenderDirectoryPreview ? (
            renderDirectoryPreview()
          ) : isImageAttachment && effectiveImagePreviewUrl ? (
            <div ref={imagePreviewWheelRegionRef} className="tb-attachment-preview-image-zoom-region">
              <RunnerImagePreviewSurface
                src={effectiveImagePreviewUrl}
                alt={attachment.filename}
                mimeType={attachment.mimeType}
                fetchHeaders={requestHeadersWithApiKey}
                className={inline ? "tb-attachment-preview-image-surface" : undefined}
                imageClassName={inline ? "tb-attachment-preview-image" : undefined}
                interactive={imagePreviewInteractive && !isBuiltInImageToolModeActive}
                onWheel={enableImageWheelZoom && imagePreviewToolMode === "idle" ? handleImagePreviewWheel : undefined}
                onImageLoad={(dimensions) => {
                  setImageNaturalSize({
                    width: Math.round(Number(dimensions?.naturalWidth || 0)),
                    height: Math.round(Number(dimensions?.naturalHeight || 0)),
                  });
                  onImagePreviewLoad?.(dimensions);
                }}
                overlay={imagePreviewOverlay || builtInImagePreviewOverlay}
                style={imagePreviewReservedBottom > 0
                  ? ({
                      "--tb-attachment-preview-image-reserved-bottom": `${imagePreviewReservedBottom}px`,
                    } as CSSProperties)
                  : undefined}
                imageStyle={imagePreviewZoom !== 1
                  ? ({
                      transform: imagePreviewZoom === 1 ? undefined : `scale(${imagePreviewZoom})`,
                      transformOrigin: "center center",
                      transition: "transform 140ms ease",
                    } as CSSProperties)
                  : undefined}
              />
            </div>
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
          ) : documentPreviewState.kind === "spreadsheet" && documentPreviewState.blob ? (
            <div className="tb-attachment-preview-spreadsheet-mode-shell">
              <div className={`tb-attachment-preview-spreadsheet-mode-panel${spreadsheetPreviewMode === "code" ? " is-hidden" : ""}`}>
                <RunnerSpreadsheetPreview
                  blob={documentPreviewState.blob}
                  filename={attachment.filename}
                  mimeType={attachment.mimeType}
                  editable={Boolean(onDocumentBlobSave)}
                  onSave={onDocumentBlobSave}
                  onControlsChange={setSpreadsheetPreviewControls}
                />
              </div>
              {spreadsheetPreviewMode === "code" ? (
                <div className="tb-attachment-preview-code-shell">
                  <RunnerCodeViewer
                    content={spreadsheetPreviewControls?.codeText || ""}
                    filePath={attachment.filename}
                    language={spreadsheetPreviewControls?.codeLanguage || "json"}
                    maxHeight={inline ? 520 : 980}
                    showLineNumbers
                    className="tb-log-card-code-hide-scrollbars"
                  />
                </div>
              ) : null}
            </div>
          ) : documentPreviewState.kind === "presentation" && documentPreviewState.blob ? (
            <RunnerPresentationPreview
              blob={documentPreviewState.blob}
              filename={attachment.filename}
              mimeType={attachment.mimeType}
            />
          ) : documentPreviewState.kind === "video" && documentPreviewUrl ? (
            <div className="tb-attachment-preview-video-shell">
              <video
                className="tb-attachment-preview-video"
                src={documentPreviewUrl}
                controls
                playsInline
                preload="metadata"
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
