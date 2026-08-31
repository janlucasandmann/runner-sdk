import { useEffect, useMemo, useState, type RefObject } from "react";
import {
  Cloud as LucideCloud,
  GitBranch as LucideGitBranch,
  Server as LucideServer,
} from "../../platform-ui/components/ui/hugeicons-compat.js";
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
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import { DotLoader } from "../../platform-ui/components/ui/dot-loader/index.js";
import { PlatformInput } from "../../platform-ui/components/ui/input/index.js";
import {
  PlatformSelector,
  type PlatformSelectorOption,
} from "../../platform-ui/components/ui/selector/index.js";
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

  const uploadFiles = async (files: File[]): Promise<PlatformInstructionsEditorUploadedFile[]> => {
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
          <div className="runner-inline-error" role="alert">
            {error}
          </div>
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
  const [environmentSearchQuery, setEnvironmentSearchQuery] = useState("");
  const environmentOptions = useMemo<PlatformSelectorOption<string>[]>(() => {
    const normalizedQuery = environmentSearchQuery.trim().toLocaleLowerCase();
    return environments
      .filter(
        (environment) =>
          !normalizedQuery || environment.name.toLocaleLowerCase().includes(normalizedQuery),
      )
      .map((environment) => ({
        value: environment.id,
        label: environment.name,
      }));
  }, [environmentSearchQuery, environments]);

  useEffect(() => {
    if (!environmentPopupOpen) setEnvironmentSearchQuery("");
  }, [environmentPopupOpen]);

  if (!open) return null;

  const description =
    source === "message"
      ? "Choose where the forked thread should run before opening the new chat. The selected user message will be staged in the composer and not sent automatically."
      : stagedPrompt.trim()
        ? "Choose where the forked thread should run before opening the new chat. Your /fork prompt will be sent in the new thread after the fork is created."
        : "Choose where the forked thread should run before opening the new chat. The full conversation will be copied into the new thread.";
  const targetOptions: readonly PlatformSelectorOption<RunnerForkTarget>[] = [
    {
      value: "existing_environment",
      label: "Existing Environment",
      description: "Continue in an Environment that already exists.",
    },
    {
      value: "new_forked_environment",
      label: "Create new Environment",
      description: "Create an isolated Environment for this branch.",
    },
  ];
  const newEnvironmentCopyOptions: readonly PlatformSelectorOption<RunnerForkFileCopyMode>[] = [
    {
      value: "all",
      label: "Copy full current workspace",
      description: "Create the Environment from the source thread's current workspace.",
      leading: <LucideCloud width={14} height={14} strokeWidth={1.75} />,
    },
    {
      value: "thread_only",
      label: "Copy only thread-touched files",
      description: "Bring over only files changed before this message.",
      leading: <LucideGitBranch width={14} height={14} strokeWidth={1.75} />,
    },
    {
      value: "none",
      label: "Start with an empty workspace",
      description: "Create a fresh Environment without copying files.",
      leading: <LucideServer width={14} height={14} strokeWidth={1.75} />,
    },
  ];
  const existingEnvironmentCopyOptions: readonly PlatformSelectorOption<RunnerForkExistingEnvironmentFileCopyMode>[] =
    [
      {
        value: "thread_only",
        label: "Copy thread-touched files",
        description: "Overlay files changed before this message onto the selected Environment.",
        leading: <LucideGitBranch width={14} height={14} strokeWidth={1.75} />,
      },
      {
        value: "none",
        label: "Keep the selected Environment as-is",
        description: "Do not copy files from the source thread.",
        leading: <LucideServer width={14} height={14} strokeWidth={1.75} />,
      },
    ];
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
      width="560px"
      maxHeight="min(720px, calc(100dvh - 48px))"
      scrollable
      animateResize
      title="Fork Thread"
      description={description}
      className="tb-fork-thread-modal"
      onClose={() => {
        if (!creating) onClose();
      }}
      closeButtonLabel="Close fork thread dialog"
      closeButtonDisabled={creating}
    >
      <PlatformModalBody className="tb-fork-thread-modal-body">
        <section
          className="tb-fork-thread-section"
          aria-labelledby="tb-fork-thread-environment-title"
        >
          <div className="tb-fork-thread-section-header">
            <h3 id="tb-fork-thread-environment-title" className="tb-fork-thread-section-title">
              Environment
            </h3>
            <div className="tb-fork-thread-section-copy">
              Pick an existing Environment or create a new Environment for this branch.
            </div>
          </div>
          <div className="tb-fork-thread-fields">
            <div className="tb-fork-thread-field">
              <span className="tb-fork-thread-field-label">Run in</span>
              <PlatformSelector<RunnerForkTarget>
                value={target}
                options={targetOptions}
                onValueChange={selectTarget}
                ariaLabel="Choose fork destination"
                disabled={creating}
                fullWidth
                alignment="end"
                popupAlignment="right"
                popupMatchTriggerWidth="exact"
                triggerClassName="tb-fork-thread-selector-trigger"
                popupClassName="tb-fork-thread-selector-popup"
              />
            </div>

            {target === "existing_environment" ? (
              <div className="tb-fork-thread-field">
                <span className="tb-fork-thread-field-label">Environment</span>
                <PlatformSelector<string>
                  ref={environmentPopupRef}
                  value={selectedEnvironmentId}
                  options={environmentOptions}
                  label={selectedEnvironmentName || undefined}
                  placeholder="Select Environment"
                  onValueChange={(environmentId) => {
                    onEnvironmentSelect(environmentId);
                    onExistingEnvironmentFileCopyModeChange("none");
                    onClearError();
                  }}
                  ariaLabel="Choose existing Environment"
                  disabled={creating || environments.length === 0}
                  open={environmentPopupOpen}
                  onOpenChange={(nextOpen) => {
                    onEnvironmentPopupOpenChange(nextOpen);
                    if (!nextOpen) setEnvironmentSearchQuery("");
                    onClearError();
                  }}
                  fullWidth
                  alignment="end"
                  popupAlignment="right"
                  popupMatchTriggerWidth="exact"
                  popupSearch={{
                    "aria-label": "Search environments",
                    placeholder: "Search environments...",
                    value: environmentSearchQuery,
                    onChange: (event) => setEnvironmentSearchQuery(event.target.value),
                    showSearchIcon: true,
                  }}
                  emptyContent={
                    environmentSearchQuery.trim()
                      ? "No matching Environments."
                      : "No Environments available."
                  }
                  triggerClassName="tb-fork-thread-selector-trigger"
                  popupClassName="tb-fork-thread-selector-popup"
                />
              </div>
            ) : (
              <label className="tb-fork-thread-field" htmlFor="tb-fork-thread-new-environment-name">
                <span className="tb-fork-thread-field-label">Environment name</span>
                <PlatformInput
                  id="tb-fork-thread-new-environment-name"
                  className="tb-fork-thread-name-input"
                  value={newEnvironmentName}
                  placeholder="Environment name"
                  aria-label="New environment name"
                  disabled={creating}
                  fullWidth
                  onChange={(event) => {
                    onNewEnvironmentNameChange(event.target.value);
                    onClearError();
                  }}
                />
              </label>
            )}
          </div>
        </section>

        {target === "new_forked_environment" ? (
          <section
            className="tb-fork-thread-section"
            aria-labelledby="tb-fork-thread-workspace-title"
          >
            <div className="tb-fork-thread-section-header">
              <h3 id="tb-fork-thread-workspace-title" className="tb-fork-thread-section-title">
                Workspace files
              </h3>
              <div className="tb-fork-thread-section-copy">
                Choose what the new Environment should contain.
              </div>
            </div>
            <div className="tb-fork-thread-fields">
              <div className="tb-fork-thread-field">
                <span className="tb-fork-thread-field-label">Files</span>
                <PlatformSelector<RunnerForkFileCopyMode>
                  value={newEnvironmentFileCopyMode}
                  options={newEnvironmentCopyOptions}
                  onValueChange={(mode) => {
                    onNewEnvironmentFileCopyModeChange(mode);
                    onClearError();
                  }}
                  ariaLabel="Choose files for the new Environment"
                  disabled={creating}
                  fullWidth
                  alignment="end"
                  popupAlignment="right"
                  popupMatchTriggerWidth="exact"
                  triggerClassName="tb-fork-thread-selector-trigger"
                  popupClassName="tb-fork-thread-selector-popup"
                />
              </div>
            </div>
          </section>
        ) : showExistingEnvironmentCopyOptions ? (
          <section
            className="tb-fork-thread-section"
            aria-labelledby="tb-fork-thread-workspace-title"
          >
            <div className="tb-fork-thread-section-header">
              <h3 id="tb-fork-thread-workspace-title" className="tb-fork-thread-section-title">
                Workspace files
              </h3>
              <div className="tb-fork-thread-section-copy">
                Decide whether the selected Environment should receive files from the source thread.
              </div>
            </div>
            <div className="tb-fork-thread-fields">
              <div className="tb-fork-thread-field">
                <span className="tb-fork-thread-field-label">Files</span>
                <PlatformSelector<RunnerForkExistingEnvironmentFileCopyMode>
                  value={existingEnvironmentFileCopyMode}
                  options={existingEnvironmentCopyOptions}
                  onValueChange={(mode) => {
                    onExistingEnvironmentFileCopyModeChange(mode);
                    onClearError();
                  }}
                  ariaLabel="Choose files for the existing Environment"
                  disabled={creating}
                  fullWidth
                  alignment="end"
                  popupAlignment="right"
                  popupMatchTriggerWidth="exact"
                  triggerClassName="tb-fork-thread-selector-trigger"
                  popupClassName="tb-fork-thread-selector-popup"
                />
              </div>
            </div>
          </section>
        ) : null}

        {error ? (
          <div className="runner-inline-error tb-fork-thread-error" role="alert">
            {error}
          </div>
        ) : null}
      </PlatformModalBody>
      <PlatformModalFooter className="tb-fork-thread-actions">
        <PlatformSecondaryButton
          size="large"
          type="button"
          onClick={onClose}
          disabled={creating}
          minWidth="104px"
        >
          Cancel
        </PlatformSecondaryButton>
        <PlatformPrimaryButton
          size="large"
          type="button"
          onClick={() => void onConfirm()}
          disabled={
            creating ||
            (target === "existing_environment"
              ? !selectedEnvironmentId
              : !newEnvironmentName.trim())
          }
          minWidth="112px"
        >
          {creating ? (
            <span className="tb-fork-thread-action-loading">
              <DotLoader dotCount={4} dotSize={2} gap={2} color="currentColor" />
              <span>Creating Fork...</span>
            </span>
          ) : (
            "Create Fork"
          )}
        </PlatformPrimaryButton>
      </PlatformModalFooter>
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
