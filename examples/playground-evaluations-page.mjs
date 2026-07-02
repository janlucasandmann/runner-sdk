export const PLAYGROUND_EVALUATIONS_CSS = String.raw`
      .playground-evaluations-page .playground-files-browser-body {
        align-items: stretch;
      }

      .playground-evaluations-page .playground-guardrails-detail-title-row {
        border-bottom: 0;
      }

      .playground-evaluations-page .playground-guardrails-table-header,
      .playground-evaluations-page .playground-guardrails-table-row {
        grid-template-columns: minmax(220px, 1.3fr) 120px 120px 120px 96px 32px;
      }

      .playground-evaluations-run-table .playground-guardrails-table-header,
      .playground-evaluations-run-table .playground-guardrails-table-row {
        grid-template-columns: minmax(140px, 1fr) minmax(140px, 1fr) minmax(160px, 1fr) 64px 78px 108px 118px;
      }

      .playground-evaluations-runs-table .playground-guardrails-table-header,
      .playground-evaluations-runs-table .playground-guardrails-table-row {
        grid-template-columns: minmax(140px, 1.1fr) minmax(124px, 0.85fr) minmax(150px, 0.95fr) 70px 64px 104px 24px;
      }

      .playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(124px, 1.2fr) minmax(96px, 0.78fr) minmax(126px, 0.98fr) minmax(70px, 0.48fr) minmax(46px, 0.32fr) minmax(78px, 0.48fr) 20px;
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(124px, 1.2fr) minmax(96px, 0.78fr) minmax(126px, 0.98fr) minmax(70px, 0.48fr) minmax(46px, 0.32fr) minmax(78px, 0.48fr) 20px;
        gap: 12px;
      }

      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(124px, 1.2fr) minmax(96px, 0.78fr) minmax(126px, 0.98fr) minmax(70px, 0.48fr) minmax(46px, 0.32fr) minmax(78px, 0.48fr) 20px;
        gap: 12px;
      }

      .playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-evaluations-runs-section .playground-project-overview-threads-table-row,
      .playground-evaluations-runs-section .playground-project-overview-threads-table-header *,
      .playground-evaluations-runs-section .playground-project-overview-threads-table-row * {
        font-size: 12px;
      }

      .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-run {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-evaluations-runs-section .playground-project-overview-thread-cell,
      .playground-evaluations-runs-section .playground-plugin-row-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-score {
        color: rgba(255, 255, 255, 0.9);
        text-align: left;
      }

      .playground-evaluations-cases-table {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow-x: auto;
      }

      .playground-evaluations-cases-table-inner {
        width: 100%;
        min-width: 100%;
        display: flex;
        flex-direction: column;
      }

      .playground-evaluations-cases-header,
      .playground-evaluations-cases-row {
        display: grid;
        grid-template-columns: var(--playground-evaluations-cases-grid-template, max-content max-content max-content max-content minmax(18px, 1fr));
        gap: 18px;
        width: 100%;
        min-width: 100%;
        align-items: center;
        box-sizing: border-box;
      }

      .playground-evaluations-cases-header {
        min-height: 34px;
        padding: 0 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.45);
        font-size: 11px;
        line-height: 1.4;
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .playground-evaluations-cases-row {
        min-height: 50px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        cursor: pointer;
      }

      .playground-evaluations-cases-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-evaluations-cases-row:focus-visible {
        outline: 1px solid rgba(255, 255, 255, 0.16);
        outline-offset: 0;
      }

      .playground-evaluations-cases-header-cell,
      .playground-evaluations-cases-cell {
        font-size: 12px;
        line-height: 1.35;
        min-width: 0;
        white-space: nowrap;
      }

      .playground-evaluations-cases-cell {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-evaluations-cases-cell.is-thread,
      .playground-evaluations-cases-cell.is-evaluator {
        overflow: visible;
        text-overflow: clip;
      }

      .playground-evaluations-cases-cell.is-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-evaluations-cases-cell.is-score,
      .playground-evaluations-case-score {
        color: rgba(255, 255, 255, 0.92);
        font-weight: 400;
      }

      .playground-evaluations-case-section.playground-project-overview-panel-plain.playground-plugins-section {
        margin-top: 0 !important;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-evaluations-case-section.playground-project-overview-panel-plain.playground-plugins-section::before {
        display: none;
      }

      .playground-evaluations-case-title-row {
        min-height: 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 0 0 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-case-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-evaluations-case-title-links {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 10px;
      }

      .playground-evaluations-case-kpis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 16px;
        padding: 16px 0 4px;
      }

      .playground-evaluations-case-kpi {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-evaluations-case-kpi-label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-evaluations-case-kpi-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-evaluations-case-detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
        padding-top: 18px;
      }

      .playground-evaluations-case-detail-field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-evaluations-case-detail-field.is-wide {
        grid-column: 1 / -1;
      }

      .playground-evaluations-case-detail-field.is-reasoning {
        padding: 18px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-case-detail-label {
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-evaluations-case-detail-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        line-height: 1.45;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow: visible;
      }

      .playground-evaluations-case-detail-text {
        min-height: 0;
      }

      .playground-evaluations-case-text-content {
        min-width: 0;
        max-width: 100%;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow: visible;
      }

      .playground-evaluations-case-reasoning-markdown.tb-message-markdown,
      .playground-evaluations-case-reasoning-markdown .tb-message-markdown,
      .playground-evaluations-case-reasoning-markdown {
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-evaluations-case-reasoning-markdown.tb-message-markdown > :first-child,
      .playground-evaluations-case-reasoning-markdown .tb-message-markdown > :first-child {
        margin-top: 0;
      }

      .playground-evaluations-case-reasoning-markdown.tb-message-markdown > :last-child,
      .playground-evaluations-case-reasoning-markdown .tb-message-markdown > :last-child {
        margin-bottom: 0;
      }

      .playground-evaluations-case-detail .tb-message-markdown pre,
      .playground-evaluations-case-detail .tb-message-markdown code {
        max-width: 100%;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow: hidden;
      }

      .playground-evaluations-case-code-runner-shell.tb-runner-chat {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
      }

      .playground-evaluations-case-code-shell {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
      }

      .playground-evaluations-case-code-runner-shell.tb-runner-chat .tb-log-card-code {
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-evaluations-case-code-shell .monaco-editor,
      .playground-evaluations-case-code-shell .overflow-guard,
      .playground-evaluations-case-code-shell .monaco-editor-background,
      .playground-evaluations-case-code-shell .monaco-scrollable-element,
      .playground-evaluations-case-code-shell .lines-content,
      .playground-evaluations-case-code-shell .view-overlays,
      .playground-evaluations-case-code-shell .view-zones,
      .playground-evaluations-case-code-shell .margin-view-overlays,
      .playground-evaluations-case-code-shell .margin {
        background: transparent !important;
      }

      .playground-evaluations-case-code-shell .monaco-scrollable-element,
      .playground-evaluations-case-code-shell .overflow-guard {
        overflow: hidden !important;
      }

      .playground-evaluations-case-code-fallback {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        margin: 0;
        color: rgba(255, 255, 255, 0.86);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow: visible;
      }

      .playground-evaluations-case-links {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .playground-evaluations-page .playground-evaluations-runs-section {
        margin-top: 24px;
      }

      .playground-evaluations-page .playground-project-overview-panel-plain.playground-plugins-section {
        margin-top: 24px !important;
      }

      .playground-evaluations-page .playground-project-overview-current-tasks-section.playground-project-overview-threads-section.playground-evaluations-runs-section > .playground-plugins-section-header {
        margin-top: 0;
      }

      .playground-evaluations-page .playground-evaluations-detail-back-button {
        margin-top: 24px;
      }

      .playground-evaluations-runs-section .playground-plugins-search-row {
        margin-bottom: 12px;
      }

      .playground-evaluations-runs-table .playground-guardrails-table-header {
        padding-left: 0;
      }

      .playground-evaluations-runs-table .playground-guardrails-table-header,
      .playground-evaluations-runs-table .playground-guardrails-table-row,
      .playground-evaluations-runs-table .playground-guardrails-table-header *,
      .playground-evaluations-runs-table .playground-guardrails-table-row * {
        font-size: 12px;
      }

      .playground-evaluations-data-table .playground-guardrails-table-header,
      .playground-evaluations-data-table .playground-guardrails-table-row {
        grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) 32px;
      }

      .playground-evaluations-detail-subtitle {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-evaluations-detail-tabs {
        margin-top: 0;
      }

      .playground-evaluations-analytics-card.playground-project-overview-progress-combo-card {
        margin: 0;
      }

      .playground-evaluations-progress-combo-canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }

      .playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-score {
        background: #7effff;
      }

      .playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-cases {
        background: #66a6ff;
      }

      .playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-runs {
        background: #9ff6ce;
      }

      .playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-pass-rate {
        background: #c5a3ff;
      }

      .playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-cost {
        background: #9ff6ce;
      }

      .playground-evaluations-pass-threshold-field {
        width: min(240px, 100%);
        margin-bottom: 14px;
      }

      .playground-evaluations-pass-threshold-inline {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-evaluations-settings-header-control {
        min-width: 0;
        display: flex;
        align-items: center;
      }

      .playground-evaluations-pass-threshold-inline-label {
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        line-height: 1;
        font-weight: 500;
        white-space: nowrap;
      }

      .playground-evaluations-pass-threshold-inline .playground-evaluations-input {
        width: 76px;
        height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        background: transparent;
        text-align: center;
      }

      .playground-evaluations-dataset-guidance-section.playground-agents-detail-instructions-section {
        margin-bottom: 16px;
      }

      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-editor {
        min-height: 118px;
      }

      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-input,
      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        min-height: 118px;
      }

      .playground-evaluations-section {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-evaluations-config-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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

      .playground-evaluations-dataset-guidance {
        margin-bottom: 14px;
      }

      .playground-evaluations-score-pill {
        display: inline-flex;
        color: #54e5a6;
        font-weight: 500;
      }

      .playground-evaluations-runs-table .playground-evaluations-score-pill {
        justify-content: flex-start;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 400;
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

      .playground-evaluations-thread-link {
        width: fit-content;
        max-width: 100%;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        border: 0;
        background: transparent;
        color: rgba(102, 166, 255, 0.95);
        font: inherit;
        font-size: 12px;
        line-height: 1.35;
        padding: 0;
        cursor: pointer;
      }

      .playground-evaluations-thread-link:hover {
        color: #fff;
      }

      .playground-evaluations-run-agent-cell,
      .playground-evaluations-run-environment-cell {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-evaluations-run-agent-avatar {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        border-radius: 999px;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.11);
        color: rgba(255, 255, 255, 0.84);
        font-size: 10px;
        font-weight: 500;
      }

      .playground-evaluations-run-agent-avatar img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-evaluations-run-cell-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-run-environment-icon {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.84);
      }

      .playground-evaluations-run-modal-backdrop.playground-tasks-project-issue-backdrop {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .playground-evaluations-run-modal.playground-tasks-project-issue-modal {
        width: min(640px, calc(100vw - 48px));
      }

      .playground-evaluations-run-modal .playground-tasks-project-modal-name-row {
        gap: 10px;
      }

      .playground-evaluations-run-modal .playground-tasks-project-modal-icon-trigger {
        color: rgba(255, 255, 255, 0.9);
        cursor: default;
      }

      .playground-evaluations-run-modal .playground-tasks-issue-modal-body {
        position: relative;
        z-index: 6;
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
        .playground-evaluations-form-grid,
        .playground-evaluations-config-grid {
          grid-template-columns: 1fr;
        }

        .playground-evaluations-case-detail-grid {
          grid-template-columns: 1fr;
        }
      }
`;

