import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { PlatformPopup } from "../popup/index.js";
import type { InstructionsEditorToolbarMenuOption } from "./platform-instructions-editor-toolbar-popup.js";

export interface InstructionsEditorSlashCommandOption extends InstructionsEditorToolbarMenuOption {
  group: string;
  keywords?: string[];
}

export interface InstructionsEditorSlashMenuAnchor {
  left: number;
  top: number;
  bottom: number;
}

export interface InstructionsEditorSlashMenuProps {
  open: boolean;
  anchor: InstructionsEditorSlashMenuAnchor | null;
  options: InstructionsEditorSlashCommandOption[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (option: InstructionsEditorSlashCommandOption) => void;
  onDismiss: () => void;
}

const INSTRUCTIONS_EDITOR_SLASH_COMMAND_SHORTCUTS: Record<string, string> = {
  paragraph: "⌘ ⌥ 0",
  "heading-1": "⌘ ⌥ 1",
  "heading-2": "⌘ ⌥ 2",
  "heading-3": "⌘ ⌥ 3",
  "paragraph-quote": "⌘ ⇧ P",
  "block-quote": "⌘ ⇧ .",
  preformatted: "⌘ ⌥ C",
  bold: "⌘ B",
  italic: "⌘ I",
  underline: "⌘ U",
  "bullet-list": "⌘ ⇧ 8",
  "ordered-list": "⌘ ⇧ 7",
  "task-list": "⌘ ⇧ 9",
  code: "⌘ E",
  link: "⌘ K",
  image: "⌘ ⇧ I",
  table: "⇧ ⌥ T",
  divider: "⌘ ⇧ D",
};

export function filterInstructionsEditorSlashCommands(
  options: InstructionsEditorSlashCommandOption[],
  query: string,
) {
  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();
  if (!normalizedQuery) return options;
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return options.filter((option) => {
    const searchableText = [option.label, option.id, ...(option.keywords || [])]
      .join(" ")
      .toLowerCase();
    return queryTokens.every((token) => searchableText.includes(token));
  });
}

export function PlatformInstructionsEditorSlashMenu({
  open,
  anchor,
  options,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  onDismiss,
}: InstructionsEditorSlashMenuProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && surfaceRef.current?.contains(target))
        return;
      onDismiss();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss, open]);

  useEffect(() => {
    if (!open) return;
    const activeOption = surfaceRef.current?.querySelector<HTMLElement>(
      `[data-slash-command-index="${activeIndex}"]`,
    );
    if (typeof activeOption?.scrollIntoView === "function") {
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open, options]);

  const anchorStyle: CSSProperties = {
    position: "fixed",
    left: anchor?.left ?? 0,
    top: anchor?.top ?? 0,
    width: 1,
    height: Math.max(1, (anchor?.bottom ?? 0) - (anchor?.top ?? 0)),
    pointerEvents: "none",
  };

  const popup = (
    <PlatformPopup
      open={open && Boolean(anchor)}
      rootClassName="platform-instructions-editor__slash-anchor"
      rootProps={{ style: anchorStyle }}
      surfaceRef={surfaceRef}
      surfaceClassName="platform-instructions-editor__slash-popup"
      surfaceProps={{
        role: "menu",
        "aria-label": "Formatting commands",
        width: 280,
        maxHeight: "min(420px, calc(100vh - 24px))",
      }}
      animation="down-in"
      variant="minimal"
      portal
      placement="bottom-start"
      portalOffset={6}
      portalCollisionPadding={12}
      trigger={<span aria-hidden="true" />}
    >
      {options.length > 0 ? (
        options.map((option, index) => {
          const previousGroup = index > 0 ? options[index - 1]?.group : "";
          return (
            <Fragment key={option.id}>
              {index > 0 && previousGroup !== option.group ? (
                <div
                  className="platform-instructions-editor__slash-divider"
                  aria-hidden="true"
                />
              ) : null}
              <button
                type="button"
                role="menuitem"
                className={`tb-popup-row platform-instructions-editor__slash-option${index === activeIndex ? " is-selected" : ""}`}
                data-slash-command-index={index}
                title={option.title}
                disabled={option.disabled}
                onMouseEnter={() => onActiveIndexChange(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(option)}
              >
                <span className="tb-popup-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="tb-popup-label">{option.label}</span>
                <span
                  className="platform-instructions-editor__slash-shortcut"
                  aria-hidden="true"
                >
                  {INSTRUCTIONS_EDITOR_SLASH_COMMAND_SHORTCUTS[option.id]}
                </span>
              </button>
            </Fragment>
          );
        })
      ) : (
        <div className="platform-instructions-editor__slash-empty">
          No matching commands
        </div>
      )}
    </PlatformPopup>
  );

  return typeof document === "undefined"
    ? popup
    : createPortal(popup, document.body);
}
