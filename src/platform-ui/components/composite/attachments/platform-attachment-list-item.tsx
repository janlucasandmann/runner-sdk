import { FileText, X } from "lucide-react";
import { useRef, type HTMLAttributes, type ReactNode } from "react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import {
  PlatformAttachmentActionMenu,
  type PlatformAttachmentActionMenuHandle,
} from "./platform-attachment-action-menu.js";

export interface PlatformAttachmentItem {
  id: string;
  name: string;
  metadata?: ReactNode;
  preview?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
  onRename?: (nextName: string) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  removeLabel?: string;
}

export interface PlatformAttachmentListItemProps
  extends PlatformAttachmentItem,
    Omit<HTMLAttributes<HTMLDivElement>, "children" | "id" | "onClick"> {
  interactionDisabled?: boolean;
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

export function PlatformAttachmentListItem({
  id: _id,
  name,
  metadata,
  preview,
  trailing,
  active = false,
  disabled = false,
  onActivate,
  onRename,
  onRemove,
  removeLabel,
  interactionDisabled = false,
  className = "",
  role = "listitem",
  onContextMenu,
  ...props
}: PlatformAttachmentListItemProps) {
  const actionMenuRef = useRef<PlatformAttachmentActionMenuHandle | null>(null);
  const itemDisabled = interactionDisabled || disabled;
  const hasActions = Boolean(onRename || onRemove);
  const itemContent = (
    <>
      <span className="platform-attachments__preview" aria-hidden="true">
        {preview || <FileText strokeWidth={1.7} />}
      </span>
      <span className="platform-attachments__copy">
        <span className="platform-attachments__name" title={name}>
          {name}
        </span>
        {metadata ? (
          <span className="platform-attachments__metadata">{metadata}</span>
        ) : null}
      </span>
    </>
  );

  return (
    <div
      {...props}
      className={joinClassNames(
        "platform-attachments__item",
        active && "is-active",
        className,
      )}
      role={role}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (event.defaultPrevented || itemDisabled || !hasActions) return;
        event.preventDefault();
        event.stopPropagation();
        actionMenuRef.current?.openAt({
          x: event.clientX,
          y: event.clientY,
        });
      }}
    >
      {onActivate ? (
        <button
          type="button"
          className="platform-attachments__item-main"
          aria-label={name}
          disabled={itemDisabled}
          onClick={onActivate}
        >
          {itemContent}
        </button>
      ) : (
        <div className="platform-attachments__item-main">{itemContent}</div>
      )}
      {trailing || onRename || onRemove ? (
        <div className="platform-attachments__item-actions">
          {trailing}
          <PlatformAttachmentActionMenu
            ref={actionMenuRef}
            name={name}
            onRename={onRename}
            onDelete={onRemove}
            disabled={itemDisabled}
          />
          {onRemove ? (
            <PlatformIconButton
              size="compact"
              aria-label={removeLabel || `Remove ${name}`}
              disabled={itemDisabled}
              onClick={() => void onRemove()}
            >
              <X strokeWidth={1.8} />
            </PlatformIconButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
