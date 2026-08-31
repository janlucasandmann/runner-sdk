import type { ReactNode } from "react";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformModal, type PlatformModalCloseReason } from "../modal/index.js";
import { RunnerFileDiffSurface } from "../diff-viewer/index.js";
import { PlatformSelector, type PlatformSelectorOption } from "../../ui/selector/index.js";

export interface PlatformVersionChangesFile {
  id?: string;
  filePath?: string;
  label?: string;
  diffContent?: string;
  fileContent?: string;
  additions?: number | null;
  deletions?: number | null;
}

export interface PlatformVersionChangesSelector {
  value: string;
  options: readonly PlatformSelectorOption<string>[];
  onValueChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: ReactNode;
  disabled?: boolean;
}

export interface PlatformVersionChangesModalProps {
  open: boolean;
  onClose: (reason?: PlatformModalCloseReason) => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  files?: readonly PlatformVersionChangesFile[];
  leftSelector?: PlatformVersionChangesSelector | null;
  rightSelector?: PlatformVersionChangesSelector | null;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  compareControls?: ReactNode;
  actions?: ReactNode;
  compareTitle?: ReactNode;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingMessage?: ReactNode;
  error?: ReactNode;
  className?: string;
  contentClassName?: string;
  closeButtonLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function normalizeFile(file: PlatformVersionChangesFile) {
  return {
    ...file,
    id: String(file.id || file.filePath || file.label || "version-file"),
    filePath: String(file.filePath || file.label || "version.txt"),
    diffContent: String(file.diffContent || ""),
    fileContent: String(file.fileContent || ""),
    additions: Math.max(0, Number(file.additions || 0)),
    deletions: Math.max(0, Number(file.deletions || 0)),
  };
}

function VersionSelector({
  selector,
  side,
}: {
  selector: PlatformVersionChangesSelector;
  side: "left" | "right";
}) {
  return (
    <PlatformSelector
      value={selector.value}
      options={selector.options}
      onValueChange={(value) => selector.onValueChange(value)}
      ariaLabel={selector.ariaLabel}
      placeholder={selector.placeholder || "Select version"}
      disabled={selector.disabled}
      alignment="end"
      popupAlignment={side === "right" ? "right" : "left"}
      popupWidth={220}
      popupMaxWidth="min(300px, calc(100vw - 32px))"
      className={joinClassNames("platform-version-changes-modal__selector", `is-${side}`)}
      triggerClassName="platform-version-changes-modal__selector-trigger"
      popupClassName="platform-version-changes-modal__selector-popup"
    />
  );
}

export function PlatformVersionChangesModal({
  open,
  onClose,
  title = "Changes",
  subtitle,
  files = [],
  leftSelector = null,
  rightSelector = null,
  leftLabel,
  rightLabel,
  compareControls,
  actions,
  compareTitle = "Versions",
  emptyMessage = "No differences found.",
  loading = false,
  loadingMessage = "Loading version changes…",
  error = null,
  className = "",
  contentClassName = "",
  closeButtonLabel = "Close version changes",
  closeOnBackdrop = true,
  closeOnEscape = true,
}: PlatformVersionChangesModalProps) {
  const resolvedFiles = files
    .map(normalizeFile)
    .filter((file) => file.diffContent.trim() || file.fileContent.trim());
  const totalAdditions = resolvedFiles.reduce((total, file) => total + file.additions, 0);
  const totalDeletions = resolvedFiles.reduce((total, file) => total + file.deletions, 0);
  const fileCountLabel = `${resolvedFiles.length} ${resolvedFiles.length === 1 ? "file" : "files"}`;
  const hasCentralSelectors = Boolean(leftSelector && rightSelector);
  const hasStaticLabels = !hasCentralSelectors && Boolean(leftLabel || rightLabel);

  return (
    <PlatformModal
      open={open}
      title={title}
      description={subtitle}
      size="full"
      width="min(1440px, calc(100vw - 48px))"
      maxWidth="none"
      maxHeight="calc(100dvh - 48px)"
      animateResize={false}
      showFooter={false}
      closeButtonLabel={closeButtonLabel}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
      onClose={onClose}
      className={joinClassNames("platform-version-changes-modal", className)}
      bodyClassName="platform-version-changes-modal__body"
      surfaceProps={{
        style: {
          height: "min(900px, calc(100dvh - 48px))",
        },
      }}
    >
      <section
        className={joinClassNames(
          "platform-version-changes-modal__content",
          "playground-version-changes-modal",
          contentClassName,
        )}
      >
        {loading ? (
          <PlatformLoadingState
            centered
            message={loadingMessage}
            className="platform-version-changes-modal__loading"
          />
        ) : error ? (
          <div className="platform-version-changes-modal__error" role="alert">
            {error}
          </div>
        ) : (
          <>
            <div className="platform-version-changes-modal__compare-toolbar">
              <div className="platform-version-changes-modal__compare-leading">
                <span className="platform-version-changes-modal__compare-title">
                  {compareTitle}
                </span>
                <span className="platform-version-changes-modal__summary">
                  <span>{fileCountLabel}</span>
                  <span className="is-additions">+{totalAdditions}</span>
                  <span className="is-deletions">-{totalDeletions}</span>
                </span>
              </div>

              <div className="platform-version-changes-modal__compare-end">
                {hasCentralSelectors ? (
                  <div className="platform-version-changes-modal__selectors">
                    <VersionSelector selector={leftSelector!} side="left" />
                    <span
                      className="platform-version-changes-modal__compare-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                    <VersionSelector selector={rightSelector!} side="right" />
                  </div>
                ) : compareControls ? (
                  <div className="platform-version-changes-modal__legacy-controls">
                    {compareControls}
                  </div>
                ) : hasStaticLabels ? (
                  <div className="platform-version-changes-modal__static-labels">
                    {leftLabel ? <span>{leftLabel}</span> : null}
                    {leftLabel && rightLabel ? <span aria-hidden="true">→</span> : null}
                    {rightLabel ? <span>{rightLabel}</span> : null}
                  </div>
                ) : null}
                {actions ? (
                  <div className="platform-version-changes-modal__actions">{actions}</div>
                ) : null}
              </div>
            </div>

            {resolvedFiles.length ? (
              <div className="platform-version-changes-modal__file-list">
                {resolvedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="platform-version-changes-modal__file-card playground-version-changes-file-card"
                  >
                    <RunnerFileDiffSurface
                      filePath={file.filePath}
                      diffContent={file.diffContent}
                      fileContent={file.fileContent}
                      additions={file.additions}
                      deletions={file.deletions}
                      emptyMessage="No diff is available for this file."
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="platform-version-changes-modal__empty">{emptyMessage}</div>
            )}
          </>
        )}
      </section>
    </PlatformModal>
  );
}
