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
              type: "text",
              inputMode: "decimal",
              pattern: "[0-9]*[.]?[0-9]*",
              autoComplete: "off",
              className: "playground-evaluations-input playground-evaluations-pass-threshold-input",
              "aria-label": "Pass threshold",
              value: Number((normalizePlaygroundEvaluationPassThreshold(set.passThreshold) * 100).toFixed(1)),
              onFocus: (event) => event.currentTarget.select(),
              onChange: (event) => {
                const nextValue = String(event.target.value || "").trim();
                if (!/^(?:100(?:[.]0)?|[0-9]{1,2}(?:[.][0-9])?)$/.test(nextValue)) return;
                updateEvaluationSet(set.id, (current) => ({
                  ...current,
                  passThreshold: normalizePlaygroundEvaluationPassThreshold(nextValue),
                }));
              },
            })
          );
        }

        function renderEvaluationDatasetGuidanceTitle() {
          return React.createElement("span", { className: "playground-evaluations-dataset-guidance-title" },
            React.createElement("span", null, "Dataset Evaluator Guidance"),
            React.createElement("button", {
                type: "button",
                className: "playground-evaluations-pass-threshold-help playground-evaluations-dataset-guidance-help",
                "aria-label": "Dataset evaluator guidance information",
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                },
              },
              React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8, "aria-hidden": "true" }),
              React.createElement("span", {
                className: "playground-evaluations-pass-threshold-tooltip playground-evaluations-dataset-guidance-tooltip",
                role: "tooltip",
              },
                "Instructions applied to every case in this evaluation set. Use them to define shared scoring criteria, required behavior, tolerances, or partial-credit rules."
              )
            )
          );
        }

        function renderEvaluationGuidanceEditor(set) {
          const guidance = String(set?.evaluationGuidance || "");
          const placeholder = "Optional scoring instructions that apply to every row in this evaluation set.";
          return React.createElement(PlatformInstructionsEditor, {
            value: guidance,
            onChange: (value) => updateEvaluationGuidanceValue(set.id, value),
            title: renderEvaluationDatasetGuidanceTitle(),
            placeholder,
            ariaLabel: "Dataset evaluator guidance",
            stickyHeader: true,
            historyKey: "evaluation-guidance:" + set.id,
            variant: "minimalistic-ui",
            className: "playground-evaluations-dataset-guidance-section",
          });
        }

        function renderEvaluationDescriptionEditor(set) {
          const description = String(set?.description || "");
          return React.createElement(PlatformInstructionsEditor, {
            value: description,
            onChange: (value) => updateEvaluationSet(set.id, (current) => ({
              ...current,
              description: value,
            })),
            title: "Description",
            placeholder: "Describe the purpose, scope, and expected use of this evaluation.",
            ariaLabel: "Evaluation description",
            stickyHeader: true,
            historyKey: "evaluation-description:" + set.id,
            variant: "minimalistic-ui",
            className: "playground-evaluations-description-section",
          });
        }

        function renderEvaluationCaseGuidanceTitle() {
          return React.createElement("span", { className: "playground-evaluations-case-guidance-title" },
            React.createElement("span", null, "Evaluator Guidance"),
            React.createElement("button", {
                type: "button",
                className: "playground-evaluations-pass-threshold-help playground-evaluations-case-guidance-help",
                "aria-label": "Evaluator guidance information",
                onClick: (event) => event.preventDefault(),
              },
              React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8, "aria-hidden": "true" }),
              React.createElement("span", {
                className: "playground-evaluations-pass-threshold-tooltip playground-evaluations-case-guidance-tooltip",
                role: "tooltip",
              },
                "Optional case-specific instructions for the evaluator. Use them to define scoring criteria, required behavior, tolerances, or partial-credit rules."
              )
            )
          );
        }

`;
