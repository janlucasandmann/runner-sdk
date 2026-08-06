import {
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  FileText as LucideFileText,
  LoaderCircle as LucideLoaderCircle,
  Minus as LucideMinus,
  Plus as LucidePlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PlatformLoadingState } from "../../composite/loading-state/index.js";
import {
  clampRunnerPdfPage,
  RUNNER_PDF_MAX_ZOOM,
  RUNNER_PDF_MIN_ZOOM,
  stepRunnerPdfZoom,
} from "./pdf-preview-state.js";

interface RunnerPdfViewport {
  width: number;
  height: number;
}

interface RunnerPdfRenderTask {
  cancel?: () => void;
  promise: Promise<unknown>;
}

interface RunnerPdfPage {
  getViewport: (options: { scale: number }) => RunnerPdfViewport;
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: RunnerPdfViewport;
    transform?: number[];
  }) => RunnerPdfRenderTask;
}

interface RunnerPdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<RunnerPdfPage>;
  destroy?: () => void | Promise<void>;
}

interface RunnerPdfLoadingTask {
  promise: Promise<RunnerPdfDocument>;
  destroy?: () => void | Promise<void>;
}

export interface RunnerPdfPreviewProps {
  attachmentId: string;
  blob: Blob;
}

function cancelRunnerPdfRenderTasks(tasks: RunnerPdfRenderTask[]): RunnerPdfRenderTask[] {
  for (const task of tasks) {
    try {
      task.cancel?.();
    } catch {
      // A completed PDF.js task may reject cancellation.
    }
  }
  return [];
}

