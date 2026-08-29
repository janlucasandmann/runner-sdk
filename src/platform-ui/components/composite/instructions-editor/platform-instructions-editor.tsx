import DragHandle from "@tiptap/extension-drag-handle-react";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  FilePlus2,
  GripVertical,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  MessageSquareText,
  Minus,
  Pilcrow,
  Plus,
  Quote,
  SquareCode,
  Table2,
  TextQuote,
  Underline,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformMonacoCodeEditor } from "../code-editor-workspace/platform-monaco-code-editor.js";
import {
  PlatformMentionSuggestionsPopup,
  type PlatformMentionOption,
  type PlatformMentionReference,
} from "../comments/index.js";
import { resolvePlatformFileExplorerFileKind } from "../file-explorer/index.js";
import { ParagraphQuote, remarkParagraphQuotes } from "./paragraph-quote.js";
import {
  decodePlatformInstructionsEditorFile,
  normalizePlatformInstructionsEditorFile,
  PlatformInstructionsEditorFileNode,
  PlatformInstructionsEditorFilePreview,
  remarkPlatformInstructionsEditorFiles,
  type PlatformInstructionsEditorFileUpload,
  type PlatformInstructionsEditorUploadedFile,
} from "./platform-instructions-editor-file-node.js";
import {
  normalizePlatformInstructionsEditorImageSource,
  normalizePlatformInstructionsEditorMarkdownImages,
  parsePlatformInstructionsEditorImageTitle,
  PlatformInstructionsEditorImageNode,
  PlatformInstructionsEditorImagePreview,
} from "./platform-instructions-editor-image-node.js";
import {
  filterInstructionsEditorSlashCommands,
  PlatformInstructionsEditorSlashMenu,
  type InstructionsEditorSlashCommandOption,
  type InstructionsEditorSlashMenuAnchor,
} from "./platform-instructions-editor-slash-menu.js";
import {
  PlatformInstructionsEditorSlashSearchHint,
  setPlatformInstructionsEditorSlashSearchHint,
} from "./platform-instructions-editor-slash-hint.js";
import { PlatformInstructionsEditorTableNode } from "./platform-instructions-editor-table-node.js";
import {
  PlatformInstructionsEditorHeading,
  PlatformInstructionsEditorParagraph,
  PlatformInstructionsEditorTextAlign,
  remarkPlatformInstructionsEditorTextAlignment,
  type PlatformInstructionsEditorTextAlignment,
} from "./platform-instructions-editor-text-alignment.js";
import {
  type PlatformInstructionsEditorSelectionBlockType,
  PlatformInstructionsEditorTextSelectionMenu,
} from "./platform-instructions-editor-text-selection-menu.js";
import { InstructionsEditorToolbarPopup } from "./platform-instructions-editor-toolbar-popup.js";

const HISTORY_LIMIT = 80;
export interface PlatformMarkdownRendererProps {
  content: string;
  className?: string;
  resolvePreviewSource?: PlatformInstructionsEditorFileUpload["resolvePreviewSource"];
}

export type PlatformInstructionsEditorVariant = "default" | "minimalistic-ui" | "block-editor";
export type PlatformInstructionsEditorMode = "rich-text" | "code";
export type PlatformInstructionsEditorContentVariant = "text" | "file-enabled" | "image-enabled";

/** @deprecated Use PlatformInstructionsEditorUploadedFile. */
export type PlatformInstructionsEditorUploadedImage = PlatformInstructionsEditorUploadedFile;
/** @deprecated Use PlatformInstructionsEditorFileUpload. */
export type PlatformInstructionsEditorImageUpload = PlatformInstructionsEditorFileUpload;

export interface PlatformInstructionsEditorChangeContext {
  source: "edit" | "file-upload" | "image-upload" | "prompt-insert";
  uploadedFiles?: readonly PlatformInstructionsEditorUploadedFile[];
  prompt?: PlatformInstructionsEditorPrompt;
}

export interface PlatformInstructionsEditorPrompt {
  id?: string;
  name?: string;
  markdown?: string | null;
  currentVersion?: {
    markdown?: string | null;
  } | null;
}

export interface PlatformInstructionsEditorPromptInsertion {
  openSearch: (
    onSelect: (prompt: PlatformInstructionsEditorPrompt) => void | Promise<void>,
  ) => void;
  disabled?: boolean;
}

export interface PlatformInstructionsEditorProps {
  value: string;
  onChange: (value: string, context?: PlatformInstructionsEditorChangeContext) => void;
  title?: ReactNode;
  /** Optional document title rendered inside the scrollable editor body. */
  bodyTitle?: ReactNode;
  /** @deprecated The centralized editor always uses its shared command hint. */
  placeholder?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  stickyHeader?: boolean;
  /** Removes the title and formatting toolbar while preserving the editor body. */
  showHeader?: boolean;
  historyKey?: string | number;
  variant?: PlatformInstructionsEditorVariant;
  editorMode?: PlatformInstructionsEditorMode;
  codeLanguage?: string;
  codePath?: string;
  contentVariant?: PlatformInstructionsEditorContentVariant;
  fileUpload?: PlatformInstructionsEditorFileUpload;
  /** Enables insertion from the centralized prompt search in the Insert menu. */
  promptInsertion?: PlatformInstructionsEditorPromptInsertion;
  /** @deprecated Use fileUpload. */
  imageUpload?: PlatformInstructionsEditorImageUpload;
  className?: string;
  editorRef?: Ref<HTMLElement>;
  /** @deprecated Use editorRef. Kept for compatibility with existing focus flows. */
  textareaRef?: Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
  collapsedLines?: number;
  onEditingChange?: (editing: boolean) => void;
  /** People and agents available to the contextual @ mention picker. */
  mentionOptions?: readonly PlatformMentionOption[];
  mentionsLoading?: boolean;
  mentionEmptyMessage?: string;
  onMentionQueryChange?: (query: string | null) => void;
  onMentionSelect?: (mention: PlatformMentionReference) => void;
}

interface InstructionsEditorInsertionTarget {
  from: number;
  to: number;
  append: boolean;
}

interface InstructionsEditorSlashMenuState {
  from: number;
  to: number;
  query: string;
  anchor: InstructionsEditorSlashMenuAnchor;
}

interface InstructionsEditorMentionMenuState {
  from: number;
  to: number;
  query: string;
  anchor: InstructionsEditorSlashMenuAnchor;
}

interface InstructionsEditorDeletionRange {
  from: number;
  to: number;
}

interface InstructionsEditorTextSelectionMenuState {
  from: number;
  to: number;
  anchorPoint: { x: number; y: number };
  blockType: PlatformInstructionsEditorSelectionBlockType;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: PlatformInstructionsEditorTextAlignment;
}

type InstructionsEditorToolbarMenu = "style" | "insert";

type InstructionsEditorBlockStyle =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "paragraph-quote"
  | "block-quote"
  | "preformatted";

function getInstructionsEditorSlashMenuState(
  editor: TiptapEditor,
): InstructionsEditorSlashMenuState | null {
  const { selection } = editor.state;
  if (!selection.empty || !selection.$from.parent.isTextblock) return null;

  const textBeforeCursor = selection.$from.parent.textBetween(
    0,
    selection.$from.parentOffset,
    "\0",
    "\0",
  );
  const match = /\/([^/]*)$/.exec(textBeforeCursor);
  if (!match) return null;
  const slashOffset = match.index;
  if (slashOffset > 0 && !/\s/.test(textBeforeCursor.charAt(slashOffset - 1))) return null;

  const query = match[1] || "";
  if (query.length > 80) return null;

  const slashPosition = selection.$from.start() + slashOffset;

  let anchor: InstructionsEditorSlashMenuAnchor;
  try {
    const coordinates = editor.view.coordsAtPos(slashPosition);
    anchor = {
      left: coordinates.left,
      top: coordinates.top,
      bottom: coordinates.bottom,
    };
  } catch {
    const editorRect = editor.view.dom.getBoundingClientRect();
    anchor = {
      left: editorRect.left,
      top: editorRect.top,
      bottom: editorRect.top + 20,
    };
  }

  return {
    from: slashPosition,
    to: selection.from,
    query,
    anchor,
  };
}

