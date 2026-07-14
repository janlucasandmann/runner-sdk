export const GUARDRAILS_APP_FORMATTING_SCRIPT = `        function resizeGuardrailsDescriptionTextarea(textarea) {
          if (!textarea) return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          const nextHeight = String(textarea.value || "").trim()
            ? Math.max(singleLineHeight, textarea.scrollHeight)
            : singleLineHeight;
          textarea.style.height = nextHeight + "px";
        }
        function buildGuardrailsWrappedMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          if (safeStart !== safeEnd) {
            if (
              selectedText.startsWith(prefix)
              && selectedText.endsWith(suffix)
              && selectedText.length >= prefix.length + suffix.length
            ) {
              const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
              const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
              return {
                value: nextValue,
                selectionStart: safeStart,
                selectionEnd: safeStart + unwrappedText.length,
              };
            }

            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              const nextValue =
                value.slice(0, safeStart - prefix.length)
                + selectedText
                + value.slice(safeEnd + suffix.length);
              return {
                value: nextValue,
                selectionStart: safeStart - prefix.length,
                selectionEnd: safeStart - prefix.length + selectedText.length,
              };
            }

            const wrappedText = prefix + selectedText + suffix;
            const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length + selectedText.length,
            };
          }

          const insertedText = prefix + suffix;
          const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
          return {
            value: nextValue,
            selectionStart: safeStart + prefix.length,
            selectionEnd: safeStart + prefix.length,
          };
        }
        function buildGuardrailsMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const lineStart = value.lastIndexOf("\\n", Math.max(0, safeStart - 1)) + 1;
          let lineEnd = value.indexOf("\\n", safeEnd);
          if (lineEnd === -1) {
            lineEnd = value.length;
          }
          const block = value.slice(lineStart, lineEnd);
          const lines = block.split("\\n");
          const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
          const isOrderedList = listType === "ordered";
          const orderedListPattern = /^(\\s*)\\d+\\.\\s+/;
          const unorderedListPattern = /^(\\s*)-\\s+/;
          const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => (
            isOrderedList ? orderedListPattern.test(line) : unorderedListPattern.test(line)
          ));
          let orderedIndex = 1;
          const nextLines = lines.map((line) => {
            if (!line.trim()) {
              if (shouldRemoveList) {
                return line;
              }
              return isOrderedList ? String(orderedIndex++) + ". " : "- ";
            }
            if (shouldRemoveList) {
              return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
            }
            if (!isOrderedList && unorderedListPattern.test(line)) {
              return line;
            }
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            const cleanLine = line.replace(/^(\\s*)(?:-\\s+|\\d+\\.\\s+)/, "$1");
            return cleanLine.replace(/^(\\s*)/, (_match, indent) => (
              String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- ")
            ));
          });
          const nextBlock = nextLines.join("\\n");
          const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
          const collapsedSelection = safeStart === safeEnd;
          const markerLength = isOrderedList ? 3 : 2;
          const nextCaretOffset = shouldRemoveList
            ? Math.max(0, safeStart - lineStart - markerLength)
            : safeStart - lineStart + markerLength;
          return {
            value: nextValue,
            selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
            selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
          };
        }
        function buildGuardrailsMarkdownLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\\[([^\\]]+)\\]\\(([^)]*)\\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart,
              selectionEnd: safeStart + unwrappedText.length,
            };
          }

          const label = selectedText || "link text";
          const url = "url";
          const markdownLink = "[" + label + "](" + url + ")";
          const nextValue = value.slice(0, safeStart) + markdownLink + value.slice(safeEnd);
          const urlStart = safeStart + label.length + 3;
          return {
            value: nextValue,
            selectionStart: urlStart,
            selectionEnd: urlStart + url.length,
          };
        }
`;
