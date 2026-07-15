import { createElement, isValidElement, useId, useRef, type ElementType, type KeyboardEvent, type ReactNode } from "react";

export type PlatformDetailTabIcon = ElementType | ReactNode;

export interface PlatformDetailTab<TValue extends string = string> {
  id: TValue;
  label: ReactNode;
  icon?: PlatformDetailTabIcon;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface PlatformDetailTabBarProps<TValue extends string = string> {
  tabs: readonly PlatformDetailTab<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  ariaLabel?: string;
  panelId?: string;
  className?: string;
}

function renderTabIcon(icon: PlatformDetailTabIcon | undefined) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  if (typeof icon === "string" || typeof icon === "number") return icon;
  return createElement(icon as ElementType, {
    className: "platform-detail-tab-bar__icon",
    width: 13,
    height: 13,
    strokeWidth: 1.7,
    "aria-hidden": true,
  });
}

export function PlatformDetailTabBar<TValue extends string = string>({
  tabs,
  value,
  onValueChange,
  ariaLabel = "Details",
  panelId,
  className = "",
}: PlatformDetailTabBarProps<TValue>) {
  const generatedId = useId().replace(/:/g, "");
  const buttonRefs = useRef(new Map<TValue, HTMLButtonElement>());
  const enabledTabs = tabs.filter((tab) => !tab.disabled);

  const moveToTab = (currentId: TValue, direction: "previous" | "next" | "first" | "last") => {
    if (!enabledTabs.length) return;
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === currentId);
    let nextIndex = currentIndex < 0 ? 0 : currentIndex;
    if (direction === "first") nextIndex = 0;
    if (direction === "last") nextIndex = enabledTabs.length - 1;
    if (direction === "previous") nextIndex = (nextIndex - 1 + enabledTabs.length) % enabledTabs.length;
    if (direction === "next") nextIndex = (nextIndex + 1) % enabledTabs.length;
    const nextTab = enabledTabs[nextIndex];
    if (!nextTab) return;
    onValueChange(nextTab.id);
    buttonRefs.current.get(nextTab.id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: TValue) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveToTab(tabId, "previous");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveToTab(tabId, "next");
    } else if (event.key === "Home") {
      event.preventDefault();
      moveToTab(tabId, "first");
    } else if (event.key === "End") {
      event.preventDefault();
      moveToTab(tabId, "last");
    }
  };

  return (
    <nav
      className={`platform-detail-tab-bar${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      data-platform-detail-tab-bar="true"
    >
      <div className="platform-detail-tab-bar__list" role="tablist" aria-orientation="horizontal">
        {tabs.map((tab) => {
          const active = tab.id === value;
          const tabId = `platform-detail-tab-${generatedId}-${tab.id}`;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                if (node) buttonRefs.current.set(tab.id, node);
                else buttonRefs.current.delete(tab.id);
              }}
              id={tabId}
              type="button"
              role="tab"
              className={`platform-detail-tab-bar__tab${active ? " is-active" : ""}`}
              aria-label={tab.ariaLabel}
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onValueChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, tab.id)}
            >
              {renderTabIcon(tab.icon)}
              <span className="platform-detail-tab-bar__label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
