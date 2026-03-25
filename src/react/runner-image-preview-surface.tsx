import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, X as LucideX } from "lucide-react";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";

export interface RunnerImagePreviewSurfaceProps {
  src: string;
  alt?: string;
  mimeType?: string;
  className?: string;
  imageClassName?: string;
  maxHeight?: number;
  fetchHeaders?: HeadersInit;
  fetchCredentials?: RequestCredentials;
  interactive?: boolean;
  onActivate?: () => void;
  loadStrategy?: "immediate" | "visible";
  referrerPolicy?: ReferrerPolicy;
}

function joinClassNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function isDirectlyRenderableImageSource(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

function isSameOriginImageSource(src: string): boolean {
  if (!src || typeof window === "undefined") {
    return false;
  }
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function inferImageMimeType(src: string, mimeType?: string): string {
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  if (normalizedMimeType.startsWith("image/")) {
    return normalizedMimeType;
  }

  const normalizedSrc = String(src || "").trim().toLowerCase();
  if (normalizedSrc.startsWith("data:image/")) {
    const mimeTypeEndIndex = normalizedSrc.indexOf(";");
    return mimeTypeEndIndex > 5 ? normalizedSrc.slice(5, mimeTypeEndIndex) : "";
  }
  if (normalizedSrc.includes(".png")) return "image/png";
  if (normalizedSrc.includes(".jpg") || normalizedSrc.includes(".jpeg")) return "image/jpeg";
  if (normalizedSrc.includes(".gif")) return "image/gif";
  if (normalizedSrc.includes(".webp")) return "image/webp";
  if (normalizedSrc.includes(".svg")) return "image/svg+xml";
  if (normalizedSrc.includes(".bmp")) return "image/bmp";
  return "";
}

export function RunnerImagePreviewSurface({
  src,
  alt,
  mimeType,
  className,
  imageClassName,
  maxHeight = 300,
  fetchHeaders,
  fetchCredentials = "same-origin",
  interactive = true,
  onActivate,
  loadStrategy = "immediate",
  referrerPolicy,
}: RunnerImagePreviewSurfaceProps) {
  mountRunnerChatStyles();

  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(Boolean(src));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(loadStrategy !== "visible");
  const [shouldForceFetchFallback, setShouldForceFetchFallback] = useState(false);
  const surfaceRef = useRef<HTMLElement | null>(null);

  const normalizedAlt = alt || "Preview image";
  const resolvedMimeType = useMemo(() => inferImageMimeType(src, mimeType), [mimeType, src]);
  const headersSignature = useMemo(() => {
    if (!fetchHeaders) return "";
    const headers = new Headers(fetchHeaders);
    return JSON.stringify(Array.from(headers.entries()).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
  }, [fetchHeaders]);
  const hasCustomFetchHeaders = headersSignature !== "";
  const shouldResolvePreview = Boolean(src) && (loadStrategy !== "visible" || isVisible);

  useEffect(() => {
    setIsVisible(loadStrategy !== "visible");
  }, [loadStrategy, src]);

  useEffect(() => {
    setShouldForceFetchFallback(false);
  }, [src]);

  useEffect(() => {
    if (loadStrategy !== "visible" || !src || isVisible) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const node = surfaceRef.current;
    if (!node) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          return;
        }
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, loadStrategy, src]);

  useEffect(() => {
    if (!src) {
      setResolvedSrc("");
      setLoading(false);
      return;
    }

    if (!shouldResolvePreview) {
      setResolvedSrc("");
      setLoading(true);
      return;
    }

    const canAttemptDirectRender =
      isDirectlyRenderableImageSource(src)
      || (!hasCustomFetchHeaders && !shouldForceFetchFallback && fetchCredentials === "same-origin" && isSameOriginImageSource(src));

    if (canAttemptDirectRender) {
      setResolvedSrc(src);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl = "";
    const normalizedFetchHeaders = fetchHeaders ? new Headers(fetchHeaders) : undefined;

    setResolvedSrc("");
    setLoading(true);

    fetch(src, {
      headers: normalizedFetchHeaders,
      credentials: fetchCredentials,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load image preview (${response.status})`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const normalizedBlob =
          resolvedMimeType && (!blob.type || blob.type === "application/octet-stream")
            ? new Blob([blob], { type: resolvedMimeType })
            : blob;
        objectUrl = URL.createObjectURL(normalizedBlob);
        setResolvedSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedSrc("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fetchCredentials, hasCustomFetchHeaders, headersSignature, resolvedMimeType, shouldForceFetchFallback, src, shouldResolvePreview]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen]);

  if (!src) {
    return null;
  }

  if (!loading && !resolvedSrc) {
    return null;
  }

  const previewContent = resolvedSrc ? (
    <img
      src={resolvedSrc}
      alt={normalizedAlt}
      className={joinClassNames("tb-runner-image-preview-surface-image", imageClassName)}
      style={{ maxHeight }}
      loading={loadStrategy === "visible" ? "lazy" : undefined}
      referrerPolicy={referrerPolicy}
      onError={() => {
        if (
          !hasCustomFetchHeaders
          && !shouldForceFetchFallback
          && !isDirectlyRenderableImageSource(src)
          && fetchCredentials === "same-origin"
          && isSameOriginImageSource(src)
        ) {
          setShouldForceFetchFallback(true);
          setLoading(true);
        }
      }}
    />
  ) : loading ? (
    <span className="tb-runner-image-preview-surface-state" aria-hidden="true">
      <LoaderCircle className="tb-runner-image-preview-surface-spinner" strokeWidth={1.75} />
    </span>
  ) : null;

  const handleActivate = () => {
    if (!resolvedSrc) {
      return;
    }
    if (typeof onActivate === "function") {
      onActivate();
      return;
    }
    if (interactive) {
      setLightboxOpen(true);
    }
  };

  const previewSurface = interactive ? (
    <button
      type="button"
      className={joinClassNames("tb-runner-image-preview-surface", className)}
      onClick={handleActivate}
      disabled={!resolvedSrc}
      aria-label={normalizedAlt}
      ref={(node) => {
        surfaceRef.current = node;
      }}
    >
      {previewContent}
    </button>
  ) : (
    <div
      className={joinClassNames("tb-runner-image-preview-surface", "is-static", className)}
      aria-label={normalizedAlt}
      ref={(node) => {
        surfaceRef.current = node;
      }}
    >
      {previewContent}
    </div>
  );

  if (!interactive || !lightboxOpen || !resolvedSrc || typeof document === "undefined") {
    return previewSurface;
  }

  return (
    <>
      {previewSurface}
      {createPortal(
        <div className="runner-attachment-lightbox" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            className="runner-attachment-lightbox-close"
            onClick={(event) => {
              event.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Close image preview"
          >
            <LucideX className="runner-attachment-lightbox-close-icon" strokeWidth={2} />
          </button>
          <div className="runner-attachment-lightbox-dialog" onClick={(event) => event.stopPropagation()}>
            <img src={resolvedSrc} alt={normalizedAlt} className="runner-attachment-lightbox-image" referrerPolicy={referrerPolicy} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
