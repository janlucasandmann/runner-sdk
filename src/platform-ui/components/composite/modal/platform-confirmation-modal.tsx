import { useEffect, useRef, useState, type ReactNode } from "react";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformModal, type PlatformModalCloseReason } from "./platform-modal.js";

export type PlatformConfirmationModalTone = "default" | "destructive";

export interface PlatformConfirmationModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  confirmingLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: PlatformConfirmationModalTone;
  errorFallback?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function PlatformConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmingLabel = "Working...",
  cancelLabel = "Cancel",
  tone = "default",
  errorFallback = "The action could not be completed.",
  onCancel,
  onConfirm,
}: PlatformConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) return;
    setPending(false);
    setErrorMessage("");
  }, [open]);

  const handleClose = (_reason: PlatformModalCloseReason) => {
    if (!pending) onCancel();
  };

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    setErrorMessage("");
    try {
      await onConfirm();
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message ? error.message : errorFallback);
    } finally {
      setPending(false);
    }
  };

  return (
    <PlatformModal
      open={open}
      title={title}
      description={description}
      onClose={handleClose}
      role="alertdialog"
      size="small"
      className="platform-confirmation-modal"
      closeButtonLabel="Close confirmation dialog"
      closeButtonDisabled={pending}
      closeOnBackdrop={!pending}
      closeOnEscape={!pending}
      initialFocusRef={cancelButtonRef}
      showBody={Boolean(errorMessage)}
      bodyClassName="platform-confirmation-modal__body"
      footer={
        <>
          <PlatformSecondaryButton
            ref={cancelButtonRef}
            size="medium"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="medium"
            className={tone === "destructive" ? "is-destructive" : ""}
            onClick={() => void handleConfirm()}
            disabled={pending}
          >
            {pending ? confirmingLabel : confirmLabel}
          </PlatformPrimaryButton>
        </>
      }
    >
      {errorMessage ? (
        <p className="platform-confirmation-modal__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </PlatformModal>
  );
}
