export const EVALUATIONS_PAGE_RUNS_SCRIPT = String.raw`      function parsePlaygroundEvaluationJsonl(value) {
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

      function normalizePlaygroundEvaluationComparable(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
      }

      function buildPlaygroundEvaluationRun(set, agents = []) {
        const evaluationSet = normalizePlaygroundEvaluationSet(set);
        const evaluator = normalizePlaygroundEvaluationEvaluator(evaluationSet.evaluator);
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(evaluationSet.passThreshold);
        const nowIso = new Date().toISOString();
        const expandedRows = evaluationSet.dataRows.flatMap((row, rowIndex) => {
          const runCount = normalizePlaygroundEvaluationCaseRunCount(row.runCount);
          return Array.from({ length: runCount }, (_item, repeatIndex) => ({ row, rowIndex, repeatIndex, runCount }));
        });
        const cases = expandedRows.map(({ row, rowIndex, repeatIndex, runCount }, index) => {
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
            const basis = String(row.input || "") + "|" + expected + "|" + evaluator.type + "|" + rowIndex + "|" + repeatIndex;
            const hash = Array.from(basis).reduce((sum, char) => (sum + char.charCodeAt(0)) % 1000, 0);
            score = Math.min(0.98, Math.max(0.62, 0.62 + (hash % 36) / 100));
          }
          return normalizePlaygroundEvaluationRunCase({
            id: createPlaygroundEvaluationId("eval_run_case"),
            dataRowId: row.id,
            dataRowRunIndex: repeatIndex + 1,
            dataRowRunCount: runCount,
            threadId: "eval_thread_" + Date.now().toString(36) + "_" + index,
            input: row.input,
            expectedOutput: expected,
            actualOutput: actual,
            score,
            status: score >= passThreshold ? "passed" : "failed",
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
          passThreshold,
          cases,
        }, evaluationSet.runs.length);
      }

      function createPlaygroundEvaluationThreadRun(set, options = {}) {
        const evaluationSet = normalizePlaygroundEvaluationSet(set);
        const nowIso = new Date().toISOString();
        const expandedRows = evaluationSet.dataRows.flatMap((row, rowIndex) => {
          const runCount = normalizePlaygroundEvaluationCaseRunCount(row.runCount);
          return Array.from({ length: runCount }, (_item, repeatIndex) => ({ row, rowIndex, repeatIndex, runCount }));
        });
        const cases = expandedRows.map(({ row, repeatIndex, runCount }, index) => normalizePlaygroundEvaluationRunCase({
          id: createPlaygroundEvaluationId("eval_run_case"),
          dataRowId: row.id,
          dataRowRunIndex: repeatIndex + 1,
          dataRowRunCount: runCount,
          input: row.input,
          expectedOutput: row.expectedOutput,
          evaluationGuidance: row.evaluationGuidance,
          actualOutput: "",
          score: 0,
          status: "queued",
          latencyMs: 0,
        }, index));
        return normalizePlaygroundEvaluationRun({
          id: createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: evaluationSet.id,
          label: String(options.label || "").trim() || "Run " + (evaluationSet.runs.length + 1),
          status: "running",
          createdAt: nowIso,
          completedAt: "",
          targetAgentId: String(options.targetAgentId || evaluationSet.targetAgentId || "").trim(),
          targetAgentName: String(options.targetAgentName || "").trim(),
          targetAgentPhotoUrl: String(options.targetAgentPhotoUrl || "").trim(),
          targetAgentVersionId: String(options.targetAgentVersionId || options.agentVersionId || "").trim(),
          targetAgentVersionNumber: Math.max(0, Number(options.targetAgentVersionNumber || options.agentVersionNumber || 0) || 0),
          targetAgentVersionLabel: String(options.targetAgentVersionLabel || options.agentVersionLabel || "").trim(),
          targetAgentVersionRevisionId: String(options.targetAgentVersionRevisionId || options.agentVersionRevisionId || "").trim(),
          environmentType: String(options.environmentType || evaluationSet.environmentType || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(options.environmentId || evaluationSet.environmentId || "").trim(),
          environmentName: String(options.environmentName || "").trim(),
          projectId: String(options.projectId || evaluationSet.projectId || "").trim(),
          projectName: String(options.projectName || "").trim(),
          evaluator: normalizePlaygroundEvaluationEvaluator(options.evaluator || evaluationSet.evaluator),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(options.passThreshold ?? evaluationSet.passThreshold),
          cases,
        }, evaluationSet.runs.length);
      }

`;

