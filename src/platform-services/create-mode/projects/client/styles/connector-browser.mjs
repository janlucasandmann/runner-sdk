export const PROJECTS_CONNECTOR_BROWSER_CSS = `
      .playground-tasks-connector-browser-portal.tb-runner-chat {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: block;
        width: 100vw;
        max-width: none;
        height: 100dvh;
        min-height: 100dvh;
        overflow: visible;
        pointer-events: none;
        background: transparent;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat > .tb-file-browser-scrim {
        pointer-events: auto;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat *,
      .playground-tasks-connector-browser-portal.tb-runner-chat *::before,
      .playground-tasks-connector-browser-portal.tb-runner-chat *::after {
        box-sizing: border-box;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-scrim {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.6);
      }

      .playground-project-environment-file-picker-portal.tb-runner-chat .tb-file-browser-scrim {
        z-index: 2147483001;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-modal {
        position: relative;
        width: min(980px, 100%);
        height: min(620px, calc(100vh - 48px));
        overflow: hidden;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75);
        -webkit-backdrop-filter: blur(80px);
        backdrop-filter: blur(80px);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-modal::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 20px;
        padding: 1px;
        background: linear-gradient(-10deg, rgba(200, 200, 200, 0.15), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.3));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-body {
        position: relative;
        z-index: 1;
        display: flex;
        height: calc(100% - 52px);
        min-height: 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-sidebar {
        width: 208px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: rgba(0, 0, 0, 0.2);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-wrap {
        padding: 12px 12px 16px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search {
        position: relative;
        border-radius: 10px;
        background: transparent;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 10px;
        padding: 1px;
        background: linear-gradient(-10deg, rgba(200, 200, 200, 0.15), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.3));
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-icon,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-clear-icon {
        width: 12px;
        height: 12px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-input {
        width: 100%;
        padding: 4px 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: white;
        font-size: 12px;
        line-height: 1.25;
        outline: none;
        transition: background-color 150ms ease;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-input::placeholder {
        color: #9ca3af;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-input:focus {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-clear {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: #6b7280;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-search-clear:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-sidebar-section {
        padding: 0 12px 12px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-sidebar-title {
        margin: 0 0 8px;
        padding: 0 8px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        font-weight: 400;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-sidebar-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-row {
        width: 100%;
        min-height: 30px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: #9ca3af;
        text-align: left;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-row:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-row.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-icon,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-brand-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        object-fit: contain;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-header-icon .tb-file-browser-source-icon,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-header-icon .tb-file-browser-source-brand-icon {
        width: 16px;
        height: 16px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 500;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-source-note {
        margin-left: auto;
        color: #6b7280;
        font-size: 9px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-main {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-card,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-empty-state {
        width: 100%;
        max-width: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-icon-wrap {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-icon {
        width: 40px;
        height: 40px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-title {
        margin: 0 0 4px;
        color: white;
        font-size: 18px;
        font-weight: 600;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-copy {
        margin: 0 0 24px;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.5;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-button {
        padding: 8px 24px;
        border: 0;
        border-radius: 8px;
        background: white;
        color: black;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-button:hover:enabled {
        background: #f3f4f6;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-auth-button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-header {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 12px 8px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-button,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-nav-button {
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: #d1d5db;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-button {
        width: 28px;
        height: 28px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-nav-button {
        width: 24px;
        height: 24px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-button:hover:enabled,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-nav-button:hover:enabled {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-button:disabled,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-nav-button:disabled {
        color: #4b5563;
        cursor: default;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-icon {
        width: 14px;
        height: 14px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-nav-icon {
        width: 16px;
        height: 16px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-header-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumbs {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 4px;
        overflow-x: auto;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumb-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumb-sep,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-count {
        color: #6b7280;
        font-size: 12px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumb {
        border: 0;
        background: transparent;
        color: #9ca3af;
        font-size: 12px;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumb.active,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-breadcrumb:hover {
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-list-inner {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        font-size: 13px;
        text-align: center;
        padding: 16px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item {
        width: 100%;
        min-height: 36px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: white;
        text-align: left;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item.selected {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item.preview {
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-leading {
        width: 16px;
        padding: 0;
        border: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: #9ca3af;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-leading:hover {
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-folder-chevron,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-toolbar-icon {
        width: 14px;
        height: 14px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-folder-chevron-spin {
        animation: tb-file-browser-spin 1s linear infinite;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-check {
        width: 12px;
        height: 12px;
        margin-right: 4px;
        border: 1px solid #6b7280;
        border-radius: 3px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-check.selected {
        background: #3b82f6;
        border-color: #3b82f6;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-check-icon {
        width: 10px;
        height: 10px;
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-icon-asset {
        object-fit: contain;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-name {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 500;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-meta,
      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-size {
        flex-shrink: 0;
        color: #9ca3af;
        font-size: 12px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-size {
        width: 64px;
        text-align: right;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-branch-slot {
        flex-shrink: 0;
        min-width: 120px;
        max-width: 156px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-branch-select {
        width: 100%;
        height: 28px;
        padding: 0 28px 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
        line-height: 1;
        outline: none;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview {
        width: 320px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.2);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-header {
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-art {
        width: 100%;
        aspect-ratio: 1 / 1;
        margin-bottom: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-loader {
        width: 24px;
        height: 24px;
        color: #9ca3af;
        animation: tb-file-browser-spin 1s linear infinite;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-text {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 8px;
        overflow: hidden;
        color: #d1d5db;
        font-size: 8px;
        line-height: 1.3;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-glyph {
        width: 48px;
        height: 48px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-item-children {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-name {
        width: 100%;
        margin: 0;
        color: white;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        word-break: break-word;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-subtitle {
        margin: 4px 0 0;
        color: #9ca3af;
        font-size: 12px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-info {
        flex: 1;
        overflow-y: auto;
        padding: 0 16px 16px;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-info-title {
        margin-bottom: 8px;
        color: white;
        font-size: 12px;
        font-weight: 500;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-info-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: #9ca3af;
        font-size: 12px;
        padding: 4px 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-preview-info-row span:last-child {
        color: white;
        text-align: right;
        word-break: break-word;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button {
        flex: 1 1 120px;
        min-width: 0;
        min-height: 28px;
        padding: 4px 12px;
        border: 0;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.3333333;
        white-space: nowrap;
        overflow: hidden;
        cursor: pointer;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-secondary {
        flex-basis: 80px;
        max-width: 80px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-primary {
        flex-basis: 136px;
        max-width: 136px;
        background: #2563eb;
        color: white;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-primary:hover:enabled {
        background: #1d4ed8;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
      }

      .playground-tasks-connector-browser-portal.tb-runner-chat .tb-file-browser-footer-button-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
`;
