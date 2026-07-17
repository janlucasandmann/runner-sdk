import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Images, ScanEye, Video } from "lucide-react";

import type { RunnerLog } from "../../../../types.js";
import { DotLoader } from "../../../../react/dot-loader.js";
import { RunnerImagePreviewSurface } from "../../../../react/runner-image-preview-surface.js";
import {
  LazyMediaPreviewMount,
  RunnerLazyMediaPreviewLoader,
} from "../../../../react/runner-lazy-media-preview.js";
import { LogHeader, LogPanel } from "../../../../react/runner-log-card.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  type RunnerImageUnderstandingPreviewItem,
  type RunnerMediaGenerationPromptPreviewData,
  type RunnerPreviewAttachment,
} from "../../../../react/runner-document-preview.js";
import {
  getFileName,
  isRunnerLogImageFilePath,
  isRunnerLogVideoFilePath,
} from "./command-parsing.js";
import {
  extractBase64Image,
  extractImagePrompt,
  extractImagePromptFromLogMetadata,
  extractImageUnderstandingImagePaths,
  extractVideoPrompt,
  extractVideoPromptFromLogMetadata,
  extractWorkspaceImagePathFromOutput,
  extractWorkspaceImagePathFromResult,
  extractWorkspaceVideoPathFromMetadata,
  extractWorkspaceVideoPathFromOutput,
  extractWorkspaceVideoPathFromResult,
  hasConfirmedGeneratedImagePathText,
  resolveImageUnderstandingResultText,
} from "./media-state.js";
import { buildCompactLogPreviewId } from "./preview-id.js";
import {
  parseStructuredCommandExecutionOutput,
} from "./structured-command-output.js";

interface MediaLogBoxProps {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}

function ImagePreviewLoadingState() {
  return (
    <div
      className="tb-runner-image-preview-surface tb-image-generation-preview tb-image-generation-preview-loading is-static"
      aria-hidden="true"
    >
      <span className="tb-runner-media-preview-loader">
        <DotLoader
          dotCount={9}
          dotSize={4}
          gap={3}
          className="tb-runner-media-dot-loader"
        />
      </span>
    </div>
  );
}

export function GenericImagePreviewLoadingState({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`tb-runner-image-preview-surface tb-log-image-preview-loading is-static ${className}`.trim()}
      aria-hidden="true"
    >
      <RunnerLazyMediaPreviewLoader />
    </div>
  );
}

function MediaPromptPreview({ prompt }: { prompt?: string | null }) {
  const normalizedPrompt = String(prompt || "").trim();
  if (!normalizedPrompt) return null;
  return (
    <div className="tb-log-media-prompt" aria-label="Generation prompt">
      "{normalizedPrompt}"
    </div>
  );
}

function MediaPreviewLayout({
  prompt,
  children,
  variant,
  showPrompt = true,
}: {
  prompt?: string | null;
  children: ReactNode;
  variant: "image" | "video";
  showPrompt?: boolean;
}) {
  return (
    <div
      className={`tb-log-media-preview-layout tb-log-media-preview-layout-${variant}`}
    >
      <div className="tb-log-media-preview-visual">{children}</div>
      {showPrompt ? <MediaPromptPreview prompt={prompt} /> : null}
    </div>
  );
}

function ImagePreviewLogCard({
  icon,
  label,
  title,
  timeLabel,
  meta,
  body,
  className,
  hideHeader = false,
}: {
  icon: ReactNode;
  label: string;
  title?: string | null;
  timeLabel?: string;
  meta?: ReactNode;
  body: ReactNode;
  className?: string;
  hideHeader?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={`tb-log-card tb-log-card-image-preview${className ? ` ${className}` : ""}`}
    >
      {hideHeader ? null : (
        <LogHeader
          icon={icon}
          label={label}
          title={title}
          timeLabel={timeLabel}
          meta={meta}
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
      )}
      <LogPanel collapsed={hideHeader ? false : collapsed}>{body}</LogPanel>
    </div>
  );
}

function buildImageUnderstandingPreviewAttachmentId(
  imageName: string,
  resultText: string,
  imagePreviews: RunnerImageUnderstandingPreviewItem[],
): string {
  const source = [
    imageName,
    resultText.slice(0, 4096),
    imagePreviews.map((preview) => preview.path || preview.url).join("|"),
  ].join(":");
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return `image-understanding-preview:${Math.abs(hash).toString(36) || "0"}`;
}

