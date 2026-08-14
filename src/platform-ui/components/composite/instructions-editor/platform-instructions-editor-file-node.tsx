import {
  createAtomBlockMarkdownSpec,
  mergeAttributes,
  Node as TiptapNode,
  parseAttributes,
  type Editor,
  type NodeViewProps,
} from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import type { MouseEvent as ReactMouseEvent } from "react";

import { PlatformAttachmentListItem } from "../attachments/index.js";
import {
  PlatformFileExplorerFileIcon,
  resolvePlatformFileExplorerFileKind,
} from "../file-explorer/index.js";

export interface PlatformInstructionsEditorUploadedFile {
  src: string;
  name?: string;
  size?: number;
  mimeType?: string;
  attachmentId?: string;
  alt?: string;
  title?: string;
  /** Opaque owner data returned with the file's insertion transaction. */
  metadata?: unknown;
}

export interface PlatformInstructionsEditorFileUpload {
  upload: (
    files: File[],
  ) => Promise<PlatformInstructionsEditorUploadedFile[]>;
  resolvePreviewSource?: (
    file: PlatformInstructionsEditorUploadedFile,
    signal: AbortSignal,
  ) => Promise<Blob | string | null | undefined>;
  accept?: string;
  disabled?: boolean;
  onActivate?: (file: PlatformInstructionsEditorUploadedFile) => void;
  onRename?: (
    file: PlatformInstructionsEditorUploadedFile,
    nextName: string,
  ) => void | Promise<void>;
  onRemove?: (
    file: PlatformInstructionsEditorUploadedFile,
  ) => void | Promise<void>;
}

export interface PlatformInstructionsEditorFileMarkdownMatch {
  raw: string;
  start: number;
  end: number;
  file: PlatformInstructionsEditorUploadedFile;
}

interface PlatformInstructionsEditorFileNodeOptions {
  getFileUpload: () => PlatformInstructionsEditorFileUpload | undefined;
}

interface MarkdownAstNode {
  type: string;
  value?: string;
  children?: MarkdownAstNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const attachmentMarkdown = createAtomBlockMarkdownSpec({
  nodeName: "attachment",
  name: "attachment",
  requiredAttributes: ["src", "name"],
  allowedAttributes: ["src", "name", "size", "mimeType", "attachmentId"],
});

function normalizeFileSize(value: unknown) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : 0;
}

export function normalizePlatformInstructionsEditorFile(
  file: Partial<PlatformInstructionsEditorUploadedFile> | null | undefined,
): PlatformInstructionsEditorUploadedFile | null {
  const src = String(file?.src || "").trim();
  const name = String(file?.name || file?.alt || "").trim();
  if (!src || !name) return null;
  return {
    src,
    name,
    size: normalizeFileSize(file?.size),
    mimeType: String(file?.mimeType || "").trim(),
    attachmentId: String(file?.attachmentId || "").trim(),
    alt: String(file?.alt || name).trim(),
    title: String(file?.title || "").trim(),
    metadata: file?.metadata,
  };
}

export function serializePlatformInstructionsEditorFileMarkdown(
  file: Partial<PlatformInstructionsEditorUploadedFile>,
) {
  const normalizedFile = normalizePlatformInstructionsEditorFile(file);
  if (!normalizedFile) return "";
  return attachmentMarkdown.renderMarkdown({
    attrs: {
      src: normalizedFile.src,
      name: normalizedFile.name,
      size: normalizedFile.size || 0,
      mimeType: normalizedFile.mimeType || "",
      attachmentId: normalizedFile.attachmentId || "",
    },
  });
}

