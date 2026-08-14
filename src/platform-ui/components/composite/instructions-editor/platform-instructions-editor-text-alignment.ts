import {
  Extension,
  mergeAttributes,
  Node as TiptapNode,
  textblockTypeInputRule,
  type JSONContent,
} from "@tiptap/core";
import { visit } from "unist-util-visit";

export type PlatformInstructionsEditorTextAlignment = "left" | "center" | "right";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface PlatformParagraphOptions {
  HTMLAttributes: Record<string, unknown>;
}

interface PlatformHeadingOptions {
  levels: HeadingLevel[];
  HTMLAttributes: Record<string, unknown>;
}

interface PlatformTextAlignOptions {
  types: string[];
  alignments: PlatformInstructionsEditorTextAlignment[];
  defaultAlignment: PlatformInstructionsEditorTextAlignment;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    platformInstructionsEditorTextAlign: {
      setTextAlign: (alignment: PlatformInstructionsEditorTextAlignment) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

const TEXT_ALIGNMENT_MARKER =
  /(?:^|\s)(?:<!--\s*computer-agents:text-align=(left|center|right)\s*-->|&lt;!--\s*computer-agents:text-align=(left|center|right)\s*--&gt;)\s*$/i;
const EMPTY_PARAGRAPH_MARKDOWN = "&nbsp;";
const NBSP_CHAR = "\u00A0";

function normalizeTextAlignment(value: unknown): PlatformInstructionsEditorTextAlignment {
  return value === "center" || value === "right" ? value : "left";
}

function stripTextAlignmentMarker(value: unknown): {
  alignment: PlatformInstructionsEditorTextAlignment;
  content: string;
  found: boolean;
} {
  const source = String(value || "");
  const match = TEXT_ALIGNMENT_MARKER.exec(source);
  if (!match) {
    return { alignment: "left", content: source, found: false };
  }
  return {
    alignment: normalizeTextAlignment((match[1] || match[2])?.toLowerCase()),
    content: source.slice(0, match.index).trimEnd(),
    found: true,
  };
}

function stripMarkerFromInlineTokens(tokens: Array<Record<string, unknown>>) {
  const nextTokens = tokens.map((token) => ({ ...token }));
  for (let index = nextTokens.length - 1; index >= 0; index -= 1) {
    const token = nextTokens[index];
    if (!token) continue;
    const source =
      typeof token.text === "string" ? token.text : typeof token.raw === "string" ? token.raw : "";
    const parsed = stripTextAlignmentMarker(source);
    if (!parsed.found) continue;
    if (typeof token.text === "string") token.text = parsed.content;
    if (typeof token.raw === "string") token.raw = parsed.content;
    if (!parsed.content) nextTokens.splice(index, 1);
    break;
  }
  return nextTokens;
}

function parseAlignedInlineContent(
  token: {
    text?: string;
    raw?: string;
    tokens?: Array<Record<string, unknown>>;
  },
  helpers: {
    tokenizeInline?: (source: string) => Array<Record<string, unknown>>;
    parseInline: (tokens: Array<Record<string, unknown>>) => JSONContent[];
  },
) {
  const tokens = token.tokens || [];
  const source =
    typeof token.text === "string" ? token.text : typeof token.raw === "string" ? token.raw : "";
  const parsed = stripTextAlignmentMarker(source);
  const inlineTokens = parsed.found
    ? helpers.tokenizeInline?.(parsed.content) || stripMarkerFromInlineTokens(tokens)
    : tokens;
  return {
    alignment: parsed.alignment,
    found: parsed.found,
    content: helpers.parseInline(inlineTokens),
    inlineTokens,
  };
}

function renderTextAlignmentMarker(alignment: unknown): string {
  const normalized = normalizeTextAlignment(alignment);
  return normalized === "left" ? "" : ` <!-- computer-agents:text-align=${normalized} -->`;
}

/**
 * Local paragraph and heading nodes keep alignment support inside the
 * centralized editor without adding more browser-loaded TipTap packages.
 */
export const PlatformInstructionsEditorParagraph = TiptapNode.create<PlatformParagraphOptions>({
  name: "paragraph",
  priority: 1000,
  addOptions() {
    return { HTMLAttributes: {} };
  },
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "p" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  parseMarkdown: (token, helpers) => {
    const parsed = parseAlignedInlineContent(token, helpers);

    if (
      !parsed.found &&
      parsed.inlineTokens.length === 1 &&
      parsed.inlineTokens[0]?.type === "image"
    ) {
      return helpers.parseChildren([parsed.inlineTokens[0]]);
    }

    const hasExplicitEmptyParagraphMarker =
      parsed.inlineTokens.length === 1 &&
      parsed.inlineTokens[0]?.type === "text" &&
      (parsed.inlineTokens[0]?.raw === EMPTY_PARAGRAPH_MARKDOWN ||
        parsed.inlineTokens[0]?.text === EMPTY_PARAGRAPH_MARKDOWN ||
        parsed.inlineTokens[0]?.raw === NBSP_CHAR ||
        parsed.inlineTokens[0]?.text === NBSP_CHAR);
    const content =
      hasExplicitEmptyParagraphMarker &&
      parsed.content.length === 1 &&
      (parsed.content[0] as { type?: string; text?: string })?.type === "text" &&
      ((parsed.content[0] as { text?: string }).text === EMPTY_PARAGRAPH_MARKDOWN ||
        (parsed.content[0] as { text?: string }).text === NBSP_CHAR)
        ? []
        : parsed.content;

    return helpers.createNode("paragraph", { textAlign: parsed.alignment }, content);
  },
  renderMarkdown: (node, helpers, context) => {
    const content = Array.isArray(node?.content) ? node.content : [];
    let renderedContent = helpers.renderChildren(content);
    if (!content.length) {
      const previousContent = Array.isArray(context?.previousNode?.content)
        ? context.previousNode.content
        : [];
      renderedContent =
        context?.previousNode?.type === "paragraph" && previousContent.length === 0
          ? EMPTY_PARAGRAPH_MARKDOWN
          : "";
    }
    return `${renderedContent}${renderTextAlignmentMarker(node?.attrs?.textAlign)}`;
  },
  addCommands() {
    return {
      setParagraph:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
    };
  },
  addKeyboardShortcuts() {
    return { "Mod-Alt-0": () => this.editor.commands.setParagraph() };
  },
});

export const PlatformInstructionsEditorHeading = TiptapNode.create<PlatformHeadingOptions>({
  name: "heading",
  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    };
  },
  content: "inline*",
  group: "block",
  defining: true,
  addAttributes() {
    return {
      level: { default: 1, rendered: false },
    };
  },
  parseHTML() {
    return this.options.levels.map((level) => ({
      tag: `h${level}`,
      attrs: { level },
    }));
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : this.options.levels[0];
    return [`h${level}`, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  parseMarkdown: (token, helpers) => {
    const parsed = parseAlignedInlineContent(token, helpers);
    return helpers.createNode(
      "heading",
      {
        level: token.depth || 1,
        textAlign: parsed.alignment,
      },
      parsed.content,
    );
  },
  renderMarkdown: (node, helpers) => {
    const level = Number.parseInt(String(node?.attrs?.level || 1), 10) || 1;
    const headingCharacters = "#".repeat(Math.max(1, Math.min(level, 6)));
    const content = Array.isArray(node?.content) ? node.content : [];
    return `${headingCharacters} ${helpers.renderChildren(content)}${renderTextAlignmentMarker(node?.attrs?.textAlign)}`;
  },
  addCommands() {
    return {
      setHeading:
        (attributes: { level: HeadingLevel }) =>
        ({ commands }) =>
          this.options.levels.includes(attributes.level)
            ? commands.setNode(this.name, attributes)
            : false,
      toggleHeading:
        (attributes: { level: HeadingLevel }) =>
        ({ commands }) =>
          this.options.levels.includes(attributes.level)
            ? commands.toggleNode(this.name, "paragraph", attributes)
            : false,
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce<Record<string, () => boolean>>(
      (shortcuts, level) => ({
        ...shortcuts,
        [`Mod-Alt-${level}`]: () => this.editor.commands.toggleHeading({ level }),
      }),
      {},
    );
  },
  addInputRules() {
    const minimumLevel = Math.min(...this.options.levels);
    return this.options.levels.map((level) =>
      textblockTypeInputRule({
        find: new RegExp(`^(#{${minimumLevel},${level}})\\s$`),
        type: this.type,
        getAttributes: { level },
      }),
    );
  },
});

export const PlatformInstructionsEditorTextAlign = Extension.create<PlatformTextAlignOptions>({
  name: "platformInstructionsEditorTextAlign",
  addOptions() {
    return {
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right"],
      defaultAlignment: "left",
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: (element) =>
              this.options.alignments.includes(
                element.style.textAlign as PlatformInstructionsEditorTextAlignment,
              )
                ? element.style.textAlign
                : this.options.defaultAlignment,
            renderHTML: (attributes) =>
              attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextAlign:
        (alignment: PlatformInstructionsEditorTextAlignment) =>
        ({ commands }) =>
          this.options.alignments.includes(alignment) &&
          this.options.types
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .some(Boolean),
      unsetTextAlign:
        () =>
        ({ commands }) =>
          this.options.types
            .map((type) => commands.resetAttributes(type, "textAlign"))
            .some(Boolean),
    };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-l": () => this.editor.commands.setTextAlign("left"),
      "Mod-Shift-e": () => this.editor.commands.setTextAlign("center"),
      "Mod-Shift-r": () => this.editor.commands.setTextAlign("right"),
    };
  },
});

/** Keeps the read-only Markdown renderer aligned with the editable document. */
export function remarkPlatformInstructionsEditorTextAlignment() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], (node) => {
      const currentNode = node as unknown as {
        type?: string;
        children?: Array<{ type?: string; value?: string }>;
        data?: {
          hProperties?: Record<string, unknown>;
          [key: string]: unknown;
        };
      };
      if (
        (currentNode.type !== "paragraph" && currentNode.type !== "heading") ||
        !Array.isArray(currentNode.children)
      )
        return;
      const lastChild = currentNode.children.at(-1);
      if (lastChild?.type !== "text" || typeof lastChild.value !== "string") return;
      const parsed = stripTextAlignmentMarker(lastChild.value);
      if (!parsed.found) return;
      lastChild.value = parsed.content;
      currentNode.data = {
        ...(currentNode.data || {}),
        hProperties: {
          ...(currentNode.data?.hProperties || {}),
          "data-platform-text-align": parsed.alignment,
          style: `text-align: ${parsed.alignment}`,
        },
      };
    });
  };
}
