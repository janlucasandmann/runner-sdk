export const FILES_FOUNDATION_CSS = `
      .playground-files-page {
        --playground-files-nav-top-offset: 7px;
        --playground-files-nav-row-height: 32px;
        --playground-files-preview-nav-height: 56px;
        height: 100%;
        min-height: 0;
        padding: 0;
        background: transparent;
      }

      .playground-files-shell {
        --playground-files-preview-width: 0px;
        --playground-files-chat-width: 0px;
        height: 100%;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 0 0;
        gap: 0;
        align-items: stretch;
        position: relative;
        background: transparent;
        transition: grid-template-columns 220ms ease;
      }

      .playground-files-shell.has-preview {
        grid-template-columns: minmax(0, 1fr) var(--playground-files-preview-width, 0px) 0;
      }

      .playground-files-shell.has-preview.has-file-chat {
        grid-template-columns: minmax(0, 1fr) var(--playground-files-preview-width, 0px) var(--playground-files-chat-width, 0px);
      }

      .playground-files-shell.has-preview.is-preview-maximized,
      .playground-files-shell.has-preview.has-file-chat.is-preview-maximized,
      .playground-files-shell.is-browser-minimized.has-preview.is-preview-maximized,
      .playground-files-shell.is-browser-minimized.has-preview.has-file-chat.is-preview-maximized {
        grid-template-columns: 0 minmax(0, 1fr) 0;
      }

      .playground-files-shell.is-preview-maximized .playground-files-browser,
      .playground-files-shell.is-preview-maximized .playground-files-chat-sidebar {
        opacity: 0;
        pointer-events: none;
      }

      .playground-files-shell.is-browser-minimized {
        grid-template-columns: 0 0 0;
      }

      .playground-files-shell.is-browser-minimized.has-preview {
        grid-template-columns: 0 minmax(0, 1fr) 0;
      }

      .playground-files-shell.is-browser-minimized.has-preview.has-file-chat {
        grid-template-columns: 0 minmax(0, 1fr) var(--playground-files-chat-width, 0px);
      }

      .playground-files-shell.is-resizing {
        transition: none;
      }

      .playground-files-environments {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 10px;
        overflow: hidden;
        background: var(--playground-files-panel-bg);
      }

      .playground-files-sidebar-top {
        position: relative;
        flex-shrink: 0;
        padding: 36px 8px 6px;
      }

      .playground-files-sidebar-action {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 2px;
        padding: 8px 10px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-sidebar-action:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-files-sidebar-action:disabled {
        opacity: 0.48;
        cursor: default;
      }

      .playground-files-sidebar-action-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .playground-files-sidebar-action.is-active {
        background: rgba(255, 255, 255, 0.12);
      }

      .playground-files-sidebar-error {
        margin: 6px 10px 0;
        font-size: 11px;
        line-height: 1.45;
        color: #ff9c9c;
      }

      .playground-files-search-popover {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 320px;
        max-height: min(420px, calc(100vh - 140px));
        display: flex;
        flex-direction: column;
        z-index: 30;
        overflow: hidden;
      }

      .playground-files-search-backdrop {
        position: fixed;
        inset: 0;
        border: 0;
        background: transparent;
        padding: 0;
        margin: 0;
        z-index: 20;
        cursor: default;
      }

      .playground-files-search-popover-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-files-search-popover-title {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-files-search-popover-close {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.48);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-files-search-popover-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-search-popover-body {
        min-height: 0;
        flex: 1;
        padding: 14px;
        overflow: auto;
      }

      .playground-files-search-field {
        position: relative;
        margin-bottom: 12px;
      }

      .playground-files-search-field-icon {
        position: absolute;
        top: 50%;
        left: 12px;
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.4);
        transform: translateY(-50%);
        pointer-events: none;
      }

      .playground-files-search-field-input {
        width: 100%;
        height: 38px;
        padding: 0 14px 0 36px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.94);
        outline: none;
        font-size: 12px;
      }

      .playground-files-search-field-input::placeholder {
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-files-search-results {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-files-search-empty {
        padding: 18px 8px 8px;
        text-align: center;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-files-search-result {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        text-align: left;
        cursor: pointer;
        transition: background-color 160ms ease;
      }

      .playground-files-search-result:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-files-search-result-copy {
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-files-search-result-name {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-search-result-path {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.42);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-sidebar-section-title {
        padding: 10px 10px 8px;
        font-size: 10px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.42);
        letter-spacing: 0.02em;
      }

      .playground-files-environment-list {
        min-height: 0;
        flex: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0 8px;
      }

      .playground-files-environment-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease;
      }

      .playground-files-environment-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-files-environment-item.is-active {
        background: rgba(255, 255, 255, 0.12);
      }

      .playground-files-environment-main {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-files-environment-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        display: block;
        object-fit: contain;
      }

      .playground-files-environment-name {
        min-width: 0;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-environment-empty {
        padding: 12px 12px;
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-files-storage {
        flex-shrink: 0;
        margin-top: 8px;
        padding: 10px 12px 12px;
      }

      .playground-files-storage-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-files-storage-bar {
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }

      .playground-files-storage-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.72);
      }

      .playground-files-storage-meta {
        margin-top: 8px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.42);
        text-align: right;
      }

      .playground-files-browser {
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        margin: 0 5px 5px 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #000;
        box-sizing: border-box;
      }

      .playground-files-shell.is-browser-minimized .playground-files-browser {
        visibility: hidden;
        pointer-events: none;
      }

      .playground-files-browser-minimized-toggle {
        position: absolute;
        top: var(--playground-files-nav-top-offset);
        left: 14px;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: rgba(18, 18, 18, 0.9);
        color: rgba(255, 255, 255, 0.8);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
        opacity: 0;
        transform: translateX(-10px);
        pointer-events: none;
        transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, color 180ms ease;
        z-index: 7;
      }

      .playground-files-browser-minimized-toggle-icon {
        width: 14px;
        height: 14px;
      }

      .playground-files-shell.is-browser-minimized .playground-files-browser-minimized-toggle {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      .playground-files-shell.is-browser-minimized .playground-files-preview .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-header-copy {
        padding-left: 36px;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-header {
        min-height: var(--playground-files-preview-nav-height);
        padding: 0 10px;
        background: transparent;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-header-icon-asset,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-header-icon,
      .playground-files-page .playground-code-preview-header-icon,
      .playground-files-page .playground-code-preview-path {
        display: none;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-header-copy {
        gap: 0;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-name {
        font-size: 12px;
        font-weight: 400;
      }

      .playground-files-preview-breadcrumb {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-files-preview-breadcrumb-item {
        min-width: 0;
        max-width: min(360px, 42vw);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: 0;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        font: inherit;
        font-size: 12px;
      }

      button.playground-files-preview-breadcrumb-item {
        cursor: pointer;
        transition: color 160ms ease;
      }

      button.playground-files-preview-breadcrumb-item:hover {
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-files-preview-breadcrumb-item.is-current {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-files-preview-breadcrumb-separator {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.34);
        font-size: 14px;
        line-height: 1;
      }

      .playground-files-preview-maximize-button {
        width: 26px;
        height: 26px;
      }

      .playground-files-preview-maximize-button .tb-attachment-preview-drawer-action-icon {
        width: 13px;
        height: 13px;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-inline {
        border-left: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-drawer-body,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-pdf,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-markdown-shell,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-text,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-docx-shell {
        background: transparent;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-docx-shell,
      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-docx-stage .tb-attachment-docx-wrapper {
        background: transparent;
      }

      .playground-files-page .tb-runner-document-preview-host-inline .tb-attachment-preview-docx-stage .tb-attachment-docx {
        background: #fff;
        color: #111;
      }

      .playground-files-browser-minimized-toggle:hover {
        background: rgba(28, 28, 28, 0.96);
        color: #fff;
      }

      .playground-files-page .playground-files-browser-header {
        width: min(100%, calc(var(--playground-thread-content-max-width) + 48px));
        max-width: calc(var(--playground-thread-content-max-width) + 48px);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        margin: 0 auto;
        padding: 24px 24px 0;
        position: relative;
        z-index: 320;
        overflow: visible;
        box-sizing: border-box;
      }

      .playground-files-library-header {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-files-library-title-row,
      .playground-files-library-nav-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .playground-files-library-nav-row {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center;
        position: relative;
        min-height: 30px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-files-library-path-row {
        width: auto;
        min-width: 0;
        min-height: 30px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        padding: 0;
        border-bottom: 0;
        box-sizing: border-box;
      }

      .playground-files-library-path-row .playground-files-breadcrumbs {
        justify-content: flex-start;
        font-size: 12px;
      }

      .playground-files-library-path-row .playground-files-breadcrumb {
        font-size: 12px;
      }

      .playground-files-breadcrumb-segment {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .playground-files-breadcrumb-separator-icon {
        width: 12px;
        height: 12px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.34);
      }

      .playground-files-library-path-actions {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        flex: 0 0 auto;
      }

      .playground-files-library-path-actions .playground-files-nav-button {
        width: 18px;
        height: 24px;
        padding-left: 0;
        padding-right: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-files-library-path-actions .playground-files-nav-button:hover {
        background: transparent;
      }

      .playground-files-library-title {
        margin: 0;
        color: #fff;
        font-size: 18px;
        line-height: 1.15;
        font-weight: 500;
        letter-spacing: -0.04em;
      }

      .playground-files-library-title-heading {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .playground-files-library-title-computer-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.64);
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        letter-spacing: 0;
        white-space: nowrap;
      }

      .playground-files-library-title-computer-badge svg {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-files-library-actions {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 14px;
      }

      .playground-files-library-search-anchor,
      .playground-files-library-new-anchor,
      .playground-files-library-control-anchor {
        position: relative;
        z-index: 341;
      }

      .playground-files-library-new-anchor,
      .playground-files-library-control-anchor {
        z-index: 10070;
      }

      .playground-files-library-search {
        --playground-files-library-search-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        width: min(100%, 360px);
        height: 32px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.88);
        box-sizing: border-box;
        position: relative;
        z-index: 0;
        overflow: hidden;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-files-library-search::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-library-search-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-files-library-search > * {
        position: relative;
        z-index: 1;
      }

      .playground-files-library-search-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-files-library-search-input {
        min-width: 0;
        flex: 1;
        border: 0;
        outline: none;
        background: transparent;
        color: #fff;
        font: inherit;
        font-size: 12px;
        line-height: 1;
      }

      .playground-files-library-search-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-files-library-search-popover {
        left: 0;
        right: auto;
        top: calc(100% + 10px);
        width: min(420px, calc(100vw - 32px));
      }

      .playground-files-library-new-button {
        --playground-files-library-new-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        white-space: nowrap;
        position: relative;
        z-index: 0;
        overflow: hidden;
      }

      .playground-files-library-new-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-library-new-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-files-library-new-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-files-library-tabs {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        position: static !important;
        left: auto;
        top: auto;
        transform: none !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }

      .playground-files-library-tabs.content-mode-switch {
        gap: 8px;
        height: 30px;
        padding: 2px;
      }

      .playground-files-library-tab {
        min-width: 64px;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 12px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        line-height: 1rem;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-library-tab:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-library-tab.is-active {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      .playground-files-library-controls {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        flex: 0 0 auto;
        margin-left: 0 !important;
      }

      .playground-files-library-icon-button {
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.68);
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-library-icon-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .playground-files-library-icon-button.is-active {
        background: rgba(255, 255, 255, 0.22);
        color: #fff;
      }

      .playground-files-library-icon-button svg {
        width: 14px;
        height: 14px;
      }

      .playground-files-library-divider {
        width: 1px;
        height: 28px;
        background: rgba(255, 255, 255, 0.08);
      }
`;
