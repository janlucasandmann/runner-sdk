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
        flex: 1 1 0;
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
        flex: 1 1 0;
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
        width: 100%;
        min-height: 0;
      }

      .playground-evaluations-detail-content {
        min-width: 0;
      }

      .playground-evaluations-detail-sidebar {
        padding-top: 0;
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
        width: 100%;
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

      .playground-evaluations-detail-identity-row .platform-service-detail-page__property-value,
      .playground-evaluations-detail-owner-row .platform-service-detail-page__property-value,
      .playground-evaluations-detail-evaluator-row .platform-service-detail-page__property-value {
        min-width: 0;
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
        margin-bottom: 12px;
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

      .playground-evaluations-run-evidence-card.platform-ui-card {
        width: 100%;
      }

      .playground-evaluations-run-evidence-card.is-trusted {
        border-color: rgba(74, 222, 128, 0.28);
      }

      .playground-evaluations-run-evidence-card.is-untrusted {
        border-color: rgba(250, 204, 21, 0.28);
      }

      .playground-evaluations-run-evidence-summary {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .playground-evaluations-run-evidence-summary > .platform-label {
        flex: 0 0 auto;
        margin-top: 1px;
      }

      .playground-evaluations-run-evidence-summary > p {
        margin: 0;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-evaluations-run-evidence-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 24px;
        margin: 18px 0 0;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-evaluations-run-evidence-grid > div {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-evaluations-run-evidence-grid dt,
      .playground-evaluations-run-evidence-grid dd {
        min-width: 0;
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-evaluations-run-evidence-grid dt {
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-evaluations-run-evidence-grid dd {
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-evaluations-run-evidence-grid dd > .platform-label {
        font-family: inherit;
      }

      .playground-evaluations-detail-overview-main .playground-evaluations-description-section,
      .playground-evaluations-detail-overview-main .playground-evaluations-dataset-guidance-section {
        min-width: 0;
      }

      .playground-evaluations-dataset-case-page-body {
        box-sizing: border-box;
        width: 100%;
        max-width: none;
        min-width: 0;
        min-height: 0;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        padding: 0 !important;
        overflow: hidden;
      }

      .playground-evaluations-dataset-case-page {
        box-sizing: border-box;
        width: 100%;
        max-width: none;
        min-width: 0;
        min-height: 0;
        flex: 1 1 0;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      .playground-evaluations-dataset-case-loading {
        min-height: 320px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-evaluations-dataset-case-identity {
        box-sizing: border-box;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-dataset-case-title-input {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
        outline: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        font: inherit;
        letter-spacing: 0;
      }

      .playground-evaluations-dataset-case-title-input {
        font-size: 20px;
        line-height: 1.3;
        font-weight: 400;
      }

      .playground-evaluations-dataset-case-description-input {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-evaluations-dataset-case-title-input::placeholder,
      .playground-evaluations-dataset-case-description-input::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }

      .playground-evaluations-dataset-case-workspace {
        min-height: 0;
        flex: 1 1 0;
      }

      .playground-evaluations-dataset-case-editor-shell {
        box-sizing: border-box;
        width: 100%;
        min-height: 0;
        flex: 1 1 0;
        border: 0;
        outline: 0;
        border-radius: 0;
        background: #000;
        color: rgba(255, 255, 255, 0.92);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.6;
        resize: none;
      }

      textarea.playground-evaluations-dataset-case-editor-shell {
        padding: 16px 18px;
      }

      .playground-evaluations-dataset-case-settings-content {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .playground-evaluations-dataset-case-settings-title {
        margin: 0;
        color: #fff;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 400;
      }

      .playground-evaluations-dataset-case-guidance .platform-instructions-editor__title {
        font-size: 14px;
        font-weight: 400;
      }

      .playground-evaluations-dataset-case-configuration {
        min-width: 0;
      }

      .playground-evaluations-dataset-case-configuration-row {
        min-width: 0;
        min-height: 38px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-evaluations-dataset-case-configuration-row + .playground-evaluations-dataset-case-configuration-row {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-evaluations-dataset-case-configuration-label {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.7);
        font-weight: 400;
      }

      .playground-evaluations-dataset-case-setting-tooltip {
        flex: 0 0 auto;
      }

      .playground-evaluations-dataset-case-role-selector {
        min-width: 160px;
      }

      .playground-evaluations-dataset-case-run-input {
        box-sizing: border-box;
        width: 64px;
        min-height: 28px;
        padding: 3px 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        outline: 0;
        background: transparent;
        color: #fff;
        font: inherit;
        text-align: center;
      }

      .playground-evaluations-dataset-case-sidebar-card.platform-ui-card {
        min-width: 0;
      }

      .playground-evaluations-dataset-case-delete-button.platform-button {
        width: 100%;
        margin-top: 12px;
      }

      @media (max-width: 760px) {
        .playground-evaluations-page .playground-guardrails-browser-body.is-detail-page {
          padding: 16px;
        }

        .playground-evaluations-page .playground-guardrails-browser-body.playground-evaluations-dataset-case-page-body {
          padding: 0 !important;
        }

        .playground-evaluations-dataset-case-identity {
          padding: 20px;
        }

        .playground-evaluations-run-evidence-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;
