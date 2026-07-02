export const PLAYGROUND_EVALUATIONS_CSS = String.raw`
      .playground-evaluations-page .playground-files-browser-body {
        align-items: stretch;
      }

      .playground-evaluations-page .playground-guardrails-table-header,
      .playground-evaluations-page .playground-guardrails-table-row {
        grid-template-columns: minmax(220px, 1.3fr) 120px 120px 120px 96px 32px;
      }

      .playground-evaluations-run-table .playground-guardrails-table-header,
      .playground-evaluations-run-table .playground-guardrails-table-row {
        grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) 72px 88px;
      }

      .playground-evaluations-data-table .playground-guardrails-table-header,
      .playground-evaluations-data-table .playground-guardrails-table-row {
        grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) 32px;
      }

      .playground-evaluations-detail-subtitle {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-evaluations-detail-tabs {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        width: fit-content;
      }

      .playground-evaluations-kpis {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-evaluations-kpi {
        min-width: 0;
        padding: 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.045);
      }

      .playground-evaluations-kpi-label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        font-weight: 500;
      }

      .playground-evaluations-kpi-value {
        margin-top: 6px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 22px;
        font-weight: 500;
      }

      .playground-evaluations-chart {
        min-height: 130px;
        display: flex;
        align-items: end;
        gap: 8px;
        padding: 12px;
      }

      .playground-evaluations-chart-bar {
        flex: 1 1 0;
        min-width: 18px;
        border-radius: 6px 6px 2px 2px;
        background: linear-gradient(180deg, rgba(84, 229, 166, 0.88), rgba(102, 166, 255, 0.56));
      }

      .playground-evaluations-section {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-evaluations-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-evaluations-section-title {
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        font-weight: 500;
      }

      .playground-evaluations-form-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
      }

      .playground-evaluations-field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-evaluations-field span {
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        font-weight: 500;
      }

      .playground-evaluations-input,
      .playground-evaluations-textarea,
      .playground-evaluations-select {
        width: 100%;
        min-width: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        outline: none;
        box-sizing: border-box;
      }

      .playground-evaluations-input,
      .playground-evaluations-select {
        height: 34px;
        padding: 0 10px;
      }

      .playground-evaluations-textarea {
        min-height: 82px;
        resize: vertical;
        padding: 9px 10px;
        line-height: 1.45;
      }

      .playground-evaluations-table-input {
        min-height: 56px;
        resize: vertical;
      }

      .playground-evaluations-data-table .playground-evaluations-textarea {
        min-height: 42px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-evaluations-score-pill {
        display: inline-flex;
        justify-content: flex-end;
        color: #54e5a6;
        font-weight: 500;
      }

      .playground-evaluations-status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(84, 229, 166, 0.12);
        color: #9ff6ce;
        font-size: 11px;
        font-weight: 500;
      }

      .playground-evaluations-status-pill.is-failed {
        background: rgba(255, 97, 97, 0.12);
        color: #ffabab;
      }

      .playground-evaluations-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 130;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.56);
      }

      .playground-evaluations-modal {
        width: min(560px, 100%);
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(24, 24, 24, 0.94);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
        backdrop-filter: blur(18px);
      }

      .playground-evaluations-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .playground-evaluations-modal-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 16px;
        font-weight: 500;
      }

      .playground-evaluations-modal-copy {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-evaluations-modal-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      @media (max-width: 900px) {
        .playground-evaluations-kpis,
        .playground-evaluations-form-grid {
          grid-template-columns: 1fr;
        }
      }
`;

