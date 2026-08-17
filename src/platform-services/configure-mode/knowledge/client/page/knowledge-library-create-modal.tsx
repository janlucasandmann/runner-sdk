import { LibraryBig, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import type { KnowledgeLibrary, KnowledgeLibraryCreateInput } from "../domain/index.js";

export interface KnowledgeLibraryCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: KnowledgeLibraryCreateInput) => Promise<KnowledgeLibrary>;
}

export function KnowledgeLibraryCreateModal({
  open,
  onClose,
  onCreate,
}: KnowledgeLibraryCreateModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setSubmitting(false);
    setError("");
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Enter a library name.");
      nameRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        name: normalizedName,
        description: description.trim(),
        homeTitle: "Home",
        homeMarkdown: `# ${normalizedName}\n\n`,
      });
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the library.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PlatformModal
      open={open}
      title="New Knowledge Library"
      description="Create a shared, versioned source of truth for people and agents."
      as="form"
      size="medium"
      initialFocusRef={nameRef}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={() => {
        if (!submitting) onClose();
      }}
      className="knowledge-create-modal"
      surfaceProps={{ onSubmit: submit }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={onClose}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={submitting || !name.trim()}
          >
            {submitting ? <Loader2 className="knowledge-spin" width={14} height={14} /> : <LibraryBig width={14} height={14} />}
            {submitting ? "Creating…" : "Create Library"}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <div className="knowledge-form-grid">
        <label className="knowledge-form-field">
          <span>Name</span>
          <input
            ref={nameRef}
            value={name}
            maxLength={500}
            placeholder="Engineering handbook"
            disabled={submitting}
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <label className="knowledge-form-field">
          <span>Description</span>
          <textarea
            value={description}
            rows={3}
            maxLength={10_000}
            placeholder="Conventions, operating procedures, and accumulated project knowledge."
            disabled={submitting}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>
      </div>
      {error ? <p className="knowledge-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}

