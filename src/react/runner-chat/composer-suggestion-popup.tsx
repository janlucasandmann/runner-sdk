import { useEffect, useRef, type ReactNode } from "react";
import {
  PlatformPopupSurface,
  type PlatformPopupAnimation,
} from "../../platform-ui/components/composite/popup/index.js";
import {
  renderComposerPopupPortal,
  useComposerAnchoredPopupStyle,
  type ComposerPopupAnchorRef,
} from "./composer-popup.js";

export type RunnerComposerSuggestionPopupPlacement = "top" | "bottom";

export interface RunnerComposerSuggestionPopupProps {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  emptyState?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  activeIndex?: number;
  keyboardNavigation?: boolean;
  placement?: RunnerComposerSuggestionPopupPlacement;
  portal?: boolean;
  anchorRef?: ComposerPopupAnchorRef;
  role?: "listbox" | "dialog";
}

/** Shared composer popup surface used by slash commands and connector mentions. */
export function RunnerComposerSuggestionPopup({
  ariaLabel,
  children,
  className = "",
  emptyState,
  footer,
  header,
  activeIndex = -1,
  keyboardNavigation = false,
  placement = "top",
  portal = false,
  anchorRef,
  role = "listbox",
}: RunnerComposerSuggestionPopupProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const portalStyle = useComposerAnchoredPopupStyle({
    open: portal && Boolean(anchorRef?.current),
    anchorRef: anchorRef || surfaceRef,
    popupRef: surfaceRef,
    placement: placement === "top" ? "above-start" : "below-start",
    matchAnchorWidth: true,
  });
  const animation: PlatformPopupAnimation = placement === "top" ? "up-in" : "down-in";
  const resolvedClassName = [
    "tb-popup-menu-main",
    "tb-composer-suggestion-popup",
    `is-placement-${placement}`,
    className,
  ].filter(Boolean).join(" ");

  useEffect(() => {
    if (!keyboardNavigation || !surfaceRef.current || !Number.isFinite(activeIndex)) {
      return;
    }
    const buttons = Array.from(
      surfaceRef.current.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled):not([data-popup-navigation-ignore])",
      ),
    );
    const activeButton = buttons[Math.max(0, Math.min(activeIndex, buttons.length - 1))];
    const scrollContainer = surfaceRef.current.querySelector<HTMLElement>(
      ".tb-composer-suggestion-popup-list",
    );
    if (!activeButton || !scrollContainer || !scrollContainer.contains(activeButton)) {
      return;
    }
    const containerRect = scrollContainer.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    if (buttonRect.top < containerRect.top || buttonRect.bottom > containerRect.bottom) {
      activeButton.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIndex, children, emptyState, header, keyboardNavigation]);

  const content = (
    <PlatformPopupSurface
      ref={surfaceRef}
      className={resolvedClassName}
      animation={animation}
      variant="minimal"
      role={role}
      aria-label={ariaLabel}
      data-composer-suggestion-placement={placement}
    >
      {header}
      <div className="tb-composer-suggestion-popup-list">
        {emptyState || children}
      </div>
      {footer}
    </PlatformPopupSurface>
  );
  return portal && anchorRef
    ? renderComposerPopupPortal(content, portalStyle)
    : content;
}
