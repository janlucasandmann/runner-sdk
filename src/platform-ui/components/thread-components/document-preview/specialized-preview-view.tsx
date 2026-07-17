import { Globe as LucideGlobe } from "lucide-react";
import { useState } from "react";
import type {
  RunnerImageUnderstandingPreviewData,
  RunnerMediaGenerationPromptPreviewData,
  RunnerWebSearchPreviewData,
  RunnerWebSearchPreviewSource,
} from "../../../../react/runner-document-preview.js";
import { RunnerImagePreviewSurface } from "../../../../react/runner-image-preview-surface.js";
import { RunnerMarkdown } from "../../../../react/runner-markdown.js";

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
                <figure key={imageUrl} className="tb-web-search-sidebar-image-card">
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
  const layoutClassName = ["tb-image-understanding-layout", images.length > 1 ? "is-multiple" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="tb-image-understanding-sidebar-preview">
      <header className="tb-image-understanding-title">
        <h1>Image Understanding</h1>
        <p>
          {data.imageName || (images.length === 1 ? images[0]?.name : `${images.length} images`)}
        </p>
      </header>
      <section className={layoutClassName}>
        <div className="tb-image-understanding-preview">
          <div className="tb-image-understanding-preview-title">Image Understanding</div>
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
