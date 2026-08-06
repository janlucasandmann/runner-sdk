import { Bookmark, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";

export type TestPlanSaveOutcome = "draft" | "version" | "publish";

interface TestPlanSaveModalProps {
  open: boolean;
  planName: string;
  nextVersion: number;
  caseCount: number;
  hasPublishedVersion: boolean;
  busy?: boolean;
  error?: string;
  onClose: () => void;
  onSave: (input: {
    outcome: TestPlanSaveOutcome;
    description: string;
  }) => Promise<void> | void;
}

const OUTCOME_OPTIONS = [
  {
    value: "draft",
    label: "Save draft only",
    description: "Update the editable plan without creating an immutable version.",
  },
  {
    value: "version",
    label: "Create version",
    description: "Save the draft and retain a new immutable version without publishing it.",
  },
  {
    value: "publish",
    label: "Create and publish version",
    description: "Save, version, and make this exact snapshot available to new runs.",
  },
] as const;

export function TestPlanSaveModal({
  open,
  planName,
  nextVersion,
  caseCount,
  hasPublishedVersion,
  busy = false,
  error = "",
  onClose,
  onSave,
}: TestPlanSaveModalProps) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [outcome, setOutcome] = useState<TestPlanSaveOutcome>(
    hasPublishedVersion ? "version" : "publish",
  );
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setOutcome(hasPublishedVersion ? "version" : "publish");
    setDescription("");
  }, [hasPublishedVersion, open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    void onSave({ outcome, description: description.trim() });
  }

  function handleDescriptionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && !busy) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <PlatformModal
      open={open}
      title="Save test plan"
      as="form"
      size="medium"
      initialFocusRef={descriptionRef}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      closeButtonDisabled={busy}
      onClose={onClose}
      className="tests-plan-save-modal"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={busy} onClick={onClose}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton size="medium" type="submit" disabled={busy}>
            {busy ? (
              <Loader2 className="tests-spin" width={14} height={14} aria-hidden="true" />
            ) : (
              <Bookmark width={14} height={14} aria-hidden="true" />
            )}
            {outcome === "publish" ? "Save & Publish" : outcome === "version" ? "Save Version" : "Save Draft"}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="tests-plan-save-modal__summary">
        <strong>{planName}</strong>
        <span>{caseCount} {caseCount === 1 ? "case" : "cases"} · next version v{nextVersion}</span>
      </div>
      <div className="tests-form-field">
        <span>Save outcome</span>
        <PlatformSelector
          value={outcome}
          options={OUTCOME_OPTIONS}
          fullWidth
          ariaLabel="Test-plan save outcome"
          disabled={busy}
          onValueChange={setOutcome}
        />
      </div>
      <label className="tests-form-field">
        <span>Version notes {outcome === "draft" ? "(optional)" : ""}</span>
        <textarea
          ref={descriptionRef}
          value={description}
          rows={4}
          maxLength={10_000}
          placeholder="Describe what changed and why."
          disabled={busy}
          onChange={(event) => setDescription(event.currentTarget.value)}
          onKeyDown={handleDescriptionKeyDown}
        />
        <small className="tests-form-help">Press ⌘ Enter to save.</small>
      </label>
      {error ? <p className="tests-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
