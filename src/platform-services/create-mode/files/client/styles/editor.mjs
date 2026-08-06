export const FILES_EDITOR_CSS = `
      .playground-code-preview-drawer {
        min-height: 0;
        flex: 1;
      }

      .playground-code-preview-header .playground-files-entry-icon {
        width: 16px;
        height: 16px;
      }

      .playground-code-preview-path {
        min-width: 0;
        margin-top: 2px;
        font-size: 11px;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-code-preview-body {
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0;
        background: #000;
      }

      .playground-code-preview-toolbar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: #000;
      }

      .playground-code-preview-toolbar-group {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-code-preview-toolbar-group.is-actions {
        flex-shrink: 0;
        justify-content: flex-end;
      }

      .playground-code-preview-badge {
        display: inline-flex;
        align-items: center;
        height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.74);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-code-preview-status {
        min-width: 0;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.52);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-code-preview-status.is-warning {
        color: #f1c87a;
      }

      .playground-code-preview-status.is-success {
        color: #85d6a5;
      }

      .playground-code-preview-status.is-error {
        color: #ff9c9c;
      }

      .playground-code-preview-toolbar-button {
        height: 28px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-code-preview-toolbar-button:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-code-preview-toolbar-button.is-active {
        background: rgba(47, 129, 247, 0.14);
        border-color: rgba(47, 129, 247, 0.34);
        color: #9fcbff;
      }

      .playground-code-preview-toolbar-button.is-primary {
        background: rgba(47, 129, 247, 0.18);
        border-color: rgba(47, 129, 247, 0.42);
        color: #ddecff;
      }

      .playground-code-preview-toolbar-button:disabled {
        opacity: 0.44;
        cursor: default;
      }

      .playground-code-preview-toolbar-keyhint {
        padding-left: 4px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 10px;
        font-weight: 500;
      }

      .playground-code-preview-header .tb-attachment-preview-drawer-action:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .playground-code-preview-editor-shell {
        min-height: 0;
        flex: 1;
        display: flex;
        background: #000;
      }

      .playground-code-preview-editor-shell .monaco-editor,
      .playground-code-preview-editor-shell .monaco-editor-background,
      .playground-code-preview-editor-shell .monaco-scrollable-element,
      .playground-code-preview-editor-shell .margin,
      .playground-code-preview-editor-shell .overflow-guard {
        background: #000 !important;
      }

      .playground-code-preview-editor-shell .monaco-editor .cursor {
        border-color: #9cc9ff !important;
      }

      .playground-code-preview-state {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
        text-align: center;
      }

      .playground-code-preview-state.is-error {
        color: #ff9c9c;
      }

      .playground-code-preview-textarea {
        flex: 1;
        width: 100%;
        height: 100%;
        padding: 14px 16px;
        border: 0;
        outline: 0;
        resize: none;
        background: #0d1117;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.6;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }

      .playground-files-preview-top {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 0;
      }

      .playground-files-preview-top-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
      }

      .playground-files-preview-empty {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 12px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        text-align: center;
      }

      .playground-files-preview-hero {
        width: 100%;
        aspect-ratio: 1 / 1;
        margin-bottom: 16px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-files-preview-hero.is-folder {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-files-preview-hero.is-frame {
        background: rgba(255, 255, 255, 0.03);
      }

      .playground-files-preview-hero.is-code {
        align-items: stretch;
        justify-content: stretch;
        background: rgba(0, 0, 0, 0.42);
      }

      .playground-files-preview-hero-icon {
        width: 42px;
        height: 42px;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-files-preview-folder-icon {
        width: 78px;
        height: 78px;
      }

      .playground-files-preview-frame {
        width: 300%;
        height: 300%;
        border: 0;
        transform: scale(0.3334);
        transform-origin: top left;
        pointer-events: none;
        background: #fff;
      }

      .playground-files-preview-loader {
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.56);
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-files-preview-code {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 14px;
        overflow: auto;
        font-size: 8px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.78);
        background: transparent;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .playground-files-preview-empty-state {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.42);
        text-align: center;
        padding: 18px;
      }

      .playground-files-preview-name {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
        word-break: break-word;
        text-align: center;
      }

      .playground-files-preview-meta {
        margin-top: 4px;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.44);
        word-break: break-word;
        text-align: center;
      }

      .playground-files-preview-error {
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.5;
        color: #ff9c9c;
      }

      .playground-files-preview-info {
        flex: 1;
        min-height: 0;
        margin-top: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow: auto;
      }

      .playground-files-preview-info.is-list {
        gap: 8px;
      }

      .playground-files-preview-info-title {
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-files-preview-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-files-preview-info-row span:first-child {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-files-preview-selection-badge {
        width: 80px;
        height: 80px;
        margin-bottom: 16px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-files-preview-selection-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-files-preview-selection-row span {
        min-width: 0;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-preview-selection-more {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-files-preview-actions {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-top: 24px;
      }

      .playground-files-preview-action-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-files-preview-button {
        min-height: 38px;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
      }

      .playground-files-preview-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-preview-button.is-primary {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-preview-button.is-danger {
        color: #ffb0b0;
      }

      .playground-files-chat-empty-actions .playground-files-preview-button {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-files-preview-error {
        margin-top: 12px;
        font-size: 12px;
        line-height: 1.5;
        color: #ff9c9c;
        text-align: center;
      }

      .playground-files-rename-input {
        width: 100%;
        min-width: 0;
        height: 28px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        font-weight: 500;
        outline: none;
      }

      .playground-files-rename-control {
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
      }

      .playground-files-rename-control.is-grid {
        justify-content: center;
      }

      .playground-files-rename-control .playground-files-rename-input {
        flex: 1 1 auto;
      }

      .playground-files-rename-input.is-grid {
        text-align: center;
      }

      .playground-files-rename-extension {
        flex: 0 0 auto;
        margin-left: 6px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        user-select: none;
      }
`;
