import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

const slashSearchHintPluginKey = new PluginKey<boolean>(
  "platformInstructionsEditorSlashSearchHint",
);

function hasEmptySlashQueryAtSelection(editorState: EditorState) {
  const { selection } = editorState;
  if (!selection.empty || !selection.$from.parent.isTextblock) return false;

  const textBeforeCursor = selection.$from.parent.textBetween(
    0,
    selection.$from.parentOffset,
    "\0",
    "\0",
  );
  const match = /\/([^/]*)$/.exec(textBeforeCursor);
  if (!match || match[1]) return false;
  const slashOffset = match.index;
  return slashOffset === 0 || /\s/.test(textBeforeCursor.charAt(slashOffset - 1));
}

export const PlatformInstructionsEditorSlashSearchHint = Extension.create({
  name: "platformInstructionsEditorSlashSearchHint",
  addProseMirrorPlugins() {
    return [
      new Plugin<boolean>({
        key: slashSearchHintPluginKey,
        state: {
          init: () => false,
          apply(transaction, active) {
            const nextActive = transaction.getMeta(slashSearchHintPluginKey);
            return typeof nextActive === "boolean" ? nextActive : active;
          },
        },
        props: {
          decorations(editorState) {
            if (
              !slashSearchHintPluginKey.getState(editorState) ||
              !hasEmptySlashQueryAtSelection(editorState)
            ) {
              return null;
            }

            return DecorationSet.create(editorState.doc, [
              Decoration.widget(
                editorState.selection.from,
                () => {
                  const hint = document.createElement("span");
                  hint.className = "platform-instructions-editor__slash-search-hint";
                  hint.textContent = "Write to search";
                  hint.setAttribute("aria-hidden", "true");
                  hint.contentEditable = "false";
                  return hint;
                },
                {
                  key: "platform-instructions-editor-slash-search-hint",
                  side: 1,
                },
              ),
            ]);
          },
        },
      }),
    ];
  },
});

export function setPlatformInstructionsEditorSlashSearchHint(editor: Editor, active: boolean) {
  if (editor.isDestroyed) return;
  if (slashSearchHintPluginKey.getState(editor.state) === active) return;
  const transaction = editor.state.tr
    .setMeta(slashSearchHintPluginKey, active)
    .setMeta("addToHistory", false);
  editor.view.dispatch(transaction);
}
