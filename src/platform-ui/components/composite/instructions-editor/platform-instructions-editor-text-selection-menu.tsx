import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";

import type { PlatformPopupAnchorPoint } from "../popup/index.js";
import type { PlatformInstructionsEditorTextAlignment } from "./platform-instructions-editor-text-alignment.js";
import { InstructionsEditorToolbarPopup } from "./platform-instructions-editor-toolbar-popup.js";

export interface PlatformInstructionsEditorTextSelectionMenuProps {
  open: boolean;
  anchorPoint: PlatformPopupAnchorPoint | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: PlatformInstructionsEditorTextAlignment;
  onOpenChange: (open: boolean) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onAlign: (alignment: PlatformInstructionsEditorTextAlignment) => void;
}

export function PlatformInstructionsEditorTextSelectionMenu({
  open,
  anchorPoint,
  bold,
  italic,
  underline,
  alignment,
  onOpenChange,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onAlign,
}: PlatformInstructionsEditorTextSelectionMenuProps) {
  return (
    <InstructionsEditorToolbarPopup
      open={open}
      onOpenChange={onOpenChange}
      label="Text formatting"
      triggerClassName="is-text-selection-context-trigger"
      popupWidth={200}
      anchorPoint={anchorPoint}
      trigger={<span aria-hidden="true" />}
      options={[
        {
          id: "selection-bold",
          label: "Bold",
          icon: <Bold width={14} height={14} strokeWidth={2.7} />,
          active: bold,
          onSelect: onToggleBold,
        },
        {
          id: "selection-italic",
          label: "Italic",
          icon: <Italic width={14} height={14} strokeWidth={1.8} />,
          active: italic,
          onSelect: onToggleItalic,
        },
        {
          id: "selection-underline",
          label: "Underline",
          icon: <Underline width={14} height={14} strokeWidth={1.8} />,
          active: underline,
          onSelect: onToggleUnderline,
        },
        {
          id: "selection-align-left",
          label: "Align left",
          icon: <AlignLeft width={14} height={14} strokeWidth={1.8} />,
          active: alignment === "left",
          separatorBefore: true,
          onSelect: () => onAlign("left"),
        },
        {
          id: "selection-align-center",
          label: "Align center",
          icon: <AlignCenter width={14} height={14} strokeWidth={1.8} />,
          active: alignment === "center",
          onSelect: () => onAlign("center"),
        },
        {
          id: "selection-align-right",
          label: "Align right",
          icon: <AlignRight width={14} height={14} strokeWidth={1.8} />,
          active: alignment === "right",
          onSelect: () => onAlign("right"),
        },
      ]}
    />
  );
}
