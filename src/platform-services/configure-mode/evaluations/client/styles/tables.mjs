export const EVALUATIONS_STYLE_TABLES = String.raw`        line-height: 1.35;
        font-weight: 500;
      }

      .playground-evaluations-case-detail-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        line-height: 1.45;
        overflow-wrap: anywhere;
        word-break: break-word;
        overflow: visible;
      }

      .playground-evaluations-case-detail-value:not(.is-rich) {
        white-space: pre-wrap;
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
      }

      .playground-evaluations-case-reasoning-markdown.tb-message-markdown > :first-child,
      .playground-evaluations-case-reasoning-markdown .tb-message-markdown > :first-child {
        margin-top: 0;
      }

      .playground-evaluations-case-reasoning-markdown.tb-message-markdown > :last-child,
      .playground-evaluations-case-reasoning-markdown .tb-message-markdown > :last-child {
        margin-bottom: 0;
      }

      .playground-evaluations-case-reasoning-shell.tb-runner-chat {
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .playground-evaluations-case-reasoning-shell.tb-runner-chat .tb-turn-summary {
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .playground-evaluations-case-reasoning-shell.tb-runner-chat .tb-message-markdown {
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

      .playground-evaluations-page .playground-evaluations-overview-section {
        margin-top: 0;
      }

      .playground-evaluations-page .playground-evaluations-overview-layout .playground-guardrails-list-panel {
        margin-top: 12px;
        overflow: visible;
      }

      .playground-evaluations-page .playground-project-overview-panel-plain.playground-plugins-section {
        margin-top: 24px !important;
      }

      .playground-evaluations-page .playground-project-overview-panel-plain.playground-plugins-section.playground-evaluations-overview-section {
        margin-top: 0 !important;
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
        position: relative;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        overflow: visible;
      }

      .playground-evaluations-pass-threshold-label-group {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        overflow: visible;
      }

      .playground-evaluations-settings-header-control {
        min-width: 0;
        display: flex;
        align-items: center;
        overflow: visible;
      }

      .playground-evaluations-page .playground-guardrails-detail-actions {
        overflow: visible;
      }

      .playground-evaluations-pass-threshold-inline-label {
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-evaluations-pass-threshold-help {
        position: relative;
        width: 16px;
        height: 16px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.46);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: help;
      }

      .playground-evaluations-pass-threshold-help:hover,
      .playground-evaluations-pass-threshold-help:focus-visible {
        color: rgba(255, 255, 255, 0.86);
        outline: none;
      }

      .playground-evaluations-pass-threshold-tooltip {
        position: absolute;
        left: 0;
        top: calc(100% + 9px);
        width: 250px;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(30, 30, 30, 0.92);
        color: rgba(255, 255, 255, 0.84);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.35;
        text-align: left;
        white-space: normal;
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.36);
        opacity: 0;
        pointer-events: none;
        transform: translateY(-3px);
        transition: opacity 140ms ease, transform 140ms ease;
        z-index: 1400;
      }

      .playground-evaluations-pass-threshold-tooltip::before {
        content: "";
        position: absolute;
        left: 8px;
        bottom: 100%;
        width: 8px;
        height: 8px;
        border-left: 1px solid rgba(255, 255, 255, 0.14);
        border-top: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(30, 30, 30, 0.92);
        transform: translateY(4px) rotate(45deg);
      }

      .playground-evaluations-pass-threshold-help:hover .playground-evaluations-pass-threshold-tooltip,
      .playground-evaluations-pass-threshold-help:focus-visible .playground-evaluations-pass-threshold-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      .playground-evaluations-pass-threshold-inline .playground-evaluations-pass-threshold-input {
        width: auto;
        max-width: 50px;
        height: 24px;
        padding: 0;
        border: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0;
        background: transparent;
        font-size: 12px;
        text-align: right !important;
      }

      .playground-evaluations-description-section.playground-agents-detail-instructions-section,
      .playground-evaluations-dataset-guidance-section.playground-agents-detail-instructions-section {
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 3px;
      }

      .playground-evaluations-page .playground-agents-detail-instructions-section .playground-tasks-detail-section-header {
        background: transparent !important;
      }

      .playground-evaluations-description-section .platform-instructions-editor__title,
      .playground-evaluations-dataset-guidance-section .platform-instructions-editor__title {
        font-size: 14px !important;
      }

      .playground-evaluations-dataset-guidance-title {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .playground-evaluations-dataset-guidance-tooltip {
        width: 320px;
      }

      .playground-evaluations-description-section .playground-tasks-detail-description-editor,
      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-editor {
        min-height: 118px;
      }

      .playground-evaluations-description-section .playground-tasks-detail-description-input,
      .playground-evaluations-description-section .playground-tasks-detail-description-preview-scope.tb-runner-chat,
      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-input,
      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        min-height: 118px;
      }

      .playground-evaluations-cases-editor-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 24px;
        overflow: visible;
      }

      .playground-evaluations-dataset-cases-platform-table {
        min-width: 0;
        --platform-data-table-surface: transparent;
        --platform-data-table-body-background: transparent;
        --platform-data-table-row-background: transparent;
        --platform-data-table-header-background: transparent;
        --platform-data-table-sticky-background: transparent;
      }

      .playground-evaluations-dataset-case-table-title-cell {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-evaluations-dataset-case-table-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-evaluations-dataset-case-table-label {
        color: rgba(255, 255, 255, 0.46);
        font-size: 10px;
        line-height: 1.2;
      }

      .playground-evaluations-dataset-case-table-title {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-dataset-case-table-value {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
      }

      .playground-evaluations-dataset-cases-platform-table
        .platform-data-table__row.is-disabled.playground-evaluations-dataset-cases-table-row.is-pending {
        opacity: 1;
      }

      .playground-evaluations-dataset-cases-table-row.is-pending
        .playground-evaluations-dataset-case-table-title {
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-evaluations-dataset-cases-table-row.is-pending.is-error
        .playground-evaluations-dataset-case-table-label,
      .playground-evaluations-dataset-cases-table-row.is-pending.is-error
        .playground-evaluations-dataset-case-table-title {
        color: rgba(255, 135, 135, 0.9);
      }

      .playground-evaluations-cases-editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-case-import-feedback {
        margin: -2px 0 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-evaluations-case-import-feedback.is-error {
        color: #ff8f8f;
      }

      .playground-evaluations-cases-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
`;
