export const GUARDRAILS_PAGE_DETAIL_CSS = `      .playground-guardrails-editor {
        min-width: 0;
        min-height: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-sizing: border-box;
      }

      .playground-guardrails-list-panel {
        overflow: hidden;
        padding: 0;
      }

      .playground-guardrails-table-shell {
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: auto;
      }

      .playground-guardrails-table {
        width: 100%;
        min-width: 720px;
        display: flex;
        flex-direction: column;
      }

      .playground-guardrails-table-header,
      .playground-guardrails-table-row {
        display: grid;
        grid-template-columns: minmax(220px, 1.35fr) 86px minmax(150px, 0.85fr) 112px 32px;
        align-items: center;
        gap: 12px;
      }

      .playground-guardrails-table-header {
        min-height: 34px;
        padding: 0 10px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        font-weight: 500;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-guardrails-table-row {
        min-height: 54px;
        padding: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .playground-guardrails-overview-table-section .playground-project-overview-threads-table-header,
      .playground-guardrails-overview-table-section .playground-project-overview-threads-table-row {
        grid-template-columns: 34px minmax(200px, 1.25fr) minmax(90px, 0.42fr) minmax(150px, 0.82fr) minmax(98px, 0.46fr) 28px;
        gap: 12px;
      }

      .playground-guardrails-table-row:hover,
      .playground-guardrails-table-row.is-selected {
        background: transparent;
      }

      .playground-guardrails-set-cell {
        min-width: 0;
        display: inline-flex;
        align-items: center;
      }

      .playground-guardrails-set-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-guardrails-set-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 13px;
        line-height: 1.25;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-guardrails-table-muted {
        min-width: 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-guardrails-creator-cell {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-guardrails-creator-avatar {
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
        line-height: 1;
        font-weight: 500;
      }

      .playground-guardrails-creator-avatar img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-guardrails-creator-avatar.is-system {
        border-radius: 0;
        background: transparent;
      }

      .playground-guardrails-creator-avatar.is-system img {
        width: 14px;
        height: 14px;
        object-fit: contain;
      }

      .playground-guardrails-creator-label {
        min-width: 0;
        color: rgba(255, 255, 255, 0.84);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-guardrails-kind-pill {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
        white-space: nowrap;
      }

      .playground-guardrails-row-action-placeholder {
        width: 28px;
        height: 28px;
        display: inline-flex;
      }

      .playground-guardrails-row-action,
      .playground-guardrails-prompt-delete {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.42);
        padding: 0;
        cursor: pointer;
        transition: color 160ms ease, background 160ms ease;
      }

      .playground-guardrails-row-action:hover,
      .playground-guardrails-row-action.is-active,
      .playground-guardrails-prompt-delete:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-guardrails-editor {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 0;
        border-left: 0;
        overflow: visible;
      }

      .playground-guardrails-detail {
        width: 100%;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .playground-guardrails-detail::-webkit-scrollbar {
        display: none;
      }

      .playground-guardrails-detail-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-guardrails-readonly-pill {
        height: 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        white-space: nowrap;
      }

      .playground-guardrails-detail-title-row {
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-guardrails-detail-title {
        min-width: 0;
        flex: 1 1 auto;
      }

      .playground-guardrails-title-input {
        width: 100%;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        letter-spacing: inherit;
        outline: none;
        box-shadow: none;
      }

      .playground-guardrails-title-input:disabled,
      .playground-guardrails-prompt-title-input:read-only,
      .playground-guardrails-prompt-body-input:read-only,
      .playground-guardrails-description-input:read-only {
        opacity: 1;
        cursor: default;
      }

      .playground-guardrails-prompts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-guardrails-prompts-title {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
      }

      .playground-guardrails-prompt-title-input {
        width: 100%;
        min-width: 0;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 12px;
        line-height: 1.45;
        outline: none;
        box-sizing: border-box;
      }

      .playground-guardrails-prompt-title-input {
        height: 34px;
        padding: 0 11px;
      }

      .playground-guardrails-prompt-title-input:focus {
        border-color: rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.07);
      }

      .playground-guardrails-inline-action {
        height: 28px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-guardrails-inline-action:hover {
        color: #fff;
      }

      .playground-guardrails-description-section.playground-agents-detail-instructions-section {
        margin-top: 0;
        margin-bottom: 0;
      }

      .playground-guardrails-description-section .playground-tasks-detail-section-header {
        background: #000;
      }

      .playground-guardrails-description-section .playground-tasks-detail-description-input {
        min-height: 72px;
      }

      .playground-guardrails-description-section .playground-tasks-detail-format-actions {
        flex-wrap: nowrap;
      }

      .playground-guardrails-prompts-list {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow: visible;
      }

      .playground-guardrails-prompts-list::-webkit-scrollbar,
      .playground-guardrails-table-shell::-webkit-scrollbar {
        display: none;
      }

      .playground-guardrails-prompt-row.playground-tasks-backlog-item {
        min-height: 70px;
        cursor: default;
      }

      .playground-guardrails-prompt-row .playground-tasks-backlog-item-content {
        width: 100%;
        align-items: flex-start;
      }

      .playground-guardrails-prompt-row .playground-tasks-backlog-leading {
        align-items: flex-start;
      }

      .playground-guardrails-prompt-row .playground-tasks-backlog-main {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }

      .playground-guardrails-prompt-row .playground-tasks-backlog-meta {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        min-height: 28px;
      }

      .playground-guardrails-prompt-row .playground-guardrails-prompt-title-input,
      .playground-guardrails-prompt-body-input {
        width: 100%;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        font-family: inherit;
        outline: none;
        box-sizing: border-box;
      }

      .playground-guardrails-prompt-row .playground-guardrails-prompt-title-input {
        height: auto;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-guardrails-prompt-body-input {
        min-height: 38px;
        resize: none;
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-guardrails-prompt-row .playground-guardrails-prompt-title-input:focus,
      .playground-guardrails-prompt-body-input:focus {
        border: 0;
        background: transparent;
      }

      .playground-guardrails-prompt-title-input {
        flex: 1 1 auto;
      }

      .playground-guardrails-empty,
      .playground-guardrails-editor-empty,
      .playground-guardrails-prompt-empty {
        height: 100%;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: rgba(255, 255, 255, 0.46);
        text-align: center;
      }

      .playground-guardrails-prompt-empty {
        min-height: 88px;
        height: auto;
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        font-size: 12px;
      }

      .playground-guardrails-empty-icon {
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-guardrails-empty-title {
        color: rgba(255, 255, 255, 0.76);
        font-size: 13px;
        font-weight: 500;
      }

      .playground-guardrails-empty-button {
        margin-top: 2px;
      }

`;
