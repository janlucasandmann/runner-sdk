import {
  useRef,
  useState,
  type ChangeEventHandler,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Plus, Upload } from "lucide-react";

import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformUiCard } from "../ui-card/index.js";
import {
  PlatformAttachmentListItem,
  type PlatformAttachmentItem,
} from "./platform-attachment-list-item.js";

export type { PlatformAttachmentItem } from "./platform-attachment-list-item.js";

export interface PlatformAttachmentsProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "onDrop" | "title"> {
  title?: ReactNode;
  items?: readonly PlatformAttachmentItem[];
  inputRef?: Ref<HTMLInputElement>;
  inputName?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  processing?: boolean;
  dragging?: boolean;
  uploadFromComputerLabel?: ReactNode;
  uploadFromComputerTitle?: string;
  uploadFromComputerDisabled?: boolean;
  addLabel?: ReactNode;
  addDescription?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  statusMessage?: ReactNode;
  errorMessage?: ReactNode;
  onUploadFromComputer?: () => void;
  onBrowse?: () => void;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
  onDraggingChange?: (dragging: boolean) => void;
  onFilesDrop?: (files: File[], event: DragEvent<HTMLDivElement>) => void | Promise<void>;
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

function assignInputRef(ref: Ref<HTMLInputElement> | undefined, node: HTMLInputElement | null) {
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  if (ref) {
    (ref as { current: HTMLInputElement | null }).current = node;
  }
}

export function PlatformAttachments({
  title = "Attachments",
  items = [],
  inputRef,
  inputName,
  accept,
  multiple = true,
  disabled = false,
  processing = false,
  dragging,
  uploadFromComputerLabel = "From Workspace",
  uploadFromComputerTitle,
  uploadFromComputerDisabled = false,
  addLabel = "Add a new file",
  addDescription = "Drag & drop files here or click to browse",
  emptyTitle = "Drag & drop files here",
  emptyDescription = "or click to browse",
  statusMessage,
  errorMessage,
  onUploadFromComputer,
  onBrowse,
  onInputChange,
  onDraggingChange,
  onFilesDrop,
  className = "",
  ...props
}: PlatformAttachmentsProps) {
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const [internalDragging, setInternalDragging] = useState(false);
  const isDragging = typeof dragging === "boolean" ? dragging : internalDragging;
  const hasItems = items.length > 0;
  const interactionDisabled = disabled || processing;

  const setDragging = (nextDragging: boolean) => {
    if (typeof dragging !== "boolean") {
      setInternalDragging(nextDragging);
    }
    onDraggingChange?.(nextDragging);
  };

  const requestBrowse = () => {
    if (interactionDisabled) {
      return;
    }
    if (onBrowse) {
      onBrowse();
      return;
    }
    internalInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (interactionDisabled) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (interactionDisabled) {
      return;
    }
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      void onFilesDrop?.(files, event);
    }
  };

  return (
    <PlatformUiCard
      {...props}
      as="section"
      className={joinClassNames(
        "platform-attachments",
        isDragging && "is-dragging",
        processing && "is-processing",
        className,
      )}
      aria-busy={processing || undefined}
      data-platform-attachments="true"
    >
      <div className="platform-attachments__header">
        <h2 className="platform-attachments__title">{title}</h2>
        {onUploadFromComputer ? (
          <PlatformSecondaryButton
            type="button"
            size="small"
            className="platform-attachments__computer-upload"
            disabled={interactionDisabled || uploadFromComputerDisabled}
            title={uploadFromComputerTitle}
            onClick={onUploadFromComputer}
          >
            <Plus aria-hidden="true" strokeWidth={1.8} />
            {uploadFromComputerLabel}
          </PlatformSecondaryButton>
        ) : null}
      </div>

      <input
        ref={(node) => {
          internalInputRef.current = node;
          assignInputRef(inputRef, node);
        }}
        type="file"
        name={inputName}
        accept={accept}
        multiple={multiple}
        hidden
        disabled={interactionDisabled}
        onChange={onInputChange}
      />

      <div
        className={joinClassNames(
          "platform-attachments__drop-target",
          hasItems ? "has-items" : "is-empty",
          isDragging && "is-dragging",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasItems ? (
          <div className="platform-attachments__list" role="list">
            <button
              type="button"
              className="platform-attachments__add-row"
              disabled={interactionDisabled}
              onClick={requestBrowse}
            >
              <span className="platform-attachments__add-icon" aria-hidden="true">
                <Plus strokeWidth={1.8} />
              </span>
              <span className="platform-attachments__copy">
                <span className="platform-attachments__name">
                  {isDragging ? "Drop files here" : addLabel}
                </span>
                <span className="platform-attachments__metadata">{addDescription}</span>
              </span>
            </button>

            {items.map((item) => (
              <PlatformAttachmentListItem
                key={item.id}
                {...item}
                interactionDisabled={interactionDisabled}
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="platform-attachments__empty"
            disabled={interactionDisabled}
            onClick={requestBrowse}
          >
            <Upload className="platform-attachments__empty-icon" strokeWidth={1.7} />
            <span className="platform-attachments__empty-title">
              {isDragging ? "Drop files here" : emptyTitle}
            </span>
            <span className="platform-attachments__empty-description">{emptyDescription}</span>
          </button>
        )}
      </div>

      {processing || statusMessage ? (
        <div className="platform-attachments__status" role="status">
          {statusMessage || "Uploading attachments..."}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="platform-attachments__error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </PlatformUiCard>
  );
}