export const PLAYGROUND_EVALUATIONS_SCRIPT = String.raw`
      const PLAYGROUND_EVALUATIONS_STORAGE_KEY = "runner_demo_evaluation_sets_v1";

      function createPlaygroundEvaluationId(prefix = "eval") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function normalizePlaygroundEvaluationEvaluator(rawEvaluator = {}) {
        const source = rawEvaluator && typeof rawEvaluator === "object" && !Array.isArray(rawEvaluator) ? rawEvaluator : {};
        const rawType = String(source.type || source.evaluatorType || "").trim().toLowerCase();
        const type = ["agent", "code", "exact"].includes(rawType) ? rawType : "exact";
        return {
          type,
          agentId: String(source.agentId || source.agent_id || "").trim(),
          code: String(source.code || ""),
        };
      }

      function getPlaygroundEvaluationEvaluatorLabel(evaluator, agents = []) {
        const normalized = normalizePlaygroundEvaluationEvaluator(evaluator);
        if (normalized.type === "agent") {
          const agent = (Array.isArray(agents) ? agents : []).find((item) => String(item?.id || "").trim() === normalized.agentId);
          return agent?.name || agent?.label || normalized.agentId || "Agent evaluator";
        }
        if (normalized.type === "code") {
          return "Code evaluator";
        }
        return "Exact output";
      }

      function normalizePlaygroundEvaluationDataRow(row, fallbackIndex = 0) {
        const source = row && typeof row === "object" && !Array.isArray(row) ? row : {};
        const input = typeof source.input === "string"
          ? source.input
          : typeof source.prompt === "string"
            ? source.prompt
            : source.input !== undefined
              ? JSON.stringify(source.input)
              : "";
        const expectedOutput = typeof source.expectedOutput === "string"
          ? source.expectedOutput
          : typeof source.expected_output === "string"
            ? source.expected_output
            : typeof source.output === "string"
              ? source.output
              : source.expected !== undefined
                ? JSON.stringify(source.expected)
                : "";
        return {
          id: String(source.id || source.caseId || source.case_id || "").trim() || createPlaygroundEvaluationId("eval_case"),
          input,
          expectedOutput,
          metadata: source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null,
          createdAt: String(source.createdAt || source.created_at || new Date(Date.now() + fallbackIndex).toISOString()),
          updatedAt: String(source.updatedAt || source.updated_at || source.createdAt || source.created_at || new Date().toISOString()),
        };
      }

      function normalizePlaygroundEvaluationRunCase(rawCase, fallbackIndex = 0) {
        const source = rawCase && typeof rawCase === "object" && !Array.isArray(rawCase) ? rawCase : {};
        const score = Number(source.score);
        return {
          id: String(source.id || source.caseRunId || source.case_run_id || "").trim() || createPlaygroundEvaluationId("eval_run_case"),
          dataRowId: String(source.dataRowId || source.data_row_id || source.caseId || source.case_id || "").trim(),
          threadId: String(source.threadId || source.thread_id || "").trim(),
          input: String(source.input || ""),
          expectedOutput: String(source.expectedOutput || source.expected_output || ""),
          actualOutput: String(source.actualOutput || source.actual_output || ""),
          score: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0,
          status: ["passed", "failed", "running", "error"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "passed",
          latencyMs: Math.max(0, Number(source.latencyMs || source.latency_ms || 0) || 0),
          error: String(source.error || ""),
        };
      }

      function normalizePlaygroundEvaluationRun(rawRun, fallbackIndex = 0) {
        const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
        const cases = Array.isArray(source.cases) ? source.cases.map((item, index) => normalizePlaygroundEvaluationRunCase(item, index)) : [];
        const averageScore = cases.length > 0
          ? cases.reduce((sum, item) => sum + Number(item.score || 0), 0) / cases.length
          : Number(source.averageScore || source.average_score || 0) || 0;
        const passedCount = cases.filter((item) => item.status === "passed").length;
        return {
          id: String(source.id || source.runId || source.run_id || "").trim() || createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: String(source.evaluationSetId || source.evaluation_set_id || "").trim(),
          label: String(source.label || source.name || ("Run " + (fallbackIndex + 1))).trim(),
          status: ["queued", "running", "completed", "failed"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "completed",
          createdAt: String(source.createdAt || source.created_at || new Date().toISOString()),
          completedAt: String(source.completedAt || source.completed_at || source.updatedAt || source.updated_at || new Date().toISOString()),
          averageScore: Math.max(0, Math.min(1, averageScore)),
          passedCount,
          totalCount: cases.length,
          cases,
        };
      }

      function normalizePlaygroundEvaluationSet(record) {
        const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
        const nowIso = new Date().toISOString();
        const dataRows = Array.isArray(source.dataRows)
          ? source.dataRows
          : Array.isArray(source.data_rows)
            ? source.data_rows
            : Array.isArray(source.data)
              ? source.data
              : [];
        const runs = Array.isArray(source.runs) ? source.runs : [];
        return {
          id: String(source.id || source.evaluationId || source.evaluation_id || "").trim() || createPlaygroundEvaluationId("eval_set"),
          name: String(source.name || source.title || "Untitled Evaluation").trim() || "Untitled Evaluation",
          description: String(source.description || ""),
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator),
          dataRows: dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: runs.map((run, index) => normalizePlaygroundEvaluationRun(run, index)),
          createdAt: String(source.createdAt || source.created_at || nowIso),
          updatedAt: String(source.updatedAt || source.updated_at || nowIso),
        };
      }

      function createPlaygroundEvaluationSetDraft(overrides = {}) {
        const nowIso = new Date().toISOString();
        return normalizePlaygroundEvaluationSet({
          id: createPlaygroundEvaluationId("eval_set"),
          name: "New Evaluation",
          description: "",
          evaluator: { type: "exact" },
          dataRows: [
            {
              input: "Summarize the customer request in one sentence.",
              expectedOutput: "A concise one-sentence summary of the request.",
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ],
          runs: [],
          createdAt: nowIso,
          updatedAt: nowIso,
          ...overrides,
        });
      }

      function readPlaygroundEvaluationSetsFromStorage() {
        if (typeof window === "undefined" || !window.localStorage) {
          return [];
        }
        try {
          const parsed = JSON.parse(window.localStorage.getItem(PLAYGROUND_EVALUATIONS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed) ? parsed.map((set) => normalizePlaygroundEvaluationSet(set)) : [];
        } catch {
          return [];
        }
      }

      function writePlaygroundEvaluationSetsToStorage(sets) {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }
        try {
          window.localStorage.setItem(
            PLAYGROUND_EVALUATIONS_STORAGE_KEY,
            JSON.stringify((Array.isArray(sets) ? sets : []).map((set) => normalizePlaygroundEvaluationSet(set)))
          );
        } catch {
          // Ignore storage write failures; the in-memory editor should remain usable.
        }
      }

      function parsePlaygroundEvaluationJsonl(value) {
        const lines = String(value || "").split(/\r?\n/);
        const rows = [];
        const errors = [];
        lines.forEach((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return;
          }
          try {
            const parsed = JSON.parse(trimmed);
            rows.push(normalizePlaygroundEvaluationDataRow(parsed, index));
          } catch (error) {
            errors.push("Line " + (index + 1) + ": invalid JSON");
          }
        });
        return { rows, errors };
      }

      function stringifyPlaygroundEvaluationJsonl(rows) {
        return (Array.isArray(rows) ? rows : []).map((row) => JSON.stringify({
          input: row?.input || "",
          expectedOutput: row?.expectedOutput || "",
        })).join("\n");
      }

      function normalizePlaygroundEvaluationComparable(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
      }

      function buildPlaygroundEvaluationRun(set, agents = []) {
        const evaluationSet = normalizePlaygroundEvaluationSet(set);
        const evaluator = normalizePlaygroundEvaluationEvaluator(evaluationSet.evaluator);
        const nowIso = new Date().toISOString();
        const cases = evaluationSet.dataRows.map((row, index) => {
          const expected = String(row.expectedOutput || "");
          const actual = evaluator.type === "exact"
            ? expected
            : expected
              ? expected
              : "Evaluator output for: " + String(row.input || "").slice(0, 80);
          let score = 0;
          if (evaluator.type === "exact") {
            score = normalizePlaygroundEvaluationComparable(actual) === normalizePlaygroundEvaluationComparable(expected) && expected.trim() ? 1 : 0;
          } else {
            const basis = String(row.input || "") + "|" + expected + "|" + evaluator.type + "|" + index;
            const hash = Array.from(basis).reduce((sum, char) => (sum + char.charCodeAt(0)) % 1000, 0);
            score = Math.min(0.98, Math.max(0.62, 0.62 + (hash % 36) / 100));
          }
          return normalizePlaygroundEvaluationRunCase({
            id: createPlaygroundEvaluationId("eval_run_case"),
            dataRowId: row.id,
            threadId: "eval_thread_" + Date.now().toString(36) + "_" + index,
            input: row.input,
            expectedOutput: expected,
            actualOutput: actual,
            score,
            status: score >= 0.8 ? "passed" : "failed",
            latencyMs: 900 + index * 180 + Math.round(score * 100),
          }, index);
        });
        return normalizePlaygroundEvaluationRun({
          id: createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: evaluationSet.id,
          label: "Run " + (evaluationSet.runs.length + 1),
          status: "completed",
          createdAt: nowIso,
          completedAt: nowIso,
          cases,
        }, evaluationSet.runs.length);
      }

      function isEvaluationThreadRecord(thread) {
        const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
          ? thread.metadata
          : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const evaluation = metadata.evaluation && typeof metadata.evaluation === "object" && !Array.isArray(metadata.evaluation)
          ? metadata.evaluation
          : {};
        return Boolean(
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
        const score = Math.max(0, Math.min(1, Number(value) || 0));
        return Math.round(score * 100) + "%";
      }

      function renderPlaygroundEvaluationsPage(options = {}) {
        const {
          evaluationSets,
          setEvaluationSets,
          selectedEvaluationSetId,
          setSelectedEvaluationSetId,
          selectedEvaluationRunId,
          setSelectedEvaluationRunId,
          evaluationsPageMode,
          setEvaluationsPageMode,
          evaluationDetailTab,
          setEvaluationDetailTab,
          evaluationsSearchQuery,
          setEvaluationsSearchQuery,
          evaluationCreateModalOpen,
          setEvaluationCreateModalOpen,
          evaluationCreateForm,
          setEvaluationCreateForm,
          evaluationJsonlImportOpen,
          setEvaluationJsonlImportOpen,
          evaluationJsonlImportValue,
          setEvaluationJsonlImportValue,
          evaluationJsonlImportError,
          setEvaluationJsonlImportError,
          agents,
        } = options;
        const normalizedSets = (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => normalizePlaygroundEvaluationSet(set));
        const agentOptions = Array.isArray(agents) ? agents : [];
        const activeSet = normalizedSets.find((set) => set.id === selectedEvaluationSetId) || normalizedSets[0] || null;
        const activeRun = activeSet?.runs?.find((run) => run.id === selectedEvaluationRunId) || activeSet?.runs?.[0] || null;
        const normalizedMode = evaluationsPageMode === "run" && activeRun
          ? "run"
          : evaluationsPageMode === "detail" && activeSet
            ? "detail"
            : "overview";
        const nowIso = new Date().toISOString();

        function updateEvaluationSet(setId, updater) {
          if (typeof setEvaluationSets !== "function") return;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) {
              return normalized;
            }
            const nextSet = typeof updater === "function" ? updater(normalized) : normalized;
            return normalizePlaygroundEvaluationSet({ ...nextSet, updatedAt: new Date().toISOString() });
          }));
        }

        function openSetDetail(setId) {
          const normalizedId = String(setId || "").trim();
          if (!normalizedId) return;
          setSelectedEvaluationSetId(normalizedId);
          setSelectedEvaluationRunId("");
          setEvaluationDetailTab("general");
          setEvaluationsPageMode("detail");
        }

        function openRunDetail(setId, runId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId) return;
          setSelectedEvaluationSetId(normalizedSetId);
          setSelectedEvaluationRunId(normalizedRunId);
          setEvaluationsPageMode("run");
        }

        function handleCreateEvaluation() {
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const name = String(form.name || "").trim() || "New Evaluation";
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "exact";
          const nextSet = createPlaygroundEvaluationSetDraft({
            name,
            evaluator: {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            },
          });
          setEvaluationSets((current) => [nextSet, ...(Array.isArray(current) ? current : [])]);
          setSelectedEvaluationSetId(nextSet.id);
          setSelectedEvaluationRunId("");
          setEvaluationDetailTab("general");
          setEvaluationsPageMode("detail");
          setEvaluationCreateModalOpen(false);
          setEvaluationCreateForm({ name: "", evaluatorType: "exact", evaluatorAgentId: "", evaluatorCode: "" });
        }

        function handleRunEvaluation(setId) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const run = buildPlaygroundEvaluationRun(targetSet, agentOptions);
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== targetSet.id) {
              return normalized;
            }
            return normalizePlaygroundEvaluationSet({
              ...normalized,
              runs: [run, ...normalized.runs],
              updatedAt: new Date().toISOString(),
            });
          }));
          setSelectedEvaluationSetId(targetSet.id);
          setSelectedEvaluationRunId(run.id);
          setEvaluationsPageMode("run");
        }

        function handleDeleteEvaluation(setId) {
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== setId));
          if (selectedEvaluationSetId === setId) {
            setSelectedEvaluationSetId("");
            setSelectedEvaluationRunId("");
            setEvaluationsPageMode("overview");
          }
        }

        function handleImportJsonl() {
          const parsed = parsePlaygroundEvaluationJsonl(evaluationJsonlImportValue);
          if (parsed.errors.length > 0) {
            setEvaluationJsonlImportError(parsed.errors.join(", "));
            return;
          }
          if (!activeSet) return;
          updateEvaluationSet(activeSet.id, (set) => ({
            ...set,
            dataRows: [...set.dataRows, ...parsed.rows],
          }));
          setEvaluationJsonlImportOpen(false);
          setEvaluationJsonlImportValue("");
          setEvaluationJsonlImportError("");
          setEvaluationDetailTab("data");
        }

        function renderKpis(set, run) {
          const latestRun = run || set?.runs?.[0] || null;
          const values = [
            { label: "Latest Score", value: latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-" },
            { label: "Cases", value: String(set?.dataRows?.length || 0) },
            { label: "Runs", value: String(set?.runs?.length || 0) },
            { label: "Pass Rate", value: latestRun && latestRun.totalCount ? Math.round((latestRun.passedCount / latestRun.totalCount) * 100) + "%" : "-" },
          ];
          return React.createElement("div", { className: "playground-evaluations-kpis" },
            values.map((item) =>
              React.createElement("div", { key: item.label, className: "playground-evaluations-kpi" },
                React.createElement("div", { className: "playground-evaluations-kpi-label" }, item.label),
                React.createElement("div", { className: "playground-evaluations-kpi-value" }, item.value)
              )
            )
          );
        }

        function renderChart(set) {
          const runs = (set?.runs || []).slice(0, 10).reverse();
          return React.createElement("div", { className: "playground-project-overview-panel-plain playground-evaluations-section" },
            React.createElement("div", { className: "playground-evaluations-section-header" },
              React.createElement("div", { className: "playground-evaluations-section-title" }, "Latest runs")
            ),
            React.createElement("div", { className: "playground-evaluations-chart", role: "img", "aria-label": "Evaluation run score chart" },
              runs.length > 0
                ? runs.map((run) =>
                    React.createElement("div", {
                      key: run.id,
                      className: "playground-evaluations-chart-bar",
                      title: run.label + " - " + formatPlaygroundEvaluationPercent(run.averageScore),
                      style: { height: Math.max(12, Math.round((Number(run.averageScore) || 0) * 112)) + "px" },
                    })
                  )
                : React.createElement("div", { className: "playground-guardrails-empty" },
                    React.createElement("div", { className: "playground-guardrails-empty-title" }, "No evaluation runs yet")
                  )
            )
          );
        }

        function renderRunsTable(set) {
          const runs = Array.isArray(set?.runs) ? set.runs : [];
          return React.createElement("div", { className: "playground-guardrails-table-shell" },
            React.createElement("div", { className: "playground-guardrails-table" },
              React.createElement("div", { className: "playground-guardrails-table-header" },
                React.createElement("span", null, "Run"),
                React.createElement("span", null, "Status"),
                React.createElement("span", null, "Score"),
                React.createElement("span", null, "Cases"),
                React.createElement("span", null, "Date"),
                React.createElement("span", null, "")
              ),
              runs.length > 0
                ? runs.map((run) =>
                    React.createElement("div", {
                      key: run.id,
                      role: "button",
                      tabIndex: 0,
                      className: "playground-guardrails-table-row",
                      onClick: () => openRunDetail(set.id, run.id),
                      onKeyDown: (event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        openRunDetail(set.id, run.id);
                      },
                    },
                      React.createElement("span", { className: "playground-guardrails-set-title" }, run.label || "Run"),
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, run.status),
                      React.createElement("span", { className: "playground-evaluations-score-pill" }, formatPlaygroundEvaluationPercent(run.averageScore)),
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, String(run.totalCount || 0)),
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, formatPlaygroundEvaluationDate(run.completedAt || run.createdAt)),
                      React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.8 })
                    )
                  )
                : React.createElement("div", { className: "playground-guardrails-empty" },
                    React.createElement("div", { className: "playground-guardrails-empty-title" }, "No runs yet")
                  )
            )
          );
        }

        function renderDataTable(set) {
          const rows = Array.isArray(set?.dataRows) ? set.dataRows : [];
          return React.createElement("div", { className: "playground-guardrails-table-shell playground-evaluations-data-table" },
            React.createElement("div", { className: "playground-guardrails-table" },
              React.createElement("div", { className: "playground-guardrails-table-header" },
                React.createElement("span", null, "Input"),
                React.createElement("span", null, "Expected Output"),
                React.createElement("span", null, "")
              ),
              rows.map((row) =>
                React.createElement("div", { key: row.id, className: "playground-guardrails-table-row" },
                  React.createElement("textarea", {
                    className: "playground-evaluations-textarea playground-evaluations-table-input",
                    value: row.input,
                    onChange: (event) => updateEvaluationSet(set.id, (current) => ({
                      ...current,
                      dataRows: current.dataRows.map((item) => item.id === row.id ? { ...item, input: event.target.value, updatedAt: nowIso } : item),
                    })),
                  }),
                  React.createElement("textarea", {
                    className: "playground-evaluations-textarea playground-evaluations-table-input",
                    value: row.expectedOutput,
                    onChange: (event) => updateEvaluationSet(set.id, (current) => ({
                      ...current,
                      dataRows: current.dataRows.map((item) => item.id === row.id ? { ...item, expectedOutput: event.target.value, updatedAt: nowIso } : item),
                    })),
                  }),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-guardrails-row-action",
                    "aria-label": "Delete evaluation case",
                    onClick: () => updateEvaluationSet(set.id, (current) => ({
                      ...current,
                      dataRows: current.dataRows.filter((item) => item.id !== row.id),
                    })),
                  }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                )
              ),
              rows.length === 0
                ? React.createElement("div", { className: "playground-guardrails-empty" },
                    React.createElement("div", { className: "playground-guardrails-empty-title" }, "No data rows yet")
                  )
                : null
            )
          );
        }

        function renderOverview() {
          const query = String(evaluationsSearchQuery || "").trim().toLowerCase();
          const filteredSets = normalizedSets.filter((set) => {
            if (!query) return true;
            const haystack = [set.name, set.description, getPlaygroundEvaluationEvaluatorLabel(set.evaluator, agentOptions)].join(" ").toLowerCase();
            return haystack.includes(query);
          });
          return React.createElement("div", { className: "playground-guardrails-layout" },
            React.createElement("div", { className: "playground-guardrails-list-panel" },
              filteredSets.length > 0
                ? React.createElement("div", { className: "playground-guardrails-table-shell" },
                    React.createElement("div", { className: "playground-guardrails-table" },
                      React.createElement("div", { className: "playground-guardrails-table-header" },
                        React.createElement("span", null, "Evaluation"),
                        React.createElement("span", null, "Evaluator"),
                        React.createElement("span", null, "Data"),
                        React.createElement("span", null, "Latest Score"),
                        React.createElement("span", null, "Updated"),
                        React.createElement("span", null, "")
                      ),
                      filteredSets.map((set) => {
                        const latestRun = set.runs[0] || null;
                        return React.createElement("div", {
                          key: set.id,
                          role: "button",
                          tabIndex: 0,
                          className: "playground-guardrails-table-row",
                          onClick: () => openSetDetail(set.id),
                          onKeyDown: (event) => {
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            openSetDetail(set.id);
                          },
                        },
                          React.createElement("div", { className: "playground-guardrails-set-cell" },
                            React.createElement("div", { className: "playground-guardrails-set-copy" },
                              React.createElement("span", { className: "playground-guardrails-set-title" }, set.name || "Untitled Evaluation"),
                              set.description ? React.createElement("span", { className: "playground-guardrails-set-description" }, set.description) : null
                            )
                          ),
                          React.createElement("span", { className: "playground-guardrails-table-muted" }, getPlaygroundEvaluationEvaluatorLabel(set.evaluator, agentOptions)),
                          React.createElement("span", { className: "playground-guardrails-table-muted" }, String(set.dataRows.length) + " rows"),
                          React.createElement("span", { className: "playground-evaluations-score-pill" }, latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-"),
                          React.createElement("span", { className: "playground-guardrails-table-muted" }, formatPlaygroundEvaluationDate(set.updatedAt || set.createdAt)),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-guardrails-row-action",
                            "aria-label": "Delete evaluation",
                            onClick: (event) => {
                              event.stopPropagation();
                              handleDeleteEvaluation(set.id);
                            },
                          }, React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }))
                        );
                      })
                    )
                  )
                : React.createElement("div", { className: "playground-guardrails-empty" },
                    React.createElement("div", { className: "playground-guardrails-empty-icon" }, React.createElement(ChartColumnIncreasing, { width: 18, height: 18, strokeWidth: 1.8 })),
                    React.createElement("div", { className: "playground-guardrails-empty-title" }, query ? "No matching evaluations" : "No evaluations yet"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-library-new-button playground-guardrails-empty-button",
                      onClick: () => setEvaluationCreateModalOpen(true),
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }), "New Evaluation")
                  )
            )
          );
        }

        function renderDetail() {
          if (!activeSet) {
            return renderOverview();
          }
          const isDataTab = evaluationDetailTab === "data";
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              React.createElement("div", { className: "playground-files-library-tabs content-mode-switch playground-guardrails-library-tabs playground-evaluations-detail-tabs", role: "tablist", "aria-label": "Evaluation details tabs" },
                React.createElement("button", {
                  type: "button",
                  role: "tab",
                  "aria-selected": !isDataTab ? "true" : "false",
                  className: "playground-files-library-tab" + (!isDataTab ? " is-active" : ""),
                  onClick: () => setEvaluationDetailTab("general"),
                }, "General"),
                React.createElement("button", {
                  type: "button",
                  role: "tab",
                  "aria-selected": isDataTab ? "true" : "false",
                  className: "playground-files-library-tab" + (isDataTab ? " is-active" : ""),
                  onClick: () => setEvaluationDetailTab("data"),
                }, "Data")
              ),
              isDataTab
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-guardrails-prompts-header" },
                      React.createElement("div", { className: "playground-guardrails-prompts-title" },
                        React.createElement("span", null, "Input / output pairs")
                      ),
                      React.createElement("div", { className: "playground-guardrails-detail-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                          onClick: () => {
                            setEvaluationJsonlImportValue("");
                            setEvaluationJsonlImportError("");
                            setEvaluationJsonlImportOpen(true);
                          },
                        }, React.createElement(FilePlus2, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "Import JSONL")),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                          onClick: () => updateEvaluationSet(activeSet.id, (set) => ({
                            ...set,
                            dataRows: [...set.dataRows, normalizePlaygroundEvaluationDataRow({ input: "", expectedOutput: "" }, set.dataRows.length)],
                          })),
                        }, React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "Row"))
                      )
                    ),
                    renderDataTable(activeSet)
                  )
                : React.createElement(React.Fragment, null,
                    renderKpis(activeSet),
                    renderChart(activeSet),
                    React.createElement("div", { className: "playground-evaluations-section" },
                      React.createElement("div", { className: "playground-guardrails-prompts-title" },
                        React.createElement("span", null, "Runs")
                      ),
                      renderRunsTable(activeSet)
                    )
                  )
            )
          );
        }

        function renderRun() {
          if (!activeSet || !activeRun) {
            return renderDetail();
          }
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              renderKpis(activeSet, activeRun),
              React.createElement("div", { className: "playground-guardrails-prompts-title" },
                React.createElement("span", null, "Results")
              ),
              React.createElement("div", { className: "playground-guardrails-table-shell playground-evaluations-run-table" },
                React.createElement("div", { className: "playground-guardrails-table" },
                  React.createElement("div", { className: "playground-guardrails-table-header" },
                    React.createElement("span", null, "Input"),
                    React.createElement("span", null, "Expected"),
                    React.createElement("span", null, "Actual"),
                    React.createElement("span", null, "Score"),
                    React.createElement("span", null, "Status")
                  ),
                  activeRun.cases.map((item) =>
                    React.createElement("div", { key: item.id, className: "playground-guardrails-table-row" },
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, item.input || "-"),
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, item.expectedOutput || "-"),
                      React.createElement("span", { className: "playground-guardrails-table-muted" }, item.actualOutput || "-"),
                      React.createElement("span", { className: "playground-evaluations-score-pill" }, formatPlaygroundEvaluationPercent(item.score)),
                      React.createElement("span", { className: "playground-evaluations-status-pill" + (item.status === "passed" ? "" : " is-failed") }, item.status)
                    )
                  )
                )
              )
            )
          );
        }

        function renderCreateModal() {
          if (!evaluationCreateModalOpen) {
            return null;
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const evaluatorType = String(form.evaluatorType || "exact");
          return React.createElement("div", { className: "playground-evaluations-modal-backdrop", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "playground-evaluations-modal" },
              React.createElement("div", { className: "playground-evaluations-modal-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-evaluations-modal-title" }, "Create Evaluation"),
                  React.createElement("div", { className: "playground-evaluations-modal-copy" }, "Choose an evaluator and seed the first JSONL-backed evaluation set.")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-guardrails-row-action",
                  onClick: () => setEvaluationCreateModalOpen(false),
                  "aria-label": "Close",
                }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-evaluations-form-grid" },
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Name"),
                  React.createElement("input", {
                    className: "playground-evaluations-input",
                    value: form.name || "",
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), name: event.target.value })),
                    autoFocus: true,
                  })
                ),
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Evaluator"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: evaluatorType,
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorType: event.target.value })),
                  },
                    React.createElement("option", { value: "exact" }, "Exact output"),
                    React.createElement("option", { value: "agent" }, "Agent"),
                    React.createElement("option", { value: "code" }, "Code")
                  )
                )
              ),
              evaluatorType === "agent"
                ? React.createElement("label", { className: "playground-evaluations-field" },
                    React.createElement("span", null, "Evaluator Agent"),
                    React.createElement("select", {
                      className: "playground-evaluations-select",
                      value: form.evaluatorAgentId || "",
                      onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                    },
                      React.createElement("option", { value: "" }, "Select agent"),
                      agentOptions.map((agent) =>
                        React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                      )
                    )
                  )
                : null,
              evaluatorType === "code"
                ? React.createElement("label", { className: "playground-evaluations-field" },
                    React.createElement("span", null, "Evaluator Code"),
                    React.createElement("textarea", {
                      className: "playground-evaluations-textarea",
                      value: form.evaluatorCode || "",
                      placeholder: "return actual.trim() === expected.trim() ? 1 : 0;",
                      onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorCode: event.target.value })),
                    })
                  )
                : null,
              React.createElement("div", { className: "playground-evaluations-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: () => setEvaluationCreateModalOpen(false),
                }, "Cancel"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-create-button playground-metronome-publish-button",
                  onClick: handleCreateEvaluation,
                }, "Create")
              )
            )
          );
        }

        function renderJsonlModal() {
          if (!evaluationJsonlImportOpen) {
            return null;
          }
          return React.createElement("div", { className: "playground-evaluations-modal-backdrop", role: "dialog", "aria-modal": "true" },
            React.createElement("div", { className: "playground-evaluations-modal" },
              React.createElement("div", { className: "playground-evaluations-modal-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-evaluations-modal-title" }, "Import JSONL"),
                  React.createElement("div", { className: "playground-evaluations-modal-copy" }, "Each line should contain input and expectedOutput fields.")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-guardrails-row-action",
                  onClick: () => setEvaluationJsonlImportOpen(false),
                  "aria-label": "Close",
                }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("textarea", {
                className: "playground-evaluations-textarea",
                value: evaluationJsonlImportValue,
                placeholder: stringifyPlaygroundEvaluationJsonl([{ input: "Question", expectedOutput: "Answer" }]),
                onChange: (event) => {
                  setEvaluationJsonlImportValue(event.target.value);
                  setEvaluationJsonlImportError("");
                },
                style: { minHeight: "180px" },
              }),
              evaluationJsonlImportError
                ? React.createElement("div", { className: "playground-files-action-error" }, evaluationJsonlImportError)
                : null,
              React.createElement("div", { className: "playground-evaluations-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: () => setEvaluationJsonlImportOpen(false),
                }, "Cancel"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-create-button playground-metronome-publish-button",
                  onClick: handleImportJsonl,
                }, "Import")
              )
            )
          );
        }

        const isEvaluationDetailPage = normalizedMode === "detail" && activeSet;
        const isEvaluationRunPage = normalizedMode === "run" && activeSet && activeRun;
        const isEvaluationSubpage = isEvaluationDetailPage || isEvaluationRunPage;
        const evaluationPageTitle = isEvaluationRunPage
          ? (activeRun.label || "Evaluation Run")
          : isEvaluationDetailPage
            ? (activeSet.name || "Untitled Evaluation")
            : "Evaluations";

        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page" },
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" },
                React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                  isEvaluationSubpage
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-resource-detail-back-button playground-guardrails-detail-back-button",
                        onClick: () => {
                          if (isEvaluationRunPage) {
                            setSelectedEvaluationRunId("");
                            setEvaluationsPageMode("detail");
                            return;
                          }
                          setEvaluationsPageMode("overview");
                        },
                        "aria-label": isEvaluationRunPage ? "Back to evaluation" : "Back to evaluations",
                      },
                        React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Back")
                      )
                    : null,
                  React.createElement("div", { className: "playground-files-library-title-row" + (isEvaluationSubpage ? " playground-guardrails-detail-title-row" : "") },
                    React.createElement("h1", { className: "playground-files-library-title" + (isEvaluationSubpage ? " playground-guardrails-detail-title" : "") },
                      isEvaluationDetailPage
                        ? React.createElement("input", {
                            type: "text",
                            className: "playground-guardrails-title-input",
                            value: activeSet.name || "",
                            placeholder: "Untitled Evaluation",
                            onChange: (event) => updateEvaluationSet(activeSet.id, (set) => ({ ...set, name: event.target.value })),
                            "aria-label": "Evaluation name",
                          })
                        : evaluationPageTitle
                    ),
                    isEvaluationDetailPage
                      ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button",
                            onClick: () => handleRunEvaluation(activeSet.id),
                            disabled: activeSet.dataRows.length === 0,
                          },
                            React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Run Evaluation")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-files-library-icon-button",
                            onClick: () => handleDeleteEvaluation(activeSet.id),
                            "aria-label": "Delete evaluation",
                          }, React.createElement(Trash2, { width: 15, height: 15, strokeWidth: 1.8 }))
                        )
                      : isEvaluationRunPage
                        ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                            React.createElement("span", { className: "playground-guardrails-readonly-pill" },
                              formatPlaygroundEvaluationDate(activeRun.completedAt || activeRun.createdAt)
                            )
                          )
                        : React.createElement("div", { className: "playground-files-library-actions" },
                            React.createElement("div", { className: "playground-files-library-search-anchor" },
                              React.createElement("label", { className: "playground-files-library-search" },
                                React.createElement(Search, { className: "playground-files-library-search-icon", strokeWidth: 1.8 }),
                                React.createElement("input", {
                                  type: "text",
                                  className: "playground-files-library-search-input",
                                  placeholder: "Search evaluations",
                                  value: evaluationsSearchQuery,
                                  onChange: (event) => setEvaluationsSearchQuery(event.target.value),
                                })
                              )
                            ),
                            React.createElement("div", { className: "playground-files-library-new-anchor" },
                              React.createElement("button", {
                                type: "button",
                                className: "playground-files-library-new-button",
                                onClick: () => setEvaluationCreateModalOpen(true),
                              },
                                React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }),
                                React.createElement("span", null, "New Evaluation")
                              )
                            )
                          )
                  ),
                  isEvaluationSubpage
                    ? null
                    : React.createElement("div", { className: "playground-files-library-nav-row" },
                        React.createElement("div", { className: "playground-files-library-tabs content-mode-switch playground-guardrails-library-tabs", role: "tablist", "aria-label": "Evaluation scope" },
                          React.createElement("button", {
                            type: "button",
                            role: "tab",
                            "aria-selected": "true",
                            className: "playground-files-library-tab is-active",
                          }, "All Evaluations")
                        ),
                        React.createElement("div", { className: "playground-files-library-controls" },
                          React.createElement("div", { className: "playground-files-library-control-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-library-icon-button",
                              title: "Evaluations are sorted by update time",
                              "aria-label": "Evaluations sorted by update time",
                            }, React.createElement(ArrowUpDown, { width: 19, height: 19, strokeWidth: 1.8 }))
                          )
                        )
                      )
                )
              ),
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" },
                normalizedMode === "run" ? renderRun() : normalizedMode === "detail" ? renderDetail() : renderOverview()
              )
            )
          ),
          renderCreateModal(),
          renderJsonlModal()
        );
      }
`;
