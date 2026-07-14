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
`;