function getInstructionsEditorMentionMenuState(
  editor: TiptapEditor,
): InstructionsEditorMentionMenuState | null {
  const { selection } = editor.state;
  if (!selection.empty || !selection.$from.parent.isTextblock) return null;

  const textBeforeCursor = selection.$from.parent.textBetween(
    0,
    selection.$from.parentOffset,
    "\0",
    "\0",
  );
  const match = /(^|[\s([{])@([^@\n]*)$/.exec(textBeforeCursor);
  if (!match) return null;

  const query = String(match[2] || "");
  if (query.length > 80) return null;
  const mentionOffset = match.index + String(match[1] || "").length;
  const mentionPosition = selection.$from.start() + mentionOffset;

  let anchor: InstructionsEditorSlashMenuAnchor;
  try {
    const coordinates = editor.view.coordsAtPos(mentionPosition);
    anchor = {
      left: coordinates.left,
      top: coordinates.top,
      bottom: coordinates.bottom,
    };
  } catch {
    const editorRect = editor.view.dom.getBoundingClientRect();
    anchor = {
      left: editorRect.left,
      top: editorRect.top,
      bottom: editorRect.top + 20,
    };
  }

  return {
    from: mentionPosition,
    to: selection.from,
    query,
    anchor,
  };
}

function filterInstructionsEditorMentionOptions(
  options: readonly PlatformMentionOption[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return options
    .filter(
      (option) =>
        !normalizedQuery ||
        [option.label, option.description, option.kind].some((value) =>
          String(value || "")
            .toLocaleLowerCase()
            .includes(normalizedQuery),
        ),
    )
    .slice(0, 12);
}

function getNextEnabledSlashCommandIndex(
  options: InstructionsEditorSlashCommandOption[],
  currentIndex: number,
  direction: 1 | -1,
) {
  if (!options.length) return 0;
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (currentIndex + offset * direction + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return Math.max(0, Math.min(currentIndex, options.length - 1));
}

function getInstructionsEditorDeletionRange(
  editor: TiptapEditor,
  direction: "backward" | "forward",
): InstructionsEditorDeletionRange | null {
  const { selection } = editor.state;
  if (!selection.empty) {
    return { from: selection.from, to: selection.to };
  }

  const adjacentNode =
    direction === "backward" ? selection.$from.nodeBefore : selection.$from.nodeAfter;
  if (!adjacentNode?.isText || !adjacentNode.text) return null;
  const codePoints = Array.from(adjacentNode.text);
  const adjacentCodePoint = direction === "backward" ? codePoints.at(-1) : codePoints[0];
  const deletionLength = adjacentCodePoint?.length || 0;
  if (!deletionLength) return null;

  return direction === "backward"
    ? { from: selection.from - deletionLength, to: selection.from }
    : { from: selection.from, to: selection.from + deletionLength };
}

function getInstructionsEditorTextSelectionRange(
  editor: TiptapEditor,
): { from: number; to: number } | null {
  if (typeof window !== "undefined") {
    const domSelection = window.getSelection();
    const editorDom = editor.view.dom;
    if (
      domSelection &&
      !domSelection.isCollapsed &&
      domSelection.anchorNode &&
      domSelection.focusNode &&
      editorDom.contains(domSelection.anchorNode) &&
      editorDom.contains(domSelection.focusNode)
    ) {
      try {
        const anchor = editor.view.posAtDOM(domSelection.anchorNode, domSelection.anchorOffset);
        const focus = editor.view.posAtDOM(domSelection.focusNode, domSelection.focusOffset);
        if (anchor !== focus) {
          return {
            from: Math.min(anchor, focus),
            to: Math.max(anchor, focus),
          };
        }
      } catch {
        // ProseMirror's authoritative selection below remains the fallback.
      }
    }
  }

  const { from, to, empty } = editor.state.selection;
  return empty || from === to ? null : { from, to };
}

function getInstructionsEditorTextSelectionAnchorPoint(
  editor: TiptapEditor,
): { x: number; y: number } | null {
  if (typeof window !== "undefined") {
    const domSelection = window.getSelection();
    const editorDom = editor.view.dom;
    if (
      domSelection &&
      !domSelection.isCollapsed &&
      domSelection.rangeCount > 0 &&
      domSelection.anchorNode &&
      domSelection.focusNode &&
      editorDom.contains(domSelection.anchorNode) &&
      editorDom.contains(domSelection.focusNode)
    ) {
      const range = domSelection.getRangeAt(0);
      const clientRects = Array.from(range.getClientRects());
      const rect = clientRects.at(-1) || range.getBoundingClientRect();
      if (Number.isFinite(rect.left) && Number.isFinite(rect.bottom)) {
        return { x: rect.left, y: rect.bottom + 4 };
      }
    }
  }

  const selection = editor.state.selection;
  if (selection.empty) return null;
  try {
    const coordinates = editor.view.coordsAtPos(selection.to);
    return { x: coordinates.left, y: coordinates.bottom + 4 };
  } catch {
    return null;
  }
}

function getInstructionsEditorTextAlignment(
  editor: TiptapEditor,
): PlatformInstructionsEditorTextAlignment {
  if (editor.isActive({ textAlign: "center" })) return "center";
  if (editor.isActive({ textAlign: "right" })) return "right";
  if (editor.isActive({ textAlign: "justify" })) return "justify";
  return "left";
}

function getInstructionsEditorSelectionBlockType(
  editor: TiptapEditor,
  range: { from: number; to: number },
): PlatformInstructionsEditorSelectionBlockType {
  const blockTypes = new Set<PlatformInstructionsEditorSelectionBlockType>();

  editor.state.doc.nodesBetween(range.from, range.to, (node) => {
    const nodeType = node.type.name;
    if (node.isTextblock && !node.textContent.trim()) return false;
    if (nodeType === "bulletList") {
      blockTypes.add("bullet-list");
      return false;
    }
    if (nodeType === "orderedList") {
      blockTypes.add("ordered-list");
      return false;
    }
    if (nodeType === "taskList") {
      blockTypes.add("task-list");
      return false;
    }
    if (nodeType === "blockquote") {
      blockTypes.add("block-quote");
      return false;
    }
    if (nodeType === "codeBlock") {
      blockTypes.add("preformatted");
      return false;
    }
    if (nodeType === "paragraphQuote") {
      blockTypes.add("paragraph-quote");
      return false;
    }
    if (nodeType === "heading") {
      const level = Number(node.attrs.level);
      if (level === 1) blockTypes.add("heading-1");
      else if (level === 2) blockTypes.add("heading-2");
      else blockTypes.add("heading-3");
      return false;
    }
    if (nodeType === "paragraph") {
      blockTypes.add("paragraph");
      return false;
    }
    return undefined;
  });

  if (blockTypes.size !== 1) return "multiple";
  return blockTypes.values().next().value || "paragraph";
}

const EMPTY_TOOLBAR_STATE = {
  paragraph: false,
  heading1: false,
  heading2: false,
  heading3: false,
  paragraphQuote: false,
  blockquote: false,
  codeBlock: false,
  bold: false,
  italic: false,
  underline: false,
  bulletList: false,
  orderedList: false,
  taskList: false,
  code: false,
  link: false,
  table: false,
  alignment: "left" as PlatformInstructionsEditorTextAlignment,
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

function remarkSoftbreaksToBreaks() {
  return (tree: unknown) => {
    visit(
      tree as Parameters<typeof visit>[0],
      "text",
      (node: { value?: string }, index, parent: { children?: unknown[] } | undefined) => {
        if (
          !parent?.children ||
          typeof index !== "number" ||
          typeof node.value !== "string" ||
          !node.value.includes("\n")
        )
          return;
        const parts = node.value.split("\n");
        const replacement: Array<{ type: "text" | "break"; value?: string }> = [];
        parts.forEach((part, partIndex) => {
          if (part) replacement.push({ type: "text", value: part });
          if (partIndex < parts.length - 1) replacement.push({ type: "break" });
        });
        parent.children.splice(index, 1, ...replacement);
        return index + replacement.length;
      },
    );
  };
}

function remarkUnderline() {
  return (tree: unknown) => {
    visit(
      tree as Parameters<typeof visit>[0],
      "text",
      (node: { value?: string }, index, parent: { children?: unknown[] } | undefined) => {
        if (
          !parent?.children ||
          typeof index !== "number" ||
          typeof node.value !== "string" ||
          !node.value.includes("++")
        )
          return;
        const pattern = /\+\+([\s\S]+?)\+\+/g;
        const replacement: unknown[] = [];
        let cursor = 0;
        let match = pattern.exec(node.value);
        while (match) {
          if (match.index > cursor)
            replacement.push({
              type: "text",
              value: node.value.slice(cursor, match.index),
            });
          replacement.push({
            type: "underline",
            data: { hName: "u" },
            children: [{ type: "text", value: match[1] || "" }],
          });
          cursor = match.index + match[0].length;
          match = pattern.exec(node.value);
        }
        if (!replacement.length) return;
        if (cursor < node.value.length)
          replacement.push({ type: "text", value: node.value.slice(cursor) });
        parent.children.splice(index, 1, ...replacement);
        return index + replacement.length;
      },
    );
  };
}

const markdownComponents: Components = {
  div: ({ node: _node, className = "", ...props }) => {
    const encodedFile = (
      props as typeof props & {
        "data-platform-instructions-file"?: unknown;
      }
    )["data-platform-instructions-file"];
    const file = decodePlatformInstructionsEditorFile(encodedFile);
    if (file) {
      return (
        <div
          className={`platform-instructions-editor__attachment-node is-readonly${className ? ` ${className}` : ""}`}
        >
          <PlatformInstructionsEditorFilePreview file={file} disabled />
        </div>
      );
    }
    return <div {...props} className={className} />;
  },
  p: ({ node: _node, className = "", ...props }) => (
    <p
      {...props}
      className={`platform-markdown__paragraph tb-message-markdown-paragraph${className ? ` ${className}` : ""}`}
    />
  ),
  strong: ({ node: _node, ...props }) => (
    <strong {...props} className="platform-markdown__strong tb-message-markdown-strong" />
  ),
  em: ({ node: _node, ...props }) => (
    <em {...props} className="platform-markdown__em tb-message-markdown-em" />
  ),
  code: ({ node: _node, className, ...props }) => (
    <code
      {...props}
      className={`${className ? "platform-markdown__code tb-message-markdown-code" : "platform-markdown__inline-code tb-message-markdown-inline-code"}${className ? ` ${className}` : ""}`}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre {...props} className="platform-markdown__pre tb-message-markdown-pre" />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul {...props} className="platform-markdown__list tb-message-markdown-list" />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      {...props}
      className="platform-markdown__list is-ordered tb-message-markdown-list tb-message-markdown-list-ordered"
    />
  ),
  li: ({ node: _node, ...props }) => (
    <li {...props} className="platform-markdown__list-item tb-message-markdown-list-item" />
  ),
  h1: ({ node: _node, ...props }) => (
    <h1 {...props} className="platform-markdown__heading tb-message-markdown-heading" />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 {...props} className="platform-markdown__heading tb-message-markdown-heading" />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 {...props} className="platform-markdown__heading tb-message-markdown-heading" />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4 {...props} className="platform-markdown__heading tb-message-markdown-heading" />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      {...props}
      className="platform-markdown__link tb-message-markdown-link"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote {...props} className="platform-markdown__quote tb-message-markdown-quote" />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="platform-markdown__table-wrap tb-message-markdown-table-wrap">
      <table {...props} className="platform-markdown__table tb-message-markdown-table" />
    </div>
  ),
  thead: ({ node: _node, ...props }) => (
    <thead {...props} className="platform-markdown__thead tb-message-markdown-thead" />
  ),
  tbody: ({ node: _node, ...props }) => <tbody {...props} />,
  tr: ({ node: _node, ...props }) => (
    <tr {...props} className="platform-markdown__row tb-message-markdown-row" />
  ),
  th: ({ node: _node, ...props }) => (
    <th {...props} className="platform-markdown__th tb-message-markdown-th" />
  ),
  td: ({ node: _node, ...props }) => (
    <td {...props} className="platform-markdown__td tb-message-markdown-td" />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr {...props} className="platform-markdown__rule tb-message-markdown-rule" />
  ),
  u: ({ node: _node, ...props }) => (
    <u
      {...props}
      className="platform-markdown__underline playground-tasks-detail-markdown-underline"
    />
  ),
};

function prepareMarkdown(content: string) {
  const normalizedContent = String(content || "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/<u>([\s\S]*?)<\/u>/gi, "++$1++");
  return normalizePlatformInstructionsEditorMarkdownImages(normalizedContent)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function PlatformMarkdownRenderer({
  content,
  className = "",
  resolvePreviewSource,
}: PlatformMarkdownRendererProps) {
  const resolvePreviewSourceRef = useRef(resolvePreviewSource);
  resolvePreviewSourceRef.current = resolvePreviewSource;
  const hasPreviewResolver = Boolean(resolvePreviewSource);
  const resolveStablePreviewSource = useCallback(
    (file: PlatformInstructionsEditorUploadedFile, signal: AbortSignal) => {
      const resolver = resolvePreviewSourceRef.current;
      return resolver ? resolver(file, signal) : Promise.resolve<string | null>(null);
    },
    [],
  );
  const components = useMemo<Components>(
    () => ({
    ...markdownComponents,
    img: ({ node: _node, className = "", src, alt, title, ...props }) => {
      const imageMetadata = parsePlatformInstructionsEditorImageTitle(title);
      const imageSource = normalizePlatformInstructionsEditorImageSource(src);
      return (
        <PlatformInstructionsEditorImagePreview
          {...props}
          image={{
            src: imageSource,
            name: String(alt || "Image"),
            alt: String(alt || "Image"),
            title: imageMetadata.title,
            size: imageMetadata.fileSize,
            mimeType: imageMetadata.mimeType,
            attachmentId: imageMetadata.attachmentId,
            displaySize: imageMetadata.displaySize,
            alignment: imageMetadata.alignment,
          }}
            resolvePreviewSource={hasPreviewResolver ? resolveStablePreviewSource : undefined}
          className={`platform-markdown__image tb-message-markdown-image is-size-${imageMetadata.displaySize} is-align-${imageMetadata.alignment}${className ? ` ${className}` : ""}`}
          data-platform-image-size={imageMetadata.displaySize}
          data-platform-image-alignment={imageMetadata.alignment}
        />
      );
    },
    }),
    [hasPreviewResolver, resolveStablePreviewSource],
  );

  return (
    <div className={`platform-markdown${className ? ` ${className}` : ""}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkPlatformInstructionsEditorFiles,
          remarkParagraphQuotes,
          remarkPlatformInstructionsEditorTextAlignment,
          remarkUnderline,
          remarkSoftbreaksToBreaks,
        ]}
        components={components}
      >
        {prepareMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

function findInstructionsEditorScrollContainer(element: HTMLElement | null) {
  let parent = element?.parentElement || null;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(`${style.overflow} ${style.overflowY}`)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function getUploadFiles(files: File[] | FileList | null | undefined) {
  return Array.from(files || []).filter(
    (file): file is File =>
      file instanceof File && typeof file.name === "string" && typeof file.size === "number",
  );
}

function hasFileTransfer(event: DragEvent<HTMLElement>) {
  if (getUploadFiles(event.dataTransfer?.files).length > 0) return true;
  return Array.from(event.dataTransfer?.items || []).some((item) => item.kind === "file");
}

function normalizeUploadedFiles(
  uploadedFiles: PlatformInstructionsEditorUploadedFile[],
  sourceFiles: File[],
) {
  return (Array.isArray(uploadedFiles) ? uploadedFiles : [])
    .map((uploadedFile, index) =>
      normalizePlatformInstructionsEditorFile({
        ...uploadedFile,
        name: uploadedFile?.name || uploadedFile?.alt || sourceFiles[index]?.name || "Attachment",
        size: uploadedFile?.size || sourceFiles[index]?.size || 0,
        mimeType: uploadedFile?.mimeType || sourceFiles[index]?.type || "",
        alt: uploadedFile?.alt || uploadedFile?.name || sourceFiles[index]?.name || "Attachment",
      }),
    )
    .filter((uploadedFile): uploadedFile is PlatformInstructionsEditorUploadedFile =>
        Boolean(uploadedFile),
    );
}

function normalizeInstructionsEditorLinkHref(value: string) {
  const href = String(value || "").trim();
  if (!href) return "";
  if (/^(?:https?:|mailto:|tel:|\/|#)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return "";
  return `https://${href}`;
}

function resolveInstructionsEditorPromptMarkdown(prompt: PlatformInstructionsEditorPrompt) {
  return String(prompt?.currentVersion?.markdown ?? prompt?.markdown ?? "");
}

const PLATFORM_INSTRUCTIONS_EDITOR_PLACEHOLDER = 'Enter "/" for commands';

export function PlatformInstructionsEditor({
  value,
  onChange,
  title = "Instructions",
  bodyTitle,
  ariaLabel = "Instructions",
  readOnly = false,
  stickyHeader = true,
  showHeader = true,
  historyKey = "default",
  variant = "default",
  editorMode = "rich-text",
  codeLanguage = "plaintext",
  codePath,
  contentVariant = "text",
  fileUpload,
  promptInsertion,
  imageUpload,
  className = "",
  editorRef: forwardedEditorRef,
  textareaRef: forwardedTextareaRef,
  autoFocus = false,
  collapsedLines = 0,
  onEditingChange,
  mentionOptions = [],
  mentionsLoading = false,
  mentionEmptyMessage,
  onMentionQueryChange,
  onMentionSelect,
}: PlatformInstructionsEditorProps) {
  const placeholder = PLATFORM_INSTRUCTIONS_EDITOR_PLACEHOLDER;
  const normalizedCollapsedLines = Number.isFinite(Number(collapsedLines))
    ? Math.max(0, Math.floor(Number(collapsedLines)))
    : 0;
  const collapseEnabled = normalizedCollapsedLines > 0;
  const [editing, setEditing] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [contentExceedsCollapsedHeight, setContentExceedsCollapsedHeight] = useState(false);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [fileDragging, setFileDragging] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [toolbarState, setToolbarState] = useState(EMPTY_TOOLBAR_STATE);
  const [activeToolbarMenu, setActiveToolbarMenu] = useState<InstructionsEditorToolbarMenu | null>(
    null,
  );
  const [textSelectionMenuState, setTextSelectionMenuState] =
    useState<InstructionsEditorTextSelectionMenuState | null>(null);
  const [slashMenuState, setSlashMenuState] = useState<InstructionsEditorSlashMenuState | null>(
    null,
  );
  const [slashMenuActiveIndex, setSlashMenuActiveIndex] = useState(0);
  const [mentionMenuState, setMentionMenuState] =
    useState<InstructionsEditorMentionMenuState | null>(null);
  const [mentionMenuActiveIndex, setMentionMenuActiveIndex] = useState(0);
  const shellRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentViewportRef = useRef<HTMLDivElement>(null);
  const mentionPopupAnchorRef = useRef<HTMLSpanElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertionTargetRef = useRef<InstructionsEditorInsertionTarget | null>(null);
  const promptInsertionTargetRef = useRef<InstructionsEditorInsertionTarget | null>(null);
  const changeContextRef = useRef<PlatformInstructionsEditorChangeContext>({
    source: "edit",
  });
  const uploadingRef = useRef(false);
  const editingRef = useRef(false);
  const userInteractionRef = useRef(false);
  const interactionHistoryKeyRef = useRef(historyKey);
  const externalValueRef = useRef(String(value || ""));
  const onChangeRef = useRef(onChange);
  const onEditingChangeRef = useRef(onEditingChange);
  const fileUploadRef = useRef(fileUpload || imageUpload);
  const slashMenuStateRef = useRef<InstructionsEditorSlashMenuState | null>(null);
  const dismissedSlashPositionRef = useRef<number | null>(null);
  const mentionMenuStateRef = useRef<InstructionsEditorMentionMenuState | null>(null);
  const onMentionQueryChangeRef = useRef(onMentionQueryChange);
  const onMentionSelectRef = useRef(onMentionSelect);
  onChangeRef.current = onChange;
  onEditingChangeRef.current = onEditingChange;
  fileUploadRef.current = fileUpload || imageUpload;
  onMentionQueryChangeRef.current = onMentionQueryChange;
  onMentionSelectRef.current = onMentionSelect;
  if (interactionHistoryKeyRef.current !== historyKey) {
    interactionHistoryKeyRef.current = historyKey;
    userInteractionRef.current = false;
    dismissedSlashPositionRef.current = null;
  }

  const setEditingState = useCallback(
    (next: boolean) => {
    if (editingRef.current === next) return;
    editingRef.current = next;
    if (next && collapseEnabled) {
      setContentExpanded(true);
    }
    setEditing(next);
    onEditingChangeRef.current?.(next);
    },
    [collapseEnabled],
  );

  const refreshToolbarState = useCallback((editor: TiptapEditor) => {
    if (editor.isDestroyed) return;
    const blockquote = editor.isActive("blockquote");
    setToolbarState({
      paragraph: editor.isActive("paragraph") && !blockquote,
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      paragraphQuote: editor.isActive("paragraphQuote"),
      blockquote,
      codeBlock: editor.isActive("codeBlock"),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      taskList: editor.isActive("taskList"),
      code: editor.isActive("code"),
      link: editor.isActive("link"),
      table: editor.isActive("table"),
      alignment: getInstructionsEditorTextAlignment(editor),
    });
  }, []);

  const refreshSlashMenuState = useCallback((editor: TiptapEditor) => {
    let nextState = getInstructionsEditorSlashMenuState(editor);
    const dismissedSlashPosition = dismissedSlashPositionRef.current;
    if (nextState && dismissedSlashPosition === nextState.from) {
      nextState = null;
    } else if (
      dismissedSlashPosition !== null &&
      (!nextState || nextState.from !== dismissedSlashPosition)
    ) {
      dismissedSlashPositionRef.current = null;
    }
    const previousState = slashMenuStateRef.current;
    const queryChanged =
      previousState?.from !== nextState?.from || previousState?.query !== nextState?.query;
    slashMenuStateRef.current = nextState;
    if (queryChanged) setSlashMenuActiveIndex(0);
    setSlashMenuState((currentState) => {
      if (!currentState || !nextState) return currentState === nextState ? currentState : nextState;
      const unchanged =
        currentState.from === nextState.from &&
        currentState.to === nextState.to &&
        currentState.query === nextState.query &&
        currentState.anchor.left === nextState.anchor.left &&
        currentState.anchor.top === nextState.anchor.top &&
        currentState.anchor.bottom === nextState.anchor.bottom;
      return unchanged ? currentState : nextState;
    });
  }, []);

  const mentionsEnabled = Boolean(mentionOptions.length || onMentionQueryChange || mentionsLoading);
  const refreshMentionMenuState = useCallback(
    (editor: TiptapEditor) => {
      const nextState = mentionsEnabled ? getInstructionsEditorMentionMenuState(editor) : null;
      const previousState = mentionMenuStateRef.current;
      const queryChanged =
        previousState?.from !== nextState?.from || previousState?.query !== nextState?.query;
      mentionMenuStateRef.current = nextState;
      if (queryChanged) setMentionMenuActiveIndex(0);
      setMentionMenuState((currentState) => {
        if (!currentState || !nextState)
          return currentState === nextState ? currentState : nextState;
        const unchanged =
          currentState.from === nextState.from &&
          currentState.to === nextState.to &&
          currentState.query === nextState.query &&
          currentState.anchor.left === nextState.anchor.left &&
          currentState.anchor.top === nextState.anchor.top &&
          currentState.anchor.bottom === nextState.anchor.bottom;
        return unchanged ? currentState : nextState;
      });
      if (previousState?.query !== nextState?.query) {
        onMentionQueryChangeRef.current?.(nextState?.query ?? null);
      }
    },
    [mentionsEnabled],
  );

  const richTextEditor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          paragraph: false,
          heading: false,
          dropcursor: {
            color: "rgba(77, 163, 255, 0.92)",
            width: 2,
          },
          link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: "https",
          },
          undoRedo: { depth: HISTORY_LIMIT },
        }),
        PlatformInstructionsEditorParagraph,
        PlatformInstructionsEditorHeading,
        PlatformInstructionsEditorTextAlign,
        Placeholder.configure({
          placeholder,
          showOnlyCurrent: true,
          showOnlyWhenEditable: true,
        }),
        PlatformInstructionsEditorSlashSearchHint,
        PlatformInstructionsEditorImageNode.configure({
          allowBase64: false,
          HTMLAttributes: {
            class: "platform-instructions-editor__image platform-markdown__image",
          },
          getFileUpload: () => fileUploadRef.current,
        }),
        PlatformInstructionsEditorFileNode.configure({
          getFileUpload: () => fileUploadRef.current,
        }),
        PlatformInstructionsEditorTableNode.configure({
          resizable: false,
          cellMinWidth: 120,
        }),
        TableKit.configure({ table: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        ParagraphQuote,
        Markdown,
      ],
      content: normalizePlatformInstructionsEditorMarkdownImages(value),
      contentType: "markdown",
      editable: !readOnly,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: "platform-instructions-editor__prosemirror platform-markdown",
          role: "textbox",
          "aria-label": ariaLabel,
          "aria-multiline": "true",
          spellcheck: "true",
        },
      },
      onUpdate: ({ editor }) => {
        const nextValue = editor.getMarkdown();
        if (externalValueRef.current === nextValue) return;
        const changeContext = changeContextRef.current;
        const isUserInitiated = changeContext.source !== "edit" || userInteractionRef.current;
        if (!isUserInitiated) {
          externalValueRef.current = nextValue;
          return;
        }
        externalValueRef.current = nextValue;
        onChangeRef.current(nextValue, changeContext);
      },
      onCreate: ({ editor }) => {
        refreshToolbarState(editor);
        refreshSlashMenuState(editor);
        refreshMentionMenuState(editor);
      },
      onTransaction: ({ editor }) => {
        refreshToolbarState(editor);
        refreshSlashMenuState(editor);
        refreshMentionMenuState(editor);
      },
      onSelectionUpdate: ({ editor }) => {
        refreshToolbarState(editor);
        refreshSlashMenuState(editor);
        refreshMentionMenuState(editor);
      },
      onFocus: () => setEditingState(true),
      onBlur: () => setEditingState(false),
    },
    [historyKey, placeholder, ariaLabel, refreshMentionMenuState],
  );

  useEffect(() => {
    if (richTextEditor.isDestroyed) return;
    richTextEditor.setEditable(!readOnly);
  }, [readOnly, richTextEditor]);

  useEffect(() => {
    setPlatformInstructionsEditorSlashSearchHint(
      richTextEditor,
      Boolean(
        slashMenuState &&
          slashMenuState.to > slashMenuState.from &&
          slashMenuState.query.length === 0,
      ),
    );
  }, [
    richTextEditor,
    slashMenuState?.from,
    slashMenuState?.to,
    slashMenuState?.query,
  ]);

  useEffect(() => {
    if (richTextEditor.isDestroyed) return;
    const nextValue = String(value || "");
    if (externalValueRef.current === nextValue) return;
    externalValueRef.current = nextValue;
    richTextEditor.commands.setContent(
      normalizePlatformInstructionsEditorMarkdownImages(nextValue),
      {
      contentType: "markdown",
      emitUpdate: false,
      },
    );
  }, [richTextEditor, value]);

  useEffect(() => {
    setContentExpanded(false);
  }, [historyKey, normalizedCollapsedLines]);

  useLayoutEffect(() => {
    if (!collapseEnabled) {
      setContentExceedsCollapsedHeight(false);
      return undefined;
    }
    const viewport = contentViewportRef.current;
    if (!viewport) return undefined;
    const content =
      viewport.querySelector<HTMLElement>(
      ".platform-instructions-editor__prosemirror, .platform-instructions-editor__readonly",
    ) || viewport;
    const measure = () => {
      const computedStyle = window.getComputedStyle(content);
      const fontSize = Number.parseFloat(computedStyle.fontSize) || 12;
      const rawLineHeight = Number.parseFloat(computedStyle.lineHeight);
      const lineHeight = Number.isFinite(rawLineHeight)
        ? rawLineHeight < 4
          ? rawLineHeight * fontSize
          : rawLineHeight
        : fontSize * 1.6;
      const collapsedHeight = normalizedCollapsedLines * lineHeight;
      const renderedHeight = Math.max(
        viewport.scrollHeight,
        content.scrollHeight,
        content.getBoundingClientRect().height,
      );
      const nextExceedsCollapsedHeight = renderedHeight > collapsedHeight + 1;
      setContentExceedsCollapsedHeight((current) =>
        current === nextExceedsCollapsedHeight ? current : nextExceedsCollapsedHeight,
      );
    };
    measure();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    resizeObserver?.observe(viewport);
    if (content !== viewport) resizeObserver?.observe(content);
    return () => resizeObserver?.disconnect();
  }, [collapseEnabled, normalizedCollapsedLines, richTextEditor, value]);

  useLayoutEffect(() => {
    if (richTextEditor.isDestroyed) return undefined;
    const element = richTextEditor.view.dom as HTMLElement;
    assignRef(forwardedEditorRef, element);
    assignRef(forwardedTextareaRef, element as unknown as HTMLTextAreaElement);
    return () => {
      assignRef(forwardedEditorRef, null);
      assignRef(forwardedTextareaRef, null);
    };
  }, [forwardedEditorRef, forwardedTextareaRef, richTextEditor]);

  useEffect(() => {
    if (!autoFocus || readOnly || richTextEditor.isDestroyed) return undefined;
    const focusEditor = () => {
      if (richTextEditor.isDestroyed) return;
      richTextEditor.commands.focus("end", { scrollIntoView: false });
    };
    if (typeof window.requestAnimationFrame === "function") {
      const frame = window.requestAnimationFrame(focusEditor);
      return () => window.cancelAnimationFrame(frame);
    }
    const timer = window.setTimeout(focusEditor, 0);
    return () => window.clearTimeout(timer);
  }, [autoFocus, historyKey, readOnly, richTextEditor]);

  useEffect(() => {
    if (!showHeader || !stickyHeader || readOnly) {
      setHeaderStuck(false);
      return undefined;
    }
    const shell = shellRef.current;
    const header = headerRef.current;
    if (!shell || !header) return undefined;

    const scrollContainer = findInstructionsEditorScrollContainer(shell);
    const updateStickyState = () => {
      const editorRect = shell.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const scrollTop = scrollContainer?.getBoundingClientRect().top || 0;
      const stickyOffset = Number.parseFloat(window.getComputedStyle(header).top) || 0;
      const pinnedTop = scrollTop + stickyOffset;
      const nextHeaderStuck =
        editorRect.top < headerRect.top - 0.5 && Math.abs(headerRect.top - pinnedTop) <= 2;
      setHeaderStuck((current) => (current === nextHeaderStuck ? current : nextHeaderStuck));
    };

    const scrollTarget: HTMLElement | Window = scrollContainer || window;
    updateStickyState();
    scrollTarget.addEventListener("scroll", updateStickyState, {
      passive: true,
    });
    window.addEventListener("resize", updateStickyState);
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateStickyState);
    resizeObserver?.observe(shell);
    if (scrollContainer) resizeObserver?.observe(scrollContainer);

    return () => {
      scrollTarget.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
      resizeObserver?.disconnect();
    };
  }, [readOnly, showHeader, stickyHeader]);

  const getInsertionTarget = useCallback(
    (appendWhenBlurred = true): InstructionsEditorInsertionTarget => {
      if (!richTextEditor.isFocused && appendWhenBlurred) {
        return {
          from: richTextEditor.state.doc.content.size,
          to: richTextEditor.state.doc.content.size,
          append: true,
        };
      }
      return {
        from: richTextEditor.state.selection.from,
        to: richTextEditor.state.selection.to,
        append: false,
      };
    },
    [richTextEditor],
  );

  const insertUploadedFiles = useCallback(
    (
      uploadedFiles: PlatformInstructionsEditorUploadedFile[],
      sourceFiles: File[],
      target: InstructionsEditorInsertionTarget,
    ) => {
      const normalizedFiles = normalizeUploadedFiles(uploadedFiles, sourceFiles);
      if (!normalizedFiles.length) {
        throw new Error("The file upload completed without a usable file URL.");
      }
      const documentEnd = richTextEditor.state.doc.content.size;
      const from = target.append ? documentEnd : Math.max(0, Math.min(target.from, documentEnd));
      const to = target.append ? from : Math.max(from, Math.min(target.to, documentEnd));
      const content = normalizedFiles.flatMap((uploadedFile, index) => {
        const kind = resolvePlatformFileExplorerFileKind({
          name: uploadedFile.name,
          mimeType: uploadedFile.mimeType,
        });
        const node =
          kind === "image"
          ? {
              type: "image",
              attrs: {
                src: normalizePlatformInstructionsEditorImageSource(uploadedFile.src),
                alt: uploadedFile.alt || uploadedFile.name || "",
                title: uploadedFile.title || null,
                displaySize: "medium",
                alignment: "left",
                attachmentId: uploadedFile.attachmentId || "",
                fileSize: uploadedFile.size || 0,
                mimeType: uploadedFile.mimeType || "",
              },
            }
          : {
              type: "attachment",
              attrs: {
                src: uploadedFile.src,
                name: uploadedFile.name || "Attachment",
                size: uploadedFile.size || 0,
                mimeType: uploadedFile.mimeType || "",
                attachmentId: uploadedFile.attachmentId || "",
              },
            };
        return [node, ...(index === normalizedFiles.length - 1 ? [{ type: "paragraph" }] : [])];
      });
      changeContextRef.current = {
        source: fileUpload ? "file-upload" : "image-upload",
        uploadedFiles: normalizedFiles,
      };
      try {
        richTextEditor
          .chain()
          .focus()
          .insertContentAt({ from, to }, content, { updateSelection: true })
          .run();
      } finally {
        changeContextRef.current = { source: "edit" };
      }
    },
    [fileUpload, richTextEditor],
  );

  const uploadFiles = useCallback(
    async (files: File[], target: InstructionsEditorInsertionTarget) => {
      const uploadConfig = fileUploadRef.current;
      const normalizedFiles = getUploadFiles(files).filter((candidate) =>
        fileUpload || !imageUpload
          ? true
          : String(candidate.type || "")
              .toLowerCase()
              .startsWith("image/"),
      );
      const upload = uploadConfig?.upload;
      if (!upload || normalizedFiles.length === 0 || uploadingRef.current || uploadConfig?.disabled)
        return;
      uploadingRef.current = true;
      setFileUploading(true);
      setFileUploadError("");
      try {
        const uploadedFiles = await upload(normalizedFiles);
        insertUploadedFiles(uploadedFiles, normalizedFiles, target);
      } catch (error) {
        setFileUploadError(error instanceof Error ? error.message : "Failed to upload file.");
      } finally {
        uploadingRef.current = false;
        setFileUploading(false);
      }
    },
    [fileUpload, imageUpload, insertUploadedFiles],
  );

  const openFilePicker = () => {
    if (fileUploading || fileUploadRef.current?.disabled) return;
    insertionTargetRef.current = getInsertionTarget();
    fileInputRef.current?.click();
  };

  const insertPrompt = useCallback(
    (prompt: PlatformInstructionsEditorPrompt, target: InstructionsEditorInsertionTarget) => {
      const markdown = resolveInstructionsEditorPromptMarkdown(prompt);
      if (!markdown.trim()) {
        throw new Error("The selected prompt does not contain any text.");
      }
      const documentEnd = richTextEditor.state.doc.content.size;
      const from = target.append ? documentEnd : Math.max(0, Math.min(target.from, documentEnd));
      const to = target.append ? from : Math.max(from, Math.min(target.to, documentEnd));
      changeContextRef.current = {
        source: "prompt-insert",
        prompt,
      };
      try {
        richTextEditor
          .chain()
          .focus()
          .insertContentAt({ from, to }, markdown, {
            contentType: "markdown",
            updateSelection: true,
          })
          .run();
      } finally {
        changeContextRef.current = { source: "edit" };
      }
    },
    [richTextEditor],
  );

  const openPromptPicker = () => {
    if (!promptInsertion || promptInsertion.disabled) return;
    promptInsertionTargetRef.current = getInsertionTarget();
    promptInsertion.openSearch((prompt) => {
      const target = promptInsertionTargetRef.current || getInsertionTarget();
      promptInsertionTargetRef.current = null;
      insertPrompt(prompt, target);
    });
  };

  const handleFileDrop = (event: DragEvent<HTMLElement>) => {
    if (!hasFileTransfer(event) || !fileUploadRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    setFileDragging(false);
    const files = getUploadFiles(event.dataTransfer?.files);
    if (!files.length) return;
    let dropPosition: number | undefined;
    try {
      dropPosition = richTextEditor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos;
    } catch {
      dropPosition = undefined;
    }
    const target =
      typeof dropPosition === "number"
        ? { from: dropPosition, to: dropPosition, append: false }
        : getInsertionTarget();
    void uploadFiles(files, target);
  };

  const handleEditorContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (readOnly || richTextEditor.isDestroyed) return;
    const target = event.target;
    if (target instanceof Element && target.closest('[contenteditable="false"]')) return;

    const selectedRange = getInstructionsEditorTextSelectionRange(richTextEditor);
    let contextPosition: number | undefined;
    try {
      contextPosition = richTextEditor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      })?.pos;
    } catch {
      contextPosition = undefined;
    }

    const contextIsInsideSelection =
      selectedRange !== null &&
      (typeof contextPosition !== "number" ||
        (contextPosition >= selectedRange.from && contextPosition <= selectedRange.to));

    if (selectedRange && contextIsInsideSelection) {
      event.preventDefault();
      event.stopPropagation();
      userInteractionRef.current = true;
      richTextEditor.commands.setTextSelection(selectedRange);
      setActiveToolbarMenu(null);
      slashMenuStateRef.current = null;
      setSlashMenuState(null);
      setTextSelectionMenuState({
        ...selectedRange,
        anchorPoint: { x: event.clientX, y: event.clientY },
        blockType: getInstructionsEditorSelectionBlockType(richTextEditor, selectedRange),
        bold: richTextEditor.isActive("bold"),
        italic: richTextEditor.isActive("italic"),
        underline: richTextEditor.isActive("underline"),
        alignment: getInstructionsEditorTextAlignment(richTextEditor),
      });
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    userInteractionRef.current = true;
    setTextSelectionMenuState(null);
    setActiveToolbarMenu(null);
    const fallbackPosition = richTextEditor.state.selection.from;
    const requestedPosition =
      typeof contextPosition === "number" ? contextPosition : fallbackPosition;
    richTextEditor.chain().focus().setTextSelection(requestedPosition).run();
    const caretPosition = richTextEditor.state.selection.from;
    const contextMenuState: InstructionsEditorSlashMenuState = {
      from: caretPosition,
      to: caretPosition,
      query: "",
      anchor: {
        left: event.clientX,
        top: event.clientY,
        bottom: event.clientY + 1,
      },
    };
    slashMenuStateRef.current = contextMenuState;
    setSlashMenuActiveIndex(0);
    setSlashMenuState(contextMenuState);
  };

  const applyTextSelectionCommand = (
    command: "bold" | "italic" | "underline" | PlatformInstructionsEditorTextAlignment,
  ) => {
    const selectedRange = textSelectionMenuState;
    if (!selectedRange || readOnly || richTextEditor.isDestroyed) return;
    const documentEnd = richTextEditor.state.doc.content.size;
    const from = Math.max(0, Math.min(selectedRange.from, documentEnd));
    const to = Math.max(from, Math.min(selectedRange.to, documentEnd));
    if (from === to) return;
    userInteractionRef.current = true;
    const chain = richTextEditor.chain().focus().setTextSelection({ from, to });
    if (command === "bold") chain.toggleBold().run();
    else if (command === "italic") chain.toggleItalic().run();
    else if (command === "underline") chain.toggleUnderline().run();
    else chain.setTextAlign(command).run();
    setTextSelectionMenuState((current) => current ? {
      ...current,
      blockType: getInstructionsEditorSelectionBlockType(richTextEditor, selectedRange),
      bold: richTextEditor.isActive("bold"),
      italic: richTextEditor.isActive("italic"),
      underline: richTextEditor.isActive("underline"),
      alignment: getInstructionsEditorTextAlignment(richTextEditor),
    } : current);
  };

  const applyTextSelectionBlockType = (
    blockType: Exclude<PlatformInstructionsEditorSelectionBlockType, "multiple">,
  ) => {
    const selectedRange = textSelectionMenuState;
    if (!selectedRange || readOnly || richTextEditor.isDestroyed) return;
    if (selectedRange.blockType === blockType) return;
    const documentEnd = richTextEditor.state.doc.content.size;
    const from = Math.max(0, Math.min(selectedRange.from, documentEnd));
    const to = Math.max(from, Math.min(selectedRange.to, documentEnd));
    if (from === to) return;
    userInteractionRef.current = true;

    let chain = richTextEditor.chain().focus().setTextSelection({ from, to });
    if (blockType === "bullet-list") chain.toggleBulletList().run();
    else if (blockType === "ordered-list") chain.toggleOrderedList().run();
    else if (blockType === "task-list") chain.toggleTaskList().run();
    else {
      chain = chain.clearNodes();
      if (blockType === "paragraph") chain.setParagraph().run();
      else if (blockType === "heading-1") chain.setHeading({ level: 1 }).run();
      else if (blockType === "heading-2") chain.setHeading({ level: 2 }).run();
      else if (blockType === "heading-3") chain.setHeading({ level: 3 }).run();
      else if (blockType === "paragraph-quote") chain.setNode("paragraphQuote").run();
      else if (blockType === "block-quote") chain.setBlockquote().run();
      else chain.setCodeBlock().run();
    }

    const nextSelection = richTextEditor.state.selection;
    const nextRange = nextSelection.empty
      ? { from, to }
      : { from: nextSelection.from, to: nextSelection.to };
    setTextSelectionMenuState((current) => current ? {
      ...current,
      ...nextRange,
      blockType: getInstructionsEditorSelectionBlockType(richTextEditor, nextRange),
      bold: richTextEditor.isActive("bold"),
      italic: richTextEditor.isActive("italic"),
      underline: richTextEditor.isActive("underline"),
      alignment: getInstructionsEditorTextAlignment(richTextEditor),
    } : current);
  };

  const preserveEditorFocus = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();
  const toolbarButton = (
    label: string,
    icon: ReactNode,
    onClick: () => void,
    options: { disabled?: boolean; active?: boolean; className?: string } = {},
  ) => (
    <button
      key={label}
      type="button"
      className={`platform-instructions-editor__toolbar-button playground-tasks-detail-format-button${options.active ? " is-active" : ""}${options.className ? ` ${options.className}` : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={options.active || undefined}
      disabled={options.disabled}
      onMouseDown={preserveEditorFocus}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  const applyBlockStyle = (style: InstructionsEditorBlockStyle) => {
    if (readOnly) return;
    let chain = richTextEditor.chain().focus();
    if (richTextEditor.isActive("blockquote")) chain = chain.unsetBlockquote();
    chain = chain.setParagraph();
    if (style === "heading-1") chain = chain.setHeading({ level: 1 });
    if (style === "heading-2") chain = chain.setHeading({ level: 2 });
    if (style === "heading-3") chain = chain.setHeading({ level: 3 });
    if (style === "paragraph-quote") chain = chain.setNode("paragraphQuote");
    if (style === "block-quote") chain = chain.setBlockquote();
    if (style === "preformatted") chain = chain.setCodeBlock();
    chain.run();
  };

  const updateLink = () => {
    if (readOnly) return;
    const currentHref = String(richTextEditor.getAttributes("link").href || "");
    const selection = richTextEditor.state.selection;
    const selectedText = richTextEditor.state.doc.textBetween(selection.from, selection.to, " ");
    const linkWasActive = richTextEditor.isActive("link");
    const href = window.prompt("Link URL", currentHref || "https://");
    if (href === null) return;
    const normalizedHref = normalizeInstructionsEditorLinkHref(href);
    if (!String(href || "").trim()) {
      richTextEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!normalizedHref) return;
    if (!selection.empty || linkWasActive) {
      let chain = richTextEditor.chain().focus();
      if (!selection.empty) {
        chain = chain.setTextSelection({
          from: selection.from,
          to: selection.to,
        });
      } else {
        chain = chain.extendMarkRange("link");
      }
      chain.setLink({ href: normalizedHref }).run();
      return;
    }
    richTextEditor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: selectedText || String(href || "").trim() || normalizedHref,
        marks: [{ type: "link", attrs: { href: normalizedHref } }],
      })
      .run();
  };

  const fileUploadConfig = fileUpload || imageUpload;
  const fileUploadEnabled =
    (contentVariant === "file-enabled" || contentVariant === "image-enabled") &&
    Boolean(fileUploadConfig);
  const insertTable = () => {
    if (readOnly || richTextEditor.isActive("table")) return;
    richTextEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };
  const styleMenuOptions: InstructionsEditorSlashCommandOption[] = [
    {
      id: "paragraph",
      label: "Paragraph",
      group: "Basic blocks",
      keywords: ["normal", "text"],
      icon: <Pilcrow width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.paragraph,
      onSelect: () => applyBlockStyle("paragraph"),
    },
    {
      id: "heading-1",
      label: "Heading 1",
      group: "Basic blocks",
      menuHint: "#",
      keywords: ["h1", "title"],
      icon: <Heading1 width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.heading1,
      onSelect: () => applyBlockStyle("heading-1"),
    },
    {
      id: "heading-2",
      label: "Heading 2",
      group: "Basic blocks",
      menuHint: "##",
      keywords: ["h2", "subtitle"],
      icon: <Heading2 width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.heading2,
      onSelect: () => applyBlockStyle("heading-2"),
    },
    {
      id: "heading-3",
      label: "Heading 3",
      group: "Basic blocks",
      menuHint: "###",
      keywords: ["h3", "subtitle"],
      icon: <Heading3 width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.heading3,
      onSelect: () => applyBlockStyle("heading-3"),
    },
    {
      id: "paragraph-quote",
      label: "Paragraph quote",
      group: "Basic blocks",
      menuHint: ">",
      keywords: ["quote", "callout"],
      icon: <TextQuote width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.paragraphQuote,
      onSelect: () => applyBlockStyle("paragraph-quote"),
    },
    {
      id: "block-quote",
      label: "Block quote",
      group: "Basic blocks",
      keywords: ["quote", "citation"],
      icon: <Quote width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.blockquote,
      onSelect: () => applyBlockStyle("block-quote"),
    },
    {
      id: "preformatted",
      label: "Preformatted",
      group: "Basic blocks",
      menuHint: "```",
      keywords: ["monospace", "plain code"],
      icon: <SquareCode width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.codeBlock,
      onSelect: () => applyBlockStyle("preformatted"),
    },
  ];
  const formattingMenuOptions: InstructionsEditorSlashCommandOption[] = [
    {
      id: "bold",
      label: "Bold",
      group: "Text formatting",
      keywords: ["strong"],
      icon: <Bold width={14} height={14} strokeWidth={2.7} />,
      active: toolbarState.bold,
      onSelect: () => richTextEditor.chain().focus().toggleBold().run(),
    },
    {
      id: "italic",
      label: "Italic",
      group: "Text formatting",
      keywords: ["emphasis"],
      icon: <Italic width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.italic,
      onSelect: () => richTextEditor.chain().focus().toggleItalic().run(),
    },
    {
      id: "underline",
      label: "Underline",
      group: "Text formatting",
      icon: <Underline width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.underline,
      onSelect: () => richTextEditor.chain().focus().toggleUnderline().run(),
    },
  ];
  const alignmentMenuOptions: InstructionsEditorSlashCommandOption[] = [
    {
      id: "align-left",
      label: "Align left",
      group: "Text formatting",
      keywords: ["text alignment", "left aligned"],
      icon: <AlignLeft width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.alignment === "left",
      onSelect: () => richTextEditor.chain().focus().setTextAlign("left").run(),
    },
    {
      id: "align-center",
      label: "Align center",
      group: "Text formatting",
      keywords: ["text alignment", "centered", "centred"],
      icon: <AlignCenter width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.alignment === "center",
      onSelect: () => richTextEditor.chain().focus().setTextAlign("center").run(),
    },
    {
      id: "align-right",
      label: "Align right",
      group: "Text formatting",
      keywords: ["text alignment", "right aligned"],
      icon: <AlignRight width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.alignment === "right",
      onSelect: () => richTextEditor.chain().focus().setTextAlign("right").run(),
    },
    {
      id: "align-justify",
      label: "Align justify",
      group: "Text formatting",
      keywords: ["text alignment", "justified", "full width"],
      icon: <AlignJustify width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.alignment === "justify",
      onSelect: () => richTextEditor.chain().focus().setTextAlign("justify").run(),
    },
  ];
  const listMenuOptions: InstructionsEditorSlashCommandOption[] = [
    {
      id: "bullet-list",
      label: "Bulleted list",
      group: "Basic blocks",
      menuHint: "-",
      keywords: ["unordered list", "list"],
      icon: <List width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.bulletList,
      onSelect: () => richTextEditor.chain().focus().toggleBulletList().run(),
    },
    {
      id: "ordered-list",
      label: "Numbered list",
      group: "Basic blocks",
      menuHint: "1.",
      keywords: ["ordered list", "list"],
      icon: <ListOrdered width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.orderedList,
      onSelect: () => richTextEditor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: "task-list",
      label: "Checklist",
      group: "Basic blocks",
      menuHint: "[]",
      keywords: ["todo list", "task list", "check list"],
      icon: <ListTodo width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.taskList,
      onSelect: () => richTextEditor.chain().focus().toggleTaskList().run(),
    },
  ];
  const insertMenuOptions: InstructionsEditorSlashCommandOption[] = [
    {
      id: "code",
      label: "Code",
      group: "Insert",
      keywords: ["inline code"],
      icon: <CodeXml width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.code,
      onSelect: () => richTextEditor.chain().focus().toggleCode().run(),
    },
    {
      id: "link",
      label: "Link",
      group: "Insert",
      keywords: ["url", "hyperlink"],
      icon: <Link2 width={14} height={14} strokeWidth={1.8} />,
      active: toolbarState.link,
      onSelect: updateLink,
    },
    {
      id: "file",
      label: "File",
      group: "Recommended",
      keywords: ["attachment", "document", "media", "picture", "upload"],
      icon: <FilePlus2 width={14} height={14} strokeWidth={1.8} />,
      disabled: !fileUploadEnabled || fileUploading || fileUploadConfig?.disabled,
      title: fileUploadEnabled ? "Add file" : "File upload is not available in this editor",
      onSelect: openFilePicker,
    },
    {
      id: "table",
      label: "Table",
      group: "Recommended",
      keywords: ["grid", "rows", "columns", "spreadsheet"],
      icon: <Table2 width={14} height={14} strokeWidth={1.8} />,
      disabled: toolbarState.table,
      title: toolbarState.table
        ? "Move outside the current table to insert another table"
        : "Insert a 3 by 3 table",
      onSelect: insertTable,
    },
    {
      id: "divider",
      label: "Divider",
      group: "Insert",
      keywords: ["horizontal rule", "separator", "line"],
      icon: <Minus width={14} height={14} strokeWidth={1.8} />,
      onSelect: () => richTextEditor.chain().focus().setHorizontalRule().run(),
    },
  ];
  const promptInsertMenuOption: InstructionsEditorSlashCommandOption | null =
    promptInsertion
      ? {
          id: "prompt",
          label: "Prompt",
          group: "Recommended",
          keywords: ["saved prompt", "centralized prompt", "instructions"],
          icon: <MessageSquareText width={14} height={14} strokeWidth={1.8} />,
          disabled: promptInsertion.disabled,
          title: "Insert a saved prompt",
          onSelect: openPromptPicker,
        }
      : null;
  const toolbarInsertMenuOptions = promptInsertMenuOption
    ? [...insertMenuOptions.slice(0, 3), promptInsertMenuOption, ...insertMenuOptions.slice(3)]
    : insertMenuOptions;
  const slashCommandOptions = [
    ...(promptInsertMenuOption ? [promptInsertMenuOption] : []),
    ...insertMenuOptions.filter((option) => option.group === "Recommended"),
    ...styleMenuOptions,
    ...listMenuOptions,
    ...formattingMenuOptions,
    ...alignmentMenuOptions,
    ...insertMenuOptions.filter((option) => option.group !== "Recommended"),
  ];
  const filteredSlashCommandOptions = filterInstructionsEditorSlashCommands(
    slashCommandOptions,
    slashMenuState?.query || "",
  );
  const filteredMentionOptions = useMemo(
    () => filterInstructionsEditorMentionOptions(mentionOptions, mentionMenuState?.query || ""),
    [mentionMenuState?.query, mentionOptions],
  );

  useEffect(() => {
    setSlashMenuActiveIndex((currentIndex) => {
      if (!filteredSlashCommandOptions.length) return 0;
      if (
        currentIndex < filteredSlashCommandOptions.length &&
        !filteredSlashCommandOptions[currentIndex]?.disabled
      ) {
        return currentIndex;
      }
      const firstEnabledIndex = filteredSlashCommandOptions.findIndex((option) => !option.disabled);
      return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
    });
  }, [filteredSlashCommandOptions.length, slashMenuState?.query]);

  useEffect(() => {
    setMentionMenuActiveIndex((currentIndex) =>
      filteredMentionOptions.length ? Math.min(currentIndex, filteredMentionOptions.length - 1) : 0,
    );
  }, [filteredMentionOptions.length, mentionMenuState?.query]);

  const dismissSlashMenu = () => {
    const currentState = slashMenuStateRef.current;
    if (currentState && currentState.to > currentState.from) {
      dismissedSlashPositionRef.current = currentState.from;
    }
    slashMenuStateRef.current = null;
    setSlashMenuState(null);
    setSlashMenuActiveIndex(0);
  };

  const dismissMentionMenu = () => {
    mentionMenuStateRef.current = null;
    setMentionMenuState(null);
    setMentionMenuActiveIndex(0);
    onMentionQueryChangeRef.current?.(null);
  };

  const refreshTextSelectionMenuState = () => {
    if (readOnly || richTextEditor.isDestroyed) return;
    const selectedRange = getInstructionsEditorTextSelectionRange(richTextEditor);
    const selectedText = selectedRange
      ? richTextEditor.state.doc.textBetween(selectedRange.from, selectedRange.to, " ")
      : "";
    const anchorPoint = selectedRange
      ? getInstructionsEditorTextSelectionAnchorPoint(richTextEditor)
      : null;
    if (!selectedRange || !selectedText || !anchorPoint) {
      setTextSelectionMenuState(null);
      return;
    }

    setActiveToolbarMenu(null);
    dismissSlashMenu();
    dismissMentionMenu();
    setTextSelectionMenuState({
      ...selectedRange,
      anchorPoint,
      blockType: getInstructionsEditorSelectionBlockType(richTextEditor, selectedRange),
      bold: richTextEditor.isActive("bold"),
      italic: richTextEditor.isActive("italic"),
      underline: richTextEditor.isActive("underline"),
      alignment: getInstructionsEditorTextAlignment(richTextEditor),
    });
  };

  const handleEditorContentMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (readOnly || event.button !== 0 || richTextEditor.isDestroyed) return;

    const editorElement = richTextEditor.view.dom;
    const target = event.target;
    if (!(target instanceof Node)) return;

    // Let ProseMirror handle clicks inside existing blocks. We only provide the
    // Notion-style affordance for otherwise inert whitespace below the document.
    if (target !== editorElement && target !== event.currentTarget) return;
    const lastBlock = editorElement.lastElementChild;
    if (!(lastBlock instanceof HTMLElement)) return;
    if (event.clientY <= lastBlock.getBoundingClientRect().bottom + 1) return;

    event.preventDefault();
    userInteractionRef.current = true;
    editorElement.focus({ preventScroll: true });
    setActiveToolbarMenu(null);
    setTextSelectionMenuState(null);
    dismissSlashMenu();
    dismissMentionMenu();

    const lastNode = richTextEditor.state.doc.lastChild;
    if (lastNode?.isTextblock && lastNode.content.size === 0) {
      richTextEditor.commands.focus("end", { scrollIntoView: false });
      return;
    }

    richTextEditor
      .chain()
      .insertContentAt(richTextEditor.state.doc.content.size, { type: "paragraph" })
      .focus("end", { scrollIntoView: false })
      .run();
  };

  const handleBlockDragStart = useCallback(() => {
    userInteractionRef.current = true;
    setActiveToolbarMenu(null);
    setTextSelectionMenuState(null);
    slashMenuStateRef.current = null;
    dismissedSlashPositionRef.current = null;
    setSlashMenuState(null);
    setSlashMenuActiveIndex(0);
    mentionMenuStateRef.current = null;
    setMentionMenuState(null);
    setMentionMenuActiveIndex(0);
    onMentionQueryChangeRef.current?.(null);
  }, []);

  const selectMention = (option: PlatformMentionOption) => {
    const menuState = mentionMenuStateRef.current;
    if (!menuState) return;
    dismissMentionMenu();
    richTextEditor
      .chain()
      .focus()
      .deleteRange({ from: menuState.from, to: menuState.to })
      .insertContent(`@${option.label} `)
      .run();
    onMentionSelectRef.current?.({
      kind: option.kind,
      id: option.id,
      label: option.label,
    });
  };

  const selectSlashCommand = (option: InstructionsEditorSlashCommandOption) => {
    const commandState = slashMenuStateRef.current;
    if (!commandState || option.disabled) return;
    dismissSlashMenu();
    if (commandState.to > commandState.from) {
      richTextEditor
        .chain()
        .focus()
        .deleteRange({ from: commandState.from, to: commandState.to })
        .run();
    } else {
      richTextEditor.chain().focus().setTextSelection(commandState.to).run();
    }
    option.onSelect();
  };

  const handleSlashMenuKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!slashMenuState) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissSlashMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setSlashMenuActiveIndex((currentIndex) =>
        getNextEnabledSlashCommandIndex(
          filteredSlashCommandOptions,
          currentIndex,
          event.key === "ArrowDown" ? 1 : -1,
        ),
      );
      return;
    }
    if (event.key !== "Enter" && event.key !== "Tab") return;
    const activeOption = filteredSlashCommandOptions[slashMenuActiveIndex];
    if (!activeOption || activeOption.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    selectSlashCommand(activeOption);
  };

  const handleMentionMenuKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!mentionMenuState) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissMentionMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setMentionMenuActiveIndex((currentIndex) =>
        filteredMentionOptions.length
          ? (currentIndex + direction + filteredMentionOptions.length) %
            filteredMentionOptions.length
          : 0,
      );
      return;
    }
    if (event.key !== "Enter" && event.key !== "Tab") return;
    const activeOption = filteredMentionOptions[mentionMenuActiveIndex];
    if (!activeOption) return;
    event.preventDefault();
    event.stopPropagation();
    selectMention(activeOption);
  };

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    handleMentionMenuKeyDown(event);
    if (event.defaultPrevented) return;
    handleSlashMenuKeyDown(event);
    if (
      !event.defaultPrevented &&
      event.altKey &&
      event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey &&
      event.key.toLowerCase() === "t"
    ) {
      event.preventDefault();
      dismissSlashMenu();
      insertTable();
      return;
    }
    if (
      event.defaultPrevented ||
      (event.key !== "Backspace" && event.key !== "Delete") ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    const deletionRange = getInstructionsEditorDeletionRange(
      richTextEditor,
      event.key === "Backspace" ? "backward" : "forward",
    );
    if (!deletionRange) return;
    const deleted = richTextEditor.chain().focus().deleteRange(deletionRange).run();
    if (!deleted) return;
    event.preventDefault();
    event.stopPropagation();
  };
  const dragHandlers =
    fileUploadEnabled && !readOnly
      ? {
          onDragEnterCapture: (event: DragEvent<HTMLElement>) => {
            if (!hasFileTransfer(event)) return;
            event.preventDefault();
            setFileDragging(true);
          },
          onDragOverCapture: (event: DragEvent<HTMLElement>) => {
            if (!hasFileTransfer(event)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          },
          onDragLeaveCapture: (event: DragEvent<HTMLElement>) => {
            const nextTarget = event.relatedTarget;
            if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
            setFileDragging(false);
          },
          onDropCapture: handleFileDrop,
        }
      : {};

  return (
    <section
      ref={shellRef}
      className={`platform-instructions-editor playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section${stickyHeader && !readOnly ? " is-sticky" : " is-static"}${readOnly ? " is-readonly" : ""}${editing && !readOnly ? " is-editing" : ""}${variant === "minimalistic-ui" || variant === "block-editor" ? " is-minimalistic-ui" : ""}${variant === "block-editor" ? " is-block-editor" : ""}${editorMode === "code" ? " is-code-editor" : ""}${fileUploadEnabled ? " is-file-enabled" : ""}${fileDragging ? " is-file-dragging" : ""}${fileUploading ? " is-file-uploading" : ""}${collapseEnabled ? " is-content-collapsible" : ""}${collapseEnabled && contentExceedsCollapsedHeight && !contentExpanded && !editing ? " is-content-collapsed" : ""}${collapseEnabled && (contentExpanded || editing) ? " is-content-expanded" : ""}${className ? ` ${className}` : ""}`}
      data-platform-instructions-editor="true"
      data-platform-instructions-editor-variant={variant}
      data-platform-instructions-editor-mode={editorMode}
      data-platform-instructions-editor-content-variant={contentVariant}
      data-platform-instructions-editor-collapsed-lines={
        collapseEnabled ? normalizedCollapsedLines : undefined
      }
      aria-busy={fileUploading || undefined}
      onPointerDownCapture={() => {
        userInteractionRef.current = true;
      }}
      onClickCapture={() => {
        userInteractionRef.current = true;
      }}
      onKeyDownCapture={() => {
        userInteractionRef.current = true;
      }}
      {...dragHandlers}
    >
      {showHeader ? (
      <header
        ref={headerRef}
        className={`platform-instructions-editor__header playground-tasks-detail-section-header${stickyHeader && !readOnly ? "" : " is-static-transparent"}${headerStuck ? " is-stuck" : ""}`}
          data-platform-instructions-editor-header-stuck={headerStuck ? "true" : undefined}
      >
        {typeof title === "string" || typeof title === "number" ? (
          <h2 className="platform-instructions-editor__title playground-tasks-detail-section-title">
            {title}
          </h2>
        ) : (
          <div className="platform-instructions-editor__title playground-tasks-detail-section-title">
            {title}
          </div>
        )}
        {!readOnly && editorMode === "rich-text" ? (
          <div
            className="platform-instructions-editor__toolbar playground-tasks-detail-format-actions"
            role="toolbar"
            aria-label="Markdown formatting"
          >
            <InstructionsEditorToolbarPopup
              open={activeToolbarMenu === "style"}
                onOpenChange={(open) => setActiveToolbarMenu(open ? "style" : null)}
              label="Style"
              triggerClassName="is-style-trigger"
              popupWidth={190}
              trigger={
                <>
                    <span className="platform-instructions-editor__toolbar-menu-label">Style</span>
                    <ChevronDown width={12} height={12} strokeWidth={1.8} aria-hidden="true" />
                </>
              }
              options={styleMenuOptions}
            />
            <span
              className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider"
              aria-hidden="true"
            />
            {toolbarButton(
              "Bold",
              formattingMenuOptions[0].icon,
              formattingMenuOptions[0].onSelect,
              { active: toolbarState.bold },
            )}
            {toolbarButton(
              "Italic",
              formattingMenuOptions[1].icon,
              formattingMenuOptions[1].onSelect,
              { active: toolbarState.italic },
            )}
            {toolbarButton(
              "Underline",
              formattingMenuOptions[2].icon,
              formattingMenuOptions[2].onSelect,
              { active: toolbarState.underline },
            )}
            <span
              className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider"
              aria-hidden="true"
            />
              {toolbarButton("List", listMenuOptions[0].icon, listMenuOptions[0].onSelect, {
                active: toolbarState.bulletList,
              })}
              {toolbarButton("Ordered list", listMenuOptions[1].icon, listMenuOptions[1].onSelect, {
                active: toolbarState.orderedList,
              })}
              {toolbarButton("Checklist", listMenuOptions[2].icon, listMenuOptions[2].onSelect, {
                active: toolbarState.taskList,
              })}
            <span
              className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider"
              aria-hidden="true"
            />
            <InstructionsEditorToolbarPopup
              open={activeToolbarMenu === "insert"}
                onOpenChange={(open) => setActiveToolbarMenu(open ? "insert" : null)}
              label="Insert"
              triggerClassName="is-insert-trigger"
              popupWidth={160}
              trigger={
                <>
                    <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                    <ChevronDown width={12} height={12} strokeWidth={1.8} aria-hidden="true" />
                </>
              }
              options={toolbarInsertMenuOptions}
            />
            {fileUploadEnabled ? (
              <input
                ref={fileInputRef}
                className="platform-instructions-editor__file-input"
                type="file"
                accept={fileUploadConfig?.accept}
                multiple
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  const files = getUploadFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                  if (!files.length) return;
                    const target = insertionTargetRef.current || getInsertionTarget();
                  insertionTargetRef.current = null;
                  void uploadFiles(files, target);
                }}
              />
            ) : null}
          </div>
        ) : null}
      </header>
      ) : null}
      <div className="platform-instructions-editor__body playground-tasks-detail-description-editor">
        <div
          ref={contentViewportRef}
          className="platform-instructions-editor__content-viewport"
          style={
            collapseEnabled
              ? ({
                  "--platform-instructions-editor-collapsed-lines": normalizedCollapsedLines,
                } as CSSProperties)
              : undefined
          }
        >
          {bodyTitle !== undefined && bodyTitle !== null ? (
            typeof bodyTitle === "string" || typeof bodyTitle === "number" ? (
              <h1 className="platform-instructions-editor__body-title">{bodyTitle}</h1>
            ) : (
              <div className="platform-instructions-editor__body-title">{bodyTitle}</div>
            )
          ) : null}
          {editorMode === "code" ? (
            <PlatformMonacoCodeEditor
              value={value}
              onChange={(nextValue) => {
                if (nextValue === value) return;
                onChangeRef.current(nextValue, { source: "edit" });
              }}
              language={codeLanguage}
              path={codePath}
              ariaLabel={ariaLabel}
              readOnly={readOnly}
              className="platform-instructions-editor__code-editor"
            />
          ) : readOnly ? (
            String(value || "").trim() ? (
              <PlatformMarkdownRenderer
                content={value}
                className="platform-instructions-editor__readonly platform-instructions-editor__preview playground-tasks-detail-description-preview tb-message-markdown"
                resolvePreviewSource={fileUploadConfig?.resolvePreviewSource}
              />
            ) : (
              <div className="platform-instructions-editor__readonly platform-instructions-editor__preview playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder">
                {placeholder}
              </div>
            )
          ) : (
            <>
              {variant === "block-editor" ? (
                <DragHandle
                  editor={richTextEditor}
                  className="platform-instructions-editor__block-drag-handle"
                  onElementDragStart={handleBlockDragStart}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    className="platform-instructions-editor__block-drag-handle-control"
                    aria-label="Move block"
                    title="Drag to move"
                  >
                    <GripVertical aria-hidden="true" />
                  </button>
                </DragHandle>
              ) : null}
              <EditorContent
                editor={richTextEditor}
                className="platform-instructions-editor__content"
                onMouseDown={handleEditorContentMouseDown}
                onKeyDownCapture={handleEditorKeyDown}
                onKeyUpCapture={() => {
                  refreshSlashMenuState(richTextEditor);
                  refreshMentionMenuState(richTextEditor);
                  refreshTextSelectionMenuState();
                }}
                onMouseUpCapture={() => {
                  refreshSlashMenuState(richTextEditor);
                  refreshMentionMenuState(richTextEditor);
                  refreshTextSelectionMenuState();
                }}
                onContextMenu={handleEditorContextMenu}
              />
            </>
          )}
        </div>
        {fileUploadError ? (
          <div className="platform-instructions-editor__upload-error" role="alert">
            {fileUploadError}
          </div>
        ) : null}
      </div>
      {collapseEnabled && contentExceedsCollapsedHeight ? (
        <div className="platform-instructions-editor__collapse-actions">
          <PlatformSecondaryButton
            type="button"
            size="compact"
            className="platform-instructions-editor__collapse-button"
            aria-expanded={contentExpanded || editing}
            onClick={() => setContentExpanded((current) => !current)}
          >
            {contentExpanded ? "Show less" : "Show more"}
          </PlatformSecondaryButton>
        </div>
      ) : null}
      {!readOnly && editorMode === "rich-text" ? (
        <PlatformInstructionsEditorTextSelectionMenu
          open={Boolean(textSelectionMenuState)}
          anchorPoint={textSelectionMenuState?.anchorPoint || null}
          blockType={textSelectionMenuState?.blockType || "paragraph"}
          bold={Boolean(textSelectionMenuState?.bold)}
          italic={Boolean(textSelectionMenuState?.italic)}
          underline={Boolean(textSelectionMenuState?.underline)}
          alignment={textSelectionMenuState?.alignment || "left"}
          onOpenChange={(open) => {
            if (!open) setTextSelectionMenuState(null);
          }}
          onBlockTypeChange={applyTextSelectionBlockType}
          onToggleBold={() => applyTextSelectionCommand("bold")}
          onToggleItalic={() => applyTextSelectionCommand("italic")}
          onToggleUnderline={() => applyTextSelectionCommand("underline")}
          onAlign={applyTextSelectionCommand}
        />
      ) : null}
      {!readOnly && editorMode === "rich-text" ? (
        <PlatformInstructionsEditorSlashMenu
          open={Boolean(slashMenuState)}
          anchor={slashMenuState?.anchor || null}
          options={filteredSlashCommandOptions}
          activeIndex={slashMenuActiveIndex}
          onActiveIndexChange={setSlashMenuActiveIndex}
          onSelect={selectSlashCommand}
          onDismiss={dismissSlashMenu}
        />
      ) : null}
      {!readOnly && editorMode === "rich-text" && mentionMenuState ? (
        <>
          <span
            ref={mentionPopupAnchorRef}
            className="platform-instructions-editor__mention-popup-anchor"
            aria-hidden="true"
          style={{
            position: "fixed",
            left: mentionMenuState.anchor.left,
              top: mentionMenuState.anchor.bottom - 4,
              width: 280,
              height: 0,
              pointerEvents: "none",
          }}
          />
          <PlatformMentionSuggestionsPopup
            options={filteredMentionOptions}
            activeIndex={mentionMenuActiveIndex}
            loading={mentionsLoading}
            emptyMessage={mentionEmptyMessage}
            placement="bottom"
            portal
            anchorRef={mentionPopupAnchorRef}
            onActiveIndexChange={setMentionMenuActiveIndex}
            onSelect={selectMention}
          />
        </>
      ) : null}
    </section>
  );
}