function buildImageUnderstandingPreviewAttachment({
  imageName,
  imagePreviews,
  resultText,
  isError,
}: {
  imageName: string;
  imagePreviews: RunnerImageUnderstandingPreviewItem[];
  resultText: string;
  isError: boolean;
}): RunnerPreviewAttachment {
  return {
    ...buildRunnerPreviewAttachmentFromPath(
      "/workspace/image-understanding.html",
      { idPrefix: "image-understanding-preview" },
    ),
    id: buildImageUnderstandingPreviewAttachmentId(
      imageName,
      resultText,
      imagePreviews,
    ),
    filename: "Image Understanding",
    mimeType: "application/x.computer-agents.image-understanding",
    type: "document",
    previewKindOverride: "image-understanding",
    imageUnderstandingPreview: {
      imageName,
      images: imagePreviews,
      resultText,
      isError,
    },
  };
}

export function ImageUnderstandingLogBox({
  log,
  backendUrl,
  environmentId,
  onPreviewDocument,
}: MediaLogBoxProps) {
  const command = String(log.metadata?.command || log.message || "");
  const imagePaths = extractImageUnderstandingImagePaths(log, command);
  const imagePreviews = imagePaths
    .map((imagePath) => {
      const url = buildRunnerPreviewDownloadUrl(
        backendUrl,
        environmentId,
        imagePath,
      );
      return url
        ? {
            path: imagePath,
            name: getFileName(imagePath),
            url,
          }
        : null;
    })
    .filter(
      (
        preview,
      ): preview is { path: string; name: string; url: string } => (
        Boolean(preview)
      ),
    );
  const imageName = imagePreviews.length === 1
    ? imagePreviews[0]?.name || "image"
    : `${imagePreviews.length || "No"} images`;
  const resultText = resolveImageUnderstandingResultText(log);
  const isError = typeof log.metadata?.exitCode === "number"
    && log.metadata.exitCode !== 0;
  const previewAttachment = useMemo(
    () => buildImageUnderstandingPreviewAttachment({
      imageName,
      imagePreviews,
      resultText,
      isError,
    }),
    [imageName, imagePreviews, resultText, isError],
  );

  return (
    <button
      type="button"
      className={`tb-log-image-understanding-compact${isError ? " is-error" : ""}`.trim()}
      onClick={() => onPreviewDocument?.(previewAttachment)}
      aria-label={`Open image understanding results for ${imageName}`}
    >
      <ScanEye
        className="tb-log-image-understanding-compact-icon"
        strokeWidth={1.6}
      />
      <span className="tb-log-image-understanding-compact-title">
        Analyzed Image
      </span>
    </button>
  );
}

function buildMediaGenerationPromptPreviewAttachment(
  kind: "image" | "video",
  prompt: string,
): RunnerPreviewAttachment {
  const title = kind === "image"
    ? "Image Generation Prompt"
    : "Video Generation Prompt";
  const mediaGenerationPromptPreview: RunnerMediaGenerationPromptPreviewData = {
    title,
    prompt,
  };
  const workspacePath = kind === "image"
    ? "/workspace/image-generation-prompt.md"
    : "/workspace/video-generation-prompt.md";
  const idPrefix = kind === "image"
    ? "image-generation-prompt"
    : "video-generation-prompt";
  return {
    ...buildRunnerPreviewAttachmentFromPath(workspacePath, { idPrefix }),
    id: buildCompactLogPreviewId(idPrefix, prompt),
    filename: title,
    mimeType: `application/x.computer-agents.${idPrefix}`,
    type: "document",
    previewKindOverride: kind === "image"
      ? "image-generation-prompt"
      : "video-generation-prompt",
    imageGenerationPromptPreview: kind === "image"
      ? mediaGenerationPromptPreview
      : undefined,
    videoGenerationPromptPreview: kind === "video"
      ? mediaGenerationPromptPreview
      : undefined,
  };
}

