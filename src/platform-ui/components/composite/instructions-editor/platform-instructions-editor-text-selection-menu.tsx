import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Pilcrow,
  Quote,
  SquareCode,
  TextQuote,
  Type as TypeIcon,
  Underline,
} from "../../ui/hugeicons-compat.js";
import type { MouseEvent, ReactNode } from "react";

import { type PlatformPopupAnchorPoint, PlatformPopupSubmenu } from "../popup/index.js";
import type { PlatformInstructionsEditorTextAlignment } from "./platform-instructions-editor-text-alignment.js";
import { InstructionsEditorToolbarPopup } from "./platform-instructions-editor-toolbar-popup.js";

export type PlatformInstructionsEditorSelectionBlockType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "paragraph-quote"
  | "block-quote"
  | "preformatted"
  | "bullet-list"
  | "ordered-list"
  | "task-list"
  | "multiple";

interface SelectionBlockTypeOption {
  id: Exclude<PlatformInstructionsEditorSelectionBlockType, "multiple">;
  label: string;
}

const SELECTION_BLOCK_TYPE_OPTIONS: readonly SelectionBlockTypeOption[] = [
  { id: "paragraph", label: "Normal text" },
  { id: "heading-1", label: "Heading 1" },
  { id: "heading-2", label: "Heading 2" },
  { id: "heading-3", label: "Heading 3" },
  { id: "bullet-list", label: "Bulleted list" },
  { id: "ordered-list", label: "Numbered list" },
  { id: "task-list", label: "Checklist" },
  { id: "paragraph-quote", label: "Paragraph quote" },
  { id: "block-quote", label: "Block quote" },
  { id: "preformatted", label: "Preformatted" },
];

function renderSelectionBlockTypeIcon(
  blockType: PlatformInstructionsEditorSelectionBlockType,
): ReactNode {
  const iconProps = { width: 15, height: 15, strokeWidth: 1.8 };
  if (blockType === "heading-1") return <Heading1 {...iconProps} />;
  if (blockType === "heading-2") return <Heading2 {...iconProps} />;
  if (blockType === "heading-3") return <Heading3 {...iconProps} />;
  if (blockType === "bullet-list") return <List {...iconProps} />;
  if (blockType === "ordered-list") return <ListOrdered {...iconProps} />;
  if (blockType === "task-list") return <ListTodo {...iconProps} />;
  if (blockType === "paragraph-quote") return <TextQuote {...iconProps} />;
  if (blockType === "block-quote") return <Quote {...iconProps} />;
  if (blockType === "preformatted") return <SquareCode {...iconProps} />;
  if (blockType === "paragraph") return <TypeIcon {...iconProps} />;
  return <Pilcrow {...iconProps} />;
}

function getSelectionBlockTypeLabel(blockType: PlatformInstructionsEditorSelectionBlockType) {
  if (blockType === "multiple") return "Multiple types";
  return (
    SELECTION_BLOCK_TYPE_OPTIONS.find((option) => option.id === blockType)?.label || "Normal text"
  );
}

export interface PlatformInstructionsEditorTextSelectionMenuProps {
  open: boolean;
  anchorPoint: PlatformPopupAnchorPoint | null;
  blockType: PlatformInstructionsEditorSelectionBlockType;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: PlatformInstructionsEditorTextAlignment;
  onOpenChange: (open: boolean) => void;
  onBlockTypeChange: (
    blockType: Exclude<PlatformInstructionsEditorSelectionBlockType, "multiple">,
  ) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onAlign: (alignment: PlatformInstructionsEditorTextAlignment) => void;
}

interface SelectionFormattingButtonProps {
  label: string;
  active: boolean;
  icon: ReactNode;
  onSelect: () => void;
}

function SelectionFormattingButton({
  label,
  active,
  icon,
  onSelect,
}: SelectionFormattingButtonProps) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-label={label}
      aria-checked={active}
      title={label}
      className={`platform-instructions-editor__selection-format-button${active ? " is-active" : ""}`}
      onMouseDown={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
      onClick={onSelect}
    >
      {icon}
    </button>
  );
}

export function PlatformInstructionsEditorTextSelectionMenu({
  open,
  anchorPoint,
  blockType,
  bold,
  italic,
  underline,
  alignment,
  onOpenChange,
  onBlockTypeChange,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onAlign,
}: PlatformInstructionsEditorTextSelectionMenuProps) {
  const selectedBlockLabel = getSelectionBlockTypeLabel(blockType);

  return (
    <InstructionsEditorToolbarPopup
      open={open}
      onOpenChange={onOpenChange}
      label="Text formatting"
      triggerClassName="is-text-selection-context-trigger"
      popupClassName="platform-instructions-editor__selection-popup"
      popupWidth={230}
      anchorPoint={anchorPoint}
      trigger={<span aria-hidden="true" />}
    >
      <PlatformPopupSubmenu
        label={selectedBlockLabel}
        leading={renderSelectionBlockTypeIcon(blockType)}
        popupAriaLabel="Change block type"
        popupWidth={210}
        closeOnSelect
        className="platform-instructions-editor__selection-type-submenu"
        popupClassName="platform-instructions-editor__selection-type-popup"
      >
        {SELECTION_BLOCK_TYPE_OPTIONS.map((option) => {
          const selected = blockType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              className={`tb-popup-row platform-instructions-editor__selection-type-option${selected ? " is-selected" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onBlockTypeChange(option.id)}
            >
              <span className="tb-popup-icon" aria-hidden="true">
                {renderSelectionBlockTypeIcon(option.id)}
              </span>
              <span className="tb-popup-label">{option.label}</span>
              <span className="tb-popup-check-slot" aria-hidden="true">
                {selected ? <Check width={13} height={13} strokeWidth={1.9} /> : null}
              </span>
            </button>
          );
        })}
      </PlatformPopupSubmenu>

      <hr className="platform-instructions-editor__selection-popup-divider" />

      <div className="platform-instructions-editor__selection-format-actions">
        <SelectionFormattingButton
          label="Bold"
          active={bold}
          icon={<Bold width={16} height={16} strokeWidth={2.6} />}
          onSelect={onToggleBold}
        />
        <SelectionFormattingButton
          label="Italic"
          active={italic}
          icon={<Italic width={16} height={16} strokeWidth={1.9} />}
          onSelect={onToggleItalic}
        />
        <SelectionFormattingButton
          label="Underline"
          active={underline}
          icon={<Underline width={16} height={16} strokeWidth={1.9} />}
          onSelect={onToggleUnderline}
        />
        <span
          className="platform-instructions-editor__selection-format-divider"
          aria-hidden="true"
        />
        <SelectionFormattingButton
          label="Align left"
          active={alignment === "left"}
          icon={<AlignLeft width={16} height={16} strokeWidth={1.9} />}
          onSelect={() => onAlign("left")}
        />
        <SelectionFormattingButton
          label="Align center"
          active={alignment === "center"}
          icon={<AlignCenter width={16} height={16} strokeWidth={1.9} />}
          onSelect={() => onAlign("center")}
        />
        <SelectionFormattingButton
          label="Align right"
          active={alignment === "right"}
          icon={<AlignRight width={16} height={16} strokeWidth={1.9} />}
          onSelect={() => onAlign("right")}
        />
        <SelectionFormattingButton
          label="Align justify"
          active={alignment === "justify"}
          icon={<AlignJustify width={16} height={16} strokeWidth={1.9} />}
          onSelect={() => onAlign("justify")}
        />
      </div>
    </InstructionsEditorToolbarPopup>
  );
}
