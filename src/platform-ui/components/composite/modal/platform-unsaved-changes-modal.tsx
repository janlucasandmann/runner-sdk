import type { ReactNode } from "react";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../ui/button/index.js";
import {
  PlatformModal,
  PlatformModalFooter,
  type PlatformModalCloseReason,
} from "./platform-modal.js";

export interface PlatformUnsavedChangesModalProps {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  stayLabel?: string;
  leaveLabel?: string;
  onStay: () => void;
  onLeave: () => void;
}

export function PlatformUnsavedChangesModal({
  open,
  title = "Unsaved changes",
  description = "Your changes have not been saved. If you leave now, they will be lost.",
  stayLabel = "Stay on page",
  leaveLabel = "Leave without saving",
  onStay,
  onLeave,
}: PlatformUnsavedChangesModalProps) {
  const handleClose = (_reason: PlatformModalCloseReason) => {
    onStay();
  };

  return (
    <PlatformModal
      open={open}
      title={title}
      description={description}
      onClose={handleClose}
      role="alertdialog"
      size="small"
      className="platform-unsaved-changes-modal"
      closeButtonLabel="Close unsaved changes dialog"
    >
      <PlatformModalFooter>
        <PlatformSecondaryButton size="medium" onClick={onStay}>
          {stayLabel}
        </PlatformSecondaryButton>
        <PlatformPrimaryButton
          size="medium"
          className="is-destructive"
          onClick={onLeave}
        >
          {leaveLabel}
        </PlatformPrimaryButton>
      </PlatformModalFooter>
    </PlatformModal>
  );
}