function MediaGenerationPromptButton({
  kind,
  prompt,
  onPreviewDocument,
}: {
  kind: "image" | "video";
  prompt?: string | null;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const normalizedPrompt = String(prompt || "").trim();
  if (!normalizedPrompt || !onPreviewDocument) return null;
  return (
    <button
      type="button"
      className="tb-video-generation-show-prompt-button"
      onClick={(event) => {
        event.stopPropagation();
        onPreviewDocument(
          buildMediaGenerationPromptPreviewAttachment(kind, normalizedPrompt),
        );
      }}
    >
      <span>Show Prompt</span>
    </button>
  );
}

export function ImageGenerationLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onPreviewDocument,
}: MediaLogBoxProps) {
  const prompt = extractImagePrompt(
    log.metadata?.command || log.message || "",
  ) || extractImagePromptFromLogMetadata(log);
  const isLoading = log.metadata?.status === "running"
    || log.metadata?.status === "started";
  const parsedOutput = parseStructuredCommandExecutionOutput(
    log.metadata?.output,
  );
  const parsedStdout = parsedOutput?.stdout || "";
  const parsedStderr = parsedOutput?.stderr || "";
  const isError = Boolean(log.metadata?.error)
    || (
      typeof log.metadata?.exitCode === "number"
      && log.metadata.exitCode !== 0
    )
    || parsedOutput?.returnCodeInterpretation === "timeout"
    || parsedStderr.trim().length > 0;
  const filePathFromMetadata = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.find(
        (value): value is string => (
          typeof value === "string" && isRunnerLogImageFilePath(value)
        ),
      )
    : null;
  const outputPathSource = parsedOutput
    ? parsedStdout
    : log.metadata?.output;
  const outputImagePath = !isLoading
      && !isError
      && hasConfirmedGeneratedImagePathText(outputPathSource)
    ? extractWorkspaceImagePathFromOutput(outputPathSource)
    : null;
  const messageImagePath = !isLoading
      && !isError
      && hasConfirmedGeneratedImagePathText(log.message)
    ? extractWorkspaceImagePathFromOutput(log.message)
    : null;
  const resolvedImagePath = log.metadata?.savedImagePath
    || filePathFromMetadata
    || extractWorkspaceImagePathFromResult(log.metadata?.result)
    || outputImagePath
    || messageImagePath
    || null;
  const resolvedImageSrc = buildRunnerPreviewDownloadUrl(
    backendUrl,
    environmentId,
    resolvedImagePath,
  ) || (
    resolvedImagePath
      ? null
      : extractBase64Image(log.metadata?.result)
        || (!isError ? extractBase64Image(log.metadata?.output) : null)
  );
  const imagePreviewAttachment = useMemo<RunnerPreviewAttachment | null>(
    () => {
      if (!resolvedImageSrc) return null;
      if (resolvedImagePath) {
        const baseAttachment = buildRunnerPreviewAttachmentFromPath(
          resolvedImagePath,
          {
            backendUrl,
            environmentId,
            idPrefix: "log-image-generation",
          },
        );
        return {
          ...baseAttachment,
          type: "image",
          url: resolvedImageSrc,
          previewUrl: resolvedImageSrc,
          workspacePath: resolvedImagePath,
        };
      }
      const mimeType = resolvedImageSrc.match(/^data:([^;,]+)/)?.[1]
        || "image/png";
      return {
        id: `log-image-generation:data:${resolvedImageSrc.slice(0, 96)}`,
        filename: "generated-image.png",
        mimeType,
        type: "image",
        url: resolvedImageSrc,
        previewUrl: resolvedImageSrc,
      };
    },
    [
      backendUrl,
      environmentId,
      resolvedImagePath,
      resolvedImageSrc,
    ],
  );
  const errorMessage = typeof log.metadata?.error === "string"
      && log.metadata.error.trim()
    ? log.metadata.error.trim()
    : parsedOutput?.returnCodeInterpretation === "timeout"
      ? "Image generation timed out before a new image was saved."
      : parsedStderr.trim()
        || String(log.metadata?.output || "Image generation failed.");

  if (!isError && !isLoading && !resolvedImageSrc) return null;

  return (
    <ImagePreviewLogCard
      icon={<Images className="tb-log-card-small-icon" strokeWidth={1.5} />}
      label="Image Generation"
      title={null}
      timeLabel={timeLabel}
      meta={
        isLoading
          ? <span className="tb-log-card-status">generating...</span>
          : null
      }
      className="tb-log-card-image-generation-preview"
      hideHeader
      body={
        isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">
            {errorMessage}
          </div>
        ) : resolvedImageSrc ? (
          <div className="tb-log-image-grid">
            <MediaPreviewLayout
              prompt={prompt}
              variant="image"
              showPrompt={false}
            >
              <div className="tb-image-generation-preview-shell">
                <MediaGenerationPromptButton
                  kind="image"
                  prompt={prompt}
                  onPreviewDocument={onPreviewDocument}
                />
                <LazyMediaPreviewMount
                  mediaKey={resolvedImageSrc}
                  className="tb-log-media-lazy-preview"
                  placeholder={<ImagePreviewLoadingState />}
                >
                  <RunnerImagePreviewSurface
                    className={`tb-image-generation-preview${imagePreviewAttachment && onPreviewDocument ? " is-clickable" : ""}`.trim()}
                    imageClassName="tb-image-generation-preview-image"
                    src={resolvedImageSrc}
                    alt={prompt || "Generated image"}
                    maxHeight={500}
                    fetchHeaders={requestHeaders}
                    loadStrategy="immediate"
                    interactive={Boolean(
                      imagePreviewAttachment && onPreviewDocument,
                    )}
                    onActivate={
                      imagePreviewAttachment && onPreviewDocument
                        ? () => onPreviewDocument(imagePreviewAttachment)
                        : undefined
                    }
                  />
                </LazyMediaPreviewMount>
              </div>
            </MediaPreviewLayout>
          </div>
        ) : isLoading ? (
          <div className="tb-log-image-grid">
            <MediaPreviewLayout
              prompt={prompt}
              variant="image"
              showPrompt={false}
            >
              <div className="tb-image-generation-preview-shell">
                <MediaGenerationPromptButton
                  kind="image"
                  prompt={prompt}
                  onPreviewDocument={onPreviewDocument}
                />
                <ImagePreviewLoadingState />
              </div>
            </MediaPreviewLayout>
          </div>
        ) : null
      }
    />
  );
}

