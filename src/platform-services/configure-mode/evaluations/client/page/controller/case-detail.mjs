export const EVALUATIONS_PAGE_CONTROLLER_CASE_DETAIL_SCRIPT = String.raw`        function renderCaseDetailField(label, value, options = {}) {
          return React.createElement("div", { className: "playground-evaluations-case-detail-field" + (options.wide ? " is-wide" : "") + (options.reasoning ? " is-reasoning" : "") },
            React.createElement("div", { className: "playground-evaluations-case-detail-label" }, label),
            React.createElement("div", { className: "playground-evaluations-case-detail-value" + (options.text ? " playground-evaluations-case-detail-text" : "") + (options.reasoning ? " is-rich" : "") }, value || "-")
          );
        }

        function renderCaseKpi(label, value) {
          return React.createElement("div", { className: "playground-evaluations-case-kpi" },
            React.createElement("div", { className: "playground-evaluations-case-kpi-label" }, label),
            React.createElement("div", { className: "playground-evaluations-case-kpi-value" }, value || "-")
          );
        }

        function doesPlaygroundEvaluationFenceLookLikeMarkdown(language, body) {
          const normalizedLanguage = String(language || "").trim().toLowerCase();
          if (["markdown", "md", "mdx"].includes(normalizedLanguage)) {
            return true;
          }
          if (normalizedLanguage && !["text", "txt", "plain", "plaintext"].includes(normalizedLanguage)) {
            return false;
          }
          const text = String(body || "").trim();
          if (!text) {
            return false;
          }
          const lines = text.split(/\r?\n/).map((line) => String(line || ""));
          const hasTableRow = lines.some((line) => /^\s*\|.*\|\s*$/.test(line));
          const hasTableSeparator = lines.some((line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line));
          if (hasTableRow && hasTableSeparator) {
            return true;
          }
          const hasMarkdownSyntax = /(^|\n)\s{0,3}(#{1,6}\s+|[-*+]\s+\S|\d+\.\s+\S|>\s+\S|\*\*[^*\n][\s\S]*?\*\*|__[^_\n][\s\S]*?__|\[[^\]\n]+\]\([^)]+\))/m.test(text);
          if (!hasMarkdownSyntax) {
            return false;
          }
          const codeLinePattern = /^\s*(?:const|let|var|function|class|import|export|def|return|if|for|while|try|catch|select|create|insert|update|delete|from|#include|public|private|<\/?[a-z][^>]*>|[{};])/i;
          const codeLineCount = lines.filter((line) => codeLinePattern.test(line)).length;
          return codeLineCount === 0 || codeLineCount / Math.max(1, lines.length) < 0.25;
        }

        function normalizePlaygroundEvaluationReasoningMarkdown(value) {
          const text = String(value || "").trim();
          if (!text) {
            return "";
          }
          const fence = String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96);
          const fenceRegex = new RegExp(fence + "([^\\n]*)\\n([\\s\\S]*?)" + fence, "g");
          return text
            .replace(fenceRegex, (match, language, body) => {
              if (!doesPlaygroundEvaluationFenceLookLikeMarkdown(language, body)) {
                return match;
              }
              const normalizedBody = String(body || "").trim();
              return normalizedBody ? "\n\n" + normalizedBody + "\n\n" : "";
            })
            .replace(/\n{3,}/g, "\n\n")
            .trim();
        }

        function renderEvaluationCaseMarkdown(value) {
          const text = normalizePlaygroundEvaluationReasoningMarkdown(value);
          if (!text) return "-";
          if (typeof PlaygroundTaskDescriptionMarkdown === "function") {
            return React.createElement("div", { className: "playground-evaluations-case-reasoning-shell tb-runner-chat" },
              React.createElement("div", { className: "tb-turn-summary" },
                React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: text,
                  className: "playground-evaluations-case-reasoning-markdown tb-message-markdown tb-message-markdown-summary",
                })
              )
            );
          }
          return text;
        }

        function renderEvaluationCaseTextValue(value) {
          const text = String(value || "").trim();
          if (!text) return "-";
          const codeBlock = getPlaygroundEvaluationTextCodeBlock(text);
          if (codeBlock) {
            return React.createElement(PlaygroundEvaluationCaseCodeValue, {
              value: codeBlock.value,
              language: codeBlock.language,
            });
          }
          return React.createElement("div", { className: "playground-evaluations-case-text-content" }, text);
        }

        function renderEvaluationPassThresholdInline(set, options = {}) {
          const showLabel = options.showLabel !== false;
          return React.createElement("div", { className: "playground-evaluations-pass-threshold-inline" },
            showLabel
              ? React.createElement("span", { className: "playground-evaluations-pass-threshold-label-group" },
                  React.createElement("span", { className: "playground-evaluations-pass-threshold-inline-label" }, "Pass Threshold"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-evaluations-pass-threshold-help",
                    "aria-label": "Pass threshold information",
                    onClick: (event) => event.preventDefault(),
                  },
                    React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
                    React.createElement("span", { className: "playground-evaluations-pass-threshold-tooltip", role: "tooltip" },
                      "Minimum score a case must reach to count as passed. The run pass rate is calculated from cases at or above this threshold."
                    )
                  )
                )
              : null,
            React.createElement("input", {
              type: "number",
              min: "0",
              max: "100",
              step: "0.1",
              className: "playground-evaluations-input",
              "aria-label": "Pass threshold",
              value: Number((normalizePlaygroundEvaluationPassThreshold(set.passThreshold) * 100).toFixed(1)),
              onChange: (event) => updateEvaluationSet(set.id, (current) => ({
                ...current,
                passThreshold: normalizePlaygroundEvaluationPassThreshold(event.target.value),
              })),
            })
          );
        }

        function renderEvaluationGuidanceEditor(set) {
          const guidance = String(set?.evaluationGuidance || "");
          const placeholder = "Optional scoring instructions that apply to every row in this evaluation set.";
          return React.createElement(PlatformInstructionsEditor, {
            value: guidance,
            onChange: (value) => updateEvaluationGuidanceValue(set.id, value),
            title: "Dataset Evaluator Guidance",
            placeholder,
            ariaLabel: "Dataset evaluator guidance",
            stickyHeader: true,
            historyKey: "evaluation-guidance:" + set.id,
            className: "playground-evaluations-dataset-guidance-section",
          });
        }

        function renderEvaluationCaseEditorMarkdownSection(field, title, placeholder) {
          const state = evaluationCaseEditorState;
          const editorKey = buildEvaluationCaseEditorFieldKey(state, field);
          const value = String(state?.draft?.[field] ?? "");
          const isEditing = evaluationCaseEditorMarkdownEditingKey === editorKey;
          const history = evaluationCaseEditorMarkdownHistoryByKey[editorKey] || { past: [], future: [] };
          const canUndo = Array.isArray(history.past) && history.past.length > 0;
          const canRedo = Array.isArray(history.future) && history.future.length > 0;
          const applyHistoryValue = (nextValue) => {
            updateEvaluationCaseEditorMarkdownValue(editorKey, field, String(nextValue ?? ""), { recordHistory: false });
            setEvaluationCaseEditorMarkdownEditingKey(editorKey);
            focusEvaluationCaseEditorTextarea(editorKey, nextValue);
          };
          const handleUndo = () => {
            if (!canUndo) return;
            const currentValue = value;
            const previousValue = history.past[history.past.length - 1];
            setEvaluationCaseEditorMarkdownHistoryByKey((current) => {
              const currentHistory = current[editorKey] || { past: [], future: [] };
              return {
                ...current,
                [editorKey]: {
                  past: (Array.isArray(currentHistory.past) ? currentHistory.past : []).slice(0, -1),
                  future: [currentValue, ...(Array.isArray(currentHistory.future) ? currentHistory.future : [])].slice(0, 80),
                },
              };
            });
            applyHistoryValue(previousValue);
          };
          const handleRedo = () => {
            if (!canRedo) return;
            const currentValue = value;
            const nextValue = history.future[0];
            setEvaluationCaseEditorMarkdownHistoryByKey((current) => {
              const currentHistory = current[editorKey] || { past: [], future: [] };
              return {
                ...current,
                [editorKey]: {
                  past: [...(Array.isArray(currentHistory.past) ? currentHistory.past : []), currentValue].slice(-80),
                  future: (Array.isArray(currentHistory.future) ? currentHistory.future : []).slice(1),
                },
              };
            });
            applyHistoryValue(nextValue);
          };
          const renderToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              disabled: Boolean(action.disabled),
              onMouseDown: (event) => event.preventDefault(),
              onClick: action.onClick || (() => handleEvaluationCaseEditorMarkdownFormat(editorKey, field, action.id)),
            }, React.createElement(action.icon, {
              width: 14,
              height: 14,
              strokeWidth: action.strokeWidth || 1.8,
            }));
          const formatActionGroups = [
            [
              { id: "undo", label: "Undo", icon: Undo2, disabled: !canUndo, onClick: handleUndo },
              { id: "redo", label: "Redo", icon: Redo2, disabled: !canRedo, onClick: handleRedo },
            ],
            [
              { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
              { id: "italic", label: "Italic", icon: Italic },
              { id: "underline", label: "Underline", icon: Underline },
            ],
            [
              { id: "list", label: "List", icon: List },
              { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
            ],
            [
              { id: "code", label: "Code", icon: CodeXml },
              { id: "link", label: "Link", icon: Link2 },
            ],
          ];
          return React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-evaluations-dataset-guidance-section playground-evaluations-case-editor-markdown-section" },
            React.createElement("div", { className: "playground-tasks-detail-section-header" },
              React.createElement("div", { className: "playground-tasks-detail-section-title" }, title),
              React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                formatActionGroups.flatMap((group, groupIndex) => [
                  groupIndex > 0
                    ? React.createElement("span", {
                        key: "divider:" + groupIndex,
                        className: "playground-agents-detail-instructions-toolbar-divider",
                        "aria-hidden": "true",
                      })
                    : null,
                  ...group.map((action) => renderToolbarButton(action)),
                ])
              )
            ),
            React.createElement("div", {
              className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview"),
              onClick: () => {
                setEvaluationCaseEditorMarkdownEditingKey(editorKey);
                focusEvaluationCaseEditorTextarea(editorKey, value);
              },
            },
              !isEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    value.trim()
                      ? typeof PlaygroundTaskDescriptionMarkdown === "function"
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: value,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview",
                          }, value)
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, placeholder)
                  )
                : null,
              React.createElement("textarea", {
                ref: (node) => {
                  if (node) {
                    evaluationCaseEditorTextareaRefs.current[editorKey] = node;
                  } else {
                    delete evaluationCaseEditorTextareaRefs.current[editorKey];
                  }
                },
                className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isEditing ? placeholder : "",
                value,
                onFocus: () => {
                  setEvaluationCaseEditorMarkdownEditingKey(editorKey);
                },
                onChange: (event) => {
                  updateEvaluationCaseEditorMarkdownValue(editorKey, field, event.target.value);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onBlur: () => {
                  setEvaluationCaseEditorMarkdownEditingKey((current) => current === editorKey ? "" : current);
                },
              })
            )
          );
        }

`;
