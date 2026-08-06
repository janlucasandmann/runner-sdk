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

      .playground-files-shell.has-preview .playground-files-preview::after {
        content: "";
        position: absolute;
        z-index: 2;
        top: var(--playground-files-preview-nav-height, 56px);
        bottom: 0;
        left: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.075);
        pointer-events: none;
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
        z-index: 10050;
      }

      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-header,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .tb-attachment-preview-drawer-header-actions,
      .playground-content-shell:has(> .playground-content-body.is-files-page .playground-files-shell.has-preview > .playground-files-preview)
        .playground-files-preview
        .playground-files-preview-top-actions {
        opacity: 1;
        visibility: visible;
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

      .playground-files-image-selection-controls {
        display: inline-flex;
        align-items: center;
        gap: 10px;
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

      .playground-files-preview .tb-attachment-preview-drawer-action {
        width: 32px;
        height: 32px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.78);
        text-decoration: none;
        cursor: pointer;
        transition: background-color 180ms ease, color 180ms ease, opacity 180ms ease;
      }

      .playground-files-preview .tb-attachment-preview-drawer-action:hover,
      .playground-files-preview .tb-attachment-preview-drawer-action.is-active {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-preview .tb-attachment-preview-drawer-action:disabled {
        opacity: 0.44;
        cursor: default;
      }

      .playground-files-preview .tb-attachment-preview-drawer-action-icon {
        width: 16px;
        height: 16px;
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
