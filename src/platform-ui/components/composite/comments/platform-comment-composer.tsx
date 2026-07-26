import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUp, FileText, Paperclip, X } from "lucide-react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import type {
  PlatformCommentComposerProps,
  PlatformCommentReplyComposerProps,
} from "./platform-comment-types.js";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

export function PlatformCommentComposer({
  value,
  onChange,
  onSubmit,
  avatar,
  placeholder = "Leave a comment...",
  ariaLabel = "Comment",
  allowAttachments = false,
  attachmentAriaLabel = "Attach files",
  disabled = false,
  submitting = false,
  errorMessage,
  className = "",
}: PlatformCommentComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const canSubmit = Boolean(value.trim()) && !disabled && !submitting;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 48), 180)}px`;
  }, [value]);

  function appendFiles(files: FileList | readonly File[] | null) {
    if (!allowAttachments || disabled || submitting || !files) {
      return;
    }
    const incomingFiles = Array.from(files);
    if (!incomingFiles.length) {
      return;
    }
    setPendingFiles((currentFiles) => {
      const nextFiles = [...currentFiles];
      const knownFiles = new Set(currentFiles.map(getFileKey));
      incomingFiles.forEach((file) => {
        const fileKey = getFileKey(file);
        if (!knownFiles.has(fileKey)) {
          knownFiles.add(fileKey);
          nextFiles.push(file);
        }
      });
      return nextFiles;
    });
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLFormElement>) {
    if (!allowAttachments || disabled || submitting) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFiles(true);
  }

  function handleDragLeave(event: DragEvent<HTMLFormElement>) {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    setIsDraggingFiles(false);
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    if (!allowAttachments || disabled || submitting) {
      return;
    }
    event.preventDefault();
    setIsDraggingFiles(false);
    appendFiles(event.dataTransfer.files);
  }

  async function submitComment() {
    if (!canSubmit) {
      return;
    }
    try {
      const submissionResult = await onSubmit(pendingFiles);
      if (submissionResult !== false) {
        setPendingFiles([]);
      }
    } catch {
      // The consuming domain owns the visible error and may retry these files.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) {
      void submitComment();
    }
  }

  return (
    <form
      className={joinClassNames(
        "platform-comment-composer",
        Boolean(avatar) && "has-avatar",
        isDraggingFiles && "is-dragging-files",
        className,
      )}
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {avatar ? (
        <div className="platform-comment-composer__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        className="platform-comment-composer__input"
        value={value}
        rows={1}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled || submitting}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canSubmit) {
            event.preventDefault();
            void submitComment();
          }
        }}
      />
      {pendingFiles.length ? (
        <div
          className="platform-comment-composer__files"
          aria-label="Files attached to this comment"
        >
          {pendingFiles.map((file) => (
            <span className="platform-comment-composer__file" key={getFileKey(file)}>
              <FileText width={13} height={13} strokeWidth={1.8} aria-hidden="true" />
              <span className="platform-comment-composer__file-name" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                className="platform-comment-composer__file-remove"
                aria-label={`Remove ${file.name}`}
                title={`Remove ${file.name}`}
                disabled={disabled || submitting}
                onClick={() => {
                  setPendingFiles((currentFiles) =>
                    currentFiles.filter((candidate) => candidate !== file),
                  );
                }}
              >
                <X width={11} height={11} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="platform-comment-composer__actions">
        {allowAttachments ? (
          <>
            <input
              ref={fileInputRef}
              className="platform-comment-composer__file-input"
              type="file"
              multiple
              tabIndex={-1}
              onChange={handleFileInputChange}
            />
            <PlatformIconButton
              type="button"
              size="small"
              className="platform-comment-composer__attach"
              aria-label={attachmentAriaLabel}
              title={attachmentAriaLabel}
              disabled={disabled || submitting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
            </PlatformIconButton>
          </>
        ) : null}
        <PlatformIconButton
          type="submit"
          size="small"
          className="platform-comment-composer__submit"
          aria-label={submitting ? "Adding comment" : "Add comment"}
          title={submitting ? "Adding comment" : "Add comment"}
          disabled={!canSubmit}
        >
          <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
        </PlatformIconButton>
      </div>
      {errorMessage ? (
        <div className="platform-comment-composer__error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}

export function PlatformCommentReplyComposer({
  onSubmit,
  avatar,
  placeholder = "Leave a reply...",
  ariaLabel = "Reply",
  disabled = false,
  autoFocus = false,
}: PlatformCommentReplyComposerProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSubmit = Boolean(value.trim()) && !disabled && !submitting;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 24), 96)}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus({ preventScroll: true });
    }
  }, [autoFocus]);

  async function submitReply() {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      await onSubmit(value.trim());
      setValue("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to add reply.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="platform-comment-reply-composer"
      onSubmit={(event) => {
        event.preventDefault();
        void submitReply();
      }}
    >
      {avatar ? (
        <div className="platform-comment-reply-composer__avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        className="platform-comment-reply-composer__input"
        value={value}
        rows={1}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        disabled={disabled || submitting}
        onChange={(event) => {
          setValue(event.target.value);
          if (errorMessage) {
            setErrorMessage("");
          }
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter"
            && !event.shiftKey
            && !event.nativeEvent.isComposing
            && canSubmit
          ) {
            event.preventDefault();
            void submitReply();
          }
        }}
      />
      <PlatformIconButton
        type="submit"
        size="small"
        className="platform-comment-reply-composer__submit"
        aria-label={submitting ? "Adding reply" : "Add reply"}
        title={submitting ? "Adding reply" : "Add reply"}
        disabled={!canSubmit}
      >
        <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
      </PlatformIconButton>
      {errorMessage ? (
        <div className="platform-comment-reply-composer__error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}