export function RunnerPdfPreview({ attachmentId, blob }: RunnerPdfPreviewProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const renderTasksRef = useRef<RunnerPdfRenderTask[]>([]);
  const documentRef = useRef<RunnerPdfDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void attachmentId;
    void blob;
    setPageCount(0);
    setPage(1);
    setZoom(1);
    setViewportSize({ width: 0, height: 0 });
    setIsRendering(false);
    setError(null);
    canvasRefs.current = {};
    pageRefs.current = {};
  }, [attachmentId, blob]);

  useEffect(() => {
    void attachmentId;
    void pageCount;
    const viewport = viewportRef.current;
    if (!viewport) {
      setViewportSize({ width: 0, height: 0 });
      return;
    }

    const updateSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };
    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [attachmentId, pageCount]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: RunnerPdfLoadingTask | null = null;
    setIsRendering(true);
    setError(null);
    setPageCount(0);

    void import("pdfjs-dist/build/pdf.mjs")
      .then(async (pdfjs) => {
        if (cancelled) {
          return;
        }
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }
        const task = pdfjs.getDocument({
          data: await blob.arrayBuffer(),
        }) as unknown as RunnerPdfLoadingTask;
        loadingTask = task;
        const pdfDocument = await task.promise;
        if (cancelled) {
          await pdfDocument.destroy?.();
          return;
        }
        documentRef.current = pdfDocument;
        setPageCount(pdfDocument.numPages);
        setPage((current) => clampRunnerPdfPage(current, pdfDocument.numPages));
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }
        const normalizedError =
          loadError instanceof Error ? loadError : new Error(String(loadError));
        setError(normalizedError.message || "Failed to load PDF preview.");
        setIsRendering(false);
      });

    return () => {
      cancelled = true;
      void loadingTask?.destroy?.();
      renderTasksRef.current = cancelRunnerPdfRenderTasks(renderTasksRef.current);
      void documentRef.current?.destroy?.();
      documentRef.current = null;
    };
  }, [blob]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    const pdfDocument = documentRef.current;
    if (!pdfDocument || !viewportElement || pageCount === 0 || viewportSize.width === 0) {
      return;
    }

    let cancelled = false;
    setIsRendering(true);
    setError(null);
    renderTasksRef.current = cancelRunnerPdfRenderTasks(renderTasksRef.current);

    void (async () => {
      const availableWidth = Math.max(viewportElement.clientWidth - 36, 200);
      const devicePixelRatio = window.devicePixelRatio || 1;

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        if (cancelled) {
          return;
        }
        const canvas = canvasRefs.current[pageNumber];
        if (!canvas) {
          continue;
        }

        const pdfPage = await pdfDocument.getPage(pageNumber);
        if (cancelled) {
          return;
        }
        const initialViewport = pdfPage.getViewport({ scale: 1 });
        const baseScale = availableWidth / initialViewport.width;
        const renderScale = Math.max(0.2, Math.min(6, baseScale * zoom));
        const renderViewport = pdfPage.getViewport({
          scale: renderScale,
        });
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Failed to initialize PDF canvas.");
        }

        canvas.width = Math.floor(renderViewport.width * devicePixelRatio);
        canvas.height = Math.floor(renderViewport.height * devicePixelRatio);
        canvas.style.width = `${renderViewport.width}px`;
        canvas.style.height = `${renderViewport.height}px`;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = pdfPage.render({
          canvasContext: context,
          viewport: renderViewport,
          transform:
            devicePixelRatio === 1 ? undefined : [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0],
        });
        renderTasksRef.current.push(renderTask);
        await renderTask.promise;
      }
    })()
      .catch((renderError: unknown) => {
        const errorName =
          renderError && typeof renderError === "object" && "name" in renderError
            ? String(renderError.name)
            : "";
        if (cancelled || errorName === "RenderingCancelledException") {
          return;
        }
        const normalizedError =
          renderError instanceof Error ? renderError : new Error(String(renderError));
        setError(normalizedError.message || "Failed to render PDF preview.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsRendering(false);
        }
        renderTasksRef.current = [];
      });

    return () => {
      cancelled = true;
      renderTasksRef.current = cancelRunnerPdfRenderTasks(renderTasksRef.current);
    };
  }, [pageCount, viewportSize, zoom]);

  useEffect(() => {
    void viewportSize;
    void zoom;
    const viewport = viewportRef.current;
    if (pageCount === 0 || !viewport) {
      return;
    }

    let animationFrameId: number | null = null;
    const updateVisiblePage = () => {
      animationFrameId = null;
      const viewportCenter = viewport.scrollTop + viewport.clientHeight / 2;
      let bestPage = 1;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const pageElement = pageRefs.current[pageNumber];
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
      setPage((current) => (current === bestPage ? current : bestPage));
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = window.requestAnimationFrame(updateVisiblePage);
    };

    updateVisiblePage();
    viewport.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [pageCount, viewportSize, zoom]);

  function scrollToPage(nextPage: number) {
    const viewport = viewportRef.current;
    const clampedPage = clampRunnerPdfPage(nextPage, pageCount);
    const pageElement = pageRefs.current[clampedPage];
    if (!viewport || !pageElement) {
      return;
    }
    viewport.scrollTo({
      top: Math.max(pageElement.offsetTop - 20, 0),
      behavior: "smooth",
    });
    setPage(clampedPage);
  }

  if (error) {
    return (
      <div className="tb-attachment-preview-state tb-attachment-preview-state-error">
        <LucideFileText className="tb-attachment-preview-state-icon" strokeWidth={1.8} />
        <span>{error}</span>
      </div>
    );
  }

  if (pageCount === 0) {
    return (
      <PlatformLoadingState
        centered
        className="tb-attachment-preview-state"
        message="Loading PDF..."
      />
    );
  }

  return (
    <div className="tb-attachment-preview-pdf">
      <div ref={viewportRef} className="tb-attachment-preview-pdf-viewport">
        <div className="tb-attachment-preview-pdf-pages">
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <div
                key={`${attachmentId}:page:${pageNumber}`}
                ref={(element) => {
                  pageRefs.current[pageNumber] = element;
                }}
                className="tb-attachment-preview-pdf-page-shell"
              >
                <div className="tb-attachment-preview-pdf-page">
                  <canvas
                    ref={(element) => {
                      canvasRefs.current[pageNumber] = element;
                    }}
                    className="tb-attachment-preview-pdf-canvas"
                  />
                </div>
              </div>
            );
          })}
        </div>
        {isRendering ? (
          <div className="tb-attachment-preview-pdf-rendering">
            <LucideLoaderCircle
              className="tb-attachment-preview-state-icon tb-context-action-notice-icon-spinner"
              strokeWidth={1.8}
            />
          </div>
        ) : null}
      </div>
      <div className="tb-attachment-preview-pdf-controls">
        <button
          type="button"
          className="tb-attachment-preview-pdf-control-button"
          onClick={() => scrollToPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <LucideChevronLeft className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
        </button>
        <div className="tb-attachment-preview-pdf-page-indicator">
          {page}/{pageCount}
        </div>
        <div className="tb-attachment-preview-pdf-divider" />
        <button
          type="button"
          className="tb-attachment-preview-pdf-control-button"
          onClick={() => setZoom((current) => stepRunnerPdfZoom(current, -1))}
          disabled={zoom <= RUNNER_PDF_MIN_ZOOM}
          aria-label="Zoom out"
        >
          <LucideMinus className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
        </button>
        <div className="tb-attachment-preview-pdf-zoom-label">{Math.round(zoom * 100)}%</div>
        <button
          type="button"
          className="tb-attachment-preview-pdf-control-button"
          onClick={() => setZoom((current) => stepRunnerPdfZoom(current, 1))}
          disabled={zoom >= RUNNER_PDF_MAX_ZOOM}
          aria-label="Zoom in"
        >
          <LucidePlus className="tb-attachment-preview-pdf-control-icon" strokeWidth={1.9} />
        </button>
        <div className="tb-attachment-preview-pdf-divider" />
        <button
          type="button"
          className="tb-attachment-preview-pdf-control-button"
          onClick={() => scrollToPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <LucideChevronRight
            className="tb-attachment-preview-pdf-control-icon"
            strokeWidth={1.9}
          />
        </button>
      </div>
    </div>
  );
}
