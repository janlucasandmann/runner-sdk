import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  Check,
  Ellipsis,
  FileText,
  Paperclip,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformEmptyState } from "../empty-state/index.js";
import { PlatformConfirmationModal } from "../modal/index.js";
import { PlatformPopup } from "../popup/index.js";

export type PlatformActivityTone =
  | "neutral"
  | "created"
  | "status"
  | "thread"
  | "comment";

export interface PlatformActivityReply {
  id: string;
  author: ReactNode;
  timestamp?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
}

export interface PlatformActivityReplyComposerProps {
  onSubmit: (value: string) => void | Promise<void>;
  avatar?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export interface PlatformActivityItemActions {
  editableValue: string;
  onEdit?: (value: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  disabled?: boolean;
}

export interface PlatformActivityItem {
  id: string;
  summary: ReactNode;
  timestamp?: ReactNode;
  trailing?: ReactNode;
  avatar?: ReactNode;
  icon?: ElementType;
  content?: ReactNode;
  tone?: PlatformActivityTone;
  onActivate?: () => void;
  ariaLabel?: string;
  replies?: readonly PlatformActivityReply[];
  replyComposer?: PlatformActivityReplyComposerProps;
  actions?: PlatformActivityItemActions;
}

export interface PlatformActivityComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (files: readonly File[]) => void | Promise<unknown>;
  avatar?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  allowAttachments?: boolean;
  attachmentAriaLabel?: string;
  disabled?: boolean;
  submitting?: boolean;
  errorMessage?: ReactNode;
}

export interface PlatformActivityTimelineProps {
  title?: ReactNode;
  headerActions?: ReactNode;
  items?: readonly PlatformActivityItem[];
  composer?: PlatformActivityComposerProps;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ElementType;
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

function PlatformActivityComposer({
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
}: PlatformActivityComposerProps) {
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
      const knownFiles = new Set(
        currentFiles.map(
          (file) => `${file.name}:${file.size}:${file.lastModified}:${file.type}`,
        ),
      );
      incomingFiles.forEach((file) => {
        const fileKey = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
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
      // The domain owns error presentation; keep selected files for retry.
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
        "platform-activity-timeline__composer",
        Boolean(avatar) && "has-avatar",
        isDraggingFiles && "is-dragging-files",
      )}
      onSubmit={handleSubmit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {avatar ? (
        <div className="platform-activity-timeline__composer-avatar" aria-hidden="true">
          {avatar}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        className="platform-activity-timeline__composer-input"
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
          className="platform-activity-timeline__composer-files"
          aria-label="Files attached to this comment"
        >
          {pendingFiles.map((file) => {
            const fileKey = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
            return (
              <span className="platform-activity-timeline__composer-file" key={fileKey}>
                <FileText width={13} height={13} strokeWidth={1.8} aria-hidden="true" />
                <span
                  className="platform-activity-timeline__composer-file-name"
                  title={file.name}
                >
                  {file.name}
                </span>
                <button
                  type="button"
                  className="platform-activity-timeline__composer-file-remove"
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
            );
          })}
        </div>
      ) : null}
      <div className="platform-activity-timeline__composer-actions">
        {allowAttachments ? (
          <>
            <input
              ref={fileInputRef}
              className="platform-activity-timeline__composer-file-input"
              type="file"
              multiple
              tabIndex={-1}
              onChange={handleFileInputChange}
            />
            <PlatformIconButton
              type="button"
              size="small"
              className="platform-activity-timeline__composer-attach"
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
          className="platform-activity-timeline__composer-submit"
          aria-label={submitting ? "Adding comment" : "Add comment"}
          title={submitting ? "Adding comment" : "Add comment"}
          disabled={!canSubmit}
        >
          <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
        </PlatformIconButton>
      </div>
      {errorMessage ? (
        <div className="platform-activity-timeline__composer-error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}

function PlatformActivityReplyComposer({
  onSubmit,
  avatar,
  placeholder = "Leave a reply...",
  ariaLabel = "Reply",
  disabled = false,
}: PlatformActivityReplyComposerProps) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitReply();
  }

  return (
    <form
      className="platform-activity-timeline__reply-composer"
      onSubmit={handleSubmit}
    >
      {avatar ? (
        <div
          className="platform-activity-timeline__reply-composer-avatar"
          aria-hidden="true"
        >
          {avatar}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        className="platform-activity-timeline__reply-composer-input"
        value={value}
        rows={1}
        placeholder={placeholder}
        aria-label={ariaLabel}
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
        className="platform-activity-timeline__reply-composer-submit"
        aria-label={submitting ? "Adding reply" : "Add reply"}
        title={submitting ? "Adding reply" : "Add reply"}
        disabled={!canSubmit}
      >
        <ArrowUp width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
      </PlatformIconButton>
      {errorMessage ? (
        <div className="platform-activity-timeline__reply-composer-error" role="alert">
          {errorMessage}
        </div>
      ) : null}
    </form>
  );
}

function PlatformActivityTimelineItem({ item }: { item: PlatformActivityItem }) {
  const Icon = item.icon;
  const interactive = typeof item.onActivate === "function";
  const actions = item.actions;
  const hasActions = Boolean(actions && (actions.onEdit || actions.onDelete));
  const actionMenuRootRef = useRef<HTMLDivElement | null>(null);
  const actionMenuSurfaceRef = useRef<HTMLDivElement | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(actions?.editableValue || "");
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const normalizedEditValue = editValue.trim();
  const canSaveEdit = Boolean(
    actions?.onEdit
    && normalizedEditValue
    && normalizedEditValue !== String(actions.editableValue || "").trim()
    && !actions.disabled
    && !editPending,
  );

  useEffect(() => {
    if (!editing) {
      setEditValue(actions?.editableValue || "");
    }
  }, [actions?.editableValue, editing]);

  useEffect(() => {
    if (!actionMenuOpen) return undefined;
    const closeActionMenu = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        actionMenuRootRef.current?.contains(target)
        || actionMenuSurfaceRef.current?.contains(target)
      ) {
        return;
      }
      setActionMenuOpen(false);
    };
    const closeActionMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeActionMenu, true);
    document.addEventListener("keydown", closeActionMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeActionMenu, true);
      document.removeEventListener("keydown", closeActionMenuOnEscape);
    };
  }, [actionMenuOpen]);

  useEffect(() => {
    const textarea = editTextareaRef.current;
    if (!editing || !textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 240)}px`;
  }, [editValue, editing]);

  const beginEditing = () => {
    if (!actions?.onEdit || actions.disabled) return;
    setActionMenuOpen(false);
    setEditValue(actions.editableValue || "");
    setEditError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (editPending) return;
    setEditValue(actions?.editableValue || "");
    setEditError("");
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!actions?.onEdit || !canSaveEdit) return;
    setEditPending(true);
    setEditError("");
    try {
      await actions.onEdit(normalizedEditValue);
      setEditing(false);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update comment.");
    } finally {
      setEditPending(false);
    }
  };

  return (
    <>
      <li
        className={joinClassNames(
          "platform-activity-timeline__item",
          `is-${item.tone || "neutral"}`,
          Boolean(item.content) && "has-content",
          interactive && "is-interactive",
          hasActions && "has-actions",
          editing && "is-editing",
        )}
      >
        <div className="platform-activity-timeline__rail" aria-hidden="true">
          <span className="platform-activity-timeline__marker">
            {item.avatar || (Icon ? (
              <Icon width={14} height={14} strokeWidth={1.9} />
            ) : null)}
          </span>
        </div>
        <div
          className="platform-activity-timeline__entry"
          role={interactive ? "button" : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-label={interactive ? item.ariaLabel : undefined}
          onClick={item.onActivate}
          onKeyDown={interactive ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              item.onActivate?.();
            }
          } : undefined}
        >
          <div className="platform-activity-timeline__meta">
            {item.content && item.avatar ? (
              <span className="platform-activity-timeline__content-avatar" aria-hidden="true">
                {item.avatar}
              </span>
            ) : null}
            <div className="platform-activity-timeline__summary">{item.summary}</div>
            {item.trailing ? (
              <div className="platform-activity-timeline__trailing">{item.trailing}</div>
            ) : null}
            {item.timestamp ? (
              <time className="platform-activity-timeline__timestamp">{item.timestamp}</time>
            ) : null}
            {hasActions && !editing ? (
              <PlatformPopup
                open={actionMenuOpen}
                rootRef={actionMenuRootRef}
                surfaceRef={actionMenuSurfaceRef}
                portal
                variant="minimal"
                placement="bottom-end"
                portalOffset={4}
                animation="down-in"
                rootClassName="platform-activity-timeline__item-actions"
                rootProps={{
                  onClick: (event) => event.stopPropagation(),
                  onKeyDown: (event) => event.stopPropagation(),
                }}
                surfaceClassName="platform-activity-timeline__item-actions-menu"
                surfaceProps={{
                  role: "menu",
                  width: 164,
                  onClick: (event) => event.stopPropagation(),
                }}
                trigger={({ open }) => (
                  <PlatformIconButton
                    type="button"
                    size="small"
                    className="platform-activity-timeline__item-actions-trigger"
                    aria-label="Comment actions"
                    title="Comment actions"
                    aria-expanded={open}
                    disabled={actions?.disabled}
                    onClick={() => setActionMenuOpen((current) => !current)}
                  >
                    <Ellipsis width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
                  </PlatformIconButton>
                )}
              >
                {actions?.onEdit ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="tb-popup-row"
                    onClick={beginEditing}
                  >
                    <Pencil className="tb-popup-icon" aria-hidden="true" />
                    <span className="tb-popup-label">Edit</span>
                  </button>
                ) : null}
                {actions?.onDelete ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="tb-popup-row"
                    onClick={() => {
                      setActionMenuOpen(false);
                      setDeleteConfirmationOpen(true);
                    }}
                  >
                    <Trash2 className="tb-popup-icon" aria-hidden="true" />
                    <span className="tb-popup-label">Delete</span>
                  </button>
                ) : null}
              </PlatformPopup>
            ) : null}
          </div>
          {editing ? (
            <form
              className="platform-activity-timeline__edit-form"
              onSubmit={(event) => {
                event.preventDefault();
                void saveEdit();
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <textarea
                ref={editTextareaRef}
                className="platform-activity-timeline__edit-input"
                value={editValue}
                rows={1}
                autoFocus
                aria-label="Edit comment"
                disabled={editPending}
                onChange={(event) => {
                  setEditValue(event.target.value);
                  if (editError) setEditError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEditing();
                  } else if (
                    event.key === "Enter"
                    && (event.metaKey || event.ctrlKey)
                    && canSaveEdit
                  ) {
                    event.preventDefault();
                    void saveEdit();
                  }
                }}
              />
              <div className="platform-activity-timeline__edit-actions">
                <PlatformIconButton
                  type="button"
                  size="small"
                  aria-label="Cancel editing"
                  title="Cancel"
                  disabled={editPending}
                  onClick={cancelEditing}
                >
                  <X width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
                </PlatformIconButton>
                <PlatformIconButton
                  type="submit"
                  size="small"
                  aria-label={editPending ? "Saving comment" : "Save comment"}
                  title={editPending ? "Saving" : "Save"}
                  disabled={!canSaveEdit}
                >
                  <Check width={14} height={14} strokeWidth={1.9} aria-hidden="true" />
                </PlatformIconButton>
              </div>
              {editError ? (
                <div className="platform-activity-timeline__edit-error" role="alert">
                  {editError}
                </div>
              ) : null}
            </form>
          ) : item.content ? (
            <div className="platform-activity-timeline__content">{item.content}</div>
          ) : null}
          {(item.replies?.length || item.replyComposer) ? (
            <div className="platform-activity-timeline__replies">
              {item.replies?.length ? (
                <ol className="platform-activity-timeline__reply-list">
                  {item.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="platform-activity-timeline__reply"
                    >
                      {reply.avatar ? (
                        <span
                          className="platform-activity-timeline__reply-avatar"
                          aria-hidden="true"
                        >
                          {reply.avatar}
                        </span>
                      ) : null}
                      <div className="platform-activity-timeline__reply-body">
                        <div className="platform-activity-timeline__reply-meta">
                          <span className="platform-activity-timeline__reply-author">
                            {reply.author}
                          </span>
                          {reply.timestamp ? (
                            <time className="platform-activity-timeline__reply-timestamp">
                              {reply.timestamp}
                            </time>
                          ) : null}
                        </div>
                        <div className="platform-activity-timeline__reply-content">
                          {reply.content}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
              {item.replyComposer ? (
                <PlatformActivityReplyComposer {...item.replyComposer} />
              ) : null}
            </div>
          ) : null}
        </div>
      </li>
      {actions?.onDelete ? (
        <PlatformConfirmationModal
          open={deleteConfirmationOpen}
          title="Delete comment?"
          description="This comment and its replies will be permanently deleted."
          confirmLabel="Delete"
          confirmingLabel="Deleting..."
          tone="destructive"
          onCancel={() => setDeleteConfirmationOpen(false)}
          onConfirm={async () => {
            await actions.onDelete?.();
            setDeleteConfirmationOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export function PlatformActivityTimeline({
  title = "Activity",
  headerActions,
  items = [],
  composer,
  emptyTitle = "No activity yet",
  emptyDescription,
  emptyIcon,
  className = "",
}: PlatformActivityTimelineProps) {
  return (
    <section className={joinClassNames("platform-activity-timeline", className)}>
      <header className="platform-activity-timeline__header">
        <h2 className="platform-activity-timeline__title">{title}</h2>
        {headerActions ? (
          <div className="platform-activity-timeline__header-actions">{headerActions}</div>
        ) : null}
      </header>

      {items.length > 0 ? (
        <ol className="platform-activity-timeline__list">
          {items.map((item) => (
            <PlatformActivityTimelineItem key={item.id} item={item} />
          ))}
        </ol>
      ) : (
        <PlatformEmptyState
          className="platform-activity-timeline__empty"
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}

      {composer ? <PlatformActivityComposer {...composer} /> : null}
    </section>
  );
}