export const PLAYGROUND_EVALUATIONS_SCRIPT = String.raw`
      const PLAYGROUND_EVALUATIONS_STORAGE_KEY = "runner_demo_evaluation_sets_v1";

      function createPlaygroundEvaluationId(prefix = "eval") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function normalizePlaygroundEvaluationPassThreshold(value, fallback = 0.8) {
        const fallbackScore = Math.max(0, Math.min(1, Number(fallback) || 0.8));
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return fallbackScore;
        const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;
        return Math.max(0, Math.min(1, normalizedValue));
      }

      function normalizePlaygroundEvaluationTokenCount(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
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
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
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
          evaluatorThreadId: String(source.evaluatorThreadId || source.evaluator_thread_id || "").trim(),
          input: String(source.input || ""),
          expectedOutput: String(source.expectedOutput || source.expected_output || ""),
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
          actualOutput: String(source.actualOutput || source.actual_output || ""),
          evaluatorOutput: String(source.evaluatorOutput || source.evaluator_output || ""),
          evaluatorReason: String(source.evaluatorReason || source.evaluator_reason || ""),
          evaluatorParseStatus: String(source.evaluatorParseStatus || source.evaluator_parse_status || ""),
          snapshotVersion: String(source.snapshotVersion || source.snapshot_version || ""),
          score: Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0,
          costTokens: normalizePlaygroundEvaluationTokenCount(
            source.costTokens
            ?? source.cost_tokens
            ?? source.costCt
            ?? source.costCT
            ?? source.cost_ct
            ?? source.computeTokens
            ?? source.compute_tokens
            ?? source.totalCT
            ?? source.totalCt
            ?? source.total_ct
            ?? source.ct
            ?? source.usage?.costCt
            ?? source.usage?.costCT
            ?? source.usage?.cost_ct
            ?? source.usage?.computeTokens
            ?? source.usage?.compute_tokens
            ?? source.usage?.totalCT
            ?? source.usage?.totalCt
            ?? source.usage?.total_ct
            ?? source.usage?.ct
          ),
          costSource: String(source.costSource || source.cost_source || ""),
          status: ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring", "completed", "passed", "failed", "error"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "queued",
          latencyMs: Math.max(0, Number(source.latencyMs || source.latency_ms || 0) || 0),
          error: String(source.error || ""),
        };
      }

      function normalizePlaygroundEvaluationRun(rawRun, fallbackIndex = 0) {
        const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
        const cases = Array.isArray(source.cases) ? source.cases.map((item, index) => normalizePlaygroundEvaluationRunCase(item, index)) : [];
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(source.passThreshold ?? source.pass_threshold ?? source.threshold ?? 0.8);
        const averageScore = cases.length > 0
          ? cases.reduce((sum, item) => sum + Number(item.score || 0), 0) / cases.length
          : Number(source.averageScore || source.average_score || 0) || 0;
        const activeStatuses = new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]);
        const passedCount = cases.filter((item) => !activeStatuses.has(item.status) && item.status !== "error" && Number(item.score || 0) >= passThreshold).length;
        const costTokens = normalizePlaygroundEvaluationTokenCount(
          source.costTokens
          ?? source.cost_tokens
          ?? source.costCt
          ?? source.costCT
          ?? source.cost_ct
          ?? source.computeTokens
          ?? source.compute_tokens
          ?? source.totalCT
          ?? source.totalCt
          ?? source.total_ct
          ?? source.ct
          ?? cases.reduce((sum, item) => sum + normalizePlaygroundEvaluationTokenCount(item.costTokens), 0)
        );
        return {
          id: String(source.id || source.runId || source.run_id || "").trim() || createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: String(source.evaluationSetId || source.evaluation_set_id || "").trim(),
          label: String(source.label || source.name || ("Run " + (fallbackIndex + 1))).trim(),
          status: ["queued", "running", "completed", "failed"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "completed",
          createdAt: String(source.createdAt || source.created_at || new Date().toISOString()),
          completedAt: String(source.completedAt || source.completed_at || source.updatedAt || source.updated_at || new Date().toISOString()),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || "").trim(),
          targetAgentName: String(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || "").trim(),
          targetAgentPhotoUrl: String(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL || "").trim(),
          environmentType: String(source.environmentType || source.environment_type || source.targetEnvironmentType || source.target_environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || "").trim(),
          environmentName: String(source.environmentName || source.environment_name || source.computerName || source.computer_name || "").trim(),
          projectId: String(source.projectId || source.project_id || "").trim(),
          projectName: String(source.projectName || source.project_name || "").trim(),
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator),
          passThreshold,
          datasetVersion: String(source.datasetVersion || source.dataset_version || ""),
          evaluatorVersion: String(source.evaluatorVersion || source.evaluator_version || ""),
          averageScore: Math.max(0, Math.min(1, averageScore)),
          passedCount,
          totalCount: cases.length,
          costTokens,
          costSource: String(source.costSource || source.cost_source || ""),
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
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(source.passThreshold ?? source.pass_threshold ?? source.threshold ?? 0.8);
        return {
          id: String(source.id || source.evaluationId || source.evaluation_id || "").trim() || createPlaygroundEvaluationId("eval_set"),
          name: String(source.name || source.title || "Untitled Evaluation").trim() || "Untitled Evaluation",
          description: String(source.description || ""),
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
          passThreshold,
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || "").trim(),
          environmentType: String(source.environmentType || source.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || "").trim(),
          projectId: String(source.projectId || source.project_id || "").trim(),
          dataRows: dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: runs.map((run, index) => normalizePlaygroundEvaluationRun({ passThreshold, ...(run || {}) }, index)),
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
          passThreshold: 0.8,
          evaluator: { type: "exact" },
          targetAgentId: "",
          environmentType: "computer",
          environmentId: "",
          projectId: "",
          dataRows: [
            {
              input: "Summarize the customer request in one sentence.",
              expectedOutput: "A concise one-sentence summary of the request.",
              evaluationGuidance: "",
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
          evaluationGuidance: row?.evaluationGuidance || "",
        })).join("\n");
      }

      function normalizePlaygroundEvaluationComparable(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
      }

      function buildPlaygroundEvaluationRun(set, agents = []) {
        const evaluationSet = normalizePlaygroundEvaluationSet(set);
        const evaluator = normalizePlaygroundEvaluationEvaluator(evaluationSet.evaluator);
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(evaluationSet.passThreshold);
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
        const cases = evaluationSet.dataRows.map((row, index) => normalizePlaygroundEvaluationRunCase({
          id: createPlaygroundEvaluationId("eval_run_case"),
          dataRowId: row.id,
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

      function getPlaygroundEvaluationEntityLabel(records, id, fallback = "") {
        const normalizedId = String(id || "").trim();
        if (!normalizedId) return fallback;
        const record = (Array.isArray(records) ? records : []).find((item) => String(item?.id || "").trim() === normalizedId) || null;
        return String(record?.name || record?.label || record?.title || normalizedId).trim() || fallback || normalizedId;
      }

      function getPlaygroundEvaluationDefaultId(records, preferredId = "") {
        const normalizedPreferredId = String(preferredId || "").trim();
        const source = (Array.isArray(records) ? records : []).filter((item) => String(item?.id || "").trim());
        if (normalizedPreferredId && source.some((item) => String(item?.id || "").trim() === normalizedPreferredId)) {
          return normalizedPreferredId;
        }
        const defaultRecord = source.find((item) => item?.isDefault || item?.default || item?.is_default) || source[0] || null;
        return String(defaultRecord?.id || "").trim();
      }

      function getPlaygroundEvaluationAgentPhotoUrl(agent) {
        return String(agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL || agent?.imageUrl || agent?.imageURL || agent?.avatar || "").trim();
      }

      function getPlaygroundEvaluationInitials(label) {
        const parts = String(label || "").trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return "A";
        return parts.slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "A";
      }

      function getPlaygroundEvaluationAgentRecord(records, id) {
        const normalizedId = String(id || "").trim();
        return (Array.isArray(records) ? records : []).find((item) => String(item?.id || "").trim() === normalizedId) || null;
      }

      function buildPlaygroundEvaluationEnvironmentChoices(environments = [], projects = []) {
        const computerChoices = (Array.isArray(environments) ? environments : [])
          .filter((environment) => String(environment?.id || "").trim())
          .map((environment) => ({
            key: "computer:" + String(environment.id || "").trim(),
            type: "computer",
            id: String(environment.id || "").trim(),
            environmentId: String(environment.id || "").trim(),
            environmentName: String(environment.name || environment.label || environment.id || "").trim(),
            projectId: "",
            projectName: "",
            disabled: false,
          }));
        const projectChoices = (Array.isArray(projects) ? projects : [])
          .filter((project) => String(project?.id || "").trim())
          .map((project) => {
            const projectId = String(project.id || "").trim();
            const environmentId = String(project.defaultEnvironmentId || project.default_environment_id || project.environmentId || project.environment_id || "").trim();
            return {
              key: "project:" + projectId,
              type: "project",
              id: projectId,
              environmentId,
              environmentName: "",
              projectId,
              projectName: String(project.name || project.label || project.title || project.id || "").trim(),
              disabled: !environmentId,
            };
          });
        return computerChoices.concat(projectChoices);
      }

      function getPlaygroundEvaluationEnvironmentChoice(choices, source = {}, fallbackEnvironmentId = "") {
        const environmentType = String(source.environmentType || source.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer";
        const projectId = String(source.projectId || source.project_id || "").trim();
        const environmentId = String(source.environmentId || source.environment_id || fallbackEnvironmentId || "").trim();
        const byProject = environmentType === "project" && projectId
          ? choices.find((choice) => choice.type === "project" && choice.projectId === projectId && !choice.disabled)
          : null;
        if (byProject) return byProject;
        const byEnvironment = environmentId
          ? choices.find((choice) => choice.environmentId === environmentId && (environmentType !== "computer" || choice.type === "computer") && !choice.disabled)
          : null;
        if (byEnvironment) return byEnvironment;
        return choices.find((choice) => !choice.disabled) || null;
      }

      function getPlaygroundEvaluationEnvironmentChoiceByKey(choices, key) {
        const normalizedKey = String(key || "").trim();
        return (Array.isArray(choices) ? choices : []).find((choice) => choice.key === normalizedKey && !choice.disabled) || null;
      }

      function extractPlaygroundEvaluationThreadRecord(payload) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        const candidates = [
          source.thread,
          source.data?.thread,
          source.data,
          source.item,
          source.record,
          source,
        ];
        for (const candidate of candidates) {
          if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && String(candidate.id || candidate.threadId || candidate.thread_id || "").trim()) {
            return {
              ...candidate,
              id: String(candidate.id || candidate.threadId || candidate.thread_id || "").trim(),
            };
          }
        }
        return null;
      }

      async function readPlaygroundEvaluationJsonResponse(response, fallbackMessage) {
        const text = await response.text().catch(() => "");
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: text };
        }
        if (!response.ok) {
          const message = String(data?.message || data?.error || fallbackMessage || "Request failed").trim();
          throw new Error(message);
        }
        return data;
      }

      function extractPlaygroundEvaluationStreamSummary(text) {
        let latestText = "";
        String(text || "").split(/\n\n+/).forEach((block) => {
          const data = block
            .split(/\r?\n/)
            .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
            .filter(Boolean)
            .join("\n")
            .trim();
          if (!data || data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const response = parsed?.response && typeof parsed.response === "object" ? parsed.response : {};
            const outputText = String(
              parsed?.summary
              || parsed?.output_text
              || parsed?.outputText
              || response?.output_text
              || response?.outputText
              || ""
            ).trim();
            if (outputText) {
              latestText = outputText;
            }
          } catch {}
        });
        return latestText;
      }

      function normalizePlaygroundEvaluationResponseArray(data, keys = []) {
        if (Array.isArray(data)) {
          return data;
        }
        if (!data || typeof data !== "object") {
          return [];
        }
        for (const key of keys) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.results)) return data.results;
        return [];
      }

      function readPlaygroundEvaluationRecordText(value) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          return String(value).trim();
        }
        if (Array.isArray(value)) {
          return value.map((entry) => readPlaygroundEvaluationRecordText(entry)).filter(Boolean).join("\n").trim();
        }
        if (!value || typeof value !== "object") {
          return "";
        }
        const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata) ? value.metadata : {};
        const response = value.response && typeof value.response === "object" && !Array.isArray(value.response) ? value.response : {};
        const result = value.result && typeof value.result === "object" && !Array.isArray(value.result) ? value.result : {};
        const candidates = [
          value.summary,
          value.runSummary,
          value.run_summary,
          value.output,
          value.outputText,
          value.output_text,
          value.content,
          value.text,
          value.message,
          value.body,
          response.output_text,
          response.outputText,
          response.summary,
          result.output_text,
          result.outputText,
          result.summary,
          result.text,
          metadata.summary,
          metadata.runSummary,
          metadata.run_summary,
          metadata.output,
          metadata.outputText,
          metadata.output_text,
          metadata.result,
          metadata.response,
          metadata.content,
          metadata.text,
          metadata.message,
        ];
        for (const candidate of candidates) {
          const text = readPlaygroundEvaluationRecordText(candidate);
          if (text) {
            return text;
          }
        }
        if (Object.prototype.hasOwnProperty.call(value, "score") || Object.prototype.hasOwnProperty.call(value, "reason")) {
          try {
            return JSON.stringify(value);
          } catch {}
        }
        return "";
      }

      function getPlaygroundEvaluationRecordType(record) {
        const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        return String(record?.eventType || record?.event_type || record?.stepKind || record?.step_kind || record?.type || record?.kind || metadata?.eventType || metadata?.type || "").trim().toLowerCase();
      }

      function getPlaygroundEvaluationRecordTimestamp(record) {
        return String(record?.createdAt || record?.created_at || record?.timestamp || record?.updatedAt || record?.updated_at || "").trim();
      }

      function extractPlaygroundEvaluationFinalSummaryFromRecords(records) {
        const orderedRecords = (Array.isArray(records) ? records : [])
          .filter((record) => record && typeof record === "object")
          .sort((left, right) => getPlaygroundEvaluationRecordTimestamp(left).localeCompare(getPlaygroundEvaluationRecordTimestamp(right)));
        const preferredRecords = orderedRecords.filter((record) => {
          const type = getPlaygroundEvaluationRecordType(record);
          return type === "turn_completed" || type === "run_summary" || type.includes("summary");
        });
        const candidates = preferredRecords.length > 0 ? preferredRecords : orderedRecords;
        for (let index = candidates.length - 1; index >= 0; index -= 1) {
          const text = readPlaygroundEvaluationRecordText(candidates[index]);
          if (text) {
            return text;
          }
        }
        return "";
      }

      function sleepPlaygroundEvaluation(ms) {
        return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
      }

      async function fetchPlaygroundEvaluationJson({ backendUrl, requestHeaders, path }) {
        const response = await fetch(backendUrl + path, {
          method: "GET",
          headers: requestHeaders || {},
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.message || data?.error || "Failed to load evaluation thread data."));
        }
        return data;
      }

      async function fetchPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId }) {
        const normalizedThreadId = String(threadId || "").trim();
        if (!backendUrl || !normalizedThreadId) {
          return "";
        }
        const encodedThreadId = encodeURIComponent(normalizedThreadId);
        const [stepsResult, logsResult, threadResult] = await Promise.allSettled([
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId + "/steps?limit=80&compact=1",
          }),
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId + "/logs?compact=1&includeConversation=0&limit=80",
          }),
          fetchPlaygroundEvaluationJson({
            backendUrl,
            requestHeaders,
            path: "/threads/" + encodedThreadId,
          }),
        ]);
        const steps = stepsResult.status === "fulfilled" ? normalizePlaygroundEvaluationResponseArray(stepsResult.value, ["steps"]) : [];
        const logs = logsResult.status === "fulfilled" ? normalizePlaygroundEvaluationResponseArray(logsResult.value, ["logs"]) : [];
        const summary = extractPlaygroundEvaluationFinalSummaryFromRecords([...steps, ...logs]);
        if (summary) {
          return summary;
        }
        if (threadResult.status === "fulfilled") {
          return readPlaygroundEvaluationRecordText(threadResult.value?.thread || threadResult.value?.data || threadResult.value);
        }
        return "";
      }

      async function waitForPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId, fallback = "" }) {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const summary = await fetchPlaygroundEvaluationThreadFinalSummary({ backendUrl, requestHeaders, threadId }).catch(() => "");
          if (summary) {
            return summary;
          }
          if (attempt < 5) {
            await sleepPlaygroundEvaluation(700 + attempt * 250);
          }
        }
        return String(fallback || "").trim();
      }

      function attachPlaygroundEvaluationThreadMetadata(threadRecord, metadata, extra = {}) {
        const source = threadRecord && typeof threadRecord === "object" && !Array.isArray(threadRecord) ? threadRecord : {};
        const sourceMetadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const baseEvaluation = metadata?.evaluation && typeof metadata.evaluation === "object" && !Array.isArray(metadata.evaluation) ? metadata.evaluation : {};
        const sourceEvaluation = sourceMetadata.evaluation && typeof sourceMetadata.evaluation === "object" && !Array.isArray(sourceMetadata.evaluation) ? sourceMetadata.evaluation : {};
        const baseRunnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground) ? metadata.runnerPlayground : {};
        const sourceRunnerPlayground = sourceMetadata.runnerPlayground && typeof sourceMetadata.runnerPlayground === "object" && !Array.isArray(sourceMetadata.runnerPlayground) ? sourceMetadata.runnerPlayground : {};
        return {
          ...source,
          ...extra,
          hidden: true,
          sidebarHidden: true,
          metadata: {
            ...metadata,
            ...sourceMetadata,
            evaluation: {
              ...baseEvaluation,
              ...sourceEvaluation,
              hidden: true,
            },
            runnerPlayground: {
              ...baseRunnerPlayground,
              ...sourceRunnerPlayground,
              hidden: true,
              sidebarHidden: true,
            },
          },
        };
      }

      function parsePlaygroundEvaluationScoreFromText(value) {
        const text = String(value || "").trim();
        if (!text) {
          return null;
        }
        const fencePattern = "\\x60\\x60\\x60";
        const fencedJsonMatch = text.match(new RegExp(fencePattern + "(?:json)?\\\\s*([\\\\s\\\\S]*?)" + fencePattern, "i"));
        const objectJsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonCandidate = (fencedJsonMatch && fencedJsonMatch[1])
          || (objectJsonMatch && objectJsonMatch[0])
          || "";
        if (jsonCandidate) {
          try {
            const parsed = JSON.parse(jsonCandidate);
            const rawScore = parsed?.score ?? parsed?.grade ?? parsed?.rating ?? parsed?.result?.score;
            const numericScore = Number(rawScore);
            if (Number.isFinite(numericScore)) {
              return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
            }
          } catch {}
        }
        const percentMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*(100|[0-9]{1,2}(?:\.[0-9]+)?)\s*%/i);
        if (percentMatch) {
          return Math.max(0, Math.min(1, Number(percentMatch[1]) / 100));
        }
        const fractionMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*([01](?:\.[0-9]+)?|0?\.[0-9]+)\s*\/\s*1\b/i);
        if (fractionMatch) {
          return Math.max(0, Math.min(1, Number(fractionMatch[1])));
        }
        const numberMatch = text.match(/(?:score|grade|rating)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
        if (numberMatch) {
          const numericScore = Number(numberMatch[1]);
          if (Number.isFinite(numericScore)) {
            return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
          }
        }
        return null;
      }

      function buildPlaygroundEvaluationAgentEvaluatorPrompt({ row, evaluationSet, run, caseRun, evaluationThreadId }) {
        return [
          "You are the evaluator for an agent evaluation run. Judge the completed evaluation thread against the expected output for the given input.",
          "Evaluation thread ID: " + String(evaluationThreadId || ""),
          "Inspect the evaluation thread directly before scoring. Use its user messages, assistant run summary, working logs, and created artifacts as the source of truth.",
          "Return only valid JSON in this exact shape: {\"score\": 0.0, \"reason\": \"short explanation\"}.",
          "The score must be a number between 0 and 1. Use 1 for a fully correct answer, 0 for a completely wrong answer, and partial values for partially correct answers.",
          "Do not solve the original task yourself. Only evaluate what happened in the evaluation thread.",
          "Evaluation set: " + (evaluationSet.name || "Untitled Evaluation"),
          "Run: " + (run.label || "Evaluation Run"),
          "Case ID: " + (caseRun.id || ""),
          "Input:\n" + String(row.input || ""),
          "Expected output:\n" + String(row.expectedOutput || "")
        ].join("\n\n");
      }

      async function createPlaygroundEvaluationHiddenThread({ backendUrl, requestHeaders, title, agentId, environmentId, projectId, metadata }) {
        const createHeaders = new Headers(requestHeaders || {});
        createHeaders.set("Content-Type", "application/json");
        const createResponse = await fetch(backendUrl + "/threads", {
          method: "POST",
          headers: createHeaders,
          body: JSON.stringify({
            title,
            appId: "runner-web-sdk-demo",
            agentId,
            environmentId,
            ...(projectId ? { projectId } : {}),
            hidden: true,
            sidebarHidden: true,
            metadata,
          }),
        });
        const createData = await readPlaygroundEvaluationJsonResponse(createResponse, "Failed to create evaluation thread.");
        const threadRecord = extractPlaygroundEvaluationThreadRecord(createData);
        if (!threadRecord?.id) {
          throw new Error("Thread creation succeeded but no thread id was returned.");
        }
        return attachPlaygroundEvaluationThreadMetadata(threadRecord, metadata);
      }

      async function runPlaygroundEvaluationThreadMessage({ backendUrl, requestHeaders, threadId, content }) {
        const messageHeaders = new Headers(requestHeaders || {});
        messageHeaders.set("Content-Type", "application/json");
        const messageResponse = await fetch(backendUrl + "/threads/" + encodeURIComponent(threadId) + "/messages", {
          method: "POST",
          headers: messageHeaders,
          body: JSON.stringify({
            content,
            task: content,
          }),
        });
        if (!messageResponse.ok) {
          const errorData = await readPlaygroundEvaluationJsonResponse(messageResponse, "Failed to start evaluation thread.");
          throw new Error(String(errorData?.message || errorData?.error || "Failed to start evaluation thread."));
        }
        const streamText = await messageResponse.text().catch(() => "");
        const streamSummary = extractPlaygroundEvaluationStreamSummary(streamText);
        return await waitForPlaygroundEvaluationThreadFinalSummary({
          backendUrl,
          requestHeaders,
          threadId,
          fallback: streamSummary,
        });
      }

      async function startPlaygroundEvaluationCaseThread(options = {}) {
        const backendUrl = String(options.backendUrl || "").replace(/\/+$/, "");
        const requestHeaders = options.requestHeaders || {};
        const evaluationSet = normalizePlaygroundEvaluationSet(options.evaluationSet);
        const run = normalizePlaygroundEvaluationRun(options.run);
        const row = normalizePlaygroundEvaluationDataRow(options.row, Number(options.index || 0));
        const caseRun = normalizePlaygroundEvaluationRunCase(options.caseRun, Number(options.index || 0));
        const agentId = String(options.agentId || evaluationSet.targetAgentId || "").trim();
        const environmentId = String(options.environmentId || evaluationSet.environmentId || "").trim();
        const projectId = String(options.projectId || evaluationSet.projectId || "").trim();
        const environmentType = String(options.environmentType || evaluationSet.environmentType || "").trim().toLowerCase() === "project" ? "project" : "computer";
        const caseNumber = Math.max(1, Number(options.index || 0) + 1);
        const title = (evaluationSet.name || "Evaluation") + " · " + (run.label || "Run") + " · Case " + caseNumber;
        if (!backendUrl) {
          throw new Error("Evaluation backend is unavailable.");
        }
        if (!agentId) {
          throw new Error("Select an agent to run this evaluation.");
        }
        if (!environmentId) {
          throw new Error(environmentType === "project" ? "Select a project with a default computer." : "Select a computer to run this evaluation.");
        }
        if (!String(row.input || "").trim()) {
          throw new Error("Evaluation input is empty.");
        }

        const metadata = {
          evaluation: {
            setId: evaluationSet.id,
            runId: run.id,
            caseId: caseRun.id,
            dataRowId: row.id,
            kind: "case",
            hidden: true,
            sidebarHidden: true,
            environmentType,
            projectId,
            environmentId,
          },
          runnerPlayground: {
            type: "evaluation_case",
            evaluationSetId: evaluationSet.id,
            evaluationRunId: run.id,
            evaluationCaseId: caseRun.id,
            evaluationDataRowId: row.id,
            evaluationKind: "case",
            hidden: true,
            sidebarHidden: true,
            environmentType,
            projectId,
            environmentId,
          },
        };
        const threadRecord = await createPlaygroundEvaluationHiddenThread({
          backendUrl,
          requestHeaders,
          title,
          agentId,
          environmentId,
          projectId,
          metadata,
        });
        if (typeof options.onThreadCreated === "function") {
          options.onThreadCreated(threadRecord);
        }

        const startedAt = Date.now();
        const actualOutput = await runPlaygroundEvaluationThreadMessage({
          backendUrl,
          requestHeaders,
          threadId: threadRecord.id,
          content: row.input,
        });
        const latencyMs = Date.now() - startedAt;
        const evaluator = normalizePlaygroundEvaluationEvaluator(evaluationSet.evaluator);
        const expected = String(row.expectedOutput || "");
        const hasComparableActual = Boolean(actualOutput.trim());
        let evaluatorThreadRecord = null;
        let evaluatorOutput = "";
        let score = 0;
        let status = "completed";
        if (evaluator.type === "exact") {
          score = hasComparableActual && expected.trim()
            ? (normalizePlaygroundEvaluationComparable(actualOutput) === normalizePlaygroundEvaluationComparable(expected) ? 1 : 0)
            : 0;
          status = hasComparableActual && expected.trim() ? (score >= 1 ? "passed" : "failed") : "completed";
        } else if (evaluator.type === "agent") {
          const evaluatorAgentId = String(evaluator.agentId || "").trim();
          if (!evaluatorAgentId) {
            throw new Error("Select an evaluator agent before running this evaluation.");
          }
          const evaluatorMetadata = {
            evaluation: {
              setId: evaluationSet.id,
              runId: run.id,
              caseId: caseRun.id,
              dataRowId: row.id,
              kind: "evaluator",
              sourceThreadId: threadRecord.id,
              hidden: true,
              sidebarHidden: true,
              environmentType,
              projectId,
              environmentId,
            },
            runnerPlayground: {
              type: "evaluation_evaluator",
              evaluationSetId: evaluationSet.id,
              evaluationRunId: run.id,
              evaluationCaseId: caseRun.id,
              evaluationDataRowId: row.id,
              evaluationKind: "evaluator",
              sourceThreadId: threadRecord.id,
              hidden: true,
              sidebarHidden: true,
              environmentType,
              projectId,
              environmentId,
            },
          };
          evaluatorThreadRecord = await createPlaygroundEvaluationHiddenThread({
            backendUrl,
            requestHeaders,
            title: title + " · Evaluator",
            agentId: evaluatorAgentId,
            environmentId,
            projectId,
            metadata: evaluatorMetadata,
          });
          if (typeof options.onThreadCreated === "function") {
            options.onThreadCreated(evaluatorThreadRecord);
          }
          evaluatorOutput = await runPlaygroundEvaluationThreadMessage({
            backendUrl,
            requestHeaders,
            threadId: evaluatorThreadRecord.id,
            content: buildPlaygroundEvaluationAgentEvaluatorPrompt({
              row,
              evaluationSet,
              run,
              caseRun,
              evaluationThreadId: threadRecord.id,
            }),
          });
          const parsedScore = parsePlaygroundEvaluationScoreFromText(evaluatorOutput);
          score = parsedScore === null ? 0 : parsedScore;
          status = parsedScore === null ? "completed" : score >= 0.8 ? "passed" : "failed";
        } else if (evaluator.type === "code") {
          try {
            const evaluatorFn = new Function("input", "expected", "actual", String(evaluator.code || "return 0;"));
            const rawScore = evaluatorFn(String(row.input || ""), expected, actualOutput);
            const numericScore = Number(rawScore);
            score = Number.isFinite(numericScore) ? Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore)) : 0;
            status = score >= 0.8 ? "passed" : "failed";
          } catch (error) {
            evaluatorOutput = error?.message || String(error);
            score = 0;
            status = "error";
          }
        }
        return {
          thread: threadRecord,
          evaluatorThread: evaluatorThreadRecord,
          casePatch: {
            threadId: threadRecord.id,
            evaluatorThreadId: evaluatorThreadRecord?.id || "",
            actualOutput: actualOutput || "Thread completed. Open the thread to inspect the run summary.",
            evaluatorOutput,
            score,
            status,
            latencyMs,
            error: status === "error" ? evaluatorOutput : "",
          },
        };
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

      function formatPlaygroundEvaluationCostCt(value) {
        const tokens = normalizePlaygroundEvaluationTokenCount(value);
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(tokens);
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
        const score = Math.max(0, Math.min(1, Number(caseItem?.score || 0)));
        const parseStatus = String(caseItem?.evaluatorParseStatus || caseItem?.evaluator_parse_status || "").trim().toLowerCase();
        if (
          normalizedStatus === "error"
          && score > 0
          && (parseStatus.startsWith("parsed") || caseItem?.evaluatorThreadId || caseItem?.evaluatorOutput)
        ) {
          return score >= normalizePlaygroundEvaluationPassThreshold(passThreshold) ? "passed" : "failed";
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

      function renderPlaygroundEvaluationsPage(options = {}) {
        return React.createElement(PlaygroundEvaluationsPageView, options);
      }

      function PlaygroundEvaluationsPageView(options = {}) {
        const {
          evaluationSets,
          setEvaluationSets,
          selectedEvaluationSetId,
          setSelectedEvaluationSetId,
          selectedEvaluationRunId,
          setSelectedEvaluationRunId,
          selectedEvaluationCaseId,
          setSelectedEvaluationCaseId,
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
          backendUrl,
          requestHeaders,
          agents,
          environments,
          projects,
          defaultAgentId,
          defaultEnvironmentId,
          evaluationRunModalOpen,
          setEvaluationRunModalOpen,
          evaluationRunForm,
          setEvaluationRunForm,
          evaluationRunsSearchQuery,
          setEvaluationRunsSearchQuery,
          evaluationRunsSortMode,
          setEvaluationRunsSortMode,
          evaluationRunsFilterMode,
          setEvaluationRunsFilterMode,
          evaluationRunsToolbarPopover,
          setEvaluationRunsToolbarPopover,
          evaluationRunsVisibleCount,
          setEvaluationRunsVisibleCount,
          onOpenThread,
          onEvaluationThreadStarted,
          topNavActionsPortalId,
        } = options;
        const evaluationActionsPopoverRef = useRef(null);
        const evaluationRenameInputRef = useRef(null);
        const evaluationGuidanceTextareaRef = useRef(null);
        const announcedEvaluationThreadIdsRef = useRef(new Set());
        const hydratedEvaluationRunCostIdsRef = useRef(new Set());
        const [evaluationTopNavActionsContainer, setEvaluationTopNavActionsContainer] = useState(null);
        const [evaluationActionsPopoverOpen, setEvaluationActionsPopoverOpen] = useState(false);
        const [evaluationRenameState, setEvaluationRenameState] = useState(null);
        const [evaluationRenameValue, setEvaluationRenameValue] = useState("");
        const [evaluationRenameError, setEvaluationRenameError] = useState("");
        const [evaluationCasesSearchQuery, setEvaluationCasesSearchQuery] = useState("");
        const [evaluationCasesSortMode, setEvaluationCasesSortMode] = useState("case-asc");
        const [evaluationCasesFilterMode, setEvaluationCasesFilterMode] = useState("all");
        const [evaluationCasesToolbarPopover, setEvaluationCasesToolbarPopover] = useState("");
        const [evaluationCasesVisibleCount, setEvaluationCasesVisibleCount] = useState(10);
        const [evaluationGuidanceEditingId, setEvaluationGuidanceEditingId] = useState("");
        const [evaluationGuidanceHistoryById, setEvaluationGuidanceHistoryById] = useState({});
        const normalizedSets = (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => normalizePlaygroundEvaluationSet(set));
        const agentOptions = Array.isArray(agents) ? agents : [];
        const environmentOptions = Array.isArray(environments) ? environments : [];
        const projectOptions = Array.isArray(projects) ? projects : [];
        const environmentChoices = buildPlaygroundEvaluationEnvironmentChoices(environmentOptions, projectOptions);
        const activeSet = normalizedSets.find((set) => set.id === selectedEvaluationSetId) || normalizedSets[0] || null;
        const activeRun = activeSet?.runs?.find((run) => run.id === selectedEvaluationRunId) || activeSet?.runs?.[0] || null;
        const activeCase = activeRun?.cases?.find((caseItem) => caseItem.id === selectedEvaluationCaseId) || null;
        const normalizedMode = evaluationsPageMode === "case" && activeSet && activeRun && activeCase
          ? "case"
          : evaluationsPageMode === "run" && activeRun
            ? "run"
            : evaluationsPageMode === "detail" && activeSet
              ? "detail"
              : "overview";
        const isEvaluationDetailPage = normalizedMode === "detail" && Boolean(activeSet);
        const nowIso = new Date().toISOString();

        useEffect(() => {
          if (!evaluationGuidanceEditingId || typeof window === "undefined") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeEvaluationGuidanceTextarea(evaluationGuidanceTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [evaluationGuidanceEditingId, activeSet?.id, activeSet?.evaluationGuidance]);

        useEffect(() => {
          if (!topNavActionsPortalId || typeof document === "undefined") {
            setEvaluationTopNavActionsContainer(null);
            return undefined;
          }
          const updateContainer = () => {
            setEvaluationTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
          };
          updateContainer();
          const frameId = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function"
            ? window.requestAnimationFrame(updateContainer)
            : null;
          return () => {
            if (frameId && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
              window.cancelAnimationFrame(frameId);
            }
          };
        }, [topNavActionsPortalId, normalizedMode]);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            setEvaluationActionsPopoverOpen(false);
          }
        }, [isEvaluationDetailPage]);

        useEffect(() => {
          if (!evaluationActionsPopoverOpen) {
            return undefined;
          }

          function handleEvaluationActionsPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !evaluationActionsPopoverRef.current || evaluationActionsPopoverRef.current.contains(target)) {
              return;
            }
            setEvaluationActionsPopoverOpen(false);
          }

          function handleEvaluationActionsPopoverEscape(event) {
            if (event.key === "Escape") {
              setEvaluationActionsPopoverOpen(false);
            }
          }

          document.addEventListener("mousedown", handleEvaluationActionsPopoverPointerDown);
          window.addEventListener("keydown", handleEvaluationActionsPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleEvaluationActionsPopoverPointerDown);
            window.removeEventListener("keydown", handleEvaluationActionsPopoverEscape);
          };
        }, [evaluationActionsPopoverOpen]);

        useEffect(() => {
          if (!evaluationRenameState || !evaluationRenameInputRef.current) {
            return;
          }
          evaluationRenameInputRef.current.focus();
          evaluationRenameInputRef.current.select();
        }, [evaluationRenameState]);

        useEffect(() => {
          if (!activeSet?.id || !activeRun?.id || (normalizedMode !== "run" && normalizedMode !== "case")) {
            return;
          }
          if (isPlaygroundEvaluationRunActive(activeRun)) {
            return;
          }
          const hasThreadIds = activeRun.cases.some((caseItem) => caseItem.threadId || caseItem.evaluatorThreadId);
          if (!hasThreadIds) {
            return;
          }
          const hasFreshCost = activeRun.costSource === "thread_usage_ct"
            && activeRun.cases.every((caseItem) => !caseItem.threadId && !caseItem.evaluatorThreadId ? true : caseItem.costSource === "thread_usage_ct");
          if (hasFreshCost) {
            return;
          }
          const hydrationKey = activeRun.id + ":" + String(activeRun.completedAt || activeRun.createdAt || "");
          if (hydratedEvaluationRunCostIdsRef.current.has(hydrationKey)) {
            return;
          }
          hydratedEvaluationRunCostIdsRef.current.add(hydrationKey);
          void hydrateEvaluationRunCosts(activeSet.id, activeRun).catch((error) => {
            hydratedEvaluationRunCostIdsRef.current.delete(hydrationKey);
            console.warn("[evaluations] Failed to hydrate run cost", error);
          });
        }, [
          activeSet?.id,
          activeRun?.id,
          activeRun?.costSource,
          activeRun?.completedAt,
          normalizedMode,
        ]);

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

        function resizeEvaluationGuidanceTextarea(textarea) {
          if (!textarea || typeof window === "undefined") return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          textarea.style.height = (String(textarea.value || "").trim()
            ? Math.max(singleLineHeight, textarea.scrollHeight)
            : singleLineHeight) + "px";
        }

        function updateEvaluationGuidanceValue(setId, value, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          const nextValue = String(value ?? "");
          const currentSet = normalizedSets.find((set) => set.id === normalizedSetId) || null;
          const previousValue = String(currentSet?.evaluationGuidance || "");
          if (previousValue === nextValue) return;
          if (options.recordHistory !== false) {
            setEvaluationGuidanceHistoryById((current) => {
              const currentHistory = current[normalizedSetId] || { past: [], future: [] };
              return {
                ...current,
                [normalizedSetId]: {
                  past: [...(Array.isArray(currentHistory.past) ? currentHistory.past : []), previousValue].slice(-80),
                  future: [],
                },
              };
            });
          }
          updateEvaluationSet(normalizedSetId, (set) => ({
            ...set,
            evaluationGuidance: nextValue,
          }));
        }

        function focusEvaluationGuidanceTextareaAtEnd(value) {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationGuidanceTextareaRef.current;
            if (!textarea) return;
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function applyEvaluationGuidanceSelection(setId, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateEvaluationGuidanceValue(setId, nextValue);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationGuidanceTextareaRef.current;
            if (!textarea) return;
            const maxLength = String(nextValue || "").length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          if (safeStart !== safeEnd) {
            if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length >= prefix.length + suffix.length) {
              const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
              return {
                value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                selectionStart: safeStart,
                selectionEnd: safeStart + unwrappedText.length,
              };
            }
            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              return {
                value: value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length),
                selectionStart: safeStart - prefix.length,
                selectionEnd: safeStart - prefix.length + selectedText.length,
              };
            }
            const wrappedText = prefix + selectedText + suffix;
            return {
              value: value.slice(0, safeStart) + wrappedText + value.slice(safeEnd),
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length + selectedText.length,
            };
          }
          const insertedText = prefix + suffix;
          return {
            value: value.slice(0, safeStart) + insertedText + value.slice(safeEnd),
            selectionStart: safeStart + prefix.length,
            selectionEnd: safeStart + prefix.length,
          };
        }

        function buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
          let lineEnd = value.indexOf("\n", safeEnd);
          if (lineEnd === -1) lineEnd = value.length;
          const block = value.slice(lineStart, lineEnd);
          const lines = block.split("\n");
          const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
          const isOrderedList = listType === "ordered";
          const orderedListPattern = /^(\s*)\d+\.\s+/;
          const unorderedListPattern = /^(\s*)-\s+/;
          const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => (
            isOrderedList ? orderedListPattern.test(line) : unorderedListPattern.test(line)
          ));
          let orderedIndex = 1;
          const nextLines = lines.map((line) => {
            if (!line.trim()) {
              if (shouldRemoveList) return line;
              return isOrderedList ? String(orderedIndex++) + ". " : "- ";
            }
            if (shouldRemoveList) {
              return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
            }
            if (!isOrderedList && unorderedListPattern.test(line)) return line;
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
            return cleanLine.replace(/^(\s*)/, (_match, indent) => (
              String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- ")
            ));
          });
          const nextBlock = nextLines.join("\n");
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

        function buildEvaluationMarkdownLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            return {
              value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
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

        function handleEvaluationGuidanceMarkdownFormat(setId, formatType) {
          const textarea = evaluationGuidanceTextareaRef.current;
          const currentSet = normalizedSets.find((set) => set.id === setId) || null;
          if (!textarea || !currentSet) return;
          const value = String(currentSet.evaluationGuidance || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildEvaluationMarkdownLinkEdit(value, selectionStart, selectionEnd);
          }
          if (!edit) return;
          applyEvaluationGuidanceSelection(setId, edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function updateEvaluationRunCase(setId, runId, caseId, patch) {
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) return normalized;
            const runs = normalized.runs.map((run) => {
              if (run.id !== runId) return run;
              const cases = run.cases.map((caseItem) => (
                caseItem.id === caseId
                  ? normalizePlaygroundEvaluationRunCase({ ...caseItem, ...patch })
                  : caseItem
              ));
              const activeCases = cases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
              const errorCases = cases.filter((caseItem) => caseItem.status === "error");
              const averageScore = cases.length > 0
                ? cases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / cases.length
                : 0;
              const passThreshold = normalizePlaygroundEvaluationPassThreshold(run.passThreshold);
              return normalizePlaygroundEvaluationRun({
                ...run,
                cases,
                averageScore,
                passedCount: cases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error" && Number(caseItem.score || 0) >= passThreshold).length,
                totalCount: cases.length,
                costTokens: cases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
                status: activeCases.length > 0 ? "running" : errorCases.length === cases.length ? "failed" : "completed",
                completedAt: activeCases.length > 0 ? run.completedAt : new Date().toISOString(),
              });
            });
            return normalizePlaygroundEvaluationSet({
              ...normalized,
              runs,
              updatedAt: new Date().toISOString(),
            });
          }));
        }

        function announceEvaluationRunThreads(run) {
          if (typeof onEvaluationThreadStarted !== "function") return;
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          normalizedRun.cases.forEach((caseItem) => {
            [
              { id: caseItem.threadId, kind: "case" },
              { id: caseItem.evaluatorThreadId, kind: "evaluator", sourceThreadId: caseItem.threadId },
            ].forEach((entry) => {
              const threadId = String(entry.id || "").trim();
              if (!threadId || announcedEvaluationThreadIdsRef.current.has(threadId)) return;
              announcedEvaluationThreadIdsRef.current.add(threadId);
              onEvaluationThreadStarted({
                id: threadId,
                hidden: true,
                sidebarHidden: true,
                metadata: {
                  evaluation: {
                    setId: normalizedRun.evaluationSetId,
                    runId: normalizedRun.id,
                    caseId: caseItem.id,
                    dataRowId: caseItem.dataRowId,
                    kind: entry.kind,
                    sourceThreadId: entry.sourceThreadId || "",
                    hidden: true,
                    sidebarHidden: true,
                  },
                  runnerPlayground: {
                    type: entry.kind === "evaluator" ? "evaluation_evaluator" : "evaluation_case",
                    evaluationSetId: normalizedRun.evaluationSetId,
                    evaluationRunId: normalizedRun.id,
                    evaluationCaseId: caseItem.id,
                    evaluationDataRowId: caseItem.dataRowId,
                    evaluationKind: entry.kind,
                    sourceThreadId: entry.sourceThreadId || "",
                    hidden: true,
                    sidebarHidden: true,
                  },
                },
              });
            });
          });
        }

        function upsertEvaluationRun(setId, run, setPatch = {}) {
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          if (!normalizedRun.id) return;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) return normalized;
            return normalizePlaygroundEvaluationSet({
              ...normalized,
              ...setPatch,
              runs: [normalizedRun, ...normalized.runs.filter((itemRun) => itemRun.id !== normalizedRun.id)],
              updatedAt: new Date().toISOString(),
            });
          }));
          announceEvaluationRunThreads(normalizedRun);
        }

        async function pollEvaluationRun(setId, runId) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl || !runId) return;
          for (let attempt = 0; attempt < 480; attempt += 1) {
            await sleepPlaygroundEvaluationFrontend(attempt === 0 ? 700 : 1200);
            const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(runId), {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders || {},
            });
            const data = await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.");
            const nextRun = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
            if (!nextRun.id) return;
            upsertEvaluationRun(setId, nextRun);
            if (!isPlaygroundEvaluationRunActive(nextRun)) {
              return;
            }
          }
        }

        async function hydrateEvaluationRunCosts(setId, run) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          if (!normalizedBackendUrl || !setId || !normalizedRun.id) return;
          const response = await fetch(normalizedBackendUrl + "/evaluations/runs/costs", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ run: normalizedRun }),
          });
          const data = await readPlaygroundEvaluationBackendJson(response, "Failed to calculate evaluation run cost.");
          const nextRun = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
          if (nextRun.id) {
            upsertEvaluationRun(setId, nextRun);
          }
        }

        function openSetDetail(setId) {
          const normalizedId = String(setId || "").trim();
          if (!normalizedId) return;
          setSelectedEvaluationSetId(normalizedId);
          setSelectedEvaluationRunId("");
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          setEvaluationDetailTab("general");
          setEvaluationsPageMode("detail");
        }

        function openRunDetail(setId, runId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId) return;
          setSelectedEvaluationSetId(normalizedSetId);
          setSelectedEvaluationRunId(normalizedRunId);
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          setEvaluationsPageMode("run");
        }

        function openCaseDetail(setId, runId, caseId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          const normalizedCaseId = String(caseId || "").trim();
          if (!normalizedSetId || !normalizedRunId || !normalizedCaseId) return;
          setSelectedEvaluationSetId(normalizedSetId);
          setSelectedEvaluationRunId(normalizedRunId);
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId(normalizedCaseId);
          setEvaluationsPageMode("case");
        }

        function handleCreateEvaluation() {
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const name = String(form.name || "").trim() || "New Evaluation";
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "exact";
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || defaultAgentId);
          const environmentId = getPlaygroundEvaluationDefaultId(environmentOptions, form.environmentId || defaultEnvironmentId);
          const passThreshold = normalizePlaygroundEvaluationPassThreshold(form.passThreshold || 80);
          const nextSet = createPlaygroundEvaluationSetDraft({
            name,
            targetAgentId,
            environmentId,
            passThreshold,
            evaluator: {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            },
          });
          setEvaluationSets((current) => [nextSet, ...(Array.isArray(current) ? current : [])]);
          setSelectedEvaluationSetId(nextSet.id);
          setSelectedEvaluationRunId("");
          if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          setEvaluationDetailTab("general");
          setEvaluationsPageMode("detail");
          setEvaluationCreateModalOpen(false);
          setEvaluationCreateForm({ name: "", targetAgentId: "", environmentId: "", passThreshold: "80", evaluatorType: "exact", evaluatorAgentId: "", evaluatorCode: "" });
        }

        function openRunEvaluationModal(setId) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const evaluator = normalizePlaygroundEvaluationEvaluator(targetSet.evaluator);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, targetSet.targetAgentId || defaultAgentId);
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet, defaultEnvironmentId);
          if (typeof setEvaluationRunForm === "function") {
            setEvaluationRunForm({
              setId: targetSet.id,
              name: "Run " + (targetSet.runs.length + 1),
              targetAgentId,
              environmentKey: selectedEnvironmentChoice?.key || "",
              evaluatorType: evaluator.type,
              evaluatorAgentId: evaluator.agentId || "",
              evaluatorCode: evaluator.code || "",
            });
          }
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(true);
          }
        }

        async function handleRunEvaluation(setId, runOptions = {}) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const selectedAgent = getPlaygroundEvaluationAgentRecord(agentOptions, runOptions.targetAgentId || targetSet.targetAgentId || defaultAgentId);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, targetSet.targetAgentId || defaultAgentId);
          const resolvedAgentId = String(runOptions.targetAgentId || selectedAgent?.id || targetAgentId || "").trim();
          const selectedEnvironmentChoice = runOptions.environmentChoice
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet, defaultEnvironmentId);
          const targetEnvironmentId = String(selectedEnvironmentChoice?.environmentId || targetSet.environmentId || defaultEnvironmentId || "").trim();
          const targetProjectId = String(selectedEnvironmentChoice?.projectId || "").trim();
          const targetEnvironmentType = selectedEnvironmentChoice?.type === "project" ? "project" : "computer";
          if (!resolvedAgentId || !targetEnvironmentId) {
            if (typeof window !== "undefined") {
              window.alert("Select an agent and environment before running this evaluation.");
            }
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(runOptions.evaluator || targetSet.evaluator);
          const evaluationSetSnapshot = normalizePlaygroundEvaluationSet({
            ...targetSet,
            targetAgentId: resolvedAgentId,
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            projectId: targetProjectId,
            evaluator,
          });
          const runRequestOptions = {
            id: createPlaygroundEvaluationId("eval_run"),
            label: String(runOptions.label || "").trim(),
            targetAgentId: resolvedAgentId,
            targetAgentName: String(selectedAgent?.name || selectedAgent?.label || selectedAgent?.title || resolvedAgentId).trim(),
            targetAgentPhotoUrl: getPlaygroundEvaluationAgentPhotoUrl(selectedAgent),
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            environmentName: targetEnvironmentType === "computer" ? String(selectedEnvironmentChoice?.environmentName || selectedEnvironmentChoice?.name || targetEnvironmentId).trim() : "",
            projectId: targetProjectId,
            projectName: targetEnvironmentType === "project" ? String(selectedEnvironmentChoice?.projectName || selectedEnvironmentChoice?.name || targetProjectId).trim() : "",
            evaluator,
            passThreshold: normalizePlaygroundEvaluationPassThreshold(targetSet.passThreshold),
          };
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            if (typeof window !== "undefined") {
              window.alert("Evaluation backend is unavailable.");
            }
            return;
          }
          try {
            const response = await fetch(normalizedBackendUrl + "/evaluations/runs", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...(requestHeaders || {}),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                evaluationSet: evaluationSetSnapshot,
                runOptions: runRequestOptions,
              }),
            });
            const data = await readPlaygroundEvaluationBackendJson(response, "Failed to start evaluation run.");
            const run = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
            if (!run.id) {
              throw new Error("Evaluation run was created but no run id was returned.");
            }
            upsertEvaluationRun(targetSet.id, run, {
              targetAgentId: resolvedAgentId,
              environmentType: targetEnvironmentType,
              environmentId: targetEnvironmentId,
              projectId: targetProjectId,
              evaluator,
              passThreshold: normalizePlaygroundEvaluationPassThreshold(targetSet.passThreshold),
            });
            setSelectedEvaluationSetId(targetSet.id);
            setSelectedEvaluationRunId(run.id);
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("run");
            void pollEvaluationRun(targetSet.id, run.id).catch((error) => {
              upsertEvaluationRun(targetSet.id, {
                ...run,
                status: "failed",
                completedAt: new Date().toISOString(),
                cases: run.cases.map((caseItem) => normalizePlaygroundEvaluationRunCase({
                  ...caseItem,
                  status: isPlaygroundEvaluationCaseActive(caseItem) ? "error" : caseItem.status,
                  error: isPlaygroundEvaluationCaseActive(caseItem) ? (error?.message || String(error)) : caseItem.error,
                })),
              });
            });
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          }
        }

        function handleConfirmRunEvaluation() {
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          if (!targetSet) return;
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet, defaultEnvironmentId);
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "exact";
          const evaluator = {
            type: evaluatorType,
            agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || "").trim() : "",
            code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
          };
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(false);
          }
          void handleRunEvaluation(targetSet.id, {
            label: String(form.name || "").trim(),
            targetAgentId: getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || targetSet.targetAgentId || defaultAgentId),
            environmentChoice: selectedEnvironmentChoice,
            evaluator,
          });
        }

        function closeEvaluationRenameDialog() {
          setEvaluationRenameState(null);
          setEvaluationRenameValue("");
          setEvaluationRenameError("");
        }

        function openEvaluationRenameDialog(set) {
          if (!set?.id) {
            return;
          }
          setEvaluationActionsPopoverOpen(false);
          setEvaluationRenameState({
            setId: set.id,
            originalName: String(set.name || ""),
          });
          setEvaluationRenameValue(String(set.name || ""));
          setEvaluationRenameError("");
        }

        function handleEvaluationRenameSubmit(event) {
          event.preventDefault();
          if (!evaluationRenameState?.setId) {
            return;
          }
          const nextName = String(evaluationRenameValue || "").trim().replace(/\s+/g, " ");
          if (!nextName) {
            setEvaluationRenameError("Evaluation name cannot be empty.");
            return;
          }
          if (nextName === evaluationRenameState.originalName) {
            closeEvaluationRenameDialog();
            return;
          }
          updateEvaluationSet(evaluationRenameState.setId, (set) => ({
            ...set,
            name: nextName,
          }));
          closeEvaluationRenameDialog();
        }

        function handleDeleteEvaluation(setId) {
          setEvaluationActionsPopoverOpen(false);
          closeEvaluationRenameDialog();
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== setId));
          if (selectedEvaluationSetId === setId) {
            setSelectedEvaluationSetId("");
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
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

        function PlaygroundEvaluationPerformanceChart({ runs, run }) {
          const canvasRef = useRef(null);
          const chartRef = useRef(null);
          const normalizedRun = run ? normalizePlaygroundEvaluationRun(run) : null;
          const normalizedRuns = normalizedRun ? [] : (Array.isArray(runs) ? runs : []).slice(-12);
          const passThreshold = normalizePlaygroundEvaluationPassThreshold(normalizedRun?.passThreshold ?? 0.8);
          const runCases = normalizedRun ? normalizedRun.cases : [];
          const labels = normalizedRun
            ? runCases.map((_caseItem, index) => "Case " + (index + 1))
            : normalizedRuns.map((item, index) => String(item.label || ("Run " + (index + 1))));
          const scoreValues = normalizedRun
            ? runCases.map((caseItem) => Math.round(Math.max(0, Math.min(1, Number(caseItem.score || 0))) * 100))
            : normalizedRuns.map((item) => Math.round(Math.max(0, Math.min(1, Number(item.averageScore || 0))) * 100));
          const lineValues = normalizedRun
            ? runCases.reduce((state, caseItem) => {
                const completed = !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error";
                const completedCount = state.completedCount + (completed ? 1 : 0);
                const passedCount = state.passedCount + (completed && Number(caseItem.score || 0) >= passThreshold ? 1 : 0);
                const value = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;
                state.values.push(value);
                state.completedCount = completedCount;
                state.passedCount = passedCount;
                return state;
              }, { completedCount: 0, passedCount: 0, values: [] }).values
            : normalizedRuns.map((item) => Math.max(0, Number(item.totalCount || item.cases?.length || 0)));
          const lineDatasetId = normalizedRun ? "pass-rate" : "cases";
          const lineLabel = normalizedRun ? "Pass Rate" : "Cases";
          const chartSignature = JSON.stringify({ mode: normalizedRun ? "run" : "set", labels, scoreValues, lineValues, passThreshold });

          useEffect(() => () => {
            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
            }
          }, []);

          useEffect(() => {
            const canvas = canvasRef.current;
            const hasData = labels.length > 0;
            if (!canvas || typeof Chart !== "function" || !hasData) {
              if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
              }
              return undefined;
            }
            const maxLineValue = Math.max(1, ...lineValues);
            const visibleLabelIndexes = (() => {
              const next = new Set();
              const targetCount = Math.min(6, Math.max(2, labels.length));
              for (let index = 0; index < targetCount; index += 1) {
                next.add(Math.round(((labels.length - 1) * index) / Math.max(1, targetCount - 1)));
              }
              return next;
            })();
            const makeVerticalGradient = (context, stops, fallback) => {
              const chart = context?.chart;
              const chartArea = chart?.chartArea;
              const ctx = chart?.ctx;
              if (!ctx || !chartArea) {
                return fallback;
              }
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
              return gradient;
            };
            const hoverGuidePlugin = {
              id: "evaluationPerformanceHoverGuide",
              afterDatasetsDraw: (chartInstance) => {
                const activeElements = chartInstance?.tooltip?.getActiveElements?.() || [];
                if (!activeElements.length) return;
                const activeElement = activeElements[0]?.element;
                const chartArea = chartInstance.chartArea;
                const ctx = chartInstance.ctx;
                if (!ctx || !chartArea || !activeElement) return;
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(activeElement.x, chartArea.top + 8);
                ctx.lineTo(activeElement.x, chartArea.bottom);
                ctx.stroke();
                ctx.restore();
              },
            };
            const chartData = {
              labels,
              datasets: [
                {
                  id: "score",
                  type: "bar",
                  label: "Score",
                  data: scoreValues,
                  yAxisID: "score",
                  backgroundColor: (context) => makeVerticalGradient(context, [
                    [0, "rgba(102, 166, 255, 0.82)"],
                    [1, "rgba(91, 103, 230, 0.64)"],
                  ], "rgba(95, 112, 230, 0.72)"),
                  borderWidth: 0,
                  borderRadius: 2,
                  barPercentage: 0.72,
                  categoryPercentage: 0.86,
                  maxBarThickness: 10,
                  order: 4,
                },
                {
                  id: lineDatasetId,
                  type: "line",
                  label: lineLabel,
                  data: lineValues,
                  yAxisID: "line",
                  borderColor: "#7EFFFF",
                  backgroundColor: "rgba(126, 255, 255, 0.08)",
                  borderWidth: 1.5,
                  fill: false,
                  pointBackgroundColor: "#7EFFFF",
                  pointBorderColor: "#050505",
                  pointBorderWidth: 2,
                  pointRadius: (context) => context.dataIndex === lineValues.length - 1 ? 5 : 0,
                  pointHoverRadius: 5,
                  tension: 0.28,
                  order: 2,
                },
              ],
            };
            const chartOptions = {
              animation: false,
              responsive: true,
              maintainAspectRatio: false,
              normalized: true,
              interaction: { intersect: false, mode: "index" },
              layout: { padding: { top: 12, right: 4, bottom: 0, left: 0 } },
              plugins: {
                legend: { display: false },
                tooltip: {
                  enabled: true,
                  backgroundColor: "rgba(8, 8, 8, 0.96)",
                  borderColor: "rgba(255, 255, 255, 0.14)",
                  borderWidth: 1,
                  cornerRadius: 8,
                  displayColors: true,
                  titleColor: "rgba(255, 255, 255, 0.94)",
                  bodyColor: "rgba(255, 255, 255, 0.78)",
                  padding: 10,
                  callbacks: {
                    label: (context) => {
                      const datasetId = context.dataset?.id || "";
                      const value = Math.max(0, Number(context.parsed?.y || 0));
                      if (datasetId === "score") return "Score: " + Math.round(value) + "%";
                      return datasetId === "pass-rate" ? "Pass Rate: " + Math.round(value) + "%" : "Cases: " + Math.round(value);
                    },
                  },
                },
              },
              scales: {
                x: {
                  type: "category",
                  bounds: "data",
                  offset: false,
                  grid: { display: false, offset: false, drawBorder: false },
                  border: { display: false },
                  ticks: {
                    align: "inner",
                    autoSkip: false,
                    color: "rgba(255, 255, 255, 0.38)",
                    font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                    maxRotation: 0,
                    minRotation: 0,
                    padding: 10,
                    callback: (_value, index) => visibleLabelIndexes.has(index) ? String(labels[index] || "") : "",
                  },
                },
                line: {
                  display: true,
                  type: "linear",
                  position: "left",
                  min: 0,
                  max: normalizedRun ? 100 : Math.max(1, Math.ceil(maxLineValue * 1.18)),
                  ticks: {
                    display: true,
                    maxTicksLimit: 4,
                    color: "rgba(255, 255, 255, 0.34)",
                    padding: 8,
                    font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                    callback: (value) => normalizedRun ? String(Math.round(Number(value) || 0)) + "%" : String(Math.round(Number(value) || 0)),
                  },
                  grid: { display: false, drawTicks: false },
                  border: { display: false },
                },
                score: {
                  display: false,
                  type: "linear",
                  position: "left",
                  min: 0,
                  max: 100,
                  ticks: { display: false },
                  grid: { display: false, drawTicks: false },
                  border: { display: false },
                },
              },
            };
            if (chartRef.current) {
              chartRef.current.data = chartData;
              chartRef.current.options = chartOptions;
              chartRef.current.update("none");
              return undefined;
            }
            chartRef.current = new Chart(canvas, {
              type: "bar",
              data: chartData,
              options: chartOptions,
              plugins: [hoverGuidePlugin],
            });
            return undefined;
          }, [chartSignature]);

          if (!labels.length) {
            return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
              React.createElement("div", { className: "playground-settings-usage-chart-empty" }, normalizedRun ? "No evaluation cases yet" : "No evaluation runs yet")
            );
          }
          return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame" },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-project-overview-progress-combo-canvas playground-evaluations-progress-combo-canvas",
              role: "img",
              "aria-label": normalizedRun ? "Evaluation case scores and pass rate" : "Evaluation scores and cases",
            })
          );
        }

        function renderAnalyticsCard(set, run) {
          const latestRun = run || set?.runs?.[0] || null;
          const runsForChart = run ? [run] : (Array.isArray(set?.runs) ? set.runs.slice().reverse() : []);
          const runPassRate = latestRun && latestRun.totalCount ? Math.round((latestRun.passedCount / latestRun.totalCount) * 100) + "%" : "-";
          const values = run
            ? [
                { id: "score", label: "Average Score", value: latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-" },
                { id: "pass-rate", label: "Pass Rate", value: runPassRate },
                { id: "cases", label: "Cases", value: String(latestRun?.totalCount || latestRun?.cases?.length || 0) },
                { id: "cost", label: "Cost in CT", value: formatPlaygroundEvaluationCostCt(latestRun?.costTokens) },
              ]
            : [
                { id: "score", label: "Latest Score", value: latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-" },
                { id: "cases", label: "Cases", value: String(set?.dataRows?.length || 0) },
                { id: "runs", label: "Runs", value: String(set?.runs?.length || 0) },
                { id: "pass-rate", label: "Pass Rate", value: runPassRate },
              ];
          const handleDownload = () => {
            if (typeof document === "undefined") return;
            const canvas = document.querySelector(".playground-evaluations-progress-combo-canvas");
            if (!canvas || typeof canvas.toDataURL !== "function") return;
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "evaluation-analytics.png";
            link.click();
          };
          return React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card" },
            React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
              React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Analytics"),
              React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-progress-combo-download",
                  onClick: handleDownload,
                  title: "Download chart",
                  "aria-label": "Download evaluation analytics chart",
                }, React.createElement(Download, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
              values.map((item) =>
                React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                    React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                    React.createElement("span", null, item.label)
                  ),
                  React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                )
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
              React.createElement(PlaygroundEvaluationPerformanceChart, { runs: runsForChart, run: run || null })
            )
          );
        }

        function renderRunAgentCell(run, set) {
          const agentId = String(run?.targetAgentId || set?.targetAgentId || "").trim();
          const agent = getPlaygroundEvaluationAgentRecord(agentOptions, agentId);
          const label = String(run?.targetAgentName || agent?.name || agent?.label || agent?.title || agentId || "Agent").trim();
          const photoUrl = String(run?.targetAgentPhotoUrl || getPlaygroundEvaluationAgentPhotoUrl(agent)).trim();
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              photoUrl
                ? React.createElement("img", { src: photoUrl, alt: "" })
                : getPlaygroundEvaluationInitials(label)
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, label)
          );
        }

        function renderRunEnvironmentCell(run, set) {
          const source = {
            environmentType: run?.environmentType || set?.environmentType || "computer",
            environmentId: run?.environmentId || set?.environmentId || "",
            projectId: run?.projectId || set?.projectId || "",
          };
          const choice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, source, defaultEnvironmentId);
          const isProject = String(run?.environmentType || source.environmentType || "").trim().toLowerCase() === "project" || choice?.type === "project";
          const label = isProject
            ? String(run?.projectName || choice?.projectName || choice?.name || source.projectId || "Project").trim()
            : String(run?.environmentName || choice?.environmentName || choice?.name || source.environmentId || "Computer").trim();
          const Icon = isProject ? Rocket : Monitor;
          return React.createElement("span", { className: "playground-evaluations-run-environment-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-environment-icon", "aria-hidden": "true" },
              React.createElement(Icon, { width: 13, height: 13, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, label)
          );
        }

        function renderRunsTable(set) {
          const runs = Array.isArray(set?.runs) ? set.runs : [];
          const sortOptions = [
            { id: "recent-desc", label: "Recently Updated", description: "Show newest evaluation activity first" },
            { id: "created-desc", label: "Newest Created", description: "Show newly created runs first" },
            { id: "score-desc", label: "Highest Score", description: "Show best scoring runs first" },
            { id: "name-asc", label: "Run Name (A-Z)", description: "Sort runs alphabetically" },
          ];
          const filterOptions = [
            { id: "all", label: "All Runs", description: "Show every evaluation run" },
            { id: "running", label: "Running", description: "Only show active runs" },
            { id: "completed", label: "Completed", description: "Only show completed runs" },
            { id: "failed", label: "Failed", description: "Only show failed runs" },
          ];
          const sortMode = sortOptions.some((option) => option.id === evaluationRunsSortMode) ? evaluationRunsSortMode : "recent-desc";
          const filterMode = filterOptions.some((option) => option.id === evaluationRunsFilterMode) ? evaluationRunsFilterMode : "all";
          const normalizedSearch = String(evaluationRunsSearchQuery || "").trim().toLowerCase();
          const getRunTimestamp = (run) => Date.parse(String(run.completedAt || run.updatedAt || run.createdAt || "")) || 0;
          const getRunAgentLabel = (run) => {
            const agentId = String(run?.targetAgentId || set?.targetAgentId || "").trim();
            const agent = getPlaygroundEvaluationAgentRecord(agentOptions, agentId);
            return String(run?.targetAgentName || agent?.name || agent?.label || agent?.title || agentId || "Agent").trim();
          };
          const getRunEnvironmentLabel = (run) => {
            const source = {
              environmentType: run?.environmentType || set?.environmentType || "computer",
              environmentId: run?.environmentId || set?.environmentId || "",
              projectId: run?.projectId || set?.projectId || "",
            };
            const choice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, source, defaultEnvironmentId);
            const isProject = String(run?.environmentType || source.environmentType || "").trim().toLowerCase() === "project" || choice?.type === "project";
            return isProject
              ? String(run?.projectName || choice?.projectName || choice?.name || source.projectId || "Project").trim()
              : String(run?.environmentName || choice?.environmentName || choice?.name || source.environmentId || "Computer").trim();
          };
          const filteredRuns = runs
            .filter((run) => {
              const status = String(run?.status || "").trim().toLowerCase();
              if (filterMode === "running" && status !== "running") return false;
              if (filterMode === "completed" && status !== "completed") return false;
              if (filterMode === "failed" && status !== "failed") return false;
              if (!normalizedSearch) return true;
              const haystack = [
                run?.label || "",
                run?.id || "",
                getRunAgentLabel(run),
                getRunEnvironmentLabel(run),
                status,
                formatPlaygroundEvaluationPercent(run?.averageScore),
                String(run?.totalCount || 0),
                formatPlaygroundEvaluationDate(run?.completedAt || run?.createdAt),
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearch);
            })
            .sort((left, right) => {
              if (sortMode === "name-asc") {
                return String(left?.label || "").localeCompare(String(right?.label || ""));
              }
              if (sortMode === "created-desc") {
                return (Date.parse(String(right?.createdAt || "")) || 0) - (Date.parse(String(left?.createdAt || "")) || 0);
              }
              if (sortMode === "score-desc") {
                return Number(right?.averageScore || 0) - Number(left?.averageScore || 0);
              }
              return getRunTimestamp(right) - getRunTimestamp(left);
            });
          const visibleCount = Math.max(5, Number(evaluationRunsVisibleCount) || 5);
          const visibleRuns = filteredRuns.slice(0, visibleCount);
          const hasMoreRuns = filteredRuns.length > visibleRuns.length;
          const hasFilters = Boolean(normalizedSearch || filterMode !== "all");
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const closeToolbarPopover = () => {
            if (typeof setEvaluationRunsToolbarPopover === "function") {
              setEvaluationRunsToolbarPopover("");
            }
          };
          function renderToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description ? React.createElement("span", null, option.description) : null
              )
            );
          }
          function renderRunRow(run) {
            const dateLabel = formatPlaygroundEvaluationDate(run.completedAt || run.createdAt);
            const status = String(run?.status || "").trim().toLowerCase();
            const scoreLabel = status === "queued" || status === "running"
              ? "running"
              : formatPlaygroundEvaluationPercent(run.averageScore);
            return React.createElement("div", {
                key: run.id,
                role: "button",
                tabIndex: 0,
                className: "playground-project-overview-threads-table-row",
                onClick: () => openRunDetail(set.id, run.id),
                onKeyDown: (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openRunDetail(set.id, run.id);
                },
              },
              React.createElement("div", { className: "playground-project-overview-thread-cell is-run" },
                React.createElement("div", { className: "playground-plugin-row-title" }, run.label || "Run")
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-triggered-by" }, renderRunAgentCell(run, set)),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-environment" }, renderRunEnvironmentCell(run, set)),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-score" }, scoreLabel),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-source" }, String(run.totalCount || 0)),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-date", title: dateLabel }, dateLabel),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-thread-menu-button",
                  "aria-label": "Open evaluation run",
                  onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openRunDetail(set.id, run.id);
                  },
                }, React.createElement(ChevronRight, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            );
          }
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Runs")
              )
            ),
            React.createElement("div", { className: "playground-plugins-search-row" },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: evaluationRunsSearchQuery || "",
                  onChange: (event) => {
                    if (typeof setEvaluationRunsSearchQuery === "function") setEvaluationRunsSearchQuery(event.target.value);
                    if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                  },
                  className: "playground-plugins-search",
                  placeholder: "Search runs",
                  "aria-label": "Search evaluation runs",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (evaluationRunsToolbarPopover === "sort" || sortMode !== "recent-desc" ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setEvaluationRunsToolbarPopover === "function") setEvaluationRunsToolbarPopover((current) => current === "sort" ? "" : "sort");
                    },
                    title: activeSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  evaluationRunsToolbarPopover === "sort"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) => renderToolbarOption({
                          option,
                          active: sortMode === option.id,
                          onClick: () => {
                            if (typeof setEvaluationRunsSortMode === "function") setEvaluationRunsSortMode(option.id);
                            if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (evaluationRunsToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => {
                      if (typeof setEvaluationRunsToolbarPopover === "function") setEvaluationRunsToolbarPopover((current) => current === "filter" ? "" : "filter");
                    },
                    title: activeFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  evaluationRunsToolbarPopover === "filter"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        filterOptions.map((option) => renderToolbarOption({
                          option,
                          active: filterMode === option.id,
                          onClick: () => {
                            if (typeof setEvaluationRunsFilterMode === "function") setEvaluationRunsFilterMode(option.id);
                            if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount(5);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-toolbar-action",
                onClick: () => {
                  if (typeof setEvaluationRunsVisibleCount === "function") setEvaluationRunsVisibleCount((current) => Math.max(5, Number(current) || 5) + 10);
                },
                disabled: !hasMoreRuns,
                style: !hasMoreRuns ? { opacity: 0.5 } : undefined,
              },
                React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Show more")
              )
            ),
            visibleRuns.length > 0
              ? React.createElement("div", { className: "playground-project-overview-threads-table playground-evaluations-runs-table" },
                  React.createElement("div", { className: "playground-project-overview-threads-table-header" },
                    React.createElement("div", null, "Run"),
                    React.createElement("div", null, "Agent"),
                    React.createElement("div", null, "Environment"),
                    React.createElement("div", null, "Score"),
                    React.createElement("div", null, "Cases"),
                    React.createElement("div", null, "Date"),
                    React.createElement("div", null)
                  ),
                  React.createElement("div", { className: "playground-project-overview-thread-list" },
                    visibleRuns.map((run) => renderRunRow(run))
                  )
                )
              : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                  runs.length > 0 && hasFilters ? "No matching evaluation runs." : "No runs yet."
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
                React.createElement("span", null, "Evaluator Guidance"),
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
                  React.createElement("textarea", {
                    className: "playground-evaluations-textarea playground-evaluations-table-input",
                    value: row.evaluationGuidance,
                    placeholder: "Optional scoring instructions for this row",
                    onChange: (event) => updateEvaluationSet(set.id, (current) => ({
                      ...current,
                      dataRows: current.dataRows.map((item) => item.id === row.id ? { ...item, evaluationGuidance: event.target.value, updatedAt: nowIso } : item),
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

        function renderEvaluationThreadButton(threadId, label) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) {
            return React.createElement("span", { className: "playground-guardrails-table-muted" }, "-");
          }
          return React.createElement("button", {
              type: "button",
              className: "playground-evaluations-thread-link",
              onClick: () => {
                if (typeof onOpenThread === "function") {
                  onOpenThread(normalizedThreadId);
                }
              },
            },
            React.createElement(ArrowUpRight, { width: 12, height: 12, strokeWidth: 1.8 }),
            React.createElement("span", null, label || normalizedThreadId)
          );
        }

        function renderRunCasesTable(set, run) {
          const cases = Array.isArray(run?.cases) ? run.cases : [];
          const sortOptions = [
            { id: "case-asc", label: "Case Order", description: "Show cases in dataset order" },
            { id: "score-desc", label: "Highest Score", description: "Show strongest cases first" },
            { id: "score-asc", label: "Lowest Score", description: "Show weakest cases first" },
          ];
          const filterOptions = [
            { id: "all", label: "All Cases", description: "Show every case" },
            { id: "running", label: "Running", description: "Only show active cases" },
            { id: "passed", label: "Passed", description: "Only show passed cases" },
            { id: "failed", label: "Failed", description: "Only show failed cases" },
            { id: "error", label: "Error", description: "Only show errored cases" },
          ];
          const sortMode = sortOptions.some((option) => option.id === evaluationCasesSortMode) ? evaluationCasesSortMode : "case-asc";
          const filterMode = filterOptions.some((option) => option.id === evaluationCasesFilterMode) ? evaluationCasesFilterMode : "all";
          const normalizedSearch = String(evaluationCasesSearchQuery || "").trim().toLowerCase();
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const getCaseDisplayStatus = (caseItem) => getPlaygroundEvaluationCaseDisplayStatus(caseItem, run.passThreshold);
          const getCaseScoreLabel = (caseItem) => isPlaygroundEvaluationCaseActive(caseItem)
            ? String(caseItem.status || "").replace(/_/g, " ")
            : formatPlaygroundEvaluationPercent(caseItem.score);
          const filteredCaseRecords = cases
            .map((caseItem, index) => ({ caseItem, index }))
            .filter(({ caseItem }) => {
              const displayStatus = getCaseDisplayStatus(caseItem);
              if (filterMode === "running" && !isPlaygroundEvaluationCaseActive(caseItem)) return false;
              if (filterMode !== "all" && filterMode !== "running" && displayStatus !== filterMode) return false;
              if (!normalizedSearch) return true;
              const haystack = [
                caseItem.threadId || "",
                caseItem.evaluatorThreadId || "",
                getCaseScoreLabel(caseItem),
                displayStatus,
                caseItem.input || "",
                caseItem.expectedOutput || "",
                caseItem.actualOutput || "",
              ].join(" ").toLowerCase();
              return haystack.includes(normalizedSearch);
            })
            .sort((left, right) => {
              if (sortMode === "score-desc") {
                return Number(right.caseItem?.score || 0) - Number(left.caseItem?.score || 0);
              }
              if (sortMode === "score-asc") {
                return Number(left.caseItem?.score || 0) - Number(right.caseItem?.score || 0);
              }
              return left.index - right.index;
            });
          const visibleCount = Math.max(5, Number(evaluationCasesVisibleCount) || 10);
          const visibleCaseRecords = filteredCaseRecords.slice(0, visibleCount);
          const hasMoreCases = filteredCaseRecords.length > visibleCaseRecords.length;
          const hasFilters = Boolean(normalizedSearch || filterMode !== "all");
          const widthCases = (filteredCaseRecords.length > 0 ? filteredCaseRecords : cases.map((caseItem, index) => ({ caseItem, index }))).map((record) => record.caseItem);
          const readColumnCh = (values, minCh) => Math.max(minCh, ...values.map((value) => String(value || "-").length + 1));
          const threadCh = readColumnCh(widthCases.map((caseItem) => caseItem.threadId || "Thread"), 7);
          const evaluatorCh = readColumnCh(widthCases.map((caseItem) => caseItem.evaluatorThreadId || "Evaluator"), 10);
          const scoreCh = readColumnCh(widthCases.map((caseItem) => getCaseScoreLabel(caseItem) || "Score"), 6);
          const statusCh = readColumnCh(widthCases.map((caseItem) => getCaseDisplayStatus(caseItem) || "Status"), 8);
          const casesGridTemplate = [
            "minmax(" + threadCh + "ch, 1.18fr)",
            "minmax(" + evaluatorCh + "ch, 1.18fr)",
            "minmax(" + scoreCh + "ch, 0.36fr)",
            "minmax(" + statusCh + "ch, 0.46fr)",
            "18px",
          ].join(" ");
          const closeCasesToolbarPopover = () => setEvaluationCasesToolbarPopover("");
          function renderCasesToolbarOption({ option, active, onClick }) {
            return React.createElement("button", {
                key: option.id,
                type: "button",
                className: "tb-popup-row tb-popup-row-select" + (active ? " selected" : ""),
                onClick,
              },
              React.createElement("span", { className: "tb-popup-check-slot" },
                active ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
              ),
              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                React.createElement("span", null, option.label),
                option.description ? React.createElement("span", null, option.description) : null
              )
            );
          }
          function renderCaseRow(caseItem) {
            const displayStatus = getCaseDisplayStatus(caseItem);
            const scoreLabel = getCaseScoreLabel(caseItem);
            return React.createElement("div", {
                key: caseItem.id,
                role: "button",
                tabIndex: 0,
                className: "playground-evaluations-cases-row",
                onClick: () => openCaseDetail(set.id, run.id, caseItem.id),
                onKeyDown: (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openCaseDetail(set.id, run.id, caseItem.id);
                },
              },
              React.createElement("div", { className: "playground-evaluations-cases-cell is-thread", title: caseItem.threadId || "" }, caseItem.threadId || "-"),
              React.createElement("div", { className: "playground-evaluations-cases-cell is-evaluator", title: caseItem.evaluatorThreadId || "" }, caseItem.evaluatorThreadId || "-"),
              React.createElement("div", { className: "playground-evaluations-cases-cell is-score" }, scoreLabel),
              React.createElement("div", { className: "playground-evaluations-cases-cell is-status" },
                React.createElement("span", { className: "playground-evaluations-status-pill" + (displayStatus === "failed" || displayStatus === "error" ? " is-failed" : "") }, displayStatus.replace(/_/g, " "))
              ),
              React.createElement("div", { className: "playground-evaluations-cases-cell is-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-thread-menu-button",
                  "aria-label": "Open evaluation case",
                  onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openCaseDetail(set.id, run.id, caseItem.id);
                  },
                }, React.createElement(ChevronRight, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            );
          }
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Cases")
              )
            ),
            React.createElement("div", { className: "playground-plugins-search-row" },
              React.createElement("div", { className: "playground-plugins-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: evaluationCasesSearchQuery || "",
                  onChange: (event) => {
                    setEvaluationCasesSearchQuery(event.target.value);
                    setEvaluationCasesVisibleCount(10);
                  },
                  className: "playground-plugins-search",
                  placeholder: "Search cases",
                  "aria-label": "Search evaluation cases",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (evaluationCasesToolbarPopover === "sort" || sortMode !== "case-asc" ? " is-active" : ""),
                    onClick: () => setEvaluationCasesToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    title: activeSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  evaluationCasesToolbarPopover === "sort"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) => renderCasesToolbarOption({
                          option,
                          active: sortMode === option.id,
                          onClick: () => {
                            setEvaluationCasesSortMode(option.id);
                            setEvaluationCasesVisibleCount(10);
                            closeCasesToolbarPopover();
                          },
                        }))
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (evaluationCasesToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => setEvaluationCasesToolbarPopover((current) => current === "filter" ? "" : "filter"),
                    title: activeFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  evaluationCasesToolbarPopover === "filter"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        filterOptions.map((option) => renderCasesToolbarOption({
                          option,
                          active: filterMode === option.id,
                          onClick: () => {
                            setEvaluationCasesFilterMode(option.id);
                            setEvaluationCasesVisibleCount(10);
                            closeCasesToolbarPopover();
                          },
                        }))
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-toolbar-action",
                onClick: () => setEvaluationCasesVisibleCount((current) => Math.max(5, Number(current) || 10) + 10),
                disabled: !hasMoreCases,
                style: !hasMoreCases ? { opacity: 0.5 } : undefined,
              },
                React.createElement(List, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Show more")
              )
            ),
            visibleCaseRecords.length > 0
              ? React.createElement("div", {
                  className: "playground-evaluations-cases-table",
                  style: { "--playground-evaluations-cases-grid-template": casesGridTemplate },
                },
                  React.createElement("div", { className: "playground-evaluations-cases-table-inner" },
                    React.createElement("div", { className: "playground-evaluations-cases-header" },
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Thread"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Evaluator"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Score"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Status"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, null)
                    ),
                    React.createElement("div", { className: "playground-evaluations-cases-list" },
                      visibleCaseRecords.map((record) => renderCaseRow(record.caseItem))
                    )
                  )
                )
              : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                  cases.length > 0 && hasFilters ? "No matching cases." : "No cases yet."
                )
          );
        }

        function renderCaseDetailField(label, value, options = {}) {
          return React.createElement("div", { className: "playground-evaluations-case-detail-field" + (options.wide ? " is-wide" : "") + (options.reasoning ? " is-reasoning" : "") },
            React.createElement("div", { className: "playground-evaluations-case-detail-label" }, label),
            React.createElement("div", { className: "playground-evaluations-case-detail-value" + (options.text ? " playground-evaluations-case-detail-text" : "") }, value || "-")
          );
        }

        function renderCaseKpi(label, value) {
          return React.createElement("div", { className: "playground-evaluations-case-kpi" },
            React.createElement("div", { className: "playground-evaluations-case-kpi-label" }, label),
            React.createElement("div", { className: "playground-evaluations-case-kpi-value" }, value || "-")
          );
        }

        function renderEvaluationCaseMarkdown(value) {
          const text = String(value || "").trim();
          if (!text) return "-";
          if (typeof PlaygroundTaskDescriptionMarkdown === "function") {
            return React.createElement(PlaygroundTaskDescriptionMarkdown, {
              content: text,
              className: "playground-evaluations-case-reasoning-markdown tb-message-markdown",
            });
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

        function renderEvaluationPassThresholdInline(set) {
          return React.createElement("label", { className: "playground-evaluations-pass-threshold-inline" },
            React.createElement("span", { className: "playground-evaluations-pass-threshold-inline-label" }, "Pass Threshold"),
            React.createElement("input", {
              type: "number",
              min: "0",
              max: "100",
              step: "0.1",
              className: "playground-evaluations-input",
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
          const isEditing = evaluationGuidanceEditingId === set.id;
          const history = evaluationGuidanceHistoryById[set.id] || { past: [], future: [] };
          const canUndo = Array.isArray(history.past) && history.past.length > 0;
          const canRedo = Array.isArray(history.future) && history.future.length > 0;
          const placeholder = "Optional scoring instructions that apply to every row in this evaluation set.";
          const applyHistoryValue = (value) => {
            updateEvaluationGuidanceValue(set.id, String(value ?? ""), { recordHistory: false });
            focusEvaluationGuidanceTextareaAtEnd(value);
          };
          const handleUndo = () => {
            if (!canUndo) return;
            const currentValue = guidance;
            const previousValue = history.past[history.past.length - 1];
            setEvaluationGuidanceHistoryById((current) => {
              const currentHistory = current[set.id] || { past: [], future: [] };
              return {
                ...current,
                [set.id]: {
                  past: (Array.isArray(currentHistory.past) ? currentHistory.past : []).slice(0, -1),
                  future: [currentValue, ...(Array.isArray(currentHistory.future) ? currentHistory.future : [])].slice(0, 80),
                },
              };
            });
            applyHistoryValue(previousValue);
          };
          const handleRedo = () => {
            if (!canRedo) return;
            const currentValue = guidance;
            const nextValue = history.future[0];
            setEvaluationGuidanceHistoryById((current) => {
              const currentHistory = current[set.id] || { past: [], future: [] };
              return {
                ...current,
                [set.id]: {
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
              onClick: action.onClick || (() => handleEvaluationGuidanceMarkdownFormat(set.id, action.id)),
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
          return React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-evaluations-dataset-guidance-section" },
            React.createElement("div", { className: "playground-tasks-detail-section-header" },
              React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Dataset Evaluator Guidance"),
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
            },
              !isEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    guidance.trim()
                      ? typeof PlaygroundTaskDescriptionMarkdown === "function"
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: guidance,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", {
                            className: "playground-tasks-detail-description-preview",
                          }, guidance)
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, placeholder)
                  )
                : null,
              React.createElement("textarea", {
                ref: evaluationGuidanceTextareaRef,
                className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isEditing ? placeholder : "",
                value: guidance,
                onFocus: () => {
                  setEvaluationGuidanceEditingId(set.id);
                },
                onChange: (event) => {
                  updateEvaluationGuidanceValue(set.id, event.target.value);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onBlur: () => {
                  setEvaluationGuidanceEditingId("");
                },
              })
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
              React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs", role: "tablist", "aria-label": "Evaluation details tabs" },
                React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                  [
                    { id: "general", label: "General" },
                    { id: "data", label: "Settings" },
                  ].map((tab) =>
                    React.createElement("button", {
                      key: tab.id,
                      type: "button",
                      role: "tab",
                      "aria-selected": evaluationDetailTab === tab.id ? "true" : "false",
                      className: "playground-project-overview-chart-tab" + (evaluationDetailTab === tab.id ? " is-active" : ""),
                      onClick: () => setEvaluationDetailTab(tab.id),
                    }, tab.label)
                  )
                )
              ),
              isDataTab
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-guardrails-prompts-header" },
                      React.createElement("div", { className: "playground-guardrails-prompts-title playground-evaluations-settings-header-control" },
                        renderEvaluationPassThresholdInline(activeSet)
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
	                    renderEvaluationGuidanceEditor(activeSet),
	                    renderDataTable(activeSet)
	                  )
                : React.createElement(React.Fragment, null,
                    renderAnalyticsCard(activeSet),
                    renderRunsTable(activeSet)
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
              renderAnalyticsCard(activeSet, activeRun),
              renderRunCasesTable(activeSet, activeRun)
            )
          );
        }

        function renderCase() {
          if (!activeSet || !activeRun || !activeCase) {
            return renderRun();
          }
          const displayStatus = getPlaygroundEvaluationCaseDisplayStatus(activeCase, activeRun.passThreshold);
          const isActiveCase = isPlaygroundEvaluationCaseActive(activeCase);
          const scoreLabel = isActiveCase ? activeCase.status.replace(/_/g, " ") : formatPlaygroundEvaluationPercent(activeCase.score);
          const reasoningDisplay = getPlaygroundEvaluationCaseDisplayReasoning(activeCase);
          const reasoning = reasoningDisplay.text || "";
          const confidenceLabel = reasoningDisplay.confidence === null || reasoningDisplay.confidence === undefined
            ? "-"
            : formatPlaygroundEvaluationPercent(reasoningDisplay.confidence);
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail playground-evaluations-case-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              React.createElement("section", { className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-evaluations-case-section" },
                React.createElement("div", { className: "playground-evaluations-case-title-row" },
                  React.createElement("h3", { className: "playground-evaluations-case-title" }, "Case Details"),
                  React.createElement("div", { className: "playground-evaluations-case-title-links" },
                    renderEvaluationThreadButton(activeCase.threadId, "Evaluation Thread"),
                    renderEvaluationThreadButton(activeCase.evaluatorThreadId, "Evaluator Thread")
                  )
                ),
                React.createElement("div", { className: "playground-evaluations-case-kpis" },
                  renderCaseKpi("Agent", renderRunAgentCell(activeRun, activeSet)),
                  renderCaseKpi("Environment", renderRunEnvironmentCell(activeRun, activeSet)),
                  renderCaseKpi("Score", React.createElement("span", { className: "playground-evaluations-case-score" }, scoreLabel)),
                  renderCaseKpi("Confidence", confidenceLabel),
                  renderCaseKpi("Status", React.createElement("span", { className: "playground-evaluations-status-pill" + (displayStatus === "failed" || displayStatus === "error" ? " is-failed" : "") }, displayStatus.replace(/_/g, " ")))
                ),
                React.createElement("div", { className: "playground-evaluations-case-detail-grid" },
                  renderCaseDetailField("Reasoning", renderEvaluationCaseMarkdown(reasoning), { wide: true, reasoning: true }),
                  renderCaseDetailField("Expected Output", renderEvaluationCaseTextValue(activeCase.expectedOutput), { wide: true }),
                  renderCaseDetailField("Actual Output", renderEvaluationCaseTextValue(activeCase.actualOutput), { wide: true })
                )
              )
            )
          );
        }

        function renderEvaluationTopNavActions() {
          if (!isEvaluationDetailPage || !activeSet || !evaluationTopNavActionsContainer || typeof createPortal !== "function") {
            return null;
          }

          return createPortal(
            React.createElement("div", {
                className: "playground-tasks-toolbar-popup-shell",
                ref: evaluationActionsPopoverRef,
              },
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain" + (evaluationActionsPopoverOpen ? " is-active" : ""),
                title: "Evaluation actions",
                "aria-label": "Evaluation actions",
                "aria-expanded": evaluationActionsPopoverOpen ? "true" : "false",
                onClick: () => setEvaluationActionsPopoverOpen((current) => !current),
              }, React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })),
              evaluationActionsPopoverOpen
                ? React.createElement("div", {
                    className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row",
                      onClick: () => openEvaluationRenameDialog(activeSet),
                    },
                      React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Rename")
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row",
                      onClick: () => handleDeleteEvaluation(activeSet.id),
                    },
                      React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "Delete")
                      )
                    )
                  )
                : null
            ),
            evaluationTopNavActionsContainer
          );
        }

        function renderEvaluationRenameModal() {
          if (!evaluationRenameState) {
            return null;
          }

          return React.createElement("div", {
              className: "sidebar-thread-rename-scrim",
              onClick: closeEvaluationRenameDialog,
            },
              React.createElement("form", {
                className: "sidebar-thread-rename-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleEvaluationRenameSubmit,
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Evaluation"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this evaluation set."),
                React.createElement("input", {
                  ref: evaluationRenameInputRef,
                  className: "sidebar-thread-rename-input",
                  value: evaluationRenameValue,
                  onChange: (event) => {
                    setEvaluationRenameValue(event.target.value);
                    setEvaluationRenameError("");
                  },
                  placeholder: "Evaluation name",
                }),
                evaluationRenameError
                  ? React.createElement("div", { className: "sidebar-thread-rename-error" }, evaluationRenameError)
                  : null,
                React.createElement("div", { className: "sidebar-thread-rename-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "sidebar-thread-rename-button is-secondary",
                    onClick: closeEvaluationRenameDialog,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "submit",
                    className: "sidebar-thread-rename-button is-primary",
                  }, "Save")
                )
              )
            );
        }

        function renderRunModal() {
          if (!evaluationRunModalOpen) {
            return null;
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "exact";
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet || {}, defaultEnvironmentId);
          const selectedEnvironmentKey = selectedEnvironmentChoice?.key || "";
          const selectedTargetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || targetSet?.targetAgentId || defaultAgentId);
          const selectedEvaluatorAgentId = String(form.evaluatorAgentId || "").trim();
          const canStartRun = Boolean(
            targetSet
            && selectedEnvironmentKey
            && selectedTargetAgentId
            && (evaluatorType !== "agent" || selectedEvaluatorAgentId)
          );
          const closeModal = () => {
            if (typeof setEvaluationRunModalOpen === "function") {
              setEvaluationRunModalOpen(false);
            }
          };
          return React.createElement("div", {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-evaluations-run-modal-backdrop is-visible",
              role: "dialog",
              "aria-modal": "true",
            },
            React.createElement("div", { className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-evaluations-run-modal is-visible" },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(Play, { width: 18, height: 18, strokeWidth: 1.8 })
                  ),
                  React.createElement("input", {
                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                    value: form.name || "",
                    placeholder: "Run name",
                    onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), name: event.target.value })),
                    autoFocus: true,
                    "aria-label": "Run name",
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-project-modal-close",
                  onClick: closeModal,
                  "aria-label": "Close run evaluation modal",
                }, React.createElement(X, { width: 18, height: 18, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                React.createElement("div", { className: "playground-tasks-issue-modal-grid" },
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Agent"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: selectedTargetAgentId,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), targetAgentId: event.target.value })),
                    },
                      agentOptions.length > 0
                        ? agentOptions.map((agent) =>
                            React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                          )
                        : React.createElement("option", { value: "" }, "No agents available")
                    )
                  ),
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Environment"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: selectedEnvironmentKey,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), environmentKey: event.target.value })),
                    },
                      React.createElement("optgroup", { label: "Computers" },
                        environmentChoices.filter((choice) => choice.type === "computer").length > 0
                          ? environmentChoices.filter((choice) => choice.type === "computer").map((choice) =>
                              React.createElement("option", { key: choice.key, value: choice.key }, choice.environmentName || choice.environmentId)
                            )
                          : React.createElement("option", { value: "", disabled: true }, "No computers available")
                      ),
                      React.createElement("optgroup", { label: "Projects" },
                        environmentChoices.filter((choice) => choice.type === "project").length > 0
                          ? environmentChoices.filter((choice) => choice.type === "project").map((choice) =>
                              React.createElement("option", { key: choice.key, value: choice.key, disabled: choice.disabled },
                                (choice.projectName || choice.projectId) + (choice.disabled ? " · no default computer" : "")
                              )
                            )
                          : React.createElement("option", { value: "", disabled: true }, "No projects available")
                      )
                    )
                  ),
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator"),
                    React.createElement("select", {
                      className: "playground-tasks-issue-modal-select",
                      value: evaluatorType,
                      onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorType: event.target.value })),
                    },
                      React.createElement("option", { value: "exact" }, "Exact output"),
                      React.createElement("option", { value: "agent" }, "Agent evaluator"),
                      React.createElement("option", { value: "code" }, "Code evaluator")
                    )
                  ),
                  evaluatorType === "agent"
                    ? React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator Agent"),
                        React.createElement("select", {
                          className: "playground-tasks-issue-modal-select",
                          value: form.evaluatorAgentId || "",
                          onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                        },
                          React.createElement("option", { value: "" }, "Select agent"),
                          agentOptions.map((agent) =>
                            React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                          )
                        )
                      )
                    : null,
                  evaluatorType === "code"
                    ? React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field is-full" },
                        React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Evaluator Code"),
                        React.createElement("textarea", {
                          className: "playground-tasks-issue-modal-input playground-tasks-issue-modal-textarea",
                          value: form.evaluatorCode || "",
                          placeholder: "return actual.trim() === expected.trim() ? 1 : 0;",
                          onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorCode: event.target.value })),
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-evaluations-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-new-button",
                    onClick: closeModal,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-create-button playground-metronome-publish-button",
                    onClick: handleConfirmRunEvaluation,
                    disabled: !canStartRun,
                  }, "Run Evaluation")
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
                  React.createElement("span", null, "Agent"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || defaultAgentId),
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), targetAgentId: event.target.value })),
                  },
                    agentOptions.length > 0
                      ? agentOptions.map((agent) =>
                          React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                        )
                      : React.createElement("option", { value: "" }, "No agents available")
                  )
                ),
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Computer"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: getPlaygroundEvaluationDefaultId(environmentOptions, form.environmentId || defaultEnvironmentId),
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), environmentId: event.target.value })),
                  },
                    environmentOptions.length > 0
                      ? environmentOptions.map((environment) =>
                          React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.label || environment.id)
                        )
                      : React.createElement("option", { value: "" }, "No computers available")
                  )
                ),
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Pass Threshold"),
                  React.createElement("input", {
                    type: "number",
                    min: "0",
                    max: "100",
                    step: "0.1",
                    className: "playground-evaluations-input",
                    value: form.passThreshold ?? "80",
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), passThreshold: event.target.value })),
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
                  React.createElement("div", { className: "playground-evaluations-modal-copy" }, "Each line should contain input and expectedOutput fields. evaluationGuidance is optional.")
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
                placeholder: stringifyPlaygroundEvaluationJsonl([{ input: "Question", expectedOutput: "Answer", evaluationGuidance: "Optional scoring instructions for this row" }]),
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

        const isEvaluationRunPage = normalizedMode === "run" && activeSet && activeRun;
        const isEvaluationCasePage = normalizedMode === "case" && activeSet && activeRun && activeCase;
        const isEvaluationSubpage = isEvaluationDetailPage || isEvaluationRunPage || isEvaluationCasePage;
        const evaluationPageTitle = isEvaluationRunPage
          ? (activeRun.label || "Evaluation Run")
          : isEvaluationCasePage
            ? "Evaluation Case"
            : isEvaluationDetailPage
              ? (activeSet.name || "Untitled Evaluation")
              : "Evaluations";

        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page" },
          renderEvaluationTopNavActions(),
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" },
                React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                  isEvaluationSubpage
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-resource-detail-back-button playground-guardrails-detail-back-button" + (isEvaluationSubpage ? " playground-evaluations-detail-back-button" : ""),
                        onClick: () => {
                          if (isEvaluationCasePage) {
                            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
                            setEvaluationsPageMode("run");
                            return;
                          }
                          if (isEvaluationRunPage) {
                            setSelectedEvaluationRunId("");
                            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
                            setEvaluationsPageMode("detail");
                            return;
                          }
                          setEvaluationsPageMode("overview");
                        },
                        "aria-label": isEvaluationCasePage ? "Back to evaluation run" : isEvaluationRunPage ? "Back to evaluation" : "Back to evaluations",
                      },
                        React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Back")
                      )
                    : null,
                  React.createElement("div", { className: "playground-files-library-title-row" + (isEvaluationSubpage ? " playground-guardrails-detail-title-row" : "") },
                    React.createElement("h1", { className: "playground-files-library-title" + (isEvaluationSubpage ? " playground-guardrails-detail-title" : "") },
                      evaluationPageTitle
                    ),
                    isEvaluationDetailPage
                      ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button",
                            onClick: () => openRunEvaluationModal(activeSet.id),
                            disabled: activeSet.dataRows.length === 0,
                          },
                            React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Run Evaluation")
                          )
                        )
                      : isEvaluationRunPage || isEvaluationCasePage
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
                normalizedMode === "case" ? renderCase() : normalizedMode === "run" ? renderRun() : normalizedMode === "detail" ? renderDetail() : renderOverview()
              )
            )
          ),
          renderRunModal(),
          renderEvaluationRenameModal(),
          renderCreateModal(),
          renderJsonlModal()
        );
      }
`;
