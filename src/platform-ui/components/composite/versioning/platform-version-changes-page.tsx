import type {
  ComponentType,
  ReactNode,
  SVGProps,
} from "react";
import { ArrowLeft } from "lucide-react";
import {
  PlatformSelector,
  type PlatformSelectorOption,
} from "../../ui/selector/index.js";
import { RunnerFileDiffSurface } from "../diff-viewer/index.js";

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

export interface PlatformVersionChangesPageProps {
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
  onBack?: () => void;
  backLabel?: string;
  backIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  emptyMessage?: ReactNode;
  className?: string;
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
      className={joinClassNames(
        "platform-version-changes-page__selector",
        `is-${side}`,
      )}
      triggerClassName="platform-version-changes-page__selector-trigger"
      popupClassName="platform-version-changes-page__selector-popup"
    />
  );
}

export function PlatformVersionChangesPage({
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
  onBack,
  backLabel = "Back",
  backIcon: BackIcon = ArrowLeft,
  emptyMessage = "No differences found.",
  className = "",
}: PlatformVersionChangesPageProps) {
  const resolvedFiles = files
    .map(normalizeFile)
    .filter((file) => file.diffContent.trim() || file.fileContent.trim());
  const totalAdditions = resolvedFiles.reduce(
    (total, file) => total + file.additions,
    0,
  );
  const totalDeletions = resolvedFiles.reduce(
    (total, file) => total + file.deletions,
    0,
  );
  const fileCountLabel = `${resolvedFiles.length} ${
    resolvedFiles.length === 1 ? "file" : "files"
  }`;
  const hasCentralSelectors = Boolean(leftSelector && rightSelector);
  const hasStaticLabels = !hasCentralSelectors && Boolean(leftLabel || rightLabel);

  return (
    <section
      className={joinClassNames(
        "platform-version-changes-page",
        "playground-version-changes-page",
        className,
      )}
    >
      <header className="platform-version-changes-page__header">
        <div className="platform-version-changes-page__identity">
          <div className="platform-version-changes-page__identity-copy">
            {onBack ? (
              <button
                type="button"
                className="platform-version-changes-page__title-button"
                onClick={onBack}
                aria-label={backLabel}
              >
                <BackIcon
                  className="platform-version-changes-page__back-icon"
                  width={16}
                  height={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="platform-version-changes-page__title">{title}</span>
              </button>
            ) : (
              <h1 className="platform-version-changes-page__title">{title}</h1>
            )}
            {subtitle ? (
              <div className="platform-version-changes-page__subtitle">{subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="platform-version-changes-page__compare-toolbar">
          <div className="platform-version-changes-page__compare-leading">
            <span className="platform-version-changes-page__compare-title">
              {compareTitle}
            </span>
            <span className="platform-version-changes-page__summary">
              <span>{fileCountLabel}</span>
              <span className="is-additions">+{totalAdditions}</span>
              <span className="is-deletions">-{totalDeletions}</span>
            </span>
          </div>

          <div className="platform-version-changes-page__compare-end">
            {hasCentralSelectors ? (
              <div className="platform-version-changes-page__selectors">
                <VersionSelector selector={leftSelector!} side="left" />
                <span className="platform-version-changes-page__compare-arrow" aria-hidden="true">
                  →
                </span>
                <VersionSelector selector={rightSelector!} side="right" />
              </div>
            ) : compareControls ? (
              <div className="platform-version-changes-page__legacy-controls">
                {compareControls}
              </div>
            ) : hasStaticLabels ? (
              <div className="platform-version-changes-page__static-labels">
                {leftLabel ? <span>{leftLabel}</span> : null}
                {leftLabel && rightLabel ? <span aria-hidden="true">→</span> : null}
                {rightLabel ? <span>{rightLabel}</span> : null}
              </div>
            ) : null}
            {actions ? (
              <div className="platform-version-changes-page__actions">{actions}</div>
            ) : null}
          </div>
        </div>
      </header>

      {resolvedFiles.length ? (
        <div className="platform-version-changes-page__file-list">
          {resolvedFiles.map((file) => (
            <div
              key={file.id}
              className="platform-version-changes-page__file-card playground-version-changes-file-card"
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
        <div className="platform-version-changes-page__empty">{emptyMessage}</div>
      )}
    </section>
  );
}
