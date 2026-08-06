import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type WheelEventHandler } from "react";
import { PlatformLoadingState } from "../../composite/loading-state/index.js";
import { mountRunnerChatStyles } from "../styles/index.js";

const RUNNER_IMAGE_PREVIEW_OBJECT_URL_CACHE_LIMIT = 80;
const runnerImagePreviewObjectUrlCache = new Map<string, string>();

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
  onWheel?: WheelEventHandler<HTMLElement>;
  onImageLoad?: (dimensions: { naturalWidth: number; naturalHeight: number }) => void;
  overlay?: ReactNode;
  imageStyle?: CSSProperties;
  style?: CSSProperties;
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

function rememberRunnerImagePreviewObjectUrl(cacheKey: string, objectUrl: string): void {
  if (!cacheKey || !objectUrl) {
    return;
  }
  const existing = runnerImagePreviewObjectUrlCache.get(cacheKey);
  if (existing) {
    if (existing !== objectUrl) {
      URL.revokeObjectURL(existing);
      runnerImagePreviewObjectUrlCache.set(cacheKey, objectUrl);
    }
    return;
  }

  runnerImagePreviewObjectUrlCache.set(cacheKey, objectUrl);
  while (runnerImagePreviewObjectUrlCache.size > RUNNER_IMAGE_PREVIEW_OBJECT_URL_CACHE_LIMIT) {
    const oldestKey = runnerImagePreviewObjectUrlCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    const oldestUrl = runnerImagePreviewObjectUrlCache.get(oldestKey);
    runnerImagePreviewObjectUrlCache.delete(oldestKey);
    if (oldestUrl) {
      URL.revokeObjectURL(oldestUrl);
    }
  }
}

export function RunnerImagePreviewSurface({
  src,
  alt,
  mimeType,
  className,
  imageClassName,
  maxHeight,
  fetchHeaders,
  fetchCredentials = "same-origin",
  interactive = true,
  onActivate,
  onWheel,
  onImageLoad,
  overlay,
  imageStyle,
  style,
  loadStrategy = "immediate",
  referrerPolicy,
}: RunnerImagePreviewSurfaceProps) {
  mountRunnerChatStyles();

  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(Boolean(src));
  const [failed, setFailed] = useState(false);
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
  const objectUrlCacheKey = useMemo(
    () => JSON.stringify([src, headersSignature, fetchCredentials, resolvedMimeType]),
    [fetchCredentials, headersSignature, resolvedMimeType, src]
  );

  useEffect(() => {
    setIsVisible(loadStrategy !== "visible");
  }, [loadStrategy, src]);

  useEffect(() => {
    setShouldForceFetchFallback(false);
    setFailed(false);
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
      setFailed(false);
      return;
    }

    if (!shouldResolvePreview) {
      setResolvedSrc("");
      setLoading(true);
      setFailed(false);
      return;
    }

    const canAttemptDirectRender =
      isDirectlyRenderableImageSource(src)
      || (!hasCustomFetchHeaders && !shouldForceFetchFallback && fetchCredentials === "same-origin");

    if (canAttemptDirectRender) {
      setResolvedSrc(src);
      setLoading(false);
      setFailed(false);
      return;
    }

    const cachedObjectUrl = runnerImagePreviewObjectUrlCache.get(objectUrlCacheKey);
    if (cachedObjectUrl) {
      setResolvedSrc(cachedObjectUrl);
      setLoading(false);
      setFailed(false);
      return;
    }

    let cancelled = false;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId =
      typeof window !== "undefined" && controller
        ? window.setTimeout(() => controller.abort(), 20000)
        : null;
    const normalizedFetchHeaders = fetchHeaders ? new Headers(fetchHeaders) : undefined;
    const fetchOptions: RequestInit = {
      headers: normalizedFetchHeaders,
      credentials: fetchCredentials,
    };
    if (controller) {
      fetchOptions.signal = controller.signal;
    }

    setResolvedSrc("");
    setLoading(true);
    setFailed(false);

    fetch(src, fetchOptions)
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
        const objectUrl = URL.createObjectURL(normalizedBlob);
        rememberRunnerImagePreviewObjectUrl(objectUrlCacheKey, objectUrl);
        setResolvedSrc(objectUrl);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedSrc("");
          setFailed(true);
        }
      })
      .finally(() => {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller?.abort();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [fetchCredentials, hasCustomFetchHeaders, headersSignature, objectUrlCacheKey, resolvedMimeType, shouldForceFetchFallback, src, shouldResolvePreview]);

  if (!src) {
    return null;
  }

  if (!loading && !resolvedSrc && !failed) {
    return null;
  }

  const previewContent = resolvedSrc ? (
    <img
      src={resolvedSrc}
      alt={normalizedAlt}
      className={joinClassNames("tb-runner-image-preview-surface-image", imageClassName)}
      style={{
        ...(typeof maxHeight === "number" ? { maxHeight } : {}),
        ...imageStyle,
      }}
      loading={loadStrategy === "visible" ? "lazy" : undefined}
      referrerPolicy={referrerPolicy}
      onLoad={(event) => {
        onImageLoad?.({
          naturalWidth: event.currentTarget.naturalWidth,
          naturalHeight: event.currentTarget.naturalHeight,
        });
      }}
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
          setFailed(false);
          return;
        }
        setResolvedSrc("");
        setLoading(false);
        setFailed(true);
      }}
    />
  ) : loading ? (
    <PlatformLoadingState
      as="span"
      centered
      className="tb-runner-image-preview-surface-state"
      message="Loading image..."
    />
  ) : failed ? (
    <span className="tb-runner-image-preview-surface-state tb-runner-image-preview-surface-state-error">
      Preview unavailable.
    </span>
  ) : null;

  const handleActivate = () => {
    if (!resolvedSrc) {
      return;
    }
    if (typeof onActivate === "function") {
      onActivate();
    }
  };

  const canActivate = interactive && typeof onActivate === "function";
  const previewSurface = canActivate ? (
    <button
      type="button"
      className={joinClassNames("tb-runner-image-preview-surface", className)}
      onClick={handleActivate}
      onWheel={onWheel}
      disabled={!resolvedSrc}
      aria-label={normalizedAlt}
      ref={(node) => {
        surfaceRef.current = node;
      }}
      style={style}
    >
      {previewContent}
      {overlay ? <span className="tb-runner-image-preview-surface-overlay">{overlay}</span> : null}
    </button>
  ) : (
    <div
      className={joinClassNames("tb-runner-image-preview-surface", "is-static", className)}
      aria-label={normalizedAlt}
      onWheel={onWheel}
      ref={(node) => {
        surfaceRef.current = node;
      }}
      style={style}
    >
      {previewContent}
      {overlay ? <span className="tb-runner-image-preview-surface-overlay">{overlay}</span> : null}
    </div>
  );
  return previewSurface;
}
