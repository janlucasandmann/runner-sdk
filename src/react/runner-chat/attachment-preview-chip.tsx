import {
  LoaderCircle as LucideLoaderCircle,
  MessageSquare as LucideMessageSquare,
  MessageSquareText as LucideMessageSquareText,
} from "lucide-react";
import {
  PlatformAttachmentPreview,
  type PlatformAttachmentPreviewVariant,
} from "../../platform-ui/components/composite/attachments/index.js";
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
  "../../platform-ui/components/thread-components/assets/email-attachment.webp",
  import.meta.url,
).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL(
  "../../platform-ui/components/thread-components/assets/txtfile.png",
  import.meta.url,
).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL(
  "../../platform-ui/components/thread-components/assets/imgicon.webp",
  import.meta.url,
).toString();

interface RunnerAttachmentPreviewChipProps {
  activePreviewAttachmentId?: string | null;
  attachment: LocalAttachment | RunnerTurnAttachment;
  authenticatedFetchHeaders?: HeadersInit;
  backendUrl: string;
  onPreview?: (attachment: RunnerTurnAttachment) => void;
  onRemove?: () => void;
  removable?: boolean;
  variant?: PlatformAttachmentPreviewVariant;
}

export function RunnerAttachmentPreviewChip({
  activePreviewAttachmentId = null,
  attachment,
  authenticatedFetchHeaders,
  backendUrl,
  onPreview,
  onRemove,
  removable = false,
  variant = "composer",
}: RunnerAttachmentPreviewChipProps) {
  const filename = getAttachmentDisplayName(attachment);
  const githubBranch = isGithubAttachmentSelection(attachment)
    ? getGithubAttachmentRef(attachment)
    : "";
  const previewUrl = getAttachmentPreviewUrl(attachment);
  const isImage = attachment.type === "image";
  const isGithubAttachment = isGithubAttachmentSelection(attachment);
  const referenceType = attachment.referenceType;
  const isPromptReference = referenceType === "prompt";
  const isThreadReference = referenceType === "thread";
  const isEmailContextAttachment = isRunnerEmailContextAttachment(attachment);
  const isUploading = attachment.uploadStatus === "uploading";
  const isAttachmentPreviewable =
    !isGithubAttachment &&
    !removable &&
    !isLocalAttachmentRecord(attachment) &&
    isAttachmentDocumentPreviewable(attachment);
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
    if (isPromptReference) {
      return <LucideMessageSquareText strokeWidth={1.8} />;
    }
    if (isThreadReference) {
      return <LucideMessageSquare strokeWidth={1.8} />;
    }
    if (isUploading) {
      return (
        <LucideLoaderCircle className="tb-context-action-notice-icon-spinner" strokeWidth={1.9} />
      );
    }
    if (isGithubAttachment) {
      return <IconGithub />;
    }
    if (isEmailContextAttachment) {
      return (
        <img
          src={RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      );
    }
    return <img src={RUNNER_TEXT_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} />;
  }

  const attachmentTypeLabel = isPromptReference
    ? "Prompt"
    : isThreadReference
      ? "Thread"
      : isEmailContextAttachment
        ? "Email"
        : isGithubAttachment && attachment.githubSelectionType === "repo"
          ? "Repository"
          : "File";
  const branchMetadata = githubBranch ? <span title={githubBranch}>{githubBranch}</span> : null;
  const imageContent = previewUrl ? (
    <LazyMediaPreviewMount
      mediaKey={`${attachment.id}:${previewUrl}`}
      className="platform-attachment-preview__image-lazy-preview"
      placeholder={
        <span className="platform-attachment-preview__image-placeholder" aria-hidden="true">
          <RunnerLazyMediaPreviewLoader dotSize={3} gap={2} />
        </span>
      }
    >
      <RunnerImagePreviewSurface
        src={previewUrl}
        alt={filename}
        mimeType={isLocalAttachmentRecord(attachment) ? attachment.file.type : attachment.mimeType}
        className={`platform-attachment-preview__image-button ${previewUrl && isImagePreviewable ? "is-clickable" : ""}`.trim()}
        imageClassName="platform-attachment-preview__image"
        fetchHeaders={imageFetchHeaders}
        loadStrategy="immediate"
        interactive={Boolean(previewUrl && isImagePreviewable)}
        onActivate={previewUrl && isImagePreviewable ? openAttachmentPreview : undefined}
      />
    </LazyMediaPreviewMount>
  ) : (
    <span className="platform-attachment-preview__image-placeholder" aria-hidden="true">
      <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} />
    </span>
  );

  return (
    <PlatformAttachmentPreview
      name={filename}
      typeLabel={attachmentTypeLabel}
      metadata={branchMetadata}
      icon={renderAttachmentFileIcon()}
      imageContent={imageContent}
      uploadingOverlay={
        isUploading ? (
          <span className="platform-attachment-preview__upload-indicator" aria-hidden="true">
            <LucideLoaderCircle
              className="tb-context-action-notice-icon-spinner"
              strokeWidth={1.9}
            />
          </span>
        ) : null
      }
      variant={variant}
      isImage={isImage}
      previewable={isAttachmentPreviewable}
      active={isDocumentPreviewActive}
      uploading={isUploading}
      removable={removable}
      onActivate={openAttachmentPreview}
      onRemove={onRemove}
      className={isGithubAttachment ? "platform-attachment-preview--github" : undefined}
    />
  );
}