function VideoPreviewLoadingState() {
  return (
    <div
      className="tb-video-generation-preview tb-video-generation-preview-loading"
      aria-hidden="true"
    >
      <span className="tb-runner-media-preview-loader">
        <DotLoader
          dotCount={9}
          dotSize={4}
          gap={3}
          className="tb-runner-media-dot-loader"
        />
      </span>
    </div>
  );
}

function serializeRunnerMediaFetchHeaders(
  fetchHeaders?: HeadersInit,
): string {
  if (!fetchHeaders || typeof Headers === "undefined") return "";
  try {
    return JSON.stringify(
      Array.from(new Headers(fetchHeaders).entries()).sort(
        ([leftKey], [rightKey]) => leftKey.localeCompare(rightKey),
      ),
    );
  } catch {
    return "";
  }
}

function VideoPreviewPlayer({
  src,
  className,
  fetchHeaders,
  overlayAction,
}: {
  src: string;
  className?: string;
  fetchHeaders?: HeadersInit;
  overlayAction?: ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [objectUrl, setObjectUrl] = useState("");
  const headersSignature = useMemo(
    () => serializeRunnerMediaFetchHeaders(fetchHeaders),
    [fetchHeaders],
  );
  const shouldFetchWithHeaders = Boolean(headersSignature);
  const resolvedSrc = shouldFetchWithHeaders ? objectUrl : src;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setObjectUrl("");
  }, [headersSignature, shouldFetchWithHeaders, src]);

  useEffect(() => {
    if (
      !src
      || !shouldFetchWithHeaders
      || typeof fetch === "undefined"
      || typeof URL === "undefined"
    ) {
      return;
    }
    let cancelled = false;
    let nextObjectUrl = "";
    const controller = typeof AbortController !== "undefined"
      ? new AbortController()
      : null;
    const requestHeaders = fetchHeaders && typeof Headers !== "undefined"
      ? new Headers(fetchHeaders)
      : undefined;
    const fetchOptions: RequestInit = requestHeaders
      ? { headers: requestHeaders }
      : {};
    if (controller) fetchOptions.signal = controller.signal;
    fetch(src, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Video preview request failed (${response.status})`,
          );
        }
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        nextObjectUrl = URL.createObjectURL(blob);
        setObjectUrl(nextObjectUrl);
      })
      .catch((error) => {
        if ((error as { name?: string })?.name === "AbortError") return;
        setHasError(true);
      });
    return () => {
      cancelled = true;
      controller?.abort();
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
    };
  }, [headersSignature, shouldFetchWithHeaders, src]);

  useEffect(
    () => () => {
      if (objectUrl && typeof URL !== "undefined") {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl],
  );

  if (hasError) {
    return (
      <div className="tb-video-generation-preview tb-video-generation-preview-error">
        Video preview unavailable.
      </div>
    );
  }
  return (
    <div className="tb-video-generation-preview-shell">
      {overlayAction}
      {!isLoaded ? <VideoPreviewLoadingState /> : null}
      {resolvedSrc ? (
        <video
          className={className}
          src={resolvedSrc}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setIsLoaded(true)}
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={isLoaded ? undefined : { display: "none" }}
        />
      ) : null}
    </div>
  );
}

export function VideoGenerationLogBox({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  onPreviewDocument,
}: MediaLogBoxProps) {
  const prompt = extractVideoPrompt(
    log.metadata?.command || log.message || "",
  ) || extractVideoPromptFromLogMetadata(log);
  const isLoading = log.metadata?.status === "running"
    || log.metadata?.status === "started";
  const parsedOutput = parseStructuredCommandExecutionOutput(
    log.metadata?.output,
  );
  const parsedStdout = parsedOutput?.stdout || "";
  const parsedStderr = parsedOutput?.stderr || "";
  const isError = Boolean(log.metadata?.error)
    || (
      typeof log.metadata?.exitCode === "number"
      && log.metadata.exitCode !== 0
    )
    || parsedOutput?.returnCodeInterpretation === "timeout"
    || parsedStderr.trim().length > 0;
  const filePathFromMetadata = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.find(
        (value): value is string => (
          typeof value === "string" && isRunnerLogVideoFilePath(value)
        ),
      )
    : null;
  const outputPathSource = parsedOutput
    ? parsedStdout
    : log.metadata?.output;
  const outputVideoPath = !isLoading && !isError
    ? extractWorkspaceVideoPathFromOutput(outputPathSource)
    : null;
  const messageVideoPath = !isLoading && !isError
    ? extractWorkspaceVideoPathFromOutput(log.message)
    : null;
  const resolvedVideoPath = extractWorkspaceVideoPathFromMetadata(
    log.metadata,
  )
    || filePathFromMetadata
    || extractWorkspaceVideoPathFromResult(log.metadata?.result)
    || outputVideoPath
    || messageVideoPath
    || null;
  const resolvedVideoSrc = buildRunnerPreviewDownloadUrl(
    backendUrl,
    environmentId,
    resolvedVideoPath,
  );
  const errorMessage = typeof log.metadata?.error === "string"
      && log.metadata.error.trim()
    ? log.metadata.error.trim()
    : parsedOutput?.returnCodeInterpretation === "timeout"
      ? "Video generation timed out before a new video was saved."
      : parsedStderr.trim()
        || String(log.metadata?.output || "Video generation failed.");

  if (!isError && !isLoading && !resolvedVideoSrc) return null;

  return (
    <ImagePreviewLogCard
      icon={<Video className="tb-log-card-small-icon" strokeWidth={1.5} />}
      label="Video Generation"
      title={null}
      timeLabel={timeLabel}
      meta={
        isLoading
          ? <span className="tb-log-card-status">generating...</span>
          : null
      }
      className="tb-log-card-video-generation"
      hideHeader
      body={
        isError ? (
          <div className="tb-log-card-state tb-log-card-state-error">
            {errorMessage}
          </div>
        ) : resolvedVideoSrc ? (
          <div className="tb-log-video-grid">
            <MediaPreviewLayout
              prompt={prompt}
              variant="video"
              showPrompt={false}
            >
              <LazyMediaPreviewMount
                mediaKey={resolvedVideoSrc}
                className="tb-log-media-lazy-preview"
                placeholder={(
                  <div className="tb-video-generation-preview-shell">
                    <MediaGenerationPromptButton
                      kind="video"
                      prompt={prompt}
                      onPreviewDocument={onPreviewDocument}
                    />
                    <VideoPreviewLoadingState />
                  </div>
                )}
              >
                <VideoPreviewPlayer
                  className="tb-video-generation-preview"
                  src={resolvedVideoSrc}
                  fetchHeaders={requestHeaders}
                  overlayAction={(
                    <MediaGenerationPromptButton
                      kind="video"
                      prompt={prompt}
                      onPreviewDocument={onPreviewDocument}
                    />
                  )}
                />
              </LazyMediaPreviewMount>
            </MediaPreviewLayout>
          </div>
        ) : isLoading ? (
          <div className="tb-log-video-grid">
            <MediaPreviewLayout
              prompt={prompt}
              variant="video"
              showPrompt={false}
            >
              <div className="tb-video-generation-preview-shell">
                <MediaGenerationPromptButton
                  kind="video"
                  prompt={prompt}
                  onPreviewDocument={onPreviewDocument}
                />
                <VideoPreviewLoadingState />
              </div>
            </MediaPreviewLayout>
          </div>
        ) : null
      }
    />
  );
}
