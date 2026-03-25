import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Components } from "react-markdown";

export function stripRunnerSystemTags(text: string): string {
  return text
    .replace(/<system>[\s\S]*?<\/system>/g, "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
    .replace(/<tool_use_error>([\s\S]*?)<\/tool_use_error>/g, "$1")
    .trim();
}

export function remarkSoftbreaksToBreaks() {
  return (tree: any) => {
    visit(tree, "text", (node: any, index?: number, parent?: any) => {
      if (!parent || typeof index !== "number") return;
      if (!node?.value || typeof node.value !== "string" || !node.value.includes("\n")) return;

      const parts = node.value.split("\n");
      const replacement: any[] = [];
      for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
        if (parts[partIndex]) replacement.push({ type: "text", value: parts[partIndex] });
        if (partIndex < parts.length - 1) replacement.push({ type: "break" });
      }

      parent.children.splice(index, 1, ...replacement);
      return index + replacement.length;
    });
  };
}

export const runnerMarkdownComponents: Components = {
  p: ({ node, ...props }) => <p className="tb-message-markdown-paragraph" {...props} />,
  strong: ({ node, ...props }) => <strong className="tb-message-markdown-strong" {...props} />,
  em: ({ node, ...props }) => <em className="tb-message-markdown-em" {...props} />,
  code: ({ node, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return <code className="tb-message-markdown-inline-code" {...props} />;
    }
    return <code className="tb-message-markdown-code" {...props} />;
  },
  pre: ({ node, ...props }) => <pre className="tb-message-markdown-pre" {...props} />,
  ul: ({ node, ...props }) => <ul className="tb-message-markdown-list" {...props} />,
  ol: ({ node, ...props }) => <ol className="tb-message-markdown-list tb-message-markdown-list-ordered" {...props} />,
  li: ({ node, ...props }) => <li className="tb-message-markdown-list-item" {...props} />,
  h1: ({ node, ...props }) => <h1 className="tb-message-markdown-heading" {...props} />,
  h2: ({ node, ...props }) => <h2 className="tb-message-markdown-heading" {...props} />,
  h3: ({ node, ...props }) => <h3 className="tb-message-markdown-heading" {...props} />,
  h4: ({ node, ...props }) => <h4 className="tb-message-markdown-heading" {...props} />,
  a: ({ node, ...props }) => <a className="tb-message-markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="tb-message-markdown-quote" {...props} />,
  table: ({ node, ...props }) => (
    <div className="tb-message-markdown-table-wrap">
      <table className="tb-message-markdown-table" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="tb-message-markdown-thead" {...props} />,
  tbody: ({ node, ...props }) => <tbody {...props} />,
  tr: ({ node, ...props }) => <tr className="tb-message-markdown-row" {...props} />,
  th: ({ node, ...props }) => <th className="tb-message-markdown-th" {...props} />,
  td: ({ node, ...props }) => <td className="tb-message-markdown-td" {...props} />,
  hr: ({ node, ...props }) => <hr className="tb-message-markdown-rule" {...props} />,
  img: ({ node, ...props }) => <img className="tb-message-markdown-image" {...props} />,
};

export interface RunnerMarkdownProps {
  content: string;
  className?: string;
  softBreaks?: boolean;
  disallowHeadings?: boolean;
}

export function RunnerMarkdown({
  content,
  className,
  softBreaks = false,
  disallowHeadings = false,
}: RunnerMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={softBreaks ? [remarkGfm, remarkSoftbreaksToBreaks] : [remarkGfm]}
        disallowedElements={disallowHeadings ? ["h1", "h2", "h3", "h4", "h5", "h6"] : undefined}
        unwrapDisallowed={disallowHeadings}
        components={runnerMarkdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
