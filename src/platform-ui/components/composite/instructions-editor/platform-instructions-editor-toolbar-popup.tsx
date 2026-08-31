import { Check } from "../../ui/hugeicons-compat.js";
import { Fragment, type ReactNode, useEffect, useId, useRef } from "react";

import { PlatformPopup, type PlatformPopupAnchorPoint } from "../popup/index.js";

export interface InstructionsEditorToolbarMenuOption {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  separatorBefore?: boolean;
}

export interface InstructionsEditorToolbarPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  trigger: ReactNode;
  options?: InstructionsEditorToolbarMenuOption[];
  children?: ReactNode;
  triggerClassName?: string;
  popupClassName?: string;
  popupWidth?: number;
  onTriggerMouseDown?: () => void;
  anchorPoint?: PlatformPopupAnchorPoint | null;
}

export function InstructionsEditorToolbarPopup({
  open,
  onOpenChange,
  label,
  trigger,
  options = [],
  children,
  triggerClassName = "",
  popupClassName = "",
  popupWidth = 190,
  onTriggerMouseDown,
  anchorPoint = null,
}: InstructionsEditorToolbarPopupProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const menuId = `platform-instructions-toolbar-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      const targetElement = target instanceof Element ? target : target.parentElement;
      if (targetElement?.closest("[data-platform-popup-submenu='true']")) return;
      onOpenChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenChange, open]);

  return (
    <PlatformPopup
      open={open}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName="platform-instructions-editor__toolbar-menu"
      surfaceClassName={`platform-instructions-editor__toolbar-popup${popupClassName ? ` ${popupClassName}` : ""}`}
      surfaceProps={{
        id: menuId,
        role: "menu",
        "aria-label": label,
        width: popupWidth,
      }}
      variant="minimal"
      portal
      placement={anchorPoint ? "bottom-start" : "bottom-end"}
      portalAnchorPoint={anchorPoint}
      portalOffset={anchorPoint ? 0 : 8}
      trigger={
        <button
          type="button"
          className={`platform-instructions-editor__toolbar-button platform-instructions-editor__toolbar-menu-trigger playground-tasks-detail-format-button${open ? " is-active" : ""}${triggerClassName ? ` ${triggerClassName}` : ""}`}
          title={label}
          aria-label={label}
          aria-haspopup="menu"
          aria-controls={open ? menuId : undefined}
          aria-expanded={open}
          onMouseDown={(event) => {
            event.preventDefault();
            onTriggerMouseDown?.();
          }}
          onClick={() => {
            onTriggerMouseDown?.();
            onOpenChange(!open);
          }}
        >
          {trigger}
        </button>
      }
    >
      {children ??
        options.map((option) => (
          <Fragment key={option.id}>
            {option.separatorBefore ? (
              <hr className="platform-instructions-editor__toolbar-popup-divider" />
            ) : null}
            <button
              type="button"
              role="menuitem"
              className={`tb-popup-row platform-instructions-editor__toolbar-popup-option${option.active ? " selected is-selected" : ""}`}
              title={option.title}
              disabled={option.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onOpenChange(false);
                option.onSelect();
              }}
            >
              <span className="tb-popup-icon" aria-hidden="true">
                {option.icon}
              </span>
              <span className="tb-popup-label">{option.label}</span>
              <span className="tb-popup-check-slot" aria-hidden="true">
                {option.active ? <Check width={13} height={13} strokeWidth={1.8} /> : null}
              </span>
            </button>
          </Fragment>
        ))}
    </PlatformPopup>
  );
}
