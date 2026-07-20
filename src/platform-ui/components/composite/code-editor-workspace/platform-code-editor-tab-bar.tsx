import { X } from "lucide-react";
import {
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface PlatformCodeEditorTab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  dirty?: boolean;
  closable?: boolean;
  ariaLabel?: string;
}

export interface PlatformCodeEditorTabBarProps {
  tabs: readonly PlatformCodeEditorTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  ariaLabel?: string;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getTabAccessibleLabel(tab: PlatformCodeEditorTab) {
  if (tab.ariaLabel) return tab.ariaLabel;
  return typeof tab.label === "string" ? tab.label : tab.id;
}

export function PlatformCodeEditorTabBar({
  tabs,
  activeTabId = "",
  onTabSelect,
  onTabClose,
  ariaLabel = "Open files",
  className = "",
}: PlatformCodeEditorTabBarProps) {
  const generatedId = useId().replace(/:/g, "");
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  const keyboardTabId = activeTabIndex >= 0 ? activeTabId : tabs[0]?.id;

  const moveToTab = (
    currentTabId: string,
    direction: "previous" | "next" | "first" | "last",
  ) => {
    if (!tabs.length) return;
    const currentIndex = Math.max(0, tabs.findIndex((tab) => tab.id === currentTabId));
    let nextIndex = currentIndex;
    if (direction === "first") nextIndex = 0;
    if (direction === "last") nextIndex = tabs.length - 1;
    if (direction === "previous") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (direction === "next") nextIndex = (currentIndex + 1) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;
    onTabSelect?.(nextTab.id);
    tabRefs.current.get(nextTab.id)?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: string) => {
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

  const handleTabAuxClick = (event: MouseEvent<HTMLDivElement>, tab: PlatformCodeEditorTab) => {
    if (event.button !== 1 || tab.closable === false) return;
    event.preventDefault();
    onTabClose?.(tab.id);
  };

  return (
    <div
      className={joinClassNames("platform-code-editor-tab-bar", className)}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      data-platform-code-editor-tab-bar="true"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isClosable = tab.closable !== false;
        const accessibleLabel = getTabAccessibleLabel(tab);
        const tabId = `platform-code-editor-tab-${generatedId}-${tab.id}`;
        return (
          <div
            key={tab.id}
            className={joinClassNames(
              "platform-code-editor-tab-bar__item",
              isActive && "is-active",
              tab.dirty && "is-dirty",
            )}
            onAuxClick={(event) => handleTabAuxClick(event, tab)}
          >
            <button
              ref={(node) => {
                if (node) tabRefs.current.set(tab.id, node);
                else tabRefs.current.delete(tab.id);
              }}
              id={tabId}
              type="button"
              role="tab"
              className="platform-code-editor-tab-bar__tab"
              aria-label={accessibleLabel}
              aria-selected={isActive}
              tabIndex={tab.id === keyboardTabId ? 0 : -1}
              onClick={() => onTabSelect?.(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
            >
              {tab.icon ? (
                <span className="platform-code-editor-tab-bar__icon" aria-hidden="true">
                  {tab.icon}
                </span>
              ) : null}
              <span className="platform-code-editor-tab-bar__label">{tab.label}</span>
            </button>
            {isClosable ? (
              <button
                type="button"
                className="platform-code-editor-tab-bar__close"
                aria-label={`Close ${accessibleLabel}`}
                title={`Close ${accessibleLabel}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onTabClose?.(tab.id);
                }}
              >
                <span className="platform-code-editor-tab-bar__dirty-dot" aria-hidden="true" />
                <X className="platform-code-editor-tab-bar__close-icon" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
