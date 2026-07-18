import type { MouseEventHandler, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import {
  type PlatformButtonSize,
  type PlatformButtonVariant,
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../ui/button/index.js";

export type PlatformCodeEditorStatusTone = "default" | "success" | "error" | "loading";
export type PlatformCodeEditorWorkspaceVariant = "default" | "full-screen";

export interface PlatformCodeEditorFile {
  id: string;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface PlatformCodeEditorAction {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  variant?: PlatformButtonVariant;
  size?: PlatformButtonSize;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface PlatformCodeEditorWorkspaceProps {
  files: readonly PlatformCodeEditorFile[];
  activeFileId?: string;
  onFileSelect?: (fileId: string) => void;
  sidebarTitle?: ReactNode;
  editor?: ReactNode;
  emptyFiles?: ReactNode;
  emptyEditor?: ReactNode;
  status?: ReactNode;
  statusTone?: PlatformCodeEditorStatusTone;
  actions?: readonly PlatformCodeEditorAction[];
  showFooter?: boolean;
  variant?: PlatformCodeEditorWorkspaceVariant;
  ariaLabel?: string;
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

function renderAction(action: PlatformCodeEditorAction) {
  const Button = action.variant === "primary" ? PlatformPrimaryButton : PlatformSecondaryButton;

  return (
    <Button
      key={action.id}
      type="button"
      size={action.size ?? "medium"}
      className={action.className}
      disabled={action.disabled}
      aria-label={action.ariaLabel}
      onClick={action.onClick}
    >
      {action.icon}
      <span>{action.label}</span>
    </Button>
  );
}

function stopEditorKeyboardPropagation(event: ReactKeyboardEvent<HTMLElement>) {
  event.stopPropagation();
}

export function PlatformCodeEditorWorkspace({
  files,
  activeFileId = "",
  onFileSelect,
  sidebarTitle = "Files",
  editor = null,
  emptyFiles = "No code files.",
  emptyEditor = "Select a file to edit.",
  status = null,
  statusTone = "default",
  actions = [],
  showFooter = true,
  variant = "default",
  ariaLabel = "Code editor",
  className = "",
}: PlatformCodeEditorWorkspaceProps) {
  return (
    <section
      className={joinClassNames(
        "platform-code-editor-workspace",
        variant === "full-screen" && "is-full-screen",
        className,
      )}
      aria-label={ariaLabel}
      data-platform-code-editor-workspace="true"
      data-platform-code-editor-workspace-variant={variant}
      onKeyDown={stopEditorKeyboardPropagation}
      onKeyUp={stopEditorKeyboardPropagation}
    >
      <aside className="platform-code-editor-workspace__sidebar">
        <div className="platform-code-editor-workspace__sidebar-header">
          <div className="platform-code-editor-workspace__sidebar-title">{sidebarTitle}</div>
        </div>
        <div className="platform-code-editor-workspace__file-list">
          {files.length > 0 ? (
            files.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <button
                  key={file.id}
                  type="button"
                  className={joinClassNames(
                    "platform-code-editor-workspace__file",
                    isActive && "is-active",
                  )}
                  disabled={file.disabled}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={file.ariaLabel}
                  onClick={() => onFileSelect?.(file.id)}
                >
                  <span
                    className="platform-code-editor-workspace__file-spacer"
                    aria-hidden="true"
                  />
                  {file.icon ? (
                    <span className="platform-code-editor-workspace__file-icon" aria-hidden="true">
                      {file.icon}
                    </span>
                  ) : null}
                  <span className="platform-code-editor-workspace__file-label">
                    {file.label ?? file.id}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="platform-code-editor-workspace__empty">{emptyFiles}</div>
          )}
        </div>
      </aside>

      <div className="platform-code-editor-workspace__editor">
        <div className="platform-code-editor-workspace__editor-body">
          {editor ?? (
            <div className="platform-code-editor-workspace__empty is-editor">{emptyEditor}</div>
          )}
        </div>
        {showFooter ? (
          <div className="platform-code-editor-workspace__footer">
            <div
              className={joinClassNames(
                "platform-code-editor-workspace__status",
                statusTone !== "default" && `is-${statusTone}`,
              )}
              role={statusTone === "error" ? "alert" : undefined}
            >
              {status}
            </div>
            {actions.length > 0 ? (
              <div className="platform-code-editor-workspace__actions">
                {actions.map(renderAction)}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
