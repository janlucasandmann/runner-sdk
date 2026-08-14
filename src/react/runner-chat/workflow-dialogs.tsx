import { type RefObject } from "react";
import {
  Cloud as LucideCloud,
  GitBranch as LucideGitBranch,
  Server as LucideServer,
} from "lucide-react";
import {
  PlatformModal,
  PlatformModalBody,
  PlatformModalFooter,
} from "../../platform-ui/components/composite/modal/index.js";
import {
  PlatformInstructionsEditor,
  type PlatformInstructionsEditorUploadedFile,
} from "../../platform-ui/components/composite/instructions-editor/index.js";
import {
  PlatformPopupSurface,
} from "../../platform-ui/components/composite/popup/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../platform-ui/components/ui/selector/index.js";
import {
  IconCheck,
  IconChevronDown,
} from "./icons.js";
import type {
  RunnerForkExistingEnvironmentFileCopyMode,
  RunnerForkFileCopyMode,
  RunnerForkTarget,
} from "./thread-api.js";
import type { RunnerAttachment } from "./attachment-types.js";

export interface RunnerFeedbackDialogProps {
  open: boolean;
  message: string;
  error: string;
  submitting: boolean;
  onMessageChange: (message: string) => void;
  onUploadFiles: (files: File[]) => Promise<RunnerAttachment[]>;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
}
export type RunnerReportIssueDialogProps = RunnerFeedbackDialogProps;

/** Shared feedback surface used by composer actions and run-summary actions. */
export function RunnerFeedbackDialog({
  open,
  message,
  error,
  submitting,
  onMessageChange,
  onUploadFiles,
  onSubmit,
  onClose,
}: RunnerFeedbackDialogProps) {
  if (!open) return null;

  const uploadFiles = async (
    files: File[],
  ): Promise<PlatformInstructionsEditorUploadedFile[]> => {
    const uploaded = await onUploadFiles(files);
    return uploaded.map((attachment) => ({
      src: attachment.url || `/attachments/${encodeURIComponent(attachment.id)}`,
      name: attachment.filename,
      size: attachment.size,
      mimeType: attachment.mimeType,
      attachmentId: attachment.id,
      metadata: attachment,
    }));
  };

  return (
    <PlatformModal
      open
      visible
      size="large"
      scrollable
      showHeader={false}
      title=""
      onClose={onClose}
      closeButtonLabel="Close feedback dialog"
      closeButtonDisabled={submitting}
    >
      <PlatformModalBody className="tb-feedback-modal-body">
        <PlatformInstructionsEditor
          value={message}
          onChange={(nextValue) => onMessageChange(nextValue.slice(0, 5000))}
          title="Feedback"
          placeholder="Give us your feedback"
          ariaLabel="Feedback"
          readOnly={submitting}
          stickyHeader={false}
          variant="minimalistic-ui"
          contentVariant="file-enabled"
          historyKey="runner-feedback"
          fileUpload={{
            upload: uploadFiles,
            accept: "*/*",
            disabled: submitting,
          }}
          autoFocus
        />

        {error ? (
          <div className="runner-inline-error" role="alert">{error}</div>
        ) : null}
      </PlatformModalBody>
      <PlatformModalFooter>
        <PlatformPrimaryButton
          type="button"
          onClick={() => void onSubmit()}
          disabled={submitting || !message.trim()}
        >
          {submitting ? "Sending..." : "Send"}
        </PlatformPrimaryButton>
      </PlatformModalFooter>
    </PlatformModal>
  );
}

/** @deprecated Use RunnerFeedbackDialog. */
export const RunnerReportIssueDialog = RunnerFeedbackDialog;

interface RunnerForkEnvironmentOption {
  id: string;
  name: string;
}

