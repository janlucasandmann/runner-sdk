export const EVALUATIONS_STYLE_DETAIL = String.raw`        line-height: 1.35;
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

      .playground-evaluations-thread-case-modal {
        width: min(760px, calc(100vw - 32px));
        height: min(720px, calc(100dvh - 48px));
        display: flex;
        flex-direction: column;
      }

      .playground-evaluations-thread-case-modal-body {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
        padding-top: 0;
        padding-bottom: 0;
        overflow: hidden;
      }

      .playground-evaluations-thread-picker-header-search.platform-search {
        width: 300px;
        min-width: 300px;
      }

      .playground-evaluations-thread-picker-table {
        min-width: 0;
        min-height: 0;
        --platform-data-table-surface: transparent;
        --platform-data-table-body-background: transparent;
        --platform-data-table-row-background: transparent;
        --platform-data-table-header-background: transparent;
        --platform-data-table-sticky-background: transparent;
      }

      .playground-evaluations-thread-picker-table.platform-data-table.is-fill-layout {
        flex: 1 1 auto;
        height: 100%;
        max-height: 100%;
      }

      .playground-evaluations-thread-picker-table.platform-data-table,
      .playground-evaluations-thread-picker-table .platform-data-table__surface,
      .playground-evaluations-thread-picker-table .platform-data-table__table,
      .playground-evaluations-thread-picker-table .platform-data-table__sticky,
      .playground-evaluations-thread-picker-table .platform-data-table__header-group,
      .playground-evaluations-thread-picker-table .platform-data-table__header,
      .playground-evaluations-thread-picker-table .platform-data-table__scroll,
      .playground-evaluations-thread-picker-table .platform-data-table__body,
      .playground-evaluations-thread-picker-table .platform-data-table__row,
      .playground-evaluations-thread-picker-table .platform-data-table__pagination {
        background: transparent !important;
      }

      .playground-evaluations-thread-picker-table.platform-data-table.is-fill-layout > .platform-data-table__surface,
      .playground-evaluations-thread-picker-table.platform-data-table.is-fill-layout .platform-data-table__table,
      .playground-evaluations-thread-picker-table.platform-data-table.is-fill-layout .platform-data-table__scroll {
        flex: 1 1 auto;
        min-height: 0;
      }

      .playground-evaluations-thread-picker-table .platform-data-table__scroll {
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .playground-evaluations-thread-picker-table .platform-data-table__pagination {
        flex: 0 0 auto;
      }

      .playground-evaluations-thread-picker-cell {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-thread-picker-cell.is-title,
      .playground-evaluations-thread-picker-cell.is-agent-name {
        color: #fff;
      }

      .playground-evaluations-thread-picker-agent-cell {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-evaluations-thread-picker-cell.is-muted {
        color: rgba(255, 255, 255, 0.58);
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

      .playground-evaluations-page .playground-guardrails-browser-body.is-detail-page {
        width: 100%;
        max-width: none;
        padding: 42px 44px 56px;
        overflow: auto;
        box-sizing: border-box;
      }

      .playground-evaluations-detail-overview-layout {
        --platform-page-content-max-width: 87.5rem;
      }

      .playground-evaluations-detail-page-header {
        min-height: 32px;
      }

      .playground-evaluations-detail-header-copy {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-evaluations-title-input {
        min-width: 0;
        width: 100%;
        max-width: min(680px, calc(100vw - 420px));
        flex: 1 1 auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: #fff;
        font-size: 18px;
        line-height: 1.3;
        font-weight: 500;
        outline: none;
      }

      .playground-evaluations-run-title {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        color: #fff;
        font-size: 18px;
        line-height: 1.3;
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-detail-inline-back-button {
        margin-left: -7px;
      }

      .playground-evaluations-detail-overview-main,
      .playground-evaluations-detail-overview-main > .playground-guardrails-editor {
        min-width: 0;
      }

      .playground-evaluations-detail-overview-main > .playground-guardrails-editor {
        display: contents;
      }

      .playground-evaluations-detail-sidebar-list {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-evaluations-detail-sidebar-row {
        min-width: 0;
        min-height: 30px;
        display: grid;
        grid-template-columns: minmax(88px, 110px) minmax(0, 1fr);
        align-items: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-evaluations-detail-sidebar-label {
        min-width: 0;
        color: #fff;
      }

      .playground-evaluations-detail-sidebar-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-evaluations-detail-person {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-evaluations-detail-sidebar-value .playground-evaluations-run-agent-cell {
        justify-content: flex-end;
      }

      .playground-evaluations-run-agent-version-cell {
        min-width: 0;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-evaluations-run-agent-version-cell > .playground-evaluations-run-agent-cell {
        min-width: 0;
        width: auto;
        flex: 1 1 auto;
      }

      .playground-evaluations-run-agent-version-label.platform-label {
        flex: 0 0 auto;
      }

      .playground-evaluations-detail-sidebar-row.is-environment .playground-evaluations-detail-sidebar-value,
      .playground-evaluations-detail-sidebar-row.is-environment .playground-evaluations-run-environment-cell {
        justify-content: flex-end;
        text-align: right;
      }

      .playground-evaluations-detail-sidebar-row.is-owner .playground-evaluations-detail-sidebar-value {
        flex: 1 1 auto;
        overflow: visible;
      }

      .playground-evaluations-detail-sidebar-row.is-evaluator-selector .playground-evaluations-detail-sidebar-value {
        flex: 1 1 auto;
        overflow: visible;
      }

      .playground-evaluations-detail-evaluator-selector {
        width: 100%;
        min-width: 0;
      }

      .playground-evaluations-detail-evaluator-trigger.platform-selector__trigger {
        width: 100%;
        min-width: 0;
        min-height: 24px;
        justify-content: flex-end;
        gap: 6px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-evaluations-detail-evaluator-trigger.platform-selector__trigger:hover,
      .playground-evaluations-detail-evaluator-trigger.platform-selector__trigger:focus-visible {
        background: transparent;
      }

      .playground-evaluations-detail-evaluator-value {
        justify-content: flex-end;
      }

      .playground-evaluations-detail-sidebar-row.is-owner {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-detail-sidebar-row.playground-evaluations-run-agent-property {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-run-again-button.platform-button {
        width: 100%;
        margin-top: 12px;
      }

      .playground-evaluations-detail-run-button.platform-button {
        width: 100%;
        margin-top: 8px;
      }

      .playground-evaluations-detail-owner-selector {
        width: 100%;
        min-width: 0;
      }

      .playground-evaluations-detail-owner-trigger.platform-selector__trigger {
        width: 100%;
        min-width: 0;
        min-height: 24px;
        justify-content: flex-end;
        gap: 6px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-evaluations-detail-owner-trigger.platform-selector__trigger:hover,
      .playground-evaluations-detail-owner-trigger.platform-selector__trigger:focus-visible {
        background: transparent;
      }

      .playground-evaluations-detail-owner-value {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
      }

      .playground-evaluations-detail-owner-avatar.playground-team-member-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .playground-evaluations-detail-owner-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-access-settings,
      .playground-evaluations-access-detail {
        min-width: 0;
        width: 100%;
      }

      .playground-evaluations-access-detail .platform-permissions-page,
      .playground-evaluations-access-detail .platform-role-permissions-page {
        margin-top: 12px;
      }

      .playground-evaluations-detail-overview-main .playground-evaluations-analytics-card {
        width: 100%;
      }

      .playground-evaluations-detail-overview-main .playground-evaluations-description-section,
      .playground-evaluations-detail-overview-main .playground-evaluations-dataset-guidance-section {
        min-width: 0;
      }

      @media (max-width: 760px) {
        .playground-evaluations-page .playground-guardrails-browser-body.is-detail-page {
          padding: 16px;
        }
      }
`;
