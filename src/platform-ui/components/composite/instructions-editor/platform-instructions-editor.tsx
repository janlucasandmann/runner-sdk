import {
  Bold,
  CodeXml,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

const HISTORY_LIMIT = 80;

type MarkdownFormat = "bold" | "italic" | "underline" | "list" | "ordered-list" | "code" | "link";

interface MarkdownEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

interface EditorHistory {
  past: string[];
  future: string[];
}

export interface PlatformMarkdownRendererProps {
  content: string;
  className?: string;
}

export type PlatformInstructionsEditorVariant = "default" | "minimalistic-ui";

export interface PlatformInstructionsEditorProps {
  value: string;
  onChange: (value: string) => void;
  title?: ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  stickyHeader?: boolean;
  historyKey?: string | number;
  variant?: PlatformInstructionsEditorVariant;
  className?: string;
  onEditingChange?: (editing: boolean) => void;
}

function remarkSoftbreaksToBreaks() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], "text", (node: { value?: string }, index, parent: { children?: unknown[] } | undefined) => {
      if (!parent?.children || typeof index !== "number" || typeof node.value !== "string" || !node.value.includes("\n")) return;
      const parts = node.value.split("\n");
      const replacement: Array<{ type: "text" | "break"; value?: string }> = [];
      parts.forEach((part, partIndex) => {
        if (part) replacement.push({ type: "text", value: part });
        if (partIndex < parts.length - 1) replacement.push({ type: "break" });
      });
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

function remarkUnderline() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], "text", (node: { value?: string }, index, parent: { children?: unknown[] } | undefined) => {
      if (!parent?.children || typeof index !== "number" || typeof node.value !== "string" || !node.value.includes("++")) return;
      const pattern = /\+\+([\s\S]+?)\+\+/g;
      const replacement: unknown[] = [];
      let cursor = 0;
      let match = pattern.exec(node.value);
      while (match) {
        if (match.index > cursor) replacement.push({ type: "text", value: node.value.slice(cursor, match.index) });
        replacement.push({
          type: "underline",
          data: { hName: "u" },
          children: [{ type: "text", value: match[1] || "" }],
        });
        cursor = match.index + match[0].length;
        match = pattern.exec(node.value);
      }
      if (!replacement.length) return;
      if (cursor < node.value.length) replacement.push({ type: "text", value: node.value.slice(cursor) });
      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

const markdownComponents: Components = {
  p: ({ node: _node, ...props }) => <p {...props} className="platform-markdown__paragraph tb-message-markdown-paragraph" />,
  strong: ({ node: _node, ...props }) => <strong {...props} className="platform-markdown__strong tb-message-markdown-strong" />,
  em: ({ node: _node, ...props }) => <em {...props} className="platform-markdown__em tb-message-markdown-em" />,
  code: ({ node: _node, className, ...props }) => (
    <code {...props} className={`${className ? "platform-markdown__code tb-message-markdown-code" : "platform-markdown__inline-code tb-message-markdown-inline-code"}${className ? ` ${className}` : ""}`} />
  ),
  pre: ({ node: _node, ...props }) => <pre {...props} className="platform-markdown__pre tb-message-markdown-pre" />,
  ul: ({ node: _node, ...props }) => <ul {...props} className="platform-markdown__list tb-message-markdown-list" />,
  ol: ({ node: _node, ...props }) => <ol {...props} className="platform-markdown__list is-ordered tb-message-markdown-list tb-message-markdown-list-ordered" />,
  li: ({ node: _node, ...props }) => <li {...props} className="platform-markdown__list-item tb-message-markdown-list-item" />,
  h1: ({ node: _node, ...props }) => <h1 {...props} className="platform-markdown__heading tb-message-markdown-heading" />,
  h2: ({ node: _node, ...props }) => <h2 {...props} className="platform-markdown__heading tb-message-markdown-heading" />,
  h3: ({ node: _node, ...props }) => <h3 {...props} className="platform-markdown__heading tb-message-markdown-heading" />,
  h4: ({ node: _node, ...props }) => <h4 {...props} className="platform-markdown__heading tb-message-markdown-heading" />,
  a: ({ node: _node, ...props }) => <a {...props} className="platform-markdown__link tb-message-markdown-link" target="_blank" rel="noopener noreferrer" />,
  blockquote: ({ node: _node, ...props }) => <blockquote {...props} className="platform-markdown__quote tb-message-markdown-quote" />,
  table: ({ node: _node, ...props }) => <div className="platform-markdown__table-wrap tb-message-markdown-table-wrap"><table {...props} className="platform-markdown__table tb-message-markdown-table" /></div>,
  thead: ({ node: _node, ...props }) => <thead {...props} className="platform-markdown__thead tb-message-markdown-thead" />,
  tbody: ({ node: _node, ...props }) => <tbody {...props} />,
  tr: ({ node: _node, ...props }) => <tr {...props} className="platform-markdown__row tb-message-markdown-row" />,
  th: ({ node: _node, ...props }) => <th {...props} className="platform-markdown__th tb-message-markdown-th" />,
  td: ({ node: _node, ...props }) => <td {...props} className="platform-markdown__td tb-message-markdown-td" />,
  hr: ({ node: _node, ...props }) => <hr {...props} className="platform-markdown__rule tb-message-markdown-rule" />,
  img: ({ node: _node, ...props }) => <img {...props} className="platform-markdown__image tb-message-markdown-image" />,
  u: ({ node: _node, ...props }) => <u {...props} className="platform-markdown__underline playground-tasks-detail-markdown-underline" />,
};

function prepareMarkdown(content: string) {
  return String(content || "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/<u>([\s\S]*?)<\/u>/gi, "++$1++")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function PlatformMarkdownRenderer({ content, className = "" }: PlatformMarkdownRendererProps) {
  return (
    <div className={`platform-markdown${className ? ` ${className}` : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnderline, remarkSoftbreaksToBreaks]}
        components={markdownComponents}
      >
        {prepareMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

function buildWrappedEdit(value: string, selectionStart: number, selectionEnd: number, prefix: string, suffix = prefix): MarkdownEdit {
  const start = Math.max(0, selectionStart);
  const end = Math.max(start, selectionEnd);
  const selected = value.slice(start, end);
  if (start !== end) {
    if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= prefix.length + suffix.length) {
      const unwrapped = selected.slice(prefix.length, selected.length - suffix.length);
      return { value: value.slice(0, start) + unwrapped + value.slice(end), selectionStart: start, selectionEnd: start + unwrapped.length };
    }
    if (value.slice(Math.max(0, start - prefix.length), start) === prefix && value.slice(end, end + suffix.length) === suffix) {
      return {
        value: value.slice(0, start - prefix.length) + selected + value.slice(end + suffix.length),
        selectionStart: start - prefix.length,
        selectionEnd: start - prefix.length + selected.length,
      };
    }
    return {
      value: value.slice(0, start) + prefix + selected + suffix + value.slice(end),
      selectionStart: start + prefix.length,
      selectionEnd: start + prefix.length + selected.length,
    };
  }
  return {
    value: value.slice(0, start) + prefix + suffix + value.slice(end),
    selectionStart: start + prefix.length,
    selectionEnd: start + prefix.length,
  };
}

function buildListEdit(value: string, selectionStart: number, selectionEnd: number, ordered: boolean): MarkdownEdit {
  const start = Math.max(0, selectionStart);
  const end = Math.max(start, selectionEnd);
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = value.length;
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const nonEmpty = lines.filter((line) => line.trim());
  const orderedPattern = /^(\s*)\d+\.\s+/;
  const unorderedPattern = /^(\s*)-\s+/;
  const pattern = ordered ? orderedPattern : unorderedPattern;
  const remove = nonEmpty.length > 0 && nonEmpty.every((line) => pattern.test(line));
  let orderedIndex = 1;
  const nextLines = lines.map((line) => {
    if (!line.trim()) return remove ? line : ordered ? `${orderedIndex++}. ` : "- ";
    if (remove) return line.replace(pattern, "$1");
    if (pattern.test(line)) {
      if (ordered) orderedIndex += 1;
      return line;
    }
    return line.replace(/^(\s*)(?:-\s+|\d+\.\s+)?/, (_match, indent: string) => `${indent || ""}${ordered ? `${orderedIndex++}. ` : "- "}`);
  });
  const nextBlock = nextLines.join("\n");
  const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
  const collapsed = start === end;
  const markerLength = ordered ? 3 : 2;
  const caretOffset = remove ? Math.max(0, start - lineStart - markerLength) : start - lineStart + markerLength;
  return {
    value: nextValue,
    selectionStart: collapsed ? lineStart + caretOffset : lineStart,
    selectionEnd: collapsed ? lineStart + caretOffset : lineStart + nextBlock.length,
  };
}

function buildLinkEdit(value: string, selectionStart: number, selectionEnd: number): MarkdownEdit {
  const start = Math.max(0, selectionStart);
  const end = Math.max(start, selectionEnd);
  const selected = value.slice(start, end);
  const existing = selected.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
  if (existing) {
    const label = existing[1] || "";
    return { value: value.slice(0, start) + label + value.slice(end), selectionStart: start, selectionEnd: start + label.length };
  }
  const label = selected || "link text";
  const url = "url";
  const markdown = `[${label}](${url})`;
  const urlStart = start + label.length + 3;
  return {
    value: value.slice(0, start) + markdown + value.slice(end),
    selectionStart: urlStart,
    selectionEnd: urlStart + url.length,
  };
}

function buildMarkdownEdit(value: string, selectionStart: number, selectionEnd: number, format: MarkdownFormat) {
  if (format === "bold") return buildWrappedEdit(value, selectionStart, selectionEnd, "**");
  if (format === "italic") return buildWrappedEdit(value, selectionStart, selectionEnd, "*");
  if (format === "underline") return buildWrappedEdit(value, selectionStart, selectionEnd, "++");
  if (format === "list") return buildListEdit(value, selectionStart, selectionEnd, false);
  if (format === "ordered-list") return buildListEdit(value, selectionStart, selectionEnd, true);
  if (format === "code") return buildWrappedEdit(value, selectionStart, selectionEnd, "`");
  return buildLinkEdit(value, selectionStart, selectionEnd);
}

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${Math.max(36, textarea.scrollHeight)}px`;
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

export function PlatformInstructionsEditor({
  value,
  onChange,
  title = "Instructions",
  placeholder = "Add instructions here",
  ariaLabel = "Instructions",
  readOnly = false,
  stickyHeader = true,
  historyKey = "default",
  variant = "default",
  className = "",
  onEditingChange,
}: PlatformInstructionsEditorProps) {
  const [editing, setEditing] = useState(false);
  const [history, setHistory] = useState<EditorHistory>({ past: [], future: [] });
  const [headerStuck, setHeaderStuck] = useState(false);
  const editorRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef(value);
  const historyKeyRef = useRef(historyKey);
  valueRef.current = value;

  const setEditingState = (next: boolean) => {
    setEditing(next);
    onEditingChange?.(next);
  };

  useEffect(() => {
    if (historyKeyRef.current === historyKey) return;
    historyKeyRef.current = historyKey;
    setHistory({ past: [], future: [] });
    setEditingState(false);
  }, [historyKey]);

  useLayoutEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [editing, value]);

  useEffect(() => {
    if (!stickyHeader || readOnly) {
      setHeaderStuck(false);
      return undefined;
    }
    const editor = editorRef.current;
    const header = headerRef.current;
    if (!editor || !header) return undefined;

    const scrollContainer = findInstructionsEditorScrollContainer(editor);
    const updateStickyState = () => {
      const editorRect = editor.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const scrollTop = scrollContainer?.getBoundingClientRect().top || 0;
      const stickyOffset = Number.parseFloat(window.getComputedStyle(header).top) || 0;
      const pinnedTop = scrollTop + stickyOffset;
      const nextHeaderStuck = (
        editorRect.top < headerRect.top - 0.5
        && Math.abs(headerRect.top - pinnedTop) <= 2
      );
      setHeaderStuck((current) => current === nextHeaderStuck ? current : nextHeaderStuck);
    };

    const scrollTarget: HTMLElement | Window = scrollContainer || window;
    updateStickyState();
    scrollTarget.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateStickyState);
    resizeObserver?.observe(editor);
    if (scrollContainer) resizeObserver?.observe(scrollContainer);

    return () => {
      scrollTarget.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
      resizeObserver?.disconnect();
    };
  }, [readOnly, stickyHeader]);

  const commit = (nextValue: string, recordHistory = true) => {
    const previousValue = valueRef.current;
    if (previousValue === nextValue) return;
    if (recordHistory) {
      setHistory((current) => ({
        past: [...current.past, previousValue].slice(-HISTORY_LIMIT),
        future: [],
      }));
    }
    valueRef.current = nextValue;
    onChange(nextValue);
  };

  const focusSelection = (selectionStart: number, selectionEnd = selectionStart) => {
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const maxLength = valueRef.current.length;
      const start = Math.max(0, Math.min(selectionStart, maxLength));
      const end = Math.max(start, Math.min(selectionEnd, maxLength));
      textarea.focus();
      textarea.setSelectionRange(start, end);
      resizeTextarea(textarea);
    });
  };

  const undo = () => {
    const previousValue = history.past[history.past.length - 1];
    if (previousValue === undefined || readOnly) return;
    const currentValue = valueRef.current;
    setHistory((current) => ({ past: current.past.slice(0, -1), future: [currentValue, ...current.future].slice(0, HISTORY_LIMIT) }));
    valueRef.current = previousValue;
    onChange(previousValue);
    setEditingState(true);
    focusSelection(previousValue.length);
  };

  const redo = () => {
    const nextValue = history.future[0];
    if (nextValue === undefined || readOnly) return;
    const currentValue = valueRef.current;
    setHistory((current) => ({ past: [...current.past, currentValue].slice(-HISTORY_LIMIT), future: current.future.slice(1) }));
    valueRef.current = nextValue;
    onChange(nextValue);
    setEditingState(true);
    focusSelection(nextValue.length);
  };

  const applyFormat = (format: MarkdownFormat) => {
    if (readOnly) return;
    const textarea = textareaRef.current;
    const currentValue = valueRef.current;
    const selectionStart = editing && typeof textarea?.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
    const selectionEnd = editing && typeof textarea?.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
    const edit = buildMarkdownEdit(currentValue, selectionStart, selectionEnd, format);
    commit(edit.value);
    setEditingState(true);
    focusSelection(edit.selectionStart, edit.selectionEnd);
  };

  const handleShortcut = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    } else if (key === "b" || key === "i" || key === "u") {
      event.preventDefault();
      applyFormat(key === "b" ? "bold" : key === "i" ? "italic" : "underline");
    }
  };

  const preserveEditorFocus = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();
  const toolbarButton = (label: string, icon: ReactNode, onClick: () => void, disabled = false) => (
    <button
      key={label}
      type="button"
      className="platform-instructions-editor__toolbar-button playground-tasks-detail-format-button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={preserveEditorFocus}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <section
      ref={editorRef}
      className={`platform-instructions-editor playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section${stickyHeader && !readOnly ? " is-sticky" : " is-static"}${readOnly ? " is-readonly" : ""}${variant === "minimalistic-ui" ? " is-minimalistic-ui" : ""}${className ? ` ${className}` : ""}`}
      data-platform-instructions-editor="true"
      data-platform-instructions-editor-variant={variant}
    >
      <header
        ref={headerRef}
        className={`platform-instructions-editor__header playground-tasks-detail-section-header${stickyHeader && !readOnly ? "" : " is-static-transparent"}${headerStuck ? " is-stuck" : ""}`}
        data-platform-instructions-editor-header-stuck={headerStuck ? "true" : undefined}
      >
        <h2 className="platform-instructions-editor__title playground-tasks-detail-section-title">{title}</h2>
        {!readOnly ? (
          <div className="platform-instructions-editor__toolbar playground-tasks-detail-format-actions" role="toolbar" aria-label="Markdown formatting">
            {toolbarButton("Undo", <Undo2 width={14} height={14} strokeWidth={1.8} />, undo, history.past.length === 0)}
            {toolbarButton("Redo", <Redo2 width={14} height={14} strokeWidth={1.8} />, redo, history.future.length === 0)}
            <span className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider" aria-hidden="true" />
            {toolbarButton("Bold", <Bold width={14} height={14} strokeWidth={2.7} />, () => applyFormat("bold"))}
            {toolbarButton("Italic", <Italic width={14} height={14} strokeWidth={1.8} />, () => applyFormat("italic"))}
            {toolbarButton("Underline", <Underline width={14} height={14} strokeWidth={1.8} />, () => applyFormat("underline"))}
            <span className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider" aria-hidden="true" />
            {toolbarButton("List", <List width={14} height={14} strokeWidth={1.8} />, () => applyFormat("list"))}
            {toolbarButton("Ordered list", <ListOrdered width={14} height={14} strokeWidth={1.8} />, () => applyFormat("ordered-list"))}
            <span className="platform-instructions-editor__toolbar-divider playground-agents-detail-instructions-toolbar-divider" aria-hidden="true" />
            {toolbarButton("Code", <CodeXml width={14} height={14} strokeWidth={1.8} />, () => applyFormat("code"))}
            {toolbarButton("Link", <Link2 width={14} height={14} strokeWidth={1.8} />, () => applyFormat("link"))}
          </div>
        ) : null}
      </header>
      <div className={`platform-instructions-editor__body playground-tasks-detail-description-editor${editing && !readOnly ? " is-editing" : " is-preview"}`}>
        <div className="platform-instructions-editor__preview-scope playground-tasks-detail-description-preview-scope tb-runner-chat" aria-hidden={editing && !readOnly ? "true" : undefined}>
          {String(value || "").trim() ? (
            <PlatformMarkdownRenderer content={value} className="platform-instructions-editor__preview playground-tasks-detail-description-preview tb-message-markdown" />
          ) : (
            <div className="platform-instructions-editor__preview playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder">{placeholder}</div>
          )}
        </div>
        {!readOnly ? (
          <textarea
            ref={textareaRef}
            className={`platform-instructions-editor__input playground-tasks-detail-description-input ${editing ? "is-editing" : "is-preview"}`}
            rows={1}
            value={value}
            placeholder={editing ? placeholder : ""}
            aria-label={ariaLabel}
            onFocus={() => setEditingState(true)}
            onBlur={() => setEditingState(false)}
            onChange={(event) => commit(event.currentTarget.value)}
            onKeyDown={handleShortcut}
          />
        ) : null}
      </div>
    </section>
  );
}