export interface RunnerForkThreadDialogProps {
  open: boolean;
  source: "message" | "thread";
  stagedPrompt: string;
  target: RunnerForkTarget;
  onTargetChange: (target: RunnerForkTarget) => void;
  environments: RunnerForkEnvironmentOption[];
  selectedEnvironmentId: string;
  selectedEnvironmentName: string | null;
  onEnvironmentSelect: (environmentId: string) => void;
  environmentPopupOpen: boolean;
  onEnvironmentPopupOpenChange: (open: boolean) => void;
  environmentPopupRef: RefObject<HTMLDivElement | null>;
  newEnvironmentName: string;
  onNewEnvironmentNameChange: (name: string) => void;
  newEnvironmentFileCopyMode: RunnerForkFileCopyMode;
  onNewEnvironmentFileCopyModeChange: (mode: RunnerForkFileCopyMode) => void;
  existingEnvironmentFileCopyMode: RunnerForkExistingEnvironmentFileCopyMode;
  onExistingEnvironmentFileCopyModeChange: (
    mode: RunnerForkExistingEnvironmentFileCopyMode,
  ) => void;
  showExistingEnvironmentCopyOptions: boolean;
  error: string | null;
  creating: boolean;
  onClearError: () => void;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

interface RunnerForkCopyOptionProps {
  selected: boolean;
  title: string;
  description: string;
  icon: "cloud" | "branch" | "server";
  disabled: boolean;
  onClick: () => void;
}

function RunnerForkCopyOption({
  selected,
  title,
  description,
  icon,
  disabled,
  onClick,
}: RunnerForkCopyOptionProps) {
  const Icon = icon === "cloud"
    ? LucideCloud
    : icon === "branch"
      ? LucideGitBranch
      : LucideServer;

  return (
    <button
      type="button"
      className={`tb-fork-thread-copy-option ${selected ? "selected" : ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="tb-fork-thread-copy-option-icon-shell">
        <Icon className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
      </span>
      <span className="tb-fork-thread-copy-option-main">
        <span className="tb-fork-thread-copy-option-copy">
          <span className="tb-fork-thread-copy-option-title">{title}</span>
          <span className="tb-fork-thread-copy-option-description">{description}</span>
        </span>
      </span>
    </button>
  );
}

export function RunnerForkThreadDialog({
  open,
  source,
  stagedPrompt,
  target,
  onTargetChange,
  environments,
  selectedEnvironmentId,
  selectedEnvironmentName,
  onEnvironmentSelect,
  environmentPopupOpen,
  onEnvironmentPopupOpenChange,
  environmentPopupRef,
  newEnvironmentName,
  onNewEnvironmentNameChange,
  newEnvironmentFileCopyMode,
  onNewEnvironmentFileCopyModeChange,
  existingEnvironmentFileCopyMode,
  onExistingEnvironmentFileCopyModeChange,
  showExistingEnvironmentCopyOptions,
  error,
  creating,
  onClearError,
  onConfirm,
  onClose,
}: RunnerForkThreadDialogProps) {
  if (!open) return null;

  const description = source === "message"
    ? "Choose where the forked thread should run before opening the new chat. The selected user message will be staged in the composer and not sent automatically."
    : stagedPrompt.trim()
      ? "Choose where the forked thread should run before opening the new chat. Your /fork prompt will be sent in the new thread after the fork is created."
      : "Choose where the forked thread should run before opening the new chat. The full conversation will be copied into the new thread.";
  const selectTarget = (nextTarget: RunnerForkTarget) => {
    onTargetChange(nextTarget);
    if (nextTarget === "new_forked_environment") {
      onEnvironmentPopupOpenChange(false);
    }
    onClearError();
  };

  return (
    <PlatformModal
      open
      visible
      size="medium"
      title="Fork Thread"
      description={description}
      backdropClassName="tb-popup-modal-scrim"
      className="tb-popup-modal tb-fork-thread-modal"
      onClose={() => {
        if (!creating) onClose();
      }}
      closeButtonLabel="Close fork thread dialog"
      closeButtonDisabled={creating}
    >
      <div className="tb-fork-thread-modal-body">
        <div className="tb-fork-thread-section">
          <div className="tb-fork-thread-section-header">
            <div className="tb-fork-thread-section-title">Environment</div>
            <div className="tb-fork-thread-section-copy">
              Pick an existing Environment or create a new Environment for this branch.
            </div>
          </div>
          <div className="tb-fork-thread-environment-list">
            {/* biome-ignore lint/a11y/useSemanticElements: This selectable row contains its own interactive environment selector. */}
            <div
              className={`tb-popup-row tb-popup-row-select tb-fork-thread-environment-row ${
                target === "existing_environment" ? "selected" : ""
              }`.trim()}
              role="button"
              tabIndex={0}
              aria-pressed={target === "existing_environment"}
              onClick={() => selectTarget("existing_environment")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectTarget("existing_environment");
                }
              }}
            >
              <span className="tb-popup-check-slot">
                {target === "existing_environment" ? (
                  <IconCheck className="tb-popup-check" />
                ) : null}
              </span>
              <span className="tb-fork-thread-environment-main">
                <span className="tb-fork-thread-environment-copy">
                  <span className="tb-fork-thread-environment-name">
                    Existing Environment
                  </span>
                </span>
              </span>
              <div className="tb-fork-thread-row-control">
                <div className="tb-fork-thread-selector-anchor" ref={environmentPopupRef}>
                  <button
                    type="button"
                    className={`tb-inline-selector tb-fork-thread-inline-selector ${
                      environmentPopupOpen ? "active" : ""
                    }`.trim()}
                    onClick={(event) => {
                      event.stopPropagation();
                      onTargetChange("existing_environment");
                      onEnvironmentPopupOpenChange(!environmentPopupOpen);
                      onClearError();
                    }}
                    disabled={creating || environments.length === 0}
                  >
                    <span>{selectedEnvironmentName || "Select Environment"}</span>
                    <IconChevronDown className="tb-inline-selector-chevron" />
                  </button>

                  {environmentPopupOpen ? (
                    <PlatformPopupSurface className="tb-popup-menu-inline tb-fork-thread-environment-popup">
                      <div className="tb-popup-menu-inline-body">
                        {environments.map((environment) => (
                          <button
                            key={environment.id}
                            type="button"
                            className={`tb-popup-row tb-popup-row-select ${
                              selectedEnvironmentId === environment.id ? "selected" : ""
                            }`}
                            onClick={() => {
                              onTargetChange("existing_environment");
                              onEnvironmentSelect(environment.id);
                              onExistingEnvironmentFileCopyModeChange("none");
                              onEnvironmentPopupOpenChange(false);
                              onClearError();
                            }}
                          >
                            <span className="tb-popup-check-slot">
                              {selectedEnvironmentId === environment.id ? (
                                <IconCheck className="tb-popup-check" />
                              ) : null}
                            </span>
                            <span className="tb-popup-label">{environment.name}</span>
                          </button>
                        ))}
                      </div>
                    </PlatformPopupSurface>
                  ) : null}
                </div>
              </div>
            </div>

            {/* biome-ignore lint/a11y/useSemanticElements: This selectable row contains its own interactive environment-name input. */}
            <div
              className={`tb-popup-row tb-popup-row-select tb-fork-thread-environment-row ${
                target === "new_forked_environment" ? "selected" : ""
              }`.trim()}
              role="button"
              tabIndex={0}
              aria-pressed={target === "new_forked_environment"}
              onClick={() => selectTarget("new_forked_environment")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectTarget("new_forked_environment");
                }
              }}
            >
              <span className="tb-popup-check-slot">
                {target === "new_forked_environment" ? (
                  <IconCheck className="tb-popup-check" />
                ) : null}
              </span>
              <span className="tb-fork-thread-environment-main">
                <span className="tb-fork-thread-environment-copy">
                  <span className="tb-fork-thread-environment-name">
                    Create new Environment
                  </span>
                </span>
              </span>
              <div className="tb-fork-thread-row-control">
                <input
                  type="text"
                  className="tb-fork-thread-name-input"
                  value={newEnvironmentName}
                  placeholder="Environment name"
                  disabled={creating}
                  onClick={(event) => {
                    event.stopPropagation();
                    onTargetChange("new_forked_environment");
                    onEnvironmentPopupOpenChange(false);
                  }}
                  onChange={(event) => {
                    onTargetChange("new_forked_environment");
                    onNewEnvironmentNameChange(event.target.value);
                    onClearError();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {target === "new_forked_environment" ? (
          <div className="tb-fork-thread-section">
            <div className="tb-fork-thread-section-header">
              <div className="tb-fork-thread-section-title">Workspace files</div>
              <div className="tb-fork-thread-section-copy">
                Choose what the new Environment should contain.
              </div>
            </div>
            <div className="tb-fork-thread-copy-options">
              <RunnerForkCopyOption
                selected={newEnvironmentFileCopyMode === "all"}
                title="Copy full current workspace"
                description="Create a new Environment from the source thread's current workspace."
                icon="cloud"
                disabled={creating}
                onClick={() => {
                  onNewEnvironmentFileCopyModeChange("all");
                  onClearError();
                }}
              />
              <RunnerForkCopyOption
                selected={newEnvironmentFileCopyMode === "thread_only"}
                title="Copy only thread-touched files"
                description="Start from an empty workspace and bring over only files the thread changed before this message."
                icon="branch"
                disabled={creating}
                onClick={() => {
                  onNewEnvironmentFileCopyModeChange("thread_only");
                  onClearError();
                }}
              />
              <RunnerForkCopyOption
                selected={newEnvironmentFileCopyMode === "none"}
                title="Start with an empty workspace"
                description="Create a fresh Environment with no files copied from the source thread."
                icon="server"
                disabled={creating}
                onClick={() => {
                  onNewEnvironmentFileCopyModeChange("none");
                  onClearError();
                }}
              />
            </div>
          </div>
        ) : showExistingEnvironmentCopyOptions ? (
          <div className="tb-fork-thread-section">
            <div className="tb-fork-thread-section-header">
              <div className="tb-fork-thread-section-title">Workspace files</div>
              <div className="tb-fork-thread-section-copy">
                Decide whether the selected Environment should receive files from the source thread
                before the fork opens.
              </div>
            </div>
            <div className="tb-fork-thread-copy-options">
              <RunnerForkCopyOption
                selected={existingEnvironmentFileCopyMode === "thread_only"}
                title="Copy thread-touched files"
                description="Overlay files the thread changed before this message onto the selected Environment."
                icon="branch"
                disabled={creating}
                onClick={() => {
                  onExistingEnvironmentFileCopyModeChange("thread_only");
                  onClearError();
                }}
              />
              <RunnerForkCopyOption
                selected={existingEnvironmentFileCopyMode === "none"}
                title="Keep the selected Environment as-is"
                description="Do not copy any files from the source thread into the selected Environment."
                icon="server"
                disabled={creating}
                onClick={() => {
                  onExistingEnvironmentFileCopyModeChange("none");
                  onClearError();
                }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="runner-inline-error tb-fork-thread-error">{error}</div>
        ) : null}

        <div className="tb-edit-confirmation-actions tb-fork-thread-actions">
          <PlatformSecondaryButton
            size="large"
            type="button"
            className="tb-popup-action tb-popup-action-secondary"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="large"
            type="button"
            className={`tb-popup-action tb-popup-action-primary ${creating ? "loading" : ""}`.trim()}
            onClick={() => void onConfirm()}
            disabled={
              creating
              || (
                target === "existing_environment"
                  ? !selectedEnvironmentId
                  : !newEnvironmentName.trim()
              )
            }
          >
            {creating ? (
              <span className="tb-fork-thread-action-loading">
                <span className="runner-spinner tb-fork-thread-action-spinner" />
                <span>Creating Fork...</span>
              </span>
            ) : (
              "Create Fork"
            )}
          </PlatformPrimaryButton>
        </div>
      </div>
    </PlatformModal>
  );
}

interface RunnerEditConfirmationFile {
  path: string;
  kind: string;
  additions?: number;
  deletions?: number;
}

export interface RunnerEditConfirmationDialogProps {
  open: boolean;
  changedFiles: RunnerEditConfirmationFile[];
  onCancel: () => void;
  onConfirm: (keepFileChanges: boolean) => void | Promise<void>;
}

export function RunnerEditConfirmationDialog({
  open,
  changedFiles,
  onCancel,
  onConfirm,
}: RunnerEditConfirmationDialogProps) {
  if (!open) return null;

  return (
    <PlatformModal
      open
      visible
      size="small"
      title="File changes detected"
      description="The following files were changed by this message or later messages. Do you want to keep those workspace changes when rerunning from the edited message?"
      backdropClassName="tb-popup-modal-scrim"
      className="tb-popup-modal tb-edit-confirmation-modal"
      onClose={onCancel}
      closeButtonLabel="Close file changes dialog"
    >
      {changedFiles.length > 0 ? (
        <div className="tb-edit-confirmation-files">
          {changedFiles.map((file) => (
            <div key={file.path} className="tb-edit-confirmation-file">
              <div className="tb-edit-confirmation-file-main">
                <span className={`tb-edit-confirmation-file-kind is-${file.kind}`}>
                  {file.kind}
                </span>
                <span className="tb-edit-confirmation-file-path" title={file.path}>
                  {file.path}
                </span>
              </div>
              {typeof file.additions === "number" || typeof file.deletions === "number" ? (
                <div className="tb-edit-confirmation-file-stats">
                  {typeof file.additions === "number" ? (
                    <span className="tb-edit-confirmation-file-stat is-added">
                      +{file.additions}
                    </span>
                  ) : null}
                  {typeof file.deletions === "number" ? (
                    <span className="tb-edit-confirmation-file-stat is-removed">
                      -{file.deletions}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="tb-edit-confirmation-actions">
        <PlatformSecondaryButton
          size="large"
          type="button"
          className="tb-popup-action tb-popup-action-secondary"
          onClick={onCancel}
        >
          Cancel
        </PlatformSecondaryButton>
        <PlatformSecondaryButton
          size="large"
          type="button"
          className="tb-popup-action tb-popup-action-secondary"
          onClick={() => void onConfirm(false)}
        >
          Revert file changes
        </PlatformSecondaryButton>
        <PlatformPrimaryButton
          size="large"
          type="button"
          className="tb-popup-action tb-popup-action-primary"
          onClick={() => void onConfirm(true)}
        >
          Keep file changes
        </PlatformPrimaryButton>
      </div>
    </PlatformModal>
  );
}
