export const EVALUATIONS_STYLE_DIALOGS = String.raw`
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

