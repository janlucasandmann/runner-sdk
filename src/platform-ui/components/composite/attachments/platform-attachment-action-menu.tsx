import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EllipsisVertical, Pencil, Trash2 } from "../../ui/hugeicons-compat.js";

import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../ui/button/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformModal } from "../modal/index.js";
import {
  PlatformPopup,
  type PlatformPopupAnchorPoint,
} from "../popup/index.js";

export interface PlatformAttachmentActionMenuProps {
  name: string;
  onRename?: (nextName: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  triggerLabel?: string;
}

export interface PlatformAttachmentActionMenuHandle {
  openAt: (point: PlatformPopupAnchorPoint) => void;
  close: () => void;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformAttachmentActionMenu = forwardRef<
  PlatformAttachmentActionMenuHandle,
  PlatformAttachmentActionMenuProps
>(function PlatformAttachmentActionMenu(
  {
    name,
    onRename,
    onDelete,
    disabled = false,
    className = "",
    triggerLabel = `More actions for ${name}`,
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const renameInputId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorPoint, setMenuAnchorPoint] =
    useState<PlatformPopupAnchorPoint | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState(name);
  const [renamePending, setRenamePending] = useState(false);
  const [renameError, setRenameError] = useState("");

  useEffect(() => {
    if (renameOpen) return;
    setRenameDraft(name);
    setRenameError("");
  }, [name, renameOpen]);

  useEffect(() => {
    if (!menuOpen || typeof window === "undefined") return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      setMenuOpen(false);
      setMenuAnchorPoint(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMenuAnchorPoint(null);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      openAt: (point) => {
        if (disabled || (!onRename && !onDelete)) return;
        setMenuAnchorPoint(point);
        setMenuOpen(true);
      },
      close: () => {
        setMenuOpen(false);
        setMenuAnchorPoint(null);
      },
    }),
    [disabled, onDelete, onRename],
  );

  if (!onRename && !onDelete) return null;

  const openRenameDialog = () => {
    setMenuOpen(false);
    setMenuAnchorPoint(null);
    setRenameDraft(name);
    setRenameError("");
    setRenameOpen(true);
  };

  const saveRename = async () => {
    const nextName = renameDraft.trim();
    if (!nextName) {
      setRenameError("Enter a file name.");
      return;
    }
    if (!onRename || nextName === name) {
      setRenameOpen(false);
      return;
    }
    setRenamePending(true);
    setRenameError("");
    try {
      await onRename(nextName);
      setRenameOpen(false);
    } catch (error) {
      setRenameError(error instanceof Error && error.message ? error.message : "The attachment could not be renamed.");
    } finally {
      setRenamePending(false);
    }
  };

  return (
    <>
      <PlatformPopup
        open={menuOpen}
        rootRef={rootRef}
        surfaceRef={surfaceRef}
        rootClassName={joinClassNames("platform-attachment-actions", className)}
        surfaceClassName="platform-attachment-actions__popup"
        surfaceProps={{
          role: "menu",
          "aria-label": `${name} actions`,
          width: 160,
        }}
        variant="minimal"
        portal
        placement={menuAnchorPoint ? "bottom-start" : "bottom-end"}
        portalAnchorPoint={menuAnchorPoint}
        portalOffset={menuAnchorPoint ? 0 : 8}
        trigger={(
          <PlatformIconButton
            type="button"
            size="compact"
            aria-label={triggerLabel}
            disabled={disabled}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onMouseDown={() => setMenuAnchorPoint(null)}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
          >
            <EllipsisVertical aria-hidden="true" strokeWidth={1.8} />
          </PlatformIconButton>
        )}
      >
        {onRename ? (
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            onClick={(event) => {
              event.stopPropagation();
              openRenameDialog();
            }}
          >
            <Pencil className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
            <span className="tb-popup-label">Rename</span>
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen(false);
              setMenuAnchorPoint(null);
              void onDelete();
            }}
          >
            <Trash2 className="tb-popup-icon" aria-hidden="true" strokeWidth={1.8} />
            <span className="tb-popup-label">Delete</span>
          </button>
        ) : null}
      </PlatformPopup>

      <PlatformModal
        open={renameOpen}
        title="Rename Attachment"
        size="small"
        className="platform-attachment-rename-modal"
        initialFocusRef={renameInputRef}
        closeButtonDisabled={renamePending}
        closeOnBackdrop={!renamePending}
        closeOnEscape={!renamePending}
        onClose={() => {
          if (!renamePending) setRenameOpen(false);
        }}
        footer={(
          <>
            <PlatformSecondaryButton
              type="button"
              size="medium"
              disabled={renamePending}
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              type="button"
              size="medium"
              disabled={renamePending || !renameDraft.trim() || renameDraft.trim() === name}
              onClick={() => void saveRename()}
            >
              {renamePending ? "Renaming..." : "Rename"}
            </PlatformPrimaryButton>
          </>
        )}
      >
        <form
          className="platform-attachment-rename-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            void saveRename();
          }}
        >
          <label className="platform-attachment-rename-modal__label" htmlFor={renameInputId}>
            File name
          </label>
          <input
            id={renameInputId}
            ref={renameInputRef}
            className="platform-attachment-rename-modal__input"
            value={renameDraft}
            disabled={renamePending}
            onChange={(event) => setRenameDraft(event.target.value)}
          />
          {renameError ? (
            <p className="platform-attachment-rename-modal__error" role="alert">{renameError}</p>
          ) : null}
        </form>
      </PlatformModal>
    </>
  );
});
