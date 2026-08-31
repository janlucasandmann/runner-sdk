export const EVALUATIONS_STYLE_FOUNDATION = String.raw`
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
        margin-bottom: 12px;
      }

      .playground-evaluations-page .playground-guardrails-detail-title-row {
        border-bottom: 0;
      }

      .playground-evaluations-detail-topnav-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-evaluations-breadcrumb-actions,
      .playground-evaluations-breadcrumb-actions-root,
      .playground-evaluations-breadcrumb-action-menu {
        display: inline-flex;
        align-items: center;
      }

      .playground-evaluations-breadcrumb-actions {
        gap: 4px;
      }

      .playground-evaluations-breadcrumb-action-popup {
        width: min(280px, calc(100vw - 32px));
      }

      .playground-evaluations-version-changes-modal__content {
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
`;