export function parsePlatformInstructionsEditorFileMarkdown(
  markdown: unknown,
): PlatformInstructionsEditorFileMarkdownMatch[] {
  const value = String(markdown || "");
  const matches: PlatformInstructionsEditorFileMarkdownMatch[] = [];
  const attachmentDirectivePattern =
    /^:::attachment(?:[\t ]+\{([^}\r\n]*)\})?[\t ]+:::[\t ]*$/gm;
  let match: RegExpExecArray | null = null;
  while ((match = attachmentDirectivePattern.exec(value)) !== null) {
    const file = normalizePlatformInstructionsEditorFile(
      parseAttributes(match[1] || ""),
    );
    if (!file) continue;
    matches.push({
      raw: match[0],
      start: match.index,
      end: match.index + match[0].length,
      file,
    });
  }
  return matches;
}

export function formatPlatformInstructionsEditorFileSize(value: unknown) {
  const size = normalizeFileSize(value);
  if (!size) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    units.length - 1,
    Math.floor(Math.log(size) / Math.log(1024)),
  );
  const scaledSize = size / 1024 ** unitIndex;
  const maximumFractionDigits = unitIndex === 0 ? 0 : 2;
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(scaledSize)} ${units[unitIndex]}`;
}

function getFileFromNodeAttributes(attributes: Record<string, unknown>) {
  return normalizePlatformInstructionsEditorFile({
    src: String(attributes.src || ""),
    name: String(attributes.name || ""),
    size: Number(attributes.size || 0),
    mimeType: String(attributes.mimeType || ""),
    attachmentId: String(attributes.attachmentId || ""),
  });
}

function PlatformInstructionsEditorFilePreview({
  file,
  disabled = false,
  onActivate,
  onRename,
  onRemove,
  className = "",
}: {
  file: PlatformInstructionsEditorUploadedFile;
  disabled?: boolean;
  onActivate?: () => void;
  onRename?: (nextName: string) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  className?: string;
}) {
  const kind = resolvePlatformFileExplorerFileKind({
    name: file.name,
    mimeType: file.mimeType,
  });
  return (
    <PlatformAttachmentListItem
      id={file.attachmentId || file.src}
      name={file.name || "Attachment"}
      metadata={formatPlatformInstructionsEditorFileSize(file.size)}
      preview={<PlatformFileExplorerFileIcon kind={kind} />}
      disabled={disabled}
      onActivate={onActivate}
      onRename={onRename}
      onRemove={onRemove}
      removeLabel={`Remove ${file.name || "attachment"}`}
      className={className}
      role="group"
    />
  );
}

function PlatformInstructionsEditorFileNodeView({
  node,
  editor,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  getFileUpload,
}: NodeViewProps & {
  getFileUpload: () => PlatformInstructionsEditorFileUpload | undefined;
}) {
  const file = getFileFromNodeAttributes(node.attrs);
  if (!file) return <NodeViewWrapper />;
  const fileUpload = getFileUpload();
  const editable = editor.isEditable && !fileUpload?.disabled;
  const selectFile = () => {
    const position = getPos();
    if (typeof position !== "number") return;
    const selection = NodeSelection.create(editor.state.doc, position);
    editor.view.dispatch(editor.state.tr.setSelection(selection));
    editor.view.focus();
  };

  const handleRename = fileUpload?.onRename && editable
    ? async (nextName: string) => {
        await fileUpload.onRename?.(file, nextName);
        updateAttributes({ name: nextName });
      }
    : undefined;
  const handleRemove = editable
    ? async () => {
        deleteNode();
        await fileUpload?.onRemove?.(file);
      }
    : undefined;

  return (
    <NodeViewWrapper
      className={`platform-instructions-editor__attachment-node${selected ? " is-selected" : ""}`}
      contentEditable={false}
      data-drag-handle
      onMouseDown={(event: ReactMouseEvent<HTMLElement>) => {
        if (event.button === 0) selectFile();
      }}
      onContextMenuCapture={() => {
        if (editable) selectFile();
      }}
    >
      <PlatformInstructionsEditorFilePreview
        file={file}
        disabled={!editable}
        onActivate={fileUpload?.onActivate
          ? () => fileUpload.onActivate?.(file)
          : undefined}
        onRename={handleRename}
        onRemove={handleRemove}
      />
    </NodeViewWrapper>
  );
}

function getAdjacentAttachmentRange(
  editor: Editor,
  direction: "backward" | "forward",
) {
  const { selection } = editor.state;
  if (
    selection instanceof NodeSelection &&
    selection.node.type.name === "attachment"
  ) {
    return {
      from: selection.from,
      to: selection.to,
      file: getFileFromNodeAttributes(selection.node.attrs),
    };
  }
  if (!selection.empty) return null;
  const node = direction === "backward"
    ? selection.$from.nodeBefore
    : selection.$from.nodeAfter;
  if (node?.type.name !== "attachment") return null;
  return {
    from: direction === "backward"
      ? selection.from - node.nodeSize
      : selection.from,
    to: direction === "backward"
      ? selection.from
      : selection.from + node.nodeSize,
    file: getFileFromNodeAttributes(node.attrs),
  };
}

export const PlatformInstructionsEditorFileNode = TiptapNode.create<PlatformInstructionsEditorFileNodeOptions>({
  name: "attachment",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      getFileUpload: () => undefined,
    };
  },

  addAttributes() {
    return {
      src: { default: "" },
      name: { default: "" },
      size: { default: 0 },
      mimeType: { default: "" },
      attachmentId: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-platform-instructions-file="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-platform-instructions-file": "true",
      }),
    ];
  },

  parseMarkdown: attachmentMarkdown.parseMarkdown,
  markdownTokenizer: attachmentMarkdown.markdownTokenizer,
  renderMarkdown: attachmentMarkdown.renderMarkdown,

  addNodeView() {
    const getFileUpload = this.options.getFileUpload;
    return ReactNodeViewRenderer((props) => (
      <PlatformInstructionsEditorFileNodeView
        {...props}
        getFileUpload={getFileUpload}
      />
    ));
  },

  addKeyboardShortcuts() {
    const removeAdjacentAttachment = (direction: "backward" | "forward") => {
      const range = getAdjacentAttachmentRange(this.editor, direction);
      if (!range) return false;
      const fileUpload = this.options.getFileUpload();
      if (fileUpload?.disabled) return true;
      const removed = this.editor.commands.deleteRange({ from: range.from, to: range.to });
      if (removed && range.file) void fileUpload?.onRemove?.(range.file);
      return removed;
    };
    return {
      Backspace: () => removeAdjacentAttachment("backward"),
      Delete: () => removeAdjacentAttachment("forward"),
    };
  },
});

function getMarkdownAstText(node: MarkdownAstNode | undefined): string {
  if (!node) return "";
  if (typeof node.value === "string") return node.value;
  return (node.children || []).map(getMarkdownAstText).join("");
}

export function remarkPlatformInstructionsEditorFiles() {
  return (tree: unknown) => {
    const visitNode = (node: MarkdownAstNode) => {
      const children = node.children;
      if (!children?.length) return;
      children.forEach((child) => {
        if (child.type !== "paragraph") {
          visitNode(child);
          return;
        }
        const rawValue = getMarkdownAstText(child).trim();
        const match = /^:::attachment(?:\s+\{([^}]*)\})?\s+:::$/.exec(rawValue);
        if (!match) return;
        const file = normalizePlatformInstructionsEditorFile(
          parseAttributes(match[1] || ""),
        );
        if (!file) return;
        child.type = "platformInstructionsFile";
        child.children = [];
        child.data = {
          hName: "div",
          hProperties: {
            "data-platform-instructions-file": encodeURIComponent(
              JSON.stringify(file),
            ),
          },
        };
      });
    };
    visitNode(tree as MarkdownAstNode);
  };
}

export function decodePlatformInstructionsEditorFile(
  value: unknown,
): PlatformInstructionsEditorUploadedFile | null {
  try {
    return normalizePlatformInstructionsEditorFile(
      JSON.parse(decodeURIComponent(String(value || ""))),
    );
  } catch {
    return null;
  }
}

export { PlatformInstructionsEditorFilePreview };
