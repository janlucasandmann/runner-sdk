import { ChevronLeft, ChevronRight, Globe as LucideGlobe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PlatformConnectorActionDetail } from "../../composite/connector-action-detail/index.js";
import type {
  RunnerConnectorActionPreviewData,
  RunnerImageUnderstandingPreviewData,
  RunnerMediaGenerationPromptPreviewData,
  RunnerWebSearchPreviewData,
  RunnerWebSearchPreviewSource,
} from "./preview-contracts.js";
import { RunnerMarkdown } from "../shared/runner-markdown.js";
import { RunnerImagePreviewSurface } from "./image-preview-surface.js";

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
  return domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
    : "";
}

function RunnerWebSearchSidebarSourceLink({ source }: { source: RunnerWebSearchPreviewSource }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = getWebSearchPreviewSourceDomain(source);
  const faviconUrl = faviconFailed ? "" : getWebSearchPreviewFaviconUrl(domain);
  const label = source.title || domain || source.url;

  return (
    <a
      className="tb-web-search-sidebar-source"
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
    >
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

export function RunnerWebSearchSidebarPreview({ data }: { data: RunnerWebSearchPreviewData }) {
  const images = Array.isArray(data.images)
    ? data.images.filter((image) => image && (image.url || image.thumbnail)).slice(0, 4)
    : [];
  const sources = Array.isArray(data.sources) ? data.sources.filter((source) => source?.url) : [];
  const hasRawJson = Boolean(data.rawJsonText?.trim());
  const imageKey = images
    .map((image, index) => image.url || image.thumbnail || `image-${index}`)
    .join("|");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageTransition, setImageTransition] = useState<{
    direction: "next" | "prev";
    fromIndex: number;
    toIndex: number;
  } | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousImageKeyRef = useRef(imageKey);

  useEffect(() => {
    if (previousImageKeyRef.current === imageKey) {
      return;
    }
    previousImageKeyRef.current = imageKey;
    setSelectedImageIndex(0);
    setImageTransition(null);
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, [imageKey]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const moveImage = (direction: "next" | "prev") => {
    if (images.length < 2) {
      return;
    }
    const step = direction === "next" ? 1 : -1;
    const fromIndex = selectedImageIndex;
    const toIndex = (fromIndex + step + images.length) % images.length;
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    setSelectedImageIndex(toIndex);
    setImageTransition({ direction, fromIndex, toIndex });
    transitionTimerRef.current = setTimeout(() => {
      setImageTransition(null);
      transitionTimerRef.current = null;
    }, 360);
  };

  const selectedImage = images[selectedImageIndex] || null;
  const transitionFromImage = imageTransition ? images[imageTransition.fromIndex] || null : null;
  const transitionToImage = imageTransition ? images[imageTransition.toIndex] || null : null;

  const renderImage = (image: (typeof images)[number] | null, index: number, className: string) => {
    if (!image) {
      return null;
    }
    const imageUrl = image.url || image.thumbnail || "";
    return (
      <img
        key={`${imageUrl}-${index}`}
        className={className}
        src={imageUrl}
        alt={image.title || `Search image ${index + 1}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  };

  return (
    <main className="tb-web-search-sidebar-preview">
      {data.isError ? (
        <section className="tb-web-search-sidebar-error">
          {data.errorMessage || "Web search failed."}
        </section>
      ) : null}
      {selectedImage ? (
        <section className="tb-web-search-sidebar-section">
          <div className="tb-web-search-sidebar-image-carousel">
            <div
              className={`tb-web-search-sidebar-image-carousel-frame${
                imageTransition ? ` is-${imageTransition.direction}` : ""
              }`}
            >
              {imageTransition
                ? renderImage(
                    transitionFromImage,
                    imageTransition.fromIndex,
                    "tb-web-search-sidebar-image-carousel-image is-outgoing",
                  )
                : renderImage(
                    selectedImage,
                    selectedImageIndex,
                    "tb-web-search-sidebar-image-carousel-image is-current",
                  )}
              {imageTransition
                ? renderImage(
                    transitionToImage,
                    imageTransition.toIndex,
                    "tb-web-search-sidebar-image-carousel-image is-incoming",
                  )
                : null}
            </div>
            <div className="tb-web-search-sidebar-image-carousel-controls">
              <button
                type="button"
                className="tb-web-search-sidebar-image-carousel-button"
                onClick={() => moveImage("prev")}
                disabled={images.length < 2}
                aria-label="Previous search image"
                title="Previous search image"
              >
                <ChevronLeft width={16} height={16} strokeWidth={1.8} />
              </button>
              <div className="tb-web-search-sidebar-image-carousel-label">
                {selectedImage.title || `${selectedImageIndex + 1} / ${images.length}`}
              </div>
              <button
                type="button"
                className="tb-web-search-sidebar-image-carousel-button"
                onClick={() => moveImage("next")}
                disabled={images.length < 2}
                aria-label="Next search image"
                title="Next search image"
              >
                <ChevronRight width={16} height={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </section>
      ) : null}
      {data.query ? <p className="tb-web-search-sidebar-query">{data.query}</p> : null}
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
            {sources.map((source) => (
              <RunnerWebSearchSidebarSourceLink key={source.url} source={source} />
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

export function RunnerConnectorActionSidebarPreview({
  data,
}: {
  data: RunnerConnectorActionPreviewData;
}) {
  return (
    <PlatformConnectorActionDetail
      connectorId={data.connectorId}
      connectorName={data.connectorName}
      logoUrl={data.logoUrl}
      logoBackground={data.logoBackground}
      actionName={data.actionName}
      description={data.description}
      status={data.status}
      input={data.inputData}
      output={data.outputData}
      inputText={data.inputText}
      outputText={data.outputText}
      errorMessage={data.errorMessage}
    />
  );
}

export function RunnerImageUnderstandingSidebarPreview({
  data,
  requestHeaders,
}: {
  data: RunnerImageUnderstandingPreviewData;
  requestHeaders: HeadersInit;
}) {
  const images = Array.isArray(data.images)
    ? data.images.filter((image) => image && (image.url || image.path))
    : [];
  const imageTitle =
    data.imageName?.trim()
    || images[0]?.name?.trim()
    || images[0]?.path?.split(/[\\/]/).filter(Boolean).pop()
    || (images.length > 1 ? `${images.length} images` : "Image");
  const layoutClassName = ["tb-image-understanding-layout", images.length > 1 ? "is-multiple" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="tb-image-understanding-sidebar-preview">
      <section className={layoutClassName}>
        <div className="tb-image-understanding-preview">
          {images.length > 0 ? (
            <div className="tb-image-understanding-preview-list">
              {images.map((image) => {
                const imageId = image.path || image.url || image.name || "image";
                return (
                  <figure key={imageId} className="tb-image-understanding-preview-item">
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
                  </figure>
                );
              })}
            </div>
          ) : (
            <div className="tb-image-understanding-empty">Image preview unavailable.</div>
          )}
        </div>
        <div className="tb-image-understanding-result">
          <h2 className="tb-image-understanding-result-title">{imageTitle}</h2>
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

export function RunnerMediaGenerationPromptSidebarPreview({
  data,
}: {
  data: RunnerMediaGenerationPromptPreviewData;
}) {
  return (
    <main className="tb-video-generation-prompt-sidebar-preview">
      <header className="tb-video-generation-prompt-title">
        <h1>{data.title || "Generation Prompt"}</h1>
      </header>
      <section className="tb-video-generation-prompt-body">
        <RunnerMarkdown
          content={data.prompt || "No prompt available."}
          className="tb-video-generation-prompt-markdown tb-message-markdown tb-message-markdown-summary"
          softBreaks
        />
      </section>
    </main>
  );
}
