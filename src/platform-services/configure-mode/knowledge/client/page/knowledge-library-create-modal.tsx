import { LibraryBig, Loader2 } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
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
  const canCreate = !submitting && Boolean(name.trim());

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
      headerVariant="search"
      headerSearchProps={{
        inputRef: nameRef,
        icon: LibraryBig,
        value: name,
        maxLength: 500,
        placeholder: "Knowledge library name",
        "aria-label": "Knowledge library name",
        autoComplete: "off",
        disabled: submitting,
        onChange: (event) => setName(event.currentTarget.value),
      }}
      as="form"
      size="medium"
      maxHeight="min(720px, calc(100vh - 48px))"
      scrollable
      initialFocusRef={nameRef}
      closeOnBackdrop={!submitting}
      closeOnEscape={!submitting}
      closeButtonDisabled={submitting}
      onClose={() => {
        if (!submitting) onClose();
      }}
      className="knowledge-create-modal"
      bodyClassName="knowledge-create-modal__body"
      footerClassName="knowledge-create-modal__footer"
      surfaceProps={{
        onSubmit: submit,
        onKeyDown: (event) => {
          if (
            (event.metaKey || event.ctrlKey)
            && event.key === "Enter"
            && canCreate
          ) {
            event.preventDefault();
            (event.currentTarget as HTMLFormElement).requestSubmit();
          }
        },
      }}
      footer={(
        <>
          <PlatformSecondaryButton size="medium" disabled={submitting} onClick={onClose}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            type="submit"
            disabled={!canCreate}
          >
            {submitting ? <Loader2 className="knowledge-spin" width={14} height={14} /> : <LibraryBig width={14} height={14} />}
            {submitting ? "Creating…" : "Create Library"}
          </PlatformPrimaryButton>
        </>
      )}
    >
      <PlatformInstructionsEditor
        value={description}
        onChange={(nextDescription) => setDescription(nextDescription.slice(0, 10_000))}
        title="Description"
        placeholder="Conventions, operating procedures, and accumulated project knowledge."
        ariaLabel="Knowledge library description"
        readOnly={submitting}
        stickyHeader={false}
        historyKey="knowledge-library-create-description"
        variant="minimalistic-ui"
        contentVariant="text"
        className="knowledge-create-modal__description-editor"
      />
      {error ? <p className="knowledge-form-error" role="alert">{error}</p> : null}
    </PlatformModal>
  );
}
