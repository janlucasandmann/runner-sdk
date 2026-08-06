export const FILES_CHAT_CSS = `
      .playground-files-chat-sidebar {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 0;
        padding: 0;
        overflow: hidden;
        justify-self: stretch;
        align-self: stretch;
        opacity: 0;
        transform: translateX(24px);
        pointer-events: none;
        transition: max-width 220ms ease, padding 220ms ease, opacity 220ms ease, transform 220ms ease;
      }

      .playground-files-shell.has-file-chat .playground-files-chat-sidebar {
        max-width: 100%;
        padding: 0;
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
        background: transparent;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-files-chat-shell {
        min-width: 0;
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        background: transparent;
      }

      .playground-files-chat-resize-handle {
        position: absolute;
        top: 0;
        left: -4px;
        bottom: 0;
        width: 8px;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: col-resize;
        z-index: 2;
        touch-action: none;
      }

      .playground-files-chat-resize-handle::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        height: 54px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        transform: translate(-50%, -50%);
        transition: background-color 160ms ease;
      }

      .playground-files-chat-resize-handle:hover::before {
        background: rgba(255, 255, 255, 0.24);
      }

      .playground-files-chat-header {
        min-width: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        height: 50px;
        padding: 0 18px;
        border-bottom: 0;
      }

      .playground-files-chat-header-copy {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-files-chat-header-copy .playground-files-entry-icon {
        flex: 0 0 auto;
      }

      .playground-files-chat-header-text {
        min-width: 0;
      }

      .playground-files-chat-title {
        color: rgba(255, 255, 255, 0.96);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-chat-subtitle {
        margin-top: 2px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-chat-close {
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
        color: rgba(255, 255, 255, 0.76);
        cursor: pointer;
        transition: background-color 180ms ease, color 180ms ease;
      }

      .playground-files-chat-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-chat-close-icon {
        width: 16px;
        height: 16px;
      }

      .playground-files-chat-body {
        min-width: 0;
        min-height: 0;
        flex: 1;
      }

      .playground-files-chat-body .runner-host {
        height: 100%;
      }

      .playground-files-chat-runner .tb-log-scroll.is-custom-empty-state {
        padding: 24px 18px 180px;
      }

      .playground-files-chat-empty-state {
        width: min(100%, 328px);
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .playground-files-chat-empty-info {
        flex: 0 0 auto;
        margin-top: 0;
        overflow: visible;
      }

      .playground-files-chat-empty-actions {
        padding-top: 0;
      }

      .playground-files-preview-shell {
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 18px;
      }

      .playground-files-presentation-preview-shell {
        width: 100%;
        min-width: 0;
        min-height: 0;
        padding: 0;
        background: transparent;
      }

      .playground-files-presentation-preview-header {
        flex-shrink: 0;
        min-height: var(--playground-files-preview-nav-height);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-files-presentation-preview-title-row {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-files-presentation-preview-title-row .playground-files-entry-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
      }

      .playground-files-presentation-preview-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      .playground-files-presentation-preview-body {
        min-height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 30px 24px var(--playground-files-preview-composer-reserved-bottom);
        text-align: center;
      }

      .playground-files-presentation-preview-icon {
        width: 58px;
        height: 58px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-files-presentation-preview-icon svg {
        width: 26px;
        height: 26px;
      }

      .playground-files-presentation-preview-name {
        max-width: min(420px, 100%);
        color: rgba(255, 255, 255, 0.96);
        font-size: 14px;
        font-weight: 600;
        line-height: 1.35;
        word-break: break-word;
      }

      .playground-files-presentation-preview-copy {
        max-width: min(460px, 100%);
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.55;
      }

      .playground-files-presentation-preview-actions {
        margin-top: 6px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-files-presentation-preview-actions .playground-files-preview-button {
        width: auto;
        min-width: 120px;
      }
`;
