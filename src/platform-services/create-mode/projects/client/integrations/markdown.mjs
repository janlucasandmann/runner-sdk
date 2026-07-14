export const PROJECTS_MARKDOWN_RUNTIME_SCRIPT = `
      function prepareTaskDescriptionMarkdown(content) {
        return escapePlaygroundMarkdownHtml(
          String(content || "")
            .replace(/\\\\r\\\\n/g, String.fromCharCode(10))
            .replace(/\\\\n/g, String.fromCharCode(10))
            .replace(/\\\\r/g, String.fromCharCode(10))
        )
          .replace(/&lt;u&gt;([\\s\\S]*?)&lt;\\/u&gt;/g, "<u>$1</u>")
          .replace(/\\+\\+([\\s\\S]*?)\\+\\+/g, "<u>$1</u>");
      }

      function PlaygroundTaskDescriptionMarkdown({ content, className }) {
        return React.createElement("div", { className },
          React.createElement(ReactMarkdown, {
            remarkPlugins: [remarkGfm, remarkPlaygroundSoftbreaksToBreaks],
            rehypePlugins: [rehypeRaw],
            components: playgroundMarkdownComponents,
          }, prepareTaskDescriptionMarkdown(content))
        );
      }
`;
