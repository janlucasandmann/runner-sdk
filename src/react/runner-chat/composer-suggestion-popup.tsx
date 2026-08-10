import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import {
  PlatformPopupSurface,
  type PlatformPopupAnimation,
} from "../../platform-ui/components/composite/popup/index.js";

export type RunnerComposerSuggestionPopupPlacement = "top" | "bottom";

export interface RunnerComposerSuggestionPopupProps {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  emptyState?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  keyboardNavigation?: boolean;
  placement?: RunnerComposerSuggestionPopupPlacement;
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
  keyboardNavigation = false,
  placement = "top",
  role = "listbox",
}: RunnerComposerSuggestionPopupProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const animation: PlatformPopupAnimation = placement === "top" ? "up-in" : "down-in";
  const resolvedClassName = [
    "tb-popup-menu-main",
    "tb-composer-suggestion-popup",
    `is-placement-${placement}`,
    className,
  ].filter(Boolean).join(" ");

  useEffect(() => {
    if (!keyboardNavigation) {
      return undefined;
    }
    let frameId = 0;
    const focusFirst = () => {
      const firstButton = surfaceRef.current?.querySelector<HTMLButtonElement>(
        "button:not(:disabled)",
      );
      firstButton?.focus({ preventScroll: true });
    };
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      frameId = window.requestAnimationFrame(focusFirst);
    } else {
      focusFirst();
    }
    return () => {
      if (frameId && typeof window !== "undefined") {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [children, emptyState, header, keyboardNavigation]);

  function handleKeyboardNavigation(event: KeyboardEvent<HTMLDivElement>) {
    if (!keyboardNavigation || !surfaceRef.current) {
      return;
    }
    const buttons = Array.from(
      surfaceRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
    );
    if (buttons.length === 0) {
      return;
    }
    const activeIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = activeIndex < 0
        ? (direction > 0 ? 0 : buttons.length - 1)
        : (activeIndex + direction + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus({ preventScroll: true });
      return;
    }
    if (event.key === "Enter") {
      const activeButton = document.activeElement instanceof HTMLButtonElement
        && surfaceRef.current.contains(document.activeElement)
        ? document.activeElement
        : null;
      if (activeButton) {
        event.preventDefault();
        event.stopPropagation();
        activeButton.click();
      }
    }
  }

  return (
    <PlatformPopupSurface
      ref={surfaceRef}
      className={resolvedClassName}
      animation={animation}
      variant="minimal"
      role={role}
      aria-label={ariaLabel}
      data-composer-suggestion-placement={placement}
      onKeyDown={handleKeyboardNavigation}
    >
      {header}
      <div className="tb-composer-suggestion-popup-list">
        {emptyState || children}
      </div>
      {footer}
    </PlatformPopupSurface>
  );
}
