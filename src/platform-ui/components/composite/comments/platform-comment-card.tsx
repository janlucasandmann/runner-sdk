import { useEffect, useRef, useState } from "react";
import { Check, Ellipsis, Pencil, Trash2, X } from "../../ui/hugeicons-compat.js";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformConfirmationModal } from "../modal/index.js";
import { PlatformPopup } from "../popup/index.js";
import { PlatformCommentReplyComposer } from "./platform-comment-composer.js";
import type { PlatformCommentCardProps } from "./platform-comment-types.js";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformCommentCard({
  author,
  timestamp,
  avatar,
  content,
  replies = [],
  replyComposer,
  actions,
  className = "",
}: PlatformCommentCardProps) {
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

  function beginEditing() {
    if (!actions?.onEdit || actions.disabled) return;
    setActionMenuOpen(false);
    setEditValue(actions.editableValue || "");
    setEditError("");
    setEditing(true);
  }

  function cancelEditing() {
    if (editPending) return;
    setEditValue(actions?.editableValue || "");
    setEditError("");
    setEditing(false);
  }

  async function saveEdit() {
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
  }

  return (
    <>
      <article
        className={joinClassNames(
          "platform-comment-card",
          hasActions && "has-actions",
          editing && "is-editing",
          className,
        )}
      >
        <div className="platform-comment-card__meta">
          {avatar ? (
            <span className="platform-comment-card__avatar" aria-hidden="true">
              {avatar}
            </span>
          ) : null}
          <div className="platform-comment-card__author">{author}</div>
          {timestamp ? (
            <time className="platform-comment-card__timestamp">{timestamp}</time>
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
              rootClassName="platform-comment-card__actions"
              surfaceClassName="platform-comment-card__actions-menu"
              surfaceProps={{ role: "menu", width: 164 }}
              trigger={({ open }) => (
                <PlatformIconButton
                  type="button"
                  size="small"
                  className="platform-comment-card__actions-trigger"
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
            className="platform-comment-card__edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              void saveEdit();
            }}
          >
            <textarea
              ref={editTextareaRef}
              className="platform-comment-card__edit-input"
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
            <div className="platform-comment-card__edit-actions">
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
              <div className="platform-comment-card__edit-error" role="alert">
                {editError}
              </div>
            ) : null}
          </form>
        ) : (
          <div className="platform-comment-card__content">{content}</div>
        )}
        {(replies.length || replyComposer) ? (
          <div className="platform-comment-card__replies">
            {replies.length ? (
              <ol className="platform-comment-card__reply-list">
                {replies.map((reply) => (
                  <li key={reply.id} className="platform-comment-card__reply">
                    {reply.avatar ? (
                      <span className="platform-comment-card__reply-avatar" aria-hidden="true">
                        {reply.avatar}
                      </span>
                    ) : null}
                    <div className="platform-comment-card__reply-body">
                      <div className="platform-comment-card__reply-meta">
                        <span className="platform-comment-card__reply-author">
                          {reply.author}
                        </span>
                        {reply.timestamp ? (
                          <time className="platform-comment-card__reply-timestamp">
                            {reply.timestamp}
                          </time>
                        ) : null}
                      </div>
                      <div className="platform-comment-card__reply-content">
                        {reply.content}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
            {replyComposer ? <PlatformCommentReplyComposer {...replyComposer} /> : null}
          </div>
        ) : null}
      </article>
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
