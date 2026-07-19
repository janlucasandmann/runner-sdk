import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import {
  formatPlatformVersionLabel,
} from "../../ui/version-label/platform-version-label.js";
import { PlatformButtonSelector } from "../../ui/selector/index.js";
import { PlatformSwitch } from "../../ui/switch/index.js";
import { PlatformInstructionsEditor } from "../instructions-editor/index.js";
import { PlatformModal } from "../modal/index.js";

export type PlatformVersionSaveMode = "current" | "new";

export interface PlatformVersionSaveChange {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface PlatformVersionSaveDetails {
  mode: PlatformVersionSaveMode;
  description: string;
}

export interface PlatformVersionSaveDialogProps {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  currentVersion?: string | number | null;
  nextVersion: string | number;
  currentDescription?: string;
  newDescription?: string;
  initialMode?: PlatformVersionSaveMode;
  canSaveCurrent?: boolean;
  changes?: readonly PlatformVersionSaveChange[];
  emptyChanges?: ReactNode;
  pending?: boolean;
  error?: ReactNode;
  submitLabel?: ReactNode;
  pendingLabel?: ReactNode;
  descriptionLabel?: ReactNode;
  descriptionPlaceholder?: string;
  instanceKey?: string | number;
  onClose: () => void;
  onSubmit: (details: PlatformVersionSaveDetails) => void | Promise<void>;
}

function normalizeDescription(value: string | undefined) {
  return String(value || "").slice(0, 240);
}

export function PlatformVersionSaveDialog({
  open,
  title = "Review changes",
  description,
  currentVersion = null,
  nextVersion,
  currentDescription = "",
  newDescription = "",
  initialMode = "new",
  canSaveCurrent = currentVersion != null,
  changes = [],
  emptyChanges = "No file changes to display.",
  pending = false,
  error,
  submitLabel = "Save Changes",
  pendingLabel = "Saving...",
  descriptionLabel = "Version description (optional)",
  descriptionPlaceholder = "Summarize what changed in this version",
  instanceKey,
  onClose,
  onSubmit,
}: PlatformVersionSaveDialogProps) {
  const resolvedInitialMode: PlatformVersionSaveMode = (
    initialMode === "current" && canSaveCurrent ? "current" : "new"
  );
  const [mode, setMode] = useState<PlatformVersionSaveMode>(resolvedInitialMode);
  const [descriptionByMode, setDescriptionByMode] = useState({
    current: normalizeDescription(currentDescription),
    new: normalizeDescription(newDescription),
  });
  const [activeChangeId, setActiveChangeId] = useState(changes[0]?.id || "");
  const [internalPending, setInternalPending] = useState(false);
  const [internalError, setInternalError] = useState("");
  const wasOpenRef = useRef(false);
  const openInstanceKeyRef = useRef(instanceKey);
  const descriptionTouchedRef = useRef({
    current: false,
    new: false,
  });
  const submissionInFlightRef = useRef(false);

  useEffect(() => {
    const isNewOpen = open && (
      !wasOpenRef.current
      || !Object.is(openInstanceKeyRef.current, instanceKey)
    );
    wasOpenRef.current = open;
    if (open) openInstanceKeyRef.current = instanceKey;
    if (!isNewOpen) return;
    setMode(resolvedInitialMode);
    descriptionTouchedRef.current = {
      current: false,
      new: false,
    };
    setDescriptionByMode({
      current: normalizeDescription(currentDescription),
      new: normalizeDescription(newDescription),
    });
    setActiveChangeId(changes[0]?.id || "");
    setInternalPending(false);
    setInternalError("");
    submissionInFlightRef.current = false;
  }, [
    changes,
    currentDescription,
    instanceKey,
    newDescription,
    open,
    resolvedInitialMode,
  ]);

  useEffect(() => {
    if (!open) return;
    const incomingDescriptions = {
      current: normalizeDescription(currentDescription),
      new: normalizeDescription(newDescription),
    };
    setDescriptionByMode((current) => {
      const next = {
        current: descriptionTouchedRef.current.current
          ? current.current
          : incomingDescriptions.current,
        new: descriptionTouchedRef.current.new
          ? current.new
          : incomingDescriptions.new,
      };
      return next.current === current.current && next.new === current.new
        ? current
        : next;
    });
  }, [currentDescription, newDescription, open]);

  useEffect(() => {
    if (!changes.some((change) => change.id === activeChangeId)) {
      setActiveChangeId(changes[0]?.id || "");
    }
  }, [activeChangeId, changes]);

  const activeChange = useMemo(
    () => changes.find((change) => change.id === activeChangeId) || changes[0] || null,
    [activeChangeId, changes],
  );
  const isPending = pending || internalPending;
  const currentVersionLabel = currentVersion == null
    ? "Current version"
    : formatPlatformVersionLabel(currentVersion);
  const nextVersionLabel = formatPlatformVersionLabel(nextVersion);
  const displayedError = error || internalError;
  const descriptionAriaLabel = typeof descriptionLabel === "string"
    ? descriptionLabel
    : "Version description";
  const modeOptions = [
    {
      value: "current",
      label: "Current version",
      disabled: !canSaveCurrent,
    },
    {
      value: "new",
      label: "Create new version",
    },
  ];

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = async () => {
    if (isPending || submissionInFlightRef.current) return;
    submissionInFlightRef.current = true;
    setInternalPending(true);
    setInternalError("");
    try {
      await onSubmit({
        mode,
        description: normalizeDescription(descriptionByMode[mode]).trim(),
      });
    } catch (submitError) {
      setInternalError(
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "The version could not be saved.",
      );
    } finally {
      submissionInFlightRef.current = false;
      setInternalPending(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title={title}
      description={description}
      size="large"
      maxHeight="min(760px, calc(100dvh - 48px))"
      className="platform-version-save-dialog"
      headerClassName="platform-version-save-dialog__header"
      bodyClassName="platform-version-save-dialog__body"
      footerClassName="platform-version-save-dialog__footer"
      headerActions={(
        <PlatformSwitch
          value={mode}
          options={modeOptions}
          onValueChange={(value) => setMode(value as PlatformVersionSaveMode)}
          ariaLabel="Choose where to save these changes"
          disabled={isPending}
          className="platform-version-save-dialog__mode-switch"
        />
      )}
      closeButtonDisabled={isPending}
      closeOnBackdrop={!isPending}
      closeOnEscape={!isPending}
      onClose={handleClose}
      footer={(
        <>
          <PlatformSecondaryButton
            size="medium"
            type="button"
            disabled={isPending}
            onClick={handleClose}
          >
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="button"
            disabled={isPending}
            onClick={() => void handleSubmit()}
          >
            {isPending ? pendingLabel : submitLabel}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <section className="platform-version-save-dialog__changes">
        <div className="platform-version-save-dialog__changes-toolbar">
          <div
            className="platform-version-save-dialog__comparison"
            aria-label={`${currentVersionLabel} to ${
              mode === "current" ? `updated ${currentVersionLabel}` : `new ${nextVersionLabel}`
            }`}
          >
            <span>{currentVersionLabel}</span>
            <span aria-hidden="true">→</span>
            <span>{mode === "current" ? `Updated ${currentVersionLabel}` : `New ${nextVersionLabel}`}</span>
          </div>
          {changes.length > 0 ? (
            <PlatformButtonSelector
              mode="popup"
              buttonVariant="secondary"
              buttonSize="small"
              label={activeChange?.label || changes[0].label}
              popupAriaLabel="Select changed file"
              popupAlignment="right"
              popupRole="menu"
              popupVariant="minimal"
              popupWidth={220}
              popupMaxWidth="min(320px, calc(100vw - 32px))"
              closeOnSelect
              className="platform-version-save-dialog__file-selector"
              popupClassName="platform-version-save-dialog__file-selector-popup"
            >
              {changes.map((change) => {
                const selected = change.id === activeChange?.id;
                return (
                  <button
                    key={change.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`tb-popup-row platform-version-save-dialog__file-option${
                      selected ? " is-selected" : ""
                    }`}
                    onClick={() => setActiveChangeId(change.id)}
                  >
                    <span
                      className="platform-version-save-dialog__file-option-check"
                      aria-hidden="true"
                    >
                      {selected ? <Check width={13} height={13} strokeWidth={1.8} /> : null}
                    </span>
                    <span className="platform-version-save-dialog__file-option-label">
                      {change.label}
                    </span>
                  </button>
                );
              })}
            </PlatformButtonSelector>
          ) : null}
        </div>
        {changes.length > 0 ? (
          <div
            className="platform-version-save-dialog__change-content"
            role="region"
            aria-label={typeof activeChange?.label === "string" ? activeChange.label : "Version changes"}
          >
            {activeChange?.content}
          </div>
        ) : (
          <div className="platform-version-save-dialog__empty-changes">{emptyChanges}</div>
        )}
      </section>

      <div className="platform-version-save-dialog__description-field">
        <PlatformInstructionsEditor
          value={descriptionByMode[mode]}
          onChange={(value) => {
            const normalizedValue = normalizeDescription(value);
            descriptionTouchedRef.current[mode] = true;
            setDescriptionByMode((current) => ({
              ...current,
              [mode]: normalizedValue,
            }));
          }}
          title={descriptionLabel}
          placeholder={descriptionPlaceholder}
          ariaLabel={descriptionAriaLabel}
          readOnly={isPending}
          stickyHeader={false}
          historyKey={`${String(instanceKey ?? "version-save")}:${mode}`}
          variant="minimalistic-ui"
          className="platform-version-save-dialog__description-editor"
        />
        <span className="platform-version-save-dialog__character-count" aria-hidden="true">
          {descriptionByMode[mode].length}/240
        </span>
      </div>

      {displayedError ? (
        <div className="platform-version-save-dialog__error" role="alert">
          {displayedError}
        </div>
      ) : null}
    </PlatformModal>
  );
}
