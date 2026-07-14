export const METRONOME_RUN_TRACE_CSS = `
      .playground-metronome-run-thread-surface {
        background: transparent;
      }

      .tb-runner-chat.playground-metronome-run-thread-surface .tb-log-scroll.is-custom-empty-state {
        flex-direction: row !important;
        justify-content: center !important;
        align-items: flex-start !important;
        padding: 12px 20px 180px !important;
      }

      .tb-runner-chat.playground-metronome-run-thread-surface .tb-content-width.is-custom-empty-state {
        width: min(100%, 56rem) !important;
        max-width: 56rem !important;
        display: block !important;
        align-items: initial !important;
        justify-content: initial !important;
      }

      .playground-metronome-run-thread-list {
        width: 100%;
        min-height: auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-run-thread-turn {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-run-thread-user-shell {
        align-self: flex-end;
        max-width: min(760px, 72%);
      }

      .playground-metronome-run-thread-work-header {
        margin-top: 34px;
      }

      .playground-metronome-run-thread-work {
        margin-top: 8px;
      }

      .playground-metronome-run-thread-work .agent-steps-container {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .playground-metronome-run-thread-log-step {
        width: 100%;
        max-width: 980px;
      }

      .playground-metronome-run-thread-summary {
        margin-top: 36px;
      }

      .playground-metronome-run-thread-working {
        margin-top: 22px;
      }

      .playground-metronome-run-thread-dot-loader {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        color: rgba(255, 255, 255, 0.82);
        transform: translateY(-1px);
      }

      .playground-metronome-run-thread-dot-loader > span {
        width: 3px;
        height: 3px;
        border-radius: 999px;
        background: currentColor;
        animation: playground-metronome-run-dot-pulse 1s ease-in-out infinite;
      }

      .playground-metronome-run-thread-dot-loader > span:nth-child(2) { animation-delay: 0.05s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(3) { animation-delay: 0.1s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(4) { animation-delay: 0.15s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(5) { animation-delay: 0.2s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(6) { animation-delay: 0.25s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(7) { animation-delay: 0.3s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(8) { animation-delay: 0.35s; }
      .playground-metronome-run-thread-dot-loader > span:nth-child(9) { animation-delay: 0.4s; }

      @keyframes playground-metronome-run-dot-pulse {
        0%, 100% { opacity: 0.22; }
        35% { opacity: 1; }
        70% { opacity: 0.45; }
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-output-markdown {
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 8px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-content .playground-metronome-run-output-markdown,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-content .playground-metronome-run-json-document {
        margin-top: 0;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-document {
        --tb-task-input-overlay: transparent;
        --tb-task-input-outline: transparent;
        --tb-task-input-border: var(--tb-runner-input-border);
        width: 100%;
        max-width: 980px;
        margin-top: 8px;
        position: relative;
        z-index: 0;
        border-radius: 10px;
        overflow: hidden;
        background: transparent;
        box-shadow: 0 0 0 1px var(--tb-task-input-outline);
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-document::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: 10px;
        padding: 1px;
        background: var(--tb-task-input-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-document > * {
        position: relative;
        z-index: 1;
      }

      .playground-metronome-run-thread-summary .playground-metronome-run-json-document {
        margin-top: 0;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 54px;
        padding: 0 14px 0 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-title {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.4;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-title span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-mode-switch {
        position: static;
        margin-top: 0;
        min-width: 136px;
        flex: 0 0 auto;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-mode-switch .content-mode-button {
        white-space: nowrap;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-body {
        padding: 14px 16px 16px;
        max-height: 500px;
        overflow: auto;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-body .playground-database-browser-field-row {
        min-height: 28px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-raw {
        margin: 0;
        overflow: auto;
        max-height: 520px;
        color: rgba(255, 255, 255, 0.86);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell {
        min-height: min(360px, calc(500px - 30px));
        height: min(500px, calc(500px - 30px));
        border-radius: 0;
        overflow: hidden;
        background: transparent;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell .monaco-editor,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell .monaco-editor-background,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell .monaco-scrollable-element,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell .margin,
      .playground-metronome-run-thread-surface .playground-metronome-run-json-editor-shell.playground-code-preview-editor-shell .overflow-guard {
        background: transparent !important;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-meta-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-title-line .playground-metronome-run-thread-meta-row {
        flex: 0 1 auto;
        min-width: 0;
        margin-top: 0;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-title-line {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: nowrap;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-title-text {
        flex: 1 1 auto;
        min-width: 64px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-row {
        display: inline-flex;
        align-items: center;
        flex: 0 1 auto;
        min-width: 0;
        gap: 5px;
        color: #fff;
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-agent,
      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-computer {
        min-width: 0;
        display: inline-flex;
        align-items: center;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-agent {
        gap: 4px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-agent-name,
      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-computer {
        color: #fff;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-step-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        border-radius: 999px;
        object-fit: cover;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.74);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        font-weight: 600;
        letter-spacing: 0;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-runtime-separator {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.28);
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-thread-link {
        border: 0;
        padding: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 10px;
        line-height: 1.2;
        cursor: pointer;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-trace-field {
        margin-top: 10px;
      }

      .playground-metronome-run-thread-surface .playground-metronome-run-trace-field-label {
        margin-bottom: 5px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
`;
