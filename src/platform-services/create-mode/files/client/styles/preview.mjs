export const FILES_PREVIEW_CSS = `
      .playground-files-preview {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        max-width: 0;
        padding: 0;
        overflow: hidden;
        opacity: 0;
        transform: translateX(24px);
        pointer-events: none;
        transition: max-width 220ms ease, padding 220ms ease, opacity 220ms ease, transform 220ms ease;
      }

      .playground-files-shell.has-preview .playground-files-preview {
        max-width: 100%;
        padding: 0;
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
        background: transparent;
        border-left: 0;
      }

      .playground-files-shell.is-preview-maximized .playground-files-preview {
        transform: translateX(0);
      }

      .playground-files-shell.is-preview-maximized .tb-attachment-preview-drawer-resize-handle {
        display: none;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview) {
        --playground-content-nav-height: 56px;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        > .playground-content-nav {
        pointer-events: none;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        > .playground-content-body.is-files-page {
        overflow: visible;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-shell.has-preview {
        overflow: visible;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-shell.has-preview
        > .playground-files-preview {
        height: calc(100% + var(--playground-content-nav-height, 56px));
        margin-top: calc(-1 * var(--playground-content-nav-height, 56px));
        align-self: stretch;
        position: relative;
        z-index: 120;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-runner-document-preview-host,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-runner-document-preview-host-inline,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-inline {
        height: 100%;
      }

      .playground-files-image-thread-shell {
        --playground-files-preview-composer-bottom: 8px;
        --playground-files-preview-composer-reserved-bottom: 136px;
        min-width: 0;
        min-height: 0;
        flex: 1;
        display: flex;
        position: relative;
        isolation: isolate;
      }

      .playground-files-image-thread-shell > .tb-runner-document-preview-host,
      .playground-files-image-thread-shell > .tb-runner-document-preview-host-inline,
      .playground-files-image-thread-shell > .tb-runner-document-preview-host > .tb-attachment-preview-drawer-inline,
      .playground-files-image-thread-shell > .tb-runner-document-preview-host-inline > .tb-attachment-preview-drawer-inline {
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
      }

      .playground-files-image-thread-shell .tb-attachment-preview-image-surface {
        padding: 20px 20px var(--playground-files-preview-composer-reserved-bottom);
        overflow: hidden;
      }

      .playground-files-image-thread-shell .tb-attachment-preview-drawer-body,
      .playground-files-image-thread-shell .playground-code-preview-body {
        scroll-padding-bottom: var(--playground-files-preview-composer-reserved-bottom);
      }

      .playground-files-image-thread-shell .tb-attachment-preview-drawer-body::after,
      .playground-files-image-thread-shell .playground-code-preview-body::after {
        content: "";
        display: block;
        flex: 0 0 var(--playground-files-preview-composer-reserved-bottom);
        width: 100%;
        height: var(--playground-files-preview-composer-reserved-bottom);
        pointer-events: none;
      }

      .playground-files-image-thread-shell .playground-code-preview-body {
        scroll-padding-bottom: calc(var(--playground-files-preview-composer-reserved-bottom) - 12px);
      }

      .playground-files-image-thread-shell .playground-code-preview-body::after {
        flex-basis: calc(var(--playground-files-preview-composer-reserved-bottom) - 12px);
        height: calc(var(--playground-files-preview-composer-reserved-bottom) - 12px);
      }

      .playground-files-image-thread-shell > .tb-runner-chat.playground-files-image-thread-composer {
        position: absolute;
        left: 50%;
        bottom: var(--playground-files-preview-composer-bottom);
        z-index: 12;
        width: min(760px, calc(100% - 32px));
        height: auto;
        min-height: 0;
        flex: none;
        display: block;
        grid-template-rows: none;
        max-width: none;
        transform: translateX(-50%);
        overflow: visible;
        background: transparent;
        pointer-events: auto;
      }

      .playground-files-shell.is-preview-maximized .playground-files-image-thread-shell > .tb-runner-chat.playground-files-image-thread-composer {
        width: min(860px, calc(100% - 56px));
      }

      .playground-files-image-thread-composer .tb-input-width {
        width: 100%;
        max-width: none;
      }

      .playground-files-image-thread-composer > :not(.tb-input-shell) {
        display: none !important;
      }

      .playground-files-image-thread-composer .tb-input-shell {
        position: relative;
        left: auto;
        right: auto;
        bottom: auto;
        width: 100%;
        min-height: 0;
        padding: 0;
        margin: 0;
        display: block;
      }

      .playground-files-image-thread-composer .task-input-box {
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.95);
        --tb-task-input-overlay: transparent;
      }

      .playground-files-image-thread-composer .sidebar-textarea {
        min-height: 46px;
        padding-top: 14px;
      }

      .playground-files-image-thread-loading {
        position: absolute;
        left: 50%;
        bottom: 84px;
        z-index: 13;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(15, 15, 15, 0.86);
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        line-height: 1;
        transform: translateX(-50%);
        pointer-events: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .playground-files-image-thread-loading .is-spinning {
        width: 13px;
        height: 13px;
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-files-image-thread-submit .is-spinning {
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-files-preview-select-button,
      .playground-files-image-selection-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        height: 30px;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .playground-files-preview-select-button::before,
      .playground-files-image-selection-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-control-button-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-files-image-selection-button.is-plain::before {
        content: none;
      }

      .playground-files-preview-select-button > *,
      .playground-files-image-selection-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-files-image-selection-controls {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-files-image-selection-button.is-icon {
        width: 34px;
        padding: 0;
      }

      .playground-files-image-selection-button:disabled {
        cursor: default;
        color: rgba(255, 255, 255, 0.34);
      }

      .playground-files-image-mask-overlay,
      .playground-files-image-crop-overlay {
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: auto;
        touch-action: none;
      }

      .playground-files-image-mask-overlay {
        cursor: pointer;
      }

      .playground-files-image-crop-overlay {
        cursor: crosshair;
      }

      .playground-files-image-mask-canvas,
      .playground-files-image-crop-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-header,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-header-actions,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-action {
        pointer-events: auto;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-body,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell .monaco-editor,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell .monaco-editor-background,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell .monaco-scrollable-element,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell .margin,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-code-preview-editor-shell .overflow-guard {
        background: transparent !important;
      }

      .playground-files-shell.is-resizing .playground-files-preview,
      .playground-files-shell.is-resizing .playground-files-chat-sidebar {
        transition: none;
      }
`;
