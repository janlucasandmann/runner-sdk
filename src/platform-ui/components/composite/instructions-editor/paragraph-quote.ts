import {
  createBlockMarkdownSpec,
  mergeAttributes,
  Node as TiptapNode,
} from "@tiptap/core";

interface MarkdownAstNode {
  type: string;
  value?: string;
  children?: MarkdownAstNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

const paragraphQuoteMarkdown = createBlockMarkdownSpec({
  nodeName: "paragraphQuote",
  name: "paragraph-quote",
  content: "inline",
});

export const ParagraphQuote = TiptapNode.create({
  name: "paragraphQuote",
  group: "block",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: 'p[data-platform-paragraph-quote="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes(HTMLAttributes, {
        "data-platform-paragraph-quote": "true",
        class: "platform-instructions-editor__paragraph-quote",
      }),
      0,
    ];
  },

  parseMarkdown: paragraphQuoteMarkdown.parseMarkdown,
  markdownTokenizer: paragraphQuoteMarkdown.markdownTokenizer,
  renderMarkdown: paragraphQuoteMarkdown.renderMarkdown,
});

function isExactMarkdownParagraph(node: MarkdownAstNode | undefined, value: string) {
  return node?.type === "paragraph"
    && node.children?.length === 1
    && node.children[0]?.type === "text"
    && node.children[0]?.value?.trim() === value;
}

export function remarkParagraphQuotes() {
  return (tree: unknown) => {
    const root = tree as MarkdownAstNode;
    const transformChildren = (parent: MarkdownAstNode) => {
      const children = parent.children;
      if (!children?.length) return;

      for (let index = 0; index < children.length; index += 1) {
        if (!isExactMarkdownParagraph(children[index], ":::paragraph-quote")) {
          transformChildren(children[index]);
          continue;
        }

        const closingIndex = children.findIndex(
          (child, childIndex) => childIndex > index && isExactMarkdownParagraph(child, ":::"),
        );
        if (closingIndex < 0) continue;
        const quotedBlocks = children.slice(index + 1, closingIndex);
        const quotedChildren = quotedBlocks.length === 1 && quotedBlocks[0]?.type === "paragraph"
          ? quotedBlocks[0].children || []
          : quotedBlocks.flatMap((block, blockIndex) => [
              ...(block.children || []),
              ...(blockIndex < quotedBlocks.length - 1
                ? [{ type: "text", value: "\n" } satisfies MarkdownAstNode]
                : []),
            ]);
        children.splice(index, closingIndex - index + 1, {
          type: "paragraphQuote",
          children: quotedChildren,
          data: {
            hName: "p",
            hProperties: {
              className: "platform-markdown__paragraph-quote",
              "data-platform-paragraph-quote": "true",
            },
          },
        });
      }
    };

    transformChildren(root);
  };
}
