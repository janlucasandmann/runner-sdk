import { X } from "lucide-react";
import type { ReactNode } from "react";

export type PlatformAttachmentPreviewVariant = "composer" | "message";

export interface PlatformAttachmentPreviewProps {
  name: string;
  typeLabel?: ReactNode;
  metadata?: ReactNode;
  icon?: ReactNode;
  imageContent?: ReactNode;
  uploadingOverlay?: ReactNode;
  variant?: PlatformAttachmentPreviewVariant;
  isImage?: boolean;
  previewable?: boolean;
  active?: boolean;
  uploading?: boolean;
  removable?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
  onRemove?: () => void;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function renderFileMain({
  name,
  typeLabel,
  metadata,
  icon,
  previewable,
  disabled,
  onActivate,
  variant,
}: Pick<
  PlatformAttachmentPreviewProps,
  "name" | "typeLabel" | "metadata" | "icon" | "previewable" | "disabled" | "onActivate" | "variant"
>) {
  const content = (
    <>
      <span className="platform-attachment-preview__file-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="platform-attachment-preview__file-copy">
        <span className="platform-attachment-preview__name" title={name}>
          {name}
        </span>
        {variant === "message" ? (
          typeLabel ? (
            <span className="platform-attachment-preview__type">{typeLabel}</span>
          ) : null
        ) : metadata ? (
          <span className="platform-attachment-preview__metadata">{metadata}</span>
        ) : null}
      </span>
    </>
  );

  if (previewable && onActivate) {
    return (
      <button
        type="button"
        className="platform-attachment-preview__file-main"
        aria-label={`Preview ${name}`}
        disabled={disabled}
        onClick={onActivate}
      >
        {content}
      </button>
    );
  }

  return <div className="platform-attachment-preview__file-main">{content}</div>;
}

export function PlatformAttachmentPreview({
  name,
  typeLabel,
  metadata,
  icon,
  imageContent,
  uploadingOverlay,
  variant = "composer",
  isImage = false,
  previewable = false,
  active = false,
  uploading = false,
  removable = false,
  disabled = false,
  onActivate,
  onRemove,
  className = "",
}: PlatformAttachmentPreviewProps) {
  const isRemovable = removable && Boolean(onRemove);

  return (
    <div
      className={joinClassNames(
        "platform-attachment-preview",
        `platform-attachment-preview--${variant}`,
        isImage ? "platform-attachment-preview--image" : "platform-attachment-preview--file",
        previewable && "platform-attachment-preview--previewable",
        active && "platform-attachment-preview--active",
        uploading && "platform-attachment-preview--uploading",
        isRemovable && "platform-attachment-preview--removable",
        className,
      )}
      data-platform-attachment-preview="true"
      data-platform-attachment-preview-variant={variant}
      data-platform-attachment-preview-type={isImage ? "image" : "file"}
    >
      {isImage ? (
        <>
          <span className="platform-attachment-preview__image-frame">
            {imageContent}
            {uploadingOverlay}
          </span>
          {isRemovable ? (
            <button
              type="button"
              className="platform-attachment-preview__remove platform-attachment-preview__remove--image"
              aria-label={`Remove ${name}`}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onRemove?.();
              }}
            >
              <X className="platform-attachment-preview__remove-icon" strokeWidth={2} />
            </button>
          ) : null}
        </>
      ) : (
        <>
          {renderFileMain({
            name,
            typeLabel,
            metadata,
            icon,
            previewable,
            disabled,
            onActivate,
            variant,
          })}
          {isRemovable ? (
            <button
              type="button"
              className="platform-attachment-preview__remove platform-attachment-preview__remove--file"
              aria-label={`Remove ${name}`}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onRemove?.();
              }}
            >
              <X className="platform-attachment-preview__remove-icon" strokeWidth={2} />
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
