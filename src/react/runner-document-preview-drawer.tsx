import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  FileText as LucideFileText,
  LoaderCircle as LucideLoaderCircle,
  Minus as LucideMinus,
  Plus as LucidePlus,
  X as LucideX,
} from "lucide-react";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";
import {
  buildRunnerPreviewHeaders,
  buildRunnerPreviewHtmlDocument,
  getRunnerDocumentPreviewKind,
  resolveRunnerPreviewAssetUrl,
  type RunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
} from "./runner-document-preview.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { RunnerCodeViewer } from "./runner-log-boxes.js";
import { RunnerMarkdown } from "./runner-markdown.js";

const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();

interface AttachmentDocumentPreviewState {
  status: "idle" | "loading" | "ready" | "error";
  kind: RunnerDocumentPreviewKind | null;
  blob?: Blob | null;
  text?: string | null;
  error?: string | null;
}

export interface RunnerDocumentPreviewDrawerProps {
  attachment: RunnerPreviewAttachment;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  apiKey?: string;
  className?: string;
  inline?: boolean;
  onClose?: () => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  headerActions?: ReactNode;
  showCloseButton?: boolean;
  showResizeHandle?: boolean;
}

function isRunnerPreviewImageAttachment(attachment: RunnerPreviewAttachment): boolean {
  return attachment.type === "image" || String(attachment.mimeType || "").toLowerCase().startsWith("image/");
}

export function RunnerDocumentPreviewDrawer({
  attachment,
  backendUrl,
  requestHeaders,
  apiKey,
  className,
  inline = false,
  onClose,
  onResizeStart,
  headerActions,
  showCloseButton = true,
  showResizeHandle = false,
}: RunnerDocumentPreviewDrawerProps) {
  const documentPreviewDocxRef = useRef<HTMLDivElement | null>(null);
  const documentPreviewPdfViewportRef = useRef<HTMLDivElement | null>(null);
  const documentPreviewObjectUrlRef = useRef<string | null>(null);
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

  const isImageAttachment = isRunnerPreviewImageAttachment(attachment);
  const requestHeadersWithApiKey = useMemo(
    () => buildRunnerPreviewHeaders(requestHeaders, apiKey),
    [apiKey, requestHeaders]
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
        return "";
      }
      return resolveRunnerPreviewAssetUrl(attachment.htmlPreviewUrl, backendUrl, attachment.id) || "";
    },
    [attachment.htmlPreviewUrl, attachment.id, backendUrl]
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
    documentPreviewPdfCanvasRefs.current = {};
    documentPreviewPdfPageRefs.current = {};
  }, [attachment.id]);

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
    if (documentPreviewDocxRef.current) {
      documentPreviewDocxRef.current.innerHTML = "";
    }

    if (isImageAttachment) {
      setDocumentPreviewState({
        status: "idle",
        kind: null,
      });
      return;
    }

    const previewKind = attachment.previewKindOverride ?? getRunnerDocumentPreviewKind(attachment);
    if (previewKind === "unsupported") {
      setDocumentPreviewState({
        status: "ready",
        kind: "unsupported",
      });
      return;
    }

    const previewUrl =
      resolveRunnerPreviewAssetUrl(attachment.url, backendUrl, attachment.id) ||
      resolveRunnerPreviewAssetUrl(attachment.previewUrl, backendUrl, attachment.id);
    if (previewKind === "html" && resolvedDirectHtmlPreviewUrl) {
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
            text: previewDocument,
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
  }, [attachment, backendUrl, isImageAttachment, requestHeadersWithApiKey, resolvedDirectHtmlPreviewUrl]);

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

  return (
    <div className={`tb-runner-document-preview-host${inline ? " tb-runner-document-preview-host-inline" : ""}`}>
      <aside
        className={`tb-attachment-preview-drawer${inline ? " tb-attachment-preview-drawer-inline" : ""}${className ? ` ${className}` : ""}`}
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
          <div className="tb-attachment-preview-drawer-header-copy">
            <img
              src={RUNNER_TEXT_FILE_ICON_URL}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="tb-attachment-preview-drawer-header-icon-asset"
            />
            <div className="tb-attachment-preview-drawer-header-text">
              <div className="tb-attachment-preview-drawer-name" title={attachment.filename}>
                {attachment.filename}
              </div>
            </div>
          </div>
          {headerActions || (showCloseButton && onClose) ? (
            <div className="tb-attachment-preview-drawer-header-actions">
              {headerActions}
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
          {isImageAttachment && resolvedImagePreviewUrl ? (
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
            <iframe
              src={resolvedDirectHtmlPreviewUrl || documentPreviewUrl || undefined}
              srcDoc={resolvedDirectHtmlPreviewUrl ? undefined : (typeof documentPreviewState.text === "string" ? documentPreviewState.text : undefined)}
              sandbox={htmlIframeSandbox}
              title={attachment.filename}
              className="tb-attachment-preview-frame"
            />
          ) : documentPreviewState.kind === "markdown" && typeof documentPreviewState.text === "string" ? (
            <div className="tb-attachment-preview-markdown-shell">
              <RunnerMarkdown
                content={documentPreviewState.text}
                className="tb-attachment-preview-markdown tb-message-markdown"
                softBreaks
              />
            </div>
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
