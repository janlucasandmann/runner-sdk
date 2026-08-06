import { useEffect, useRef, useState } from "react";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformModal, type PlatformModalCloseReason } from "../modal/index.js";

export interface PlatformResourceRenameModalProps {
  open: boolean;
  resourceLabel: string;
  initialName: string;
  onClose: () => void;
  onRename: (name: string) => void | Promise<void>;
  busy?: boolean;
  error?: string;
  maxLength?: number;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
}

export function PlatformResourceRenameModal({
  open,
  resourceLabel,
  initialName,
  onClose,
  onRename,
  busy = false,
  error = "",
  maxLength = 160,
  portal = true,
  portalTarget,
}: PlatformResourceRenameModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(initialName);
  const normalizedResourceLabel = String(resourceLabel || "Resource").trim() || "Resource";
  const normalizedInitialName = String(initialName || "").trim();
  const normalizedName = name.trim();
  const canRename = Boolean(normalizedName && normalizedName !== normalizedInitialName && !busy);

  useEffect(() => {
    if (open) setName(initialName);
  }, [initialName, open]);

  const handleClose = (_reason?: PlatformModalCloseReason) => {
    if (!busy) onClose();
  };

  return (
    <PlatformModal
      open={open}
      title={`Rename ${normalizedResourceLabel}`}
      ariaLabel={`Rename ${normalizedResourceLabel.toLowerCase()}`}
      onClose={handleClose}
      as="form"
      size="small"
      portal={portal}
      portalTarget={portalTarget}
      className="platform-resource-rename-modal"
      bodyClassName="platform-resource-rename-modal__body"
      footerClassName="platform-resource-rename-modal__footer"
      closeButtonDisabled={busy}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      initialFocusRef={inputRef}
      surfaceProps={{
        onSubmit: (event) => {
          event.preventDefault();
          if (canRename) void onRename(normalizedName);
        },
      }}
      footer={
        <>
          <PlatformSecondaryButton type="button" size="medium" onClick={onClose} disabled={busy}>
            Cancel
          </PlatformSecondaryButton>
          <PlatformPrimaryButton type="submit" size="medium" disabled={!canRename}>
            {busy ? "Renaming…" : "Rename"}
          </PlatformPrimaryButton>
        </>
      }
    >
      <label className="platform-resource-rename-modal__field">
        <span>Name</span>
        <input
          ref={inputRef}
          value={name}
          maxLength={maxLength}
          autoComplete="off"
          aria-label={`New ${normalizedResourceLabel.toLowerCase()} name`}
          disabled={busy}
          onChange={(event) => setName(event.currentTarget.value)}
        />
      </label>
      {error ? (
        <p className="platform-resource-action-modal__error" role="alert">
          {error}
        </p>
      ) : null}
    </PlatformModal>
  );
}
