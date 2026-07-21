import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";
import {
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Code2 as LucideCode2,
  Crop as LucideCrop,
  Eye as LucideEye,
  FileDiff as LucideFileDiff,
  FileText as LucideFileText,
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
import { mountRunnerChatStyles } from "../styles/index.js";
import {
  buildRunnerPreviewHeaders,
  buildRunnerPreviewHtmlDocument,
  buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl,
  getRunnerDocumentPreviewKind,
  normalizeRunnerPreviewWorkspacePath,
  resolveRunnerPreviewAssetUrl,
  type RunnerPreviewAttachment,
} from "./preview-contracts.js";
import { RunnerImagePreviewSurface } from "./image-preview-surface.js";
import { RunnerFileDiffSurface } from "../../composite/diff-viewer/index.js";
import {
  RunnerImageCropOverlay,
  RunnerImageSelectionMaskOverlay,
  type RunnerImageCropRect,
  type RunnerImageCropTarget,
  type RunnerImageMaskStroke,
  type RunnerImageNaturalSize,
  type RunnerImagePoint,
} from "./image-edit-overlays.js";
import { RunnerCodeViewer } from "../log-boxes/index.js";
import { RunnerMarkdown } from "../shared/runner-markdown.js";
import { RunnerPresentationPreview } from "./presentation-preview.js";
import {
  RunnerSpreadsheetPreview,
  type RunnerSpreadsheetPreviewControls,
  type RunnerSpreadsheetSaveOptions,
} from "./spreadsheet-preview.js";
import {
  RunnerDirectoryPreview,
  useRunnerDirectoryPreview,
} from "./directory-preview.js";
import {
  applyRunnerImageWheelZoom,
  buildRunnerImageCropRect,
  buildRunnerImageCropRectFromDrag,
  stepRunnerImageZoom,
  type RunnerImageCropDragState,
} from "./image-preview-state.js";
import { RunnerPdfPreview } from "./pdf-preview.js";
import {
  getRunnerPreviewAttachmentEnvironmentId,
  getRunnerPreviewAttachmentWorkspacePath,
  getRunnerPreviewTextMimeType,
  isRunnerPreviewEditableSpreadsheetCode,
  isRunnerPreviewEditableTextDocumentKind,
  isRunnerPreviewImageAttachment,
  type AttachmentDocumentPreviewState,
  type RunnerPreviewEditableCodeSource,
} from "./preview-state.js";
import {
  RunnerImageUnderstandingSidebarPreview,
  RunnerMediaGenerationPromptSidebarPreview,
  RunnerWebSearchSidebarPreview,
} from "./specialized-preview-view.js";

const RUNNER_FOLDER_ICON_URL = new URL("../assets/folder.png", import.meta.url).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL("../assets/txtfile.png", import.meta.url).toString();

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
  showHeaderCopy?: boolean;
  showCloseButton?: boolean;
  showResizeHandle?: boolean;
  onDocumentBlobSave?: (blob: Blob, options: RunnerSpreadsheetSaveOptions) => Promise<void> | void;
  onWorkspacePathOpen?: (path: string, options?: { isFolder?: boolean }) => void;
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
  showHeaderCopy = true,
  showCloseButton = true,
  showResizeHandle = false,
  onDocumentBlobSave,
  onWorkspacePathOpen,
}: RunnerDocumentPreviewDrawerProps) {
  const documentPreviewDocxRef = useRef<HTMLDivElement | null>(null);
  const documentPreviewObjectUrlRef = useRef<string | null>(null);
  const documentPreviewLoadKeyRef = useRef<string>("");
  const [documentPreviewState, setDocumentPreviewState] = useState<AttachmentDocumentPreviewState>({
    status: "idle",
    kind: null,
  });
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null);
  const [markdownPreviewMode, setMarkdownPreviewMode] = useState<"rendered" | "code">("rendered");
  const [spreadsheetPreviewMode, setSpreadsheetPreviewMode] = useState<"preview" | "code">("preview");
  const [attachmentDiffMode, setAttachmentDiffMode] = useState(false);
  const [spreadsheetPreviewControls, setSpreadsheetPreviewControls] = useState<RunnerSpreadsheetPreviewControls | null>(null);
  const [editableCodeDraft, setEditableCodeDraft] = useState("");
  const [editableCodeBaseline, setEditableCodeBaseline] = useState("");
  const [editableCodeSourceKey, setEditableCodeSourceKey] = useState("");
  const [editableCodeSaveState, setEditableCodeSaveState] = useState<{
    status: "idle" | "saving" | "saved" | "error";
    message: string;
  }>({ status: "idle", message: "" });
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
  const imagePreviewWheelRegionRef = useRef<HTMLDivElement | null>(null);
  const imageMaskStrokeIdRef = useRef(0);
  const imageCropDraftRectRef = useRef<RunnerImageCropRect | null>(null);
  const imageCropDragStateRef =
    useRef<RunnerImageCropDragState | null>(null);

  const isImageAttachment = isRunnerPreviewImageAttachment(attachment);
  const attachmentPreviewKind = !isImageAttachment
    ? attachment.previewKindOverride ?? getRunnerDocumentPreviewKind(attachment)
    : null;
  const isImageUnderstandingAttachment = attachmentPreviewKind === "image-understanding" && Boolean(attachment.imageUnderstandingPreview);
  const isWebSearchAttachment = attachmentPreviewKind === "web-search" && Boolean(attachment.webSearchPreview);
  const isImageGenerationPromptAttachment = attachmentPreviewKind === "image-generation-prompt" && Boolean(attachment.imageGenerationPromptPreview);
  const isVideoGenerationPromptAttachment = attachmentPreviewKind === "video-generation-prompt" && Boolean(attachment.videoGenerationPromptPreview);

  useEffect(() => {
    imageCropHistoryRef.current = imageCropHistory;
  }, [imageCropHistory]);
  const resolvedEnvironmentId = getRunnerPreviewAttachmentEnvironmentId(attachment, environmentId);
  const resolvedWorkspacePath = getRunnerPreviewAttachmentWorkspacePath(attachment);
  const requestHeadersWithApiKey = useMemo(
    () => buildRunnerPreviewHeaders(requestHeaders, apiKey),
    [apiKey, requestHeaders]
  );
  const requestHeadersWithApiKeySignature = useMemo(
    () => JSON.stringify(Array.from(requestHeadersWithApiKey.entries()).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))),
    [requestHeadersWithApiKey]
  );
  const {
    canAttemptDirectoryPreview,
    shouldRenderDirectoryPreview,
    isDirectoryLikePreview,
    previewProps: directoryPreviewProps,
  } = useRunnerDirectoryPreview({
    attachment,
    attachmentPreviewKind,
    backendUrl,
    environmentId: resolvedEnvironmentId,
    isImageAttachment,
    requestHeaders: requestHeadersWithApiKey,
    onWorkspacePathOpen,
  });
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
  const editableCodeSource = useMemo<RunnerPreviewEditableCodeSource | null>(() => {
    if (documentPreviewState.status !== "ready") {
      return null;
    }

    if (
      isRunnerPreviewEditableTextDocumentKind(documentPreviewState.kind)
      && typeof documentPreviewState.text === "string"
    ) {
      const language = documentPreviewState.kind === "markdown"
        ? "markdown"
        : documentPreviewState.kind === "html"
          ? "html"
          : undefined;
      const text = documentPreviewState.text;
      return {
        key: JSON.stringify(["text", attachment.id, attachment.filename, documentPreviewState.kind, text.length, text.slice(0, 80), text.slice(-80)]),
        text,
        language,
        filename: attachment.filename,
        mimeType: getRunnerPreviewTextMimeType(attachment.filename, attachment.mimeType, language),
        canSave: Boolean(onDocumentBlobSave),
      };
    }

    if (documentPreviewState.kind === "spreadsheet" && spreadsheetPreviewMode === "code" && spreadsheetPreviewControls) {
      const text = spreadsheetPreviewControls.codeText || "";
      return {
        key: JSON.stringify(["spreadsheet", attachment.id, attachment.filename, spreadsheetPreviewControls.codeLanguage, text.length, text.slice(0, 80), text.slice(-80)]),
        text,
        language: spreadsheetPreviewControls.codeLanguage || undefined,
        filename: attachment.filename,
        mimeType: getRunnerPreviewTextMimeType(attachment.filename, attachment.mimeType, spreadsheetPreviewControls.codeLanguage),
        canSave: Boolean(onDocumentBlobSave && isRunnerPreviewEditableSpreadsheetCode(attachment.filename, attachment.mimeType)),
      };
    }

    return null;
  }, [
    attachment.filename,
    attachment.id,
    attachment.mimeType,
    documentPreviewState.kind,
    documentPreviewState.status,
    documentPreviewState.text,
    onDocumentBlobSave,
    spreadsheetPreviewControls,
    spreadsheetPreviewMode,
  ]);
  useEffect(() => {
    const nextSourceKey = editableCodeSource?.key || "";
    if (nextSourceKey === editableCodeSourceKey) {
      return;
    }
    setEditableCodeSourceKey(nextSourceKey);
    const nextSourceText = editableCodeSource?.text || "";
    setEditableCodeDraft(nextSourceText);
    setEditableCodeBaseline(nextSourceText);
    setEditableCodeSaveState({ status: "idle", message: "" });
  }, [editableCodeSource, editableCodeSourceKey]);
  const editableCodeText = editableCodeSourceKey && editableCodeSource?.key === editableCodeSourceKey
    ? editableCodeDraft
    : editableCodeSource?.text || "";
  const isEditableCodeDirty = Boolean(editableCodeSource && editableCodeText !== editableCodeBaseline);
  const handleEditableCodeSave = useCallback(async () => {
    if (!editableCodeSource?.canSave || !onDocumentBlobSave || editableCodeSaveState.status === "saving") {
      return;
    }

    setEditableCodeSaveState({ status: "saving", message: "" });
    try {
      const blob = new Blob([editableCodeText], { type: editableCodeSource.mimeType || "text/plain;charset=utf-8" });
      await Promise.resolve(onDocumentBlobSave(blob, {
        filename: editableCodeSource.filename,
        mimeType: editableCodeSource.mimeType,
      }));
      setEditableCodeBaseline(editableCodeText);
      setEditableCodeSaveState({ status: "saved", message: "Saved" });
    } catch (error) {
      setEditableCodeSaveState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to save file.",
      });
    }
  }, [editableCodeSaveState.status, editableCodeSource, editableCodeText, onDocumentBlobSave]);
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
    documentPreviewLoadKeyRef.current = "";
  }, [attachment.id]);

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

    if (
      isImageAttachment
      || previewKind === "image-understanding"
      || previewKind === "web-search"
      || previewKind === "image-generation-prompt"
      || previewKind === "video-generation-prompt"
    ) {
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
      if (isPreviewCodeMode && editableCodeSource?.canSave) {
        void handleEditableCodeSave();
        return;
      }
      spreadsheetPreviewControls?.onSave();
    }

    window.addEventListener("keydown", handleSpreadsheetSaveShortcut, true);
    return () => window.removeEventListener("keydown", handleSpreadsheetSaveShortcut, true);
  }, [editableCodeSource?.canSave, handleEditableCodeSave, isPreviewCodeMode, isSpreadsheetAttachment, spreadsheetPreviewControls]);

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
    return () => {
      if (documentPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(documentPreviewObjectUrlRef.current);
      }
      imageCropHistoryRef.current.forEach((entry) => {
        try {
          URL.revokeObjectURL(entry.url);
        } catch {}
      });
    };
  }, []);

  function applyImagePreviewWheelDelta(deltaY: number, options?: { modified?: boolean }) {
    if (!enableImageWheelZoom || imagePreviewToolMode !== "idle" || !isImageAttachment || !effectiveImagePreviewUrl) {
      return;
    }
    if (!Number.isFinite(deltaY) || deltaY === 0) {
      return;
    }
    setImagePreviewZoom((current) =>
      applyRunnerImageWheelZoom(current, deltaY, options),
    );
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
    setImagePreviewZoom((current) =>
      stepRunnerImageZoom(current, direction),
    );
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
      ? buildRunnerImageCropRect(imageNaturalSize, point, point)
      : currentCropRect;
    imageCropDraftRectRef.current = nextRect;
    setImageCropDraftRect(nextRect);
    if (normalizedTarget === "new") {
      setImageCropRect(null);
    }
  }

  function handleImageCropPointerMove(point: RunnerImagePoint) {
    if (!imageCropDragStateRef.current) return;
    const nextRect = buildRunnerImageCropRectFromDrag(
      imageNaturalSize,
      imageCropDragStateRef.current,
      point,
    );
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

  const imagePreviewRootClassName = isImageAttachment ? " tb-attachment-preview-image-drawer" : "";
  const imageUnderstandingPreviewRootClassName = isImageUnderstandingAttachment ? " tb-attachment-preview-image-understanding-drawer" : "";
  const webSearchPreviewRootClassName = isWebSearchAttachment ? " tb-attachment-preview-web-search-drawer" : "";
  const mediaGenerationPromptPreviewRootClassName = isImageGenerationPromptAttachment || isVideoGenerationPromptAttachment ? " tb-attachment-preview-media-generation-prompt-drawer" : "";
  const previewRootClassName = surface
    ? `tb-attachment-preview-surface${inline ? " tb-attachment-preview-surface-inline" : ""}${imagePreviewRootClassName}${imageUnderstandingPreviewRootClassName}${webSearchPreviewRootClassName}${mediaGenerationPromptPreviewRootClassName}${className ? ` ${className}` : ""}`
    : `tb-attachment-preview-drawer${inline ? " tb-attachment-preview-drawer-inline" : ""}${imagePreviewRootClassName}${imageUnderstandingPreviewRootClassName}${webSearchPreviewRootClassName}${mediaGenerationPromptPreviewRootClassName}${className ? ` ${className}` : ""}`;
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
  const spreadsheetPreviewHeaderActions = isSpreadsheetAttachment && spreadsheetPreviewControls?.canSave && spreadsheetPreviewMode !== "code"
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
  const editableCodeHeaderActions = isPreviewCodeMode && editableCodeSource?.canSave
    ? (
      <>
        {editableCodeSaveState.message ? (
          <span className={`tb-attachment-preview-code-save-message is-${editableCodeSaveState.status}`}>
            {editableCodeSaveState.message}
          </span>
        ) : null}
        <button
          type="button"
          className="playground-code-preview-header-save-button tb-spreadsheet-preview-header-save-button"
          onClick={() => void handleEditableCodeSave()}
          disabled={!isEditableCodeDirty || editableCodeSaveState.status === "saving"}
          title="Save file"
        >
          {editableCodeSaveState.status === "saving" ? (
            <LucideLoaderCircle className="tb-context-action-notice-icon-spinner" width={14} height={14} strokeWidth={1.9} />
          ) : (
            <LucideHardDrive width={14} height={14} strokeWidth={1.9} />
          )}
          <span>{editableCodeSaveState.status === "saving" ? "Saving..." : "Save"}</span>
        </button>
      </>
    )
    : null;
  const hasDrawerHeaderActions = Boolean(
    (isBuiltInImageToolModeActive ? builtInImagePreviewHeaderActions : (
      editableCodeHeaderActions || spreadsheetPreviewHeaderActions || headerActions || builtInImagePreviewHeaderActions || canShowAttachmentDiff || canTogglePreviewCode || headerActionsAfterPreviewToggle || (showCloseButton && onClose)
    ))
  );
  const shouldRenderImagePreviewZoomControl = Boolean(imagePreviewFullscreen && isImageAttachment && effectiveImagePreviewUrl);
  const imagePreviewZoomPercent = `${Math.round(Math.max(0.35, Math.min(5, imagePreviewZoom)) * 100)}%`;
  const shouldRenderDrawerHeader = Boolean(
    showHeaderCopy || shouldRenderImagePreviewZoomControl || hasDrawerHeaderActions
  );

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
        {shouldRenderDrawerHeader ? (
          <div className="tb-attachment-preview-drawer-header">
            {showHeaderCopy ? (
              headerCopy ? (
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
              )
            ) : null}
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
	                    {editableCodeHeaderActions}
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
        ) : null}
        <div className="tb-attachment-preview-drawer-body">
          {isImageUnderstandingAttachment && attachment.imageUnderstandingPreview ? (
            <RunnerImageUnderstandingSidebarPreview
              data={attachment.imageUnderstandingPreview}
              requestHeaders={requestHeadersWithApiKey}
            />
          ) : isWebSearchAttachment && attachment.webSearchPreview ? (
            <RunnerWebSearchSidebarPreview data={attachment.webSearchPreview} />
          ) : isImageGenerationPromptAttachment && attachment.imageGenerationPromptPreview ? (
            <RunnerMediaGenerationPromptSidebarPreview data={attachment.imageGenerationPromptPreview} />
          ) : isVideoGenerationPromptAttachment && attachment.videoGenerationPromptPreview ? (
            <RunnerMediaGenerationPromptSidebarPreview data={attachment.videoGenerationPromptPreview} />
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
            <RunnerDirectoryPreview {...directoryPreviewProps} />
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
          ) : documentPreviewState.kind === "pdf" && documentPreviewState.blob ? (
            <RunnerPdfPreview
              attachmentId={attachment.id}
              blob={documentPreviewState.blob}
            />
          ) : documentPreviewState.kind === "html" && (resolvedDirectHtmlPreviewUrl || typeof documentPreviewState.text === "string" || documentPreviewUrl) ? (
            markdownPreviewMode === "code" && typeof documentPreviewState.text === "string" ? (
              <div className="tb-attachment-preview-code-shell">
                <RunnerCodeViewer
                  content={editableCodeSource?.key === editableCodeSourceKey ? editableCodeText : documentPreviewState.text}
                  filePath={attachment.filename}
                  language="html"
                  maxHeight={inline ? 520 : 980}
                  showLineNumbers
                  className="tb-log-card-code-hide-scrollbars"
                  readOnly={!editableCodeSource?.canSave}
                  onChange={setEditableCodeDraft}
                  fillHeight
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
                  content={editableCodeSource?.key === editableCodeSourceKey ? editableCodeText : documentPreviewState.text}
                  filePath={attachment.filename}
                  language="markdown"
                  maxHeight={inline ? 520 : 980}
                  showLineNumbers
                  className="tb-log-card-code-hide-scrollbars"
                  readOnly={!editableCodeSource?.canSave}
                  onChange={setEditableCodeDraft}
                  fillHeight
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
                content={editableCodeSource?.key === editableCodeSourceKey ? editableCodeText : documentPreviewState.text}
                filePath={attachment.filename}
                maxHeight={inline ? 520 : 980}
                showLineNumbers
                className="tb-log-card-code-hide-scrollbars"
                readOnly={!editableCodeSource?.canSave}
                onChange={setEditableCodeDraft}
                fillHeight
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
                    content={editableCodeSource?.key === editableCodeSourceKey ? editableCodeText : spreadsheetPreviewControls?.codeText || ""}
                    filePath={attachment.filename}
                    language={spreadsheetPreviewControls?.codeLanguage || "json"}
                    maxHeight={inline ? 520 : 980}
                    showLineNumbers
                    className="tb-log-card-code-hide-scrollbars"
                    readOnly={!editableCodeSource?.canSave}
                    onChange={setEditableCodeDraft}
                    fillHeight
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
