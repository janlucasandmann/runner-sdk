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
  secondaryActionLabel?: ReactNode;
  secondaryActionPendingLabel?: ReactNode;
  cancelLabel?: ReactNode;
  tone?: PlatformConfirmationModalTone;
  errorFallback?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  onSecondaryAction?: () => void | Promise<void>;
}

export function PlatformConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmingLabel = "Working...",
  secondaryActionLabel,
  secondaryActionPendingLabel = "Working...",
  cancelLabel = "Cancel",
  tone = "default",
  errorFallback = "The action could not be completed.",
  onCancel,
  onConfirm,
  onSecondaryAction,
}: PlatformConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const [pendingAction, setPendingAction] = useState<"confirm" | "secondary" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const pending = pendingAction !== null;

  useEffect(() => {
    if (open) return;
    setPendingAction(null);
    setErrorMessage("");
  }, [open]);

  const handleClose = (_reason: PlatformModalCloseReason) => {
    if (!pending) onCancel();
  };

  const handleAction = async (
    action: "confirm" | "secondary",
    invoke: () => void | Promise<void>,
  ) => {
    if (pending) return;
    setPendingAction(action);
    setErrorMessage("");
    try {
      await invoke();
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message ? error.message : errorFallback);
    } finally {
      setPendingAction(null);
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
          {onSecondaryAction ? (
            <PlatformSecondaryButton
              size="medium"
              onClick={() => void handleAction("secondary", onSecondaryAction)}
              disabled={pending}
            >
              {pendingAction === "secondary"
                ? secondaryActionPendingLabel
                : secondaryActionLabel}
            </PlatformSecondaryButton>
          ) : null}
          <PlatformPrimaryButton
            size="medium"
            className={tone === "destructive" ? "is-destructive" : ""}
            onClick={() => void handleAction("confirm", onConfirm)}
            disabled={pending}
          >
            {pendingAction === "confirm" ? confirmingLabel : confirmLabel}
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
