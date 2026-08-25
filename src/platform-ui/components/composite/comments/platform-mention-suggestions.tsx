import { Bot, Loader2, Settings2, UserRound } from "lucide-react";

import {
  PlatformComposerSuggestionPopup,
  type PlatformComposerSuggestionPopupPlacement,
  type PlatformPopupAnchorRef,
} from "../popup/index.js";
import type { PlatformMentionOption } from "./platform-comment-types.js";

export interface PlatformMentionSuggestionsPopupProps {
  options: readonly PlatformMentionOption[];
  activeIndex: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  placement?: PlatformComposerSuggestionPopupPlacement;
  portal?: boolean;
  anchorRef?: PlatformPopupAnchorRef;
  manageLabel?: string;
  onManage?: () => void;
  onSelect: (option: PlatformMentionOption) => void;
  onActiveIndexChange?: (index: number) => void;
}

export function PlatformMentionSuggestionsPopup({
  options,
  activeIndex,
  loading = false,
  emptyMessage = "No people or agents found.",
  className = "",
  placement = "top",
  portal = false,
  anchorRef,
  manageLabel = "Manage Access",
  onManage,
  onSelect,
  onActiveIndexChange,
}: PlatformMentionSuggestionsPopupProps) {
  const emptyState = loading ? (
    <div className="platform-mention-suggestions__empty">
      <Loader2 className="platform-mention-suggestions__spinner" width={14} height={14} aria-hidden="true" />
      <span>Loading people and agents…</span>
    </div>
  ) : !options.length ? (
    <div className="platform-mention-suggestions__empty">{emptyMessage}</div>
  ) : undefined;

  return (
    <PlatformComposerSuggestionPopup
      ariaLabel="Mention people or agents"
      activeIndex={activeIndex}
      keyboardNavigation
      placement={placement}
      portal={portal}
      anchorRef={anchorRef}
      emptyState={emptyState}
      footer={onManage ? (
        <button
          type="button"
          className="tb-connector-mention-manage"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onManage}
        >
          <Settings2 strokeWidth={1.7} aria-hidden="true" />
          <span>{manageLabel}</span>
        </button>
      ) : null}
      className={`tb-popup-menu-connector-mention platform-mention-suggestions${className ? ` ${className}` : ""}`}
    >
      {options.map((option, index) => (
        <button
          key={`${option.kind}:${option.id}`}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={`tb-popup-row tb-connector-mention-row platform-mention-suggestions__option${index === activeIndex ? " is-active" : ""}`}
          // A stationary pointer must not override ArrowUp/ArrowDown. Using
          // movement rather than enter also avoids re-selecting whichever row
          // happens to be under the cursor when the popup scrolls.
          onPointerMove={() => onActiveIndexChange?.(index)}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(option);
          }}
        >
          <span className="platform-mention-suggestions__avatar" aria-hidden="true">
            {option.avatar || (option.kind === "agent"
              ? <Bot width={15} height={15} strokeWidth={1.8} />
              : <UserRound width={15} height={15} strokeWidth={1.8} />)}
          </span>
          <span className="platform-mention-suggestions__copy">
            <span className="platform-mention-suggestions__label">{option.label}</span>
          </span>
        </button>
      ))}
    </PlatformComposerSuggestionPopup>
  );
}
