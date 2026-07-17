import { LoaderCircle as LucideLoaderCircle, X as LucideX } from "lucide-react";
import { RunnerImagePreviewSurface } from "../runner-image-preview-surface.js";
import {
  LazyMediaPreviewMount,
  RunnerLazyMediaPreviewLoader,
} from "../runner-lazy-media-preview.js";
import type { LocalAttachment, RunnerTurnAttachment } from "./attachment-types.js";
import {
  getAttachmentDisplayName,
  getAttachmentPreviewUrl,
  getGithubAttachmentRef,
  isAttachmentDocumentPreviewable,
  isGithubAttachmentSelection,
  isLocalAttachmentRecord,
} from "./attachment-utils.js";
import { IconGithub } from "./icons.js";
import { requiresAuthenticatedAttachmentPreview } from "./image-selection.js";
import { isRunnerEmailContextAttachment } from "./turn-attachments.js";

const RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL = new URL(
  "../assets/email-attachment.webp",
  import.meta.url,
).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL("../assets/txtfile.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("../assets/imgicon.webp", import.meta.url).toString();

interface RunnerAttachmentPreviewChipProps {
  activePreviewAttachmentId?: string | null;
  attachment: LocalAttachment | RunnerTurnAttachment;
  authenticatedFetchHeaders?: HeadersInit;
  backendUrl: string;
  onPreview?: (attachment: RunnerTurnAttachment) => void;
  onRemove?: () => void;
  removable?: boolean;
}

export function RunnerAttachmentPreviewChip({
  activePreviewAttachmentId = null,
  attachment,
  authenticatedFetchHeaders,
  backendUrl,
  onPreview,
  onRemove,
  removable = false,
}: RunnerAttachmentPreviewChipProps) {
  const filename = getAttachmentDisplayName(attachment);
  const githubBranch = isGithubAttachmentSelection(attachment)
    ? getGithubAttachmentRef(attachment)
    : "";
  const previewUrl = getAttachmentPreviewUrl(attachment);
  const isImage = attachment.type === "image";
  const isGithubAttachment = isGithubAttachmentSelection(attachment);
  const isEmailContextAttachment = isRunnerEmailContextAttachment(attachment);
  const isUploading = attachment.uploadStatus === "uploading";
  const isAttachmentPreviewable =
    !isGithubAttachment &&
    !removable &&
    !isLocalAttachmentRecord(attachment) &&
    isAttachmentDocumentPreviewable(attachment);
  const isDocumentPreviewable = !isImage && isAttachmentPreviewable;
  const isImagePreviewable = isImage && isAttachmentPreviewable;
  const isDocumentPreviewActive =
    isAttachmentPreviewable && activePreviewAttachmentId === attachment.id;
  const imageFetchHeaders =
    isImage &&
    !isLocalAttachmentRecord(attachment) &&
    requiresAuthenticatedAttachmentPreview(previewUrl, backendUrl)
      ? authenticatedFetchHeaders
      : undefined;

  function openAttachmentPreview() {
    if (isLocalAttachmentRecord(attachment) || !isAttachmentPreviewable) {
      return;
    }
    onPreview?.(attachment);
  }

  function renderAttachmentFileIcon() {
    if (isUploading) {
      return (
        <LucideLoaderCircle
          className="runner-attachment-file-upload-indicator tb-context-action-notice-icon-spinner"
          strokeWidth={1.9}
        />
      );
    }
    if (isGithubAttachment) {
      return (
        <IconGithub className="runner-attachment-file-brand-icon runner-attachment-file-brand-icon-github" />
      );
    }
    if (isEmailContextAttachment) {
      return (
        <img
          src={RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="runner-attachment-file-icon runner-attachment-file-email-icon"
        />
      );
    }
    return (
      <img
        src={RUNNER_TEXT_FILE_ICON_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="runner-attachment-file-icon"
      />
    );
  }

  return (
    <div
      className={`runner-attachment ${isImage ? "runner-attachment-image" : "runner-attachment-file"} ${isGithubAttachment ? "runner-attachment-github" : ""} ${isUploading ? "runner-attachment-uploading" : ""} ${removable ? "runner-attachment-removable" : "runner-attachment-readonly"} ${isAttachmentPreviewable ? "runner-attachment-document-previewable" : ""} ${isDocumentPreviewActive ? "runner-attachment-document-active" : ""}`.trim()}
    >
      {isImage ? (
        <>
          <span className="runner-attachment-image-frame">
            {previewUrl ? (
              <LazyMediaPreviewMount
                mediaKey={`${attachment.id}:${previewUrl}`}
                className="runner-attachment-image-lazy-preview"
                placeholder={
                  <span className="runner-attachment-image-placeholder" aria-hidden="true">
                    <RunnerLazyMediaPreviewLoader dotSize={3} gap={2} />
                  </span>
                }
              >
                <RunnerImagePreviewSurface
                  src={previewUrl}
                  alt={filename}
                  mimeType={
                    isLocalAttachmentRecord(attachment) ? attachment.file.type : attachment.mimeType
                  }
                  className={`runner-attachment-image-button ${previewUrl && isImagePreviewable ? "is-clickable" : ""}`.trim()}
                  imageClassName="runner-attachment-image-preview"
                  fetchHeaders={imageFetchHeaders}
                  loadStrategy="immediate"
                  interactive={Boolean(previewUrl && isImagePreviewable)}
                  onActivate={previewUrl && isImagePreviewable ? openAttachmentPreview : undefined}
                />
              </LazyMediaPreviewMount>
            ) : (
              <span className="runner-attachment-image-placeholder" aria-hidden="true">
                <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} />
              </span>
            )}
            {isUploading ? (
              <span className="runner-attachment-upload-indicator" aria-hidden="true">
                <LucideLoaderCircle
                  className="runner-attachment-upload-indicator-icon tb-context-action-notice-icon-spinner"
                  strokeWidth={1.9}
                />
              </span>
            ) : null}
          </span>
          {removable && onRemove ? (
            <button
              type="button"
              className="runner-attachment-remove runner-attachment-remove-image"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              aria-label={`Remove ${filename}`}
            >
              <LucideX className="runner-attachment-remove-icon" strokeWidth={2} />
            </button>
          ) : null}
        </>
      ) : (
        <>
          {isDocumentPreviewable ? (
            <button
              type="button"
              className="runner-attachment-file-button"
              onClick={openAttachmentPreview}
              aria-label={`Preview ${filename}`}
            >
              <span className="runner-attachment-file-icon-slot" aria-hidden="true">
                {renderAttachmentFileIcon()}
              </span>
              <div className="runner-attachment-file-copy">
                <div className="runner-attachment-file-name" title={filename}>
                  {filename}
                </div>
                {githubBranch ? (
                  <span className="runner-attachment-file-branch" title={githubBranch}>
                    {githubBranch}
                  </span>
                ) : null}
              </div>
            </button>
          ) : (
            <>
              <span className="runner-attachment-file-icon-slot" aria-hidden="true">
                {renderAttachmentFileIcon()}
              </span>
              <div className="runner-attachment-file-copy">
                <div className="runner-attachment-file-name" title={filename}>
                  {filename}
                </div>
                {githubBranch ? (
                  <span className="runner-attachment-file-branch" title={githubBranch}>
                    {githubBranch}
                  </span>
                ) : null}
              </div>
            </>
          )}
          {removable && onRemove ? (
            <button
              type="button"
              className="runner-attachment-remove runner-attachment-remove-file"
              onClick={onRemove}
              aria-label={`Remove ${filename}`}
            >
              <LucideX className="runner-attachment-remove-icon" strokeWidth={2} />
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
