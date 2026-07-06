export const PLAYGROUND_FINE_TUNING_CSS = String.raw`
      .playground-fine-tuning-page .playground-files-browser-body {
        overflow: hidden;
      }

      .playground-fine-tuning-page .playground-guardrails-table-header,
      .playground-fine-tuning-page .playground-guardrails-table-row {
        grid-template-columns: minmax(220px, 1.3fr) minmax(130px, 0.72fr) minmax(132px, 0.72fr) minmax(112px, 0.55fr) minmax(96px, 0.46fr) 32px;
      }

      .playground-fine-tuning-page .playground-guardrails-layout,
      .playground-fine-tuning-page .playground-guardrails-list-panel {
        overflow: visible;
      }

      .playground-fine-tuning-overview-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-fine-tuning-score-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-fine-tuning-score-chip .is-improvement {
        color: #3cf2a3;
      }

      .playground-fine-tuning-status-pill {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        gap: 5px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-fine-tuning-status-pill::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.46);
      }

      .playground-fine-tuning-status-pill.is-completed::before {
        background: #3cf2a3;
      }

      .playground-fine-tuning-status-pill.is-running::before {
        background: #73b7ff;
      }

      .playground-fine-tuning-status-pill.is-verifying::before {
        background: #73b7ff;
      }

      .playground-fine-tuning-status-pill.is-error::before {
        background: #ff6b6b;
      }

      .playground-fine-tuning-detail {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .playground-fine-tuning-detail-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .playground-fine-tuning-kpi-card.playground-project-overview-progress-combo-card {
        margin-top: 0;
      }

      .playground-fine-tuning-detail-time {
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-fine-tuning-detail-stop-button {
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-fine-tuning-detail-stop-button svg {
        color: #ff6b6b;
      }

      .playground-fine-tuning-detail-stop-button:disabled {
        cursor: default;
        opacity: 0.56;
      }

      .playground-fine-tuning-detail-stop-button .is-spinning {
        animation: playgroundFineTuningSpin 0.9s linear infinite;
      }

      @keyframes playgroundFineTuningSpin {
        to {
          transform: rotate(360deg);
        }
      }

      .playground-fine-tuning-kpi-card.playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-improvement {
        background: #c5a3ff;
      }

      .playground-fine-tuning-kpi-card.playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-after {
        background: #9ff6ce;
      }

      .playground-fine-tuning-kpi-card.playground-evaluations-analytics-card .playground-project-overview-progress-combo-metric-dot.is-before {
        background: #7effff;
      }

      .playground-fine-tuning-score-chart {
        min-height: 224px;
        height: 224px;
      }

      .playground-fine-tuning-progress-combo-canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }

      .playground-fine-tuning-analytics-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 28px;
        margin-top: 12px;
      }

      .playground-fine-tuning-analytics-agent {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-fine-tuning-analytics-agent .playground-evaluations-run-agent-avatar {
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        font-size: 9px;
      }

      .playground-fine-tuning-analytics-agent-main,
      .playground-fine-tuning-analytics-agent-meta {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-analytics-agent-meta {
        color: rgba(255, 255, 255, 0.52);
        font-weight: 400;
      }

      .playground-fine-tuning-thread-link {
        min-width: 0;
        max-width: 280px;
        display: inline-flex;
        justify-content: flex-end;
        border: 0;
        padding: 0;
        background: transparent;
        color: #73b7ff;
        font: inherit;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      .playground-fine-tuning-thread-link:disabled {
        color: rgba(255, 255, 255, 0.42);
        cursor: default;
      }

      .playground-fine-tuning-section.playground-plugins-section {
        gap: 0;
      }

      .playground-fine-tuning-section .playground-plugins-section-header {
        margin-bottom: 10px;
      }

      .playground-fine-tuning-reference-table {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow: visible !important;
      }

      .playground-fine-tuning-reference-table .playground-evaluations-cases-header,
      .playground-fine-tuning-reference-table .playground-evaluations-cases-row {
        grid-template-columns: minmax(170px, 1fr) minmax(118px, 0.55fr) minmax(118px, 0.55fr) minmax(76px, 0.34fr);
      }

      .playground-fine-tuning-detail-table .playground-evaluations-cases-header,
      .playground-fine-tuning-detail-table .playground-evaluations-cases-row {
        grid-template-columns: minmax(120px, 0.34fr) minmax(0, 1fr);
      }

      .playground-fine-tuning-detail-table .playground-evaluations-cases-row {
        cursor: default;
      }

      .playground-fine-tuning-detail-value {
        min-width: 0;
        display: grid;
        justify-content: start;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-reference-link {
        width: fit-content;
        max-width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: #73b7ff;
        font: inherit;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-detail-card {
        min-width: 0;
        padding: 14px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-fine-tuning-facts {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-fine-tuning-fact {
        display: grid;
        grid-template-columns: minmax(92px, 0.45fr) minmax(0, 1fr);
        gap: 12px;
        align-items: center;
      }

      .playground-fine-tuning-fact-label {
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-fine-tuning-fact-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.35;
        text-align: right;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-diff-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-fine-tuning-diff-list .playground-version-changes-file-card {
        border-radius: 10px;
        overflow: hidden;
      }

      .playground-fine-tuning-analysis-section {
        min-width: 0;
        overflow: visible;
      }

      .playground-fine-tuning-analysis-content {
        min-width: 0;
        max-height: none;
        overflow: visible;
        padding: 0;
        color: rgba(255, 255, 255, 0.84);
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
        scrollbar-width: none;
      }

      .playground-fine-tuning-analysis-content::-webkit-scrollbar {
        display: none;
      }

      .playground-fine-tuning-detail-tabs.playground-evaluations-detail-tabs {
        margin-top: 24px;
      }

      .playground-fine-tuning-tab-panel.playground-plugins-section {
        min-height: 0;
      }

      .playground-fine-tuning-create-modal.playground-project-overview-outcome-editor-modal {
        width: min(720px, calc(100vw - 48px));
        height: auto !important;
        min-height: 0;
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
      }

      .playground-fine-tuning-create-modal .playground-project-overview-outcome-editor-body {
        gap: 14px;
      }

      .playground-fine-tuning-create-modal .playground-evaluations-form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-fine-tuning-create-modal .playground-evaluations-field {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
      }

      .playground-fine-tuning-create-modal .playground-evaluations-field > span {
        flex: 0 0 auto;
        min-width: 64px;
      }

      .playground-fine-tuning-create-modal .playground-evaluations-field .playground-evaluations-select {
        flex: 1 1 auto;
        border: 0;
        background: transparent;
        text-align: right;
        text-align-last: right;
        padding-right: 0;
        color: rgba(255, 255, 255, 0.92);
        box-shadow: none;
      }

      .playground-fine-tuning-evaluation-picker {
        grid-column: 1 / -1;
      }

      .playground-fine-tuning-evaluation-picker.playground-mission-control-modal-outcomes-editor {
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .playground-fine-tuning-evaluation-picker .playground-tasks-detail-section-header {
        margin-bottom: 8px;
        overflow: visible;
      }

      .playground-fine-tuning-evaluation-picker-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-fine-tuning-evaluation-list.playground-mission-control-modal-outcomes-list {
        overflow: visible;
        padding-right: 2px;
      }

      .playground-fine-tuning-evaluation-option.playground-mission-control-modal-outcome-row {
        cursor: pointer;
      }

      .playground-fine-tuning-evaluation-option .playground-mission-control-modal-outcome-copy {
        flex-direction: row;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1 1 auto;
      }

      .playground-fine-tuning-evaluation-option .playground-mission-control-modal-outcome-input {
        height: auto;
        min-height: 0;
        line-height: 1.25;
        margin: 0;
      }

      .playground-fine-tuning-evaluation-option .playground-mission-control-modal-outcome-menu-trigger {
        flex: 0 0 auto;
      }

      .playground-fine-tuning-evaluation-run-select {
        flex: 0 1 178px;
        min-width: 132px;
        max-width: 210px;
        height: 26px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.78);
        font: inherit;
        font-size: 11px;
        font-weight: 400;
        line-height: 1;
        text-align: right;
        text-align-last: right;
        outline: none;
        cursor: pointer;
      }

      .playground-fine-tuning-evaluation-run-select:disabled {
        color: rgba(255, 255, 255, 0.36);
        cursor: default;
      }

      .playground-fine-tuning-evaluation-option.is-selected .playground-mission-control-modal-outcome-menu-trigger {
        color: #ffffff;
      }

      .playground-fine-tuning-evaluation-option:not(.is-selected) .playground-mission-control-modal-outcome-menu-trigger svg {
        opacity: 0;
      }

      .playground-fine-tuning-evaluation-menu-shell {
        position: relative;
        flex: 0 0 auto;
        overflow: visible;
      }

      .playground-fine-tuning-evaluation-menu-shell .playground-mission-control-modal-outcome-add {
        position: relative;
        z-index: 2;
      }

      .playground-fine-tuning-evaluation-menu-shell .playground-fine-tuning-evaluation-menu {
        top: calc(100% + 6px);
        right: 0;
        left: auto;
        width: min(320px, calc(100vw - 64px));
        max-height: 270px;
        overflow: auto;
        z-index: 1600;
      }

      .playground-fine-tuning-evaluation-menu .tb-popup-row {
        min-height: 42px;
      }

      .playground-fine-tuning-evaluation-menu .tb-popup-row-select {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-fine-tuning-evaluation-menu .tb-popup-row-select .playground-tasks-toolbar-popup-item-copy {
        order: 1;
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }

      .playground-fine-tuning-evaluation-menu .tb-popup-row-select .tb-popup-check-slot {
        order: 2;
        margin-left: auto;
        flex: 0 0 16px;
      }

      .playground-fine-tuning-evaluation-menu .playground-fine-tuning-evaluation-meta {
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-fine-tuning-evaluation-menu-empty {
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-threads-table-header,
      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(170px, 1.12fr) minmax(140px, 0.72fr) minmax(80px, 0.34fr) minmax(122px, 0.58fr) minmax(150px, 0.74fr) 20px;
        gap: 12px;
      }

      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-thread-cell,
      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-plugin-row-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-create-modal .playground-fine-tuning-evaluation-name {
        display: block;
        width: auto;
        min-width: 0;
        flex: 0 1 auto;
        pointer-events: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-create-modal .playground-fine-tuning-evaluation-meta {
        display: block;
        width: auto;
        min-width: 0;
        flex: 1 1 auto;
        height: auto;
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-fine-tuning-instructions-section.playground-agents-detail-instructions-section {
        grid-column: 1 / -1;
        margin-bottom: 0;
      }

      .playground-fine-tuning-instructions-section.playground-agents-detail-instructions-section .playground-tasks-detail-section-header {
        position: relative;
        top: auto;
        z-index: 2;
        background: transparent;
        padding-top: 0;
      }

      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-editor {
        min-height: 118px;
      }

      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-preview-scope.tb-runner-chat,
      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-input {
        min-height: 118px;
      }

      .playground-fine-tuning-create-error {
        grid-column: 1 / -1;
        color: rgba(255, 158, 176, 0.95);
        font-size: 12px;
        line-height: 1.45;
      }

      @media (max-width: 980px) {
        .playground-fine-tuning-detail-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-fine-tuning-create-modal .playground-evaluations-form-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;

export const PLAYGROUND_FINE_TUNING_SCRIPT = String.raw`
      const PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR = 100;

      function createPlaygroundFineTuningId(prefix = "fine_tune_job") {
        return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
      }

      function normalizePlaygroundFineTuningString(value) {
        return String(value || "").trim();
      }

      function readPlaygroundFineTuningPlainObject(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
      }

      function isPlaygroundFineTuningPlainObject(value) {
        return value && typeof value === "object" && !Array.isArray(value);
      }

      function hasPlaygroundFineTuningObjectContent(value) {
        return isPlaygroundFineTuningPlainObject(value) && Object.keys(value).length > 0;
      }

      function readFirstPlaygroundFineTuningObject(...values) {
        for (const value of values) {
          if (hasPlaygroundFineTuningObjectContent(value)) return value;
        }
        return {};
      }

      function readFirstPlaygroundFineTuningArray(...values) {
        for (const value of values) {
          if (Array.isArray(value) && value.length) return value;
        }
        return [];
      }

      function truncatePlaygroundFineTuningReferenceText(value, maxLength = 12000) {
        const text = String(value || "");
        if (!maxLength || text.length <= maxLength) return text;
        return text.slice(0, maxLength).trimEnd() + "\n\n...";
      }

      function compactPlaygroundFineTuningReferenceMetadata(metadata) {
        const source = readPlaygroundFineTuningPlainObject(metadata);
        const blockedKeys = new Set([
          "beforeAgentSnapshot",
          "before_agent_snapshot",
          "afterAgentSnapshot",
          "after_agent_snapshot",
          "beforeSnapshot",
          "before_snapshot",
          "afterSnapshot",
          "after_snapshot",
          "baseAgentSnapshot",
          "base_agent_snapshot",
          "snapshot",
          "diffFiles",
          "diff_files",
          "diffs",
          "files",
        ]);
        return Object.fromEntries(
          Object.entries(source).filter(([key]) => !blockedKeys.has(key))
        );
      }

      function normalizePlaygroundFineTuningPersonIdentity(rawValue = {}) {
        const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
        return {
          id: normalizePlaygroundFineTuningString(source.id || source.userId || source.user_id || source.uid || source.email),
          userId: normalizePlaygroundFineTuningString(source.userId || source.user_id || source.uid),
          name: normalizePlaygroundFineTuningString(source.name || source.displayName || source.display_name || source.label || source.title),
          email: normalizePlaygroundFineTuningString(source.email || source.mail),
          avatarUrl: normalizePlaygroundFineTuningString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
        };
      }

      function getPlaygroundFineTuningInitials(value) {
        const words = normalizePlaygroundFineTuningString(value)
          .split(/\s+/)
          .filter(Boolean);
        if (!words.length) return "CA";
        return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join("");
      }

      function getPlaygroundFineTuningPersonLabel(person) {
        const identity = normalizePlaygroundFineTuningPersonIdentity(person);
        return normalizePlaygroundFineTuningString(identity.name || identity.email || identity.id || identity.userId);
      }

      function getPlaygroundFineTuningConductorIdentity(source = {}) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const nested = record.conductedBy || record.conducted_by || record.startedBy || record.started_by || record.createdBy || record.created_by || metadata.conductedBy || metadata.conducted_by || metadata.startedBy || metadata.started_by || metadata.createdBy || metadata.created_by || null;
        const direct = normalizePlaygroundFineTuningPersonIdentity({
          id: record.conductedById || record.conducted_by_id || record.startedById || record.started_by_id || record.createdById || record.created_by_id || metadata.conductedById || metadata.conducted_by_id || metadata.startedById || metadata.started_by_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
          userId: record.conductedByUserId || record.conducted_by_user_id || record.startedByUserId || record.started_by_user_id || record.createdByUserId || record.created_by_user_id || metadata.conductedByUserId || metadata.conducted_by_user_id || metadata.startedByUserId || metadata.started_by_user_id || metadata.createdByUserId || metadata.created_by_user_id || record.userId || record.user_id,
          name: record.conductedByName || record.conducted_by_name || record.startedByName || record.started_by_name || record.createdByName || record.created_by_name || metadata.conductedByName || metadata.conducted_by_name || metadata.startedByName || metadata.started_by_name || metadata.createdByName || metadata.created_by_name,
          email: record.conductedByEmail || record.conducted_by_email || record.startedByEmail || record.started_by_email || record.createdByEmail || record.created_by_email || metadata.conductedByEmail || metadata.conducted_by_email || metadata.startedByEmail || metadata.started_by_email || metadata.createdByEmail || metadata.created_by_email,
          avatarUrl: record.conductedByAvatarUrl || record.conducted_by_avatar_url || record.startedByAvatarUrl || record.started_by_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.conductedByAvatarUrl || metadata.conducted_by_avatar_url || metadata.startedByAvatarUrl || metadata.started_by_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
        });
        const nestedIdentity = normalizePlaygroundFineTuningPersonIdentity(nested || {});
        return {
          id: nestedIdentity.id || direct.id,
          userId: nestedIdentity.userId || direct.userId,
          name: nestedIdentity.name || direct.name,
          email: nestedIdentity.email || direct.email,
          avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
        };
      }

      function isPlaygroundFineTuningAgentVersionReady(status) {
        const normalizedStatus = normalizePlaygroundFineTuningString(status).toLowerCase();
        return normalizedStatus === "saved" || normalizedStatus === "published";
      }

      function decodePlaygroundFineTuningEscapedText(value) {
        let text = String(value || "");
        if ((text.match(/\\n/g) || []).length >= 2) {
          text = text
            .replace(/\\r\\n/g, "\n")
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, "\"");
        }
        return text;
      }

      function sanitizePlaygroundFineTuningAnalysisSummary(value) {
        let text = decodePlaygroundFineTuningEscapedText(value)
          .replace(/\r\n/g, "\n")
          .trim();
        if (!text) return "";
        const rawPayloadIndex = text.search(/(?:^|\s)(?:data|event):\s*\{/);
        if (rawPayloadIndex > 0) {
          text = text.slice(0, rawPayloadIndex).trim();
        }
        text = text
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            if (!trimmed) return true;
            if (/^(event|id|retry):\s*/i.test(trimmed)) return false;
            if (/^data:\s*(?:\{|\[|\"type\")/i.test(trimmed)) return false;
            if (/^\{\"type\":/.test(trimmed)) return false;
            return true;
          })
          .join("\n")
          .replace(/\n{4,}/g, "\n\n\n")
          .trim();
        const analysisStart = text.search(/(?:Fine[- ]?Tuning Analysis|###\s+Diagnosis|##\s+Diagnosis|Diagnosis:)/i);
        if (analysisStart > 0) {
          text = text.slice(analysisStart).trim();
        }
        return text.length > 2400 ? text.slice(0, 2400).trimEnd() + "\n\n..." : text;
      }

      function normalizePlaygroundFineTuningScore(value, fallback = 0) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        return Math.max(0, Math.min(1, numeric));
      }

      function normalizePlaygroundFineTuningTokenCount(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
      }

      function normalizePlaygroundFineTuningUsdCost(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
      }

      function readPlaygroundFineTuningUsdCost(source, keys = []) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const usage = record.usage && typeof record.usage === "object" && !Array.isArray(record.usage) ? record.usage : {};
        const candidates = keys.length
          ? keys.flatMap((key) => [record[key], metadata[key], usage[key]])
          : [
              record.costUsd,
              record.costUSD,
              record.cost_usd,
              record.usdCost,
              record.usd_cost,
              record.totalUsd,
              record.totalUSD,
              record.total_usd,
              record.totalCostUsd,
              record.totalCostUSD,
              record.total_cost_usd,
              usage.costUsd,
              usage.costUSD,
              usage.cost_usd,
              usage.usdCost,
              usage.usd_cost,
              usage.totalCostUsd,
              usage.totalCostUSD,
              usage.total_cost_usd,
              usage.totalUsd,
              usage.totalUSD,
              usage.total_usd,
              metadata.costUsd,
              metadata.costUSD,
              metadata.cost_usd,
              metadata.usdCost,
              metadata.usd_cost,
              metadata.totalCostUsd,
              metadata.totalCostUSD,
              metadata.total_cost_usd,
              metadata.totalUsd,
              metadata.totalUSD,
              metadata.total_usd,
            ];
        for (const candidate of candidates) {
          const numeric = Number(candidate);
          if (Number.isFinite(numeric) && numeric > 0) {
            return numeric;
          }
        }
        return 0;
      }

      function readPlaygroundFineTuningUsdCostWithLegacyCt(source, keys = []) {
        const usdCost = readPlaygroundFineTuningUsdCost(source, keys);
        if (usdCost > 0) return usdCost;
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const tokenCost = normalizePlaygroundFineTuningTokenCount(
          record.costTokens
          ?? record.cost_tokens
          ?? record.costCt
          ?? record.costCT
          ?? record.cost_ct
          ?? record.computeTokens
          ?? record.compute_tokens
          ?? record.totalCT
          ?? record.totalCt
          ?? record.total_ct
          ?? record.ct
        );
        return tokenCost > 0 ? tokenCost / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR : 0;
      }

      function formatPlaygroundFineTuningUsdCost(value) {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(normalizePlaygroundFineTuningUsdCost(value));
      }

      function isPlaygroundFineTuningActiveStatus(status) {
        return new Set([
          "active",
          "analysis",
          "analyzing",
          "creating_agent_version",
          "creating-version",
          "creating_version",
          "evaluating",
          "fine-tuning",
          "fine_tuning",
          "in-progress",
          "in_progress",
          "pending",
          "processing",
          "publishing",
          "publishing_version",
          "queued",
          "running",
          "running_case",
          "running_evaluator",
          "scoring",
          "started",
          "verification",
          "verifying",
          "verifying_evaluation",
          "waiting_for_case_summary",
        ]).has(
          normalizePlaygroundFineTuningString(status).toLowerCase()
        );
      }

      function isPlaygroundFineTuningTerminalStatus(status) {
        return new Set(["completed", "complete", "saved", "published", "error", "failed", "cancelled", "canceled"]).has(
          normalizePlaygroundFineTuningString(status).toLowerCase()
        );
      }

      function hasPlaygroundFineTuningAfterResult(job) {
        const source = job && typeof job === "object" && !Array.isArray(job) ? job : {};
        const status = normalizePlaygroundFineTuningString(source.status).toLowerCase();
        const references = Array.isArray(source.evaluationRuns)
          ? source.evaluationRuns
          : Array.isArray(source.evaluation_runs)
            ? source.evaluation_runs
            : [];
        if (references.some((reference) => {
          const referenceStatus = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
          if (!normalizePlaygroundFineTuningString(reference?.afterRunId || reference?.after_run_id)) return false;
          if (referenceStatus === "not_run" || referenceStatus === "pending") return false;
          return !isPlaygroundFineTuningActiveStatus(referenceStatus);
        })) {
          return true;
        }
        if (!references.length && isPlaygroundFineTuningTerminalStatus(status)) {
          return Object.prototype.hasOwnProperty.call(source, "afterScore") || Object.prototype.hasOwnProperty.call(source, "after_score");
        }
        return false;
      }

      function canStopPlaygroundFineTuningJob(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
        if (new Set(["error", "failed", "cancelled", "canceled"]).has(status)) return false;
        const hasActiveReference = normalizedJob.evaluationRuns.some((reference) => {
          const referenceStatus = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
          return referenceStatus === "pending" || isPlaygroundFineTuningActiveStatus(referenceStatus);
        });
        if (hasActiveReference) return true;
        if (isPlaygroundFineTuningTerminalStatus(status)) return false;
        return isPlaygroundFineTuningActiveStatus(status);
      }

      function formatPlaygroundFineTuningDate(value) {
        const date = new Date(value || "");
        if (!Number.isFinite(date.getTime())) return "-";
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      }

      function formatPlaygroundFineTuningDateTime(value) {
        const date = new Date(value || "");
        if (!Number.isFinite(date.getTime())) return "-";
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      }

      function formatPlaygroundFineTuningPercent(value) {
        return Math.round(normalizePlaygroundFineTuningScore(value) * 100) + "%";
      }

      function formatPlaygroundFineTuningCost(value) {
        return formatPlaygroundFineTuningUsdCost(normalizePlaygroundFineTuningTokenCount(value) / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
      }

      function formatPlaygroundFineTuningDefaultJobName(date = new Date()) {
        const safeDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
        return "Fine-Tune " + safeDate.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      function normalizePlaygroundFineTuningRunReference(rawReference = {}, fallbackIndex = 0) {
        const source = rawReference && typeof rawReference === "object" && !Array.isArray(rawReference) ? rawReference : {};
        return {
          evaluationSetId: normalizePlaygroundFineTuningString(source.evaluationSetId || source.evaluation_set_id),
          evaluationSetName: normalizePlaygroundFineTuningString(source.evaluationSetName || source.evaluation_set_name || "Evaluation " + (fallbackIndex + 1)),
          beforeRunId: normalizePlaygroundFineTuningString(source.beforeRunId || source.before_run_id),
          beforeRunLabel: normalizePlaygroundFineTuningString(source.beforeRunLabel || source.before_run_label || "Before"),
          beforeScore: normalizePlaygroundFineTuningScore(source.beforeScore ?? source.before_score ?? 0),
          beforeCostUsd: normalizePlaygroundFineTuningUsdCost(source.beforeCostUsd ?? source.before_cost_usd ?? 0),
          afterRunId: normalizePlaygroundFineTuningString(source.afterRunId || source.after_run_id),
          afterRunLabel: normalizePlaygroundFineTuningString(source.afterRunLabel || source.after_run_label || "After"),
          afterScore: normalizePlaygroundFineTuningScore(source.afterScore ?? source.after_score ?? 0),
          afterCostUsd: normalizePlaygroundFineTuningUsdCost(source.afterCostUsd ?? source.after_cost_usd ?? 0),
          status: normalizePlaygroundFineTuningString(source.status || "not_run") || "not_run",
        };
      }

      function normalizePlaygroundFineTuningJob(rawJob = {}, fallbackIndex = 0) {
        const source = rawJob && typeof rawJob === "object" && !Array.isArray(rawJob) ? rawJob : {};
        const metadata = readPlaygroundFineTuningPlainObject(source.metadata);
        const fineTuningMetadata = readPlaygroundFineTuningPlainObject(metadata.fineTuning);
        const runnerPlaygroundMetadata = readPlaygroundFineTuningPlainObject(metadata.runnerPlayground);
        const createdAgentVersion = isPlaygroundFineTuningPlainObject(source.createdAgentVersion)
          ? source.createdAgentVersion
          : isPlaygroundFineTuningPlainObject(source.created_agent_version)
            ? source.created_agent_version
            : null;
        const createdAgentVersionMetadata = readPlaygroundFineTuningPlainObject(createdAgentVersion?.metadata);
        const createdAgentVersionSnapshot = readPlaygroundFineTuningPlainObject(createdAgentVersion?.snapshot);
        const beforeAgentSnapshot = readFirstPlaygroundFineTuningObject(
          source.beforeAgentSnapshot,
          source.before_agent_snapshot,
          source.beforeSnapshot,
          source.before_snapshot,
          source.baseAgentSnapshot,
          source.base_agent_snapshot,
          metadata.beforeAgentSnapshot,
          metadata.before_agent_snapshot,
          metadata.beforeSnapshot,
          metadata.before_snapshot,
          metadata.baseAgentSnapshot,
          metadata.base_agent_snapshot,
          fineTuningMetadata.beforeAgentSnapshot,
          fineTuningMetadata.before_agent_snapshot,
          fineTuningMetadata.beforeSnapshot,
          fineTuningMetadata.before_snapshot,
          fineTuningMetadata.baseAgentSnapshot,
          fineTuningMetadata.base_agent_snapshot,
          createdAgentVersionMetadata.beforeAgentSnapshot,
          createdAgentVersionMetadata.before_agent_snapshot,
          createdAgentVersionMetadata.beforeSnapshot,
          createdAgentVersionMetadata.before_snapshot,
          createdAgentVersionMetadata.baseAgentSnapshot,
          createdAgentVersionMetadata.base_agent_snapshot
        );
        const afterAgentSnapshot = readFirstPlaygroundFineTuningObject(
          source.afterAgentSnapshot,
          source.after_agent_snapshot,
          source.afterSnapshot,
          source.after_snapshot,
          metadata.afterAgentSnapshot,
          metadata.after_agent_snapshot,
          metadata.afterSnapshot,
          metadata.after_snapshot,
          fineTuningMetadata.afterAgentSnapshot,
          fineTuningMetadata.after_agent_snapshot,
          fineTuningMetadata.afterSnapshot,
          fineTuningMetadata.after_snapshot,
          createdAgentVersionSnapshot,
          createdAgentVersionMetadata.afterAgentSnapshot,
          createdAgentVersionMetadata.after_agent_snapshot,
          createdAgentVersionMetadata.afterSnapshot,
          createdAgentVersionMetadata.after_snapshot
        );
        const diffFiles = readFirstPlaygroundFineTuningArray(
          source.diffFiles,
          source.diff_files,
          metadata.diffFiles,
          metadata.diff_files,
          fineTuningMetadata.diffFiles,
          fineTuningMetadata.diff_files,
          runnerPlaygroundMetadata.diffFiles,
          runnerPlaygroundMetadata.diff_files,
          createdAgentVersion?.diffFiles,
          createdAgentVersion?.diff_files,
          createdAgentVersionMetadata.diffFiles,
          createdAgentVersionMetadata.diff_files
        );
        const threadId = normalizePlaygroundFineTuningString(
          source.threadId
          || source.thread_id
          || source.fineTuningThreadId
          || source.fine_tuning_thread_id
          || source.thread?.id
          || source.thread?.threadId
          || source.thread?.thread_id
          || metadata.threadId
          || metadata.thread_id
          || metadata.fineTuningThreadId
          || metadata.fine_tuning_thread_id
          || fineTuningMetadata.threadId
          || fineTuningMetadata.thread_id
          || fineTuningMetadata.fineTuningThreadId
          || fineTuningMetadata.fine_tuning_thread_id
          || runnerPlaygroundMetadata.threadId
          || runnerPlaygroundMetadata.thread_id
          || runnerPlaygroundMetadata.fineTuningThreadId
          || runnerPlaygroundMetadata.fine_tuning_thread_id
          || createdAgentVersion?.threadId
          || createdAgentVersion?.thread_id
          || createdAgentVersion?.fineTuningThreadId
          || createdAgentVersion?.fine_tuning_thread_id
          || createdAgentVersionMetadata.threadId
          || createdAgentVersionMetadata.thread_id
          || createdAgentVersionMetadata.fineTuningThreadId
          || createdAgentVersionMetadata.fine_tuning_thread_id
        );
        const nowIso = new Date().toISOString();
        const evaluationSets = (Array.isArray(source.evaluationSets)
          ? source.evaluationSets
          : Array.isArray(source.evaluation_sets)
            ? source.evaluation_sets
            : []
        ).map((set, index) => ({
          id: normalizePlaygroundFineTuningString(set?.id || set?.evaluationSetId || set?.evaluation_set_id || "evaluation_" + (index + 1)),
          name: normalizePlaygroundFineTuningString(set?.name || set?.title || "Evaluation " + (index + 1)),
          activeVersionId: normalizePlaygroundFineTuningString(set?.activeVersionId || set?.active_version_id),
          activeVersionNumber: Math.max(0, Number(set?.activeVersionNumber || set?.active_version_number || 0) || 0),
          activeVersionLabel: normalizePlaygroundFineTuningString(set?.activeVersionLabel || set?.active_version_label),
          fineTuningRunId: normalizePlaygroundFineTuningString(set?.fineTuningRunId || set?.fine_tuning_run_id || set?.selectedRunId || set?.selected_run_id),
          fineTuningRunLabel: normalizePlaygroundFineTuningString(set?.fineTuningRunLabel || set?.fine_tuning_run_label || set?.selectedRunLabel || set?.selected_run_label),
          caseCount: Math.max(0, Number(set?.caseCount || set?.case_count || 0) || 0),
        }));
        const evaluationRuns = (Array.isArray(source.evaluationRuns)
          ? source.evaluationRuns
          : Array.isArray(source.evaluation_runs)
            ? source.evaluation_runs
            : []
        ).map((reference, index) => normalizePlaygroundFineTuningRunReference(reference, index));
        const conductedBy = getPlaygroundFineTuningConductorIdentity(source);
        const explicitVerificationCostUsd = normalizePlaygroundFineTuningUsdCost(
          source.verificationCostUsd
          ?? source.verification_cost_usd
          ?? source.evaluationCostUsd
          ?? source.evaluation_cost_usd
          ?? 0
        );
        const verificationCostUsd = explicitVerificationCostUsd
          || evaluationRuns.reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
        const fineTuningCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source, [
          "fineTuningCostUsd",
          "fine_tuning_cost_usd",
          "analysisCostUsd",
          "analysis_cost_usd",
          "threadCostUsd",
          "thread_cost_usd",
          "costUsd",
          "cost_usd",
        ]);
        const explicitTotalCostUsd = normalizePlaygroundFineTuningUsdCost(
          source.totalCostUsd
          ?? source.total_cost_usd
          ?? source.totalUsd
          ?? source.total_usd
          ?? 0
        );
        const explicitOrComponentCostUsd = explicitTotalCostUsd || fineTuningCostUsd + verificationCostUsd;
        const totalCostTokens = normalizePlaygroundFineTuningTokenCount(
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
        ) || normalizePlaygroundFineTuningTokenCount(explicitOrComponentCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
        const totalCostUsd = explicitOrComponentCostUsd || (totalCostTokens / PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
        return {
          id: normalizePlaygroundFineTuningString(source.id || source.jobId || source.job_id) || createPlaygroundFineTuningId(),
          name: normalizePlaygroundFineTuningString(source.name || source.title || "Fine-Tune Job " + (fallbackIndex + 1)),
          status: normalizePlaygroundFineTuningString(source.status || "completed") || "completed",
          createdAt: normalizePlaygroundFineTuningString(source.createdAt || source.created_at || nowIso),
          updatedAt: normalizePlaygroundFineTuningString(source.updatedAt || source.updated_at || source.createdAt || source.created_at || nowIso),
          agentId: normalizePlaygroundFineTuningString(source.agentId || source.agent_id),
          targetAgentId: normalizePlaygroundFineTuningString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
          agentName: normalizePlaygroundFineTuningString(source.agentName || source.agent_name || "Agent"),
          targetAgentName: normalizePlaygroundFineTuningString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || "Agent"),
          agentPhotoUrl: normalizePlaygroundFineTuningString(source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
          targetAgentPhotoUrl: normalizePlaygroundFineTuningString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
          conductedBy,
          createdBy: conductedBy,
          fineTunerAgentId: normalizePlaygroundFineTuningString(source.fineTunerAgentId || source.fine_tuner_agent_id || source.runnerAgentId || source.runner_agent_id),
          fineTunerAgentName: normalizePlaygroundFineTuningString(source.fineTunerAgentName || source.fine_tuner_agent_name || source.runnerAgentName || source.runner_agent_name),
          fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(source.fineTunerAgentPhotoUrl || source.fine_tuner_agent_photo_url || source.runnerAgentPhotoUrl || source.runner_agent_photo_url),
          environmentId: normalizePlaygroundFineTuningString(source.environmentId || source.environment_id),
          environmentName: normalizePlaygroundFineTuningString(source.environmentName || source.environment_name || "Computer"),
          evaluationSets,
          instructions: String(source.instructions || ""),
          verifyAfter: true,
          threadId,
          threadTitle: normalizePlaygroundFineTuningString(source.threadTitle || source.thread_title || "Fine-Tuning Thread"),
          beforeScore: normalizePlaygroundFineTuningScore(source.beforeScore ?? source.before_score ?? 0),
          afterScore: normalizePlaygroundFineTuningScore(source.afterScore ?? source.after_score ?? 0),
          improvementScore: normalizePlaygroundFineTuningScore(source.improvementScore ?? source.improvement_score ?? 0),
          costTokens: totalCostTokens,
          costUsd: totalCostUsd,
          fineTuningCostUsd,
          verificationCostUsd,
          analysisSummary: sanitizePlaygroundFineTuningAnalysisSummary(source.analysisSummary || source.analysis_summary || ""),
          evaluationRuns,
          beforeAgentSnapshot,
          afterAgentSnapshot,
          diffFiles,
          createdAgentVersion,
          createdAgentVersionId: normalizePlaygroundFineTuningString(source.createdAgentVersionId || source.created_agent_version_id || createdAgentVersion?.id || createdAgentVersion?.versionId || createdAgentVersion?.version_id),
          agentVersionCreationStatus: normalizePlaygroundFineTuningString(source.agentVersionCreationStatus || source.agent_version_creation_status || createdAgentVersion?.status || "proposed") || "proposed",
          agentVersionError: normalizePlaygroundFineTuningString(source.agentVersionError || source.agent_version_error || createdAgentVersion?.error),
          metadata,
          error: normalizePlaygroundFineTuningString(source.error || source.message),
        };
      }

      function mergePlaygroundFineTuningAgentVersionRecords(existingVersion, incomingVersion) {
        const existing = isPlaygroundFineTuningPlainObject(existingVersion) ? existingVersion : {};
        const incoming = isPlaygroundFineTuningPlainObject(incomingVersion) ? incomingVersion : {};
        if (!Object.keys(existing).length) return Object.keys(incoming).length ? incoming : null;
        if (!Object.keys(incoming).length) return existing;
        const existingMetadata = readPlaygroundFineTuningPlainObject(existing.metadata);
        const incomingMetadata = readPlaygroundFineTuningPlainObject(incoming.metadata);
        return {
          ...existing,
          ...incoming,
          id: normalizePlaygroundFineTuningString(incoming.id || incoming.versionId || incoming.version_id || existing.id || existing.versionId || existing.version_id),
          snapshot: hasPlaygroundFineTuningObjectContent(incoming.snapshot) ? incoming.snapshot : existing.snapshot,
          metadata: {
            ...existingMetadata,
            ...incomingMetadata,
          },
        };
      }

      function mergePlaygroundFineTuningJobRecords(existingJob, incomingJob) {
        const incomingSource = incomingJob && typeof incomingJob === "object" && !Array.isArray(incomingJob) ? incomingJob : {};
        const incomingHasExplicitStatus = Object.prototype.hasOwnProperty.call(incomingSource, "status")
          || Object.prototype.hasOwnProperty.call(incomingSource, "fineTuningStatus")
          || Object.prototype.hasOwnProperty.call(incomingSource, "fine_tuning_status");
        const existing = normalizePlaygroundFineTuningJob(existingJob);
        const incoming = normalizePlaygroundFineTuningJob(incomingJob);
        const mergedVersion = mergePlaygroundFineTuningAgentVersionRecords(existing.createdAgentVersion, incoming.createdAgentVersion);
        return normalizePlaygroundFineTuningJob({
          ...existing,
          ...incoming,
          status: incomingHasExplicitStatus ? incoming.status : existing.status || incoming.status,
          metadata: {
            ...readPlaygroundFineTuningPlainObject(existing.metadata),
            ...readPlaygroundFineTuningPlainObject(incoming.metadata),
          },
          threadId: incoming.threadId || existing.threadId,
          threadTitle: incoming.threadTitle || existing.threadTitle,
          beforeAgentSnapshot: hasPlaygroundFineTuningObjectContent(incoming.beforeAgentSnapshot) ? incoming.beforeAgentSnapshot : existing.beforeAgentSnapshot,
          afterAgentSnapshot: hasPlaygroundFineTuningObjectContent(incoming.afterAgentSnapshot) ? incoming.afterAgentSnapshot : existing.afterAgentSnapshot,
          diffFiles: Array.isArray(incoming.diffFiles) && incoming.diffFiles.length ? incoming.diffFiles : existing.diffFiles,
          createdAgentVersion: mergedVersion,
          createdAgentVersionId: incoming.createdAgentVersionId || existing.createdAgentVersionId || normalizePlaygroundFineTuningString(mergedVersion?.id),
          analysisSummary: incoming.analysisSummary || existing.analysisSummary,
          evaluationRuns: Array.isArray(incoming.evaluationRuns) && incoming.evaluationRuns.length ? incoming.evaluationRuns : existing.evaluationRuns,
        });
      }

      function hasPlaygroundFineTuningChangeArtifacts(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        if (Array.isArray(normalizedJob.diffFiles) && normalizedJob.diffFiles.length) return true;
        const beforeSnapshot = readPlaygroundFineTuningPlainObject(normalizedJob.beforeAgentSnapshot);
        const afterSnapshot = readPlaygroundFineTuningPlainObject(normalizedJob.afterAgentSnapshot);
        if (!hasPlaygroundFineTuningObjectContent(beforeSnapshot) && !hasPlaygroundFineTuningObjectContent(afterSnapshot)) return false;
        if (String(beforeSnapshot.instructions || "") !== String(afterSnapshot.instructions || "")) return true;
        return JSON.stringify({
          model: beforeSnapshot.model || "",
          enabledSkills: beforeSnapshot.enabledSkills || [],
          guardrails: beforeSnapshot.guardrails || [],
          guardrailSetIds: beforeSnapshot.guardrailSetIds || [],
          promptAdaptations: beforeSnapshot.promptAdaptations || [],
          invisiblePromptAdaptations: beforeSnapshot.invisiblePromptAdaptations || [],
        }) !== JSON.stringify({
          model: afterSnapshot.model || "",
          enabledSkills: afterSnapshot.enabledSkills || [],
          guardrails: afterSnapshot.guardrails || [],
          guardrailSetIds: afterSnapshot.guardrailSetIds || [],
          promptAdaptations: afterSnapshot.promptAdaptations || [],
          invisiblePromptAdaptations: afterSnapshot.invisiblePromptAdaptations || [],
        });
      }

      function needsPlaygroundFineTuningRuntimeDetailsHydration(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        if (!normalizedJob.id) return false;
        const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
        if (!new Set(["completed", "error", "failed", "cancelled", "canceled"]).has(status)) return true;
        if (!normalizedJob.threadId) return true;
        if (!normalizedJob.analysisSummary || normalizePlaygroundFineTuningString(normalizedJob.analysisSummary) === "Fine-tuning analysis is running.") return true;
        if (!hasPlaygroundFineTuningChangeArtifacts(normalizedJob)) return true;
        return !Array.isArray(normalizedJob.evaluationRuns) || normalizedJob.evaluationRuns.length === 0;
      }

      function buildPlaygroundFineTuningJobReferencePayload(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const version = readPlaygroundFineTuningPlainObject(normalizedJob.createdAgentVersion);
        const versionMetadata = compactPlaygroundFineTuningReferenceMetadata(version.metadata);
        const metadata = compactPlaygroundFineTuningReferenceMetadata(normalizedJob.metadata);
        return {
          id: normalizedJob.id,
          name: normalizedJob.name,
          status: normalizedJob.status,
          createdAt: normalizedJob.createdAt,
          updatedAt: normalizedJob.updatedAt,
          agentId: normalizedJob.agentId,
          targetAgentId: normalizedJob.targetAgentId,
          agentName: normalizedJob.agentName,
          targetAgentName: normalizedJob.targetAgentName,
          agentPhotoUrl: normalizedJob.agentPhotoUrl,
          targetAgentPhotoUrl: normalizedJob.targetAgentPhotoUrl,
          conductedBy: normalizedJob.conductedBy,
          createdBy: normalizedJob.createdBy,
          fineTunerAgentId: normalizedJob.fineTunerAgentId,
          fineTunerAgentName: normalizedJob.fineTunerAgentName,
          fineTunerAgentPhotoUrl: normalizedJob.fineTunerAgentPhotoUrl,
          environmentId: normalizedJob.environmentId,
          environmentName: normalizedJob.environmentName,
          evaluationSets: normalizedJob.evaluationSets,
          evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id).filter(Boolean),
          instructions: truncatePlaygroundFineTuningReferenceText(normalizedJob.instructions, 4000),
          verifyAfter: true,
          threadId: normalizedJob.threadId,
          threadTitle: normalizedJob.threadTitle,
          beforeScore: normalizedJob.beforeScore,
          afterScore: normalizedJob.afterScore,
          improvementScore: normalizedJob.improvementScore,
          costTokens: normalizedJob.costTokens,
          costUsd: normalizedJob.costUsd,
          fineTuningCostUsd: normalizedJob.fineTuningCostUsd,
          verificationCostUsd: normalizedJob.verificationCostUsd,
          analysisSummary: truncatePlaygroundFineTuningReferenceText(normalizedJob.analysisSummary, 2400),
          evaluationRuns: normalizedJob.evaluationRuns,
          createdAgentVersion: version.id ? {
            id: normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id),
            version: version.version,
            versionNumber: version.versionNumber || version.version_number,
            label: version.label,
            status: version.status,
            createdAt: version.createdAt || version.created_at,
            updatedAt: version.updatedAt || version.updated_at,
            publishedAt: version.publishedAt || version.published_at,
            metadata: {
              ...versionMetadata,
              fineTuningJobId: normalizedJob.id,
              fine_tuning_job_id: normalizedJob.id,
              threadId: normalizedJob.threadId || versionMetadata.threadId || versionMetadata.thread_id,
              thread_id: normalizedJob.threadId || versionMetadata.thread_id || versionMetadata.threadId,
              fineTuningThreadId: normalizedJob.threadId || versionMetadata.fineTuningThreadId || versionMetadata.fine_tuning_thread_id,
              fine_tuning_thread_id: normalizedJob.threadId || versionMetadata.fine_tuning_thread_id || versionMetadata.fineTuningThreadId,
            },
          } : normalizedJob.createdAgentVersion,
          createdAgentVersionId: normalizedJob.createdAgentVersionId,
          agentVersionCreationStatus: normalizedJob.agentVersionCreationStatus,
          agentVersionError: normalizedJob.agentVersionError,
          metadata: {
            ...metadata,
            fineTuningJobId: normalizedJob.id,
            fine_tuning_job_id: normalizedJob.id,
          },
          error: normalizedJob.error,
        };
      }

      function readPlaygroundFineTuningJobListFromPayload(payload) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        const candidates = [
          source.jobs,
          source.fineTuningJobs,
          source.fine_tuning_jobs,
          source.data?.jobs,
          source.data?.fineTuningJobs,
          source.data?.fine_tuning_jobs,
          source.items,
          source.data,
          source.records,
          payload,
        ];
        for (const candidate of candidates) {
          if (Array.isArray(candidate)) {
            return candidate.map((job, index) => normalizePlaygroundFineTuningJob(job, index));
          }
        }
        return [];
      }

      function getPlaygroundFineTuningEvaluationVersions(set) {
        if (typeof readPlaygroundEvaluationVersions === "function") {
          return readPlaygroundEvaluationVersions(set);
        }
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata) ? set.metadata : {};
        const rawVersions = set?.evaluationVersions || set?.evaluation_versions || set?.versions || metadata.evaluationVersions || metadata.evaluation_versions || metadata.versions || [];
        return Array.isArray(rawVersions) ? rawVersions : [];
      }

      function normalizePlaygroundFineTuningEvaluationSet(set, fallbackIndex = 0) {
        const normalized = typeof normalizePlaygroundEvaluationSet === "function"
          ? normalizePlaygroundEvaluationSet(set)
          : {
              ...(set || {}),
              id: normalizePlaygroundFineTuningString(set?.id || "evaluation_" + (fallbackIndex + 1)),
              name: normalizePlaygroundFineTuningString(set?.name || set?.title || "Evaluation " + (fallbackIndex + 1)),
              dataRows: Array.isArray(set?.dataRows) ? set.dataRows : [],
              runs: Array.isArray(set?.runs) ? set.runs : [],
            };
        return normalized;
      }

      function mergePlaygroundFineTuningEvaluationRuns(...runLists) {
        const byId = new Map();
        runLists.flatMap((runs) => Array.isArray(runs) ? runs : []).forEach((run, index) => {
          const source = run && typeof run === "object" && !Array.isArray(run) ? run : {};
          const cases = Array.isArray(source.cases) ? source.cases : [];
          const averageScore = Number(source.averageScore ?? source.average_score);
          const fallbackRunCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source);
          const fallbackRunCostTokens = normalizePlaygroundFineTuningTokenCount(
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
          ) || normalizePlaygroundFineTuningTokenCount(fallbackRunCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
          const normalizedRun = typeof normalizePlaygroundEvaluationRun === "function"
            ? normalizePlaygroundEvaluationRun(source, index)
            : {
                ...source,
                id: normalizePlaygroundFineTuningString(source.id || source.runId || source.run_id),
                label: normalizePlaygroundFineTuningString(source.label || source.name || "Run"),
                averageScore: Number.isFinite(averageScore)
                  ? normalizePlaygroundFineTuningScore(averageScore)
                  : cases.length
                    ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
                    : 0,
                costTokens: fallbackRunCostTokens,
                costUsd: fallbackRunCostUsd,
                status: normalizePlaygroundFineTuningString(source.status || "queued") || "queued",
              };
          const id = normalizePlaygroundFineTuningString(normalizedRun.id || run?.id || run?.runId || run?.run_id || "run_" + (index + 1));
          if (!id) return;
          byId.set(id, {
            ...(byId.get(id) || {}),
            ...run,
            ...normalizedRun,
            id,
          });
        });
        return Array.from(byId.values()).sort((left, right) => {
          const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || left?.updatedAt || left?.updated_at || 0) || 0;
          const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || right?.updatedAt || right?.updated_at || 0) || 0;
          return rightTime - leftTime;
        });
      }

      function resolvePlaygroundFineTuningPublishedEvaluationSource(set, fallbackIndex = 0) {
        const normalizedSet = normalizePlaygroundFineTuningEvaluationSet(set, fallbackIndex);
        const versions = getPlaygroundFineTuningEvaluationVersions(normalizedSet);
        const activeVersion = (Array.isArray(versions) ? versions : []).find((version) => String(version?.status || "").trim() === "active")
          || (Array.isArray(versions) ? versions : [])[0]
          || null;
        if (activeVersion?.snapshot && typeof createPlaygroundEvaluationFromVersionSnapshot === "function") {
          const versionedSet = createPlaygroundEvaluationFromVersionSnapshot(normalizedSet, activeVersion, versions, activeVersion.id);
          const normalizedVersionedSet = normalizePlaygroundFineTuningEvaluationSet(versionedSet, fallbackIndex);
          return {
            ...normalizedVersionedSet,
            runs: mergePlaygroundFineTuningEvaluationRuns(normalizedVersionedSet.runs, normalizedSet.runs),
            activeVersionId: normalizePlaygroundFineTuningString(activeVersion.id),
            activeVersionNumber: Math.max(0, Number(activeVersion.version || 0) || 0),
            activeVersionLabel: normalizePlaygroundFineTuningString(activeVersion.label || (activeVersion.version ? "Version " + activeVersion.version : "")),
          };
        }
        return {
          ...normalizedSet,
          activeVersionId: normalizePlaygroundFineTuningString(activeVersion?.id || normalizedSet?.metadata?.activeEvaluationVersionId || normalizedSet?.metadata?.active_evaluation_version_id),
          activeVersionNumber: Math.max(0, Number(activeVersion?.version || normalizedSet?.metadata?.activeEvaluationVersionNumber || normalizedSet?.metadata?.active_evaluation_version_number || 0) || 0),
          activeVersionLabel: normalizePlaygroundFineTuningString(activeVersion?.label || ""),
        };
      }

      function getPlaygroundFineTuningLatestRun(set) {
        const runs = Array.isArray(set?.runs) ? set.runs : [];
        return runs.slice().sort((left, right) => {
          const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || 0) || 0;
          const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || 0) || 0;
          return rightTime - leftTime;
        })[0] || null;
      }

      function getPlaygroundFineTuningRuns(set) {
        return (Array.isArray(set?.runs) ? set.runs : [])
          .map((run, index) => ({
            ...run,
            id: normalizePlaygroundFineTuningString(run?.id || run?.runId || run?.run_id || "run_" + (index + 1)),
            label: normalizePlaygroundFineTuningString(run?.label || run?.name || run?.title || "Run " + (index + 1)),
          }))
          .filter((run) => run.id)
          .sort((left, right) => {
            const leftTime = Date.parse(left?.createdAt || left?.created_at || left?.completedAt || left?.completed_at || 0) || 0;
            const rightTime = Date.parse(right?.createdAt || right?.created_at || right?.completedAt || right?.completed_at || 0) || 0;
            return rightTime - leftTime;
          });
      }

      function getPlaygroundFineTuningRunById(set, runId) {
        const normalizedRunId = normalizePlaygroundFineTuningString(runId);
        return getPlaygroundFineTuningRuns(set).find((run) => run.id === normalizedRunId) || null;
      }

      function getPlaygroundFineTuningEvaluationScore(set) {
        const run = getPlaygroundFineTuningLatestRun(set);
        if (!run) return 0;
        if (Number.isFinite(Number(run.averageScore ?? run.average_score))) {
          return normalizePlaygroundFineTuningScore(run.averageScore ?? run.average_score);
        }
        const cases = Array.isArray(run.cases) ? run.cases : [];
        return cases.length
          ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
          : 0;
      }

      function buildPlaygroundFineTuningDiffFiles(job) {
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const rawFiles = Array.isArray(normalizedJob.diffFiles) && normalizedJob.diffFiles.length
          ? normalizedJob.diffFiles
          : [
              {
                id: "instructions",
                filePath: "agent/instructions.md",
                beforeContent: String(normalizedJob.beforeAgentSnapshot?.instructions || ""),
                afterContent: String(normalizedJob.afterAgentSnapshot?.instructions || ""),
              },
              {
                id: "configuration",
                filePath: "agent/configuration.json",
                beforeContent: JSON.stringify({
                  model: normalizedJob.beforeAgentSnapshot?.model || "",
                  enabledSkills: normalizedJob.beforeAgentSnapshot?.enabledSkills || [],
                  guardrails: normalizedJob.beforeAgentSnapshot?.guardrails || [],
                }, null, 2) + "\n",
                afterContent: JSON.stringify({
                  model: normalizedJob.afterAgentSnapshot?.model || "",
                  enabledSkills: normalizedJob.afterAgentSnapshot?.enabledSkills || [],
                  guardrails: normalizedJob.afterAgentSnapshot?.guardrails || [],
                }, null, 2) + "\n",
              },
            ];
        return rawFiles.map((file) => {
          if (typeof createPlaygroundVersionDiffFile === "function") {
            return createPlaygroundVersionDiffFile({
              id: file.id || file.filePath,
              path: file.filePath || file.path || file.label,
              beforeContent: file.beforeContent ?? file.before,
              afterContent: file.afterContent ?? file.after,
            });
          }
          return {
            id: file.id || file.filePath,
            filePath: file.filePath || file.path || "agent/change.txt",
            diffContent: file.diffContent || "",
            fileContent: file.afterContent || "",
            additions: 0,
            deletions: 0,
          };
        }).filter(Boolean);
      }

      function PlaygroundFineTuningPerformanceChart({ job }) {
        const canvasRef = useRef(null);
        const chartRef = useRef(null);
        const normalizedJob = normalizePlaygroundFineTuningJob(job);
        const hasAfter = hasPlaygroundFineTuningAfterResult(normalizedJob);
        const labels = ["Before", "After"];
        const rawValues = [
          Math.round(normalizePlaygroundFineTuningScore(normalizedJob.beforeScore) * 100),
          Math.round(normalizePlaygroundFineTuningScore(hasAfter ? normalizedJob.afterScore : normalizedJob.beforeScore) * 100),
        ];
        const values = rawValues.map((value) => value <= 0 ? 1 : value);
        const chartSignature = JSON.stringify({ rawValues, values, hasAfter });

        useEffect(() => () => {
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }
        }, []);

        useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas || typeof Chart !== "function") {
            if (chartRef.current) {
              chartRef.current.destroy();
              chartRef.current = null;
            }
            return undefined;
          }
          const makeHorizontalGradient = (context, stops, fallback) => {
            const chart = context?.chart;
            const chartArea = chart?.chartArea;
            const ctx = chart?.ctx;
            if (!ctx || !chartArea) return fallback;
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
            return gradient;
          };
          const hoverGuidePlugin = {
            id: "fineTuningPerformanceHoverGuide",
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
              ctx.moveTo(chartArea.left, activeElement.y);
              ctx.lineTo(chartArea.right, activeElement.y);
              ctx.stroke();
              ctx.restore();
            },
          };
          const chartData = {
            labels,
            datasets: [
              {
                id: "performance",
                type: "bar",
                label: "Performance",
                data: values,
                backgroundColor: (context) => {
                  const index = context?.dataIndex || 0;
                  return makeHorizontalGradient(context, index === 0
                    ? [
                        [0, "rgba(126, 255, 255, 0.72)"],
                        [1, "rgba(91, 103, 230, 0.46)"],
                      ]
                    : [
                        [0, "rgba(159, 246, 206, 0.84)"],
                        [1, "rgba(84, 229, 166, 0.42)"],
                      ],
                    index === 0 ? "rgba(126, 255, 255, 0.58)" : "rgba(159, 246, 206, 0.68)");
                },
                borderWidth: 0,
                borderRadius: 4,
                barPercentage: 0.56,
                categoryPercentage: 0.66,
                maxBarThickness: 24,
              },
            ],
          };
          const chartOptions = {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            normalized: true,
            interaction: { intersect: false, mode: "nearest" },
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
                    const value = Math.max(0, Number(rawValues[context.dataIndex] || 0));
                    return String(context.label || "Performance") + ": " + Math.round(value) + "%";
                  },
                },
              },
            },
            scales: {
              x: {
                type: "linear",
                min: 0,
                max: 100,
                ticks: {
                  display: true,
                  maxTicksLimit: 4,
                  color: "rgba(255, 255, 255, 0.34)",
                  padding: 8,
                  font: { size: 11, weight: "400", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                  callback: (value) => String(Math.round(Number(value) || 0)) + "%",
                },
                grid: { color: "rgba(255, 255, 255, 0.07)", drawTicks: false },
                border: { display: false },
              },
              y: {
                type: "category",
                bounds: "data",
                offset: true,
                grid: { display: false, drawBorder: false },
                border: { display: false },
                ticks: {
                  color: "rgba(255, 255, 255, 0.58)",
                  font: { size: 11, weight: "500", family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
                  padding: 8,
                },
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

        return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame playground-fine-tuning-score-chart" },
          React.createElement("canvas", {
            ref: canvasRef,
            className: "playground-project-overview-progress-combo-canvas playground-evaluations-progress-combo-canvas playground-fine-tuning-progress-combo-canvas",
            role: "img",
            "aria-label": "Fine-tuning before and after evaluation scores",
          })
        );
      }

      function renderPlaygroundFineTuningPage(props = {}) {
        const {
          backendUrl = "",
          requestHeaders = {},
          agents = [],
          environments = [],
          evaluationSets = [],
          setEvaluationSets,
          fineTuningJobs = [],
          setFineTuningJobs,
          selectedFineTuningJobId = "",
          setSelectedFineTuningJobId,
          fineTuningPageMode = "overview",
          setFineTuningPageMode,
          fineTuningSearchQuery = "",
          setFineTuningSearchQuery,
          fineTuningCreateModalOpen = false,
          setFineTuningCreateModalOpen,
          fineTuningCreateForm = {},
          setFineTuningCreateForm,
          defaultAgentId = "",
          defaultEnvironmentId = "",
          onOpenThread,
          onOpenEvaluationRun,
          onFineTuningThreadStarted,
          onAgentsRefresh,
          onAgentVersionCreated,
          currentUserId = "",
          currentUserName = "",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
          shouldLoadData = false,
        } = props;

        const modalFrameRef = useRef(null);
        const modalCloseTimerRef = useRef(null);
        const fineTuningInstructionsTextareaRef = useRef(null);
        const evaluationSetPickerRef = useRef(null);
        const fineTuningVersionRetryRef = useRef(new Set());
        const fineTuningRuntimeHydrationRef = useRef(new Set());
        const fineTuningThreadNotificationRef = useRef(new Set());
        const fineTuningJobListLoadRef = useRef("");
        const [modalVisible, setModalVisible] = useState(false);
        const [modalClosing, setModalClosing] = useState(false);
        const [createError, setCreateError] = useState("");
        const [createBusy, setCreateBusy] = useState(false);
        const [fineTuningJobsLoading, setFineTuningJobsLoading] = useState(false);
        const [rowMenuId, setRowMenuId] = useState("");
        const [fineTuningSortMode, setFineTuningSortMode] = useState("updated-desc");
        const [fineTuningFilterMode, setFineTuningFilterMode] = useState("all");
        const [fineTuningToolbarPopover, setFineTuningToolbarPopover] = useState("");
        const [fineTuningDetailTab, setFineTuningDetailTab] = useState("analysis");
        const [fineTuningStopJobId, setFineTuningStopJobId] = useState("");
        const [evaluationSetPickerOpen, setEvaluationSetPickerOpen] = useState(false);
        const [isFineTuningInstructionsEditing, setIsFineTuningInstructionsEditing] = useState(false);
        const [fineTuningInstructionsHistory, setFineTuningInstructionsHistory] = useState({ past: [], future: [] });
        const requestHeadersSignature = useMemo(() => JSON.stringify(requestHeaders || {}), [requestHeaders]);

        const normalizedJobs = useMemo(() => (Array.isArray(fineTuningJobs) ? fineTuningJobs : [])
          .map((job, index) => normalizePlaygroundFineTuningJob(job, index))
          .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0)), [fineTuningJobs]);
        const normalizedSelectedFineTuningJobId = useMemo(
          () => normalizePlaygroundFineTuningString(selectedFineTuningJobId),
          [selectedFineTuningJobId]
        );
        const normalizedAgents = useMemo(() => (Array.isArray(agents) ? agents : []).filter((agent) => normalizePlaygroundFineTuningString(agent?.id)), [agents]);
        const normalizedEnvironments = useMemo(() => (Array.isArray(environments) ? environments : []).filter((environment) => normalizePlaygroundFineTuningString(environment?.id)), [environments]);
        const normalizedEvaluationSets = useMemo(() => (Array.isArray(evaluationSets) ? evaluationSets : [])
          .map((set, index) => resolvePlaygroundFineTuningPublishedEvaluationSource(set, index))
          .filter((set) => normalizePlaygroundFineTuningString(set?.id)), [evaluationSets]);
        function getFineTuningRunTimestamp(run) {
          return Date.parse(String(run?.createdAt || run?.created_at || run?.completedAt || run?.completed_at || run?.updatedAt || run?.updated_at || "")) || 0;
        }
        function findFineTuningVerificationRun(job, reference, set) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedReference = normalizePlaygroundFineTuningRunReference(reference);
          const normalizedSet = set && typeof set === "object" && !Array.isArray(set) ? set : null;
          if (!normalizedSet) return null;
          if (normalizedReference.afterRunId) {
            const exactRun = getPlaygroundFineTuningRunById(normalizedSet, normalizedReference.afterRunId);
            if (exactRun) return exactRun;
          }
          const versionId = normalizePlaygroundFineTuningString(normalizedJob.createdAgentVersion?.id || normalizedJob.createdAgentVersionId || normalizedJob.created_agent_version_id);
          const jobCreatedAt = Date.parse(String(normalizedJob.createdAt || "")) || 0;
          const candidates = getPlaygroundFineTuningRuns(normalizedSet)
            .map((run) => normalizeFineTuningEvaluationRun(run))
            .filter((run) => {
              const runVersionId = normalizePlaygroundFineTuningString(run.targetAgentVersionId || run.target_agent_version_id || run.agentVersionId || run.agent_version_id);
              const metadata = run.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata) ? run.metadata : {};
              const runJobId = normalizePlaygroundFineTuningString(run.fineTuningJobId || run.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
              const runLabel = normalizePlaygroundFineTuningString(run.label || run.name || run.title).toLowerCase();
              const runTime = getFineTuningRunTimestamp(run);
              const matchesJob = runJobId && runJobId === normalizedJob.id;
              const matchesVersion = versionId && runVersionId && runVersionId === versionId;
              const looksLikeVerification = runLabel.includes("fine-tune verification") || runLabel.includes("fine tuning verification") || runLabel.includes("verification");
              const isAfterJob = !jobCreatedAt || !runTime || runTime >= jobCreatedAt - 60000;
              return matchesJob || matchesVersion || (looksLikeVerification && isAfterJob);
            })
            .sort((left, right) => getFineTuningRunTimestamp(right) - getFineTuningRunTimestamp(left));
          return candidates[0] || null;
        }
        function resolveFineTuningJobScoresFromEvaluationRuns(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const nextReferences = normalizedJob.evaluationRuns.map((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            const set = normalizedEvaluationSets.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizedReference.evaluationSetId) || null;
            const beforeRun = normalizedReference.beforeRunId && set ? getPlaygroundFineTuningRunById(set, normalizedReference.beforeRunId) : null;
            const afterRun = findFineTuningVerificationRun(normalizedJob, normalizedReference, set);
            const nextReference = {
              ...normalizedReference,
              evaluationSetName: normalizedReference.evaluationSetName || normalizePlaygroundFineTuningString(set?.name),
            };
            if (beforeRun) {
              nextReference.beforeRunId = normalizePlaygroundFineTuningString(beforeRun.id || nextReference.beforeRunId);
              nextReference.beforeRunLabel = normalizePlaygroundFineTuningString(beforeRun.label || beforeRun.name || beforeRun.title || nextReference.beforeRunLabel);
              nextReference.beforeScore = getFineTuningEvaluationRunScore(beforeRun);
              nextReference.beforeCostUsd = getFineTuningEvaluationRunCostUsd(beforeRun);
            }
            if (afterRun) {
              nextReference.afterRunId = normalizePlaygroundFineTuningString(afterRun.id || nextReference.afterRunId);
              nextReference.afterRunLabel = normalizePlaygroundFineTuningString(afterRun.label || afterRun.name || afterRun.title || nextReference.afterRunLabel || "Verification Run");
              nextReference.afterScore = getFineTuningEvaluationRunScore(afterRun);
              nextReference.afterCostUsd = getFineTuningEvaluationRunCostUsd(afterRun);
              nextReference.status = normalizePlaygroundFineTuningString(afterRun.status || nextReference.status || "completed");
            }
            return nextReference;
          });
          if (!nextReferences.length) return normalizedJob;
          const beforeScores = nextReferences
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const finishedAfterScores = nextReferences
            .filter((reference) => hasPlaygroundFineTuningAfterResult({ status: normalizedJob.status, evaluationRuns: [reference] }))
            .map((reference) => Number(reference.afterScore))
            .filter((score) => Number.isFinite(score));
          const hasActiveRuns = nextReferences.some((reference) => reference.afterRunId && isPlaygroundFineTuningActiveStatus(reference.status));
          const allReferencesFinished = nextReferences.length > 0 && nextReferences.every((reference) => hasPlaygroundFineTuningAfterResult({ status: normalizedJob.status, evaluationRuns: [reference] }));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : normalizedJob.beforeScore;
          const afterScore = finishedAfterScores.length
            ? normalizePlaygroundFineTuningScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
            : normalizedJob.afterScore;
          const nextStatus = allReferencesFinished
            ? "completed"
            : hasActiveRuns
              ? "verifying"
              : normalizedJob.status;
          const verificationCostUsd = nextReferences
            .filter((reference) => hasPlaygroundFineTuningAfterResult({ status: nextStatus, evaluationRuns: [reference] }))
            .reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
          const fineTuningCostUsd = normalizePlaygroundFineTuningUsdCost(normalizedJob.fineTuningCostUsd || readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedJob));
          return normalizePlaygroundFineTuningJob({
            ...normalizedJob,
            status: nextStatus,
            beforeScore,
            afterScore,
            improvementScore: finishedAfterScores.length ? normalizePlaygroundFineTuningScore(Math.max(0, afterScore - beforeScore)) : normalizedJob.improvementScore,
            fineTuningCostUsd,
            verificationCostUsd,
            totalCostUsd: fineTuningCostUsd + verificationCostUsd,
            evaluationRuns: nextReferences,
          });
        }
        const shouldRecoverFineTuningJobsFromVersions = useMemo(() => {
          if (normalizedJobs.length === 0) return true;
          if (!normalizedSelectedFineTuningJobId) return false;
          return !normalizedJobs.some((job) => job.id === normalizedSelectedFineTuningJobId);
        }, [normalizedJobs, normalizedSelectedFineTuningJobId]);
        const versionRecoveredJobs = useMemo(
          () => shouldRecoverFineTuningJobsFromVersions ? buildFineTuningJobsFromAgentVersions() : [],
          [normalizedAgents, shouldRecoverFineTuningJobsFromVersions]
        );
        const displaySourceJobs = useMemo(() => mergeFineTuningJobLists(normalizedJobs, versionRecoveredJobs), [normalizedJobs, versionRecoveredJobs]);
        const versionEnrichedJobs = useMemo(() => displaySourceJobs.map((job) => (
          needsFineTuningAgentVersionEnrichment(job)
            ? enrichFineTuningJobFromAgentVersions(job)
            : normalizePlaygroundFineTuningJob(job)
        )), [displaySourceJobs, normalizedAgents, normalizedSelectedFineTuningJobId]);
        const scoredJobs = useMemo(() => versionEnrichedJobs.map((job) => (
          needsFineTuningEvaluationScoreResolution(job)
            ? resolveFineTuningJobScoresFromEvaluationRuns(job)
            : normalizePlaygroundFineTuningJob(job)
        )), [versionEnrichedJobs, normalizedEvaluationSets, normalizedSelectedFineTuningJobId]);
        const currentFineTuningUser = useMemo(() => normalizePlaygroundFineTuningPersonIdentity({
          id: currentUserId || currentUserEmail || "",
          userId: currentUserId || "",
          name: currentUserName || "",
          email: currentUserEmail || "",
          avatarUrl: currentUserAvatarUrl || "",
        }), [currentUserId, currentUserName, currentUserEmail, currentUserAvatarUrl]);
        const selectedJob = scoredJobs.find((job) => job.id === selectedFineTuningJobId) || scoredJobs[0] || null;
        const normalizedQuery = normalizePlaygroundFineTuningString(fineTuningSearchQuery).toLowerCase();
        const filteredJobs = scoredJobs.filter((job) => {
          if (!normalizedQuery) return true;
          return [
            job.name,
            job.agentName,
            job.environmentName,
            job.evaluationSets.map((set) => set.name).join(" "),
          ].join(" ").toLowerCase().includes(normalizedQuery);
        });

        function isDefaultFineTuningTargetAgent(agent) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const normalizedId = normalizePlaygroundFineTuningString(agent?.id || agent?.agentId || agent?.agent_id).toLowerCase();
          return Boolean(
            agent?.isDefault === true
            || agent?.is_default === true
            || agent?.isSystem === true
            || agent?.is_system === true
            || metadata.isDefault === true
            || metadata.is_default === true
            || metadata.isSystem === true
            || metadata.is_system === true
            || normalizedId === "agent_assistant"
            || normalizedId === "agent_default"
            || normalizedId === "agent_research"
            || normalizedId.startsWith("agent-default-")
          );
        }

        function getFineTuningRunTargetAgentInfo(set, run) {
          const sourceRun = run && typeof run === "object" && !Array.isArray(run) ? run : {};
          const sourceSet = set && typeof set === "object" && !Array.isArray(set) ? set : {};
          const id = normalizePlaygroundFineTuningString(
            sourceRun.targetAgentId
            || sourceRun.target_agent_id
            || sourceRun.agentId
            || sourceRun.agent_id
            || sourceSet.targetAgentId
            || sourceSet.target_agent_id
            || sourceSet.agentId
            || sourceSet.agent_id
          );
          return {
            id,
            name: normalizePlaygroundFineTuningString(
              sourceRun.targetAgentName
              || sourceRun.target_agent_name
              || sourceRun.agentName
              || sourceRun.agent_name
              || sourceSet.targetAgentName
              || sourceSet.target_agent_name
              || sourceSet.agentName
              || sourceSet.agent_name
            ),
            photoUrl: normalizePlaygroundFineTuningString(
              sourceRun.targetAgentPhotoUrl
              || sourceRun.target_agent_photo_url
              || sourceRun.agentPhotoUrl
              || sourceRun.agent_photo_url
              || sourceRun.photoUrl
              || sourceRun.photoURL
              || sourceSet.targetAgentPhotoUrl
              || sourceSet.target_agent_photo_url
              || sourceSet.agentPhotoUrl
              || sourceSet.agent_photo_url
              || sourceSet.photoUrl
              || sourceSet.photoURL
            ),
          };
        }

        function findFineTuningAgentById(agentId) {
          const normalizedAgentId = normalizePlaygroundFineTuningString(agentId);
          if (!normalizedAgentId) return null;
          return normalizedAgents.find((agent) => normalizePlaygroundFineTuningString(agent?.id) === normalizedAgentId) || null;
        }

        function resolveFineTuningTargetAgentForSelectedSets(selectedSets) {
          const targets = (Array.isArray(selectedSets) ? selectedSets : [])
            .map((set) => {
              const selectedRun = set?.selectedRun || set?.selected_run || getPlaygroundFineTuningRunById(set, set?.fineTuningRunId || set?.fine_tuning_run_id) || getPlaygroundFineTuningLatestRun(set);
              const target = getFineTuningRunTargetAgentInfo(set, selectedRun);
              return {
                ...target,
                evaluationSetId: normalizePlaygroundFineTuningString(set?.id),
                evaluationSetName: normalizePlaygroundFineTuningString(set?.name),
                runId: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRun?.runId || selectedRun?.run_id),
              };
            })
            .filter((target) => target.id);
          const uniqueTargetIds = Array.from(new Set(targets.map((target) => target.id)));
          if (uniqueTargetIds.length > 1) {
            return {
              error: "Select evaluation runs from one target agent.",
              targetAgent: null,
              targets,
            };
          }
          const target = targets[0] || null;
          if (!target?.id) {
            return {
              error: "Run an evaluation first so fine-tuning can identify the target agent.",
              targetAgent: null,
              targets,
            };
          }
          const knownAgent = findFineTuningAgentById(target.id);
          const targetAgent = {
            ...(knownAgent || {}),
            id: target.id,
            name: target.name || knownAgent?.name || knownAgent?.label || knownAgent?.title || "Target Agent",
            photoUrl: target.photoUrl || knownAgent?.photoUrl || knownAgent?.photoURL || knownAgent?.avatarUrl || knownAgent?.avatarURL || "",
          };
          if (isDefaultFineTuningTargetAgent(targetAgent)) {
            return {
              error: "Default agents cannot be fine-tuned. Create a custom agent and run the evaluation against it first.",
              targetAgent,
              targets,
            };
          }
          return {
            error: "",
            targetAgent,
            targets,
          };
        }

        function findFineTunedAgentVersionForJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id) return null;
          const targetAgentId = normalizePlaygroundFineTuningString(normalizedJob.agentId || normalizedJob.targetAgentId);
          const targetAgent = normalizedAgents.find((agent) => normalizePlaygroundFineTuningString(agent?.id || agent?.agentId || agent?.agent_id) === targetAgentId) || null;
          const versions = getFineTuningAgentVersionList(targetAgent);
          return (Array.isArray(versions) ? versions : []).find((version) => {
            const metadata = readPlaygroundFineTuningPlainObject(version?.metadata);
            return normalizePlaygroundFineTuningString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id) === normalizedJob.id;
          }) || null;
        }

        function enrichFineTuningJobFromAgentVersions(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const version = findFineTunedAgentVersionForJob(normalizedJob);
          if (!version) return normalizedJob;
          const metadata = readPlaygroundFineTuningPlainObject(version.metadata);
          return mergePlaygroundFineTuningJobRecords(normalizedJob, {
            createdAgentVersion: version,
            createdAgentVersionId: normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id),
            agentVersionCreationStatus: normalizePlaygroundFineTuningString(version.status || normalizedJob.agentVersionCreationStatus || "published"),
            threadId: normalizePlaygroundFineTuningString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
            beforeAgentSnapshot: readFirstPlaygroundFineTuningObject(
              metadata.beforeAgentSnapshot,
              metadata.before_agent_snapshot,
              metadata.beforeSnapshot,
              metadata.before_snapshot,
              metadata.baseAgentSnapshot,
              metadata.base_agent_snapshot
            ),
            afterAgentSnapshot: readFirstPlaygroundFineTuningObject(
              version.snapshot,
              metadata.afterAgentSnapshot,
              metadata.after_agent_snapshot,
              metadata.afterSnapshot,
              metadata.after_snapshot
            ),
            diffFiles: readFirstPlaygroundFineTuningArray(metadata.diffFiles, metadata.diff_files, version.diffFiles, version.diff_files),
          });
        }

        function needsFineTuningAgentVersionEnrichment(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id) return false;
          if (normalizedJob.id !== normalizedSelectedFineTuningJobId && !isPlaygroundFineTuningActiveStatus(normalizedJob.status)) {
            return false;
          }
          return !normalizedJob.createdAgentVersionId
            || !normalizedJob.afterAgentSnapshot
            || !Array.isArray(normalizedJob.diffFiles)
            || normalizedJob.diffFiles.length === 0;
        }

        function needsFineTuningEvaluationScoreResolution(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id || !normalizedJob.evaluationRuns.length) return false;
          if (normalizedJob.id === normalizedSelectedFineTuningJobId || isPlaygroundFineTuningActiveStatus(normalizedJob.status)) return true;
          if (!hasPlaygroundFineTuningAfterResult(normalizedJob)) return true;
          return normalizedJob.evaluationRuns.some((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            return !normalizedReference.evaluationSetName
              || !Number.isFinite(Number(normalizedReference.beforeScore))
              || (normalizedReference.afterRunId && !Number.isFinite(Number(normalizedReference.afterScore)));
          });
        }

        function buildFineTuningJobFromAgentVersion(agent, version, fallbackIndex = 0) {
          const metadata = readPlaygroundFineTuningPlainObject(version?.metadata);
          const fineTuningJobId = normalizePlaygroundFineTuningString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
          if (!fineTuningJobId) return null;
          const agentId = normalizePlaygroundFineTuningString(metadata.targetAgentId || metadata.target_agent_id || agent?.id || agent?.agentId || agent?.agent_id);
          const createdAt = normalizePlaygroundFineTuningString(metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || version?.createdAt || version?.created_at || version?.publishedAt || version?.published_at || new Date().toISOString());
          const updatedAt = normalizePlaygroundFineTuningString(metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || version?.updatedAt || version?.updated_at || version?.publishedAt || version?.published_at || createdAt);
          const beforeSnapshot = readFirstPlaygroundFineTuningObject(
            metadata.beforeAgentSnapshot,
            metadata.before_agent_snapshot,
            metadata.beforeSnapshot,
            metadata.before_snapshot,
            metadata.baseAgentSnapshot,
            metadata.base_agent_snapshot
          );
          const afterSnapshot = readFirstPlaygroundFineTuningObject(
            version?.snapshot,
            metadata.afterAgentSnapshot,
            metadata.after_agent_snapshot,
            metadata.afterSnapshot,
            metadata.after_snapshot
          );
          const evaluationSetIds = Array.isArray(metadata.evaluationSetIds)
            ? metadata.evaluationSetIds
            : Array.isArray(metadata.evaluation_set_ids)
              ? metadata.evaluation_set_ids
              : [];
          return normalizePlaygroundFineTuningJob({
            id: fineTuningJobId,
            name: normalizePlaygroundFineTuningString(metadata.fineTuningJobName || metadata.fine_tuning_job_name || version?.fineTuningJobName || version?.label)
              || ("Fine-Tune " + formatPlaygroundFineTuningDateTime(createdAt)),
            status: normalizePlaygroundFineTuningString(metadata.fineTuningStatus || metadata.fine_tuning_status || "completed") || "completed",
            createdAt,
            updatedAt,
            agentId,
            targetAgentId: agentId,
            agentName: normalizePlaygroundFineTuningString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || agent?.label || agent?.title || "Agent"),
            targetAgentName: normalizePlaygroundFineTuningString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || agent?.label || agent?.title || "Agent"),
            agentPhotoUrl: normalizePlaygroundFineTuningString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL),
            targetAgentPhotoUrl: normalizePlaygroundFineTuningString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL),
            conductedBy: metadata.conductedBy || metadata.conducted_by || {},
            createdBy: metadata.createdBy || metadata.created_by || metadata.conductedBy || metadata.conducted_by || {},
            fineTunerAgentId: normalizePlaygroundFineTuningString(metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
            fineTunerAgentName: normalizePlaygroundFineTuningString(metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
            fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
            environmentId: normalizePlaygroundFineTuningString(metadata.environmentId || metadata.environment_id),
            environmentName: normalizePlaygroundFineTuningString(metadata.environmentName || metadata.environment_name || "Computer"),
            evaluationSets: evaluationSetIds.map((setId, index) => ({
              id: normalizePlaygroundFineTuningString(setId || "evaluation_" + (index + 1)),
              name: "Evaluation " + (index + 1),
            })),
            threadId: normalizePlaygroundFineTuningString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
            threadTitle: normalizePlaygroundFineTuningString(metadata.threadTitle || metadata.thread_title || "Fine-Tuning Thread"),
            beforeScore: normalizePlaygroundFineTuningScore(metadata.beforeScore ?? metadata.before_score ?? 0),
            afterScore: normalizePlaygroundFineTuningScore(metadata.afterScore ?? metadata.after_score ?? 0),
            improvementScore: normalizePlaygroundFineTuningScore(metadata.improvementScore ?? metadata.improvement_score ?? 0),
            costUsd: normalizePlaygroundFineTuningUsdCost(metadata.totalCostUsd ?? metadata.total_cost_usd ?? metadata.costUsd ?? metadata.cost_usd ?? 0),
            fineTuningCostUsd: normalizePlaygroundFineTuningUsdCost(metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd ?? 0),
            verificationCostUsd: normalizePlaygroundFineTuningUsdCost(metadata.verificationCostUsd ?? metadata.verification_cost_usd ?? 0),
            analysisSummary: sanitizePlaygroundFineTuningAnalysisSummary(metadata.analysisSummary || metadata.analysis_summary || ""),
            evaluationRuns: Array.isArray(metadata.evaluationRuns) ? metadata.evaluationRuns : Array.isArray(metadata.evaluation_runs) ? metadata.evaluation_runs : [],
            beforeAgentSnapshot: beforeSnapshot,
            afterAgentSnapshot: afterSnapshot,
            diffFiles: readFirstPlaygroundFineTuningArray(metadata.diffFiles, metadata.diff_files, version?.diffFiles, version?.diff_files),
            createdAgentVersion: version,
            createdAgentVersionId: normalizePlaygroundFineTuningString(version?.id || version?.versionId || version?.version_id),
            agentVersionCreationStatus: normalizePlaygroundFineTuningString(version?.status || "published") || "published",
            metadata,
          }, fallbackIndex);
        }

        function buildFineTuningJobsFromAgentVersions() {
          return normalizedAgents.flatMap((agent, agentIndex) => {
            const versions = getFineTuningAgentVersionList(agent);
            return (Array.isArray(versions) ? versions : [])
              .map((version, versionIndex) => buildFineTuningJobFromAgentVersion(agent, version, agentIndex + versionIndex))
              .filter(Boolean);
          });
        }

        function mergeFineTuningJobLists(primaryJobs, recoveredJobs) {
          const byId = new Map();
          [...(Array.isArray(recoveredJobs) ? recoveredJobs : []), ...(Array.isArray(primaryJobs) ? primaryJobs : [])].forEach((job) => {
            const normalizedJob = normalizePlaygroundFineTuningJob(job);
            if (!normalizedJob.id) return;
            const existingJob = byId.get(normalizedJob.id);
            byId.set(normalizedJob.id, existingJob ? mergePlaygroundFineTuningJobRecords(existingJob, normalizedJob) : normalizedJob);
          });
          return Array.from(byId.values()).sort((left, right) => (Date.parse(right.updatedAt || right.createdAt || 0) || 0) - (Date.parse(left.updatedAt || left.createdAt || 0) || 0));
        }

        useEffect(() => {
          if (!fineTuningCreateModalOpen) return;
          setCreateError("");
          setModalClosing(false);
          setModalVisible(false);
          setEvaluationSetPickerOpen(false);
          setIsFineTuningInstructionsEditing(false);
          setFineTuningInstructionsHistory({ past: [], future: [] });
          if (modalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(modalFrameRef.current);
          }
          if (typeof window !== "undefined") {
            modalFrameRef.current = window.requestAnimationFrame(() => {
              modalFrameRef.current = window.requestAnimationFrame(() => {
                modalFrameRef.current = null;
                setModalVisible(true);
              });
            });
          } else {
            setModalVisible(true);
          }
        }, [fineTuningCreateModalOpen]);

        useEffect(() => () => {
          if (modalFrameRef.current && typeof window !== "undefined") window.cancelAnimationFrame(modalFrameRef.current);
          if (modalCloseTimerRef.current && typeof window !== "undefined") window.clearTimeout(modalCloseTimerRef.current);
        }, []);

        useEffect(() => {
          if (!shouldLoadData) return undefined;
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || typeof setFineTuningJobs !== "function") return undefined;
          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature;
          if (fineTuningJobListLoadRef.current === loadKey) return undefined;
          fineTuningJobListLoadRef.current = loadKey;
          let cancelled = false;
          setFineTuningJobsLoading(true);
          void (async () => {
            try {
              const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readFineTuningJsonResponse(response, "Failed to load fine-tuning jobs.");
              if (cancelled) return;
              const backendJobs = readPlaygroundFineTuningJobListFromPayload(data);
              setFineTuningJobs((current) => mergeFineTuningJobLists(current, backendJobs));
            } catch {
              if (!cancelled) fineTuningJobListLoadRef.current = "";
            } finally {
              if (!cancelled) setFineTuningJobsLoading(false);
            }
          })();
          return () => {
            cancelled = true;
          };
        }, [backendUrl, requestHeadersSignature, setFineTuningJobs, shouldLoadData]);

        useEffect(() => {
          if (!evaluationSetPickerOpen || typeof document === "undefined") return undefined;
          const handlePointerDown = (event) => {
            if (evaluationSetPickerRef.current && evaluationSetPickerRef.current.contains(event.target)) return;
            setEvaluationSetPickerOpen(false);
          };
          const handleKeyDown = (event) => {
            if (event.key === "Escape") setEvaluationSetPickerOpen(false);
          };
          document.addEventListener("pointerdown", handlePointerDown);
          document.addEventListener("keydown", handleKeyDown);
          return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
          };
        }, [evaluationSetPickerOpen]);

        useEffect(() => {
          const job = selectedJob ? normalizePlaygroundFineTuningJob(selectedJob) : null;
          if (!job?.id || isPlaygroundFineTuningAgentVersionReady(job.agentVersionCreationStatus) || !job.createdAgentVersion?.snapshot) return undefined;
          if (!backendUrl || fineTuningVersionRetryRef.current.has(job.id)) return undefined;
          fineTuningVersionRetryRef.current.add(job.id);
          let cancelled = false;
          void (async () => {
            const persistedJob = await tryPersistFineTunedAgentVersion(job);
            if (cancelled || !isPlaygroundFineTuningAgentVersionReady(persistedJob.agentVersionCreationStatus)) return;
            patchFineTuningJob(job.id, () => persistedJob, { persist: true });
          })();
          return () => {
            cancelled = true;
          };
        }, [backendUrl, selectedJob?.id, selectedJob?.agentVersionCreationStatus]);

        useEffect(() => {
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !displaySourceJobs.length) return undefined;
          displaySourceJobs
            .filter((job) => job.id && needsPlaygroundFineTuningRuntimeDetailsHydration(job))
            .forEach((job) => {
              const isComplete = isFineTuningRuntimeJobComplete(job);
              const hydrationKey = job.id + ":" + (isComplete ? "details" : "poll");
              if (fineTuningRuntimeHydrationRef.current.has(hydrationKey)) return;
              fineTuningRuntimeHydrationRef.current.add(hydrationKey);
              const hydrationPromise = isComplete
                ? fetchFineTuningRuntimeJob(job.id, job)
                : waitForFineTuningRuntimeJob(job.id, job);
              void hydrationPromise.catch(() => {
                if (!isComplete) fineTuningRuntimeHydrationRef.current.delete(hydrationKey);
              });
            });
          return undefined;
        }, [backendUrl, displaySourceJobs.map((job) => job.id + ":" + job.status + ":" + (job.threadId || "") + ":" + (Array.isArray(job.diffFiles) ? job.diffFiles.length : 0)).join("|")]);

        function updateCreateForm(patch) {
          if (typeof setFineTuningCreateForm === "function") {
            setFineTuningCreateForm((current) => ({ ...(current || {}), ...(patch || {}) }));
          }
        }

        function resizeFineTuningInstructionsTextarea(textarea) {
          if (!textarea || typeof window === "undefined") return;
          const computedStyles = window.getComputedStyle(textarea);
          const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
          const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
          const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
          const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
          const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
          const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
          textarea.style.height = "auto";
          textarea.style.height = Math.max(118, singleLineHeight, textarea.scrollHeight) + "px";
        }

        function focusFineTuningInstructionsTextareaAtEnd(value) {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = fineTuningInstructionsTextareaRef.current;
            if (!textarea) return;
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeFineTuningInstructionsTextarea(textarea);
          });
        }

        function updateFineTuningInstructionsValue(value, options = {}) {
          const nextValue = String(value ?? "");
          const previousValue = String(fineTuningCreateForm?.instructions || "");
          if (previousValue === nextValue) return;
          if (options.recordHistory !== false) {
            setFineTuningInstructionsHistory((current) => ({
              past: [...(Array.isArray(current.past) ? current.past : []), previousValue].slice(-80),
              future: [],
            }));
          }
          updateCreateForm({ instructions: nextValue });
        }

        function applyFineTuningInstructionsHistoryValue(value) {
          updateCreateForm({ instructions: String(value ?? "") });
          focusFineTuningInstructionsTextareaAtEnd(value);
        }

        function handleFineTuningInstructionsUndo() {
          const historyPast = Array.isArray(fineTuningInstructionsHistory.past) ? fineTuningInstructionsHistory.past : [];
          if (!historyPast.length) return;
          const currentValue = String(fineTuningCreateForm?.instructions || "");
          const previousValue = historyPast[historyPast.length - 1];
          setFineTuningInstructionsHistory((current) => {
            const past = Array.isArray(current.past) ? current.past : [];
            const future = Array.isArray(current.future) ? current.future : [];
            return {
              past: past.slice(0, -1),
              future: [currentValue, ...future].slice(0, 80),
            };
          });
          applyFineTuningInstructionsHistoryValue(previousValue);
        }

        function handleFineTuningInstructionsRedo() {
          const historyFuture = Array.isArray(fineTuningInstructionsHistory.future) ? fineTuningInstructionsHistory.future : [];
          if (!historyFuture.length) return;
          const currentValue = String(fineTuningCreateForm?.instructions || "");
          const nextValue = historyFuture[0];
          setFineTuningInstructionsHistory((current) => {
            const past = Array.isArray(current.past) ? current.past : [];
            const future = Array.isArray(current.future) ? current.future : [];
            return {
              past: [...past, currentValue].slice(-80),
              future: future.slice(1),
            };
          });
          applyFineTuningInstructionsHistoryValue(nextValue);
        }

        function buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          if (safeStart !== safeEnd) {
            if (selectedText.startsWith(prefix) && selectedText.endsWith(suffix) && selectedText.length >= prefix.length + suffix.length) {
              const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
              const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
              return { value: nextValue, selectionStart: safeStart, selectionEnd: safeStart + unwrappedText.length };
            }
            const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
            const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
            if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
              const nextValue = value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length);
              return { value: nextValue, selectionStart: safeStart - prefix.length, selectionEnd: safeStart - prefix.length + selectedText.length };
            }
            const wrappedText = prefix + selectedText + suffix;
            const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
            return { value: nextValue, selectionStart: safeStart + prefix.length, selectionEnd: safeStart + prefix.length + selectedText.length };
          }
          const insertedText = prefix + suffix;
          const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
          return { value: nextValue, selectionStart: safeStart + prefix.length, selectionEnd: safeStart + prefix.length };
        }

        function buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, listType = "unordered") {
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
            if (!line.trim()) return shouldRemoveList ? line : isOrderedList ? String(orderedIndex++) + ". " : "- ";
            if (shouldRemoveList) return line.replace(isOrderedList ? orderedListPattern : unorderedListPattern, "$1");
            if (!isOrderedList && unorderedListPattern.test(line)) return line;
            if (isOrderedList && orderedListPattern.test(line)) {
              orderedIndex += 1;
              return line;
            }
            const cleanLine = line.replace(/^(\s*)(?:-\s+|\d+\.\s+)/, "$1");
            return cleanLine.replace(/^(\s*)/, (_match, indent) => String(indent || "") + (isOrderedList ? String(orderedIndex++) + ". " : "- "));
          });
          const nextBlock = nextLines.join("\n");
          const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
          const collapsedSelection = safeStart === safeEnd;
          const markerLength = isOrderedList ? 3 : 2;
          const nextCaretOffset = shouldRemoveList ? Math.max(0, safeStart - lineStart - markerLength) : safeStart - lineStart + markerLength;
          return {
            value: nextValue,
            selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
            selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
          };
        }

        function buildFineTuningMarkdownLinkEdit(value, selectionStart, selectionEnd) {
          const safeStart = Math.max(0, selectionStart);
          const safeEnd = Math.max(safeStart, selectionEnd);
          const selectedText = value.slice(safeStart, safeEnd);
          const existingLinkMatch = selectedText.match(/^\[([^\]]+)\]\(([^)]*)\)$/);
          if (existingLinkMatch) {
            const unwrappedText = existingLinkMatch[1];
            const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
            return { value: nextValue, selectionStart: safeStart, selectionEnd: safeStart + unwrappedText.length };
          }
          const label = selectedText || "link text";
          const url = "url";
          const markdownLink = "[" + label + "](" + url + ")";
          const nextValue = value.slice(0, safeStart) + markdownLink + value.slice(safeEnd);
          const urlStart = safeStart + label.length + 3;
          return { value: nextValue, selectionStart: urlStart, selectionEnd: urlStart + url.length };
        }

        function applyFineTuningMarkdownSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateFineTuningInstructionsValue(nextValue);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = fineTuningInstructionsTextareaRef.current;
            if (!textarea) return;
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeFineTuningInstructionsTextarea(textarea);
          });
        }

        function handleFineTuningInstructionsFormat(formatType) {
          const textarea = fineTuningInstructionsTextareaRef.current;
          if (!textarea) return;
          const value = String(fineTuningCreateForm?.instructions || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          } else if (formatType === "ordered-list") {
            edit = buildFineTuningMarkdownListEdit(value, selectionStart, selectionEnd, "ordered");
          } else if (formatType === "code") {
            edit = buildFineTuningWrappedMarkdownEdit(value, selectionStart, selectionEnd, String.fromCharCode(96));
          } else if (formatType === "link") {
            edit = buildFineTuningMarkdownLinkEdit(value, selectionStart, selectionEnd);
          }
          if (!edit) return;
          applyFineTuningMarkdownSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function closeCreateModal(options = {}) {
          if (createBusy && !options.force) return;
          setEvaluationSetPickerOpen(false);
          if (options.animate === false || typeof window === "undefined") {
            setModalVisible(false);
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
            return;
          }
          setModalVisible(false);
          setModalClosing(true);
          if (modalCloseTimerRef.current) window.clearTimeout(modalCloseTimerRef.current);
          modalCloseTimerRef.current = window.setTimeout(() => {
            modalCloseTimerRef.current = null;
            setModalClosing(false);
            if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(false);
          }, 75);
        }

        function openCreateModal() {
          const currentForm = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const defaultSetIds = Array.isArray(currentForm.evaluationSetIds) && currentForm.evaluationSetIds.length
            ? currentForm.evaluationSetIds
            : normalizedEvaluationSets[0]?.id ? [normalizedEvaluationSets[0].id] : [];
          const currentRunIds = currentForm.evaluationRunIds && typeof currentForm.evaluationRunIds === "object" && !Array.isArray(currentForm.evaluationRunIds)
            ? currentForm.evaluationRunIds
            : {};
          const defaultRunIds = {};
          defaultSetIds.forEach((setId) => {
            const set = normalizedEvaluationSets.find((item) => item.id === String(setId || "").trim()) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            defaultRunIds[setId] = normalizePlaygroundFineTuningString(currentRunIds[setId] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
          });
          updateCreateForm({
            name: formatPlaygroundFineTuningDefaultJobName(),
            agentId: currentForm.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
            environmentId: currentForm.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
            evaluationSetIds: defaultSetIds,
            evaluationRunIds: defaultRunIds,
            instructions: currentForm.instructions || "",
            verifyAfter: true,
          });
          if (typeof setFineTuningCreateModalOpen === "function") setFineTuningCreateModalOpen(true);
        }

        function upsertFineTuningJob(job, options = {}) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.id || typeof setFineTuningJobs !== "function") return normalizedJob;
          setFineTuningJobs((current) => {
            const jobs = Array.isArray(current) ? current.map((item, index) => normalizePlaygroundFineTuningJob(item, index)) : [];
            const existingJob = jobs.find((item) => item.id === normalizedJob.id) || null;
            const mergedJob = existingJob ? mergePlaygroundFineTuningJobRecords(existingJob, normalizedJob) : normalizedJob;
            if (options.persist) {
              void persistFineTuningRuntimeJob(mergedJob).catch(() => {});
            }
            return [mergedJob, ...jobs.filter((item) => item.id !== normalizedJob.id)];
          });
          if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId(normalizedJob.id);
          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("detail");
          return normalizedJob;
        }

        function patchFineTuningJob(jobId, updater, options = {}) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          if (!normalizedJobId || typeof setFineTuningJobs !== "function" || typeof updater !== "function") return;
          setFineTuningJobs((current) => (Array.isArray(current) ? current : []).map((item, index) => {
            const normalizedItem = normalizePlaygroundFineTuningJob(item, index);
            if (normalizedItem.id !== normalizedJobId) return item;
            const nextJob = mergePlaygroundFineTuningJobRecords(normalizedItem, updater(normalizedItem));
            if (options.persist) {
              void persistFineTuningRuntimeJob(nextJob).catch(() => {});
            }
            return nextJob;
          }));
        }

        function buildStoppedFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const cancellationReferences = normalizedJob.evaluationRuns.map((reference) => ({
            ...reference,
            status: isFineTuningEvaluationRunActive(reference.status) || reference.status === "pending"
              ? "cancelled"
              : reference.status,
          }));
          return normalizePlaygroundFineTuningJob({
            ...mergeFineTuningVerificationReferences(normalizedJob, cancellationReferences, "cancelled"),
            status: "cancelled",
            error: "",
            updatedAt: new Date().toISOString(),
          });
        }

        async function stopFineTuningJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedJobId = normalizePlaygroundFineTuningString(normalizedJob.id);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedJobId || !normalizedBackendUrl || fineTuningStopJobId === normalizedJobId) return;
          const stoppedJob = buildStoppedFineTuningJob(normalizedJob);
          setFineTuningStopJobId(normalizedJobId);
          patchFineTuningJob(normalizedJobId, () => stoppedJob);
          try {
            const headers = {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            };
            const threadId = normalizePlaygroundFineTuningString(normalizedJob.threadId);
            const stopRequests = [
              fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }),
            ];
            if (threadId) {
              stopRequests.push(fetch(normalizedBackendUrl + "/threads/" + encodeURIComponent(threadId) + "/cancel", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers,
                body: JSON.stringify({}),
              }));
            }
            const [jobResult] = await Promise.allSettled(stopRequests);
            let backendJob = null;
            if (jobResult.status === "fulfilled") {
              const data = await jobResult.value.json().catch(() => ({}));
              if (jobResult.value.ok) {
                backendJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
              }
            }
            const nextJob = backendJob?.id
              ? mergePlaygroundFineTuningJobRecords(stoppedJob, {
                  ...backendJob,
                  status: "cancelled",
                  evaluationRuns: stoppedJob.evaluationRuns,
                })
              : stoppedJob;
            patchFineTuningJob(normalizedJobId, () => nextJob, { persist: true });
          } finally {
            setFineTuningStopJobId("");
          }
        }

        function normalizeFineTuningEvaluationRun(rawRun = {}) {
          if (typeof normalizePlaygroundEvaluationRun === "function") {
            return normalizePlaygroundEvaluationRun(rawRun);
          }
          const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
          const cases = Array.isArray(source.cases) ? source.cases : [];
          const averageScore = Number(source.averageScore ?? source.average_score);
          const runCostUsd = readPlaygroundFineTuningUsdCostWithLegacyCt(source);
          const runCostTokens = normalizePlaygroundFineTuningTokenCount(
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
          ) || normalizePlaygroundFineTuningTokenCount(runCostUsd * PLAYGROUND_FINE_TUNING_CT_PER_DOLLAR);
          return {
            ...source,
            id: normalizePlaygroundFineTuningString(source.id || source.runId || source.run_id),
            label: normalizePlaygroundFineTuningString(source.label || source.name || "Run"),
            averageScore: Number.isFinite(averageScore)
              ? normalizePlaygroundFineTuningScore(averageScore)
              : cases.length
                ? normalizePlaygroundFineTuningScore(cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length)
                : 0,
            costTokens: runCostTokens,
            costUsd: runCostUsd,
            status: normalizePlaygroundFineTuningString(source.status || "queued") || "queued",
          };
        }

        function isFineTuningEvaluationRunActive(status) {
          return new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]).has(
            normalizePlaygroundFineTuningString(status).toLowerCase()
          );
        }

        function getFineTuningEvaluationRunScore(run) {
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          return normalizePlaygroundFineTuningScore(normalizedRun.averageScore ?? normalizedRun.average_score ?? 0);
        }

        function getFineTuningEvaluationRunCostUsd(run) {
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          return readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedRun);
        }

        function upsertFineTuningEvaluationRun(setId, run) {
          const normalizedSetId = normalizePlaygroundFineTuningString(setId);
          const normalizedRun = normalizeFineTuningEvaluationRun(run);
          if (!normalizedSetId || !normalizedRun.id || typeof setEvaluationSets !== "function") return;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((set, index) => {
            const normalizedSet = normalizePlaygroundFineTuningEvaluationSet(set, index);
            if (normalizePlaygroundFineTuningString(normalizedSet.id) !== normalizedSetId) return set;
            const existingRuns = Array.isArray(set?.runs) ? set.runs : [];
            return {
              ...set,
              runs: [normalizedRun, ...existingRuns.filter((existingRun) => normalizePlaygroundFineTuningString(existingRun?.id || existingRun?.runId || existingRun?.run_id) !== normalizedRun.id)],
              updatedAt: new Date().toISOString(),
            };
          }));
        }

        function mergeFineTuningVerificationReferences(job, references, statusOverride = "") {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const referenceList = Array.isArray(references) ? references : [];
          const existingReferences = normalizedJob.evaluationRuns.map((reference, index) => normalizePlaygroundFineTuningRunReference(reference, index));
          const bySetId = new Map(existingReferences.map((reference) => [reference.evaluationSetId, reference]));
          referenceList.forEach((reference, index) => {
            const normalizedReference = normalizePlaygroundFineTuningRunReference(reference, index);
            if (normalizedReference.evaluationSetId) {
              bySetId.set(normalizedReference.evaluationSetId, {
                ...(bySetId.get(normalizedReference.evaluationSetId) || {}),
                ...normalizedReference,
              });
            }
          });
          const nextReferences = Array.from(bySetId.values());
          const beforeScores = nextReferences
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const finishedAfterScores = nextReferences
            .filter((reference) => reference.afterRunId && !isFineTuningEvaluationRunActive(reference.status) && reference.status !== "error")
            .map((reference) => Number(reference.afterScore))
            .filter((score) => Number.isFinite(score));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : normalizedJob.beforeScore;
          const hasActiveRuns = nextReferences.some((reference) => reference.afterRunId && isFineTuningEvaluationRunActive(reference.status));
          const hasPendingRuns = nextReferences.some((reference) => reference.status === "pending");
          const afterScore = finishedAfterScores.length
            ? normalizePlaygroundFineTuningScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
            : normalizedJob.afterScore || beforeScore;
          const status = statusOverride
            || (hasActiveRuns || hasPendingRuns ? "verifying" : normalizedJob.status || "completed");
          const verificationCostUsd = nextReferences
            .filter((reference) => reference.afterRunId && !isFineTuningEvaluationRunActive(reference.status) && reference.status !== "error")
            .reduce((sum, reference) => sum + normalizePlaygroundFineTuningUsdCost(reference.afterCostUsd), 0);
          const fineTuningCostUsd = normalizePlaygroundFineTuningUsdCost(normalizedJob.fineTuningCostUsd || readPlaygroundFineTuningUsdCostWithLegacyCt(normalizedJob));
          return normalizePlaygroundFineTuningJob({
            ...normalizedJob,
            status,
            beforeScore,
            afterScore,
            improvementScore: finishedAfterScores.length ? normalizePlaygroundFineTuningScore(Math.max(0, afterScore - beforeScore)) : 0,
            fineTuningCostUsd,
            verificationCostUsd,
            totalCostUsd: fineTuningCostUsd + verificationCostUsd,
            evaluationRuns: nextReferences,
            updatedAt: new Date().toISOString(),
          });
        }

        function buildFineTuningAgentSnapshotFromAgent(agent, instructionsOverride) {
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const instructions = instructionsOverride === undefined
            ? String(agent?.instructions || agent?.systemPrompt || agent?.system_prompt || metadata.instructions || "")
            : String(instructionsOverride || "");
          return {
            name: normalizePlaygroundFineTuningString(agent?.name || agent?.label || agent?.title || "Agent"),
            description: String(agent?.description || metadata.description || ""),
            model: normalizePlaygroundFineTuningString(agent?.model || agent?.modelId || agent?.model_id || metadata.model || ""),
            instructions,
            enabledSkills: Array.isArray(agent?.enabledSkills) ? agent.enabledSkills : Array.isArray(agent?.enabled_skills) ? agent.enabled_skills : [],
            guardrailSetIds: Array.isArray(agent?.guardrailSetIds) ? agent.guardrailSetIds : Array.isArray(agent?.guardrail_set_ids) ? agent.guardrail_set_ids : [],
            guardrails: Array.isArray(agent?.guardrails) ? agent.guardrails : Array.isArray(metadata.guardrails) ? metadata.guardrails : [],
            promptAdaptations: Array.isArray(agent?.promptAdaptations) ? agent.promptAdaptations : Array.isArray(agent?.prompt_adaptations) ? agent.prompt_adaptations : [],
            invisiblePromptAdaptations: Array.isArray(agent?.invisiblePromptAdaptations) ? agent.invisiblePromptAdaptations : Array.isArray(agent?.invisible_prompt_adaptations) ? agent.invisible_prompt_adaptations : [],
            metadata,
          };
        }

        function preservePlaygroundFineTuningAgentName(job, snapshot = {}) {
          const source = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : {};
          return {
            ...source,
            name: normalizePlaygroundFineTuningString(job?.targetAgentName || job?.agentName || source.name || "Agent") || "Agent",
          };
        }

        function buildOptimisticFineTuningJob({ jobId, name, selectedSets, targetAgent, fineTunerAgent, selectedEnvironment, instructions, conductedBy }) {
          const nowIso = new Date().toISOString();
          const evaluationRuns = (Array.isArray(selectedSets) ? selectedSets : []).map((set) => {
            const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
              || getPlaygroundFineTuningLatestRun(set);
            return {
              evaluationSetId: set.id,
              evaluationSetName: set.name,
              beforeRunId: normalizePlaygroundFineTuningString(beforeRun?.id || set.fineTuningRunId || set.fine_tuning_run_id),
              beforeRunLabel: normalizePlaygroundFineTuningString(beforeRun?.label || beforeRun?.name || beforeRun?.title || "Before"),
              beforeScore: getFineTuningEvaluationRunScore(beforeRun),
              beforeCostUsd: getFineTuningEvaluationRunCostUsd(beforeRun),
              afterRunId: "",
              afterRunLabel: "",
              afterScore: 0,
              afterCostUsd: 0,
              status: "pending",
            };
          });
          const beforeScores = evaluationRuns
            .map((reference) => Number(reference.beforeScore))
            .filter((score) => Number.isFinite(score));
          const beforeScore = beforeScores.length
            ? normalizePlaygroundFineTuningScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
            : 0;
          const beforeSnapshot = buildFineTuningAgentSnapshotFromAgent(targetAgent);
          return normalizePlaygroundFineTuningJob({
            id: jobId,
            name,
            status: "running",
            createdAt: nowIso,
            updatedAt: nowIso,
            agentId: normalizePlaygroundFineTuningString(targetAgent?.id),
            targetAgentId: normalizePlaygroundFineTuningString(targetAgent?.id),
            agentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            targetAgentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            agentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL),
            targetAgentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL),
            conductedBy,
            createdBy: conductedBy,
            fineTunerAgentId: normalizePlaygroundFineTuningString(fineTunerAgent?.id),
            fineTunerAgentName: normalizePlaygroundFineTuningString(fineTunerAgent?.name || fineTunerAgent?.label || fineTunerAgent?.title || "Agent"),
            fineTunerAgentPhotoUrl: normalizePlaygroundFineTuningString(fineTunerAgent?.photoUrl || fineTunerAgent?.photoURL || fineTunerAgent?.avatarUrl || fineTunerAgent?.avatarURL),
            environmentId: normalizePlaygroundFineTuningString(selectedEnvironment?.id),
            environmentName: normalizePlaygroundFineTuningString(selectedEnvironment?.name || selectedEnvironment?.label || selectedEnvironment?.title || "Computer"),
            evaluationSets: (Array.isArray(selectedSets) ? selectedSets : []).map((set) => {
              const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
                || getPlaygroundFineTuningLatestRun(set);
              return {
                id: set.id,
                name: set.name,
                activeVersionId: set.activeVersionId,
                activeVersionNumber: set.activeVersionNumber,
                activeVersionLabel: set.activeVersionLabel,
                fineTuningRunId: normalizePlaygroundFineTuningString(beforeRun?.id || set.fineTuningRunId || set.fine_tuning_run_id),
                fineTuningRunLabel: normalizePlaygroundFineTuningString(beforeRun?.label || beforeRun?.name || beforeRun?.title || "Before"),
                caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
              };
            }),
            instructions: String(instructions || ""),
            verifyAfter: true,
            threadId: "",
            threadTitle: "Fine-Tune · " + normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || "Agent"),
            beforeScore,
            afterScore: 0,
            improvementScore: 0,
            costTokens: 0,
            costUsd: 0,
            fineTuningCostUsd: 0,
            verificationCostUsd: 0,
            analysisSummary: "",
            evaluationRuns,
            beforeAgentSnapshot: beforeSnapshot,
            afterAgentSnapshot: beforeSnapshot,
            diffFiles: [],
            createdAgentVersion: {
              id: "",
              version: getFineTuningNextAgentVersionNumber(targetAgent),
              label: "Fine-Tuned Version",
              status: "pending",
              snapshot: null,
              createdAt: nowIso,
            },
            agentVersionCreationStatus: "pending",
          });
        }

        function getFineTuningAgentVersionList(agent) {
          if (typeof readPlaygroundAgentVersions === "function") {
            return readPlaygroundAgentVersions(agent);
          }
          const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
          const versions = agent?.agentVersions || agent?.agent_versions || agent?.versions || metadata.agentVersions || metadata.agent_versions || metadata.versions || [];
          return Array.isArray(versions) ? versions : [];
        }

        function getFineTuningNextAgentVersionNumber(agent) {
          const versions = getFineTuningAgentVersionList(agent);
          return Math.max(1, (Array.isArray(versions) ? versions : []).reduce((maxVersion, version) => Math.max(maxVersion, Number(version?.version || version?.versionNumber || version?.version_number || 0) || 0), 0) + 1);
        }

        function notifyFineTunedAgentVersionCreated(job, version) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedVersion = version && typeof version === "object" && !Array.isArray(version)
            ? {
                ...version,
                snapshot: version.snapshot || normalizedJob.createdAgentVersion?.snapshot || normalizedJob.afterAgentSnapshot || {},
              }
            : null;
          if (!normalizedJob.agentId || !normalizedVersion?.id) return;
          if (typeof onAgentVersionCreated === "function") {
            onAgentVersionCreated(normalizedJob.agentId, normalizedVersion, normalizedJob);
          }
        }

        async function readFineTuningJsonResponse(response, fallbackMessage) {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || fallbackMessage || "Request failed.");
          }
          return data;
        }

        async function persistFineTuningRuntimeJob(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !normalizedJob.id) return normalizedJob;
          const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJob.id), {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              job: buildPlaygroundFineTuningJobReferencePayload(normalizedJob),
            }),
          });
          const data = await readFineTuningJsonResponse(response, "Failed to save fine-tuning job.");
          return mergePlaygroundFineTuningJobRecords(normalizedJob, data?.job || data?.data || data);
        }

        function isFineTuningRuntimeJobComplete(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const status = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
          if (new Set(["completed", "error", "failed", "cancelled", "canceled"]).has(status)) return true;
          return false;
        }

        function delayFineTuningPoll(ms) {
          return new Promise((resolve) => {
            if (typeof window !== "undefined") {
              window.setTimeout(resolve, ms);
              return;
            }
            setTimeout(resolve, ms);
          });
        }

        function notifyFineTuningThreadStarted(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!normalizedJob.threadId || typeof onFineTuningThreadStarted !== "function") return;
          if (fineTuningThreadNotificationRef.current.has(normalizedJob.threadId)) return;
          fineTuningThreadNotificationRef.current.add(normalizedJob.threadId);
          onFineTuningThreadStarted({
            id: normalizedJob.threadId,
            title: normalizedJob.threadTitle || normalizedJob.name,
            hidden: true,
            sidebarHidden: true,
            metadata: {
              fineTuning: {
                jobId: normalizedJob.id,
                agentId: normalizedJob.agentId,
                targetAgentId: normalizedJob.agentId,
                fineTunerAgentId: normalizedJob.fineTunerAgentId,
                environmentId: normalizedJob.environmentId,
                evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id),
                hidden: true,
                sidebarHidden: true,
              },
              runnerPlayground: {
                type: "fine_tuning_job",
                fineTuningJobId: normalizedJob.id,
                hidden: true,
                sidebarHidden: true,
              },
            },
          });
        }

        async function fetchFineTuningRuntimeJob(jobId, seedJob) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (!normalizedBackendUrl || !normalizedJobId) return normalizePlaygroundFineTuningJob(seedJob);
          const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: requestHeaders || {},
          });
          const data = await readFineTuningJsonResponse(response, "Failed to load fine-tuning job.");
          const latestJob = mergePlaygroundFineTuningJobRecords(seedJob, data?.job || data?.data || data);
          if (latestJob.id) {
            patchFineTuningJob(normalizedJobId, () => latestJob);
            notifyFineTuningThreadStarted(latestJob);
          }
          return latestJob;
        }

        async function waitForFineTuningRuntimeJob(jobId, seedJob) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          let latestJob = normalizePlaygroundFineTuningJob(seedJob);
          if (!normalizedBackendUrl || !normalizedJobId || isFineTuningRuntimeJobComplete(latestJob)) return latestJob;
          for (let attempt = 0; attempt < 240; attempt += 1) {
            await delayFineTuningPoll(attempt < 10 ? 1000 : 1500);
            latestJob = await fetchFineTuningRuntimeJob(normalizedJobId, latestJob);
            if (isFineTuningRuntimeJobComplete(latestJob)) return latestJob;
          }
          return latestJob;
        }

        function scheduleFineTuningVerificationPoll(jobId, setId, runId) {
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          const normalizedRunId = normalizePlaygroundFineTuningString(runId);
          if (!normalizedBackendUrl || !normalizedRunId) return;
          let attempts = 0;
          const poll = async () => {
            attempts += 1;
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(normalizedRunId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readFineTuningJsonResponse(response, "Failed to load verification run.");
              const run = normalizeFineTuningEvaluationRun(data?.run || data?.data || data);
              if (run.id) {
                upsertFineTuningEvaluationRun(setId, run);
                patchFineTuningJob(jobId, (currentJob) => mergeFineTuningVerificationReferences(currentJob, [{
                  evaluationSetId: setId,
                  afterRunId: run.id,
                  afterRunLabel: run.label || "Verification Run",
                  afterScore: getFineTuningEvaluationRunScore(run),
                  afterCostUsd: getFineTuningEvaluationRunCostUsd(run),
                  status: normalizePlaygroundFineTuningString(currentJob?.status).toLowerCase() === "cancelled" ? "cancelled" : (run.status || "completed"),
                }]), { persist: true });
              }
              if (run.id && isFineTuningEvaluationRunActive(run.status) && attempts < 120 && typeof window !== "undefined") {
                window.setTimeout(poll, 1500);
              }
            } catch (error) {
              patchFineTuningJob(jobId, (currentJob) => {
                if (normalizePlaygroundFineTuningString(currentJob?.status).toLowerCase() === "cancelled") return currentJob;
                return mergeFineTuningVerificationReferences(currentJob, [{
                  evaluationSetId: setId,
                  afterRunId: normalizedRunId,
                  status: "error",
                }], "error");
              }, { persist: true });
            }
          };
          if (typeof window !== "undefined") {
            window.setTimeout(poll, 1200);
          }
        }

        async function startFineTuningVerificationRuns(job, selectedSets, targetAgent, selectedEnvironment) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          const version = normalizedJob.createdAgentVersion && typeof normalizedJob.createdAgentVersion === "object"
            ? normalizedJob.createdAgentVersion
            : {};
          const versionId = normalizePlaygroundFineTuningString(version.id || version.versionId || version.version_id);
          if (!normalizedBackendUrl || !versionId || !isPlaygroundFineTuningAgentVersionReady(normalizedJob.agentVersionCreationStatus)) {
            return mergeFineTuningVerificationReferences(normalizedJob, (Array.isArray(selectedSets) ? selectedSets : []).map((set) => ({
              evaluationSetId: set.id,
              evaluationSetName: set.name,
              status: "blocked",
            })), "completed");
          }
          const references = [];
          for (const set of Array.isArray(selectedSets) ? selectedSets : []) {
            const beforeRun = getPlaygroundFineTuningRunById(set, set.fineTuningRunId || set.fine_tuning_run_id)
              || getPlaygroundFineTuningLatestRun(set);
            const evaluator = set?.evaluator && typeof set.evaluator === "object" && !Array.isArray(set.evaluator)
              ? { ...set.evaluator }
              : { type: "exact", agentId: "", code: "" };
            if (String(evaluator.type || "").trim() === "agent" && !normalizePlaygroundFineTuningString(evaluator.agentId)) {
              evaluator.agentId = normalizePlaygroundFineTuningString(targetAgent?.id);
            }
            const runRequestOptions = {
              id: createPlaygroundFineTuningId("eval_run"),
              label: "Fine-Tune Verification",
              fineTuningJobId: normalizedJob.id,
              fine_tuning_job_id: normalizedJob.id,
              evaluationVersionId: normalizePlaygroundFineTuningString(set.activeVersionId),
              evaluationVersionNumber: Math.max(0, Number(set.activeVersionNumber || 0) || 0),
              evaluationVersionLabel: normalizePlaygroundFineTuningString(set.activeVersionLabel),
              targetAgentId: normalizePlaygroundFineTuningString(targetAgent?.id),
              targetAgentName: normalizePlaygroundFineTuningString(targetAgent?.name || targetAgent?.label || targetAgent?.title || normalizedJob.agentName),
              targetAgentPhotoUrl: normalizePlaygroundFineTuningString(targetAgent?.photoUrl || targetAgent?.photoURL || targetAgent?.avatarUrl || targetAgent?.avatarURL || normalizedJob.agentPhotoUrl),
              targetAgentVersionId: versionId,
              targetAgentVersionNumber: Math.max(0, Number(version.version || version.versionNumber || version.version_number || 0) || 0),
              targetAgentVersionLabel: normalizePlaygroundFineTuningString(version.label || (version.version ? "Version " + version.version : "")),
              targetAgentVersionRevisionId: normalizePlaygroundFineTuningString(version.revisionId || version.revision_id),
              environmentType: "computer",
              environmentId: normalizePlaygroundFineTuningString(selectedEnvironment?.id),
              environmentName: normalizePlaygroundFineTuningString(selectedEnvironment?.name || selectedEnvironment?.label || selectedEnvironment?.title || normalizedJob.environmentName),
              projectId: "",
              projectName: "",
              evaluator,
              passThreshold: set.passThreshold,
              metadata: {
                fineTuningJobId: normalizedJob.id,
                fine_tuning_job_id: normalizedJob.id,
              },
            };
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
                  evaluationSet: {
                    ...set,
                    targetAgentId: runRequestOptions.targetAgentId,
                    environmentType: "computer",
                    environmentId: runRequestOptions.environmentId,
                    projectId: "",
                    evaluator,
                  },
                  runOptions: runRequestOptions,
                }),
              });
              const data = await readFineTuningJsonResponse(response, "Failed to start verification run.");
              const run = normalizeFineTuningEvaluationRun({
                ...runRequestOptions,
                ...(data?.run || data?.data || data || {}),
              });
              upsertFineTuningEvaluationRun(set.id, run);
              references.push({
                evaluationSetId: set.id,
                evaluationSetName: set.name,
                beforeRunId: beforeRun?.id || "",
                beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
                beforeScore: getFineTuningEvaluationRunScore(beforeRun),
                afterRunId: run.id,
                afterRunLabel: run.label || "Verification Run",
                afterScore: getFineTuningEvaluationRunScore(run),
                afterCostUsd: getFineTuningEvaluationRunCostUsd(run),
                status: run.status || "queued",
              });
              if (run.id) {
                scheduleFineTuningVerificationPoll(normalizedJob.id, set.id, run.id);
              }
            } catch (error) {
              references.push({
                evaluationSetId: set.id,
                evaluationSetName: set.name,
                beforeRunId: beforeRun?.id || "",
                beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
                beforeScore: getFineTuningEvaluationRunScore(beforeRun),
                afterRunId: "",
                afterRunLabel: "",
                afterScore: 0,
                status: "error",
              });
            }
          }
          return mergeFineTuningVerificationReferences(normalizedJob, references);
        }

        async function publishFineTunedAgentVersion(job, version, snapshot) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedVersion = version && typeof version === "object" && !Array.isArray(version) ? version : {};
          const versionId = normalizePlaygroundFineTuningString(normalizedVersion.id || normalizedVersion.versionId || normalizedVersion.version_id);
          if (!backendUrl || !normalizedJob.agentId || !versionId) {
            return normalizedVersion;
          }
          const safeSnapshot = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
            ? preservePlaygroundFineTuningAgentName(normalizedJob, snapshot)
            : null;
          const response = await fetch(String(backendUrl).replace(/\/+$/, "") + "/agents/" + encodeURIComponent(normalizedJob.agentId) + "/versions/" + encodeURIComponent(versionId) + "/publish", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...(requestHeaders || {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(safeSnapshot ? { snapshot: safeSnapshot } : {}),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to publish fine-tuned agent version.");
          }
          const publishedVersion = data?.version || data?.data || data?.item || data;
          return {
            ...normalizedVersion,
            ...(publishedVersion && typeof publishedVersion === "object" && !Array.isArray(publishedVersion) ? publishedVersion : {}),
            id: normalizePlaygroundFineTuningString(publishedVersion?.id || versionId),
            status: normalizePlaygroundFineTuningString(publishedVersion?.status || "published") || "published",
            snapshot: preservePlaygroundFineTuningAgentName(normalizedJob, publishedVersion?.snapshot || normalizedVersion.snapshot || safeSnapshot || {}),
            metadata: {
              ...readPlaygroundFineTuningPlainObject(normalizedVersion.metadata),
              ...readPlaygroundFineTuningPlainObject(publishedVersion?.metadata),
            },
            publishedAt: normalizePlaygroundFineTuningString(publishedVersion?.publishedAt || publishedVersion?.published_at || new Date().toISOString()),
            published_at: normalizePlaygroundFineTuningString(publishedVersion?.published_at || publishedVersion?.publishedAt || new Date().toISOString()),
          };
        }

        async function tryPersistFineTunedAgentVersion(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          if (!backendUrl || !normalizedJob.agentId || !normalizedJob.createdAgentVersion?.snapshot) {
            return normalizedJob;
          }
          if (isPlaygroundFineTuningAgentVersionReady(normalizedJob.agentVersionCreationStatus) && normalizePlaygroundFineTuningString(normalizedJob.createdAgentVersion?.id)) {
            const publishedVersion = await publishFineTunedAgentVersion(normalizedJob, normalizedJob.createdAgentVersion, normalizedJob.createdAgentVersion.snapshot);
            const nextJob = normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              agentVersionCreationStatus: "published",
              createdAgentVersion: {
                ...normalizedJob.createdAgentVersion,
                ...publishedVersion,
                status: "published",
              },
              updatedAt: new Date().toISOString(),
            });
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            return nextJob;
          }
          try {
            const snapshot = preservePlaygroundFineTuningAgentName(normalizedJob, normalizedJob.createdAgentVersion.snapshot);
            const response = await fetch(String(backendUrl).replace(/\/+$/, "") + "/agents/" + encodeURIComponent(normalizedJob.agentId) + "/versions", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...(requestHeaders || {}),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                label: normalizedJob.createdAgentVersion.label || "Fine-Tuned Version",
                description: normalizedJob.createdAgentVersion.description || "Generated by fine-tuning job " + normalizedJob.id,
                status: "published",
                source: "fine_tuning",
                fineTuningJobId: normalizedJob.id,
                snapshot,
                agent: {
                  id: normalizedJob.agentId,
                  agentId: normalizedJob.agentId,
                  name: normalizePlaygroundFineTuningString(normalizedJob.agentName || snapshot.name || "Agent") || "Agent",
                  description: snapshot.description || "",
                  model: snapshot.model || "",
                  instructions: snapshot.instructions || "",
                  enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : [],
                  guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : [],
                  guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : [],
                  promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : [],
                  invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : [],
                  metadata: snapshot.metadata || {},
                },
                metadata: {
                  fineTuningJobId: normalizedJob.id,
                  fine_tuning_job_id: normalizedJob.id,
                  fineTuningJobName: normalizedJob.name,
                  fine_tuning_job_name: normalizedJob.name,
                  fineTuningCreatedAt: normalizedJob.createdAt,
                  fine_tuning_created_at: normalizedJob.createdAt,
                  fineTuningUpdatedAt: normalizedJob.updatedAt,
                  fine_tuning_updated_at: normalizedJob.updatedAt,
                  fineTuningStatus: normalizedJob.status,
                  fine_tuning_status: normalizedJob.status,
                  threadId: normalizedJob.threadId,
                  thread_id: normalizedJob.threadId,
                  fineTuningThreadId: normalizedJob.threadId,
                  fine_tuning_thread_id: normalizedJob.threadId,
                  threadTitle: normalizedJob.threadTitle,
                  thread_title: normalizedJob.threadTitle,
                  targetAgentId: normalizedJob.agentId,
                  target_agent_id: normalizedJob.agentId,
                  targetAgentName: normalizedJob.agentName,
                  target_agent_name: normalizedJob.agentName,
                  targetAgentPhotoUrl: normalizedJob.agentPhotoUrl,
                  target_agent_photo_url: normalizedJob.agentPhotoUrl,
                  fineTunerAgentId: normalizedJob.fineTunerAgentId,
                  fine_tuner_agent_id: normalizedJob.fineTunerAgentId,
                  fineTunerAgentName: normalizedJob.fineTunerAgentName,
                  fine_tuner_agent_name: normalizedJob.fineTunerAgentName,
                  fineTunerAgentPhotoUrl: normalizedJob.fineTunerAgentPhotoUrl,
                  fine_tuner_agent_photo_url: normalizedJob.fineTunerAgentPhotoUrl,
                  environmentId: normalizedJob.environmentId,
                  environment_id: normalizedJob.environmentId,
                  environmentName: normalizedJob.environmentName,
                  environment_name: normalizedJob.environmentName,
                  beforeScore: normalizedJob.beforeScore,
                  before_score: normalizedJob.beforeScore,
                  afterScore: normalizedJob.afterScore,
                  after_score: normalizedJob.afterScore,
                  improvementScore: normalizedJob.improvementScore,
                  improvement_score: normalizedJob.improvementScore,
                  costUsd: normalizedJob.costUsd,
                  cost_usd: normalizedJob.costUsd,
                  fineTuningCostUsd: normalizedJob.fineTuningCostUsd,
                  fine_tuning_cost_usd: normalizedJob.fineTuningCostUsd,
                  verificationCostUsd: normalizedJob.verificationCostUsd,
                  verification_cost_usd: normalizedJob.verificationCostUsd,
                  evaluationSetIds: normalizedJob.evaluationSets.map((set) => set.id),
                  evaluation_set_ids: normalizedJob.evaluationSets.map((set) => set.id),
                  evaluationRuns: normalizedJob.evaluationRuns,
                  evaluation_runs: normalizedJob.evaluationRuns,
                  conductedBy: normalizedJob.conductedBy,
                  conducted_by: normalizedJob.conductedBy,
                  createdBy: normalizedJob.createdBy,
                  created_by: normalizedJob.createdBy,
                  beforeAgentSnapshot: normalizedJob.beforeAgentSnapshot,
                  before_agent_snapshot: normalizedJob.beforeAgentSnapshot,
                },
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Version API unavailable.");
            }
            const version = data?.version || data?.data || data?.item || data;
            const publishedVersion = await publishFineTunedAgentVersion(normalizedJob, version, snapshot);
            const nextJob = normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              agentVersionCreationStatus: "published",
              createdAgentVersion: {
                ...normalizedJob.createdAgentVersion,
                ...(publishedVersion && typeof publishedVersion === "object" && !Array.isArray(publishedVersion) ? publishedVersion : {}),
                status: "published",
              },
              updatedAt: new Date().toISOString(),
            });
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            notifyFineTunedAgentVersionCreated(nextJob, nextJob.createdAgentVersion);
            return nextJob;
          } catch (error) {
            return normalizePlaygroundFineTuningJob({
              ...normalizedJob,
              status: "error",
              agentVersionCreationStatus: "error",
              agentVersionError: error?.message || String(error),
              createdAgentVersion: {
                ...(normalizedJob.createdAgentVersion || {}),
                status: "error",
                error: error?.message || String(error),
              },
            });
          }
        }

        async function handleCreateFineTuningJob(event) {
          event?.preventDefault?.();
          if (createBusy) return;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedSets = normalizedEvaluationSets
            .filter((set) => selectedSetIds.includes(set.id))
            .map((set) => {
              const latestRun = getPlaygroundFineTuningLatestRun(set);
              const selectedRunId = normalizePlaygroundFineTuningString(selectedRunIds[set.id] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
              const selectedRun = getPlaygroundFineTuningRunById(set, selectedRunId) || latestRun || null;
              return {
                ...set,
                fineTuningRunId: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRunId),
                fine_tuning_run_id: normalizePlaygroundFineTuningString(selectedRun?.id || selectedRunId),
                selectedRun,
                selected_run: selectedRun,
              };
            });
          const fineTunerAgent = normalizedAgents.find((agent) => agent.id === form.agentId) || normalizedAgents[0] || null;
          const selectedEnvironment = normalizedEnvironments.find((environment) => environment.id === form.environmentId) || normalizedEnvironments[0] || null;
          const targetResolution = resolveFineTuningTargetAgentForSelectedSets(selectedSets);
          const targetAgent = targetResolution.targetAgent;
          if (!fineTunerAgent?.id) {
            setCreateError("Select a fine-tuner agent.");
            return;
          }
          if (!selectedEnvironment?.id) {
            setCreateError("Select a computer.");
            return;
          }
          if (!selectedSets.length) {
            setCreateError("Select at least one evaluation set.");
            return;
          }
          if (targetResolution.error || !targetAgent?.id) {
            setCreateError(targetResolution.error || "Run an evaluation first so fine-tuning can identify the target agent.");
            return;
          }
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            setCreateError("Fine-tuning backend is unavailable.");
            return;
          }
          const jobId = createPlaygroundFineTuningId();
          const jobName = normalizePlaygroundFineTuningString(form.name || formatPlaygroundFineTuningDefaultJobName());
          const optimisticJob = buildOptimisticFineTuningJob({
            jobId,
            name: jobName,
            selectedSets,
            targetAgent,
            fineTunerAgent,
            selectedEnvironment,
            instructions: String(form.instructions || ""),
            conductedBy: currentFineTuningUser,
          });
          setCreateBusy(true);
          setCreateError("");
          upsertFineTuningJob(optimisticJob);
          closeCreateModal({ animate: true, force: true });
          setCreateBusy(false);
          void (async () => {
          try {
            const response = await fetch(normalizedBackendUrl + "/fine-tuning/jobs", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...(requestHeaders || {}),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: jobId,
                name: jobName,
                agent: targetAgent,
                targetAgent,
                fineTunerAgent,
                environment: selectedEnvironment,
                evaluationSets: selectedSets,
                instructions: String(form.instructions || ""),
                verifyAfter: true,
                nextAgentVersionNumber: getFineTuningNextAgentVersionNumber(targetAgent),
                conductedBy: currentFineTuningUser,
                createdBy: currentFineTuningUser,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to start fine-tuning job.");
            }
            const runtimeJob = normalizePlaygroundFineTuningJob(data?.job || data?.data || data);
            patchFineTuningJob(jobId, () => runtimeJob);
            notifyFineTuningThreadStarted(runtimeJob);
            const completedRuntimeJob = isFineTuningRuntimeJobComplete(runtimeJob)
              ? runtimeJob
              : await waitForFineTuningRuntimeJob(jobId, runtimeJob);
            if (!isFineTuningRuntimeJobComplete(completedRuntimeJob)) {
              patchFineTuningJob(jobId, () => completedRuntimeJob);
              return;
            }
            const completedRuntimeStatus = normalizePlaygroundFineTuningString(completedRuntimeJob.status).toLowerCase();
            if (new Set(["cancelled", "canceled"]).has(completedRuntimeStatus)) {
              patchFineTuningJob(jobId, () => buildStoppedFineTuningJob(completedRuntimeJob), { persist: true });
              return;
            }
            if (new Set(["error", "failed"]).has(completedRuntimeStatus)) {
              throw new Error(completedRuntimeJob.error || completedRuntimeJob.agentVersionError || completedRuntimeJob.createdAgentVersion?.error || "Fine-tuning job failed.");
            }
            if (typeof onAgentsRefresh === "function") {
              await onAgentsRefresh();
            }
            const runtimeVerificationAlreadyHandled = completedRuntimeJob.evaluationRuns.some((reference) => {
              const status = normalizePlaygroundFineTuningString(reference?.status).toLowerCase();
              return Boolean(reference?.afterRunId || reference?.after_run_id)
                || (status && status !== "pending" && status !== "not_run");
            });
            if (runtimeVerificationAlreadyHandled) {
              upsertFineTuningJob(completedRuntimeJob, { persist: true });
              notifyFineTuningThreadStarted(completedRuntimeJob);
              return;
            }
            const persistedJob = await tryPersistFineTunedAgentVersion(completedRuntimeJob);
            patchFineTuningJob(jobId, () => persistedJob, { persist: true });
            const verifiedJob = isPlaygroundFineTuningAgentVersionReady(persistedJob.agentVersionCreationStatus)
              ? await startFineTuningVerificationRuns(persistedJob, selectedSets, targetAgent, selectedEnvironment)
              : normalizePlaygroundFineTuningJob({
                  ...persistedJob,
                  status: "error",
                  error: persistedJob.agentVersionError || persistedJob.createdAgentVersion?.error || "Fine-tuning finished, but no agent version was created.",
                });
            upsertFineTuningJob(verifiedJob, { persist: true });
            notifyFineTuningThreadStarted(verifiedJob);
          } catch (error) {
            const message = error?.message || String(error);
            patchFineTuningJob(jobId, (currentJob) => normalizePlaygroundFineTuningJob({
              ...currentJob,
              status: "error",
              error: message,
              analysisSummary: currentJob.analysisSummary || message,
              agentVersionCreationStatus: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionCreationStatus : "error",
              agentVersionError: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionError : message,
              createdAgentVersion: isPlaygroundFineTuningAgentVersionReady(currentJob.agentVersionCreationStatus)
                ? currentJob.createdAgentVersion
                : {
                    ...(currentJob.createdAgentVersion || {}),
                    status: "error",
                    error: message,
                },
              updatedAt: new Date().toISOString(),
            }), { persist: true });
          }
          })();
        }

        function openJob(jobId) {
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          const recoveredJob = scoredJobs.find((job) => job.id === normalizedJobId) || displaySourceJobs.find((job) => job.id === normalizedJobId) || null;
          if (recoveredJob && !(Array.isArray(fineTuningJobs) ? fineTuningJobs : []).some((job) => normalizePlaygroundFineTuningJob(job).id === normalizedJobId)) {
            upsertFineTuningJob(recoveredJob);
            return;
          }
          if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId(normalizedJobId);
          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("detail");
        }

        function deleteJob(jobId) {
          if (typeof setFineTuningJobs !== "function") return;
          const normalizedJobId = normalizePlaygroundFineTuningString(jobId);
          setFineTuningJobs((current) => (Array.isArray(current) ? current : []).filter((job) => normalizePlaygroundFineTuningJob(job).id !== normalizedJobId));
          if (selectedFineTuningJobId === normalizedJobId) {
            if (typeof setSelectedFineTuningJobId === "function") setSelectedFineTuningJobId("");
            if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("overview");
          }
          setRowMenuId("");
          const normalizedBackendUrl = normalizePlaygroundFineTuningString(backendUrl).replace(/\/+$/, "");
          if (normalizedBackendUrl && normalizedJobId) {
            void fetch(normalizedBackendUrl + "/fine-tuning/jobs/" + encodeURIComponent(normalizedJobId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders || {},
            }).catch(() => {});
          }
        }

        function renderScoreChip(job) {
          const normalizedJob = normalizePlaygroundFineTuningJob(job);
          const normalizedStatus = normalizePlaygroundFineTuningString(normalizedJob.status).toLowerCase();
          const hasAfter = hasPlaygroundFineTuningAfterResult(normalizedJob);
          const isError = new Set(["error", "failed", "cancelled", "canceled"]).has(normalizedStatus);
          const isActive = isPlaygroundFineTuningActiveStatus(normalizedStatus);
          const afterLabel = hasAfter
              ? formatPlaygroundFineTuningPercent(normalizedJob.afterScore)
              : isError
                ? "Error"
                : isActive
                ? "Running"
                : "Pending";
          return React.createElement("span", { className: "playground-fine-tuning-score-chip" },
            React.createElement("span", null, formatPlaygroundFineTuningPercent(normalizedJob.beforeScore)),
            React.createElement("span", { "aria-hidden": "true" }, "->"),
            React.createElement("span", null, afterLabel),
            hasAfter && !isError ? React.createElement("span", { className: "is-improvement" }, "+" + Math.round(normalizedJob.improvementScore * 100)) : null
          );
        }

        function renderStatus(job) {
          const status = normalizePlaygroundFineTuningString(job?.status || "completed").toLowerCase();
          const label = status === "completed" ? "Completed" : status === "running" ? "Running" : status === "verifying" ? "Verifying" : status === "queued" ? "Queued" : status === "error" ? "Error" : status || "Draft";
          return React.createElement("span", { className: "playground-fine-tuning-status-pill is-" + status }, label);
        }

        function renderOverview() {
          const sortOptions = [
            { id: "updated-desc", label: "Recently updated", description: "Newest jobs first." },
            { id: "name-asc", label: "Name", description: "Alphabetical by job name." },
            { id: "improvement-desc", label: "Best improvement", description: "Highest score lift first." },
            { id: "sets-desc", label: "Evaluation sets", description: "Most evaluation sets first." },
          ];
          const filterOptions = [
            { id: "all", label: "All jobs", description: "Show every fine-tuning job." },
            { id: "completed", label: "Completed", description: "Finished jobs only." },
            { id: "running", label: "Running", description: "Currently running jobs." },
            { id: "verifying", label: "Verifying", description: "Jobs running verification." },
            { id: "with-improvement", label: "With improvement", description: "Jobs with a measured score lift." },
          ];
          const sortMode = sortOptions.some((option) => option.id === fineTuningSortMode) ? fineTuningSortMode : "updated-desc";
          const filterMode = filterOptions.some((option) => option.id === fineTuningFilterMode) ? fineTuningFilterMode : "all";
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const visibleJobs = filteredJobs
            .filter((job) => {
              const status = normalizePlaygroundFineTuningString(job?.status || "completed").toLowerCase();
              if (filterMode === "completed") return status === "completed";
              if (filterMode === "running") return status === "running";
              if (filterMode === "verifying") return status === "verifying";
              if (filterMode === "with-improvement") return Number(job?.improvementScore || 0) > 0;
              return true;
            })
            .sort((left, right) => {
              if (sortMode === "name-asc") {
                return String(left?.name || "").localeCompare(String(right?.name || ""));
              }
              if (sortMode === "improvement-desc") {
                return (Number(right?.improvementScore || 0) || 0) - (Number(left?.improvementScore || 0) || 0);
              }
              if (sortMode === "sets-desc") {
                return (Array.isArray(right?.evaluationSets) ? right.evaluationSets.length : 0) - (Array.isArray(left?.evaluationSets) ? left.evaluationSets.length : 0);
              }
              return (Date.parse(String(right?.updatedAt || "")) || 0) - (Date.parse(String(left?.updatedAt || "")) || 0);
            });
          const hasFilters = Boolean(normalizedQuery || filterMode !== "all");
          const closeToolbarPopover = () => setFineTuningToolbarPopover("");
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
          function renderFineTuningJobRow(job) {
            function renderIdentityCell(label, photoUrl) {
              const resolvedLabel = normalizePlaygroundFineTuningString(label) || "-";
              if (resolvedLabel === "-") {
                return React.createElement("span", { className: "playground-evaluations-run-cell-label" }, "-");
              }
              return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: resolvedLabel },
                React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
                  photoUrl
                    ? React.createElement("img", { src: photoUrl, alt: "" })
                    : getPlaygroundFineTuningInitials(resolvedLabel)
                ),
                React.createElement("span", { className: "playground-evaluations-run-cell-label" }, resolvedLabel)
              );
            }
            function renderAgentCell() {
              const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId)) || null;
              const label = normalizePlaygroundFineTuningString(job.agentName || job.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
              const photoUrl = normalizePlaygroundFineTuningString(job.agentPhotoUrl || job.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
              return renderIdentityCell(label, photoUrl);
            }
            function renderConductorCell() {
              const explicitConductor = normalizePlaygroundFineTuningPersonIdentity(job.conductedBy || job.createdBy || job.created_by || {});
              const conductor = getPlaygroundFineTuningPersonLabel(explicitConductor) ? explicitConductor : currentFineTuningUser;
              return renderIdentityCell(getPlaygroundFineTuningPersonLabel(conductor), conductor.avatarUrl);
            }
            return React.createElement("div", {
                key: job.id,
                className: "playground-project-overview-threads-table-row",
                role: "button",
                tabIndex: 0,
                onClick: () => openJob(job.id),
                onKeyDown: (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openJob(job.id);
                },
              },
              React.createElement("div", { className: "playground-project-overview-thread-cell is-run", title: job.name },
                React.createElement("div", { className: "playground-guardrails-set-copy" },
                  React.createElement("div", { className: "playground-plugin-row-title" }, job.name)
                )
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-triggered-by", title: job.agentName },
                renderAgentCell()
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-source" },
                job.evaluationSets.length + " " + (job.evaluationSets.length === 1 ? "set" : "sets")
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-score" },
                renderScoreChip(job)
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-creator" },
                renderConductorCell()
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-actions" },
                React.createElement("div", {
                    className: "playground-tasks-toolbar-popup-shell",
                    onClick: (event) => event.stopPropagation(),
                  },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-thread-menu-button" + (rowMenuId === job.id ? " is-active" : ""),
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setRowMenuId((current) => current === job.id ? "" : job.id);
                    },
                    "aria-label": "Fine-tuning job actions",
                    "aria-expanded": rowMenuId === job.id ? "true" : "false",
                  }, React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.8 })),
                  rowMenuId === job.id
                    ? React.createElement("div", {
                        className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                        onClick: (event) => event.stopPropagation(),
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setRowMenuId("");
                            openJob(job.id);
                          },
                        },
                          React.createElement(ExternalLink, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Open")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => deleteJob(job.id),
                        },
                          React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Delete")
                          )
                        )
                      )
                    : null
                )
              )
            );
          }
          return React.createElement("div", { className: "playground-guardrails-layout playground-evaluations-overview-layout" },
            React.createElement("div", { className: "playground-guardrails-list-panel" },
              React.createElement("section", {
                  className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-evaluations-overview-section",
                },
                React.createElement("div", { className: "playground-plugins-search-row" },
                  React.createElement("div", { className: "playground-plugins-search-shell" },
                    React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("input", {
                      type: "search",
                      value: fineTuningSearchQuery || "",
                      onChange: (event) => typeof setFineTuningSearchQuery === "function" ? setFineTuningSearchQuery(event.target.value) : undefined,
                      className: "playground-plugins-search",
                      placeholder: "Search fine-tuning jobs",
                      "aria-label": "Search fine-tuning jobs",
                    })
                  ),
                  React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-sort" + (fineTuningToolbarPopover === "sort" || sortMode !== "updated-desc" ? " is-active" : ""),
                        onClick: () => {
                          setRowMenuId("");
                          setFineTuningToolbarPopover((current) => current === "sort" ? "" : "sort");
                        },
                        title: activeSortOption.label,
                      },
                        React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Sort")
                      ),
                      fineTuningToolbarPopover === "sort"
                        ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            sortOptions.map((option) => renderToolbarOption({
                              option,
                              active: sortMode === option.id,
                              onClick: () => {
                                setFineTuningSortMode(option.id);
                                closeToolbarPopover();
                              },
                            }))
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-control-button is-bare is-backlog-filter" + (fineTuningToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                        onClick: () => {
                          setRowMenuId("");
                          setFineTuningToolbarPopover((current) => current === "filter" ? "" : "filter");
                        },
                        title: activeFilterOption.label,
                      },
                        React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Filter")
                      ),
                      fineTuningToolbarPopover === "filter"
                        ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                            filterOptions.map((option) => renderToolbarOption({
                              option,
                              active: filterMode === option.id,
                              onClick: () => {
                                setFineTuningFilterMode(option.id);
                                closeToolbarPopover();
                              },
                            }))
                          )
                        : null
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-library-new-button playground-evaluations-overview-create-button",
                    onClick: openCreateModal,
                  },
                    React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Fine-Tune")
                  )
                ),
                fineTuningJobsLoading && scoredJobs.length === 0
                  ? React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Loading fine-tuning jobs...")
                  : visibleJobs.length > 0
                  ? React.createElement("div", { className: "playground-project-overview-threads-table playground-evaluations-runs-table playground-evaluations-overview-table" },
                      React.createElement("div", { className: "playground-project-overview-threads-table-header" },
                        React.createElement("div", null, "Job"),
                        React.createElement("div", null, "Agent"),
                        React.createElement("div", null, "Sets"),
                        React.createElement("div", null, "Improvement"),
                        React.createElement("div", null, "Conducted by"),
                        React.createElement("div", null)
                      ),
                      React.createElement("div", { className: "playground-project-overview-thread-list" },
                        visibleJobs.map((job) => renderFineTuningJobRow(job))
                      )
                    )
                  : scoredJobs.length === 0
                    ? React.createElement("div", { className: "playground-guardrails-empty" },
                        React.createElement("div", { className: "playground-guardrails-empty-icon" }, React.createElement(TestTubeDiagonal, { width: 18, height: 18, strokeWidth: 1.8 })),
                        React.createElement("div", { className: "playground-guardrails-empty-title" }, "No fine-tuning jobs yet"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-library-new-button playground-guardrails-empty-button",
                          onClick: openCreateModal,
                        }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }), "Fine-Tune")
                      )
                    : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                        hasFilters ? "No matching fine-tuning jobs." : "No fine-tuning jobs yet."
                      )
              )
            )
          );
        }

        function renderKpiCard(job) {
          const hasAfter = hasPlaygroundFineTuningAfterResult(job);
          const afterScore = hasAfter ? job.afterScore : job.beforeScore;
          const improvement = hasAfter ? Math.max(0, afterScore - job.beforeScore) : 0;
          const metrics = [
            { id: "before", label: "Before", value: formatPlaygroundFineTuningPercent(job.beforeScore) },
            { id: "after", label: "After", value: hasAfter ? formatPlaygroundFineTuningPercent(job.afterScore) : "Pending" },
            { id: "improvement", label: "Improvement", value: hasAfter ? "+" + Math.round(improvement * 100) : "Not run" },
            { id: "cost", label: "Cost", value: formatPlaygroundFineTuningUsdCost(job.costUsd) },
          ];
          const agent = normalizedAgents.find((item) => normalizePlaygroundFineTuningString(item?.id) === normalizePlaygroundFineTuningString(job.targetAgentId || job.agentId)) || null;
          const agentName = normalizePlaygroundFineTuningString(job.agentName || job.targetAgentName || agent?.name || agent?.label || agent?.title || "Agent");
          const agentPhotoUrl = normalizePlaygroundFineTuningString(job.agentPhotoUrl || job.targetAgentPhotoUrl || agent?.photoUrl || agent?.photoURL || agent?.avatarUrl || agent?.avatarURL);
          const computerName = normalizePlaygroundFineTuningString(job.environmentName || "Computer");
          const threadId = normalizePlaygroundFineTuningString(job.threadId);
          const handleDownload = () => {
            if (typeof document === "undefined") return;
            const canvas = document.querySelector(".playground-fine-tuning-progress-combo-canvas");
            if (!canvas || typeof canvas.toDataURL !== "function") return;
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "fine-tuning-analytics.png";
            link.click();
          };
          return React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card playground-fine-tuning-kpi-card" },
            React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
              React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Analytics"),
              React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-progress-combo-download",
                  onClick: handleDownload,
                  title: "Download chart",
                  "aria-label": "Download fine-tuning analytics chart",
                }, React.createElement(Download, { width: 15, height: 15, strokeWidth: 1.8 }))
              )
            ),
            React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
              metrics.map((item) =>
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
              React.createElement(PlaygroundFineTuningPerformanceChart, { job })
            ),
            React.createElement("div", { className: "playground-fine-tuning-analytics-footer" },
              React.createElement("div", { className: "playground-fine-tuning-analytics-agent", title: agentName + " on " + computerName },
                React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
                  agentPhotoUrl
                    ? React.createElement("img", { src: agentPhotoUrl, alt: "" })
                    : getPlaygroundFineTuningInitials(agentName)
                ),
                React.createElement("span", { className: "playground-fine-tuning-analytics-agent-main" }, agentName),
                React.createElement("span", { className: "playground-fine-tuning-analytics-agent-meta" }, "on " + computerName)
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-fine-tuning-thread-link",
                onClick: () => {
                  if (threadId && typeof onOpenThread === "function") onOpenThread(threadId);
                },
                disabled: !threadId || typeof onOpenThread !== "function",
                title: threadId || "Fine-tune thread is not available yet",
              }, threadId || "Thread pending")
            )
          );
        }

        function renderJobDetails(job) {
          const version = job.createdAgentVersion || {};
          const versionStatus = normalizePlaygroundFineTuningString(job.agentVersionCreationStatus || version.status || "pending").toLowerCase();
          const versionStatusLabel = versionStatus === "saved"
            ? "Version saved"
            : versionStatus === "pending" || versionStatus === "running"
              ? "Creating version"
              : versionStatus === "error"
                ? "Version failed"
                : "Version pending";
          const versionValue = version.version
            ? "Version " + version.version
            : versionStatus === "saved"
              ? "Saved"
              : versionStatus === "error"
                ? "Failed"
                : "Pending";
          const versionError = normalizePlaygroundFineTuningString(job.agentVersionError || version.error);
          const facts = [
            ["Agent", job.agentName],
            ["Computer", job.environmentName],
            ["Thread", job.threadId || "-"],
            ["Version", versionValue],
            ["Status", versionStatusLabel],
            ["Created", formatPlaygroundFineTuningDateTime(job.createdAt)],
          ];
          if (versionError) {
            facts.push(["Version Error", versionError]);
          }
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Job Details")
              )
            ),
            React.createElement("div", { className: "playground-evaluations-cases-table playground-fine-tuning-detail-table" },
              React.createElement("div", { className: "playground-evaluations-cases-table-inner" },
                React.createElement("div", { className: "playground-evaluations-cases-header" },
                  React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Field"),
                  React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Value")
                ),
                React.createElement("div", { className: "playground-evaluations-cases-list" },
                  facts.map(([label, value]) =>
                    React.createElement("div", { key: label, className: "playground-evaluations-cases-row" },
                      React.createElement("div", { className: "playground-evaluations-cases-cell" }, label),
                      React.createElement("div", { className: "playground-evaluations-cases-cell playground-fine-tuning-detail-value", title: String(value || "") },
                        label === "Thread" && job.threadId && typeof onOpenThread === "function"
                          ? React.createElement("button", {
                              type: "button",
                              className: "playground-fine-tuning-reference-link",
                              onClick: () => onOpenThread(job.threadId),
                              title: job.threadId,
                            }, job.threadId)
                          : value
                      )
                    )
                  )
                )
              )
            )
          );
        }

        function renderEvaluationRunReferences(job) {
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section",
            },
            React.createElement("div", { className: "playground-plugins-section-header" },
              React.createElement("div", { className: "playground-plugins-section-copy" },
                React.createElement("h3", { className: "playground-plugins-section-title" }, "Evaluation Runs")
              )
            ),
            job.evaluationRuns.length
              ? React.createElement("div", { className: "playground-evaluations-cases-table playground-fine-tuning-reference-table" },
                  React.createElement("div", { className: "playground-evaluations-cases-table-inner" },
                    React.createElement("div", { className: "playground-evaluations-cases-header" },
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Evaluation"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Before"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "After"),
                      React.createElement("div", { className: "playground-evaluations-cases-header-cell" }, "Delta")
                    ),
                    React.createElement("div", { className: "playground-evaluations-cases-list" },
                      job.evaluationRuns.map((reference) =>
                        React.createElement("div", { key: reference.evaluationSetId, className: "playground-evaluations-cases-row" },
                          React.createElement("div", { className: "playground-evaluations-cases-cell is-thread", title: reference.evaluationSetName }, reference.evaluationSetName),
                          React.createElement("div", { className: "playground-evaluations-cases-cell" },
                            reference.beforeRunId && typeof onOpenEvaluationRun === "function"
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-fine-tuning-reference-link",
                                  onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.beforeRunId, {
                                    page: "fine-tuning",
                                    fineTuneJobId: job.id,
                                  }),
                                }, reference.beforeRunLabel || reference.beforeRunId)
                              : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.beforeRunLabel || "-")
                          ),
                          React.createElement("div", { className: "playground-evaluations-cases-cell" },
                            reference.afterRunId && typeof onOpenEvaluationRun === "function"
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-fine-tuning-reference-link",
                                  onClick: () => onOpenEvaluationRun(reference.evaluationSetId, reference.afterRunId, {
                                    page: "fine-tuning",
                                    fineTuneJobId: job.id,
                                  }),
                                }, reference.afterRunLabel || reference.afterRunId)
                              : React.createElement("span", { className: "playground-guardrails-table-muted" }, reference.status === "not_run" ? "Not run" : (reference.afterRunLabel || "-"))
                          ),
                          React.createElement("div", { className: "playground-evaluations-cases-cell is-score" },
                            !hasPlaygroundFineTuningAfterResult({ status: job.status, evaluationRuns: [reference] })
                              ? "-"
                              : "+" + Math.max(0, Math.round((reference.afterScore - reference.beforeScore) * 100)) + " pts"
                          )
                        )
                      )
                    )
                  )
                )
              : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No evaluation runs captured.")
          );
        }

        function renderFineTuningDetailTabs() {
          const tabs = [
            { id: "analysis", label: "Analysis" },
            { id: "changes", label: "Agent Changes" },
          ];
          return React.createElement("div", { className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs playground-fine-tuning-detail-tabs", role: "tablist", "aria-label": "Fine-tuning details tabs" },
            React.createElement("div", { className: "playground-project-overview-chart-tabs" },
              tabs.map((tab) =>
                React.createElement("button", {
                  key: tab.id,
                  type: "button",
                  role: "tab",
                  "aria-selected": fineTuningDetailTab === tab.id ? "true" : "false",
                  className: "playground-project-overview-chart-tab" + (fineTuningDetailTab === tab.id ? " is-active" : ""),
                  onClick: () => setFineTuningDetailTab(tab.id),
                }, tab.label)
              )
            )
          );
        }

        function renderAnalysis(analysisSummary) {
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section playground-fine-tuning-analysis-section playground-fine-tuning-tab-panel",
            },
            analysisSummary
              ? (
                  typeof PlaygroundTaskDescriptionMarkdown === "function"
                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: analysisSummary,
                        className: "playground-fine-tuning-analysis-content tb-message-markdown",
                      })
                    : React.createElement("div", { className: "playground-fine-tuning-analysis-content tb-message-markdown" }, analysisSummary)
                )
              : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No analysis captured.")
          );
        }

        function renderDiff(job, options = {}) {
          const files = buildPlaygroundFineTuningDiffFiles(job);
          const showHeader = options.showHeader !== false;
          return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-evaluations-cases-section playground-fine-tuning-section playground-fine-tuning-tab-panel",
            },
            showHeader
              ? React.createElement("div", { className: "playground-plugins-section-header" },
                  React.createElement("div", { className: "playground-plugins-section-copy" },
                    React.createElement("h3", { className: "playground-plugins-section-title" }, "Agent Changes")
                  )
                )
              : null,
            files.length
              ? React.createElement("div", { className: "playground-fine-tuning-diff-list" },
                  files.map((file) =>
                    React.createElement("div", { key: file.id || file.filePath, className: "playground-version-changes-file-card" },
                      React.createElement(RunnerFileDiffSurface, {
                        filePath: file.filePath,
                        diffContent: file.diffContent || "",
                        fileContent: file.fileContent || file.afterContent || "",
                        additions: file.additions,
                        deletions: file.deletions,
                        emptyMessage: "No diff is available for this file.",
                      })
                    )
                  )
                )
              : React.createElement("div", { className: "playground-version-changes-empty" }, "No changes captured.")
          );
        }

        function renderDetail() {
          if (!selectedJob) {
            return renderOverview();
          }
          const job = normalizePlaygroundFineTuningJob(selectedJob);
          const analysisSummary = sanitizePlaygroundFineTuningAnalysisSummary(job.analysisSummary);
          return React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-detail playground-fine-tuning-detail" },
            React.createElement("div", { className: "playground-guardrails-editor" },
              renderKpiCard(job),
              renderEvaluationRunReferences(job),
              renderFineTuningDetailTabs(),
              fineTuningDetailTab === "changes"
                ? renderDiff(job, { showHeader: false })
                : renderAnalysis(analysisSummary)
            )
          );
        }

        function renderCreateModal() {
          if (!fineTuningCreateModalOpen && !modalClosing) return null;
          const form = fineTuningCreateForm && typeof fineTuningCreateForm === "object" ? fineTuningCreateForm : {};
          const selectedSetIds = Array.isArray(form.evaluationSetIds) ? form.evaluationSetIds.map(String) : [];
          const selectedRunIds = form.evaluationRunIds && typeof form.evaluationRunIds === "object" && !Array.isArray(form.evaluationRunIds)
            ? form.evaluationRunIds
            : {};
          const selectedEvaluationSets = normalizedEvaluationSets.filter((set) => selectedSetIds.includes(set.id));
          const canUndoInstructions = Array.isArray(fineTuningInstructionsHistory.past) && fineTuningInstructionsHistory.past.length > 0;
          const canRedoInstructions = Array.isArray(fineTuningInstructionsHistory.future) && fineTuningInstructionsHistory.future.length > 0;
          const renderInstructionsToolbarButton = (action) =>
            React.createElement("button", {
              key: action.id,
              type: "button",
              className: "playground-tasks-detail-format-button",
              title: action.label,
              "aria-label": action.label,
              disabled: Boolean(action.disabled || createBusy),
              onMouseDown: (event) => event.preventDefault(),
              onClick: action.onClick,
            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: action.strokeWidth || 1.8 }));
          const textFormatActions = [
            { id: "bold", label: "Bold", icon: Bold, strokeWidth: 2.7 },
            { id: "italic", label: "Italic", icon: Italic },
            { id: "underline", label: "Underline", icon: Underline },
          ];
          const listFormatActions = [
            { id: "list", label: "List", icon: List },
            { id: "ordered-list", label: "Ordered list", icon: ListOrdered },
          ];
          const insertFormatActions = [
            { id: "code", label: "Code", icon: CodeXml },
            { id: "link", label: "Link", icon: Link2 },
          ];
          const renderMarkdownPreview = () => {
            const content = String(form.instructions || "").trim();
            if (!content) {
              return React.createElement("div", {
                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
              }, "Add fine-tuning instructions here.");
            }
            return typeof PlaygroundTaskDescriptionMarkdown === "function"
              ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: form.instructions || "",
                  className: "playground-tasks-detail-description-preview tb-message-markdown",
                })
              : React.createElement("div", { className: "playground-tasks-detail-description-preview tb-message-markdown" }, form.instructions || "");
          };
          const toggleEvaluationSet = (setId) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            if (selectedSetIds.includes(normalizedSetId)) {
              const nextRunIds = { ...selectedRunIds };
              delete nextRunIds[normalizedSetId];
              updateCreateForm({
                evaluationSetIds: selectedSetIds.filter((id) => id !== normalizedSetId),
                evaluationRunIds: nextRunIds,
              });
              return;
            }
            const set = normalizedEvaluationSets.find((item) => item.id === normalizedSetId) || null;
            const latestRun = getPlaygroundFineTuningLatestRun(set);
            updateCreateForm({
              evaluationSetIds: Array.from(new Set([...selectedSetIds, normalizedSetId])),
              evaluationRunIds: {
                ...selectedRunIds,
                [normalizedSetId]: normalizePlaygroundFineTuningString(latestRun?.id || latestRun?.runId || latestRun?.run_id || ""),
              },
            });
          };
          const updateEvaluationSetRun = (setId, runId) => {
            const normalizedSetId = normalizePlaygroundFineTuningString(setId);
            if (!normalizedSetId) return;
            updateCreateForm({
              evaluationRunIds: {
                ...selectedRunIds,
                [normalizedSetId]: normalizePlaygroundFineTuningString(runId),
              },
            });
          };
          const getEvaluationSetMeta = (set) => {
            const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : Number(set?.caseCount || 0) || 0;
            const score = getPlaygroundFineTuningEvaluationScore(set);
            return caseCount + " " + (caseCount === 1 ? "case" : "cases") + " · " + formatPlaygroundFineTuningPercent(score);
          };
          const renderEvaluationSetPickerMenu = () =>
            React.createElement("div", {
                className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in playground-fine-tuning-evaluation-menu",
                onClick: (event) => event.stopPropagation(),
              },
              normalizedEvaluationSets.length
                ? normalizedEvaluationSets.map((set) => {
                    const checked = selectedSetIds.includes(set.id);
                    return React.createElement("button", {
                        key: set.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select" + (checked ? " selected" : ""),
                        onClick: () => toggleEvaluationSet(set.id),
                        "aria-pressed": checked ? "true" : "false",
                      },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        checked ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 }) : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, set.name || "Untitled Evaluation"),
                        React.createElement("span", { className: "playground-fine-tuning-evaluation-meta" }, getEvaluationSetMeta(set))
                      )
                    );
                  })
                : React.createElement("div", { className: "playground-fine-tuning-evaluation-menu-empty" }, "No evaluation sets available.")
            );
          return React.createElement("div", {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-create-modal-backdrop playground-fine-tuning-create-modal-backdrop"
                + (modalVisible ? " is-visible" : "")
                + (modalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeCreateModal,
            },
            React.createElement("form", {
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-create-modal playground-fine-tuning-create-modal"
                + (modalVisible ? " is-visible" : "")
                + (modalClosing ? " is-closing" : ""),
              onClick: (event) => event.stopPropagation(),
              onSubmit: handleCreateFineTuningJob,
            },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(TestTubeDiagonal, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-project-overview-outcome-editor-title-input",
                    value: form.name || "",
                    placeholder: "Fine-tune job name",
                    onChange: (event) => updateCreateForm({ name: event.target.value }),
                    autoFocus: true,
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeCreateModal(),
                  title: "Close",
                  "aria-label": "Close",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell playground-fine-tuning-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body playground-fine-tuning-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Fine-Tuner Agent"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: form.agentId || defaultAgentId || normalizedAgents[0]?.id || "",
                    onChange: (event) => updateCreateForm({ agentId: event.target.value }),
                  },
                    normalizedAgents.length
                      ? normalizedAgents.map((agent) => React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id))
                      : React.createElement("option", { value: "" }, "No agents available")
                  )
                ),
                React.createElement("label", { className: "playground-evaluations-field" },
                  React.createElement("span", null, "Computer"),
                  React.createElement("select", {
                    className: "playground-evaluations-select",
                    value: form.environmentId || defaultEnvironmentId || normalizedEnvironments[0]?.id || "",
                    onChange: (event) => updateCreateForm({ environmentId: event.target.value }),
                  },
                    normalizedEnvironments.length
                      ? normalizedEnvironments.map((environment) => React.createElement("option", { key: environment.id, value: environment.id }, environment.name || environment.label || environment.id))
                      : React.createElement("option", { value: "" }, "No computers available")
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor playground-fine-tuning-evaluation-picker" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Evaluation Sets"),
                    React.createElement("div", {
                        className: "playground-fine-tuning-evaluation-menu-shell playground-tasks-toolbar-popup-shell" + (evaluationSetPickerOpen ? " is-open" : ""),
                        ref: evaluationSetPickerRef,
                        onClick: (event) => event.stopPropagation(),
                      },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-mission-control-modal-outcome-add",
                        onClick: () => setEvaluationSetPickerOpen((current) => !current),
                        title: "Add evaluation sets",
                        "aria-label": "Add evaluation sets",
                        "aria-expanded": evaluationSetPickerOpen ? "true" : "false",
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 })),
                      evaluationSetPickerOpen ? renderEvaluationSetPickerMenu() : null
                    )
                  ),
                  React.createElement("div", { className: "playground-fine-tuning-evaluation-picker-body" },
                    React.createElement("div", { className: "playground-fine-tuning-evaluation-list playground-mission-control-modal-outcomes-list" },
                      selectedEvaluationSets.length
                        ? selectedEvaluationSets.map((set) => {
                            const runs = getPlaygroundFineTuningRuns(set);
                            const latestRun = getPlaygroundFineTuningLatestRun(set);
                            const selectedRunId = normalizePlaygroundFineTuningString(selectedRunIds[set.id] || latestRun?.id || latestRun?.runId || latestRun?.run_id || "");
                            return React.createElement("div", {
                                key: set.id,
                                role: "button",
                                tabIndex: 0,
                                className: "playground-fine-tuning-evaluation-option playground-mission-control-modal-outcome-row is-selected",
                                onClick: () => toggleEvaluationSet(set.id),
                                onKeyDown: (event) => {
                                  if (event.key !== "Enter" && event.key !== " ") return;
                                  event.preventDefault();
                                  toggleEvaluationSet(set.id);
                                },
                                "aria-pressed": "true",
                              },
                              React.createElement("div", { className: "playground-mission-control-modal-outcome-copy" },
                                React.createElement("span", { className: "playground-mission-control-modal-outcome-input playground-fine-tuning-evaluation-name" }, set.name || "Untitled Evaluation")
                              ),
                              React.createElement("select", {
                                  className: "playground-fine-tuning-evaluation-run-select",
                                  value: selectedRunId,
                                  disabled: !runs.length,
                                  onClick: (event) => event.stopPropagation(),
                                  onPointerDown: (event) => event.stopPropagation(),
                                  onChange: (event) => {
                                    event.stopPropagation();
                                    updateEvaluationSetRun(set.id, event.target.value);
                                  },
                                  "aria-label": "Fine-tune baseline run for " + (set.name || "evaluation set"),
                                },
                                runs.length
                                  ? runs.map((run) => React.createElement("option", { key: run.id, value: run.id }, run.label || run.id))
                                  : React.createElement("option", { value: "" }, "No runs")
                              ),
                              React.createElement("span", {
                                className: "playground-mission-control-modal-outcome-menu-trigger",
                                "aria-hidden": "true",
                              },
                                React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 })
                              )
                            );
                          })
                        : React.createElement("button", {
                            type: "button",
                            className: "playground-mission-control-modal-outcomes-empty",
                            onClick: () => setEvaluationSetPickerOpen(true),
                          }, normalizedEvaluationSets.length ? "Add evaluation sets" : "No evaluation sets available.")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description playground-agents-detail-instructions-section playground-fine-tuning-instructions-section" },
                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Instructions"),
                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      renderInstructionsToolbarButton({
                        id: "undo",
                        label: "Undo",
                        icon: Undo2,
                        disabled: !canUndoInstructions,
                        onClick: handleFineTuningInstructionsUndo,
                      }),
                      renderInstructionsToolbarButton({
                        id: "redo",
                        label: "Redo",
                        icon: Redo2,
                        disabled: !canRedoInstructions,
                        onClick: handleFineTuningInstructionsRedo,
                      }),
                      React.createElement("span", { key: "history-divider", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      textFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      ),
                      React.createElement("span", { key: "list-divider-start", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      listFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      ),
                      React.createElement("span", { key: "list-divider-end", className: "playground-agents-detail-instructions-toolbar-divider", "aria-hidden": "true" }),
                      insertFormatActions.map((action) =>
                        renderInstructionsToolbarButton({
                          ...action,
                          onClick: () => handleFineTuningInstructionsFormat(action.id),
                        })
                      )
                    )
                  ),
                  React.createElement("div", {
                      className: "playground-tasks-detail-description-editor" + (isFineTuningInstructionsEditing ? " is-editing" : " is-preview"),
                      onClick: () => {
                        setIsFineTuningInstructionsEditing(true);
                        focusFineTuningInstructionsTextareaAtEnd(form.instructions || "");
                      },
                    },
                    !isFineTuningInstructionsEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" }, renderMarkdownPreview())
                      : null,
                    React.createElement("textarea", {
                      ref: fineTuningInstructionsTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isFineTuningInstructionsEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isFineTuningInstructionsEditing ? "Add fine-tuning instructions here." : "",
                      value: form.instructions || "",
                      disabled: createBusy,
                      onFocus: () => setIsFineTuningInstructionsEditing(true),
                      onChange: (event) => {
                        updateFineTuningInstructionsValue(event.target.value);
                        resizeFineTuningInstructionsTextarea(event.currentTarget);
                      },
                      onBlur: () => setIsFineTuningInstructionsEditing(false),
                    })
                  )
                ),
                createError ? React.createElement("div", { className: "playground-fine-tuning-create-error" }, createError) : null
                  )
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeCreateModal(),
                    disabled: createBusy,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: createBusy,
                  }, createBusy ? "Starting..." : "Start Fine-Tune")
                )
              )
            )
          );
        }

        const isDetailPage = fineTuningPageMode === "detail" && selectedJob;
        const pageTitle = isDetailPage ? selectedJob.name : "Fine-Tuning";
        const detailJob = isDetailPage ? normalizePlaygroundFineTuningJob(selectedJob) : null;
        const showStopButton = detailJob ? canStopPlaygroundFineTuningJob(detailJob) : false;
        const isStoppingDetailJob = detailJob ? fineTuningStopJobId === detailJob.id : false;
        return React.createElement("section", { className: "playground-files-page playground-guardrails-page playground-evaluations-page playground-fine-tuning-page" },
          React.createElement("div", { className: "playground-files-shell playground-guardrails-shell" },
            React.createElement("section", { className: "playground-files-browser playground-guardrails-browser" },
              React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" },
                React.createElement("div", { className: "playground-files-library-header playground-guardrails-library-header" },
                  isDetailPage
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-resource-detail-back-button playground-guardrails-detail-back-button playground-evaluations-detail-back-button",
                        onClick: () => {
                          if (typeof setFineTuningPageMode === "function") setFineTuningPageMode("overview");
                        },
                        "aria-label": "Back to fine-tuning jobs",
                      },
                        React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Back")
                      )
                    : null,
                  React.createElement("div", { className: "playground-files-library-title-row" + (isDetailPage ? " playground-guardrails-detail-title-row" : "") },
	                    React.createElement("h1", { className: "playground-files-library-title" + (isDetailPage ? " playground-guardrails-detail-title" : "") }, pageTitle),
	                    isDetailPage
	                      ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
	                          React.createElement("div", { className: "playground-fine-tuning-detail-time" }, formatPlaygroundFineTuningDateTime(detailJob.createdAt)),
                            showStopButton
                              ? React.createElement("button", {
                                  type: "button",
                                  className: "playground-fine-tuning-detail-stop-button",
                                  onClick: () => stopFineTuningJob(detailJob),
                                  disabled: isStoppingDetailJob,
                                  title: "Stop fine-tune run",
                                  "aria-label": "Stop fine-tune run",
                                },
                                  isStoppingDetailJob
                                    ? React.createElement(Loader2, { className: "is-spinning", width: 13, height: 13, strokeWidth: 1.8 })
                                    : React.createElement(Square, { width: 12, height: 12, strokeWidth: 2 }),
                                  React.createElement("span", null, isStoppingDetailJob ? "Stopping" : "Stop")
                                )
                              : null
	                        )
	                      : null
	                  )
                )
              ),
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" },
                isDetailPage ? renderDetail() : renderOverview()
              )
            )
          ),
          renderCreateModal()
        );
      }

      function PlaygroundFineTuningPage(props = {}) {
        return renderPlaygroundFineTuningPage(props);
      }
`;
