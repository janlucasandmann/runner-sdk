import { type NodeViewProps } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { TextSelection } from "@tiptap/pm/state";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  Ellipsis,
  Rows3,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import type { PlatformPopupAnchorPoint } from "../popup/index.js";
import {
  InstructionsEditorToolbarPopup,
  type InstructionsEditorToolbarMenuOption,
} from "./platform-instructions-editor-toolbar-popup.js";

interface TableSelectionState {
  inside: boolean;
  header: boolean;
}

function PlatformInstructionsEditorTableNodeView({
  node,
  editor,
  getPos,
}: NodeViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorPoint, setMenuAnchorPoint] =
    useState<PlatformPopupAnchorPoint | null>(null);
  const [selectionState, setSelectionState] = useState<TableSelectionState>({
    inside: false,
    header: false,
  });

  const refreshSelectionState = useCallback(() => {
    const position = getPos();
    if (typeof position !== "number") return;
    const selection = editor.state.selection;
    const inside =
      selection.from > position && selection.to < position + node.nodeSize;
    const header = inside && editor.isActive("tableHeader");
    setSelectionState((currentState) => {
      if (
        currentState.inside === inside &&
        currentState.header === header
      ) {
        return currentState;
      }
      return { inside, header };
    });
  }, [editor, getPos, node.nodeSize]);

  useEffect(() => {
    refreshSelectionState();
    editor.on("selectionUpdate", refreshSelectionState);
    editor.on("focus", refreshSelectionState);
    editor.on("blur", refreshSelectionState);
    return () => {
      editor.off("selectionUpdate", refreshSelectionState);
      editor.off("focus", refreshSelectionState);
      editor.off("blur", refreshSelectionState);
    };
  }, [editor, refreshSelectionState]);

  const focusTable = () => {
    const position = getPos();
    if (typeof position !== "number") return;
    const currentSelection = editor.state.selection;
    const selectionInsideTable =
      currentSelection.from > position &&
      currentSelection.to < position + node.nodeSize;
    if (selectionInsideTable) return;
    const target = Math.min(position + 1, editor.state.doc.content.size);
    const selection = TextSelection.near(editor.state.doc.resolve(target), 1);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    editor.view.focus();
  };
  const setTableMenuOpen = (open: boolean) => {
    setMenuOpen(open);
    if (!open) setMenuAnchorPoint(null);
  };

  const deleteRow = () => {
    if (!editor.can().deleteRow()) return;
    const deletingHeader = editor.isActive("tableHeader");
    const chain = editor.chain().focus().deleteRow();
    if (deletingHeader) chain.toggleHeaderRow();
    chain.run();
  };

  const options: InstructionsEditorToolbarMenuOption[] = [
    {
      id: "table-row-before",
      label: "Add row above",
      icon: <BetweenHorizontalStart width={14} height={14} strokeWidth={1.8} />,
      disabled: selectionState.header || !editor.can().addRowBefore(),
      title: selectionState.header
        ? "The header row must remain first"
        : undefined,
      onSelect: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      id: "table-row-after",
      label: "Add row below",
      icon: <BetweenHorizontalEnd width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().addRowAfter(),
      onSelect: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      id: "table-delete-row",
      label: "Delete row",
      icon: <Rows3 width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().deleteRow(),
      onSelect: deleteRow,
    },
    {
      id: "table-column-before",
      label: "Add column left",
      icon: <BetweenVerticalStart width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().addColumnBefore(),
      separatorBefore: true,
      onSelect: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      id: "table-column-after",
      label: "Add column right",
      icon: <BetweenVerticalEnd width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().addColumnAfter(),
      onSelect: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      id: "table-delete-column",
      label: "Delete column",
      icon: <Columns3 width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().deleteColumn(),
      onSelect: () => editor.chain().focus().deleteColumn().run(),
    },
    {
      id: "table-delete",
      label: "Delete table",
      icon: <Trash2 width={14} height={14} strokeWidth={1.8} />,
      disabled: !editor.can().deleteTable(),
      separatorBefore: true,
      onSelect: () => editor.chain().focus().deleteTable().run(),
    },
  ];
  const columnCount = Math.max(1, node.firstChild?.childCount || 1);

  return (
    <NodeViewWrapper
      className={`platform-instructions-editor__table-node${selectionState.inside ? " is-focused" : ""}${menuOpen ? " is-menu-open" : ""}`}
      data-platform-table-focused={selectionState.inside || undefined}
      onContextMenu={(event: ReactMouseEvent<HTMLElement>) => {
        const domSelection =
          typeof window === "undefined" ? null : window.getSelection();
        if (
          domSelection &&
          !domSelection.isCollapsed &&
          domSelection.anchorNode &&
          domSelection.focusNode &&
          event.currentTarget.contains(domSelection.anchorNode) &&
          event.currentTarget.contains(domSelection.focusNode)
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        focusTable();
        setMenuAnchorPoint({ x: event.clientX, y: event.clientY });
        setMenuOpen(true);
      }}
    >
      <div className="tableWrapper platform-instructions-editor__table-scroll">
        <div
          className="platform-instructions-editor__table-layout"
          style={{ minWidth: `max(100%, ${columnCount * 120}px)` }}
        >
          <NodeViewContent<"table">
            as="table"
            className="platform-instructions-editor__table platform-markdown__table"
          />
          <div
            className="platform-instructions-editor__table-actions"
            contentEditable={false}
          >
            <InstructionsEditorToolbarPopup
              open={menuOpen}
              onOpenChange={setTableMenuOpen}
              onTriggerMouseDown={() => {
                setMenuAnchorPoint(null);
                focusTable();
              }}
              anchorPoint={menuAnchorPoint}
              label="Table options"
              triggerClassName="is-table-context-trigger"
              popupWidth={190}
              trigger={
                <Ellipsis
                  width={14}
                  height={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              }
              options={options}
            />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const PlatformInstructionsEditorTableNode = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(PlatformInstructionsEditorTableNodeView, {
      contentDOMElementTag: "tbody",
    });
  },
});
