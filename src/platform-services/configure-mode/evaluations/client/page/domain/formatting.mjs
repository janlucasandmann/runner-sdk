export const EVALUATIONS_PAGE_FORMATTING_SCRIPT = String.raw`      function isEvaluationThreadRecord(thread) {
        const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
          ? thread.metadata
          : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const evaluation = metadata.evaluation && typeof metadata.evaluation === "object" && !Array.isArray(metadata.evaluation)
          ? metadata.evaluation
          : {};
        const runnerType = String(runnerPlayground.type || runnerPlayground.kind || "").trim().toLowerCase();
        const runnerEvaluationKind = String(runnerPlayground.evaluationKind || runnerPlayground.evaluation_kind || "").trim().toLowerCase();
        const evaluationKind = String(evaluation.kind || evaluation.evaluationKind || evaluation.evaluation_kind || "").trim().toLowerCase();
        const validEvaluationKinds = new Set(["case", "evaluator", "case_refinement", "evaluation_case", "evaluation_evaluator", "evaluation_case_refinement"]);
        const hasEvaluationIds = Boolean(
          thread?.evaluationRunId
          || thread?.evaluationSetId
          || metadata.evaluationRunId
          || metadata.evaluation_run_id
          || metadata.evaluationSetId
          || metadata.evaluation_set_id
          || runnerPlayground.evaluationRunId
          || runnerPlayground.evaluation_run_id
          || runnerPlayground.evaluationSetId
          || runnerPlayground.evaluation_set_id
          || evaluation.runId
          || evaluation.run_id
          || evaluation.setId
          || evaluation.set_id
        );
        const hasEvaluationMarker = runnerType.startsWith("evaluation_")
          || validEvaluationKinds.has(runnerEvaluationKind)
          || validEvaluationKinds.has(evaluationKind);
        const isMarkedHidden = thread?.hidden === true
          || thread?.sidebarHidden === true
          || metadata.hidden === true
          || metadata.sidebarHidden === true
          || runnerPlayground.hidden === true
          || runnerPlayground.sidebarHidden === true
          || evaluation.hidden === true
          || evaluation.sidebarHidden === true;
        return Boolean(hasEvaluationMarker || (hasEvaluationIds && isMarkedHidden));
      }

      function formatPlaygroundEvaluationDate(value) {
        if (typeof formatPlaygroundFileDate === "function") {
          return formatPlaygroundFileDate(value);
        }
        const date = new Date(value || "");
        if (Number.isNaN(date.getTime())) {
          return "Never";
        }
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
      }

      function formatPlaygroundEvaluationPercent(value) {
        if (value === null || value === undefined || value === "") return "-";
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return "-";
        const score = Math.max(0, Math.min(1, numericValue));
        return Math.round(score * 100) + "%";
      }

      function formatPlaygroundEvaluationCostUsd(value) {
        const cost = normalizePlaygroundEvaluationUsdCost(value);
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: cost > 0 && cost < 0.01 ? 4 : 2,
          maximumFractionDigits: cost > 0 && cost < 0.01 ? 4 : 2,
        });
        return formatter.format(cost);
      }

      function isPlaygroundEvaluationCaseActive(caseItem) {
        return ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"].includes(String(caseItem?.status || "").trim().toLowerCase());
      }

      function isPlaygroundEvaluationRunActive(run) {
        return String(run?.status || "").trim().toLowerCase() === "running"
          || (Array.isArray(run?.cases) && run.cases.some((caseItem) => isPlaygroundEvaluationCaseActive(caseItem)));
      }

      function getPlaygroundEvaluationCaseDisplayStatus(caseItem, passThreshold = 0.8) {
        const normalizedStatus = String(caseItem?.status || "").trim().toLowerCase();
        const rawScore = caseItem?.score;
        const numericScore = rawScore === null || rawScore === undefined || rawScore === "" ? null : Number(rawScore);
        const score = Number.isFinite(numericScore) ? Math.max(0, Math.min(1, numericScore)) : null;
        const parseStatus = String(caseItem?.evaluatorParseStatus || caseItem?.evaluator_parse_status || "").trim().toLowerCase();
        const parsedEvaluatorResult = getPlaygroundEvaluationParsedEvaluatorResult(caseItem?.evaluatorOutput)
          || getPlaygroundEvaluationParsedEvaluatorResult(caseItem?.evaluatorReason);
        const hasScoredEvaluatorResult = parseStatus.startsWith("parsed")
          || parseStatus === "code_numeric"
          || Number.isFinite(parsedEvaluatorResult?.score);
        if (
          normalizedStatus === "error"
          && (
            hasScoredEvaluatorResult
            || (score !== null && score > 0 && (caseItem?.evaluatorThreadId || caseItem?.evaluatorOutput))
          )
        ) {
          return (score ?? 0) >= normalizePlaygroundEvaluationPassThreshold(passThreshold) ? "passed" : "failed";
        }
        return normalizedStatus || "queued";
      }

      function sleepPlaygroundEvaluationFrontend(ms) {
        return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
      }

      async function readPlaygroundEvaluationBackendJson(response, fallbackMessage) {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.message || data?.error || fallbackMessage || "Evaluation request failed."));
        }
        return data;
      }

      function normalizePlaygroundEvaluationCodeLanguage(language) {
        const normalized = String(language || "").trim().toLowerCase();
        const aliases = {
          js: "javascript",
          jsx: "javascript",
          ts: "typescript",
          tsx: "typescript",
          sh: "shell",
          bash: "shell",
          zsh: "shell",
          yml: "yaml",
          md: "markdown",
          py: "python",
        };
        return aliases[normalized] || normalized || "plaintext";
      }

      function parsePlaygroundEvaluationFencedCode(value) {
        const text = String(value || "").trim();
        const fence = String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96);
        if (!text.startsWith(fence)) {
          return null;
        }
        const firstLineEnd = text.indexOf("\n");
        if (firstLineEnd < 0) {
          return null;
        }
        const language = normalizePlaygroundEvaluationCodeLanguage(text.slice(fence.length, firstLineEnd).trim());
        let body = text.slice(firstLineEnd + 1);
        const closingIndex = body.lastIndexOf(fence);
        if (closingIndex >= 0 && body.slice(closingIndex).trim() === fence) {
          body = body.slice(0, closingIndex);
        }
        return {
          language,
          value: body.replace(/\n$/, ""),
        };
      }

      function formatPlaygroundEvaluationJsonCode(value) {
        const text = String(value || "").trim();
        try {
          return JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          return text;
        }
      }

      function extractPlaygroundEvaluationJsonBlock(value) {
        const text = String(value || "").trim();
        if (!text) {
          return null;
        }
        const startIndex = Math.min(
          ...["{", "["]
            .map((token) => text.indexOf(token))
            .filter((index) => index >= 0)
        );
        if (!Number.isFinite(startIndex) || startIndex < 0) {
          return null;
        }
        const opener = text[startIndex];
        const closer = opener === "{" ? "}" : "]";
        let depth = 0;
        let inString = false;
        let escaped = false;
        for (let index = startIndex; index < text.length; index += 1) {
          const char = text[index];
          if (inString) {
            if (escaped) {
              escaped = false;
            } else if (char === "\\") {
              escaped = true;
            } else if (char === '"') {
              inString = false;
            }
            continue;
          }
          if (char === '"') {
            inString = true;
            continue;
          }
          if (char === opener) {
            depth += 1;
          } else if (char === closer) {
            depth -= 1;
            if (depth === 0) {
              const candidate = text.slice(startIndex, index + 1);
              try {
                const parsed = JSON.parse(candidate);
                return {
                  language: "json",
                  value: JSON.stringify(parsed, null, 2),
                  parsed,
                  startIndex,
                  endIndex: index + 1,
                  raw: candidate,
                };
              } catch {
                return null;
              }
            }
          }
        }
        return null;
      }

      function getPlaygroundEvaluationTextCodeBlock(value) {
        const text = String(value || "").trim();
        if (!text) {
          return null;
        }
        const fencedCode = parsePlaygroundEvaluationFencedCode(text);
        if (fencedCode) {
          return fencedCode;
        }
        const startsWithJson = text.startsWith("{") || text.startsWith("[");
        const endsWithJson = text.endsWith("}") || text.endsWith("]");
        if (startsWithJson && endsWithJson) {
          return {
            language: "json",
            value: formatPlaygroundEvaluationJsonCode(text),
          };
        }
        const extractedJsonBlock = extractPlaygroundEvaluationJsonBlock(text);
        if (extractedJsonBlock) {
          return extractedJsonBlock;
        }
        return null;
      }

      function normalizePlaygroundEvaluationConfidence(value) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return null;
        }
        const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;
        return Math.max(0, Math.min(1, normalizedValue));
      }

      function getPlaygroundEvaluationParsedEvaluatorResult(value) {
        const text = String(value || "").trim();
        if (!text) {
          return null;
        }
        const block = extractPlaygroundEvaluationJsonBlock(text);
        const parsed = block?.parsed && typeof block.parsed === "object" && !Array.isArray(block.parsed)
          ? block.parsed
          : null;
        if (!parsed) {
          return null;
        }
        const reason = String(
          parsed.reason
          ?? parsed.reasoning
          ?? parsed.explanation
          ?? parsed.rationale
          ?? ""
        ).trim();
        const confidence = normalizePlaygroundEvaluationConfidence(
          parsed.confidence
          ?? parsed.confidenceScore
          ?? parsed.confidence_score
          ?? parsed.score
        );
        const score = normalizePlaygroundEvaluationConfidence(
          parsed.score
          ?? parsed.grade
          ?? parsed.rating
          ?? parsed.result?.score
        );
        const cleanupTextFragment = (fragment) => {
          const fence = String.fromCharCode(96) + String.fromCharCode(96) + String.fromCharCode(96);
          return String(fragment || "")
            .replace(new RegExp(fence + "[a-z0-9_-]*\\s*$", "i"), "")
            .replace(new RegExp("^" + fence + "\\s*", "i"), "")
            .trim();
        };
        const beforeText = cleanupTextFragment(text.slice(0, block.startIndex || 0));
        const afterText = cleanupTextFragment(text.slice(block.endIndex || text.length));
        return {
          reason,
          confidence,
          score,
          beforeText,
          afterText,
        };
      }

      function getPlaygroundEvaluationCaseDisplayReasoning(caseItem) {
        const directReason = String(caseItem?.evaluatorReason || "").trim();
        const evaluatorOutput = String(caseItem?.evaluatorOutput || "").trim();
        const errorText = String(caseItem?.error || "").trim();
        const parsedResult = getPlaygroundEvaluationParsedEvaluatorResult(evaluatorOutput)
          || getPlaygroundEvaluationParsedEvaluatorResult(directReason);
        const directReasonIsJsonResult = Boolean(directReason && getPlaygroundEvaluationParsedEvaluatorResult(directReason));
        const parsedReason = String(parsedResult?.reason || "").trim();
        const visibleDirectReason = directReasonIsJsonResult ? "" : directReason;
        const displayParts = [
          parsedResult?.beforeText || "",
          visibleDirectReason,
          parsedReason && parsedReason !== visibleDirectReason ? parsedReason : "",
          parsedResult?.afterText || "",
        ].filter((part) => String(part || "").trim());
        return {
          text: displayParts.length ? displayParts.join("\n\n") : directReason || evaluatorOutput || errorText,
          confidence: parsedResult?.confidence ?? normalizePlaygroundEvaluationConfidence(caseItem?.confidence ?? caseItem?.evaluatorConfidence ?? caseItem?.evaluator_confidence),
        };
      }

      function PlaygroundEvaluationCaseCodeValue({ value, language = "plaintext" }) {
        const [editorModule, setEditorModule] = useState(null);
        const editorDisposableRef = useRef(null);
        const normalizedValue = useMemo(() => String(value || ""), [value]);
        const normalizedLanguage = useMemo(() => normalizePlaygroundEvaluationCodeLanguage(language), [language]);
        const baseEditorHeight = useMemo(() => {
          const lineCount = Math.max(1, normalizedValue.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length);
          return Math.max(24, lineCount * 20 + 4);
        }, [normalizedValue]);
        const [editorHeight, setEditorHeight] = useState(baseEditorHeight);
        const MonacoEditorComponent = editorModule?.default || null;

        useEffect(() => {
          setEditorHeight(baseEditorHeight);
        }, [baseEditorHeight]);

        useEffect(() => {
          let cancelled = false;
          if (typeof loadPlaygroundCodeEditorModule !== "function") {
            return undefined;
          }
          void loadPlaygroundCodeEditorModule()
            .then((module) => {
              if (cancelled || !module) return;
              setEditorModule(module);
              void module.loader?.init?.()
                .then((monaco) => {
                  if (!cancelled && typeof ensurePlaygroundCodeEditorTheme === "function") {
                    ensurePlaygroundCodeEditorTheme(monaco);
                  }
                })
                .catch(() => {});
            })
            .catch(() => {});
          return () => {
            cancelled = true;
          };
        }, []);

        useEffect(() => () => {
          editorDisposableRef.current?.dispose?.();
          editorDisposableRef.current = null;
        }, []);

        function updateEditorHeight(editor) {
          if (!editor?.getContentHeight) {
            return;
          }
          const nextHeight = Math.max(24, Math.ceil(editor.getContentHeight()));
          setEditorHeight((current) => Math.abs(current - nextHeight) > 1 ? nextHeight : current);
          if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(() => {
              const layoutInfo = editor.getLayoutInfo?.();
              if (layoutInfo?.width && editor.layout) {
                editor.layout({ width: layoutInfo.width, height: nextHeight });
              }
            });
          }
        }

        if (!MonacoEditorComponent) {
          return React.createElement("div", { className: "playground-evaluations-case-code-runner-shell tb-runner-chat" },
            React.createElement("div", { className: "tb-log-card-code tb-log-card-code-hide-scrollbars playground-evaluations-case-code-shell" },
              React.createElement("pre", { className: "tb-log-card-code-fallback playground-evaluations-case-code-fallback" }, normalizedValue || "-")
            )
          );
        }

        return React.createElement("div", { className: "playground-evaluations-case-code-runner-shell tb-runner-chat" },
          React.createElement("div", { className: "tb-log-card-code tb-log-card-code-hide-scrollbars playground-evaluations-case-code-shell", style: { height: editorHeight } },
            React.createElement(MonacoEditorComponent, {
              height: String(editorHeight) + "px",
              language: normalizedLanguage,
              theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
              value: normalizedValue,
              beforeMount: typeof ensurePlaygroundCodeEditorTheme === "function" ? ensurePlaygroundCodeEditorTheme : undefined,
              onMount: (editor) => {
                editorDisposableRef.current?.dispose?.();
                editorDisposableRef.current = editor?.onDidContentSizeChange?.(() => updateEditorHeight(editor)) || null;
                updateEditorHeight(editor);
              },
              options: {
                automaticLayout: true,
                contextmenu: false,
                domReadOnly: true,
                folding: false,
                glyphMargin: false,
                hideCursorInOverviewRuler: true,
                lineDecorationsWidth: 0,
                lineNumbers: "off",
                lineNumbersMinChars: 0,
                minimap: { enabled: false },
                occurrencesHighlight: "off",
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                padding: { top: 0, bottom: 0 },
                readOnly: true,
                renderLineHighlight: "none",
                renderValidationDecorations: "off",
                renderWhitespace: "none",
                scrollBeyondLastLine: false,
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                  handleMouseWheel: false,
                  horizontal: "hidden",
                  vertical: "hidden",
                },
                smoothScrolling: false,
                tabSize: 2,
                wordWrap: "on",
                wrappingIndent: "none",
                wrappingStrategy: "advanced",
                fontSize: 12,
                lineHeight: 20,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
            })
          )
        );
      }

`;
