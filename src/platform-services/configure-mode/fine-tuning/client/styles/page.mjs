export const PLAYGROUND_FINE_TUNING_CSS = String.raw`
      .playground-fine-tuning-page .playground-files-browser-body {
        overflow: hidden;
      }

      .playground-fine-tuning-page .playground-fine-tuning-overview-shell {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin: 0 auto;
      }

      .playground-fine-tuning-page .playground-guardrails-browser-header.playground-guardrails-overview-browser-header,
      .playground-fine-tuning-page .playground-guardrails-browser-body.playground-guardrails-overview-browser-body {
        width: 100%;
        max-width: none;
        padding-left: 24px;
        padding-right: 24px;
      }

      .playground-fine-tuning-page .playground-guardrails-overview-browser-header > .playground-files-library-header {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 12px;
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

      .playground-fine-tuning-page .playground-fine-tuning-detail-page-body {
        width: 100%;
        max-width: none;
        padding: 42px 44px 56px;
        overflow: auto;
        box-sizing: border-box;
      }

      .playground-fine-tuning-detail-overview-layout {
        --platform-page-content-max-width: 87.5rem;
      }

      .playground-fine-tuning-detail-page-header {
        min-height: 32px;
      }

      .playground-fine-tuning-detail-header-copy {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 0;
      }

      .playground-fine-tuning-detail-inline-back-button {
        margin-left: -7px;
      }

      .playground-fine-tuning-detail-title {
        min-width: 0;
        margin: 0;
        color: #fff;
        font-size: 18px;
        line-height: 1.3;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-detail-overview-main {
        min-width: 0;
      }

      .playground-fine-tuning-description-section.playground-agents-detail-instructions-section,
      .playground-fine-tuning-instructions-section.playground-agents-detail-instructions-section {
        min-width: 0;
        margin-top: 0;
        margin-bottom: 0;
        padding-bottom: 3px;
      }

      .playground-fine-tuning-description-section .playground-tasks-detail-description-editor,
      .playground-fine-tuning-description-section .playground-tasks-detail-description-input,
      .playground-fine-tuning-description-section .playground-tasks-detail-description-preview-scope.tb-runner-chat,
      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-editor,
      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-input,
      .playground-fine-tuning-instructions-section .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        min-height: 118px;
      }

      .playground-fine-tuning-access-settings,
      .playground-fine-tuning-access-detail {
        width: 100%;
        min-width: 0;
      }

      .playground-fine-tuning-access-detail .platform-permissions-page,
      .playground-fine-tuning-access-detail .platform-role-permissions-page {
        margin-top: 12px;
      }

      .playground-fine-tuning-detail-sidebar-list {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-fine-tuning-detail-sidebar-row {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-fine-tuning-detail-sidebar-label {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-fine-tuning-detail-sidebar-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-fine-tuning-detail-owner-row {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-fine-tuning-owner-selector {
        width: 100%;
        min-width: 0;
      }

      .playground-fine-tuning-owner-trigger.platform-selector__trigger {
        width: 100%;
        min-width: 0;
        min-height: 24px;
        justify-content: flex-start;
        gap: 6px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-fine-tuning-owner-trigger.platform-selector__trigger:hover,
      .playground-fine-tuning-owner-trigger.platform-selector__trigger:focus-visible {
        background: transparent;
      }

      .playground-fine-tuning-owner-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 7px;
      }

      .playground-fine-tuning-owner-avatar.playground-team-member-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .playground-fine-tuning-detail-person,
      .playground-fine-tuning-detail-environment {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-fine-tuning-detail-person > span:last-child,
      .playground-fine-tuning-detail-environment > span:last-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-detail-sidebar-actions {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-fine-tuning-detail-sidebar-action {
        width: 100%;
        min-width: 0;
        justify-content: flex-start;
        padding-left: 0;
        padding-right: 0;
      }

      .playground-fine-tuning-detail-sidebar-action .is-spinning {
        animation: playgroundFineTuningSpin 0.9s linear infinite;
      }

      .playground-fine-tuning-detail-overview-main .playground-fine-tuning-kpi-card,
      .playground-fine-tuning-detail-overview-main .playground-fine-tuning-reference-platform-table {
        width: 100%;
      }

      .playground-fine-tuning-content-title {
        margin: 0 0 12px;
        color: #fff;
        font-size: 14px;
        line-height: 1.3;
        font-weight: 400;
      }

      .playground-fine-tuning-analysis-section.platform-ui-card {
        padding: 20px;
      }

      .playground-fine-tuning-changes-section {
        min-width: 0;
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

      .playground-fine-tuning-create-modal.platform-modal-surface {
        display: flex;
        flex-direction: column;
        height: auto !important;
        min-height: 0;
        max-height: min(720px, calc(100vh - 48px));
        overflow: hidden;
      }

      .playground-fine-tuning-create-modal-platform-body.platform-modal-body {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .playground-fine-tuning-create-modal > .platform-modal-header,
      .playground-fine-tuning-create-modal > .platform-modal-footer {
        flex: 0 0 auto;
      }

      .playground-fine-tuning-create-modal-shell {
        width: 100%;
        min-height: 0;
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

      .playground-fine-tuning-create-modal .playground-evaluations-field .playground-fine-tuning-create-selector {
        flex: 1 1 auto;
        min-width: 0;
        max-width: 100%;
      }

      .playground-fine-tuning-create-selector .playground-fine-tuning-create-selector-trigger {
        width: 100%;
        min-height: 30px;
        justify-content: flex-end;
        gap: 6px;
        color: rgba(255, 255, 255, 0.92);
        text-align: right;
      }

      .playground-fine-tuning-create-selector .platform-selector__value,
      .playground-fine-tuning-create-selector-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
      }

      .playground-fine-tuning-create-selector-value > span:last-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-create-selector-avatar {
        width: 18px;
        height: 18px;
        min-width: 18px;
        flex: 0 0 18px;
        border-radius: 50%;
        overflow: hidden;
      }

      .playground-fine-tuning-create-selector-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-fine-tuning-create-selector-popup {
        width: min(280px, calc(100vw - 48px));
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

      .playground-fine-tuning-evaluation-menu {
        max-height: 270px;
        overflow-y: auto;
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
        grid-template-columns: 34px minmax(170px, 1.12fr) minmax(140px, 0.72fr) minmax(80px, 0.34fr) minmax(122px, 0.58fr) minmax(150px, 0.74fr) 28px;
        gap: 12px;
      }

      .playground-fine-tuning-page .playground-evaluations-overview-section.playground-agents-overview-list-section.playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-header,
      .playground-fine-tuning-page .playground-evaluations-overview-section.playground-agents-overview-list-section.playground-agents-detail-threads-section.playground-evaluations-runs-section .playground-project-overview-threads-table-row {
        grid-template-columns: 34px minmax(260px, 1.25fr) minmax(210px, 0.86fr) minmax(86px, 0.34fr) minmax(150px, 0.62fr) minmax(190px, 0.78fr) 28px !important;
        gap: 12px;
        padding-right: 0;
      }

      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-thread-cell,
      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-plugin-row-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-thread-cell.is-actions,
      .playground-fine-tuning-page .playground-evaluations-overview-section .playground-project-overview-threads-table-header > div:last-child {
        display: flex;
        justify-content: flex-end;
        overflow: visible !important;
      }

      .playground-fine-tuning-overview-loading {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 0;
        text-align: center;
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

      @media (max-width: 760px) {
        .playground-fine-tuning-page .playground-fine-tuning-detail-page-body {
          padding: 16px;
        }
      }
`;
