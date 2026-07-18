export const METRONOME_INSPECTOR_CSS_03_FRAGMENT = String.raw`        justify-content: space-between;
        gap: 10px;
        min-height: 30px;
      }

      .playground-metronome-database-field-main {
        min-width: 0;
        flex: 1 1 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-database-field-toggle,
      .playground-metronome-database-field-toggle-placeholder {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .playground-metronome-database-field-toggle {
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.38);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-database-field-toggle svg {
        transform: rotate(-90deg);
        transition: transform 160ms ease;
      }

      .playground-metronome-database-field-toggle.is-expanded {
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-metronome-database-field-toggle.is-expanded svg {
        transform: rotate(0deg);
      }

      .playground-metronome-database-field-key,
      .playground-metronome-database-field-separator,
      .playground-metronome-database-field-preview,
      .playground-metronome-database-value-static {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-metronome-database-field-key {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-database-field-separator {
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-metronome-database-field-group {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-metronome-database-field-type-pill {
        display: inline-flex;
        align-items: center;
        min-height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.64);
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .playground-metronome-database-field-preview {
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-metronome-database-field-value-shell {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
      }

      .playground-metronome-database-value-input,
      .playground-metronome-database-value-select {
        width: 100%;
        min-width: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        outline: none;
      }

      .playground-metronome-database-value-input {
        width: min(280px, 100%);
        height: auto;
        padding: 0;
      }

      .playground-metronome-database-value-select {
        height: auto;
        padding: 0 18px 0 0;
        appearance: none;
      }

      .playground-metronome-database-value-static {
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-metronome-database-field-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease;
      }

      .playground-metronome-database-field-row:hover .playground-metronome-database-field-actions,
      .playground-metronome-database-field-row:focus-within .playground-metronome-database-field-actions {
        opacity: 1;
        pointer-events: auto;
      }

      .playground-metronome-database-field-action {
        width: auto;
        height: auto;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-database-field-action:hover {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-metronome-database-field-action.is-danger:hover {
        color: rgba(255, 173, 173, 0.98);
      }

      .playground-metronome-database-empty-fields {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0 4px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-metronome-database-add-field {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #8db2ff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
        cursor: pointer;
      }

      .playground-metronome-database-json-editor-shell.playground-metronome-inline-code-editor .playground-metronome-code-editor-shell {
        min-height: 240px;
        height: 240px;
      }

      .playground-tasks-project-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99980;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.62);
        backdrop-filter: blur(16px);
      }

      .playground-tasks-project-modal {
        position: relative;
        width: min(520px, 100%);
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
        border-radius: 16px;
        background: #101010;
        color: rgba(255, 255, 255, 0.92);
        padding: 18px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56);
      }

      .playground-tasks-project-modal::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border, linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-tasks-project-modal-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 12px;
      }

      .playground-tasks-project-modal-name-row {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 0;
      }

      .playground-tasks-project-modal-icon-trigger {
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-project-modal-icon-trigger:hover,
      .playground-tasks-project-modal-icon-trigger.is-active {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-tasks-project-composer-modal {
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .playground-tasks-project-composer-modal::before,
      .playground-tasks-project-composer-modal::after {
        content: none !important;
        display: none !important;
      }

      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger:hover,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger.is-active,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger:focus-visible {
        background: transparent !important;
        box-shadow: none !important;
      }

      .playground-tasks-project-modal-name-input {
        flex: 1;
        min-width: 0;
        height: 36px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.98);
        font: inherit;
        font-size: 17px;
        line-height: 1.2;
        font-weight: 400;
        outline: none;
      }

      .playground-tasks-project-modal-name-input::placeholder {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-tasks-project-composer-modal .playground-tasks-project-modal-top {
        align-items: center;
      }

      .playground-tasks-project-modal-close,
      .playground-settings-icon-button {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-tasks-project-modal-close:hover,
      .playground-settings-icon-button:hover {
        color: rgba(255, 255, 255, 0.96);
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-database-browser-modal-title-row {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-database-browser-modal-title {
        color: rgba(255, 255, 255, 0.98);
        font-size: 17px;
        font-weight: 400;
        line-height: 1.2;
      }

      .playground-database-browser-modal-copy {
        margin: 0 0 16px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-database-browser-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 16px;
        align-items: start;
      }

      .playground-tasks-project-modal-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .playground-tasks-project-modal-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-environments-input,
      .playground-environments-select {
        width: 100%;
        min-height: 40px;
        border: 0;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 12px;
        outline: none;
        padding: 0 12px;
      }

      .playground-environments-input:focus,
      .playground-environments-select:focus {
        outline: none;
      }

      .playground-database-browser-modal-select-shell {
        position: relative;
      }

      .playground-database-browser-value-select {
        appearance: none;
        padding-right: 34px;
      }

      .playground-database-browser-select-chevron {
        position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.52);
        pointer-events: none;
      }

      .playground-database-browser-modal-value-row {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-database-browser-modal-value-input {
        width: 100%;
      }

      .playground-database-browser-modal-hint {
        min-height: 40px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-tasks-project-modal-error {
        margin-top: 12px;
        color: #ff9797;
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-tasks-project-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 18px;
      }

      .playground-tasks-project-modal-actions .playground-environments-action-button {
        height: 36px;
        min-height: 36px;
        padding: 0 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
      }

      .playground-tasks-project-modal-actions .playground-environments-action-button.is-primary:not(:disabled),
      .playground-tasks-project-modal-actions .playground-environments-action-button.is-primary:not(:disabled):hover {
        border: 0;
        background: #ffffff;
        color: #111111;
      }

      .playground-environments-action-button {
        min-height: 34px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        padding: 0 14px;
        cursor: pointer;
      }

      .playground-environments-action-button.is-primary {
        background: #fff;
        color: #050505;
      }

      .playground-metronome-function-test-section {
        padding: 14px 0 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-function-test-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-function-test-button {
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #050505;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
      }

      .playground-metronome-function-test-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .playground-metronome-function-test-button svg {
        flex: 0 0 auto;
      }

      .playground-metronome-function-test-button.is-loading svg {
        animation: playground-metronome-spin 850ms linear infinite;
      }

      .playground-metronome-function-test-result,
      .playground-metronome-function-test-error {
        margin-top: 12px;
        border-radius: 10px;
        padding: 11px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 11px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow: auto;
        max-height: 240px;
      }

      .playground-metronome-function-test-result {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.045);
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-metronome-function-test-error {
        border: 1px solid rgba(248, 113, 113, 0.22);
        background: rgba(248, 113, 113, 0.08);
        color: rgba(254, 202, 202, 0.95);
      }

      @keyframes playground-metronome-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .playground-metronome-code-section .playground-metronome-code-editor-shell {
        min-height: 260px;
        height: 260px;
      }

      .playground-metronome-thread-attachments.playground-tasks-attachments {
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-thread-attachments.is-borderless {
        border-bottom: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-toolbar .playground-tasks-detail-section-title {
        margin-bottom: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-environment-button {
        min-height: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: #66a6ff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-environment-button:hover:not(:disabled) {
        background: transparent;
        color: #66a6ff;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat {
        display: block;
        width: auto;
        height: auto;
        max-width: none;
        min-height: 0;
        overflow: visible;
        flex: 0 0 auto;
        border-radius: 10px;
        background: transparent;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat .tb-popup-dropzone {
        min-height: 168px;
        border-radius: 10px;
        background: transparent;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone {
        position: relative;
        padding: 0;
        align-items: stretch;
        justify-content: flex-start;
        gap: 0;
        overflow: hidden;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-empty-button {
        width: 100%;
        min-height: 168px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 20px 16px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-topline {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 20px;
        margin-bottom: 14px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled .playground-tasks-attachments-topline {
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-topline .tb-popup-dropzone-icon {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-browse {
        padding: 0;
        border: 0;
        background: transparent;
        color: #4da3ff;
        font-size: 12px;
        line-height: 1.35;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-browse:hover {
        color: #78bbff;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat .runner-attachments {
        padding-top: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled .runner-attachments {
        width: auto;
        max-width: 100%;
        display: inline-flex;
        justify-content: center;
        flex-wrap: wrap;
        padding: 0;
        margin: 0 auto;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-status {
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-workspace-selector-field {
        position: relative;
        z-index: 18;
      }

      .playground-metronome-agent-selector-field {
        position: relative;
        z-index: 18;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-workspace-selector-field,
      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-agent-selector-field,
      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-inspector-selector-field {
        flex: 0 0 auto;
        align-self: stretch;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 0 0 8px;
        border: 0;
        background: transparent;
        border-radius: 0;
        overflow: visible;
        min-height: 0;
        box-sizing: border-box;
      }

      .playground-metronome-workspace-selector-field .playground-metronome-field-label.playground-metronome-field-title,
      .playground-metronome-agent-selector-field .playground-metronome-field-label.playground-metronome-field-title,
      .playground-metronome-inspector-selector-field .playground-metronome-field-label.playground-metronome-field-title {
        flex: 0 0 64px;
        min-width: 64px;
        margin: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        min-height: 0;
        white-space: nowrap;
      }

      .playground-metronome-workspace-selector-field .tb-selector-anchor,
      .playground-metronome-agent-selector-field .tb-selector-anchor {
        position: relative;
        display: block;
        flex: 0 0 auto;
        width: 100%;
        height: auto;
        min-height: 0;
      }

      .playground-metronome-workspace-selector-trigger,
      .playground-metronome-agent-selector-trigger {
        flex: 0 0 auto;
        width: 100%;
        min-height: 24px;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0;
        cursor: pointer;
      }

      .playground-metronome-workspace-selector-trigger:hover,
      .playground-metronome-agent-selector-trigger:hover {
        color: #fff;
      }

      .playground-metronome-workspace-selector-trigger-label,
      .playground-metronome-agent-selector-trigger-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-workspace-popup-portal {
        position: fixed;
        z-index: 100000;
        display: block;
        pointer-events: auto;
      }

      .playground-metronome-agent-popup-portal {
        position: fixed;
        z-index: 100000;
        display: block;
        pointer-events: auto;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu {
        position: static;
        z-index: auto;
        min-width: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(10px);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-agent {
        width: 100%;
        max-height: inherit;
        display: flex;
        flex-direction: column;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-title {
        flex: 0 0 auto;
        padding: 12px 16px 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-panel-section-attach-header {
        flex: 0 0 auto;
        padding: 12px 16px 0;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav {
        display: flex;
        gap: 8px;
        padding: 2px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav-button {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 4px 12px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1rem;
        cursor: pointer;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav-button.active {
        background: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-body-agent {
        flex: 0 1 auto;
        min-height: 0;
        overflow-y: auto;
        margin-top: 12px;
        padding-top: 12px;
        padding-bottom: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        max-height: 180px;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 14px;
        line-height: 1.2;
        transition: background-color 160ms ease;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row:last-child {
        margin-bottom: 0;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row-select.selected {
        background: transparent;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row-agent.selected .tb-popup-icon {
        color: white;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-icon,
      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-check {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon {
        display: block;
        object-fit: contain;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon.is-openai,
      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon[title="xAI"] {
        filter: invert(1);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-check-slot {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-empty {
        padding: 0 16px 12px;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-empty-state {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-workspace-popup {
        box-sizing: border-box;
        width: 100%;
        min-width: 240px;
        max-width: 320px;
        max-height: inherit;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(10px);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-workspace-popup-title {
        flex: 0 0 auto;
        padding: 12px 16px 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-metronome-workspace-popup-tab-shell {
        flex: 0 0 auto;
        padding: 12px 16px 0;
      }

      .playground-metronome-workspace-popup-tabs {
        display: flex;
        gap: 8px;
        padding: 2px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-metronome-workspace-popup-tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 4px 12px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 500;
        line-height: 1rem;
        cursor: pointer;
      }

      .playground-metronome-workspace-popup-tab.is-active {
        background: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      .playground-metronome-workspace-popup-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-workspace-popup-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: #fff;
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 14px;
        line-height: 1.2;
        transition: background-color 160ms ease;
      }

      .playground-metronome-workspace-popup-row:hover,
      .playground-metronome-workspace-popup-row.is-selected {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-workspace-popup-row:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }

      .playground-metronome-workspace-popup-row-icon,
      .playground-metronome-workspace-popup-row-check {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-workspace-popup-row-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-workspace-popup-row-check-slot {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-workspace-popup-empty-wrap {
        padding: 0 16px 12px;
      }

      .playground-metronome-workspace-popup-empty {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-attachment-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(0, 0, 0, 0.36);
        display: flex;
        justify-content: flex-end;
      }

      .playground-metronome-attachment-modal {
        width: min(420px, 92vw);
        margin: 74px 22px 22px 0;
        align-self: flex-start;
        border-radius: 16px;
        background: rgba(24, 24, 25, 0.96);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
        padding: 18px;
        color: #fff;
      }

      .playground-metronome-attachment-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .playground-metronome-attachment-modal-title {
        font-size: 15px;
        font-weight: 600;
      }

      .playground-metronome-attachment-modal-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-flow {
        width: 100%;
        height: 100%;
        min-height: calc(100vh - 72px);
      }

      .playground-metronome-flow .react-flow__pane {
        cursor: default;
      }

      .playground-metronome-flow.is-pan-mode .react-flow__pane {
        cursor: grab;
      }

      .playground-metronome-flow.is-pan-mode .react-flow__pane.dragging {
        cursor: grabbing;
      }

      .playground-metronome-flow .react-flow__edge-path {
        stroke: rgba(255, 255, 255, 0.25);
        stroke-width: 1.4;
      }

      .playground-metronome-flow .react-flow__edge.selected .react-flow__edge-path {
        stroke: rgba(102, 166, 255, 0.78);
      }

      .playground-metronome-flow .react-flow__edge-text,
      .playground-metronome-flow .react-flow__edge-textbg {
        display: none;
      }

      .playground-metronome-flow-controls {
        position: absolute;
        z-index: 8;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        padding: 7px;
        border-radius: 999px;
        background: rgba(45, 45, 47, 0.82);
        backdrop-filter: blur(22px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
      }

      .playground-metronome-flow-control-button {
        background: transparent;
        border: 0;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.42);
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 150ms ease, background 150ms ease, opacity 150ms ease;
      }

      .playground-metronome-flow-control-button:hover:not(:disabled),
      .playground-metronome-flow-control-button:focus-visible:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
        outline: none;
      }

      .playground-metronome-flow-control-button.is-active {
        background: rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-flow-control-button:disabled {
        cursor: default;
        opacity: 0.34;
      }

      .playground-metronome-flow-controls-spacer {
        width: 0;
        flex: 0 0 0;
      }

      .playground-metronome-flow .react-flow__attribution {
        display: none;
      }

      .playground-metronome-flow .react-flow__edge.is-metronome-run-completed path {
        stroke: rgba(102, 166, 255, 0.88) !important;
        stroke-width: 2 !important;
      }

      .playground-metronome-flow .react-flow__edge.is-metronome-run-active path {
        stroke: #66a6ff !important;
        stroke-width: 2.25 !important;
      }

      .playground-metronome-flow .react-flow__edge.selected path,
      .playground-metronome-flow .react-flow__edge.selected .react-flow__edge-path {
        stroke: rgba(102, 166, 255, 0.78) !important;
        stroke-width: 2.25 !important;
      }
`;
