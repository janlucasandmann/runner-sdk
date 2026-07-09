export const PLAYGROUND_EVALUATIONS_CSS = String.raw`
      .playground-evaluations-page .playground-files-browser-body {
        align-items: stretch;
      }

      .playground-evaluations-page .playground-evaluations-overview-shell {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin: 0 auto;
      }

      .playground-evaluations-page .playground-guardrails-browser-header.playground-guardrails-overview-browser-header,
      .playground-evaluations-page .playground-guardrails-browser-body.playground-guardrails-overview-browser-body {
        width: 100%;
        max-width: none;
        padding-left: 24px;
        padding-right: 24px;
      }

      .playground-evaluations-page .playground-guardrails-overview-browser-header > .playground-files-library-header {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin-left: auto;
        margin-right: auto;
      }

      .playground-evaluations-page .playground-guardrails-detail-title-row {
        border-bottom: 0;
      }

      .playground-evaluations-detail-topnav-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-evaluations-version-changes-page {
        padding-top: 24px;
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
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.78fr) minmax(0, 0.98fr) minmax(64px, 0.48fr) minmax(42px, 0.32fr) minmax(76px, 0.48fr) 28px;
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.78fr) minmax(0, 0.98fr) minmax(64px, 0.48fr) minmax(42px, 0.32fr) minmax(76px, 0.48fr) 28px;
        gap: 12px;
      }

      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.78fr) minmax(0, 0.98fr) minmax(64px, 0.48fr) minmax(42px, 0.32fr) minmax(76px, 0.48fr) 28px;
        gap: 12px;
      }

      .playground-evaluations-overview-section .playground-project-overview-threads-table-header,
      .playground-evaluations-overview-section .playground-project-overview-threads-table-row,
      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-overview-section .playground-project-overview-threads-table-header,
      .playground-evaluations-page .playground-agents-detail-threads-section.playground-evaluations-overview-section .playground-project-overview-threads-table-row {
        grid-template-columns: 34px minmax(150px, 1.18fr) minmax(112px, 0.78fr) minmax(54px, 0.3fr) minmax(112px, 0.76fr) minmax(82px, 0.5fr) 28px;
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

      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-threads-table,
      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-thread-list,
      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-threads-table-row,
      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-actions {
        overflow: visible !important;
      }

      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-actions {
        position: relative;
        z-index: 20;
        display: flex;
        justify-content: flex-end;
      }

      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-actions .playground-tasks-toolbar-popup-shell {
        position: relative;
        z-index: 30;
      }

      .playground-evaluations-page .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-actions .playground-tasks-toolbar-popup-menu {
        top: auto;
        bottom: calc(100% + 6px);
        right: 0;
        left: auto;
        z-index: 1200;
      }

      .playground-evaluations-page .playground-evaluations-overview-layout,
      .playground-evaluations-page .playground-evaluations-overview-section.playground-plugins-section,
      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-threads-table,
      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-thread-list,
      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-threads-table-row,
      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-thread-cell.is-actions {
        overflow: visible !important;
      }

      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-thread-cell.is-actions {
        position: relative;
        z-index: 20;
      }

      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-thread-cell.is-actions .playground-tasks-toolbar-popup-shell {
        position: relative;
        z-index: 30;
      }

      .playground-evaluations-page .playground-evaluations-overview-section .playground-project-overview-thread-cell.is-actions .playground-tasks-toolbar-popup-menu {
        top: auto;
        bottom: calc(100% + 6px);
        right: 0;
        left: auto;
        z-index: 1200;
      }

      .playground-evaluations-overview-section .playground-plugins-toolbar-controls {
        flex: 0 0 auto;
      }

      .playground-evaluations-overview-create-button.playground-files-library-new-button {
        margin-left: auto;
      }

      .playground-evaluations-runs-section .playground-project-overview-thread-cell.is-score {
        color: rgba(255, 255, 255, 0.9);
        text-align: left;
      }

      .playground-evaluations-cases-table {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow: visible !important;
      }

      .playground-evaluations-cases-table-inner {
        width: 100%;
        min-width: 100%;
        display: flex;
        flex-direction: column;
        overflow: visible !important;
      }

      .playground-evaluations-cases-header,
      .playground-evaluations-cases-row {
        display: grid;
        grid-template-columns: minmax(0, 1.16fr) minmax(0, 1.16fr) minmax(70px, 0.36fr) minmax(86px, 0.46fr) 28px;
        gap: 12px;
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
        overflow: visible !important;
      }

      .playground-evaluations-cases-section,
      .playground-evaluations-cases-section.playground-plugins-section,
      .playground-evaluations-cases-section.playground-project-overview-panel-plain,
      .playground-evaluations-cases-section .playground-project-overview-thread-list {
        overflow: visible !important;
      }

      .playground-evaluations-cases-row:has(.playground-tasks-toolbar-popup-menu) {
        position: relative;
        z-index: 180;
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
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-evaluations-cases-cell.is-actions {
        position: relative;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-evaluations-cases-cell.is-actions .playground-tasks-toolbar-popup-shell {
        position: relative;
        z-index: 30;
      }

      .playground-evaluations-cases-cell.is-actions .playground-tasks-toolbar-popup-menu {
        top: auto;
        bottom: calc(100% + 6px);
        right: 0;
        left: auto;
        z-index: 1200;
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

      .playground-evaluations-pass-threshold-inline .playground-evaluations-input {
        width: 76px;
        height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        background: transparent;
        font-size: 12px;
        text-align: center !important;
      }

      .playground-evaluations-dataset-guidance-section.playground-agents-detail-instructions-section {
        margin-bottom: 16px;
      }

      .playground-evaluations-page .playground-agents-detail-instructions-section .playground-tasks-detail-section-header {
        background: transparent !important;
      }

      .playground-evaluations-dataset-guidance-section .playground-tasks-detail-description-editor {
        min-height: 118px;
      }

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

      .playground-evaluations-cases-editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-evaluations-cases-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-evaluations-cases-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex: 0 0 auto;
      }

      .playground-evaluations-source-thread-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: rgba(102, 166, 255, 0.92);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      .playground-evaluations-case-preview-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-evaluations-case-run-ring.playground-permission-mini-ring-icon {
        width: 24px;
        height: 24px;
        margin-right: 2px;
      }

      .playground-evaluations-case-run-ring-value {
        position: relative;
        z-index: 2;
        color: var(--permission-mini-ring-icon-color, rgba(78, 162, 255, 1));
        font-size: 9px;
        line-height: 1;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-evaluations-data-row-preview .playground-tasks-backlog-title {
        max-width: 100%;
      }

      .playground-evaluations-data-row-preview .playground-tasks-backlog-title.is-empty {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-evaluations-data-row-preview .playground-tasks-backlog-meta {
        gap: 8px;
      }

      .playground-evaluations-data-row-preview.is-pending {
        cursor: default;
      }

      .playground-evaluations-data-row-preview.is-pending .playground-tasks-backlog-title {
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-evaluations-data-row-preview.is-pending-error .playground-tasks-backlog-title {
        color: rgba(255, 135, 135, 0.9);
      }

      .playground-evaluations-pending-case-icon {
        width: 24px;
        height: 24px;
        margin-right: 2px;
        border-radius: 999px;
        border: 1px solid rgba(78, 162, 255, 0.42);
        color: rgba(78, 162, 255, 0.95);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        background: rgba(78, 162, 255, 0.08);
      }

      .playground-evaluations-pending-case-icon.is-error {
        border-color: rgba(255, 135, 135, 0.44);
        color: rgba(255, 135, 135, 0.95);
        background: rgba(255, 135, 135, 0.08);
      }

      .playground-evaluations-pending-case-spinner {
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-evaluations-pending-case-status {
        color: rgba(78, 162, 255, 0.92);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      .playground-evaluations-pending-case-status.is-error {
        color: rgba(255, 135, 135, 0.9);
      }

      .playground-evaluations-case-delete-button {
        width: 22px;
        height: 22px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: rgba(255, 255, 255, 0.42);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-evaluations-case-delete-button:hover,
      .playground-evaluations-case-delete-button:focus-visible {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        outline: none;
      }

      .playground-evaluations-jsonl-imports.playground-tasks-attachments {
        margin-top: 14px;
        overflow: visible;
      }

      .playground-evaluations-jsonl-imports .playground-tasks-attachments-toolbar,
      .playground-evaluations-jsonl-imports .playground-tasks-detail-section-title {
        overflow: visible;
      }

      .playground-evaluations-imports-title {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        overflow: visible;
      }

      .playground-evaluations-imports-help {
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
        overflow: visible;
      }

      .playground-evaluations-imports-help:hover,
      .playground-evaluations-imports-help:focus-visible {
        color: rgba(255, 255, 255, 0.86);
        outline: none;
      }

      .playground-evaluations-imports-tooltip {
        width: 320px;
      }

      .playground-evaluations-imports-help:hover .playground-evaluations-imports-tooltip,
      .playground-evaluations-imports-help:focus-visible .playground-evaluations-imports-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      .playground-evaluations-jsonl-imports .playground-environments-action-button.playground-tasks-attachments-environment-button {
        min-height: 0 !important;
        height: auto;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        color: #66a6ff !important;
        font-size: 12px !important;
        font-weight: 400 !important;
        line-height: 1.2;
      }

      .playground-evaluations-jsonl-imports .playground-environments-action-button.playground-tasks-attachments-environment-button::before {
        content: none !important;
        display: none !important;
      }

      .playground-evaluations-jsonl-imports .playground-environments-action-button.playground-tasks-attachments-environment-button:hover:not(:disabled),
      .playground-evaluations-jsonl-imports .playground-environments-action-button.playground-tasks-attachments-environment-button:focus-visible {
        background: transparent !important;
        color: #66a6ff !important;
        outline: none;
      }

      .playground-evaluations-jsonl-imports .playground-tasks-attachments-surface.tb-runner-chat {
        min-height: 0;
      }

      .playground-evaluations-jsonl-imports .playground-tasks-attachments-dropzone {
        min-height: 128px;
      }

      .playground-evaluations-thread-case-modal.playground-evaluations-modal {
        width: min(720px, calc(100vw - 48px));
        gap: 14px;
      }

      .playground-evaluations-thread-picker-toolbar {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
      }

      .playground-evaluations-thread-picker-search {
        width: 100%;
        min-width: 0;
        height: 34px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 12px;
        outline: none;
        padding: 0 10px;
        box-sizing: border-box;
      }

      .playground-evaluations-thread-picker-list {
        max-height: min(360px, calc(100vh - 320px));
        overflow: auto;
        display: flex;
        flex-direction: column;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-evaluations-thread-picker-row {
        width: 100%;
        min-width: 0;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        color: inherit;
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        text-align: left;
        cursor: pointer;
      }

      .playground-evaluations-thread-picker-row:last-child {
        border-bottom: 0;
      }

      .playground-evaluations-thread-picker-row:hover,
      .playground-evaluations-thread-picker-row:focus-visible {
        outline: none;
      }

      .playground-evaluations-thread-picker-check {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.22);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-evaluations-thread-picker-row.is-selected .playground-evaluations-thread-picker-check {
        border-color: rgba(102, 166, 255, 0.95);
        background: rgba(102, 166, 255, 0.18);
      }

      .playground-evaluations-thread-picker-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-evaluations-thread-picker-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-thread-picker-meta {
        min-width: 0;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-thread-picker-status {
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      .playground-evaluations-thread-picker-empty {
        padding: 24px 0;
        color: rgba(255, 255, 255, 0.46);
        font-size: 12px;
      }

      .playground-evaluations-thread-picker-status-line {
        min-height: 16px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-evaluations-thread-picker-status-line.is-error {
        color: rgba(255, 120, 120, 0.92);
      }

      .playground-evaluations-case-editor-modal.playground-project-overview-outcome-editor-modal {
        width: min(720px, calc(100vw - 48px));
        height: auto !important;
        min-height: 0;
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
      }

      .playground-evaluations-case-editor-body.playground-project-overview-outcome-editor-body {
        gap: 14px;
      }

      .playground-evaluations-create-modal.playground-project-overview-outcome-editor-modal {
        width: min(720px, calc(100vw - 48px));
        height: auto !important;
        min-height: 0;
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
      }

      .playground-evaluations-create-modal .playground-project-overview-outcome-editor-body {
        gap: 14px;
      }

      .playground-evaluations-create-modal .playground-evaluations-form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-evaluations-create-modal .playground-evaluations-field.is-full {
        grid-column: 1 / -1;
      }

      .playground-evaluations-create-modal .playground-evaluations-field span {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-evaluations-create-modal .playground-evaluations-input,
      .playground-evaluations-create-modal .playground-evaluations-select,
      .playground-evaluations-create-modal .playground-evaluations-textarea {
        border-color: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        font-size: 13px;
      }

      .playground-evaluations-create-modal .playground-evaluations-select {
        color-scheme: dark;
      }

      .playground-evaluations-create-modal .playground-evaluations-textarea {
        min-height: 118px;
      }

      .playground-evaluations-case-editor-modal .playground-tasks-project-modal-top {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .playground-evaluations-case-editor-top-actions {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        flex: 0 0 auto;
      }

      .playground-evaluations-case-editor-run-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .playground-evaluations-case-editor-run-field .playground-tasks-project-modal-label {
        margin: 0;
        color: rgba(255, 255, 255, 0.54);
        font-size: 11px;
        line-height: 1;
        font-weight: 500;
        white-space: nowrap;
      }

      .playground-evaluations-case-editor-run-input.playground-environments-input {
        width: 58px;
        min-height: 0;
        height: 22px;
        padding: 1px 8px;
        border-radius: 999px;
        background: transparent;
        text-align: center;
        line-height: 18px;
      }

      .playground-evaluations-case-editor-markdown-section.playground-agents-detail-instructions-section {
        margin: 0;
        padding: 0;
      }

      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-section-header {
        background: transparent !important;
      }

      .playground-evaluations-case-editor-markdown-section.playground-agents-detail-instructions-section .playground-tasks-detail-section-header {
        background: transparent !important;
      }

      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-description-editor {
        min-height: 52px;
      }

      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-description-input,
      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        min-height: 52px;
      }

      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-description-input.is-editing,
      .playground-evaluations-case-editor-markdown-section .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        max-height: 148px;
        overflow-y: auto;
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
        width: 100%;
        max-width: 100%;
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
        max-width: 100%;
        display: block;
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
        width: min(720px, calc(100vw - 48px));
      }

      .playground-evaluations-run-modal.playground-project-overview-outcome-editor-modal {
        height: auto !important;
        min-height: 0;
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
      }

      .playground-evaluations-run-modal .playground-project-overview-outcome-editor-body {
        gap: 14px;
      }

      .playground-evaluations-run-modal .playground-tasks-project-modal-name-row {
        gap: 10px;
      }

      .playground-evaluations-run-modal .playground-tasks-project-modal-icon-trigger {
        color: rgba(255, 255, 255, 0.9);
        cursor: default;
      }

      .playground-evaluations-run-modal .playground-evaluations-run-modal-body {
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

      function normalizePlaygroundEvaluationUsdCost(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
      }

      function readPlaygroundEvaluationUsdCost(source) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const usage = record.usage && typeof record.usage === "object" && !Array.isArray(record.usage) ? record.usage : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const candidates = [
          record.costUsd,
          record.costUSD,
          record.cost_usd,
          record.usdCost,
          record.usd_cost,
          record.totalCostUsd,
          record.totalCostUSD,
          record.total_cost_usd,
          record.totalUsd,
          record.totalUSD,
          record.total_usd,
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
          const numericValue = Number(candidate);
          if (Number.isFinite(numericValue) && numericValue > 0) {
            return numericValue;
          }
        }
        const legacyTokens = normalizePlaygroundEvaluationTokenCount(
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
        return legacyTokens > 0 ? legacyTokens / 100 : 0;
      }

      function normalizePlaygroundEvaluationCaseRunCount(value, fallback = 1) {
        const fallbackCount = Math.max(1, Math.min(50, Math.round(Number(fallback) || 1)));
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return fallbackCount;
        return Math.max(1, Math.min(50, Math.round(numericValue)));
      }

      function normalizePlaygroundEvaluationEvaluator(rawEvaluator = {}) {
        const source = rawEvaluator && typeof rawEvaluator === "object" && !Array.isArray(rawEvaluator) ? rawEvaluator : {};
        const rawType = String(source.type || source.evaluatorType || "").trim().toLowerCase();
        const type = ["agent", "code", "exact"].includes(rawType) ? rawType : "agent";
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

      function normalizePlaygroundEvaluationPersonIdentity(rawValue = {}) {
        if (typeof rawValue === "string") {
          const value = rawValue.trim();
          return {
            id: value,
            userId: "",
            name: value.includes("@") ? "" : value,
            email: value.includes("@") ? value : "",
            avatarUrl: "",
          };
        }
        const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
        return {
          id: String(source.id || source.userId || source.user_id || source.uid || source.email || "").trim(),
          userId: String(source.userId || source.user_id || source.uid || "").trim(),
          name: String(source.name || source.displayName || source.display_name || source.label || source.title || "").trim(),
          email: String(source.email || source.mail || "").trim(),
          avatarUrl: String(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar || "").trim(),
        };
      }

      function getPlaygroundEvaluationCreatorIdentity(source = {}) {
        const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
        const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
        const nested = record.creator || record.createdBy || record.created_by || metadata.creator || metadata.createdBy || metadata.created_by || record.owner || metadata.owner || null;
        const direct = normalizePlaygroundEvaluationPersonIdentity({
          id: record.creatorId || record.creator_id || record.createdById || record.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
          userId: record.creatorUserId || record.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || record.userId || record.user_id,
          name: record.creatorName || record.creator_name || record.createdByName || record.created_by_name || metadata.creatorName || metadata.creator_name || metadata.createdByName || metadata.created_by_name,
          email: record.creatorEmail || record.creator_email || record.createdByEmail || record.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email,
          avatarUrl: record.creatorAvatarUrl || record.creator_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.creatorAvatarUrl || metadata.creator_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
        });
        const nestedIdentity = normalizePlaygroundEvaluationPersonIdentity(nested || {});
        return {
          id: nestedIdentity.id || direct.id,
          userId: nestedIdentity.userId || direct.userId,
          name: nestedIdentity.name || direct.name,
          email: nestedIdentity.email || direct.email,
          avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
        };
      }

      function getPlaygroundEvaluationCreatorLabel(creator) {
        const identity = normalizePlaygroundEvaluationPersonIdentity(creator);
        return String(identity.name || identity.email || identity.id || identity.userId || "").trim();
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
          runCount: normalizePlaygroundEvaluationCaseRunCount(source.runCount ?? source.run_count ?? source.runs ?? source.repeatCount ?? source.repeat_count ?? source.repetitions ?? 1),
          sourceThreadId: String(source.sourceThreadId || source.source_thread_id || source.metadata?.sourceThreadId || source.metadata?.source_thread_id || "").trim(),
          sourceThreadTitle: String(source.sourceThreadTitle || source.source_thread_title || source.metadata?.sourceThreadTitle || source.metadata?.source_thread_title || "").trim(),
          sourceAgentId: String(source.sourceAgentId || source.source_agent_id || source.metadata?.sourceAgentId || source.metadata?.source_agent_id || "").trim(),
          sourceAgentName: String(source.sourceAgentName || source.source_agent_name || source.metadata?.sourceAgentName || source.metadata?.source_agent_name || "").trim(),
          sourceEnvironmentId: String(source.sourceEnvironmentId || source.source_environment_id || source.metadata?.sourceEnvironmentId || source.metadata?.source_environment_id || "").trim(),
          sourceEnvironmentName: String(source.sourceEnvironmentName || source.source_environment_name || source.metadata?.sourceEnvironmentName || source.metadata?.source_environment_name || "").trim(),
          sourceCreatedAt: String(source.sourceCreatedAt || source.source_created_at || source.metadata?.sourceCreatedAt || source.metadata?.source_created_at || "").trim(),
          sourceUpdatedAt: String(source.sourceUpdatedAt || source.source_updated_at || source.metadata?.sourceUpdatedAt || source.metadata?.source_updated_at || "").trim(),
          reviewStatus: ["draft", "ready", "needs_review"].includes(String(source.reviewStatus || source.review_status || "").trim().toLowerCase())
            ? String(source.reviewStatus || source.review_status || "").trim().toLowerCase()
            : "",
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
          dataRowRunIndex: normalizePlaygroundEvaluationCaseRunCount(source.dataRowRunIndex ?? source.data_row_run_index ?? source.repeatIndex ?? source.repeat_index ?? 1),
          dataRowRunCount: normalizePlaygroundEvaluationCaseRunCount(source.dataRowRunCount ?? source.data_row_run_count ?? source.repeatCount ?? source.repeat_count ?? 1),
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
          costUsd: readPlaygroundEvaluationUsdCost(source),
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
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
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
        const costUsd = normalizePlaygroundEvaluationUsdCost(
          readPlaygroundEvaluationUsdCost(source)
          || cases.reduce((sum, item) => sum + normalizePlaygroundEvaluationUsdCost(item.costUsd), 0)
        );
        return {
          id: String(source.id || source.runId || source.run_id || "").trim() || createPlaygroundEvaluationId("eval_run"),
          evaluationSetId: String(source.evaluationSetId || source.evaluation_set_id || "").trim(),
          evaluationVersionId: String(source.evaluationVersionId || source.evaluation_version_id || "").trim(),
          evaluationVersionNumber: Math.max(0, Number(source.evaluationVersionNumber || source.evaluation_version_number || 0) || 0),
          evaluationVersionLabel: String(source.evaluationVersionLabel || source.evaluation_version_label || "").trim(),
          label: String(source.label || source.name || ("Run " + (fallbackIndex + 1))).trim(),
          status: ["queued", "running", "completed", "failed"].includes(String(source.status || "").trim().toLowerCase())
            ? String(source.status || "").trim().toLowerCase()
            : "completed",
          createdAt: String(source.createdAt || source.created_at || new Date().toISOString()),
          completedAt: String(source.completedAt || source.completed_at || source.updatedAt || source.updated_at || new Date().toISOString()),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || "").trim(),
          targetAgentName: String(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || "").trim(),
          targetAgentPhotoUrl: String(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL || "").trim(),
          targetAgentVersionId: String(source.targetAgentVersionId || source.target_agent_version_id || source.agentVersionId || source.agent_version_id || runnerPlayground.targetAgentVersionId || runnerPlayground.target_agent_version_id || runnerPlayground.agentVersionId || runnerPlayground.agent_version_id || metadata.targetAgentVersionId || metadata.target_agent_version_id || metadata.agentVersionId || metadata.agent_version_id || "").trim(),
          targetAgentVersionNumber: Math.max(0, Number(source.targetAgentVersionNumber || source.target_agent_version_number || source.agentVersionNumber || source.agent_version_number || source.versionNumber || source.version_number || runnerPlayground.targetAgentVersionNumber || runnerPlayground.target_agent_version_number || metadata.targetAgentVersionNumber || metadata.target_agent_version_number || 0) || 0),
          targetAgentVersionLabel: String(source.targetAgentVersionLabel || source.target_agent_version_label || source.agentVersionLabel || source.agent_version_label || source.versionLabel || source.version_label || runnerPlayground.targetAgentVersionLabel || runnerPlayground.target_agent_version_label || metadata.targetAgentVersionLabel || metadata.target_agent_version_label || "").trim(),
          targetAgentVersionRevisionId: String(source.targetAgentVersionRevisionId || source.target_agent_version_revision_id || source.agentVersionRevisionId || source.agent_version_revision_id || source.revisionId || source.revision_id || runnerPlayground.targetAgentVersionRevisionId || runnerPlayground.target_agent_version_revision_id || metadata.targetAgentVersionRevisionId || metadata.target_agent_version_revision_id || "").trim(),
          fineTuningJobId: String(source.fineTuningJobId || source.fine_tuning_job_id || runnerPlayground.fineTuningJobId || runnerPlayground.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id || "").trim(),
          fine_tuning_job_id: String(source.fine_tuning_job_id || source.fineTuningJobId || runnerPlayground.fine_tuning_job_id || runnerPlayground.fineTuningJobId || metadata.fine_tuning_job_id || metadata.fineTuningJobId || "").trim(),
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
          costUsd,
          costSource: String(source.costSource || source.cost_source || ""),
          metadata: Object.keys(metadata).length ? metadata : null,
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
              : Array.isArray(source.cases)
                ? source.cases
                : [];
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null;
        const runs = Array.isArray(source.runs)
          ? source.runs
          : Array.isArray(source.evaluationRuns)
            ? source.evaluationRuns
            : Array.isArray(source.evaluation_runs)
              ? source.evaluation_runs
              : Array.isArray(metadata?.runs)
                ? metadata.runs
                : Array.isArray(metadata?.evaluationRuns)
                  ? metadata.evaluationRuns
                  : Array.isArray(metadata?.evaluation_runs)
                    ? metadata.evaluation_runs
                    : [];
        const creator = getPlaygroundEvaluationCreatorIdentity(source);
        const metadataRecord = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
        const passThreshold = normalizePlaygroundEvaluationPassThreshold(source.passThreshold ?? source.pass_threshold ?? metadataRecord.passThreshold ?? metadataRecord.pass_threshold ?? source.threshold ?? metadataRecord.threshold ?? 0.8);
        return {
          id: String(source.id || source.evaluationId || source.evaluation_id || "").trim() || createPlaygroundEvaluationId("eval_set"),
          name: String(source.name || source.title || "Untitled Evaluation").trim() || "Untitled Evaluation",
          description: String(source.description || ""),
          evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || metadataRecord.evaluationGuidance || metadataRecord.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || metadataRecord.scoringGuidance || metadataRecord.scoring_guidance || source.rubric || metadataRecord.rubric || ""),
          passThreshold,
          evaluator: normalizePlaygroundEvaluationEvaluator(source.evaluator || metadataRecord.evaluator || {}),
          targetAgentId: String(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || metadataRecord.targetAgentId || metadataRecord.target_agent_id || metadataRecord.agentId || metadataRecord.agent_id || "").trim(),
          environmentType: String(source.environmentType || source.environment_type || metadataRecord.environmentType || metadataRecord.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || metadataRecord.environmentId || metadataRecord.environment_id || metadataRecord.computerId || metadataRecord.computer_id || "").trim(),
          projectId: String(source.projectId || source.project_id || metadataRecord.projectId || metadataRecord.project_id || "").trim(),
          dataRows: dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: runs.map((run, index) => normalizePlaygroundEvaluationRun({ passThreshold, ...(run || {}) }, index)),
          creator,
          createdBy: creator,
          metadata,
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
          evaluator: { type: "agent" },
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

      function stripPlaygroundEvaluationVersionMetadata(metadata) {
        const source = metadata && typeof metadata === "object" && !Array.isArray(metadata)
          ? { ...metadata }
          : {};
        delete source.evaluationVersions;
        delete source.evaluation_versions;
        delete source.versions;
        delete source.activeEvaluationVersionId;
        delete source.active_evaluation_version_id;
        delete source.activeEvaluationVersionNumber;
        delete source.active_evaluation_version_number;
        delete source.restoredFromEvaluationVersionId;
        delete source.restored_from_evaluation_version_id;
        delete source.restoredFromEvaluationVersionNumber;
        delete source.restored_from_evaluation_version_number;
        delete source.publishedAt;
        delete source.published_at;
        delete source.unpublishedAt;
        delete source.unpublished_at;
        return source;
      }

      function createPlaygroundEvaluationVersionId() {
        return "evaluation_version_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      }

      function buildPlaygroundEvaluationVersionSnapshot(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        return {
          name: String(normalizedSet.name || "").trim() || "Untitled Evaluation",
          description: String(normalizedSet.description || ""),
          evaluationGuidance: String(normalizedSet.evaluationGuidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(normalizedSet.passThreshold),
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSet.evaluator),
          targetAgentId: String(normalizedSet.targetAgentId || "").trim(),
          environmentType: String(normalizedSet.environmentType || "").trim() === "project" ? "project" : "computer",
          environmentId: String(normalizedSet.environmentId || "").trim(),
          projectId: String(normalizedSet.projectId || "").trim(),
          dataRows: (Array.isArray(normalizedSet.dataRows) ? normalizedSet.dataRows : [])
            .map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: (Array.isArray(normalizedSet.runs) ? normalizedSet.runs : [])
            .map((run, index) => normalizePlaygroundEvaluationRun(run, index)),
          creator: normalizePlaygroundEvaluationPersonIdentity(normalizedSet.creator || normalizedSet.createdBy || {}),
          metadata: stripPlaygroundEvaluationVersionMetadata(normalizedSet.metadata),
        };
      }

      function normalizePlaygroundEvaluationVersion(rawVersion, fallbackIndex = 0) {
        const version = rawVersion && typeof rawVersion === "object" && !Array.isArray(rawVersion) ? rawVersion : {};
        const snapshot = version.snapshot && typeof version.snapshot === "object" && !Array.isArray(version.snapshot)
          ? version.snapshot
          : {};
        const createdAt = String(version.createdAt || version.created_at || version.publishedAt || version.published_at || new Date().toISOString()).trim();
        const id = String(version.id || version.versionId || version.version_id || ("evaluation_version_" + (fallbackIndex + 1))).trim();
        const versionNumber = Number(version.version || version.versionNumber || version.version_number || 0) || (fallbackIndex + 1);
        const rawStatus = String(version.status || "").trim().toLowerCase();
        const status = rawStatus === "published"
          ? "active"
          : ["active", "saved", "superseded", "unpublished"].includes(rawStatus) ? rawStatus : "saved";
        const normalizedSnapshot = {
          name: String(version.name || snapshot.name || "").trim() || "Untitled Evaluation",
          description: typeof version.description === "string"
            ? version.description
            : typeof snapshot.description === "string"
              ? snapshot.description
              : "",
          evaluationGuidance: String(snapshot.evaluationGuidance || snapshot.evaluation_guidance || version.evaluationGuidance || version.evaluation_guidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(snapshot.passThreshold ?? snapshot.pass_threshold ?? version.passThreshold ?? version.pass_threshold ?? 0.8),
          evaluator: normalizePlaygroundEvaluationEvaluator(snapshot.evaluator || version.evaluator || {}),
          targetAgentId: String(snapshot.targetAgentId || snapshot.target_agent_id || version.targetAgentId || version.target_agent_id || "").trim(),
          environmentType: String(snapshot.environmentType || snapshot.environment_type || version.environmentType || version.environment_type || "").trim().toLowerCase() === "project" ? "project" : "computer",
          environmentId: String(snapshot.environmentId || snapshot.environment_id || version.environmentId || version.environment_id || "").trim(),
          projectId: String(snapshot.projectId || snapshot.project_id || version.projectId || version.project_id || "").trim(),
          dataRows: (Array.isArray(version.dataRows)
            ? version.dataRows
            : Array.isArray(snapshot.dataRows)
              ? snapshot.dataRows
              : Array.isArray(snapshot.data_rows)
                ? snapshot.data_rows
                : Array.isArray(snapshot.cases)
                  ? snapshot.cases
                  : []
          ).map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          runs: (Array.isArray(version.runs)
            ? version.runs
            : Array.isArray(snapshot.runs)
              ? snapshot.runs
              : []
          ).map((run, index) => normalizePlaygroundEvaluationRun(run, index)),
          creator: normalizePlaygroundEvaluationPersonIdentity(snapshot.creator || snapshot.createdBy || version.creator || version.createdBy || {}),
          metadata: stripPlaygroundEvaluationVersionMetadata(snapshot.metadata),
        };
        return {
          id,
          version: versionNumber,
          label: String(version.label || version.name || ("Version " + versionNumber)).trim(),
          description: String(version.description || version.summary || "").trim(),
          status,
          createdAt,
          updatedAt: String(version.updatedAt || version.updated_at || "").trim(),
          publishedAt: String(version.publishedAt || version.published_at || "").trim(),
          name: normalizedSnapshot.name,
          runCount: normalizedSnapshot.runs.length,
          caseCount: normalizedSnapshot.dataRows.length,
          snapshot: normalizedSnapshot,
        };
      }

      function normalizePlaygroundEvaluationVersions(value) {
        const rawItems = Array.isArray(value) ? value : [];
        return rawItems
          .map((version, index) => normalizePlaygroundEvaluationVersion(version, index))
          .filter((version) => version.id)
          .sort((a, b) => {
            const versionDelta = Number(b.version || 0) - Number(a.version || 0);
            if (versionDelta) return versionDelta;
            return new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime();
          });
      }

      function readPlaygroundEvaluationVersions(set) {
        const metadata = set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
          ? set.metadata
          : {};
        return normalizePlaygroundEvaluationVersions(
          set?.evaluationVersions
          || set?.evaluation_versions
          || set?.versions
          || metadata.evaluationVersions
          || metadata.evaluation_versions
          || metadata.versions
          || []
        );
      }

      function createPlaygroundEvaluationVersion(set, existingVersions = [], options = {}) {
        const now = new Date().toISOString();
        const normalizedExisting = normalizePlaygroundEvaluationVersions(existingVersions);
        const nextVersion = normalizedExisting.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
        const requestedStatus = String(options?.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        const snapshot = buildPlaygroundEvaluationVersionSnapshot(set);
        return normalizePlaygroundEvaluationVersion({
          id: createPlaygroundEvaluationVersionId(),
          version: nextVersion,
          label: String(options?.label || ("Version " + nextVersion)).trim(),
          description: String(options?.description || "").trim(),
          status,
          createdAt: now,
          publishedAt: status === "active" ? now : "",
          name: snapshot.name,
          dataRows: snapshot.dataRows,
          runs: snapshot.runs,
          snapshot,
        }, nextVersion - 1);
      }

      function createPlaygroundEvaluationWithVersionList(set, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const normalizedVersions = normalizePlaygroundEvaluationVersions(versions);
        const metadata = baseSet.metadata && typeof baseSet.metadata === "object" && !Array.isArray(baseSet.metadata)
          ? { ...baseSet.metadata }
          : {};
        const previousSelectedId = String(metadata.restoredFromEvaluationVersionId || metadata.restored_from_evaluation_version_id || metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim();
        const selectedVersion = normalizedVersions.find((version) => version.id === String(preferredSelectedId || "").trim())
          || normalizedVersions.find((version) => version.id === previousSelectedId)
          || normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions[0]
          || null;
        const activeVersion = normalizedVersions.find((version) => version.status === "active")
          || normalizedVersions.find((version) => version.id === String(metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim())
          || null;
        metadata.evaluationVersions = normalizedVersions;
        metadata.evaluation_versions = normalizedVersions;
        metadata.activeEvaluationVersionId = activeVersion?.id || "";
        metadata.active_evaluation_version_id = activeVersion?.id || "";
        metadata.activeEvaluationVersionNumber = activeVersion?.version || 0;
        metadata.active_evaluation_version_number = activeVersion?.version || 0;
        metadata.restoredFromEvaluationVersionId = selectedVersion?.id || "";
        metadata.restored_from_evaluation_version_id = selectedVersion?.id || "";
        metadata.restoredFromEvaluationVersionNumber = selectedVersion?.version || 0;
        metadata.restored_from_evaluation_version_number = selectedVersion?.version || 0;
        if (activeVersion?.publishedAt) {
          metadata.publishedAt = activeVersion.publishedAt;
          metadata.published_at = activeVersion.publishedAt;
        } else {
          delete metadata.publishedAt;
          delete metadata.published_at;
        }
        return normalizePlaygroundEvaluationSet({
          ...baseSet,
          metadata,
          publishedAt: activeVersion?.publishedAt || "",
        });
      }

      function createPlaygroundEvaluationFromVersionSnapshot(set, version, versions, preferredSelectedId = "") {
        const baseSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const snapshot = normalizedVersion.snapshot || {};
        const baseMetadata = stripPlaygroundEvaluationVersionMetadata(baseSet.metadata);
        const snapshotMetadata = stripPlaygroundEvaluationVersionMetadata(snapshot.metadata);
        const nextSet = normalizePlaygroundEvaluationSet({
          ...baseSet,
          name: snapshot.name || baseSet.name,
          description: typeof snapshot.description === "string" ? snapshot.description : baseSet.description,
          evaluationGuidance: typeof snapshot.evaluationGuidance === "string" ? snapshot.evaluationGuidance : baseSet.evaluationGuidance,
          passThreshold: snapshot.passThreshold ?? baseSet.passThreshold,
          evaluator: snapshot.evaluator || baseSet.evaluator,
          targetAgentId: snapshot.targetAgentId || baseSet.targetAgentId,
          environmentType: snapshot.environmentType || baseSet.environmentType,
          environmentId: snapshot.environmentId || baseSet.environmentId,
          projectId: snapshot.projectId || baseSet.projectId,
          dataRows: Array.isArray(snapshot.dataRows) ? snapshot.dataRows : baseSet.dataRows,
          runs: Array.isArray(snapshot.runs) ? snapshot.runs : [],
          creator: snapshot.creator || baseSet.creator,
          createdBy: snapshot.creator || baseSet.createdBy,
          metadata: {
            ...baseMetadata,
            ...snapshotMetadata,
          },
        });
        return createPlaygroundEvaluationWithVersionList(nextSet, versions, preferredSelectedId || normalizedVersion.id);
      }

      function buildPlaygroundEvaluationVersionComparableSnapshot(snapshot) {
        const normalizedSnapshot = normalizePlaygroundEvaluationVersion({ snapshot }).snapshot;
        return {
          name: String(normalizedSnapshot.name || "").trim(),
          description: String(normalizedSnapshot.description || ""),
          evaluationGuidance: String(normalizedSnapshot.evaluationGuidance || ""),
          passThreshold: normalizePlaygroundEvaluationPassThreshold(normalizedSnapshot.passThreshold),
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSnapshot.evaluator),
          targetAgentId: String(normalizedSnapshot.targetAgentId || "").trim(),
          environmentType: String(normalizedSnapshot.environmentType || "").trim(),
          environmentId: String(normalizedSnapshot.environmentId || "").trim(),
          projectId: String(normalizedSnapshot.projectId || "").trim(),
          dataRows: (Array.isArray(normalizedSnapshot.dataRows) ? normalizedSnapshot.dataRows : [])
            .map((row, index) => ({
              id: String(row?.id || ("row_" + (index + 1))).trim(),
              input: String(row?.input || ""),
              expectedOutput: String(row?.expectedOutput || ""),
              evaluationGuidance: String(row?.evaluationGuidance || ""),
              runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
            })),
        };
      }

      function updatePlaygroundEvaluationVersionFromSet(version, set, options = {}) {
        const now = String(options.updatedAt || new Date().toISOString()).trim();
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const snapshot = buildPlaygroundEvaluationVersionSnapshot(set);
        const requestedStatus = String(options.status || normalizedVersion.status || "saved").trim().toLowerCase();
        const status = requestedStatus === "active" ? "active" : "saved";
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status,
          updatedAt: now,
          updated_at: now,
          publishedAt: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          published_at: status === "active" ? String(options.publishedAt || normalizedVersion.publishedAt || now).trim() : "",
          name: snapshot.name,
          dataRows: snapshot.dataRows,
          runs: snapshot.runs,
          runCount: snapshot.runs.length,
          caseCount: snapshot.dataRows.length,
          snapshot,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function updatePlaygroundEvaluationVersionMetadata(version, details = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const now = String(details.updatedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          label: String(details.label || "").trim() || String(normalizedVersion.label || ("Version " + normalizedVersion.version)).trim(),
          description: String(details.description || "").trim(),
          updatedAt: now,
          updated_at: now,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function publishPlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const publishedAt = String(options.publishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "active",
          updatedAt: publishedAt,
          updated_at: publishedAt,
          publishedAt,
          published_at: publishedAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function supersedePlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const supersededAt = String(options.supersededAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "superseded",
          updatedAt: supersededAt,
          updated_at: supersededAt,
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function unpublishPlaygroundEvaluationVersion(version, options = {}) {
        const normalizedVersion = normalizePlaygroundEvaluationVersion(version || {});
        const unpublishedAt = String(options.unpublishedAt || new Date().toISOString()).trim();
        return normalizePlaygroundEvaluationVersion({
          ...normalizedVersion,
          status: "unpublished",
          updatedAt: unpublishedAt,
          updated_at: unpublishedAt,
          publishedAt: "",
          published_at: "",
        }, Math.max(0, Number(normalizedVersion.version || 1) - 1));
      }

      function ensurePlaygroundEvaluationInitialVersion(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set || createPlaygroundEvaluationSetDraft());
        const versions = readPlaygroundEvaluationVersions(normalizedSet);
        if (versions.length > 0) {
          return createPlaygroundEvaluationWithVersionList(normalizedSet, versions);
        }
        const initialVersion = createPlaygroundEvaluationVersion(normalizedSet, [], {
          status: "active",
          label: "Version 1",
          description: "Initial version",
        });
        return createPlaygroundEvaluationWithVersionList(normalizedSet, [initialVersion], initialVersion.id);
      }

      const playgroundEvaluationVersionController = createPlaygroundVersionController({
        getMetadata: (set) => (
          set?.metadata && typeof set.metadata === "object" && !Array.isArray(set.metadata)
            ? set.metadata
            : {}
        ),
        readVersions: readPlaygroundEvaluationVersions,
        normalizeVersions: normalizePlaygroundEvaluationVersions,
        createVersion: createPlaygroundEvaluationVersion,
        withVersionList: createPlaygroundEvaluationWithVersionList,
        fromVersionSnapshot: createPlaygroundEvaluationFromVersionSnapshot,
        buildSnapshot: buildPlaygroundEvaluationVersionSnapshot,
        buildComparableSnapshot: buildPlaygroundEvaluationVersionComparableSnapshot,
        getActiveVersionId: (metadata) => (
          metadata.activeEvaluationVersionId
          || metadata.active_evaluation_version_id
          || ""
        ),
        getSelectedVersionId: (metadata, activeVersion) => (
          metadata.restoredFromEvaluationVersionId
          || metadata.restored_from_evaluation_version_id
          || activeVersion?.id
          || ""
        ),
        updateVersionFromResource: updatePlaygroundEvaluationVersionFromSet,
        updateVersionMetadata: updatePlaygroundEvaluationVersionMetadata,
        publishVersion: publishPlaygroundEvaluationVersion,
        supersedeVersion: supersedePlaygroundEvaluationVersion,
        unpublishVersion: unpublishPlaygroundEvaluationVersion,
        applyUnpublishMetadata: (set) => {
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          const metadata = normalizedSet.metadata && typeof normalizedSet.metadata === "object" && !Array.isArray(normalizedSet.metadata)
            ? { ...normalizedSet.metadata }
            : {};
          delete metadata.publishedAt;
          delete metadata.published_at;
          return normalizePlaygroundEvaluationSet({
            ...normalizedSet,
            metadata,
            publishedAt: "",
          });
        },
      });

      function createPlaygroundEvaluationVersionRowSlug(row, index = 0) {
        const source = String(row?.input || row?.id || ("case " + (index + 1))).trim().toLowerCase();
        const slug = source
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        return slug || ("case-" + (index + 1));
      }

      function buildPlaygroundEvaluationVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
        if (!baseSnapshot || !targetSnapshot) {
          return [];
        }
        const normalizedBaseSnapshot = normalizePlaygroundEvaluationVersion({ snapshot: baseSnapshot }).snapshot;
        const normalizedTargetSnapshot = normalizePlaygroundEvaluationVersion({ snapshot: targetSnapshot }).snapshot;
        const baseRows = Array.isArray(normalizedBaseSnapshot.dataRows) ? normalizedBaseSnapshot.dataRows : [];
        const targetRows = Array.isArray(normalizedTargetSnapshot.dataRows) ? normalizedTargetSnapshot.dataRows : [];
        const rowIds = Array.from(new Set(baseRows.concat(targetRows).map((row, index) => (
          String(row?.id || ("row_" + (index + 1))).trim()
        )))).filter(Boolean);
        const files = [
          createPlaygroundVersionDiffFile({
            id: "config",
            path: "evaluation/config.json",
            before: {
              name: normalizedBaseSnapshot.name,
              passThreshold: normalizedBaseSnapshot.passThreshold,
              evaluator: normalizedBaseSnapshot.evaluator,
              targetAgentId: normalizedBaseSnapshot.targetAgentId,
              environmentType: normalizedBaseSnapshot.environmentType,
              environmentId: normalizedBaseSnapshot.environmentId,
              projectId: normalizedBaseSnapshot.projectId,
              cases: baseRows.map((row, index) => ({
                id: String(row?.id || ("row_" + (index + 1))).trim(),
                runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
              })),
            },
            after: {
              name: normalizedTargetSnapshot.name,
              passThreshold: normalizedTargetSnapshot.passThreshold,
              evaluator: normalizedTargetSnapshot.evaluator,
              targetAgentId: normalizedTargetSnapshot.targetAgentId,
              environmentType: normalizedTargetSnapshot.environmentType,
              environmentId: normalizedTargetSnapshot.environmentId,
              projectId: normalizedTargetSnapshot.projectId,
              cases: targetRows.map((row, index) => ({
                id: String(row?.id || ("row_" + (index + 1))).trim(),
                runCount: normalizePlaygroundEvaluationCaseRunCount(row?.runCount),
              })),
            },
          }),
          createPlaygroundVersionDiffFile({
            id: "description",
            path: "evaluation/description.md",
            before: normalizedBaseSnapshot.description || "",
            after: normalizedTargetSnapshot.description || "",
          }),
          createPlaygroundVersionDiffFile({
            id: "guidance",
            path: "evaluation/guidance.md",
            before: normalizedBaseSnapshot.evaluationGuidance || "",
            after: normalizedTargetSnapshot.evaluationGuidance || "",
          }),
        ];
        rowIds.forEach((rowId, index) => {
          const baseRow = baseRows.find((row) => String(row?.id || "").trim() === rowId) || null;
          const targetRow = targetRows.find((row) => String(row?.id || "").trim() === rowId) || null;
          const displayRow = targetRow || baseRow || {};
          files.push(createPlaygroundVersionDiffFile({
            id: "case:" + rowId,
            path: "evaluation/cases/" + createPlaygroundEvaluationVersionRowSlug(displayRow, index) + ".json",
            before: baseRow ? {
              input: baseRow.input,
              expectedOutput: baseRow.expectedOutput,
              evaluationGuidance: baseRow.evaluationGuidance,
              runCount: normalizePlaygroundEvaluationCaseRunCount(baseRow.runCount),
            } : null,
            after: targetRow ? {
              input: targetRow.input,
              expectedOutput: targetRow.expectedOutput,
              evaluationGuidance: targetRow.evaluationGuidance,
              runCount: normalizePlaygroundEvaluationCaseRunCount(targetRow.runCount),
            } : null,
          }));
        });
        return files.filter(Boolean);
      }

      function readPlaygroundEvaluationSetsFromStorage() {
        if (typeof window === "undefined" || !window.localStorage) {
          return [];
        }
        try {
          const parsed = JSON.parse(window.localStorage.getItem(PLAYGROUND_EVALUATIONS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed)
            ? parsed.map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
            : [];
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
            JSON.stringify((Array.isArray(sets) ? sets : []).map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set))))
          );
        } catch {
          // Ignore storage write failures; the in-memory editor should remain usable.
        }
      }

      function readPlaygroundEvaluationListFromPayload(payload, keys = []) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        for (const key of keys) {
          if (Array.isArray(source[key])) return source[key];
          if (Array.isArray(source.data?.[key])) return source.data[key];
        }
        if (Array.isArray(source.data)) return source.data;
        if (Array.isArray(source.items)) return source.items;
        if (Array.isArray(source.records)) return source.records;
        return [];
      }

      function buildPlaygroundEvaluationBackendMetadata(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const existingMetadata = stripPlaygroundEvaluationVersionMetadata(normalizedSet.metadata);
        const creator = normalizePlaygroundEvaluationPersonIdentity(normalizedSet.creator || normalizedSet.createdBy || {});
        return {
          ...(existingMetadata && typeof existingMetadata === "object" && !Array.isArray(existingMetadata) ? existingMetadata : {}),
          evaluationGuidance: normalizedSet.evaluationGuidance,
          evaluation_guidance: normalizedSet.evaluationGuidance,
          passThreshold: normalizedSet.passThreshold,
          pass_threshold: normalizedSet.passThreshold,
          evaluator: normalizePlaygroundEvaluationEvaluator(normalizedSet.evaluator),
          targetAgentId: normalizedSet.targetAgentId,
          target_agent_id: normalizedSet.targetAgentId,
          environmentType: normalizedSet.environmentType,
          environment_type: normalizedSet.environmentType,
          environmentId: normalizedSet.environmentId,
          environment_id: normalizedSet.environmentId,
          projectId: normalizedSet.projectId,
          project_id: normalizedSet.projectId,
          creator,
          createdBy: creator,
          created_by: creator,
        };
      }

      function buildPlaygroundEvaluationBackendPayload(set) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        return {
          id: normalizedSet.id,
          name: normalizedSet.name,
          description: normalizedSet.description,
          cases: normalizedSet.dataRows.map((row, index) => normalizePlaygroundEvaluationDataRow(row, index)),
          metadata: buildPlaygroundEvaluationBackendMetadata(normalizedSet),
        };
      }

      function buildPlaygroundEvaluationRunBackendPayload(run) {
        const normalizedRun = normalizePlaygroundEvaluationRun(run);
        return {
          id: normalizedRun.id,
          runId: normalizedRun.id,
          run_id: normalizedRun.id,
          agentId: normalizedRun.targetAgentId,
          agent_id: normalizedRun.targetAgentId,
          environmentId: normalizedRun.environmentId,
          environment_id: normalizedRun.environmentId,
          computerId: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
          computer_id: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
          versionId: normalizedRun.evaluationVersionId,
          version_id: normalizedRun.evaluationVersionId,
          status: normalizedRun.status,
          averageScore: normalizedRun.averageScore,
          average_score: normalizedRun.averageScore,
          passRate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
          pass_rate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
          costCt: normalizedRun.costTokens,
          cost_ct: normalizedRun.costTokens,
          costUsd: normalizedRun.costUsd,
          cost_usd: normalizedRun.costUsd,
          metadata: {
            ...(normalizedRun.metadata && typeof normalizedRun.metadata === "object" && !Array.isArray(normalizedRun.metadata) ? normalizedRun.metadata : {}),
            fineTuningJobId: normalizedRun.fineTuningJobId,
            fine_tuning_job_id: normalizedRun.fine_tuning_job_id,
            targetAgentVersionId: normalizedRun.targetAgentVersionId,
            target_agent_version_id: normalizedRun.targetAgentVersionId,
            targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber,
            target_agent_version_number: normalizedRun.targetAgentVersionNumber,
            targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel,
            target_agent_version_label: normalizedRun.targetAgentVersionLabel,
            run: normalizedRun,
          },
          run: normalizedRun,
        };
      }

      function mergePlaygroundEvaluationSetWithBackendDetails(set, versions = [], runs = []) {
        const normalizedSet = normalizePlaygroundEvaluationSet(set);
        const normalizedRuns = (Array.isArray(runs) ? runs : [])
          .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
          .filter((run) => run.id);
        const normalizedVersions = normalizePlaygroundEvaluationVersions(versions);
        const setWithRuns = normalizePlaygroundEvaluationSet({
          ...normalizedSet,
          runs: normalizedRuns,
        });
        return ensurePlaygroundEvaluationInitialVersion(
          normalizedVersions.length
            ? createPlaygroundEvaluationWithVersionList(setWithRuns, normalizedVersions)
            : setWithRuns
        );
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

      function getPlaygroundEvaluationAgentActiveVersion(agent) {
        const versions = typeof readPlaygroundAgentVersions === "function"
          ? readPlaygroundAgentVersions(agent)
          : [];
        const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
          ? agent.metadata
          : {};
        const activeVersionId = String(
          agent?.activeAgentVersionId
          || agent?.active_agent_version_id
          || metadata.activeAgentVersionId
          || metadata.active_agent_version_id
          || ""
        ).trim();
        return (activeVersionId ? versions.find((version) => version.id === activeVersionId) : null)
          || versions.find((version) => String(version.status || "").trim().toLowerCase() === "active")
          || versions[0]
          || null;
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

      function normalizePlaygroundEvaluationSourceThread(record, fallbackIndex = 0) {
        const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
          ? runnerPlayground.taskPreview
          : {};
        const agent = source.agent && typeof source.agent === "object" && !Array.isArray(source.agent) ? source.agent : {};
        const environment = source.environment && typeof source.environment === "object" && !Array.isArray(source.environment)
          ? source.environment
          : source.computer && typeof source.computer === "object" && !Array.isArray(source.computer)
            ? source.computer
            : {};
        const threadId = String(source.id || source.threadId || source.thread_id || "").trim();
        return {
          id: threadId,
          title: String(source.title || source.name || source.subject || taskPreview.title || "Untitled thread").trim() || "Untitled thread",
          status: String(source.status || source.state || "").trim(),
          agentId: String(source.agentId || source.agent_id || agent.id || metadata.agentId || metadata.agent_id || runnerPlayground.agentId || taskPreview.agentId || "").trim(),
          agentName: String(source.agentName || source.agent_name || agent.name || agent.label || metadata.agentName || metadata.agent_name || runnerPlayground.agentName || taskPreview.agentName || "").trim(),
          environmentId: String(source.environmentId || source.environment_id || source.computerId || source.computer_id || environment.id || metadata.environmentId || metadata.environment_id || runnerPlayground.environmentId || taskPreview.environmentId || "").trim(),
          environmentName: String(source.environmentName || source.environment_name || source.computerName || source.computer_name || environment.name || environment.label || metadata.environmentName || metadata.environment_name || runnerPlayground.environmentName || taskPreview.environmentName || "").trim(),
          createdAt: String(source.createdAt || source.created_at || "").trim(),
          updatedAt: String(source.updatedAt || source.updated_at || source.completedAt || source.completed_at || source.finishedAt || source.finished_at || source.createdAt || source.created_at || "").trim(),
          messageCount: Number.isFinite(Number(source.messageCount || source.message_count)) ? Number(source.messageCount || source.message_count) : 0,
        };
      }

      function getPlaygroundEvaluationThreadMessageRole(message) {
        const source = message && typeof message === "object" && !Array.isArray(message) ? message : {};
        const author = source.author && typeof source.author === "object" && !Array.isArray(source.author) ? source.author : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
        return String(
          source.role
          || source.senderRole
          || source.sender_role
          || source.type
          || source.kind
          || author.role
          || author.type
          || metadata.role
          || metadata.senderRole
          || ""
        ).trim().toLowerCase();
      }

      function getPlaygroundEvaluationThreadMessageText(message) {
        return readPlaygroundEvaluationRecordText(message);
      }

      function extractPlaygroundEvaluationThreadCaseInput(messages, thread) {
        const userTexts = (Array.isArray(messages) ? messages : [])
          .map((message) => ({
            role: getPlaygroundEvaluationThreadMessageRole(message),
            text: getPlaygroundEvaluationThreadMessageText(message),
          }))
          .filter((message) => {
            if (!message.text) return false;
            if (!message.role) return true;
            return message.role === "user" || message.role === "human" || message.role === "customer" || message.role === "email";
          })
          .map((message) => message.text)
          .filter(Boolean);
        if (userTexts.length === 1) {
          return userTexts[0];
        }
        if (userTexts.length > 1) {
          return userTexts.map((text, index) => "User message " + (index + 1) + ":\n" + text).join("\n\n");
        }
        return String(thread?.title || "Historical thread").trim();
      }

      async function fetchPlaygroundEvaluationThreadMessages({ backendUrl, requestHeaders, threadId }) {
        const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
        const normalizedThreadId = String(threadId || "").trim();
        if (!normalizedBackendUrl || !normalizedThreadId) {
          return [];
        }
        const data = await fetchPlaygroundEvaluationJson({
          backendUrl: normalizedBackendUrl,
          requestHeaders,
          path: "/threads/" + encodeURIComponent(normalizedThreadId) + "/messages?limit=120&compact=1",
        });
        return normalizePlaygroundEvaluationResponseArray(data, ["messages"]);
      }

      async function buildPlaygroundEvaluationDataRowFromThread({ thread, backendUrl, requestHeaders, index = 0 }) {
        const sourceThread = normalizePlaygroundEvaluationSourceThread(thread, index);
        const [messagesResult, summaryResult] = await Promise.allSettled([
          fetchPlaygroundEvaluationThreadMessages({
            backendUrl,
            requestHeaders,
            threadId: sourceThread.id,
          }),
          fetchPlaygroundEvaluationThreadFinalSummary({
            backendUrl: String(backendUrl || "").replace(/\/+$/, ""),
            requestHeaders,
            threadId: sourceThread.id,
          }),
        ]);
        const messages = messagesResult.status === "fulfilled" ? messagesResult.value : [];
        const expectedOutput = summaryResult.status === "fulfilled" ? String(summaryResult.value || "").trim() : "";
        const input = extractPlaygroundEvaluationThreadCaseInput(messages, sourceThread);
        const nowIso = new Date(Date.now() + index).toISOString();
        const sourceMetadata = {
          source: "thread",
          sourceThreadId: sourceThread.id,
          sourceThreadTitle: sourceThread.title,
          sourceAgentId: sourceThread.agentId,
          sourceAgentName: sourceThread.agentName,
          sourceEnvironmentId: sourceThread.environmentId,
          sourceEnvironmentName: sourceThread.environmentName,
          sourceCreatedAt: sourceThread.createdAt,
          sourceUpdatedAt: sourceThread.updatedAt,
          generatedAt: nowIso,
          extractionVersion: "thread_case_v1",
        };
        return normalizePlaygroundEvaluationDataRow({
          id: createPlaygroundEvaluationId("eval_case"),
          input,
          expectedOutput,
          evaluationGuidance: [
            "This case was generated from historical thread " + sourceThread.id + ".",
            "Use the expected output as the reference behavior for the historical run summary. Do not require exact wording unless the expected output or dataset guidance says exact wording matters.",
            expectedOutput ? "" : "Review this draft before running it because no historical run summary could be extracted automatically."
          ].filter(Boolean).join("\n"),
          runCount: 1,
          sourceThreadId: sourceThread.id,
          sourceThreadTitle: sourceThread.title,
          sourceAgentId: sourceThread.agentId,
          sourceAgentName: sourceThread.agentName,
          sourceEnvironmentId: sourceThread.environmentId,
          sourceEnvironmentName: sourceThread.environmentName,
          sourceCreatedAt: sourceThread.createdAt,
          sourceUpdatedAt: sourceThread.updatedAt,
          reviewStatus: "draft",
          metadata: sourceMetadata,
          createdAt: nowIso,
          updatedAt: nowIso,
        }, index);
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
        const score = Math.max(0, Math.min(1, Number(value) || 0));
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
          backendUrl,
          requestHeaders,
          agents,
          environments,
          projects,
          defaultAgentId,
          defaultEnvironmentId,
          currentUserId,
          currentUserName,
          currentUserEmail,
          currentUserAvatarUrl,
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
          evaluationRunReturnTarget,
          onEvaluationRunBack,
          topNavActionsPortalId,
          versionsDrawerPortalId,
          onVersionsSidebarOpenChange,
          threadRecords,
          onRefreshThreadRecords,
          shouldLoadData = false,
        } = options;
        const evaluationActionsPopoverRef = useRef(null);
        const evaluationPublishMenuRef = useRef(null);
        const evaluationRenameInputRef = useRef(null);
        const evaluationGuidanceTextareaRef = useRef(null);
        const evaluationCaseEditorTextareaRefs = useRef({});
        const evaluationCaseEditorFrameRef = useRef(null);
        const evaluationCaseEditorCloseTimerRef = useRef(null);
        const evaluationCreateModalFrameRef = useRef(null);
        const evaluationCreateModalCloseTimerRef = useRef(null);
        const evaluationRunModalFrameRef = useRef(null);
        const evaluationRunModalCloseTimerRef = useRef(null);
        const evaluationVersionDescriptionTextareaRef = useRef(null);
        const evaluationVersionModalFrameRef = useRef(null);
        const evaluationVersionModalCloseTimerRef = useRef(null);
        const evaluationVersionBaselineRef = useRef({ key: "", signature: "" });
        const evaluationVersionDraftTouchedRef = useRef(false);
        const evaluationBackendLoadRef = useRef("");
        const evaluationBackendLoadedRef = useRef(false);
        const evaluationDetailsLoadedRef = useRef(new Set());
        const evaluationBackendMigratedLocalRef = useRef(false);
        const evaluationSetPersistTimersRef = useRef(new Map());
        const evaluationSetPersistSignaturesRef = useRef(new Map());
        const evaluationJsonlFileInputRef = useRef(null);
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
        const [evaluationSetsSortMode, setEvaluationSetsSortMode] = useState("updated-desc");
        const [evaluationSetsFilterMode, setEvaluationSetsFilterMode] = useState("all");
        const [evaluationSetsToolbarPopover, setEvaluationSetsToolbarPopover] = useState("");
        const [evaluationSetsVisibleCount, setEvaluationSetsVisibleCount] = useState(10);
        const [evaluationSetRowMenuId, setEvaluationSetRowMenuId] = useState("");
        const [selectedEvaluationOverviewIds, setSelectedEvaluationOverviewIds] = useState(() => new Set());
        const [evaluationRunRowMenuId, setEvaluationRunRowMenuId] = useState("");
        const [evaluationCaseRowMenuId, setEvaluationCaseRowMenuId] = useState("");
        const [evaluationCreateModalVisible, setEvaluationCreateModalVisible] = useState(false);
        const [evaluationCreateModalClosing, setEvaluationCreateModalClosing] = useState(false);
        const [evaluationRunModalVisible, setEvaluationRunModalVisible] = useState(false);
        const [evaluationRunModalClosing, setEvaluationRunModalClosing] = useState(false);
        const [evaluationGuidanceEditingId, setEvaluationGuidanceEditingId] = useState("");
        const [evaluationGuidanceHistoryById, setEvaluationGuidanceHistoryById] = useState({});
        const [evaluationCaseEditorState, setEvaluationCaseEditorState] = useState(null);
        const [evaluationCaseEditorVisible, setEvaluationCaseEditorVisible] = useState(false);
        const [evaluationCaseEditorClosing, setEvaluationCaseEditorClosing] = useState(false);
        const [evaluationCaseEditorMarkdownEditingKey, setEvaluationCaseEditorMarkdownEditingKey] = useState("");
        const [evaluationCaseEditorMarkdownHistoryByKey, setEvaluationCaseEditorMarkdownHistoryByKey] = useState({});
        const [evaluationJsonlFileDragging, setEvaluationJsonlFileDragging] = useState(false);
        const [evaluationJsonlFileImportError, setEvaluationJsonlFileImportError] = useState("");
        const [evaluationJsonlFileImportMessage, setEvaluationJsonlFileImportMessage] = useState("");
        const [evaluationThreadCaseModalSetId, setEvaluationThreadCaseModalSetId] = useState("");
        const [evaluationThreadCaseSearchQuery, setEvaluationThreadCaseSearchQuery] = useState("");
        const [evaluationThreadCaseSelectedIds, setEvaluationThreadCaseSelectedIds] = useState([]);
        const [evaluationThreadCaseStatus, setEvaluationThreadCaseStatus] = useState({ status: "idle", message: "", error: "" });
        const [evaluationPendingThreadCasesBySetId, setEvaluationPendingThreadCasesBySetId] = useState({});
        const [evaluationVersionsSidebarOpen, setEvaluationVersionsSidebarOpen] = useState(false);
        const [evaluationPublishMenuOpen, setEvaluationPublishMenuOpen] = useState(false);
        const [evaluationVersionsHeaderMenuOpen, setEvaluationVersionsHeaderMenuOpen] = useState(false);
        const [evaluationVersionState, setEvaluationVersionState] = useState({ status: "idle", message: "", error: "" });
        const [evaluationVersionModal, setEvaluationVersionModal] = useState(null);
        const [evaluationVersionModalVisible, setEvaluationVersionModalVisible] = useState(false);
        const [evaluationVersionModalClosing, setEvaluationVersionModalClosing] = useState(false);
        const [evaluationVersionNameDraft, setEvaluationVersionNameDraft] = useState("");
        const [evaluationVersionDescriptionDraft, setEvaluationVersionDescriptionDraft] = useState("");
        const [isEvaluationVersionDescriptionEditing, setIsEvaluationVersionDescriptionEditing] = useState(false);
        const [evaluationVersionChangesState, setEvaluationVersionChangesState] = useState(null);
        const [openEvaluationVersionMenuId, setOpenEvaluationVersionMenuId] = useState("");
        const [evaluationBackendSyncState, setEvaluationBackendSyncState] = useState({ status: "idle", error: "" });
        const requestHeadersSignature = useMemo(() => JSON.stringify(requestHeaders || {}), [requestHeaders]);
        const currentEvaluationCreator = normalizePlaygroundEvaluationPersonIdentity({
          id: currentUserId || currentUserEmail || "",
          userId: currentUserId || "",
          name: currentUserName || "",
          email: currentUserEmail || "",
          avatarUrl: currentUserAvatarUrl || "",
        });
        const normalizedSets = (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)));
        const agentOptions = Array.isArray(agents) ? agents : [];
        const environmentOptions = Array.isArray(environments) ? environments : [];
        const projectOptions = Array.isArray(projects) ? projects : [];
        const sourceThreadOptions = (Array.isArray(threadRecords) ? threadRecords : [])
          .map((thread, index) => normalizePlaygroundEvaluationSourceThread(thread, index))
          .filter((thread) => thread.id);
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

        async function requestEvaluationBackendJson(path, init = {}, fallbackMessage = "Evaluation request failed.") {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            throw new Error("Evaluation backend is unavailable.");
          }
          const headers = new Headers(requestHeaders || {});
          if (init.body !== undefined && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
          }
          const response = await fetch(normalizedBackendUrl + path, {
            credentials: "include",
            cache: "no-store",
            ...init,
            headers,
          });
          return await readPlaygroundEvaluationBackendJson(response, fallbackMessage);
        }

        async function fetchBackendEvaluationSetDetails(set, allRuns = [], options = {}) {
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          if (!normalizedSet.id) return normalizedSet;
          const versionsPayload = options.includeVersions === false
            ? null
            : await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(normalizedSet.id) + "/versions",
                { method: "GET" },
                "Failed to load evaluation versions."
              ).catch(() => null);
          const versions = readPlaygroundEvaluationListFromPayload(versionsPayload || {}, ["versions", "evaluationVersions", "evaluation_versions"])
            .map((version, index) => normalizePlaygroundEvaluationVersion(version, index));
          const runs = (Array.isArray(allRuns) ? allRuns : [])
            .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
            .filter((run) => String(run.evaluationSetId || run.evaluationId || "").trim() === normalizedSet.id);
          return mergePlaygroundEvaluationSetWithBackendDetails(normalizedSet, versions, runs);
        }

        async function reloadBackendEvaluationSet(setId, options = {}) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return null;
          const [setPayload, runsPayload] = await Promise.all([
            requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(normalizedSetId),
              { method: "GET" },
              "Failed to load evaluation."
            ),
            requestEvaluationBackendJson(
              "/evaluations/runs?evaluationId=" + encodeURIComponent(normalizedSetId) + "&limit=1000",
              { method: "GET" },
              "Failed to load evaluation runs."
            ).catch(() => ({ runs: [] })),
          ]);
          const backendSet = normalizePlaygroundEvaluationSet(setPayload?.evaluation || setPayload?.data || setPayload);
          const backendRuns = readPlaygroundEvaluationListFromPayload(runsPayload || {}, ["runs", "evaluationRuns", "evaluation_runs"]);
          const detailedSet = await fetchBackendEvaluationSetDetails(backendSet, backendRuns);
          if (detailedSet?.id && typeof setEvaluationSets === "function") {
            evaluationDetailsLoadedRef.current.add(detailedSet.id);
            replaceEvaluationSet(detailedSet, {
              clearRunSelection: options.clearRunSelection !== false,
              rememberBaseline: options.rememberBaseline !== false,
              select: options.select !== false,
              persist: false,
            });
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
          }
          return detailedSet;
        }

        async function migrateLocalEvaluationSetToBackend(localSet) {
          const normalizedLocalSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(localSet));
          const createdPayload = await requestEvaluationBackendJson(
            "/evaluations",
            {
              method: "POST",
              body: JSON.stringify(buildPlaygroundEvaluationBackendPayload(normalizedLocalSet)),
            },
            "Failed to migrate evaluation."
          );
          const createdSet = normalizePlaygroundEvaluationSet(createdPayload?.evaluation || createdPayload?.data || createdPayload);
          if (!createdSet.id) return null;
          const localVersions = readSelectedEvaluationVersions(normalizedLocalSet)
            .slice()
            .sort((left, right) => Number(left.version || 0) - Number(right.version || 0));
          for (const localVersion of localVersions) {
            try {
              const versionPayload = await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(createdSet.id) + "/versions",
                {
                  method: "POST",
                  body: JSON.stringify({
                    label: localVersion.label,
                    name: localVersion.label,
                    description: localVersion.description,
                    snapshot: localVersion.snapshot || buildPlaygroundEvaluationVersionSnapshot(normalizedLocalSet),
                    metadata: buildPlaygroundEvaluationBackendMetadata(normalizedLocalSet),
                  }),
                },
                "Failed to migrate evaluation version."
              );
              const createdVersion = normalizePlaygroundEvaluationVersion(versionPayload?.version || versionPayload?.data || versionPayload);
              if (localVersion.status === "active" && createdVersion.id) {
                await requestEvaluationBackendJson(
                  "/evaluations/" + encodeURIComponent(createdSet.id) + "/versions/" + encodeURIComponent(createdVersion.id) + "/publish",
                  {
                    method: "POST",
                    body: JSON.stringify({ snapshot: localVersion.snapshot || buildPlaygroundEvaluationVersionSnapshot(normalizedLocalSet) }),
                  },
                  "Failed to publish migrated evaluation version."
                ).catch(() => null);
              }
            } catch {
              // Keep migrating other durable references.
            }
          }
          const localRuns = (Array.isArray(normalizedLocalSet.runs) ? normalizedLocalSet.runs : [])
            .map((run, index) => normalizePlaygroundEvaluationRun({
              ...run,
              evaluationId: createdSet.id,
              evaluationSetId: createdSet.id,
            }, index))
            .filter((run) => run.id);
          for (const localRun of localRuns) {
            try {
              await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(createdSet.id) + "/runs",
                {
                  method: "POST",
                  body: JSON.stringify(buildPlaygroundEvaluationRunBackendPayload(localRun)),
                },
                "Failed to migrate evaluation run."
              );
            } catch {
              // Keep migrating the rest.
            }
          }
          return await reloadBackendEvaluationSet(createdSet.id, { clearRunSelection: false, select: false });
        }

        async function loadBackendEvaluationSets(options = {}) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl || typeof setEvaluationSets !== "function") return [];
          const loadKey = normalizedBackendUrl + "|" + requestHeadersSignature;
          if (!options.force && evaluationBackendLoadRef.current === loadKey) return normalizedSets;
          if (evaluationBackendLoadRef.current !== loadKey) {
            evaluationDetailsLoadedRef.current = new Set();
          }
          evaluationBackendLoadRef.current = loadKey;
          setEvaluationBackendSyncState({ status: "loading", error: "" });
          try {
            const [setsPayload, runsPayload] = await Promise.all([
              requestEvaluationBackendJson("/evaluations?limit=500", { method: "GET" }, "Failed to load evaluations."),
              requestEvaluationBackendJson("/evaluations/runs?limit=1000", { method: "GET" }, "Failed to load evaluation runs.").catch(() => ({ runs: [] })),
            ]);
            const backendSets = readPlaygroundEvaluationListFromPayload(setsPayload || {}, ["evaluations", "evaluationSets", "evaluation_sets"])
              .map((set) => normalizePlaygroundEvaluationSet(set))
              .filter((set) => set.id);
            const backendRuns = readPlaygroundEvaluationListFromPayload(runsPayload || {}, ["runs", "evaluationRuns", "evaluation_runs"])
              .map((run, index) => normalizePlaygroundEvaluationRun(run, index))
              .filter((run) => run.id);
            let detailedSets = await Promise.all(backendSets.map((set) => fetchBackendEvaluationSetDetails(set, backendRuns, { includeVersions: false })));
            if (!detailedSets.length && !evaluationBackendMigratedLocalRef.current) {
              evaluationBackendMigratedLocalRef.current = true;
              const localSets = readPlaygroundEvaluationSetsFromStorage()
                .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
                .filter((set) => set.id);
              if (localSets.length) {
                const migratedSets = [];
                for (const localSet of localSets) {
                  try {
                    const migratedSet = await migrateLocalEvaluationSetToBackend(localSet);
                    if (migratedSet?.id) migratedSets.push(migratedSet);
                  } catch {
                    // Keep migrating the rest; failed local entries remain in browser storage for manual recovery.
                  }
                }
                detailedSets = migratedSets;
              }
            }
            detailedSets = detailedSets
              .map((set) => ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set)))
              .sort((left, right) => (Date.parse(right.updatedAt || 0) || 0) - (Date.parse(left.updatedAt || 0) || 0));
            setEvaluationSets(detailedSets);
            evaluationSetPersistSignaturesRef.current = new Map(detailedSets.map((set) => [
              set.id,
              JSON.stringify(buildPlaygroundEvaluationBackendPayload(set)),
            ]));
            evaluationBackendLoadedRef.current = true;
            setEvaluationBackendSyncState({ status: "idle", error: "" });
            const selectedStillExists = detailedSets.some((set) => set.id === selectedEvaluationSetId);
            if (!selectedStillExists) {
              setSelectedEvaluationSetId(detailedSets[0]?.id || "");
              setSelectedEvaluationRunId("");
              if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
              if (!detailedSets[0]?.id) setEvaluationsPageMode("overview");
            }
            return detailedSets;
          } catch (error) {
            evaluationBackendLoadRef.current = "";
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            return normalizedSets;
          }
        }

        useEffect(() => {
          if (!shouldLoadData) {
            return undefined;
          }
          void loadBackendEvaluationSets({ force: false });
          return undefined;
        }, [backendUrl, requestHeadersSignature, shouldLoadData]);

        useEffect(() => () => {
          evaluationSetPersistTimersRef.current.forEach((timer) => {
            if (typeof window !== "undefined") {
              window.clearTimeout(timer);
            } else {
              clearTimeout(timer);
            }
          });
          evaluationSetPersistTimersRef.current.clear();
        }, []);

        useEffect(() => {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          const normalizedRunId = String(selectedEvaluationRunId || "").trim();
          const normalizedSetId = String(selectedEvaluationSetId || "").trim();
          if (!normalizedBackendUrl || !normalizedRunId || (evaluationsPageMode !== "run" && evaluationsPageMode !== "case")) {
            return undefined;
          }
          if (activeRun?.id === normalizedRunId && Array.isArray(activeRun.cases) && activeRun.cases.length > 0) {
            return undefined;
          }
          let cancelled = false;
          void (async () => {
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(normalizedRunId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.");
              if (cancelled) return;
              const run = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
              if (!run.id) return;
              const runSetId = String(run.evaluationSetId || run.evaluationId || normalizedSetId || "").trim();
              if (!runSetId) return;
              if (typeof setSelectedEvaluationSetId === "function" && runSetId !== normalizedSetId) {
                setSelectedEvaluationSetId(runSetId);
              }
              upsertEvaluationRun(runSetId, run, {
                targetAgentId: run.targetAgentId,
                environmentType: run.environmentType,
                environmentId: run.environmentId,
                projectId: run.projectId,
                evaluator: run.evaluator,
                passThreshold: run.passThreshold,
              });
            } catch (error) {
              console.warn("[evaluations] Failed to hydrate selected evaluation run", error);
            }
          })();
          return () => {
            cancelled = true;
          };
        }, [
          backendUrl,
          selectedEvaluationRunId,
          selectedEvaluationSetId,
          evaluationsPageMode,
          activeRun?.id,
          activeRun?.cases?.length,
          requestHeadersSignature,
        ]);

        useEffect(() => {
          const normalizedSetId = String(activeSet?.id || selectedEvaluationSetId || "").trim();
          const needsVersionSurface = evaluationVersionsSidebarOpen
            || evaluationPublishMenuOpen
            || evaluationVersionsHeaderMenuOpen
            || Boolean(evaluationVersionChangesState)
            || Boolean(evaluationVersionModal)
            || Boolean(openEvaluationVersionMenuId);
          if (!shouldLoadData || !backendUrl || !isEvaluationDetailPage || !normalizedSetId || !needsVersionSurface) {
            return undefined;
          }
          if (evaluationDetailsLoadedRef.current.has(normalizedSetId)) {
            return undefined;
          }
          let cancelled = false;
          void reloadBackendEvaluationSet(normalizedSetId, {
            clearRunSelection: false,
            select: false,
            rememberBaseline: !evaluationVersionDraftTouchedRef.current,
          }).catch((error) => {
            if (cancelled) return;
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          return () => {
            cancelled = true;
          };
        }, [
          activeSet?.id,
          backendUrl,
          evaluationPublishMenuOpen,
          evaluationVersionChangesState,
          evaluationVersionModal,
          evaluationVersionsHeaderMenuOpen,
          evaluationVersionsSidebarOpen,
          isEvaluationDetailPage,
          openEvaluationVersionMenuId,
          requestHeadersSignature,
          selectedEvaluationSetId,
          shouldLoadData,
        ]);

        useEffect(() => {
          if (typeof onVersionsSidebarOpenChange !== "function") {
            return undefined;
          }
          onVersionsSidebarOpenChange(Boolean(evaluationVersionsSidebarOpen));
          return () => onVersionsSidebarOpenChange(false);
        }, [evaluationVersionsSidebarOpen, onVersionsSidebarOpenChange]);

        useEffect(() => {
          if (!activeSet?.id || !isEvaluationDetailPage) {
            return;
          }
          playgroundEvaluationVersionController.rememberBaseline(activeSet, evaluationVersionBaselineRef);
        }, [
          activeSet?.id,
          activeSet?.metadata?.restoredFromEvaluationVersionId,
          activeSet?.metadata?.restored_from_evaluation_version_id,
          isEvaluationDetailPage,
        ]);

        useEffect(() => {
          if (isEvaluationDetailPage) {
            return;
          }
          setEvaluationVersionsSidebarOpen(false);
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setEvaluationVersionChangesState(null);
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionModal(null);
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionNameDraft("");
          setEvaluationVersionDescriptionDraft("");
          setIsEvaluationVersionDescriptionEditing(false);
          evaluationVersionDraftTouchedRef.current = false;
        }, [isEvaluationDetailPage]);

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
          if (!evaluationCaseEditorMarkdownEditingKey || typeof window === "undefined") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            const textarea = evaluationCaseEditorTextareaRefs.current[evaluationCaseEditorMarkdownEditingKey];
            if (!textarea) return;
            textarea.focus();
            resizeEvaluationGuidanceTextarea(textarea);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [evaluationCaseEditorMarkdownEditingKey]);

        useEffect(() => {
          if (!evaluationCreateModalOpen) {
            if (!evaluationCreateModalClosing) {
              setEvaluationCreateModalVisible(false);
            }
            return undefined;
          }
          setEvaluationCreateModalClosing(false);
          setEvaluationCreateModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationCreateModalVisible(true);
            return undefined;
          }
          if (evaluationCreateModalCloseTimerRef.current) {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
            evaluationCreateModalCloseTimerRef.current = null;
          }
          if (evaluationCreateModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
            evaluationCreateModalFrameRef.current = null;
          }
          evaluationCreateModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationCreateModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationCreateModalFrameRef.current = null;
              setEvaluationCreateModalVisible(true);
            });
          });
          return undefined;
        }, [evaluationCreateModalOpen]);

        useEffect(() => {
          if (!evaluationRunModalOpen) {
            if (!evaluationRunModalClosing) {
              setEvaluationRunModalVisible(false);
            }
            return undefined;
          }
          setEvaluationRunModalClosing(false);
          setEvaluationRunModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationRunModalVisible(true);
            return undefined;
          }
          if (evaluationRunModalCloseTimerRef.current) {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
            evaluationRunModalCloseTimerRef.current = null;
          }
          if (evaluationRunModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
            evaluationRunModalFrameRef.current = null;
          }
          evaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationRunModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationRunModalFrameRef.current = null;
              setEvaluationRunModalVisible(true);
            });
          });
          return undefined;
        }, [evaluationRunModalOpen]);

        useEffect(() => {
          if (!topNavActionsPortalId || typeof document === "undefined") {
            setEvaluationTopNavActionsContainer(null);
            return undefined;
          }
          let disposed = false;
          const updateContainer = () => {
            if (disposed) return;
            setEvaluationTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
          };
          updateContainer();
          const frameIds = [];
          if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
            const scheduleLookup = () => {
              const frameId = window.requestAnimationFrame(() => {
                updateContainer();
                const container = document.getElementById(topNavActionsPortalId);
                if (!container) {
                  scheduleLookup();
                }
              });
              frameIds.push(frameId);
            };
            scheduleLookup();
          }
          const observer = typeof MutationObserver !== "undefined"
            ? new MutationObserver(updateContainer)
            : null;
          if (observer && document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
          }
          return () => {
            disposed = true;
            if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
              frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId));
            }
            if (observer) observer.disconnect();
          };
        }, [topNavActionsPortalId, normalizedMode, activeSet?.id]);

        useEffect(() => () => {
          if (evaluationCaseEditorFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
            evaluationCaseEditorFrameRef.current = null;
          }
          if (evaluationCaseEditorCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
            evaluationCaseEditorCloseTimerRef.current = null;
          }
          if (evaluationCreateModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
            evaluationCreateModalFrameRef.current = null;
          }
          if (evaluationCreateModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
            evaluationCreateModalCloseTimerRef.current = null;
          }
          if (evaluationRunModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
            evaluationRunModalFrameRef.current = null;
          }
          if (evaluationRunModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
            evaluationRunModalCloseTimerRef.current = null;
          }
          if (evaluationVersionModalFrameRef.current && typeof window !== "undefined") {
            window.cancelAnimationFrame(evaluationVersionModalFrameRef.current);
            evaluationVersionModalFrameRef.current = null;
          }
          if (evaluationVersionModalCloseTimerRef.current && typeof window !== "undefined") {
            window.clearTimeout(evaluationVersionModalCloseTimerRef.current);
            evaluationVersionModalCloseTimerRef.current = null;
          }
        }, []);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            return undefined;
          }

          function handleEvaluationVersionKeyboardShortcuts(event) {
            if (event.defaultPrevented || evaluationVersionModal || evaluationVersionState.status === "loading") {
              return;
            }
            const isCommand = event.metaKey || event.ctrlKey;
            if (!isCommand) return;
            const key = String(event.key || "").toLowerCase();
            if (key === "s") {
              event.preventDefault();
              if (event.shiftKey) {
                openCreateEvaluationVersionModal();
              } else {
                saveCurrentEvaluationVersion();
              }
            } else if (key === "p" && !event.shiftKey) {
              event.preventDefault();
              if (canPublishSelectedEvaluationVersion()) {
                publishCurrentEvaluationVersion();
              } else {
                setEvaluationVersionsSidebarOpen(true);
              }
            }
          }

          window.addEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
          return () => window.removeEventListener("keydown", handleEvaluationVersionKeyboardShortcuts);
        }, [
          activeSet,
          evaluationVersionModal,
          evaluationVersionState.status,
          isEvaluationDetailPage,
        ]);

        useEffect(() => {
          if (!isEvaluationDetailPage) {
            setEvaluationActionsPopoverOpen(false);
            setEvaluationRunRowMenuId("");
            setEvaluationCaseRowMenuId("");
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

        function updateEvaluationSet(setId, updater, options = {}) {
          if (typeof setEvaluationSets !== "function") return;
          if (options.markVersionTouched !== false) {
            evaluationVersionDraftTouchedRef.current = true;
          }
          let nextSetForPersistence = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) {
              return normalized;
            }
            const nextSet = typeof updater === "function" ? updater(normalized) : normalized;
            nextSetForPersistence = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet({ ...nextSet, updatedAt: new Date().toISOString() }));
            return nextSetForPersistence;
          }));
          if (nextSetForPersistence) {
            schedulePersistEvaluationSet(nextSetForPersistence, options);
          }
        }

        function replaceEvaluationSet(nextSet, options = {}) {
          const normalizedNextSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(nextSet));
          if (!normalizedNextSet.id || typeof setEvaluationSets !== "function") return normalizedNextSet;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => (
            normalizePlaygroundEvaluationSet(item).id === normalizedNextSet.id ? normalizedNextSet : item
          )));
          if (options.select !== false) {
            setSelectedEvaluationSetId(normalizedNextSet.id);
          }
          if (options.clearRunSelection !== false) {
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
          }
          if (options.rememberBaseline !== false) {
            playgroundEvaluationVersionController.rememberBaseline(normalizedNextSet, evaluationVersionBaselineRef, { force: true });
            evaluationVersionDraftTouchedRef.current = false;
          }
          if (options.persist === true) {
            schedulePersistEvaluationSet(normalizedNextSet, { delayMs: 0 });
          }
          return normalizedNextSet;
        }

        async function persistEvaluationSetToBackend(set) {
          const normalizedSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set));
          if (!normalizedSet.id) return null;
          const payload = buildPlaygroundEvaluationBackendPayload(normalizedSet);
          const signature = JSON.stringify(payload);
          if (evaluationSetPersistSignaturesRef.current.get(normalizedSet.id) === signature) {
            return normalizedSet;
          }
          const data = await requestEvaluationBackendJson(
            "/evaluations/" + encodeURIComponent(normalizedSet.id),
            {
              method: "PATCH",
              body: JSON.stringify(payload),
            },
            "Failed to save evaluation."
          );
          evaluationSetPersistSignaturesRef.current.set(normalizedSet.id, signature);
          return normalizePlaygroundEvaluationSet(data?.evaluation || data?.data || data || normalizedSet);
        }

        function schedulePersistEvaluationSet(set, options = {}) {
          const normalizedSet = ensurePlaygroundEvaluationInitialVersion(normalizePlaygroundEvaluationSet(set));
          if (!normalizedSet.id || !String(backendUrl || "").trim()) return;
          if (options.persist === false) return;
          const delayMs = Math.max(0, Number(options.delayMs ?? 450) || 0);
          const existingTimer = evaluationSetPersistTimersRef.current.get(normalizedSet.id);
          if (existingTimer) {
            if (typeof window !== "undefined") {
              window.clearTimeout(existingTimer);
            } else {
              clearTimeout(existingTimer);
            }
          }
          const runPersist = () => {
            evaluationSetPersistTimersRef.current.delete(normalizedSet.id);
            void persistEvaluationSetToBackend(normalizedSet).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          };
          if (delayMs === 0) {
            runPersist();
            return;
          }
          const timer = typeof window !== "undefined"
            ? window.setTimeout(runPersist, delayMs)
            : setTimeout(runPersist, delayMs);
          evaluationSetPersistTimersRef.current.set(normalizedSet.id, timer);
        }

        async function persistEvaluationRunToBackend(run) {
          const normalizedRun = normalizePlaygroundEvaluationRun(run);
          if (!normalizedRun.id) return null;
          const data = await requestEvaluationBackendJson(
            "/evaluations/runs/" + encodeURIComponent(normalizedRun.id),
            {
              method: "PATCH",
              body: JSON.stringify(buildPlaygroundEvaluationRunBackendPayload(normalizedRun)),
            },
            "Failed to save evaluation run."
          );
          return normalizePlaygroundEvaluationRun(data?.run || data?.data || data || normalizedRun);
        }

        async function deleteEvaluationRunFromBackend(runId) {
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedRunId) return false;
          const data = await requestEvaluationBackendJson(
            "/evaluations/runs/" + encodeURIComponent(normalizedRunId),
            { method: "DELETE" },
            "Failed to delete evaluation run."
          );
          return data?.deleted !== false;
        }

        function getEvaluationVersionMetadata(set = activeSet) {
          return playgroundEvaluationVersionController.getMetadata(set);
        }

        function readSelectedEvaluationVersions(set = activeSet) {
          return playgroundEvaluationVersionController.readVersions(set);
        }

        function getSelectedEvaluationActiveVersion(set = activeSet) {
          return playgroundEvaluationVersionController.getActiveVersion(set);
        }

        function getSelectedEvaluationVersion(set = activeSet) {
          return playgroundEvaluationVersionController.getSelectedVersion(set);
        }

        function getEvaluationPublishedRunSource(set = activeSet) {
          if (!set) return null;
          const normalizedSet = normalizePlaygroundEvaluationSet(set);
          if (String(backendUrl || "").trim() && normalizedSet.id && !evaluationDetailsLoadedRef.current.has(normalizedSet.id)) {
            return null;
          }
          const activeVersion = getSelectedEvaluationActiveVersion(normalizedSet);
          if (!activeVersion || activeVersion.status !== "active") {
            return null;
          }
          const versions = readSelectedEvaluationVersions(normalizedSet);
          return {
            version: activeVersion,
            set: createPlaygroundEvaluationFromVersionSnapshot(normalizedSet, activeVersion, versions, activeVersion.id),
          };
        }

        function getEvaluationRunnableCaseCount(set = activeSet) {
          const runSource = getEvaluationPublishedRunSource(set);
          return Array.isArray(runSource?.set?.dataRows) ? runSource.set.dataRows.length : 0;
        }

        function hasSelectedEvaluationVersionChanges() {
          return playgroundEvaluationVersionController.hasDraftChanges(activeSet, evaluationVersionBaselineRef, {
            touched: evaluationVersionDraftTouchedRef.current,
          });
        }

        function canPublishSelectedEvaluationVersion() {
          const selectedVersion = getSelectedEvaluationVersion();
          if (!selectedVersion) return false;
          const hasChanges = hasSelectedEvaluationVersionChanges();
          return selectedVersion.status === "active" ? hasChanges : !hasChanges;
        }

        function canPublishEvaluationVersion(version) {
          const normalizedVersionId = String(version?.id || "").trim();
          if (!normalizedVersionId) return false;
          const selectedVersion = getSelectedEvaluationVersion();
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const isActiveVersion = String(version?.status || "").toLowerCase() === "active";
          if (isActiveVersion) {
            return Boolean(selectedVersion?.id === normalizedVersionId && hasChanges);
          }
          return !hasChanges;
        }

        function buildEvaluationSetForRepublish() {
          return normalizePlaygroundEvaluationSet({
            ...activeSet,
            runs: [],
            updatedAt: new Date().toISOString(),
          });
        }

        function applyEvaluationVersionResult(result, options = {}) {
          if (!result?.resource) return null;
          const nextSet = replaceEvaluationSet(result.resource, options);
          setEvaluationVersionState({ status: "idle", message: "", error: "" });
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionsHeaderMenuOpen(false);
          return nextSet;
        }

        async function saveCurrentEvaluationVersion() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (!hasSelectedEvaluationVersionChanges()) return null;
          const selectedVersion = getSelectedEvaluationVersion();
          const result = playgroundEvaluationVersionController.buildSaveCurrentResource(activeSet, { status: "saved" });
          const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: false, persist: false });
          if (!nextSet) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(nextSet);
            if (selectedVersion?.id && selectedVersion.status !== "active") {
              await requestEvaluationBackendJson(
                "/evaluations/" + encodeURIComponent(nextSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id),
                {
                  method: "PATCH",
                  body: JSON.stringify({
                    label: selectedVersion.label,
                    description: selectedVersion.description,
                    snapshot: buildPlaygroundEvaluationVersionSnapshot(nextSet),
                  }),
                },
                "Failed to save evaluation version."
              ).catch(() => null);
            }
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet.id, { clearRunSelection: false, select: false });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return nextSet;
          }
        }

        async function createEvaluationNewVersionResource(versionDetails = {}, options = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (!options.force && !hasSelectedEvaluationVersionChanges()) return null;
          const resetSet = normalizePlaygroundEvaluationSet({
            ...activeSet,
            runs: [],
            updatedAt: new Date().toISOString(),
          });
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(resetSet);
            const versionPayload = await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(resetSet.id) + "/versions",
              {
                method: "POST",
                body: JSON.stringify({
                  label: versionDetails.label,
                  name: versionDetails.label,
                  description: versionDetails.description,
                  snapshot: buildPlaygroundEvaluationVersionSnapshot(resetSet),
                  metadata: buildPlaygroundEvaluationBackendMetadata(resetSet),
                }),
              },
              "Failed to create evaluation version."
            );
            const createdVersion = normalizePlaygroundEvaluationVersion(versionPayload?.version || versionPayload?.data || versionPayload);
            const versions = [
              createdVersion,
              ...readSelectedEvaluationVersions(resetSet).filter((version) => version.id !== createdVersion.id),
            ];
            const nextSet = createPlaygroundEvaluationWithVersionList(resetSet, versions, createdVersion.id);
            replaceEvaluationSet(nextSet, { clearRunSelection: true, rememberBaseline: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function updateEvaluationVersionDetails(versionId, versionDetails = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
              {
                method: "PATCH",
                body: JSON.stringify({
                  label: versionDetails.label,
                  name: versionDetails.label,
                  description: versionDetails.description,
                }),
              },
              "Failed to update evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildVersionMetadataResource(activeSet, normalizedVersionId, versionDetails);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: false, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: false });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function publishCurrentEvaluationVersion() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const selectedVersion = getSelectedEvaluationVersion();
          const hasChanges = hasSelectedEvaluationVersionChanges();
          if (hasChanges && selectedVersion?.status !== "active") {
            setEvaluationVersionState({
              status: "error",
              message: "",
              error: "Save this version before publishing.",
            });
            return null;
          }
          if (!canPublishSelectedEvaluationVersion()) return null;
          const sourceSet = hasChanges ? buildEvaluationSetForRepublish() : activeSet;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await persistEvaluationSetToBackend(sourceSet);
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(selectedVersion.id) + "/publish",
              {
                method: "POST",
                body: JSON.stringify({
                  snapshot: buildPlaygroundEvaluationVersionSnapshot(sourceSet),
                }),
              },
              "Failed to publish evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildPublishSelectedResource(sourceSet, {
              updateFromResource: hasChanges,
            });
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || sourceSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function restoreEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/restore",
              { method: "POST" },
              "Failed to restore evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildRestoreVersionResource(activeSet, normalizedVersionId);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function publishEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const normalizedVersionId = String(versionId || "").trim();
          const selectedVersion = getSelectedEvaluationVersion();
          const targetVersion = readSelectedEvaluationVersions().find((version) => version.id === normalizedVersionId);
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const shouldRepublishCurrentEditor = Boolean(
            targetVersion
            && targetVersion.status === "active"
            && selectedVersion?.id === targetVersion.id
            && hasChanges
          );
          if (hasChanges && !shouldRepublishCurrentEditor) {
            setEvaluationVersionState({
              status: "error",
              message: "",
              error: "Save this version before publishing.",
            });
            return null;
          }
          if (!canPublishEvaluationVersion(targetVersion)) return null;
          const sourceSet = shouldRepublishCurrentEditor ? buildEvaluationSetForRepublish() : activeSet;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            if (shouldRepublishCurrentEditor) {
              await persistEvaluationSetToBackend(sourceSet);
            }
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(sourceSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId) + "/publish",
              {
                method: "POST",
                body: JSON.stringify({
                  snapshot: shouldRepublishCurrentEditor ? buildPlaygroundEvaluationVersionSnapshot(sourceSet) : undefined,
                }),
              },
              "Failed to publish evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildPublishVersionResource(sourceSet, normalizedVersionId, {
              updateFromResource: shouldRepublishCurrentEditor,
            });
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || sourceSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function deleteEvaluationVersion(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          if (readSelectedEvaluationVersions().length <= 1) return null;
          const normalizedVersionId = String(versionId || "").trim();
          if (!normalizedVersionId) return null;
          setEvaluationVersionState({ status: "loading", message: "", error: "" });
          try {
            await requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(activeSet.id) + "/versions/" + encodeURIComponent(normalizedVersionId),
              { method: "DELETE" },
              "Failed to delete evaluation version."
            );
            const result = playgroundEvaluationVersionController.buildDeleteVersionResource(activeSet, normalizedVersionId);
            const nextSet = applyEvaluationVersionResult(result, { clearRunSelection: true, persist: false });
            setEvaluationVersionState({ status: "idle", message: "", error: "" });
            return await reloadBackendEvaluationSet(nextSet?.id || activeSet.id, { clearRunSelection: true });
          } catch (error) {
            setEvaluationVersionState({ status: "error", message: "", error: error?.message || String(error) });
            return null;
          }
        }

        async function revertEvaluationVersionDraft() {
          if (!activeSet || evaluationVersionState.status === "loading") return null;
          const selectedVersion = getSelectedEvaluationVersion();
          if (!selectedVersion) return null;
          return await restoreEvaluationVersion(selectedVersion.id);
        }

        function getEvaluationVersionPopupActions(options = {}) {
          const hasChanges = hasSelectedEvaluationVersionChanges();
          const canPublish = canPublishSelectedEvaluationVersion();
          const includeVersionHistory = options.includeVersionHistory !== false;
          return [
            {
              id: "publish",
              label: "Publish",
              Icon: Rocket,
              shortcut: "⌘P",
              disabled: !canPublish,
              onClick: publishCurrentEvaluationVersion,
            },
            {
              id: "save",
              label: "Save",
              Icon: Save,
              shortcut: "⌘S",
              disabled: !hasChanges,
              onClick: saveCurrentEvaluationVersion,
            },
            {
              id: "save-new",
              label: "Save to new Version",
              Icon: GitBranchPlus,
              shortcut: "⇧⌘S",
              disabled: !hasChanges,
              onClick: () => openCreateEvaluationVersionModal(),
            },
            {
              id: "revert",
              label: "Revert to last saved Version",
              Icon: Undo2,
              disabled: !hasChanges,
              onClick: revertEvaluationVersionDraft,
            },
            includeVersionHistory
              ? {
                  id: "history",
                  label: "Open version history",
                  Icon: History,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    setEvaluationVersionsHeaderMenuOpen(false);
                    openEvaluationVersionChangesPage();
                  },
                }
              : null,
          ].filter(Boolean);
        }

        function cancelEvaluationVersionModalAnimation() {
          if (typeof window === "undefined") return;
          if (evaluationVersionModalCloseTimerRef.current) {
            window.clearTimeout(evaluationVersionModalCloseTimerRef.current);
            evaluationVersionModalCloseTimerRef.current = null;
          }
          if (evaluationVersionModalFrameRef.current) {
            window.cancelAnimationFrame(evaluationVersionModalFrameRef.current);
            evaluationVersionModalFrameRef.current = null;
          }
        }

        function finishCloseEvaluationVersionModal() {
          cancelEvaluationVersionModalAnimation();
          setEvaluationVersionModal(null);
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionNameDraft("");
          setEvaluationVersionDescriptionDraft("");
          setIsEvaluationVersionDescriptionEditing(false);
        }

        function openEvaluationVersionModal(nextModal, draft = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          cancelEvaluationVersionModalAnimation();
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setOpenEvaluationVersionMenuId("");
          setEvaluationVersionState((current) => current.status === "loading" ? current : {
            status: "idle",
            message: "",
            error: "",
          });
          setEvaluationVersionNameDraft(String(draft.name || "").trim());
          setEvaluationVersionDescriptionDraft(String(draft.description || ""));
          setIsEvaluationVersionDescriptionEditing(false);
          setEvaluationVersionModal(nextModal);
          setEvaluationVersionModalClosing(false);
          setEvaluationVersionModalVisible(false);
          if (typeof window === "undefined") {
            setEvaluationVersionModalVisible(true);
            return;
          }
          evaluationVersionModalFrameRef.current = window.requestAnimationFrame(() => {
            evaluationVersionModalFrameRef.current = window.requestAnimationFrame(() => {
              evaluationVersionModalFrameRef.current = null;
              setEvaluationVersionModalVisible(true);
            });
          });
        }

        function openCreateEvaluationVersionModal(options = {}) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          const forceNewVersion = Boolean(options.force);
          if (!forceNewVersion && !hasSelectedEvaluationVersionChanges()) return;
          const versions = readSelectedEvaluationVersions();
          const nextVersionNumber = versions.reduce((maxVersion, version) => Math.max(maxVersion, Number(version.version || 0)), 0) + 1;
          openEvaluationVersionModal(
            { mode: "create", force: forceNewVersion },
            { name: "Version " + nextVersionNumber, description: "" }
          );
        }

        function openEditEvaluationVersionModal(versionId) {
          if (!activeSet || evaluationVersionState.status === "loading") return;
          const normalizedVersionId = String(versionId || "").trim();
          const targetVersion = readSelectedEvaluationVersions().find((version) => version.id === normalizedVersionId);
          if (!targetVersion) return;
          openEvaluationVersionModal(
            { mode: "edit", versionId: normalizedVersionId },
            {
              name: targetVersion.label || ("Version " + targetVersion.version),
              description: targetVersion.description || "",
            }
          );
        }

        function closeEvaluationVersionModal(options = {}) {
          if (evaluationVersionState.status === "loading") return;
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationVersionModal();
            return;
          }
          if (!evaluationVersionModal || evaluationVersionModalClosing) return;
          cancelEvaluationVersionModalAnimation();
          setEvaluationVersionModalVisible(false);
          setEvaluationVersionModalClosing(true);
          evaluationVersionModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationVersionModalCloseTimerRef.current = null;
            finishCloseEvaluationVersionModal();
          }, 90);
        }

        async function commitEvaluationVersionModal() {
          if (!evaluationVersionModal || evaluationVersionState.status === "loading") return;
          const label = String(evaluationVersionNameDraft || "").trim() || "Version";
          const description = String(evaluationVersionDescriptionDraft || "").trim();
          const savedSet = evaluationVersionModal.mode === "edit"
            ? await updateEvaluationVersionDetails(evaluationVersionModal.versionId, { label, description })
            : await createEvaluationNewVersionResource({ label, description }, {
                force: Boolean(evaluationVersionModal.force),
              });
          if (savedSet) {
            closeEvaluationVersionModal();
          }
        }

        function applyEvaluationVersionDescriptionMarkdownFormat(formatType) {
          const textarea = evaluationVersionDescriptionTextareaRef.current;
          const value = String(evaluationVersionDescriptionDraft || "");
          const selectionStart = textarea && typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = textarea && typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;
          if (formatType === "bold") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildEvaluationMarkdownWrappedEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildEvaluationMarkdownListEdit(value, selectionStart, selectionEnd, "unordered");
          }
          if (!edit) return;
          setEvaluationVersionDescriptionDraft(edit.value);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const nextTextarea = evaluationVersionDescriptionTextareaRef.current;
            if (!nextTextarea) return;
            const maxLength = edit.value.length;
            const safeSelectionStart = Math.max(0, Math.min(edit.selectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(edit.selectionEnd, maxLength));
            nextTextarea.focus();
            nextTextarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeEvaluationGuidanceTextarea(nextTextarea);
          });
        }

        const EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID = "current_editor";
        const getEvaluationVersionCompareVersionSourceId = (versionId) => {
          const normalizedVersionId = String(versionId || "").trim();
          return normalizedVersionId ? "version:" + normalizedVersionId : "";
        };
        const getEvaluationVersionCompareVersionLabel = (version) => String(version?.label || ("Version " + version?.version)).trim() || "Version";
        const buildEvaluationVersionCompareSources = (versions) => [
          {
            id: EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID,
            label: "Current editor",
            snapshot: buildPlaygroundEvaluationVersionSnapshot(activeSet),
          },
          ...(Array.isArray(versions) ? versions : []).map((version) => ({
            id: getEvaluationVersionCompareVersionSourceId(version.id),
            label: getEvaluationVersionCompareVersionLabel(version),
            snapshot: normalizePlaygroundEvaluationVersion(version).snapshot,
          })),
        ];
        const resolveEvaluationVersionCompareSource = (sourceId, sources, fallbackSource) => {
          const normalizedSourceId = String(sourceId || "").trim();
          return sources.find((source) => source.id === normalizedSourceId) || fallbackSource || sources[0] || null;
        };
        const getDefaultEvaluationVersionCompareLeftSourceId = (versions) => {
          const activeVersion = getSelectedEvaluationActiveVersion();
          return activeVersion ? getEvaluationVersionCompareVersionSourceId(activeVersion.id) : EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
        };

        function openEvaluationVersionChangesPage(versionId, options = {}) {
          if (!activeSet) return;
          const versions = readSelectedEvaluationVersions();
          const normalizedVersionId = String(versionId || "").trim();
          const leftSourceId = String(options.leftSourceId || "").trim()
            || (normalizedVersionId
              ? getEvaluationVersionCompareVersionSourceId(normalizedVersionId)
              : getDefaultEvaluationVersionCompareLeftSourceId(versions));
          const rightSourceId = String(options.rightSourceId || "").trim() || EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
          setOpenEvaluationVersionMenuId("");
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          setEvaluationVersionsSidebarOpen(true);
          setEvaluationVersionChangesState({ leftSourceId, rightSourceId });
        }

        function closeEvaluationVersionChangesPage() {
          setEvaluationVersionChangesState(null);
        }

        function handleEvaluationVersionCompareSourceChange(side, sourceId) {
          const normalizedSide = side === "left" ? "leftSourceId" : "rightSourceId";
          setEvaluationVersionChangesState((current) => ({
            ...(current || {}),
            [normalizedSide]: sourceId,
          }));
        }

        function closeEvaluationVersionsSidebar() {
          setEvaluationVersionsSidebarOpen(false);
          setEvaluationPublishMenuOpen(false);
          setEvaluationVersionsHeaderMenuOpen(false);
          finishCloseEvaluationVersionModal();
          setEvaluationVersionChangesState(null);
          setOpenEvaluationVersionMenuId("");
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

        function buildEvaluationCaseEditorFieldKey(state, field) {
          const source = state && typeof state === "object" && !Array.isArray(state) ? state : {};
          const baseId = source.rowId || (source.isNew ? "new:" + String(source.index || 0) : "case");
          return "case:" + String(source.setId || "") + ":" + String(baseId || "case") + ":" + String(field || "");
        }

        function updateEvaluationCaseEditorMarkdownValue(editorKey, field, value, options = {}) {
          const normalizedField = String(field || "");
          if (!normalizedField) return;
          const nextValue = String(value ?? "");
          const previousValue = String(evaluationCaseEditorState?.draft?.[normalizedField] ?? "");
          if (previousValue === nextValue) return;
          if (options.recordHistory !== false) {
            setEvaluationCaseEditorMarkdownHistoryByKey((current) => {
              const currentHistory = current[editorKey] || { past: [], future: [] };
              return {
                ...current,
                [editorKey]: {
                  past: [...(Array.isArray(currentHistory.past) ? currentHistory.past : []), previousValue].slice(-80),
                  future: [],
                },
              };
            });
          }
          updateEvaluationCaseEditorDraft({ [normalizedField]: nextValue });
        }

        function focusEvaluationCaseEditorTextarea(editorKey, value) {
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationCaseEditorTextareaRefs.current[editorKey];
            if (!textarea) return;
            const nextCaret = String(value || "").length;
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function applyEvaluationCaseEditorMarkdownSelection(editorKey, field, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateEvaluationCaseEditorMarkdownValue(editorKey, field, nextValue);
          if (typeof window === "undefined") return;
          window.requestAnimationFrame(() => {
            const textarea = evaluationCaseEditorTextareaRefs.current[editorKey];
            if (!textarea) return;
            const maxLength = String(nextValue || "").length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeEvaluationGuidanceTextarea(textarea);
          });
        }

        function handleEvaluationCaseEditorMarkdownFormat(editorKey, field, formatType) {
          const textarea = evaluationCaseEditorTextareaRefs.current[editorKey];
          const value = String(evaluationCaseEditorState?.draft?.[field] ?? "");
          if (!textarea) return;
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
          applyEvaluationCaseEditorMarkdownSelection(editorKey, field, edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function updateEvaluationRunCase(setId, runId, caseId, patch) {
          evaluationVersionDraftTouchedRef.current = true;
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
                costUsd: cases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
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
          const normalizedIncomingRun = normalizePlaygroundEvaluationRun(run);
          const normalizedRun = normalizePlaygroundEvaluationRun({
            ...normalizedIncomingRun,
            evaluationVersionId: normalizedIncomingRun.evaluationVersionId,
            evaluationVersionNumber: normalizedIncomingRun.evaluationVersionNumber,
            evaluationVersionLabel: normalizedIncomingRun.evaluationVersionLabel,
            targetAgentVersionId: normalizedIncomingRun.targetAgentVersionId,
            targetAgentVersionNumber: normalizedIncomingRun.targetAgentVersionNumber,
            targetAgentVersionLabel: normalizedIncomingRun.targetAgentVersionLabel,
            targetAgentVersionRevisionId: normalizedIncomingRun.targetAgentVersionRevisionId,
          });
          if (!normalizedRun.id) return;
          evaluationVersionDraftTouchedRef.current = true;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalized = normalizePlaygroundEvaluationSet(item);
            if (normalized.id !== setId) return normalized;
            const existingRun = normalized.runs.find((itemRun) => itemRun.id === normalizedRun.id) || null;
            const nextRun = existingRun
              ? normalizePlaygroundEvaluationRun({
                  ...existingRun,
                  ...normalizedRun,
                  evaluationVersionId: normalizedRun.evaluationVersionId || existingRun.evaluationVersionId,
                  evaluationVersionNumber: normalizedRun.evaluationVersionNumber || existingRun.evaluationVersionNumber,
                  evaluationVersionLabel: normalizedRun.evaluationVersionLabel || existingRun.evaluationVersionLabel,
                  targetAgentVersionId: normalizedRun.targetAgentVersionId || existingRun.targetAgentVersionId,
                  targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber || existingRun.targetAgentVersionNumber,
                  targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel || existingRun.targetAgentVersionLabel,
                  targetAgentVersionRevisionId: normalizedRun.targetAgentVersionRevisionId || existingRun.targetAgentVersionRevisionId,
                })
              : normalizedRun;
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalized,
              ...setPatch,
              runs: [nextRun, ...normalized.runs.filter((itemRun) => itemRun.id !== normalizedRun.id)],
              updatedAt: new Date().toISOString(),
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            const activeVersion = getSelectedEvaluationActiveVersion(nextSet);
            const targetVersionId = String(nextRun.evaluationVersionId || activeVersion?.id || "").trim();
            if (!targetVersionId || !versions.length) {
              return nextSet;
            }
            const nextVersions = versions.map((version) => {
              if (version.id !== targetVersionId) return version;
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              const nextVersionRuns = [nextRun, ...versionRuns.filter((itemRun) => itemRun.id !== nextRun.id)];
              return normalizePlaygroundEvaluationVersion({
                ...version,
                updatedAt: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          announceEvaluationRunThreads(normalizedRun);
        }

        function markEvaluationRunPollingFailed(setId, runId, fallbackRun, error) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || fallbackRun?.id || "").trim();
          if (!normalizedSetId || !normalizedRunId || typeof setEvaluationSets !== "function") {
            return;
          }
          evaluationVersionDraftTouchedRef.current = true;
          const errorMessage = error?.message || String(error || "Failed to load evaluation run.");
          let runToAnnounce = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            const existingRun = normalizedSet.runs.find((run) => run.id === normalizedRunId) || null;
            const sourceRun = existingRun || normalizePlaygroundEvaluationRun(fallbackRun || { id: normalizedRunId });
            if (!sourceRun.id) return normalizedSet;
            if (!isPlaygroundEvaluationRunActive(sourceRun)) {
              runToAnnounce = sourceRun;
              return normalizedSet;
            }
            const nextCases = sourceRun.cases.map((caseItem) => (
              isPlaygroundEvaluationCaseActive(caseItem)
                ? normalizePlaygroundEvaluationRunCase({
                    ...caseItem,
                    status: "error",
                    error: errorMessage,
                    completedAt: new Date().toISOString(),
                  })
                : caseItem
            ));
            const activeCases = nextCases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
            const errorCases = nextCases.filter((caseItem) => caseItem.status === "error");
            const passThreshold = normalizePlaygroundEvaluationPassThreshold(sourceRun.passThreshold);
            const nextRun = normalizePlaygroundEvaluationRun({
              ...sourceRun,
              cases: nextCases,
              averageScore: nextCases.length > 0
                ? nextCases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / nextCases.length
                : 0,
              passedCount: nextCases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error" && Number(caseItem.score || 0) >= passThreshold).length,
              totalCount: nextCases.length,
              costTokens: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
              costUsd: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
              status: activeCases.length > 0 ? "running" : errorCases.length === nextCases.length && nextCases.length > 0 ? "failed" : "completed",
              completedAt: activeCases.length > 0 ? sourceRun.completedAt : new Date().toISOString(),
            });
            runToAnnounce = nextRun;
            return normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: [nextRun, ...normalizedSet.runs.filter((run) => run.id !== normalizedRunId)],
              updatedAt: new Date().toISOString(),
            });
          }));
          if (runToAnnounce) {
            announceEvaluationRunThreads(runToAnnounce);
          }
        }

        async function pollEvaluationRun(setId, runId) {
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl || !runId) return;
          let consecutiveFailures = 0;
          for (let attempt = 0; attempt < 480; attempt += 1) {
            await sleepPlaygroundEvaluationFrontend(attempt === 0 ? 700 : 1200);
            try {
              const response = await fetch(normalizedBackendUrl + "/evaluations/runs/" + encodeURIComponent(runId), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: requestHeaders || {},
              });
              const data = await readPlaygroundEvaluationBackendJson(response, "Failed to load evaluation run.");
              const nextRun = normalizePlaygroundEvaluationRun(data?.run || data?.data || data);
              consecutiveFailures = 0;
              if (!nextRun.id) return;
              upsertEvaluationRun(setId, nextRun);
              if (!isPlaygroundEvaluationRunActive(nextRun)) {
                return;
              }
            } catch (error) {
              consecutiveFailures += 1;
              if (consecutiveFailures >= 8) {
                throw error;
              }
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

        function buildEvaluationCreateFormDefaults() {
          return {
            name: "",
            targetAgentId: "",
            environmentId: "",
            passThreshold: "80",
            evaluatorType: "agent",
            evaluatorAgentId: getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
            evaluatorCode: "",
          };
        }

        function openEvaluationCreateModal() {
          setEvaluationSetRowMenuId("");
          setEvaluationSetsToolbarPopover("");
          if (typeof setEvaluationCreateForm === "function") {
            setEvaluationCreateForm(buildEvaluationCreateFormDefaults());
          }
          if (typeof setEvaluationCreateModalOpen === "function") {
            setEvaluationCreateModalOpen(true);
          }
        }

        function finishCloseEvaluationCreateModal(options = {}) {
          if (typeof window !== "undefined") {
            if (evaluationCreateModalFrameRef.current) {
              window.cancelAnimationFrame(evaluationCreateModalFrameRef.current);
              evaluationCreateModalFrameRef.current = null;
            }
            if (evaluationCreateModalCloseTimerRef.current) {
              window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
              evaluationCreateModalCloseTimerRef.current = null;
            }
          }
          setEvaluationCreateModalVisible(false);
          setEvaluationCreateModalClosing(false);
          if (typeof setEvaluationCreateModalOpen === "function") {
            setEvaluationCreateModalOpen(false);
          }
          if (options?.resetForm && typeof setEvaluationCreateForm === "function") {
            setEvaluationCreateForm(buildEvaluationCreateFormDefaults());
          }
        }

        function closeEvaluationCreateModal(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationCreateModal(options);
            return;
          }
          if ((!evaluationCreateModalOpen && !evaluationCreateModalClosing) || evaluationCreateModalClosing) {
            return;
          }
          setEvaluationCreateModalVisible(false);
          setEvaluationCreateModalClosing(true);
          if (evaluationCreateModalCloseTimerRef.current) {
            window.clearTimeout(evaluationCreateModalCloseTimerRef.current);
          }
          evaluationCreateModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationCreateModalCloseTimerRef.current = null;
            finishCloseEvaluationCreateModal(options);
          }, 75);
        }

        async function handleCreateEvaluation(event) {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const name = String(form.name || "").trim() || "New Evaluation";
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const passThreshold = normalizePlaygroundEvaluationPassThreshold(form.passThreshold || 80);
          const nextSet = ensurePlaygroundEvaluationInitialVersion(createPlaygroundEvaluationSetDraft({
            name,
            targetAgentId: "",
            environmentId: "",
            passThreshold,
            creator: currentEvaluationCreator,
            createdBy: currentEvaluationCreator,
            evaluator: {
              type: evaluatorType,
              agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
              code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
            },
          }));
          try {
            const createdPayload = await requestEvaluationBackendJson(
              "/evaluations",
              {
                method: "POST",
                body: JSON.stringify(buildPlaygroundEvaluationBackendPayload(nextSet)),
              },
              "Failed to create evaluation."
            );
            const createdSet = normalizePlaygroundEvaluationSet(createdPayload?.evaluation || createdPayload?.data || createdPayload || nextSet);
            const detailedSet = await fetchBackendEvaluationSetDetails(createdSet, []);
            setEvaluationSets((current) => [detailedSet, ...(Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== detailedSet.id)]);
            evaluationSetPersistSignaturesRef.current.set(detailedSet.id, JSON.stringify(buildPlaygroundEvaluationBackendPayload(detailedSet)));
            setSelectedEvaluationSetId(detailedSet.id);
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationDetailTab("general");
            setEvaluationsPageMode("detail");
            closeEvaluationCreateModal({ resetForm: true });
          } catch (error) {
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          }
        }

        function openRunEvaluationModal(setId) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const normalizedTargetSetId = String(targetSet.id || "").trim();
          if (String(backendUrl || "").trim() && normalizedTargetSetId && !evaluationDetailsLoadedRef.current.has(normalizedTargetSetId)) {
            setEvaluationBackendSyncState({ status: "loading", error: "" });
            void reloadBackendEvaluationSet(normalizedTargetSetId, {
              clearRunSelection: false,
              select: false,
              rememberBaseline: false,
            }).then((loadedSet) => {
              setEvaluationBackendSyncState({ status: "idle", error: "" });
              if (loadedSet?.id) {
                openRunEvaluationModal(loadedSet.id);
              }
            }).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
            return;
          }
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          if (!sourceSet) {
            if (typeof window !== "undefined") {
              window.alert("Publish this evaluation before running it.");
            }
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(sourceSet.evaluator);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, sourceSet.targetAgentId || defaultAgentId);
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          if (typeof setEvaluationRunForm === "function") {
            setEvaluationRunForm({
              setId: targetSet.id,
              name: "Run " + ((Array.isArray(sourceSet.runs) ? sourceSet.runs.length : 0) + 1),
              targetAgentId,
              environmentKey: selectedEnvironmentChoice?.key || "",
              evaluatorType: evaluator.type,
              evaluatorAgentId: evaluator.agentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
              evaluatorCode: evaluator.code || "",
            });
          }
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(true);
          }
        }

        function finishCloseEvaluationRunModal() {
          if (typeof window !== "undefined") {
            if (evaluationRunModalFrameRef.current) {
              window.cancelAnimationFrame(evaluationRunModalFrameRef.current);
              evaluationRunModalFrameRef.current = null;
            }
            if (evaluationRunModalCloseTimerRef.current) {
              window.clearTimeout(evaluationRunModalCloseTimerRef.current);
              evaluationRunModalCloseTimerRef.current = null;
            }
          }
          setEvaluationRunModalVisible(false);
          setEvaluationRunModalClosing(false);
          if (typeof setEvaluationRunModalOpen === "function") {
            setEvaluationRunModalOpen(false);
          }
        }

        function closeEvaluationRunModal(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationRunModal();
            return;
          }
          if ((!evaluationRunModalOpen && !evaluationRunModalClosing) || evaluationRunModalClosing) {
            return;
          }
          setEvaluationRunModalVisible(false);
          setEvaluationRunModalClosing(true);
          if (evaluationRunModalCloseTimerRef.current) {
            window.clearTimeout(evaluationRunModalCloseTimerRef.current);
          }
          evaluationRunModalCloseTimerRef.current = window.setTimeout(() => {
            evaluationRunModalCloseTimerRef.current = null;
            finishCloseEvaluationRunModal();
          }, 75);
        }

        async function handleRunEvaluation(setId, runOptions = {}) {
          const targetSet = normalizedSets.find((set) => set.id === setId) || activeSet;
          if (!targetSet) return;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set;
          const sourceVersion = runSource?.version;
          if (!sourceSet || !sourceVersion) {
            if (typeof window !== "undefined") {
              window.alert("Publish this evaluation before running it.");
            }
            return;
          }
          const selectedAgent = getPlaygroundEvaluationAgentRecord(agentOptions, runOptions.targetAgentId || sourceSet.targetAgentId || defaultAgentId);
          const targetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, sourceSet.targetAgentId || defaultAgentId);
          const resolvedAgentId = String(runOptions.targetAgentId || selectedAgent?.id || targetAgentId || "").trim();
          const selectedEnvironmentChoice = runOptions.environmentChoice
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          const targetEnvironmentId = String(selectedEnvironmentChoice?.environmentId || sourceSet.environmentId || defaultEnvironmentId || "").trim();
          const targetProjectId = String(selectedEnvironmentChoice?.projectId || "").trim();
          const targetEnvironmentType = selectedEnvironmentChoice?.type === "project" ? "project" : "computer";
          if (!resolvedAgentId || !targetEnvironmentId) {
            if (typeof window !== "undefined") {
              window.alert("Select an agent and environment before running this evaluation.");
            }
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(runOptions.evaluator || sourceSet.evaluator);
          const selectedAgentVersion = getPlaygroundEvaluationAgentActiveVersion(selectedAgent);
          const evaluationSetSnapshot = normalizePlaygroundEvaluationSet({
            ...sourceSet,
            targetAgentId: resolvedAgentId,
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            projectId: targetProjectId,
            evaluator,
          });
          const runRequestOptions = {
            id: createPlaygroundEvaluationId("eval_run"),
            label: String(runOptions.label || "").trim(),
            evaluationVersionId: String(sourceVersion.id || "").trim(),
            evaluationVersionNumber: Math.max(0, Number(sourceVersion.version || 0) || 0),
            evaluationVersionLabel: String(sourceVersion.label || (sourceVersion.version ? "Version " + sourceVersion.version : "") || "").trim(),
            targetAgentId: resolvedAgentId,
            targetAgentName: String(selectedAgent?.name || selectedAgent?.label || selectedAgent?.title || resolvedAgentId).trim(),
            targetAgentPhotoUrl: getPlaygroundEvaluationAgentPhotoUrl(selectedAgent),
            targetAgentVersionId: String(runOptions.targetAgentVersionId || selectedAgentVersion?.id || "").trim(),
            targetAgentVersionNumber: Math.max(0, Number(runOptions.targetAgentVersionNumber || selectedAgentVersion?.version || 0) || 0),
            targetAgentVersionLabel: String(runOptions.targetAgentVersionLabel || selectedAgentVersion?.label || (selectedAgentVersion?.version ? "Version " + selectedAgentVersion.version : "") || "").trim(),
            targetAgentVersionRevisionId: String(runOptions.targetAgentVersionRevisionId || selectedAgentVersion?.revisionId || selectedAgentVersion?.revision_id || "").trim(),
            fineTuningJobId: String(runOptions.fineTuningJobId || runOptions.fine_tuning_job_id || "").trim(),
            fine_tuning_job_id: String(runOptions.fine_tuning_job_id || runOptions.fineTuningJobId || "").trim(),
            environmentType: targetEnvironmentType,
            environmentId: targetEnvironmentId,
            environmentName: targetEnvironmentType === "computer" ? String(selectedEnvironmentChoice?.environmentName || selectedEnvironmentChoice?.name || targetEnvironmentId).trim() : "",
            projectId: targetProjectId,
            projectName: targetEnvironmentType === "project" ? String(selectedEnvironmentChoice?.projectName || selectedEnvironmentChoice?.name || targetProjectId).trim() : "",
            evaluator,
            passThreshold: normalizePlaygroundEvaluationPassThreshold(sourceSet.passThreshold),
            metadata: runOptions.metadata && typeof runOptions.metadata === "object" && !Array.isArray(runOptions.metadata)
              ? runOptions.metadata
              : null,
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
            const run = normalizePlaygroundEvaluationRun({
              ...runRequestOptions,
              ...(data?.run || data?.data || data || {}),
            });
            if (!run.id) {
              throw new Error("Evaluation run was created but no run id was returned.");
            }
            upsertEvaluationRun(targetSet.id, run, {
              targetAgentId: resolvedAgentId,
              environmentType: targetEnvironmentType,
              environmentId: targetEnvironmentId,
              projectId: targetProjectId,
              evaluator,
              passThreshold: normalizePlaygroundEvaluationPassThreshold(sourceSet.passThreshold),
            });
            setSelectedEvaluationSetId(targetSet.id);
            setSelectedEvaluationRunId(run.id);
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("run");
            void pollEvaluationRun(targetSet.id, run.id).catch((error) => {
              markEvaluationRunPollingFailed(targetSet.id, run.id, run, error);
            });
          } catch (error) {
            if (typeof window !== "undefined") {
              window.alert(error?.message || String(error));
            }
          }
        }

        function handleConfirmRunEvaluation(event) {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          if (!targetSet) return;
          const runSource = getEvaluationPublishedRunSource(targetSet);
          const sourceSet = runSource?.set || targetSet;
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, sourceSet, defaultEnvironmentId);
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const evaluator = {
            type: evaluatorType,
            agentId: evaluatorType === "agent" ? String(form.evaluatorAgentId || defaultAgentId || agentOptions[0]?.id || "").trim() : "",
            code: evaluatorType === "code" ? String(form.evaluatorCode || "") : "",
          };
          closeEvaluationRunModal();
          void handleRunEvaluation(targetSet.id, {
            label: String(form.name || "").trim(),
            targetAgentId: getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || sourceSet.targetAgentId || defaultAgentId),
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

        function openEvaluationRunRenameDialog(set, run) {
          if (!set?.id || !run?.id) {
            return;
          }
          setEvaluationRunRowMenuId("");
          setEvaluationRenameState({
            type: "run",
            setId: set.id,
            runId: run.id,
            originalName: String(run.label || ""),
          });
          setEvaluationRenameValue(String(run.label || "Evaluation Run"));
          setEvaluationRenameError("");
        }

        function updateEvaluationRunRecord(setId, runId, updater) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId || typeof updater !== "function") {
            return;
          }
          evaluationVersionDraftTouchedRef.current = true;
          let updatedRunForPersistence = null;
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            let updatedRun = null;
            const nextRuns = normalizedSet.runs.map((run) => {
              if (run.id !== normalizedRunId) return run;
              updatedRun = normalizePlaygroundEvaluationRun(updater(run));
              updatedRunForPersistence = updatedRun;
              return updatedRun;
            });
            if (!updatedRun) return normalizedSet;
            const now = new Date().toISOString();
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
              updatedAt: now,
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            if (!versions.length) return nextSet;
            const nextVersions = versions.map((version) => {
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              let versionChanged = false;
              const nextVersionRuns = versionRuns.map((run) => {
                const normalizedRun = normalizePlaygroundEvaluationRun(run);
                if (normalizedRun.id !== normalizedRunId) return normalizedRun;
                versionChanged = true;
                return normalizePlaygroundEvaluationRun(updater(normalizedRun));
              });
              if (!versionChanged) return version;
              return normalizePlaygroundEvaluationVersion({
                ...version,
                updatedAt: now,
                updated_at: now,
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          if (updatedRunForPersistence) {
            void persistEvaluationRunToBackend(updatedRunForPersistence).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          }
        }

        function deleteEvaluationRunCase(setId, runId, caseId) {
          const normalizedCaseId = String(caseId || "").trim();
          if (!normalizedCaseId) return;
          updateEvaluationRunRecord(setId, runId, (run) => {
            const nextCases = (Array.isArray(run.cases) ? run.cases : []).filter((caseItem) => caseItem.id !== normalizedCaseId);
            const activeCases = nextCases.filter((caseItem) => isPlaygroundEvaluationCaseActive(caseItem));
            const errorCases = nextCases.filter((caseItem) => caseItem.status === "error");
            const passThreshold = normalizePlaygroundEvaluationPassThreshold(run.passThreshold);
            const completedCases = nextCases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error");
            return normalizePlaygroundEvaluationRun({
              ...run,
              cases: nextCases,
              averageScore: nextCases.length > 0
                ? nextCases.reduce((sum, caseItem) => sum + Number(caseItem.score || 0), 0) / nextCases.length
                : 0,
              passedCount: completedCases.filter((caseItem) => Number(caseItem.score || 0) >= passThreshold).length,
              totalCount: nextCases.length,
              costTokens: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationTokenCount(caseItem.costTokens), 0),
              costUsd: nextCases.reduce((sum, caseItem) => sum + normalizePlaygroundEvaluationUsdCost(caseItem.costUsd), 0),
              status: activeCases.length > 0 ? "running" : errorCases.length === nextCases.length && nextCases.length > 0 ? "failed" : "completed",
              updatedAt: new Date().toISOString(),
            });
          });
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
          if (evaluationRenameState.type === "run") {
            updateEvaluationRunRecord(evaluationRenameState.setId, evaluationRenameState.runId, (run) => ({
              ...run,
              label: nextName,
              updatedAt: new Date().toISOString(),
            }));
            closeEvaluationRenameDialog();
            return;
          }
          updateEvaluationSet(evaluationRenameState.setId, (set) => ({
            ...set,
            name: nextName,
          }));
          closeEvaluationRenameDialog();
        }

        function handleDeleteEvaluationRun(setId, runId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedSetId || !normalizedRunId) return;
          setEvaluationRunRowMenuId("");
          void deleteEvaluationRunFromBackend(normalizedRunId).catch((error) => {
            setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
          });
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).map((item) => {
            const normalizedSet = normalizePlaygroundEvaluationSet(item);
            if (normalizedSet.id !== normalizedSetId) return normalizedSet;
            const now = new Date().toISOString();
            const nextRuns = normalizedSet.runs.filter((run) => run.id !== normalizedRunId);
            const nextSet = normalizePlaygroundEvaluationSet({
              ...normalizedSet,
              runs: nextRuns,
              updatedAt: now,
            });
            const versions = readSelectedEvaluationVersions(nextSet);
            if (!versions.length) return nextSet;
            const nextVersions = versions.map((version) => {
              const versionRuns = Array.isArray(version.snapshot?.runs) ? version.snapshot.runs : [];
              const nextVersionRuns = versionRuns
                .map((run) => normalizePlaygroundEvaluationRun(run))
                .filter((run) => run.id !== normalizedRunId);
              if (nextVersionRuns.length === versionRuns.length) return version;
              return normalizePlaygroundEvaluationVersion({
                ...version,
                updatedAt: now,
                updated_at: now,
                runs: nextVersionRuns,
                runCount: nextVersionRuns.length,
                snapshot: {
                  ...(version.snapshot || {}),
                  runs: nextVersionRuns,
                },
              }, Math.max(0, Number(version.version || 1) - 1));
            });
            return createPlaygroundEvaluationWithVersionList(nextSet, nextVersions);
          }));
          if (selectedEvaluationSetId === normalizedSetId && selectedEvaluationRunId === normalizedRunId) {
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("detail");
          }
        }

        function handleDeleteEvaluation(setId) {
          setEvaluationActionsPopoverOpen(false);
          closeEvaluationRenameDialog();
          const normalizedSetId = String(setId || "").trim();
          if (normalizedSetId) {
            void requestEvaluationBackendJson(
              "/evaluations/" + encodeURIComponent(normalizedSetId),
              { method: "DELETE" },
              "Failed to delete evaluation."
            ).catch((error) => {
              setEvaluationBackendSyncState({ status: "error", error: error?.message || String(error) });
            });
          }
          setEvaluationSets((current) => (Array.isArray(current) ? current : []).filter((item) => normalizePlaygroundEvaluationSet(item).id !== setId));
          if (selectedEvaluationSetId === setId) {
            setSelectedEvaluationSetId("");
            setSelectedEvaluationRunId("");
            if (typeof setSelectedEvaluationCaseId === "function") setSelectedEvaluationCaseId("");
            setEvaluationsPageMode("overview");
          }
        }

        function openEvaluationJsonlFilePicker() {
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          if (evaluationJsonlFileInputRef.current) {
            evaluationJsonlFileInputRef.current.click();
          }
        }

        function isEvaluationJsonlFile(file) {
          const fileName = String(file?.name || "").trim().toLowerCase();
          return fileName.endsWith(".jsonl");
        }

        async function handleEvaluationJsonlFiles(setId, fileList) {
          const normalizedSetId = String(setId || "").trim();
          const files = Array.from(fileList || []).filter(Boolean);
          if (!normalizedSetId || files.length === 0) return;
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          const invalidFiles = files.filter((file) => !isEvaluationJsonlFile(file));
          if (invalidFiles.length > 0) {
            setEvaluationJsonlFileImportError("Only .jsonl files can be imported.");
            return;
          }
          try {
            const importedRows = [];
            const importErrors = [];
            for (const file of files) {
              const fileName = String(file?.name || "cases.jsonl");
              const text = typeof file.text === "function"
                ? await file.text()
                : await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = () => reject(reader.error || new Error("Failed to read " + fileName));
                    reader.readAsText(file);
                  });
              const parsed = parsePlaygroundEvaluationJsonl(text);
              if (parsed.errors.length > 0) {
                importErrors.push(fileName + ": " + parsed.errors.join(", "));
              }
              importedRows.push(...parsed.rows);
            }
            if (importErrors.length > 0) {
              setEvaluationJsonlFileImportError(importErrors.join(" "));
              return;
            }
            if (importedRows.length === 0) {
              setEvaluationJsonlFileImportError("No valid cases found in the selected JSONL file.");
              return;
            }
            updateEvaluationSet(normalizedSetId, (set) => ({
              ...set,
              dataRows: [...set.dataRows, ...importedRows],
            }));
            setEvaluationJsonlFileImportMessage(
              "Imported " + importedRows.length + " " + (importedRows.length === 1 ? "case" : "cases") + "."
            );
            setEvaluationDetailTab("data");
          } catch (error) {
            setEvaluationJsonlFileImportError(error?.message || String(error));
          }
        }

        function closeEvaluationThreadCaseModal() {
          setEvaluationThreadCaseModalSetId("");
          setEvaluationThreadCaseSearchQuery("");
          setEvaluationThreadCaseSelectedIds([]);
          setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" });
        }

        function openEvaluationThreadCaseModal(set) {
          if (!set?.id) return;
          setEvaluationThreadCaseModalSetId(set.id);
          setEvaluationThreadCaseSearchQuery("");
          setEvaluationThreadCaseSelectedIds([]);
          setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" });
          if (typeof onRefreshThreadRecords === "function") {
            setEvaluationThreadCaseStatus({ status: "refreshing", message: "Refreshing threads...", error: "" });
            Promise.resolve(onRefreshThreadRecords())
              .then(() => {
                setEvaluationThreadCaseStatus((current) => current.status === "refreshing" ? { status: "idle", message: "", error: "" } : current);
              })
              .catch((error) => {
                setEvaluationThreadCaseStatus({ status: "error", message: "", error: error?.message || String(error) });
              });
          }
        }

        function toggleEvaluationThreadCaseSelection(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) return;
          setEvaluationThreadCaseSelectedIds((current) => {
            const ids = Array.isArray(current) ? current : [];
            if (ids.includes(normalizedThreadId)) {
              return ids.filter((id) => id !== normalizedThreadId);
            }
            return [...ids, normalizedThreadId];
          });
        }

        function updatePendingEvaluationThreadCase(setId, pendingId, patch) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedPendingId = String(pendingId || "").trim();
          if (!normalizedSetId || !normalizedPendingId) return;
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const entries = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            return {
              ...source,
              [normalizedSetId]: entries.map((entry) => entry.id === normalizedPendingId ? { ...entry, ...patch } : entry),
            };
          });
        }

        function removePendingEvaluationThreadCase(setId, pendingId) {
          const normalizedSetId = String(setId || "").trim();
          const normalizedPendingId = String(pendingId || "").trim();
          if (!normalizedSetId || !normalizedPendingId) return;
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const entries = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            const nextEntries = entries.filter((entry) => entry.id !== normalizedPendingId);
            if (nextEntries.length === entries.length) {
              return source;
            }
            const next = { ...source };
            if (nextEntries.length > 0) {
              next[normalizedSetId] = nextEntries;
            } else {
              delete next[normalizedSetId];
            }
            return next;
          });
        }

        function handleGenerateEvaluationCasesFromThreads() {
          const normalizedSetId = String(evaluationThreadCaseModalSetId || "").trim();
          if (!normalizedSetId) return;
          const targetSet = normalizedSets.find((set) => set.id === normalizedSetId) || activeSet;
          if (!targetSet) return;
          const selectedIds = new Set((Array.isArray(evaluationThreadCaseSelectedIds) ? evaluationThreadCaseSelectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
          const selectedThreads = sourceThreadOptions.filter((thread) => selectedIds.has(thread.id));
          if (selectedThreads.length === 0) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select at least one thread." });
            return;
          }
          const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
          if (!normalizedBackendUrl) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Evaluation backend is unavailable." });
            return;
          }
          const evaluator = normalizePlaygroundEvaluationEvaluator(targetSet.evaluator);
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet, defaultEnvironmentId);
          const targetEnvironmentId = String(selectedEnvironmentChoice?.environmentId || targetSet.environmentId || defaultEnvironmentId || "").trim();
          const targetProjectId = String(selectedEnvironmentChoice?.projectId || targetSet.projectId || "").trim();
          const refinerAgentId = getPlaygroundEvaluationDefaultId(
            agentOptions,
            evaluator.type === "agent" && evaluator.agentId
              ? evaluator.agentId
              : defaultAgentId || targetSet.targetAgentId
          );
          if (!refinerAgentId) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select an agent before generating cases from threads." });
            return;
          }
          if (!targetEnvironmentId) {
            setEvaluationThreadCaseStatus({ status: "error", message: "", error: "Select an environment before generating cases from threads." });
            return;
          }
          setEvaluationJsonlFileImportError("");
          setEvaluationJsonlFileImportMessage("");
          const launchedAt = new Date().toISOString();
          const jobs = selectedThreads.map((thread, index) => ({
            pendingId: createPlaygroundEvaluationId("eval_pending_case"),
            thread,
            index,
          }));
          setEvaluationPendingThreadCasesBySetId((current) => {
            const source = current && typeof current === "object" ? current : {};
            const existing = Array.isArray(source[normalizedSetId]) ? source[normalizedSetId] : [];
            const nextEntries = jobs.map((job) => ({
              id: job.pendingId,
              threadId: job.thread.id,
              title: job.thread.title || job.thread.id,
              status: "loading",
              message: "Creating case from thread",
              createdAt: launchedAt,
            }));
            return {
              ...source,
              [normalizedSetId]: [...existing, ...nextEntries],
            };
          });
          setEvaluationDetailTab("data");
          closeEvaluationThreadCaseModal();

          void (async () => {
            for (const job of jobs) {
              const thread = job.thread;
              updatePendingEvaluationThreadCase(normalizedSetId, job.pendingId, {
                status: "loading",
                message: "Creating case " + (job.index + 1) + " of " + jobs.length,
              });
              try {
                const response = await fetch(normalizedBackendUrl + "/evaluations/cases/from-thread", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...(requestHeaders || {}),
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    threadId: thread.id,
                    thread,
                    evaluationSet: targetSet,
                    refinerAgentId,
                    environmentId: targetEnvironmentId,
                    projectId: targetProjectId,
                    environmentType: selectedEnvironmentChoice?.type || targetSet.environmentType || "computer",
                  }),
                });
                const data = await readPlaygroundEvaluationBackendJson(response, "Failed to refine evaluation case from thread.");
                const normalizedRow = normalizePlaygroundEvaluationDataRow(
                  data?.row || data?.case || data?.data || data,
                  (Array.isArray(targetSet.dataRows) ? targetSet.dataRows.length : 0) + job.index
                );
                const row = {
                  ...normalizedRow,
                  sourceThreadId: normalizedRow.sourceThreadId || thread.id,
                  sourceThreadTitle: normalizedRow.sourceThreadTitle || thread.title || thread.id,
                };
                if (!String(row.input || "").trim() || !String(row.expectedOutput || "").trim() || !String(row.evaluationGuidance || "").trim()) {
                  throw new Error("The refiner returned an incomplete case for " + thread.id + ".");
                }
                updateEvaluationSet(normalizedSetId, (set) => ({
                  ...set,
                  dataRows: [...set.dataRows, row],
                }));
                removePendingEvaluationThreadCase(normalizedSetId, job.pendingId);
              } catch (error) {
                updatePendingEvaluationThreadCase(normalizedSetId, job.pendingId, {
                  status: "error",
                  message: "Case creation failed",
                  error: error?.message || String(error),
                });
              }
            }
          })();
        }

        function buildEvaluationCaseEditorDraft(row = {}, index = 0) {
          const normalized = normalizePlaygroundEvaluationDataRow(row, index);
          return {
            ...normalized,
            runCount: String(normalizePlaygroundEvaluationCaseRunCount(normalized.runCount)),
          };
        }

        function openEvaluationCaseEditor(setId, row = {}, index = 0, isNew = false) {
          const normalizedSetId = String(setId || "").trim();
          if (!normalizedSetId) return;
          if (typeof window !== "undefined") {
            if (evaluationCaseEditorCloseTimerRef.current) {
              window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
              evaluationCaseEditorCloseTimerRef.current = null;
            }
            if (evaluationCaseEditorFrameRef.current) {
              window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
              evaluationCaseEditorFrameRef.current = null;
            }
          }
          const nextState = {
            setId: normalizedSetId,
            rowId: isNew ? "" : String(row?.id || "").trim(),
            index,
            isNew,
            draft: buildEvaluationCaseEditorDraft(row, index),
          };
          setEvaluationCaseEditorState({
            ...nextState,
          });
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
          setEvaluationCaseEditorMarkdownHistoryByKey({});
          setEvaluationCaseEditorMarkdownEditingKey(buildEvaluationCaseEditorFieldKey(nextState, "input"));
          if (typeof window !== "undefined") {
            evaluationCaseEditorFrameRef.current = window.requestAnimationFrame(() => {
              evaluationCaseEditorFrameRef.current = window.requestAnimationFrame(() => {
                evaluationCaseEditorFrameRef.current = null;
                setEvaluationCaseEditorVisible(true);
              });
            });
          } else {
            setEvaluationCaseEditorVisible(true);
          }
        }

        function openNewEvaluationCaseEditor(set) {
          if (!set?.id) return;
          const nextIndex = Array.isArray(set.dataRows) ? set.dataRows.length : 0;
          openEvaluationCaseEditor(set.id, {
            input: "",
            expectedOutput: "",
            evaluationGuidance: "",
            runCount: 1,
          }, nextIndex, true);
        }

        function finishCloseEvaluationCaseEditor() {
          if (typeof window !== "undefined") {
            if (evaluationCaseEditorCloseTimerRef.current) {
              window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
              evaluationCaseEditorCloseTimerRef.current = null;
            }
            if (evaluationCaseEditorFrameRef.current) {
              window.cancelAnimationFrame(evaluationCaseEditorFrameRef.current);
              evaluationCaseEditorFrameRef.current = null;
            }
          }
          setEvaluationCaseEditorState(null);
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(false);
          setEvaluationCaseEditorMarkdownEditingKey("");
          setEvaluationCaseEditorMarkdownHistoryByKey({});
        }

        function closeEvaluationCaseEditor(options = {}) {
          if (options?.animate === false || typeof window === "undefined") {
            finishCloseEvaluationCaseEditor();
            return;
          }
          if (!evaluationCaseEditorState || evaluationCaseEditorClosing) {
            return;
          }
          setEvaluationCaseEditorVisible(false);
          setEvaluationCaseEditorClosing(true);
          if (evaluationCaseEditorCloseTimerRef.current) {
            window.clearTimeout(evaluationCaseEditorCloseTimerRef.current);
          }
          evaluationCaseEditorCloseTimerRef.current = window.setTimeout(() => {
            evaluationCaseEditorCloseTimerRef.current = null;
            finishCloseEvaluationCaseEditor();
          }, 75);
        }

        function updateEvaluationCaseEditorDraft(patch) {
          setEvaluationCaseEditorState((current) => current
            ? {
                ...current,
                draft: {
                  ...(current.draft || {}),
                  ...(patch || {}),
                },
              }
            : current
          );
        }

        function saveEvaluationCaseEditor(event) {
          if (event && typeof event.preventDefault === "function") {
            event.preventDefault();
          }
          if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
          }
          const state = evaluationCaseEditorState;
          if (!state?.setId) return;
          const draft = normalizePlaygroundEvaluationDataRow({
            ...(state.draft || {}),
            runCount: normalizePlaygroundEvaluationCaseRunCount(state.draft?.runCount || 1),
            updatedAt: nowIso,
          }, Number(state.index || 0));
          updateEvaluationSet(state.setId, (set) => {
            const rows = Array.isArray(set.dataRows) ? set.dataRows : [];
            const isExisting = !state.isNew && rows.some((row) => row.id === state.rowId);
            return {
              ...set,
              dataRows: isExisting
                ? rows.map((row) => row.id === state.rowId ? { ...draft, id: row.id, createdAt: row.createdAt || draft.createdAt } : row)
                : rows.concat(draft),
            };
          });
          closeEvaluationCaseEditor();
        }

        function deleteEvaluationCaseEditor() {
          const state = evaluationCaseEditorState;
          if (!state?.setId) {
            closeEvaluationCaseEditor();
            return;
          }
          if (!state.isNew && state.rowId) {
            updateEvaluationSet(state.setId, (set) => ({
              ...set,
              dataRows: (Array.isArray(set.dataRows) ? set.dataRows : []).filter((row) => row.id !== state.rowId),
            }));
          }
          closeEvaluationCaseEditor();
        }

        function drawPlaygroundEvaluationCaseRunRing(canvas) {
          if (!canvas) return;
          if (typeof drawPlaygroundPermissionMiniRingIcon === "function") {
            drawPlaygroundPermissionMiniRingIcon(canvas, "ring_2", 100);
            return;
          }
          const rect = canvas.getBoundingClientRect();
          const width = Math.max(1, Math.round(rect.width || 24));
          const height = Math.max(1, Math.round(rect.height || 24));
          const dpr = Math.max(1, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1);
          const targetWidth = Math.round(width * dpr);
          const targetHeight = Math.round(height * dpr);
          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);
          const size = Math.min(width, height);
          const centerX = width / 2;
          const centerY = height / 2;
          const lineWidth = Math.max(1, size * (1 / 24));
          const padding = Math.max(2, size * (2.9 / 24));
          const radius = Math.max(1, size / 2 - lineWidth / 2 - padding);
          const startAngle = -Math.PI / 2 - 0.18;
          const makeGradient = (alpha) => {
            const gradient = typeof ctx.createConicGradient === "function"
              ? ctx.createConicGradient(startAngle, centerX, centerY)
              : ctx.createLinearGradient(width / 2, 0, width / 2, height);
            gradient.addColorStop(0, "rgba(7, 61, 188, " + alpha + ")");
            gradient.addColorStop(0.72, "rgba(78, 162, 255, " + alpha + ")");
            gradient.addColorStop(0.985, "rgba(7, 61, 188, " + alpha + ")");
            gradient.addColorStop(1, "rgba(7, 61, 188, " + alpha + ")");
            return gradient;
          };
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "butt";
          ctx.strokeStyle = makeGradient(0.12);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          ctx.save();
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "butt";
          ctx.strokeStyle = makeGradient(1);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        function PlaygroundEvaluationCaseRunRing({ runCount } = {}) {
          const canvasRef = useRef(null);
          const normalizedRunCount = normalizePlaygroundEvaluationCaseRunCount(runCount);
          const iconColor = typeof getPlaygroundPermissionRingIconColor === "function"
            ? getPlaygroundPermissionRingIconColor("ring_2", 1)
            : "rgba(78, 162, 255, 1)";

          useEffect(() => {
            const redraw = () => drawPlaygroundEvaluationCaseRunRing(canvasRef.current);
            redraw();
            if (typeof window === "undefined") return undefined;
            window.addEventListener("resize", redraw);
            return () => window.removeEventListener("resize", redraw);
          }, [normalizedRunCount]);

          return React.createElement("span", {
              className: "playground-permission-mini-ring-icon playground-evaluations-case-run-ring is-ring-2",
              role: "img",
              "aria-label": String(normalizedRunCount) + " " + (normalizedRunCount === 1 ? "run" : "runs"),
              style: { "--permission-mini-ring-icon-color": iconColor },
            },
            React.createElement("canvas", {
              ref: canvasRef,
              className: "playground-permission-mini-ring-canvas",
            }),
            React.createElement("span", { className: "playground-evaluations-case-run-ring-value" }, String(normalizedRunCount))
          );
        }

        function PlaygroundEvaluationPerformanceChart({ runs, run }) {
          const canvasRef = useRef(null);
          const chartRef = useRef(null);
          const normalizedRun = run ? normalizePlaygroundEvaluationRun(run) : null;
          const normalizedRuns = normalizedRun
            ? []
            : (Array.isArray(runs) ? runs : [])
                .map((item, index) => normalizePlaygroundEvaluationRun(item, index))
                .slice(-12);
          const runCases = normalizedRun ? normalizedRun.cases : [];
          const labels = normalizedRun
            ? runCases.map((_caseItem, index) => "Case " + (index + 1))
            : normalizedRuns.map((item, index) => String(item.label || ("Run " + (index + 1))));
          const scoreValues = normalizedRun
            ? runCases.map((caseItem) => Math.round(Math.max(0, Math.min(1, Number(caseItem.score || 0))) * 100))
            : normalizedRuns.map((item) => Math.round(Math.max(0, Math.min(1, Number(item.averageScore || 0))) * 100));
          const costValues = normalizedRun
            ? runCases.map((caseItem) => normalizePlaygroundEvaluationUsdCost(caseItem.costUsd))
            : normalizedRuns.map((item) => normalizePlaygroundEvaluationUsdCost(item.costUsd));
          const scoreLineLabel = normalizedRun ? "Score" : "Avg Score";
          const costBarLabel = normalizedRun ? "Cost / Case" : "Cost / Run";
          const chartSignature = JSON.stringify({ mode: normalizedRun ? "run" : "set", labels, scoreValues, costValues });

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
                  id: "cost",
                  type: "bar",
                  label: costBarLabel,
                  data: costValues,
                  yAxisID: "cost",
                  backgroundColor: (context) => makeVerticalGradient(context, [
                    [0, "rgba(159, 246, 206, 0.82)"],
                    [1, "rgba(42, 165, 123, 0.56)"],
                  ], "rgba(92, 212, 163, 0.68)"),
                  borderWidth: 0,
                  borderRadius: 2,
                  barPercentage: 0.72,
                  categoryPercentage: 0.86,
                  maxBarThickness: 10,
                  order: 4,
                },
                {
                  id: "score",
                  type: "line",
                  label: scoreLineLabel,
                  data: scoreValues,
                  yAxisID: "score",
                  borderColor: "#7EFFFF",
                  backgroundColor: "rgba(126, 255, 255, 0.08)",
                  borderWidth: 1.5,
                  fill: false,
                  pointBackgroundColor: "#7EFFFF",
                  pointBorderColor: "#050505",
                  pointBorderWidth: 2,
                  pointRadius: (context) => context.dataIndex === scoreValues.length - 1 ? 5 : 0,
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
                      if (datasetId === "score") return scoreLineLabel + ": " + Math.round(value) + "%";
                      if (datasetId === "cost") return costBarLabel + ": " + formatPlaygroundEvaluationCostUsd(value);
                      return String(context.dataset?.label || "Value") + ": " + value;
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
                    display: false,
                    autoSkip: false,
                  },
                },
                score: {
                  display: true,
                  type: "linear",
                  position: "left",
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
                  grid: { display: false, drawTicks: false },
                  border: { display: false },
                },
                cost: {
                  display: false,
                  type: "linear",
                  position: "right",
                  min: 0,
                  suggestedMax: Math.max(0.01, ...costValues) * 1.2,
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
              "aria-label": normalizedRun ? "Evaluation case scores and costs" : "Evaluation average scores and costs per run",
            })
          );
        }

        function renderAnalyticsCard(set, run) {
          const normalizedSetRuns = Array.isArray(set?.runs)
            ? set.runs.map((item, index) => normalizePlaygroundEvaluationRun(item, index))
            : [];
          const latestRun = run
            ? normalizePlaygroundEvaluationRun(run)
            : normalizedSetRuns[0] || null;
          const runsForChart = run ? [latestRun] : normalizedSetRuns.slice().reverse();
          const runPassRate = latestRun && latestRun.totalCount ? Math.round((latestRun.passedCount / latestRun.totalCount) * 100) + "%" : "-";
          const setAnalytics = normalizedSetRuns.reduce((state, item) => {
            const cases = Array.isArray(item.cases) ? item.cases : [];
            const completedCases = cases.filter((caseItem) => !isPlaygroundEvaluationCaseActive(caseItem) && caseItem.status !== "error");
            if (completedCases.length > 0) {
              state.scoreSum += completedCases.reduce((sum, caseItem) => sum + Math.max(0, Math.min(1, Number(caseItem.score || 0))), 0);
              state.caseCount += completedCases.length;
              state.passedCount += completedCases.filter((caseItem) => Number(caseItem.score || 0) >= normalizePlaygroundEvaluationPassThreshold(item.passThreshold)).length;
            } else if (item.totalCount > 0) {
              state.scoreSum += Math.max(0, Math.min(1, Number(item.averageScore || 0))) * item.totalCount;
              state.caseCount += item.totalCount;
              state.passedCount += Math.max(0, Number(item.passedCount || 0));
            }
            state.costUsd += normalizePlaygroundEvaluationUsdCost(item.costUsd);
            return state;
          }, { scoreSum: 0, caseCount: 0, passedCount: 0, costUsd: 0 });
          const setAverageScore = setAnalytics.caseCount > 0 ? setAnalytics.scoreSum / setAnalytics.caseCount : null;
          const setPassRate = setAnalytics.caseCount > 0 ? Math.round((setAnalytics.passedCount / setAnalytics.caseCount) * 100) + "%" : "-";
          const values = run
            ? [
                { id: "score", label: "Average Score", value: latestRun ? formatPlaygroundEvaluationPercent(latestRun.averageScore) : "-" },
                { id: "pass-rate", label: "Pass Rate", value: runPassRate },
                { id: "cases", label: "Cases", value: String(latestRun?.totalCount || latestRun?.cases?.length || 0) },
                { id: "cost", label: "Cost (USD)", value: formatPlaygroundEvaluationCostUsd(latestRun?.costUsd) },
              ]
            : [
                { id: "score", label: "Average Score", value: setAverageScore === null ? "-" : formatPlaygroundEvaluationPercent(setAverageScore) },
                { id: "pass-rate", label: "Pass Rate", value: setPassRate },
                { id: "runs", label: "Runs", value: String(normalizedSetRuns.length) },
                { id: "cost", label: "Cost (USD)", value: formatPlaygroundEvaluationCostUsd(setAnalytics.costUsd) },
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

        function renderEvaluationSetEvaluatorCell(set) {
          const evaluator = normalizePlaygroundEvaluationEvaluator(set?.evaluator);
          const label = getPlaygroundEvaluationEvaluatorLabel(evaluator, agentOptions);
          if (evaluator.type !== "agent") {
            return React.createElement("span", { className: "playground-evaluations-run-cell-label", title: label }, label);
          }
          const agent = getPlaygroundEvaluationAgentRecord(agentOptions, evaluator.agentId);
          const resolvedLabel = String(agent?.name || agent?.label || agent?.title || label || evaluator.agentId || "Agent evaluator").trim();
          const photoUrl = getPlaygroundEvaluationAgentPhotoUrl(agent);
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: resolvedLabel },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              photoUrl
                ? React.createElement("img", { src: photoUrl, alt: "" })
                : getPlaygroundEvaluationInitials(resolvedLabel)
            ),
            React.createElement("span", { className: "playground-evaluations-run-cell-label" }, resolvedLabel)
          );
        }

        function renderEvaluationSetCreatorCell(set) {
          const explicitCreator = normalizePlaygroundEvaluationPersonIdentity(set?.creator || set?.createdBy || set?.created_by || {});
          const creator = explicitCreator.name || explicitCreator.email || explicitCreator.id || explicitCreator.userId
            ? explicitCreator
            : normalizePlaygroundEvaluationPersonIdentity({});
          const label = getPlaygroundEvaluationCreatorLabel(creator);
          if (!label) {
            return React.createElement("span", { className: "playground-evaluations-run-cell-label" }, "-");
          }
          return React.createElement("span", { className: "playground-evaluations-run-agent-cell", title: label },
            React.createElement("span", { className: "playground-evaluations-run-agent-avatar", "aria-hidden": "true" },
              creator.avatarUrl
                ? React.createElement("img", { src: creator.avatarUrl, alt: "" })
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
                React.createElement("div", {
                    className: "playground-tasks-toolbar-popup-shell",
                    onClick: (event) => event.stopPropagation(),
                  },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-thread-menu-button" + (evaluationRunRowMenuId === run.id ? " is-active" : ""),
                    "aria-label": "Evaluation run actions",
                    "aria-expanded": evaluationRunRowMenuId === run.id ? "true" : "false",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      closeToolbarPopover();
                      setEvaluationRunRowMenuId((current) => current === run.id ? "" : run.id);
                    },
                  }, React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.8 })),
                  evaluationRunRowMenuId === run.id
                    ? React.createElement("div", {
                        className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                        onClick: (event) => event.stopPropagation(),
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setEvaluationRunRowMenuId("");
                            openEvaluationRunRenameDialog(set, run);
                          },
                        },
                          React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Rename")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => handleDeleteEvaluationRun(set.id, run.id),
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
          const pendingRows = Array.isArray(evaluationPendingThreadCasesBySetId?.[set?.id])
            ? evaluationPendingThreadCasesBySetId[set.id]
            : [];
          const hasCaseRows = pendingRows.length > 0 || rows.length > 0;
          return React.createElement("section", { className: "playground-evaluations-cases-editor-section" },
            React.createElement("div", { className: "playground-evaluations-cases-editor-header" },
              React.createElement("h2", { className: "playground-evaluations-cases-title" }, "Cases"),
              React.createElement("div", { className: "playground-evaluations-cases-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                  onClick: () => openEvaluationThreadCaseModal(set),
                }, React.createElement(MessageSquare, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "From Threads")),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button playground-guardrails-prompt-add-button",
                  onClick: () => openNewEvaluationCaseEditor(set),
                }, React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.8 }), React.createElement("span", null, "Case"))
              )
            ),
            hasCaseRows
              ? React.createElement("div", { className: "playground-evaluations-case-preview-list" },
                  pendingRows.map((pending) => {
                    const isError = pending.status === "error";
                    const title = String(pending.title || pending.threadId || "").trim();
                    const statusText = isError
                      ? (pending.error || pending.message || "Case creation failed")
                      : (pending.message || "Creating case from thread");
                    return React.createElement("div", {
                        key: pending.id,
                        className: "playground-tasks-backlog-item playground-project-overview-outcome-preview playground-evaluations-data-row-preview is-pending" + (isError ? " is-pending-error" : ""),
                        "aria-busy": isError ? undefined : "true",
                      },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement("span", { className: "playground-evaluations-pending-case-icon" + (isError ? " is-error" : ""), "aria-hidden": "true" },
                            isError
                              ? React.createElement(AlertCircle, { width: 13, height: 13, strokeWidth: 1.9 })
                              : React.createElement(Loader2, { className: "playground-evaluations-pending-case-spinner", width: 13, height: 13, strokeWidth: 1.9 })
                          ),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, isError ? "Case failed" : "Creating case"),
                            React.createElement("span", {
                              className: "playground-tasks-backlog-title",
                              title: title || statusText,
                            }, title ? "Refining " + title : "Refining selected thread")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          pending.threadId
                            ? React.createElement("span", {
                                className: "playground-evaluations-source-thread-pill",
                                title: pending.threadId,
                              },
                                React.createElement(MessageSquare, { width: 12, height: 12, strokeWidth: 1.8 }),
                                React.createElement("span", null, "Thread")
                              )
                            : null,
                          React.createElement("span", {
                            className: "playground-evaluations-pending-case-status" + (isError ? " is-error" : ""),
                            title: statusText,
                          }, isError ? "Failed" : "Creating")
                        )
                      )
                    );
                  }),
                  rows.map((row, index) => {
                    const caseNumber = String(index + 1).padStart(3, "0");
                    const inputText = String(row.input || "").trim();
                    const runCount = normalizePlaygroundEvaluationCaseRunCount(row.runCount);
                    return React.createElement("div", {
                        key: row.id,
                        className: "playground-tasks-backlog-item playground-project-overview-outcome-preview playground-evaluations-data-row-preview",
                        role: "button",
                        tabIndex: 0,
                        onClick: () => openEvaluationCaseEditor(set.id, row, index, false),
                        onKeyDown: (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openEvaluationCaseEditor(set.id, row, index, false);
                          }
                        },
                      },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement(PlaygroundEvaluationCaseRunRing, { runCount }),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Case " + caseNumber),
                            React.createElement("span", {
                              className: "playground-tasks-backlog-title" + (inputText ? "" : " is-empty"),
                              title: inputText || "Empty input",
                            }, inputText || "Empty input")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          row.sourceThreadId
                            ? React.createElement("span", {
                                className: "playground-evaluations-source-thread-pill",
                                title: row.sourceThreadTitle || row.sourceThreadId,
                              },
                                React.createElement(MessageSquare, { width: 12, height: 12, strokeWidth: 1.8 }),
                                React.createElement("span", null, "Thread")
                              )
                            : null,
                          React.createElement("button", {
                            type: "button",
                            className: "playground-evaluations-case-delete-button",
                            "aria-label": "Delete case " + caseNumber,
                            title: "Delete case",
                            onClick: (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              updateEvaluationSet(set.id, (current) => ({
                                ...current,
                                dataRows: current.dataRows.filter((item) => item.id !== row.id),
                              }));
                            },
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
                        )
                      )
                    );
                  })
                )
		              : React.createElement("div", { className: "playground-guardrails-empty" },
		                  React.createElement("div", { className: "playground-guardrails-empty-title" }, "No cases yet")
		                ),
            React.createElement("div", { className: "playground-tasks-attachments playground-evaluations-jsonl-imports" },
              React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" },
                  React.createElement("span", { className: "playground-evaluations-imports-title" },
                    React.createElement("span", null, "Imports"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-evaluations-imports-help",
                      "aria-label": "JSONL import format",
                      onClick: (event) => event.preventDefault(),
                    },
                      React.createElement(CircleHelp, { width: 12, height: 12, strokeWidth: 1.8 }),
                      React.createElement("span", {
                        className: "playground-evaluations-pass-threshold-tooltip playground-evaluations-imports-tooltip",
                        role: "tooltip",
                      },
                        "Upload .jsonl files with one JSON object per line. Each object should include input and expectedOutput, and can optionally include evaluatorGuidance and runCount."
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-attachments-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                    onClick: openEvaluationJsonlFilePicker,
                  }, "Upload from Computer")
                )
              ),
              React.createElement("input", {
                ref: evaluationJsonlFileInputRef,
                type: "file",
                accept: ".jsonl",
                multiple: true,
                hidden: true,
                onChange: (event) => {
                  void handleEvaluationJsonlFiles(set.id, event.target.files);
                  event.target.value = "";
                },
              }),
              React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                React.createElement("div", {
                  className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (evaluationJsonlFileDragging ? " dragging" : ""),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setEvaluationJsonlFileDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) return;
                    setEvaluationJsonlFileDragging(false);
                  },
                  onDrop: (event) => {
                    event.preventDefault();
                    setEvaluationJsonlFileDragging(false);
                    void handleEvaluationJsonlFiles(set.id, event.dataTransfer.files);
                  },
                },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-attachments-empty-button",
                    onClick: openEvaluationJsonlFilePicker,
                  },
                    React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                    React.createElement("span", { className: "tb-popup-dropzone-title" }, evaluationJsonlFileDragging ? "Drop JSONL files here" : "Drag & drop JSONL files here"),
                    React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                  )
                )
              ),
              evaluationJsonlFileImportMessage
                ? React.createElement("div", { className: "playground-tasks-attachments-status" }, evaluationJsonlFileImportMessage)
                : null,
              evaluationJsonlFileImportError
                ? React.createElement("div", { className: "playground-environments-error" }, evaluationJsonlFileImportError)
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
                React.createElement("div", {
                    className: "playground-tasks-toolbar-popup-shell",
                    onClick: (event) => event.stopPropagation(),
                  },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-thread-menu-button" + (evaluationCaseRowMenuId === caseItem.id ? " is-active" : ""),
                    "aria-label": "Evaluation case actions",
                    "aria-expanded": evaluationCaseRowMenuId === caseItem.id ? "true" : "false",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      closeCasesToolbarPopover();
                      setEvaluationCaseRowMenuId((current) => current === caseItem.id ? "" : caseItem.id);
                    },
                  }, React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.8 })),
                  evaluationCaseRowMenuId === caseItem.id
                    ? React.createElement("div", {
                        className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                        onClick: (event) => event.stopPropagation(),
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setEvaluationCaseRowMenuId("");
                            openCaseDetail(set.id, run.id, caseItem.id);
                          },
                        },
                          React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Rename")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setEvaluationCaseRowMenuId("");
                            deleteEvaluationRunCase(set.id, run.id, caseItem.id);
                          },
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
              ? React.createElement("div", { className: "playground-evaluations-cases-table" },
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

        function renderEvaluationPassThresholdInline(set) {
          return React.createElement("div", { className: "playground-evaluations-pass-threshold-inline" },
            React.createElement("span", { className: "playground-evaluations-pass-threshold-label-group" },
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
            ),
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

        function renderOverview() {
          const sortOptions = [
            { id: "updated-desc", label: "Recently Updated", description: "Show newest evaluation activity first" },
            { id: "created-desc", label: "Newest Created", description: "Show newly created evaluations first" },
            { id: "creator-asc", label: "Creator (A-Z)", description: "Sort evaluations by creator" },
            { id: "cases-desc", label: "Most Cases", description: "Show largest datasets first" },
            { id: "name-asc", label: "Evaluation Name (A-Z)", description: "Sort evaluations alphabetically" },
          ];
          const filterOptions = [
            { id: "all", label: "All", description: "Show every evaluation set" },
            { id: "with-runs", label: "With Runs", description: "Only show evaluations with previous runs" },
            { id: "without-runs", label: "Without Runs", description: "Only show evaluations without runs" },
            { id: "empty", label: "Empty Dataset", description: "Only show evaluations with no cases" },
          ];
          const sortMode = sortOptions.some((option) => option.id === evaluationSetsSortMode) ? evaluationSetsSortMode : "updated-desc";
          const filterMode = filterOptions.some((option) => option.id === evaluationSetsFilterMode) ? evaluationSetsFilterMode : "all";
          const activeSortOption = sortOptions.find((option) => option.id === sortMode) || sortOptions[0];
          const activeFilterOption = filterOptions.find((option) => option.id === filterMode) || filterOptions[0];
          const query = String(evaluationsSearchQuery || "").trim().toLowerCase();
          const getSetTimestamp = (set) => Date.parse(String(set.updatedAt || set.createdAt || "")) || 0;
          const getSetLatestRun = (set) => Array.isArray(set?.runs) && set.runs.length > 0 ? set.runs[0] : null;
          const getSetCreatorLabel = (set) => getPlaygroundEvaluationCreatorLabel(set?.creator || set?.createdBy || set?.created_by || "");
          const filteredSets = normalizedSets
            .filter((set) => {
              const runCount = Array.isArray(set?.runs) ? set.runs.length : 0;
              const caseCount = Array.isArray(set?.dataRows) ? set.dataRows.length : 0;
              if (filterMode === "with-runs" && runCount === 0) return false;
              if (filterMode === "without-runs" && runCount > 0) return false;
              if (filterMode === "empty" && caseCount > 0) return false;
              if (!query) return true;
              const latestRun = getSetLatestRun(set);
              const haystack = [
                set.name,
                set.description,
                getPlaygroundEvaluationEvaluatorLabel(set.evaluator, agentOptions),
                getSetCreatorLabel(set),
                String(caseCount),
                formatPlaygroundEvaluationDate(set.updatedAt || set.createdAt),
              ].join(" ").toLowerCase();
              return haystack.includes(query);
            })
            .sort((left, right) => {
              if (sortMode === "name-asc") {
                return String(left?.name || "").localeCompare(String(right?.name || ""));
              }
              if (sortMode === "created-desc") {
                return (Date.parse(String(right?.createdAt || "")) || 0) - (Date.parse(String(left?.createdAt || "")) || 0);
              }
              if (sortMode === "creator-asc") {
                return getSetCreatorLabel(left).localeCompare(getSetCreatorLabel(right));
              }
              if (sortMode === "cases-desc") {
                return (Array.isArray(right?.dataRows) ? right.dataRows.length : 0) - (Array.isArray(left?.dataRows) ? left.dataRows.length : 0);
              }
              return getSetTimestamp(right) - getSetTimestamp(left);
            });
          const visibleCount = Math.max(10, Number(evaluationSetsVisibleCount) || 10);
          const visibleSets = filteredSets.slice(0, visibleCount);
          const hasMoreSets = filteredSets.length > visibleSets.length;
          const hasFilters = Boolean(query || filterMode !== "all");
          const closeToolbarPopover = () => setEvaluationSetsToolbarPopover("");
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
          const visibleEvaluationOverviewIds = visibleSets.map((set) => String(set?.id || "").trim()).filter(Boolean);
          const selectedVisibleEvaluationOverviewIds = visibleEvaluationOverviewIds.filter((setId) => selectedEvaluationOverviewIds.has(setId));
          const allVisibleEvaluationsSelected = visibleEvaluationOverviewIds.length > 0 && selectedVisibleEvaluationOverviewIds.length === visibleEvaluationOverviewIds.length;
          const hasPartialVisibleEvaluationSelection = selectedVisibleEvaluationOverviewIds.length > 0 && !allVisibleEvaluationsSelected;
          const toggleEvaluationOverviewSelection = (setId) => {
            const normalizedSetId = String(setId || "").trim();
            if (!normalizedSetId) return;
            setSelectedEvaluationOverviewIds((current) => {
              const next = new Set(current || []);
              if (next.has(normalizedSetId)) {
                next.delete(normalizedSetId);
              } else {
                next.add(normalizedSetId);
              }
              return next;
            });
          };
          const toggleVisibleEvaluationOverviewSelection = () => {
            if (visibleEvaluationOverviewIds.length === 0) return;
            setSelectedEvaluationOverviewIds((current) => {
              const next = new Set(current || []);
              if (allVisibleEvaluationsSelected) {
                visibleEvaluationOverviewIds.forEach((setId) => next.delete(setId));
              } else {
                visibleEvaluationOverviewIds.forEach((setId) => next.add(setId));
              }
              return next;
            });
          };
          const evaluationOverviewSortMap = {
            name: "name-asc",
            evaluator: "name-asc",
            cases: "cases-desc",
            creator: "creator-asc",
            updated: "updated-desc",
          };
          const renderEvaluationOverviewSortIcon = (sortKey) => {
            const isActive = sortMode === (evaluationOverviewSortMap[sortKey] || sortKey);
            const isDescending = isActive && (sortMode === "updated-desc" || sortMode === "cases-desc" || sortMode === "created-desc");
            const isAscending = isActive && !isDescending;
            return React.createElement("span", {
                className: "playground-agents-overview-sort-icon"
                  + (isActive ? " is-active" : "")
                  + (isAscending ? " is-ascending" : "")
                  + (isDescending ? " is-descending" : ""),
                "aria-hidden": "true",
              },
              React.createElement(ChevronsUpDown, {
                className: "playground-agents-overview-sort-icon-layer is-top",
                width: 14,
                height: 14,
                strokeWidth: 1.8,
              }),
              React.createElement(ChevronsUpDown, {
                className: "playground-agents-overview-sort-icon-layer is-bottom",
                width: 14,
                height: 14,
                strokeWidth: 1.8,
              })
            );
          };
          const renderEvaluationOverviewSortableHeader = (label, sortKey) => {
            const nextSortMode = evaluationOverviewSortMap[sortKey] || sortKey;
            const isActive = sortMode === nextSortMode;
            return React.createElement("div", { className: "playground-agents-overview-sortable-header" + (isActive ? " is-active" : "") },
              React.createElement("span", { className: "playground-agents-overview-sortable-header-label" }, label),
              React.createElement("button", {
                type: "button",
                className: "playground-agents-overview-column-sort-button"
                  + (isActive ? " is-active" : "")
                  + (isActive && (sortMode === "updated-desc" || sortMode === "cases-desc" || sortMode === "created-desc") ? " is-descending" : "")
                  + (isActive && !(sortMode === "updated-desc" || sortMode === "cases-desc" || sortMode === "created-desc") ? " is-ascending" : ""),
                title: "Sort " + label,
                "aria-label": "Sort " + label,
                "aria-pressed": isActive ? "true" : "false",
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setEvaluationSetsSortMode(nextSortMode);
                  setEvaluationSetsToolbarPopover("");
                },
              }, renderEvaluationOverviewSortIcon(sortKey))
            );
          };
          const renderEvaluationOverviewColumnHeader = () => React.createElement("div", {
              className: "playground-project-overview-threads-table-header playground-agents-overview-column-header playground-evaluations-overview-column-header",
            },
            React.createElement("div", null,
              React.createElement("button", {
                type: "button",
                className: "playground-agents-overview-select-checkbox playground-agents-overview-select-all-checkbox"
                  + (allVisibleEvaluationsSelected ? " is-selected" : "")
                  + (hasPartialVisibleEvaluationSelection ? " is-partial" : ""),
                role: "checkbox",
                "aria-checked": allVisibleEvaluationsSelected ? "true" : (hasPartialVisibleEvaluationSelection ? "mixed" : "false"),
                "aria-label": allVisibleEvaluationsSelected ? "Deselect all visible evaluations" : "Select all visible evaluations",
                onClick: (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleVisibleEvaluationOverviewSelection();
                },
              })
            ),
            React.createElement("div", null, renderEvaluationOverviewSortableHeader("Evaluation", "name")),
            React.createElement("div", null, renderEvaluationOverviewSortableHeader("Evaluator", "evaluator")),
            React.createElement("div", null, renderEvaluationOverviewSortableHeader("Cases", "cases")),
            React.createElement("div", null, renderEvaluationOverviewSortableHeader("Creator", "creator")),
            React.createElement("div", null, renderEvaluationOverviewSortableHeader("Updated", "updated")),
            React.createElement("div", null)
          );
          const renderEvaluationOverviewStickyTableHeader = (includeColumns = true) => React.createElement("div", {
              className: "playground-agents-overview-sticky-table-header playground-team-overview-sticky-table-header playground-evaluations-overview-sticky-table-header",
            },
            React.createElement("div", {
                className: "playground-develop-server-kind-table-toolbar playground-team-overview-toolbar-row playground-evaluations-overview-toolbar-row",
              },
              React.createElement("div", { className: "playground-plugins-search-shell playground-develop-server-kind-search-shell playground-evaluations-overview-search-shell" },
                React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: evaluationsSearchQuery || "",
                  onChange: (event) => {
                    if (typeof setEvaluationsSearchQuery === "function") setEvaluationsSearchQuery(event.target.value);
                    setEvaluationSetsVisibleCount(10);
                  },
                  className: "playground-plugins-search",
                  placeholder: "Search evaluations",
                  "aria-label": "Search evaluations",
                })
              ),
              React.createElement("div", { className: "playground-plugins-toolbar-controls playground-evaluations-overview-controls" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (evaluationSetsToolbarPopover === "sort" || sortMode !== "updated-desc" ? " is-active" : ""),
                    onClick: () => {
                      setEvaluationSetRowMenuId("");
                      setEvaluationSetsToolbarPopover((current) => current === "sort" ? "" : "sort");
                    },
                    title: activeSortOption.label,
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  evaluationSetsToolbarPopover === "sort"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) => renderToolbarOption({
                          option,
                          active: sortMode === option.id,
                          onClick: () => {
                            setEvaluationSetsSortMode(option.id);
                            setEvaluationSetsVisibleCount(10);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (evaluationSetsToolbarPopover === "filter" || filterMode !== "all" ? " is-active" : ""),
                    onClick: () => {
                      setEvaluationSetRowMenuId("");
                      setEvaluationSetsToolbarPopover((current) => current === "filter" ? "" : "filter");
                    },
                    title: activeFilterOption.label,
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  evaluationSetsToolbarPopover === "filter"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                        filterOptions.map((option) => renderToolbarOption({
                          option,
                          active: filterMode === option.id,
                          onClick: () => {
                            setEvaluationSetsFilterMode(option.id);
                            setEvaluationSetsVisibleCount(10);
                            closeToolbarPopover();
                          },
                        }))
                      )
                    : null
                )
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-top-nav-private-chat-button playground-agents-nav-create-button playground-agents-overview-toolbar-create-button playground-evaluations-overview-create-button",
                onClick: openEvaluationCreateModal,
              },
                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Evaluation")
              )
            ),
            includeColumns ? renderEvaluationOverviewColumnHeader() : null
          );
          function renderEvaluationSetRow(set) {
            const dateLabel = formatPlaygroundEvaluationDate(set.updatedAt || set.createdAt);
            const setId = String(set?.id || "").trim();
            const isEvaluationSelected = selectedEvaluationOverviewIds.has(setId);
            return React.createElement("div", {
                key: setId,
                role: "button",
                tabIndex: 0,
                className: "playground-project-overview-threads-table-row",
                onClick: () => openSetDetail(set.id),
                onKeyDown: (event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  openSetDetail(set.id);
                },
              },
              React.createElement("div", { className: "playground-project-overview-thread-cell is-select" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-agents-overview-select-checkbox" + (isEvaluationSelected ? " is-selected" : ""),
                  role: "checkbox",
                  "aria-checked": isEvaluationSelected ? "true" : "false",
                  "aria-label": "Select " + (set.name || "evaluation"),
                  onClick: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleEvaluationOverviewSelection(setId);
                  },
                  onKeyDown: (event) => event.stopPropagation(),
                })
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-name", title: set.description || set.name || "" },
                React.createElement("div", { className: "playground-plugin-row-title" }, set.name || "Untitled Evaluation")
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-model" },
                renderEvaluationSetEvaluatorCell(set)
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-source" }, String(set.dataRows.length)),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-creator" },
                renderEvaluationSetCreatorCell(set)
              ),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-date", title: dateLabel }, dateLabel),
              React.createElement("div", { className: "playground-project-overview-thread-cell is-actions playground-overview-table-action-cell playground-tasks-toolbar-popup-shell playground-evaluations-overview-action-shell" },
                React.createElement("div", {
                    className: "playground-tasks-toolbar-popup-shell",
                    onClick: (event) => event.stopPropagation(),
                  },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-overview-table-action-button" + (evaluationSetRowMenuId === set.id ? " is-open" : ""),
                    "aria-label": "Evaluation actions",
                    "aria-expanded": evaluationSetRowMenuId === set.id ? "true" : "false",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setEvaluationSetsToolbarPopover("");
                      setEvaluationSetRowMenuId((current) => current === set.id ? "" : set.id);
                    },
                  }, React.createElement(EllipsisVertical, { className: "playground-overview-table-action-icon", strokeWidth: 1.8 })),
                  evaluationSetRowMenuId === set.id
                    ? React.createElement("div", {
                        className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                        onClick: (event) => event.stopPropagation(),
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setEvaluationSetRowMenuId("");
                            openEvaluationRenameDialog(set);
                          },
                        },
                          React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Rename")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          disabled: getEvaluationRunnableCaseCount(set) === 0,
                          onClick: () => {
                            setEvaluationSetRowMenuId("");
                            openRunEvaluationModal(set.id);
                          },
                        },
                          React.createElement(Play, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Run")
                          )
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setEvaluationSetRowMenuId("");
                            handleDeleteEvaluation(set.id);
                          },
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
          return React.createElement("div", { className: "playground-plugins-page playground-guardrails-layout playground-evaluations-overview-layout playground-team-overview-page playground-agents-overview-page playground-evaluations-overview-shell is-develop-configure-page" },
            React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-team-grid-table-section playground-evaluations-overview-section",
              },
              visibleSets.length === 0 ? renderEvaluationOverviewStickyTableHeader(false) : null,
              visibleSets.length > 0
                ? React.createElement("div", { className: "playground-project-overview-threads-table playground-evaluations-runs-table playground-agents-overview-list-table playground-evaluations-overview-table" },
                    renderEvaluationOverviewStickyTableHeader(false),
                    React.createElement("div", { className: "playground-project-overview-thread-list" },
                      renderEvaluationOverviewColumnHeader(),
                      visibleSets.map((set) => renderEvaluationSetRow(set))
                    )
                  )
                : normalizedSets.length === 0
                  ? React.createElement("div", { className: "playground-guardrails-empty" },
                      React.createElement("div", { className: "playground-guardrails-empty-icon" }, React.createElement(ChartColumnIncreasing, { width: 18, height: 18, strokeWidth: 1.8 })),
                      React.createElement("div", { className: "playground-guardrails-empty-title" }, "No evaluations yet"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-library-new-button playground-guardrails-empty-button",
                        onClick: openEvaluationCreateModal,
                      }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }), "New Evaluation")
                    )
                  : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                      hasFilters ? "No matching evaluations." : "No evaluations yet."
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

        function renderEvaluationCaseEditorModal() {
          const state = evaluationCaseEditorState;
          if (!state?.setId) {
            return null;
          }
          const draft = buildEvaluationCaseEditorDraft(state.draft || {}, Number(state.index || 0));
          const runCountValue = String(state.draft?.runCount ?? draft.runCount ?? "1");
          const isNew = state.isNew === true;
          return React.createElement("div", {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-case-editor-backdrop"
                + (evaluationCaseEditorVisible ? " is-visible" : "")
                + (evaluationCaseEditorClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationCaseEditor,
            },
            React.createElement("form", {
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-case-editor-modal"
                  + (evaluationCaseEditorVisible ? " is-visible" : "")
                  + (evaluationCaseEditorClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: saveEvaluationCaseEditor,
              },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(FilePlus2, { width: 18, height: 18, strokeWidth: 1.8 })
                  ),
	                  React.createElement("div", {
	                    className: "playground-content-title playground-tasks-project-modal-name-input",
	                    style: { display: "flex", alignItems: "center" },
	                  }, isNew ? "New Case" : "Edit Case")
	                ),
	                React.createElement("div", { className: "playground-evaluations-case-editor-top-actions" },
	                  React.createElement("label", { className: "playground-evaluations-case-editor-run-field" },
	                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Runs per Evaluation"),
	                    React.createElement("input", {
	                      type: "number",
	                      min: "1",
	                      max: "50",
	                      step: "1",
	                      className: "playground-environments-input playground-evaluations-case-editor-run-input",
	                      value: runCountValue,
	                      onChange: (event) => updateEvaluationCaseEditorDraft({ runCount: event.target.value }),
	                    })
	                  ),
	                  React.createElement("button", {
	                    type: "button",
	                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
	                    onClick: closeEvaluationCaseEditor,
	                    title: "Close",
	                    "aria-label": "Close case editor",
	                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                )
	              ),
	              React.createElement("div", { className: "playground-project-overview-outcome-editor-body playground-evaluations-case-editor-body" },
	                renderEvaluationCaseEditorMarkdownSection("input", "Input", "Input sent to the agent"),
	                renderEvaluationCaseEditorMarkdownSection("expectedOutput", "Expected Output", "Reference output or expected behavior"),
	                renderEvaluationCaseEditorMarkdownSection("evaluationGuidance", "Evaluator Guidance", "Optional scoring guidance for this case"),
	                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button playground-project-overview-outcome-delete-button",
                    onClick: deleteEvaluationCaseEditor,
                  }, isNew ? "Discard" : "Delete"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationCaseEditor,
	                  }, "Cancel"),
	                  React.createElement("button", {
	                    type: "button",
	                    className: "playground-environments-action-button is-primary",
	                    onClick: saveEvaluationCaseEditor,
	                  }, "Save Case")
                )
              )
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

        function renderEvaluationVersionsSidebar() {
          if (!isEvaluationDetailPage || !activeSet || !evaluationVersionsSidebarOpen) {
            return null;
          }
          const versions = readSelectedEvaluationVersions();
          const metadata = getEvaluationVersionMetadata();
          const activeVersion = getSelectedEvaluationActiveVersion();
          const activeVersionId = String(activeVersion?.id || metadata.activeEvaluationVersionId || metadata.active_evaluation_version_id || "").trim();
          const selectedVersionId = String(
            metadata.restoredFromEvaluationVersionId
            || metadata.restored_from_evaluation_version_id
            || activeVersionId
            || ""
          ).trim();
          return React.createElement(PlaygroundVersionSidebar, {
            className: "playground-evaluations-versions-sidebar",
            open: evaluationVersionsSidebarOpen,
            title: "Publish Evaluation",
            versions,
            activeVersionId,
            selectedVersionId,
            state: evaluationVersionState,
            busy: evaluationVersionState.status === "loading",
            openMenuId: openEvaluationVersionMenuId,
            onOpenMenuIdChange: setOpenEvaluationVersionMenuId,
            headerMenuOpen: evaluationVersionsHeaderMenuOpen,
            headerMenuActions: getEvaluationVersionPopupActions({ includeVersionHistory: false }),
            headerMenuDisabled: evaluationVersionState.status === "loading",
            onHeaderMenuOpenChange: setEvaluationVersionsHeaderMenuOpen,
            onClose: closeEvaluationVersionsSidebar,
            onSaveVersion: () => openCreateEvaluationVersionModal({ force: true }),
            onRestoreVersion: (versionId) => restoreEvaluationVersion(versionId),
            onPublishVersion: (versionId) => publishEvaluationVersion(versionId),
            canPublishVersion: (version) => canPublishEvaluationVersion(version),
            onDeleteVersion: (versionId) => deleteEvaluationVersion(versionId),
            versionsSectionFooter: React.createElement("div", { className: "playground-metronome-publish-section-footer playground-agents-version-compare-footer" },
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-secondary-button playground-metronome-publish-new-button playground-agents-version-compare-button",
                disabled: evaluationVersionState.status === "loading" || !versions.length,
                onClick: () => openEvaluationVersionChangesPage(),
              },
                React.createElement(Code2, { width: 13, height: 13, strokeWidth: 1.8 }),
                React.createElement("span", null, "View Changes")
              )
            ),
            getRowMenuItems: (version) => [
              {
                id: "edit",
                label: "Edit version",
                icon: SquarePen,
                onClick: () => openEditEvaluationVersionModal(version.id),
              },
              {
                id: "compare",
                label: "View Changes",
                icon: Code2,
                onClick: () => openEvaluationVersionChangesPage(version.id),
              },
              {
                id: "restore",
                label: "Restore version",
                icon: RotateCcw,
                onClick: () => restoreEvaluationVersion(version.id),
              },
              {
                id: "delete",
                label: "Delete version",
                icon: Trash2,
                danger: true,
                onClick: () => deleteEvaluationVersion(version.id),
              },
            ],
            getVersionTitle: (version) => String(version.label || ("Version " + version.version)).trim(),
            getVersionDescription: () => "",
            getVersionMeta: (version) => {
              const lifecycleLabel = version.status === "active"
                ? "Published"
                : version.status === "superseded"
                  ? "Superseded"
                  : version.status === "unpublished"
                    ? "Unpublished"
                    : "Saved";
              return lifecycleLabel + " " + formatPlaygroundEvaluationDate(version.publishedAt || version.updatedAt || version.createdAt);
            },
          });
        }

        function renderEvaluationVersionsSidebarPortal() {
          const sidebar = renderEvaluationVersionsSidebar();
          if (!sidebar) {
            return null;
          }
          const drawerContainer = typeof document !== "undefined" && versionsDrawerPortalId
            ? document.getElementById(versionsDrawerPortalId)
            : null;
          if (drawerContainer && typeof createPortal === "function") {
            return createPortal(sidebar, drawerContainer);
          }
          return React.createElement("aside", {
              className: "playground-metronome-node-drawer playground-agent-versions-inline-drawer is-open",
            },
            sidebar
          );
        }

        function renderEvaluationPublishSplitButton() {
          const isBusy = evaluationVersionState.status === "loading";
          const actions = getEvaluationVersionPopupActions();
          return renderPlaygroundPlatformPopup({
            open: evaluationPublishMenuOpen,
            shellRef: evaluationPublishMenuRef,
            shellClassName: "playground-agents-detail-publish-split-shell playground-evaluations-publish-split-shell",
            menuClassName: "playground-agents-detail-publish-menu playground-evaluations-publish-menu",
            trigger: React.createElement("div", {
                className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button playground-evaluations-publish-button playground-agents-detail-publish-split-control"
                  + (evaluationVersionsSidebarOpen ? " is-active" : "")
                  + (isBusy ? " is-disabled" : ""),
              },
              React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-publish-main",
                  title: "Open evaluation versions",
                  "aria-label": "Open evaluation versions",
                  "aria-expanded": evaluationVersionsSidebarOpen ? "true" : "false",
                  disabled: isBusy,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    setEvaluationVersionsHeaderMenuOpen(false);
                    setEvaluationVersionsSidebarOpen(true);
                  },
                },
                React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Publish")
              ),
              React.createElement("span", { className: "playground-agents-detail-publish-divider", "aria-hidden": "true" }),
              React.createElement("button", {
                  type: "button",
                  className: "playground-agents-detail-publish-chevron",
                  title: "Version save options",
                  "aria-label": "Version save options",
                  "aria-haspopup": "menu",
                  "aria-expanded": evaluationPublishMenuOpen ? "true" : "false",
                  disabled: isBusy,
                  onClick: (event) => {
                    event.stopPropagation();
                    setEvaluationPublishMenuOpen((current) => !current);
                  },
                },
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              )
            ),
            menuProps: {
              role: "menu",
              onClick: (event) => event.stopPropagation(),
            },
            children: React.createElement(React.Fragment, null,
              actions.map((action) => React.createElement("button", {
                  key: action.id,
                  type: "button",
                  className: "tb-popup-row",
                  role: "menuitem",
                  disabled: isBusy || action.disabled,
                  onClick: () => {
                    setEvaluationPublishMenuOpen(false);
                    action.onClick();
                  },
                },
                React.createElement(action.Icon, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 2.15 }),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, action.label)
                ),
                action.shortcut
                  ? React.createElement("span", {
                      className: "playground-agents-detail-publish-menu-shortcut",
                      "aria-hidden": "true",
                    }, action.shortcut)
                  : null
              ))
            )
          });
        }

        function renderEvaluationVersionChangesPage() {
          if (!evaluationVersionChangesState || !activeSet) {
            return null;
          }
          const versions = readSelectedEvaluationVersions();
          const sources = buildEvaluationVersionCompareSources(versions);
          const requestedLeftSourceId = String(evaluationVersionChangesState.leftSourceId || "").trim()
            || getDefaultEvaluationVersionCompareLeftSourceId(versions);
          const requestedRightSourceId = String(evaluationVersionChangesState.rightSourceId || "").trim()
            || EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID;
          const currentEditorSource = sources.find((source) => source.id === EVALUATION_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
          const leftSource = resolveEvaluationVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
          const rightSource = resolveEvaluationVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
          if (!leftSource || !rightSource) {
            return null;
          }
          const diffFiles = buildPlaygroundEvaluationVersionDiffFilesFromSnapshots(leftSource.snapshot, rightSource.snapshot);
          const compareOptions = sources.map((source) =>
            React.createElement("option", { key: source.id, value: source.id }, source.label)
          );
          const renderCompareSelect = (value, side) =>
            React.createElement("label", { className: "playground-version-changes-select-shell" },
              React.createElement("span", { className: "playground-version-changes-select-control-wrap" },
                React.createElement("select", {
                  className: "playground-version-changes-select-control",
                  value,
                  onChange: (event) => handleEvaluationVersionCompareSourceChange(side, event.target.value),
                }, compareOptions),
                React.createElement(ChevronDown, { width: 13, height: 13, strokeWidth: 1.8, "aria-hidden": "true" })
              )
            );
          return renderPlaygroundVersionChangesPage({
            title: "Changes",
            compareControls: React.createElement(React.Fragment, null,
              renderCompareSelect(leftSource.id, "left"),
              React.createElement("span", { className: "playground-version-changes-select-arrow", "aria-hidden": "true" }, "→"),
              renderCompareSelect(rightSource.id, "right")
            ),
            actions: renderEvaluationPublishSplitButton(),
            files: diffFiles,
            backIcon: ArrowLeft,
            backText: "Back",
            backLabel: "Back to evaluation",
            onBack: closeEvaluationVersionChangesPage,
            emptyMessage: "No differences from the current editor.",
            className: "playground-evaluations-version-changes-page",
          });
        }

        function renderEvaluationVersionModal() {
          if (!evaluationVersionModal) {
            return null;
          }
          const isBusy = evaluationVersionState.status === "loading";
          const isEditMode = evaluationVersionModal.mode === "edit";
          const trimmedVersionName = String(evaluationVersionNameDraft || "").trim();
          const renderDescriptionField = () => React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor playground-evaluations-version-description-editor" },
            React.createElement("div", { className: "playground-tasks-detail-section-header" },
              React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
              React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                [
                  { id: "bold", label: "Bold", icon: Bold },
                  { id: "italic", label: "Italic", icon: Italic },
                  { id: "underline", label: "Underline", icon: Underline },
                  { id: "list", label: "List", icon: List },
                ].map((action) =>
                  React.createElement("button", {
                    key: action.id,
                    type: "button",
                    className: "playground-tasks-detail-format-button",
                    title: action.label,
                    "aria-label": action.label,
                    disabled: isBusy,
                    onMouseDown: (event) => event.preventDefault(),
                    onClick: () => applyEvaluationVersionDescriptionMarkdownFormat(action.id),
                  }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: action.id === "bold" ? 2.7 : 1.8 }))
                )
              )
            ),
            React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEvaluationVersionDescriptionEditing ? " is-editing" : " is-preview") },
              !isEvaluationVersionDescriptionEditing
                ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                    String(evaluationVersionDescriptionDraft || "").trim()
                      ? typeof PlaygroundTaskDescriptionMarkdown === "function"
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: evaluationVersionDescriptionDraft,
                            className: "playground-tasks-detail-description-preview tb-message-markdown",
                          })
                        : React.createElement("div", { className: "playground-tasks-detail-description-preview" }, evaluationVersionDescriptionDraft)
                      : React.createElement("div", {
                          className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                        }, "Describe what changed in this version.")
                  )
                : null,
              React.createElement("textarea", {
                ref: evaluationVersionDescriptionTextareaRef,
                className: "playground-tasks-detail-description-input " + (isEvaluationVersionDescriptionEditing ? "is-editing" : "is-preview"),
                rows: 1,
                placeholder: isEvaluationVersionDescriptionEditing ? "Describe what changed in this version." : "",
                value: evaluationVersionDescriptionDraft || "",
                disabled: isBusy,
                onFocus: (event) => {
                  setIsEvaluationVersionDescriptionEditing(true);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onChange: (event) => {
                  setEvaluationVersionDescriptionDraft(event.target.value);
                  resizeEvaluationGuidanceTextarea(event.currentTarget);
                },
                onBlur: () => setIsEvaluationVersionDescriptionEditing(false),
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeEvaluationVersionModal();
                  }
                },
              })
            )
          );
          return renderPlaygroundPlatformModal({
            open: Boolean(evaluationVersionModal),
            visible: evaluationVersionModalVisible,
            closing: evaluationVersionModalClosing,
            onClose: () => closeEvaluationVersionModal(),
            as: "form",
            backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop playground-evaluations-version-modal-backdrop",
            className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal playground-evaluations-version-modal",
            ariaLabel: isEditMode ? "Edit evaluation version" : "New evaluation version",
            surfaceProps: {
              onSubmit: (event) => {
                event.preventDefault();
                commitEvaluationVersionModal();
              },
              onKeyDown: (event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeEvaluationVersionModal();
                }
              },
            },
            children: React.createElement(React.Fragment, null,
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(isEditMode ? SquarePen : GitBranchPlus, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                    value: evaluationVersionNameDraft,
                    placeholder: "Version name",
                    autoFocus: true,
                    disabled: isBusy,
                    onChange: (event) => setEvaluationVersionNameDraft(event.target.value),
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: () => closeEvaluationVersionModal(),
                  title: "Close",
                  disabled: isBusy,
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                renderDescriptionField(),
                evaluationVersionState.status === "error" && evaluationVersionState.error
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, evaluationVersionState.error)
                  : null
              ),
              React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-environments-action-button",
                  onClick: () => closeEvaluationVersionModal(),
                  disabled: isBusy,
                }, "Cancel"),
                React.createElement("button", {
                  type: "submit",
                  className: "playground-environments-action-button is-primary",
                  disabled: isBusy || !trimmedVersionName,
                }, isBusy ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Version" : "Create Version"))
              )
            )
          });
        }

        function renderEvaluationTopNavActions() {
          if (!isEvaluationDetailPage || !activeSet || !evaluationTopNavActionsContainer || typeof createPortal !== "function") {
            return null;
          }

          return createPortal(
            React.createElement("div", { className: "playground-evaluations-detail-topnav-actions" },
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-create-button playground-metronome-publish-button playground-guardrails-publish-button",
                onClick: () => openRunEvaluationModal(activeSet.id),
                disabled: getEvaluationRunnableCaseCount(activeSet) === 0,
              },
                React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Run Evaluation")
              ),
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
              )
            ),
            evaluationTopNavActionsContainer
          );
        }

        function renderEvaluationRenameModal() {
          if (!evaluationRenameState) {
            return null;
          }
          const isRunRename = evaluationRenameState.type === "run";

          return React.createElement("div", {
              className: "sidebar-thread-rename-scrim",
              onClick: closeEvaluationRenameDialog,
            },
              React.createElement("form", {
                className: "sidebar-thread-rename-modal",
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleEvaluationRenameSubmit,
              },
                React.createElement("div", { className: "sidebar-thread-rename-title" }, isRunRename ? "Rename Evaluation Run" : "Rename Evaluation"),
                React.createElement("div", { className: "sidebar-thread-rename-copy" }, isRunRename ? "Choose a new name for this evaluation run." : "Choose a new name for this evaluation set."),
                React.createElement("input", {
                  ref: evaluationRenameInputRef,
                  className: "sidebar-thread-rename-input",
                  value: evaluationRenameValue,
                  onChange: (event) => {
                    setEvaluationRenameValue(event.target.value);
                    setEvaluationRenameError("");
                  },
                  placeholder: isRunRename ? "Run name" : "Evaluation name",
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

        function renderEvaluationThreadCaseModal() {
          const normalizedSetId = String(evaluationThreadCaseModalSetId || "").trim();
          if (!normalizedSetId) {
            return null;
          }
          const normalizedSearch = String(evaluationThreadCaseSearchQuery || "").trim().toLowerCase();
          const selectedIds = new Set((Array.isArray(evaluationThreadCaseSelectedIds) ? evaluationThreadCaseSelectedIds : []).map((id) => String(id || "").trim()).filter(Boolean));
          const filteredThreads = sourceThreadOptions
            .filter((thread) => {
              if (!normalizedSearch) return true;
              return [
                thread.id,
                thread.title,
                thread.agentName,
                thread.environmentName,
                thread.status,
              ].join(" ").toLowerCase().includes(normalizedSearch);
            })
            .slice(0, 80);
          const isBusy = evaluationThreadCaseStatus.status === "loading" || evaluationThreadCaseStatus.status === "refreshing";
          const isGenerating = evaluationThreadCaseStatus.status === "loading";
          const selectedCount = selectedIds.size;
          const canGenerate = selectedCount > 0 && !isGenerating;
          const refreshThreadsForPicker = () => {
            if (typeof onRefreshThreadRecords !== "function" || isBusy) return;
            setEvaluationThreadCaseStatus({ status: "refreshing", message: "Refreshing threads...", error: "" });
            Promise.resolve(onRefreshThreadRecords())
              .then(() => setEvaluationThreadCaseStatus({ status: "idle", message: "", error: "" }))
              .catch((error) => setEvaluationThreadCaseStatus({ status: "error", message: "", error: error?.message || String(error) }));
          };

          return React.createElement("div", {
              className: "playground-evaluations-modal-backdrop",
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationThreadCaseModal,
            },
            React.createElement("div", {
                className: "playground-evaluations-modal playground-evaluations-thread-case-modal",
                onClick: (event) => event.stopPropagation(),
              },
              React.createElement("div", { className: "playground-evaluations-modal-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-evaluations-modal-title" }, "Refine Cases from Threads"),
                  React.createElement("div", { className: "playground-evaluations-modal-copy" },
                    "Select historical threads. An agent will analyze each thread and create an editable evaluation case, even if the historical run failed."
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-guardrails-row-action",
                  onClick: closeEvaluationThreadCaseModal,
                  "aria-label": "Close",
                }, React.createElement(X, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-evaluations-thread-picker-toolbar" },
                React.createElement("input", {
                  className: "playground-evaluations-thread-picker-search",
                  value: evaluationThreadCaseSearchQuery,
                  placeholder: "Search threads",
                  onChange: (event) => setEvaluationThreadCaseSearchQuery(event.target.value),
                  autoFocus: true,
                }),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: refreshThreadsForPicker,
                  disabled: isBusy,
                },
                  React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Refresh")
                )
              ),
              React.createElement("div", { className: "playground-evaluations-thread-picker-list" },
                filteredThreads.length > 0
                  ? filteredThreads.map((thread) => {
                      const selected = selectedIds.has(thread.id);
                      const metaParts = [
                        thread.agentName || "No agent",
                        thread.environmentName || "",
                        thread.updatedAt ? formatPlaygroundEvaluationDate(thread.updatedAt) : "",
                        thread.messageCount ? String(thread.messageCount) + " messages" : "",
                      ].filter(Boolean);
                      return React.createElement("button", {
                          key: thread.id,
                          type: "button",
                          className: "playground-evaluations-thread-picker-row" + (selected ? " is-selected" : ""),
                          onClick: () => toggleEvaluationThreadCaseSelection(thread.id),
                        },
                        React.createElement("span", { className: "playground-evaluations-thread-picker-check", "aria-hidden": "true" },
                          selected ? React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 }) : null
                        ),
                        React.createElement("span", { className: "playground-evaluations-thread-picker-main" },
                          React.createElement("span", { className: "playground-evaluations-thread-picker-title" }, thread.title || thread.id),
                          React.createElement("span", { className: "playground-evaluations-thread-picker-meta" }, metaParts.join(" / ") || thread.id)
                        ),
                        React.createElement("span", { className: "playground-evaluations-thread-picker-status" }, thread.status || "thread")
                      );
                    })
                  : React.createElement("div", { className: "playground-evaluations-thread-picker-empty" },
                      sourceThreadOptions.length > 0 ? "No matching threads." : "No eligible historical threads found."
                    )
              ),
              React.createElement("div", {
                className: "playground-evaluations-thread-picker-status-line" + (evaluationThreadCaseStatus.error ? " is-error" : ""),
              }, evaluationThreadCaseStatus.error || evaluationThreadCaseStatus.message || (selectedCount > 0 ? selectedCount + " selected" : "")),
              React.createElement("div", { className: "playground-evaluations-modal-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-library-new-button",
                  onClick: closeEvaluationThreadCaseModal,
                  disabled: isGenerating,
                }, "Cancel"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-create-button playground-metronome-publish-button",
                  onClick: handleGenerateEvaluationCasesFromThreads,
                  disabled: !canGenerate,
                }, isGenerating ? "Refining..." : "Refine Cases")
              )
            )
          );
        }

        function renderRunModal() {
          if (!evaluationRunModalOpen && !evaluationRunModalClosing) {
            return null;
          }
          const form = evaluationRunForm && typeof evaluationRunForm === "object" ? evaluationRunForm : {};
          const targetSet = normalizedSets.find((set) => set.id === String(form.setId || "").trim()) || activeSet;
          const evaluatorType = ["agent", "code", "exact"].includes(String(form.evaluatorType || "").trim()) ? String(form.evaluatorType || "").trim() : "agent";
          const selectedEnvironmentChoice = getPlaygroundEvaluationEnvironmentChoiceByKey(environmentChoices, form.environmentKey)
            || getPlaygroundEvaluationEnvironmentChoice(environmentChoices, targetSet || {}, defaultEnvironmentId);
          const selectedEnvironmentKey = selectedEnvironmentChoice?.key || "";
          const selectedTargetAgentId = getPlaygroundEvaluationDefaultId(agentOptions, form.targetAgentId || targetSet?.targetAgentId || defaultAgentId);
          const selectedEvaluatorAgentId = String(form.evaluatorAgentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || agentOptions[0]?.id || "").trim();
          const canStartRun = Boolean(
            targetSet
            && selectedEnvironmentKey
            && selectedTargetAgentId
            && (evaluatorType !== "agent" || selectedEvaluatorAgentId)
          );
          return React.createElement("div", {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-run-modal-backdrop"
                + (evaluationRunModalVisible ? " is-visible" : "")
                + (evaluationRunModalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationRunModal,
            },
            React.createElement("form", {
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-run-modal"
                  + (evaluationRunModalVisible ? " is-visible" : "")
                  + (evaluationRunModalClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleConfirmRunEvaluation,
              },
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
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: closeEvaluationRunModal,
                  title: "Close",
                  "aria-label": "Close run evaluation modal",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-run-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-run-modal-body" },
                  React.createElement("div", { className: "playground-tasks-issue-modal-grid" },
                  React.createElement("label", { className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" },
                    React.createElement("span", { className: "playground-tasks-project-modal-label" }, "Agent to evaluate"),
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
                          value: selectedEvaluatorAgentId,
                          onChange: (event) => setEvaluationRunForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                        },
                          agentOptions.length > 0
                            ? agentOptions.map((agent) =>
                                React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                              )
                            : React.createElement("option", { value: "" }, "No agents available")
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
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationRunModal,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: !canStartRun,
                  }, "Run Evaluation")
                )
              )
            )
            )
          );
        }

        function renderCreateModal() {
          if (!evaluationCreateModalOpen && !evaluationCreateModalClosing) {
            return null;
          }
          const form = evaluationCreateForm && typeof evaluationCreateForm === "object" ? evaluationCreateForm : {};
          const evaluatorType = String(form.evaluatorType || "agent");
          return React.createElement("div", {
              className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-outcome-editor-backdrop playground-evaluations-create-modal-backdrop"
                + (evaluationCreateModalVisible ? " is-visible" : "")
                + (evaluationCreateModalClosing ? " is-closing" : ""),
              role: "dialog",
              "aria-modal": "true",
              onClick: closeEvaluationCreateModal,
            },
            React.createElement("form", {
                className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal playground-evaluations-create-modal"
                  + (evaluationCreateModalVisible ? " is-visible" : "")
                  + (evaluationCreateModalClosing ? " is-closing" : ""),
                onClick: (event) => event.stopPropagation(),
                onSubmit: handleCreateEvaluation,
              },
              React.createElement("div", { className: "playground-tasks-project-modal-top" },
                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                    React.createElement(ChartColumnIncreasing, { width: 18, height: 18, strokeWidth: 1.9 })
                  ),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-tasks-project-modal-name-input playground-project-overview-outcome-editor-title-input",
                    value: form.name || "",
                    placeholder: "Evaluation name",
                    onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), name: event.target.value })),
                    autoFocus: true,
                  })
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                  onClick: closeEvaluationCreateModal,
                  title: "Close",
                  "aria-label": "Close",
                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-body playground-project-overview-outcome-editor-shell playground-evaluations-create-modal-shell" },
                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-overview-outcome-editor-body playground-evaluations-create-modal-body" },
                  React.createElement("div", { className: "playground-evaluations-form-grid" },
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
                    ? React.createElement("label", { className: "playground-evaluations-field is-full" },
                        React.createElement("span", null, "Evaluator Agent"),
                        React.createElement("select", {
                          className: "playground-evaluations-select",
                          value: form.evaluatorAgentId || getPlaygroundEvaluationDefaultId(agentOptions, defaultAgentId) || String(agentOptions[0]?.id || "").trim(),
                          onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorAgentId: event.target.value })),
                        },
                          agentOptions.length > 0
                            ? agentOptions.map((agent) =>
                                React.createElement("option", { key: agent.id, value: agent.id }, agent.name || agent.label || agent.id)
                              )
                            : React.createElement("option", { value: "" }, "No agents available")
                        )
                      )
                    : null,
                  evaluatorType === "code"
                    ? React.createElement("label", { className: "playground-evaluations-field is-full" },
                        React.createElement("span", null, "Evaluator Code"),
                        React.createElement("textarea", {
                          className: "playground-evaluations-textarea",
                          value: form.evaluatorCode || "",
                          placeholder: "return actual.trim() === expected.trim() ? 1 : 0;",
                          onChange: (event) => setEvaluationCreateForm((current) => ({ ...(current || {}), evaluatorCode: event.target.value })),
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: closeEvaluationCreateModal,
                  }, "Cancel"),
                  React.createElement("button", {
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                  }, "Create Evaluation")
                )
              )
            )
          );
        }

        const isEvaluationRunPage = normalizedMode === "run" && activeSet && activeRun;
        const isEvaluationCasePage = normalizedMode === "case" && activeSet && activeRun && activeCase;
        const isEvaluationSubpage = isEvaluationDetailPage || isEvaluationRunPage || isEvaluationCasePage;
        const isEvaluationOverviewPage = !isEvaluationSubpage && normalizedMode !== "detail";
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
              evaluationVersionChangesState
                ? null
                : React.createElement("div", { className: "playground-files-browser-header playground-guardrails-browser-header" + (isEvaluationOverviewPage ? " playground-guardrails-overview-browser-header" : "") },
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
                            if (
                              evaluationRunReturnTarget?.page === "fine-tuning"
                              && String(evaluationRunReturnTarget?.fineTuneJobId || evaluationRunReturnTarget?.jobId || "").trim()
                              && typeof onEvaluationRunBack === "function"
                            ) {
                              onEvaluationRunBack(evaluationRunReturnTarget);
                              return;
                            }
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
                          React.createElement("div", { className: "playground-evaluations-settings-header-control" },
                            renderEvaluationPassThresholdInline(activeSet)
                          ),
                          renderEvaluationPublishSplitButton()
                        )
                      : isEvaluationRunPage || isEvaluationCasePage
                        ? React.createElement("div", { className: "playground-guardrails-detail-actions" },
                            React.createElement("span", { className: "playground-guardrails-readonly-pill" },
                              formatPlaygroundEvaluationDate(activeRun.completedAt || activeRun.createdAt)
                            )
                          )
                        : null
                  )
                )
              ),
              React.createElement("div", { className: "playground-files-browser-body playground-guardrails-browser-body" + (isEvaluationOverviewPage ? " playground-guardrails-overview-browser-body" : "") },
                normalizedMode === "detail" && evaluationVersionChangesState
                  ? React.createElement("div", { className: "playground-guardrails-detail playground-evaluations-version-changes-shell" },
                      renderEvaluationVersionChangesPage()
                    )
                  : normalizedMode === "case" ? renderCase() : normalizedMode === "run" ? renderRun() : normalizedMode === "detail" ? renderDetail() : renderOverview()
              )
            )
          ),
	          renderRunModal(),
	          renderEvaluationCaseEditorModal(),
	          renderEvaluationRenameModal(),
            renderEvaluationThreadCaseModal(),
	          renderCreateModal(),
            renderEvaluationVersionModal(),
            renderEvaluationVersionsSidebarPortal()
	        );
      }
`;
