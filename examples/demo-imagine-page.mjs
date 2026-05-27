export const IMAGINE_PAGE_CSS = String.raw`
      .playground-content-body.is-imagine-page {
        padding: 0;
        overflow: hidden;
      }

      .playground-imagine-page {
        position: relative;
        isolation: isolate;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-page::after {
        display: none;
      }

      .playground-imagine-shell {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: none;
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .playground-imagine-header {
        display: none;
      }

      .playground-imagine-title-row,
      .playground-imagine-content-navbar {
        width: 100%;
        min-height: 34px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-imagine-navbar-left,
      .playground-imagine-navbar-right {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-imagine-navbar-left {
        flex: 0 0 auto;
      }

      .playground-imagine-navbar-right {
        flex: 0 0 auto;
        margin-left: auto;
      }

      .playground-imagine-template-count {
        display: none;
      }

      .playground-imagine-title-group {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-imagine-title {
        margin: 0;
        font-size: 18px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: -0.03em;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-beta {
        display: none;
        align-items: center;
        justify-content: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.9);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-tabs {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        flex: 0 0 auto;
        padding: 2px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-imagine-tabs::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-tab {
        position: relative;
        z-index: 1;
        min-width: 76px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        padding: 0 12px;
        font-size: 12px;
        line-height: 1rem;
        font-weight: 400;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-imagine-tab.is-active {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }

      .playground-imagine-toolbar.playground-auth-users-toolbar {
        flex: 0 0 auto;
        margin: 0;
        padding: 0;
        border-bottom: 0;
      }

      .playground-imagine-toolbar .playground-auth-users-search,
      .playground-imagine-content-navbar .playground-auth-users-search {
        max-width: none;
        flex: 1 1 auto;
      }

      .playground-imagine-toolbar .playground-auth-users-search-input,
      .playground-imagine-content-navbar .playground-auth-users-search-input {
        height: 30px;
        font-size: 12px;
      }

      .playground-imagine-toolbar .playground-files-control-button,
      .playground-imagine-content-navbar .playground-files-control-button {
        min-height: 30px;
        height: 30px;
        padding: 0 14px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-imagine-content-navbar .playground-files-control-button.is-backlog-filter,
      .playground-imagine-content-navbar .playground-files-control-button.is-backlog-sort {
        padding-right: 14px;
      }

      .playground-imagine-content-navbar .playground-files-control-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
        background: transparent;
      }

      .playground-imagine-content-navbar .playground-files-control-button::before {
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

      .playground-imagine-content-navbar .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-toolbar .playground-files-control-button svg,
      .playground-imagine-content-navbar .playground-files-control-button svg {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-shell,
      .playground-imagine-content-navbar .playground-tasks-toolbar-popup-shell {
        position: relative;
      }

      .playground-imagine-toolbar .playground-tasks-toolbar-popup-menu,
      .playground-imagine-content-navbar .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 210px;
      }

      .playground-imagine-navbar-left .playground-tasks-toolbar-popup-menu {
        left: 0;
        right: auto;
      }

      .playground-imagine-grid-scroll {
        min-height: 0;
        flex: 1 1 auto;
        overflow: auto;
        padding-top: 0;
        padding-bottom: 0;
        display: flex;
        flex-direction: column;
        scrollbar-width: none;
      }

      .playground-imagine-grid-scroll.is-create-template {
        padding: 24px 0;
      }

      .playground-imagine-grid-scroll::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-grid {
        display: block;
        width: 100%;
        column-count: 3;
        column-gap: 2px;
      }

      @keyframes playgroundImagineTemplateSkeleton {
        0%,
        100% {
          background-color: rgba(255, 255, 255, 0.05);
        }

        50% {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .playground-imagine-template {
        position: relative;
        isolation: isolate;
        width: 100%;
        min-height: 0;
        aspect-ratio: var(--imagine-template-aspect-ratio, 4 / 3);
        margin: 0 0 2px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
        page-break-inside: avoid;
        overflow: hidden;
        border: 0;
        border-radius: 0;
        background: var(--imagine-template-bg, rgba(255, 255, 255, 0.06));
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.94);
        text-align: left;
        cursor: pointer;
        padding: 16px;
        animation: playgroundImagineTemplateSkeleton 4s ease-in-out infinite;
      }

      .playground-imagine-template::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -2;
        background: transparent;
        opacity: 0;
      }

      .playground-imagine-template::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.58));
        opacity: 0;
        transition: opacity 180ms ease;
      }

      .playground-imagine-template:hover {
        transform: none;
      }

      .playground-imagine-template:hover::after,
      .playground-imagine-template:focus-visible::after {
        opacity: 1;
      }

      .playground-imagine-template.is-selected {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.72);
      }

      .playground-imagine-template.is-large {
        min-height: 0;
      }

      .playground-imagine-template.is-wide {
        min-height: 0;
      }

      .playground-imagine-template-copy {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 88%;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 180ms ease, transform 180ms ease;
      }

      .playground-imagine-template:hover .playground-imagine-template-copy,
      .playground-imagine-template:focus-visible .playground-imagine-template-copy {
        opacity: 1;
        transform: translateY(0);
      }

      .playground-imagine-template-title {
        font-size: 15px;
        line-height: 1.16;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-template-description {
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-imagine-template-prompt {
        display: none;
      }

      .playground-imagine-empty {
        min-height: 0;
        height: 100%;
        flex: 1 1 auto;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        border-radius: 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
        text-align: center;
      }

      .playground-imagine-empty-visual {
        width: 200px;
        max-width: min(200px, 70vw);
        height: auto;
        object-fit: contain;
      }

      .playground-imagine-empty-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.15;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-empty-copy {
        margin: 0;
        max-width: 360px;
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-imagine-primary-button,
      .playground-imagine-secondary-button {
        position: relative;
        z-index: 0;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 999px;
        padding: 0 14px;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-primary-button {
        background: #fff;
        color: #000;
      }

      .playground-imagine-secondary-button {
        color: rgba(255, 255, 255, 0.9);
        background: transparent;
        overflow: hidden;
      }

      .playground-imagine-secondary-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-secondary-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-create-page {
        width: min(760px, calc(100% - 48px));
        margin: auto;
        padding: 0;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-create-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.68);
        padding: 0;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-create-back.playground-imagine-template-back.is-icon-only {
        position: fixed;
      }

      .playground-imagine-create-header {
        margin: 28px 0 24px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
      }

      .playground-imagine-create-header h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: -0.03em;
      }

      .playground-imagine-create-header p {
        margin: 8px 0 0;
        max-width: 420px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-imagine-template-form {
        position: relative;
        overflow: visible;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        padding: 18px;
      }

      .playground-imagine-template-form::before {
        content: none;
        display: none;
      }

      .playground-imagine-form-grid {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-imagine-create-settings {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-imagine-create-settings .playground-imagine-template-style-picker {
        margin: 0;
      }

      .playground-imagine-form-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-imagine-create-title-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-imagine-create-title-section .playground-imagine-template-section-title {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-imagine-create-title-input {
        width: 100%;
        height: 38px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
        outline: none;
        padding: 0 12px;
        box-sizing: border-box;
        font: inherit;
        font-size: 13px;
        font-weight: 400;
      }

      .playground-imagine-create-title-input:focus {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.56);
      }

      .playground-imagine-create-markdown-section {
        margin: 0;
        padding: 0;
      }

      .playground-imagine-create-markdown-section .playground-tasks-detail-section-header {
        margin-bottom: 10px;
      }

      .playground-imagine-create-markdown-section .playground-tasks-detail-section-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-imagine-create-markdown-editor {
        min-height: 88px;
        overflow: visible;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-imagine-create-markdown-editor::before {
        content: none;
        display: none;
      }

      .playground-imagine-create-markdown-input {
        min-height: 88px;
        padding: 0 0 9px;
        color: rgba(255, 255, 255, 0.7);
        overflow: auto;
      }

      .playground-imagine-create-markdown-section.is-description .playground-imagine-create-markdown-editor,
      .playground-imagine-create-markdown-section.is-description .playground-imagine-create-markdown-input {
        min-height: 30px;
        height: 30px;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-attachments-toolbar {
        margin-bottom: 12px;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-from-computer {
        border: 0;
        background: transparent;
        color: #66a6ff;
        padding: 0;
        font: inherit;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-create-reference-section .playground-imagine-template-from-computer:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-imagine-create-file-browser-runner {
        display: none;
      }

      .playground-imagine-form-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-imagine-form-field label {
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-form-input,
      .playground-imagine-form-textarea {
        width: 100%;
        border: 0;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.32);
        color: rgba(255, 255, 255, 0.94);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-size: 13px;
        line-height: 1.45;
        font-weight: 400;
        outline: none;
      }

      .playground-imagine-form-input {
        height: 40px;
        padding: 0 12px;
      }

      .playground-imagine-form-textarea {
        min-height: 94px;
        resize: vertical;
        padding: 11px 12px;
      }

      .playground-imagine-upload-card {
        position: relative;
        min-height: 166px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 1px dashed rgba(255, 255, 255, 0.22);
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.22);
        overflow: hidden;
        text-align: center;
        cursor: pointer;
      }

      .playground-imagine-create-upload-surface {
        position: relative;
        min-height: 166px;
      }

      .playground-imagine-create-upload-dropzone {
        position: relative;
        min-height: 166px;
      }

      .playground-imagine-create-upload-dropzone input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .playground-imagine-create-upload-preview {
        position: absolute;
        inset: 8px;
        border-radius: 8px;
        overflow: hidden;
        z-index: 0;
        opacity: 0.62;
      }

      .playground-imagine-create-upload-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .playground-imagine-create-upload-dropzone > svg,
      .playground-imagine-create-upload-dropzone > span {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-upload-card input {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }

      .playground-imagine-upload-card img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-imagine-upload-card svg,
      .playground-imagine-upload-card span,
      .playground-imagine-upload-card small {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-upload-card span {
        color: rgba(255, 255, 255, 0.86);
        font-size: 13px;
        font-weight: 400;
      }

      .playground-imagine-upload-card small {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-imagine-form-actions {
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .playground-imagine-form-error {
        margin-right: auto;
        color: rgba(255, 132, 132, 0.92);
        font-size: 12px;
      }

      .playground-imagine-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 10px;
        z-index: 5;
        width: min(56rem, calc(100% - 64px));
        transform: translateX(-50%);
      }

      .playground-imagine-selected-preset {
        width: fit-content;
        max-width: 100%;
        margin: 0 auto 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.42);
        -webkit-backdrop-filter: blur(28px);
        backdrop-filter: blur(28px);
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
        line-height: 1;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-selected-preset strong {
        color: rgba(255, 255, 255, 0.96);
        font-weight: 400;
      }

      .playground-imagine-selected-preset-clear {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        padding: 0;
      }

      .playground-imagine-selected-preset-clear svg {
        width: 12px;
        height: 12px;
      }

      .playground-imagine-composer-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-input-width,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .embedded-runner-input,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .tb-composer-textarea-shell,
      .playground-imagine-composer-shell .tb-runner-chat.playground-imagine-runner .task-input-controls {
        background: transparent !important;
      }

      .tb-runner-chat.playground-imagine-runner {
        width: 100%;
        min-width: 0;
        display: block;
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        overflow: visible;
      }

      .tb-runner-chat.playground-imagine-runner .workinglogsbox {
        display: none !important;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-shell {
        position: static;
        right: auto;
        bottom: auto;
        padding: 0;
        background: none;
        pointer-events: auto;
      }

      .tb-runner-chat.playground-imagine-runner .tb-input-width {
        width: 100%;
        max-width: none;
      }

      .tb-runner-chat.playground-imagine-runner .embedded-runner-input {
        width: 100%;
      }

      .tb-runner-chat.playground-imagine-runner .task-input-box {
        --tb-runner-input-bg: rgba(0, 0, 0, 0.75);
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.75);
        background: rgba(0, 0, 0, 0.75) !important;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-imagine-top-nav-controls {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-top-nav-divider {
        flex: 0 0 1px;
        width: 1px;
        height: 22px;
        margin: 0 2px 0 6px;
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-imagine-top-nav-controls .playground-files-toolbar-anchor,
      .playground-imagine-top-nav-controls .playground-tasks-toolbar-popup-shell {
        position: relative;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        min-height: 30px;
        height: 30px;
        overflow: hidden;
        border: 0;
        background: transparent;
        padding: 0 14px;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-top-nav-controls .playground-files-control-button::before {
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

      .playground-imagine-top-nav-controls .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-top-nav-controls .playground-files-control-button svg {
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-imagine-top-nav-controls .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 210px;
      }

      .tb-runner-chat.playground-imagine-runner .tb-context-indicator-anchor {
        display: none;
      }

      @media (max-width: 1080px) {
        .playground-imagine-shell {
          padding-left: 0;
          padding-right: 0;
        }

        .playground-imagine-grid {
          column-count: 3;
        }
      }

      @media (max-width: 760px) {
        .playground-imagine-shell {
          padding: 0;
        }

        .playground-imagine-title-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-imagine-tabs {
          width: 100%;
        }

        .playground-imagine-tab {
          flex: 1 1 0;
          min-width: 0;
        }

        .playground-imagine-grid {
          column-count: 2;
        }

        .playground-imagine-composer-wrap {
          width: calc(100% - 24px);
          bottom: 10px;
        }
      }
`;

export const IMAGINE_PAGE_SCRIPT = String.raw`
        function PlaygroundImaginePage({
          backendUrl,
          apiKey,
          speechToTextUrl,
          requestHeaders,
          computerAgents,
          environments,
          agents,
          skills,
          skillDefaults,
          environmentId,
          agentId,
          fetchCustomSkills,
          onThreadStarted,
          onThreadTitleGenerated,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onRequireAuth,
          activeView,
          filterMode: externalFilterMode,
          sortMode: externalSortMode,
          onActiveViewChange,
        }) {
          const [localActiveTab, setLocalActiveTab] = useState("explore");
          const [searchQuery, setSearchQuery] = useState("");
          const [selectedTemplateId, setSelectedTemplateId] = useState("");
          const customTemplateStorageKey = "runner_demo_imagine_custom_templates_v1";
          const favouriteTemplateStorageKey = "runner_demo_imagine_favourite_template_ids_v1";
          const [customTemplates, setCustomTemplates] = useState(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return [];
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(customTemplateStorageKey) || "[]");
              return Array.isArray(parsed) ? parsed.filter((template) => template && template.id && template.imageUrl) : [];
            } catch (_error) {
              return [];
            }
          });
          const [sharedCustomTemplates, setSharedCustomTemplates] = useState([]);
          const [favouriteTemplateIds, setFavouriteTemplateIds] = useState(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return [];
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(favouriteTemplateStorageKey) || "[]");
              if (!Array.isArray(parsed)) {
                return [];
              }
              return Array.from(new Set(parsed.map((id) => String(id || "").trim()).filter(Boolean)));
            } catch (_error) {
              return [];
            }
          });

          async function generateImagineThreadTitle(threadId, prompt) {
            const normalizedThreadId = String(threadId || "").trim();
            const normalizedPrompt = String(prompt || "").trim();
            const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
            if (!normalizedThreadId || !normalizedPrompt || !normalizedBackendUrl) {
              return "";
            }

            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            if (apiKey) {
              headers.set("X-API-Key", apiKey);
            }

            const response = await fetch(
              normalizedBackendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/generate-title",
              {
                method: "POST",
                headers,
                body: JSON.stringify({ message: normalizedPrompt }),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to generate thread title.");
            }

            return (
              String(data?.thread?.title || "").trim()
              || String(data?.title || "").trim()
            );
          }
          const [favouritesSyncReady, setFavouritesSyncReady] = useState(false);
          const [templateDraft, setTemplateDraft] = useState({
            title: "",
            description: "",
            prompt: "",
            imageUrl: "",
            aspectRatio: "4 / 3",
            defaultAspectRatio: "",
            defaultStyles: ["professional"],
          });
          const [editingTemplateId, setEditingTemplateId] = useState("");
          const [templateFormError, setTemplateFormError] = useState("");
          const [createAspectRatioSelectorOpen, setCreateAspectRatioSelectorOpen] = useState(false);
          const [createStylePickerOpen, setCreateStylePickerOpen] = useState(false);
          const [createReferenceFileBrowserRequest, setCreateReferenceFileBrowserRequest] = useState(null);
          const [createReferenceImportState, setCreateReferenceImportState] = useState({
            status: "idle",
            error: "",
          });
          const createAspectRatioSelectorRef = useRef(null);
          const createStylePickerRef = useRef(null);
          const templateDescriptionTextareaRef = useRef(null);
          const templatePromptTextareaRef = useRef(null);
          const createReferenceEnvironmentIdRef = useRef(String(environmentId || ""));
          const filterMode = ["all", "campaign", "product", "editorial", "concept"].includes(String(externalFilterMode || ""))
            ? String(externalFilterMode || "")
            : "all";
          const sortMode = ["featured", "name-asc", "name-desc"].includes(String(externalSortMode || ""))
            ? String(externalSortMode || "")
            : "featured";
          const rawActiveView = String(activeView || "");
          const normalizedActiveView = rawActiveView === "history"
            ? "my-templates"
            : ["explore", "my-templates", "create-template", "favourites"].includes(rawActiveView)
              ? rawActiveView
            : "";
          const activeTab = normalizedActiveView || localActiveTab;
          const previousActiveTabRef = useRef(activeTab);
          useEffect(() => {
            createReferenceEnvironmentIdRef.current = String(environmentId || "");
          }, [environmentId]);
          const setActiveImagineTab = useCallback((nextTab) => {
            const rawNextTab = String(nextTab || "");
            const normalizedNextTab = rawNextTab === "history"
              ? "my-templates"
              : ["explore", "my-templates", "create-template", "favourites"].includes(rawNextTab)
              ? String(nextTab)
              : "explore";
            if (normalizedNextTab !== "create-template") {
              setEditingTemplateId("");
              setTemplateDraft({
                title: "",
                description: "",
                prompt: "",
                imageUrl: "",
                aspectRatio: "4 / 3",
                defaultAspectRatio: "",
                defaultStyles: ["professional"],
              });
              setTemplateFormError("");
              setCreateAspectRatioSelectorOpen(false);
              setCreateStylePickerOpen(false);
            }
            if (typeof onActiveViewChange === "function") {
              onActiveViewChange(normalizedNextTab);
            } else {
              setLocalActiveTab(normalizedNextTab);
            }
          }, [onActiveViewChange]);

          useEffect(() => {
            if (previousActiveTabRef.current !== activeTab) {
              setSelectedTemplateId("");
            }
            previousActiveTabRef.current = activeTab;
          }, [activeTab]);

          useEffect(() => {
            if (!createAspectRatioSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (createAspectRatioSelectorRef.current && !createAspectRatioSelectorRef.current.contains(event.target)) {
                setCreateAspectRatioSelectorOpen(false);
              }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            return () => document.removeEventListener("pointerdown", handlePointerDown);
          }, [createAspectRatioSelectorOpen]);

          useEffect(() => {
            if (!createStylePickerOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (createStylePickerRef.current && !createStylePickerRef.current.contains(event.target)) {
                setCreateStylePickerOpen(false);
              }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            return () => document.removeEventListener("pointerdown", handlePointerDown);
          }, [createStylePickerOpen]);

          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              window.localStorage.setItem(customTemplateStorageKey, JSON.stringify(customTemplates));
            } catch (_error) {
              // Local template images can be large; failing to persist should not block the UI.
            }
          }, [customTemplates]);

          useEffect(() => {
            let cancelled = false;
            const loadSharedCustomTemplates = async () => {
              const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
              if (!normalizedBackendUrl) {
                setSharedCustomTemplates([]);
                return;
              }
              const headers = new Headers(requestHeaders || {});
              if (apiKey) {
                headers.set("X-API-Key", apiKey);
              }
              const parseMetadata = (metadata) => {
                if (!metadata) {
                  return {};
                }
                if (typeof metadata === "string") {
                  try {
                    return JSON.parse(metadata);
                  } catch (_error) {
                    return {};
                  }
                }
                return metadata && typeof metadata === "object" ? metadata : {};
              };
              try {
                const teamsResponse = await fetch(normalizedBackendUrl + "/teams", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                });
                if (!teamsResponse.ok) {
                  if (!cancelled) {
                    setSharedCustomTemplates([]);
                  }
                  return;
                }
                const teamsData = await teamsResponse.json().catch(() => ({}));
                const teams = Array.isArray(teamsData?.data) ? teamsData.data : [];
                const shareResponses = await Promise.all(teams.map(async (team) => {
                  const teamId = String(team?.id || "").trim();
                  if (!teamId) {
                    return [];
                  }
                  try {
                    const response = await fetch(
                      normalizedBackendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares",
                      {
                        method: "GET",
                        headers,
                        credentials: "include",
                        cache: "no-store",
                      }
                    );
                    if (!response.ok) {
                      return [];
                    }
                    const data = await response.json().catch(() => ({}));
                    return Array.isArray(data?.data) ? data.data : [];
                  } catch (_error) {
                    return [];
                  }
                }));
                const nextTemplates = [];
                shareResponses.flat().forEach((share) => {
                  if (String(share?.resourceType || "") !== "imagine_template") {
                    return;
                  }
                  const metadata = parseMetadata(share?.metadata);
                  const template = metadata?.template || metadata?.imagineTemplate || null;
                  if (!template || !template.imageUrl) {
                    return;
                  }
                  const normalizedTemplate = {
                    ...(template || {}),
                    id: String(template.id || share.resourceId || "").trim(),
                    isShared: true,
                    sharedTeamId: String(share.teamId || ""),
                    sharedShareId: String(share.id || ""),
                    sharedAccessLevel: String(share.accessLevel || "use"),
                  };
                  delete normalizedTemplate["long" + "Description"];
                  if (normalizedTemplate.id) {
                    nextTemplates.push(normalizedTemplate);
                  }
                });
                if (!cancelled) {
                  const deduped = Array.from(new Map(nextTemplates.map((template) => [template.id, template])).values());
                  setSharedCustomTemplates(deduped);
                }
              } catch (_error) {
                if (!cancelled) {
                  setSharedCustomTemplates([]);
                }
              }
            };
            void loadSharedCustomTemplates();
            return () => {
              cancelled = true;
            };
          }, [apiKey, backendUrl, requestHeaders]);

          useEffect(() => {
            let cancelled = false;
            const loadFavouriteTemplateIds = async () => {
              try {
                const response = await fetch("/api/aios/user/imagine-preferences", {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                });
                if (!response.ok) {
                  return;
                }
                const data = await response.json().catch(() => ({}));
                const remoteIds = Array.isArray(data?.favouriteTemplateIds)
                  ? data.favouriteTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)
                  : [];
                if (cancelled || !remoteIds.length) {
                  return;
                }
                setFavouriteTemplateIds((current) => {
                  const localIds = Array.isArray(current) ? current.map((id) => String(id || "").trim()).filter(Boolean) : [];
                  return Array.from(new Set(localIds.concat(remoteIds)));
                });
              } catch (_error) {
                // Favourites still work locally if account preference sync is unavailable.
              } finally {
                if (!cancelled) {
                  setFavouritesSyncReady(true);
                }
              }
            };
            void loadFavouriteTemplateIds();
            return () => {
              cancelled = true;
            };
          }, []);

          useEffect(() => {
            const normalizedFavouriteIds = Array.from(new Set(
              (Array.isArray(favouriteTemplateIds) ? favouriteTemplateIds : [])
                .map((id) => String(id || "").trim())
                .filter(Boolean)
            ));
            if (typeof window !== "undefined" && window.localStorage) {
              try {
                window.localStorage.setItem(favouriteTemplateStorageKey, JSON.stringify(normalizedFavouriteIds));
              } catch (_error) {
                // Local storage is a convenience cache; remote sync below remains best effort.
              }
            }
            if (!favouritesSyncReady || typeof window === "undefined") {
              return;
            }
            const timeoutId = window.setTimeout(() => {
              void fetch("/api/aios/user/imagine-preferences", {
                method: "PATCH",
                credentials: "include",
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  favouriteTemplateIds: normalizedFavouriteIds,
                }),
              }).catch(() => {});
            }, 350);
            return () => {
              window.clearTimeout(timeoutId);
            };
          }, [favouriteTemplateIds, favouritesSyncReady]);

          const styleOptions = useMemo(() => [
            { id: "professional", label: "Professional", Icon: Award },
            { id: "editorial", label: "Editorial", Icon: Camera },
            { id: "premium", label: "Premium", Icon: Sparkles },
            { id: "minimal", label: "Minimal", Icon: Minus },
            { id: "cinematic", label: "Cinematic", Icon: Film },
            { id: "studio", label: "Studio", Icon: Crop },
            { id: "lifestyle", label: "Lifestyle", Icon: User },
            { id: "bold", label: "Bold", Icon: Flame },
            { id: "playful", label: "Playful", Icon: Wand2 },
            { id: "technical", label: "Technical", Icon: Code2 },
            { id: "data-driven", label: "Data-driven", Icon: ChartNoAxesColumnIncreasing },
            { id: "product", label: "Product", Icon: Package },
            { id: "social", label: "Social", Icon: MessageCircle },
            { id: "exploratory", label: "Exploratory", Icon: Telescope },
          ], []);
          const aspectRatioOptions = useMemo(() => [
            { value: "", label: "No preference", description: "Let the agent choose the best format" },
            { value: "1:1", label: "1:1", description: "Square composition" },
            { value: "4:5", label: "4:5", description: "Portrait campaign image" },
            { value: "16:9", label: "16:9", description: "Wide landscape image" },
            { value: "9:16", label: "9:16", description: "Vertical story format" },
          ], []);
          const selectedCreateStyleOptions = useMemo(() => {
            const selectedSet = new Set(Array.isArray(templateDraft.defaultStyles) ? templateDraft.defaultStyles : []);
            return styleOptions.filter((option) => selectedSet.has(option.id));
          }, [styleOptions, templateDraft.defaultStyles]);
          const selectedCreateAspectRatioOption = useMemo(() => {
            return aspectRatioOptions.find((option) => option.value === templateDraft.defaultAspectRatio) || aspectRatioOptions[0];
          }, [aspectRatioOptions, templateDraft.defaultAspectRatio]);

          const templates = useMemo(() => [
            {
              id: "product-ads",
              title: "Product ads",
              description: "Launch-ready product scenes, social variants, and campaign visuals.",
              prompt: "Create a premium product ad with a clean studio setup, soft light, and conversion-focused composition.",
              placeholder: "Create a product ad",
              defaultStyles: ["product", "premium", "studio", "professional"],
              Icon: Sparkles,
              imageUrl: "/img/imagine/product-ad.webp",
              tone: "url('/img/imagine/product-ad.webp') center / cover no-repeat",
              aspectRatio: "1086 / 1448",
              size: "large",
            },
            {
              id: "luxury-watch-ads",
              title: "Luxury watch ads",
              description: "Premium timepiece visuals with bold type, shine, and dramatic contrast.",
              prompt: "Create a luxury watch advertisement with dramatic lighting, crisp macro detail, bold headline typography, and a premium editorial finish.",
              placeholder: "Create a watch ad",
              defaultStyles: ["product", "premium", "studio", "bold"],
              Icon: Clock,
              imageUrl: "/img/imagine/watch-ad.webp",
              tone: "url('/img/imagine/watch-ad.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "fragrance-ads",
              title: "Fragrance ads",
              description: "Moody perfume visuals with glass detail, texture, and cinematic light.",
              prompt: "Create a moody luxury fragrance advertisement with a glass perfume bottle, tactile environmental texture, cinematic reflections, and refined brand typography.",
              placeholder: "Create a fragrance ad",
              defaultStyles: ["product", "premium", "cinematic", "editorial"],
              Icon: Sparkles,
              imageUrl: "/img/imagine/flacon-ad.webp",
              tone: "url('/img/imagine/flacon-ad.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "coffee-ads",
              title: "Coffee ads",
              description: "Warm lifestyle campaigns for coffee launches, blends, and rituals.",
              prompt: "Create a warm premium coffee advertisement with multiple product bags, lifestyle styling, sunlit texture, polished brand typography, and a clear campaign message.",
              placeholder: "Create a coffee ad",
              defaultStyles: ["product", "lifestyle", "premium", "editorial"],
              Icon: ReceiptText,
              imageUrl: "/img/imagine/coffee-ad.webp",
              tone: "url('/img/imagine/coffee-ad.webp') center / cover no-repeat",
              aspectRatio: "1448 / 1086",
              size: "wide",
            },
            {
              id: "beauty-ads",
              title: "Beauty ads",
              description: "Skincare campaign layouts with social proof, product cards, and glow.",
              prompt: "Create a premium beauty advertisement for a skincare brand with an elegant product hero, social-commerce proof, refined editorial typography, and a polished conversion-focused layout.",
              placeholder: "Create a beauty ad",
              defaultStyles: ["product", "premium", "lifestyle", "editorial"],
              Icon: Sparkles,
              imageUrl: "/img/imagine/beauty-ad.webp",
              tone: "url('/img/imagine/beauty-ad.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "payment-ads",
              title: "Payment ads",
              description: "Fintech campaign posters for payment products, wallets, and trust.",
              prompt: "Create a premium fintech payment advertisement with a confident customer hero, secure payment messaging, deep blue brand palette, polished iconography, and a clear trust-focused call to action.",
              placeholder: "Create a payment ad",
              defaultStyles: ["product", "professional", "premium", "minimal"],
              Icon: DollarSign,
              imageUrl: "/img/imagine/payment-ad.webp",
              tone: "url('/img/imagine/payment-ad.webp') center / cover no-repeat",
              aspectRatio: "1122 / 1402",
              size: "large",
            },
            {
              id: "logo-branding",
              title: "Logo branding",
              description: "Brand identity visuals with logo marks, mood, and launch polish.",
              prompt: "Create a premium logo branding visual with a distinctive abstract mark, cinematic brand mood, refined typography, and a polished identity presentation for a modern product launch.",
              placeholder: "Create brand visuals",
              defaultStyles: ["premium", "minimal", "cinematic", "professional"],
              Icon: Paintbrush,
              imageUrl: "/img/imagine/logo-branding.webp",
              tone: "url('/img/imagine/logo-branding.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "furniture-campaigns",
              title: "Furniture campaigns",
              description: "Interior launch visuals for collections, rooms, and home brands.",
              prompt: "Create a refined furniture campaign poster with a styled interior scene, soft natural light, architectural framing, elegant typography, and premium home brand direction.",
              placeholder: "Create a furniture campaign",
              defaultStyles: ["lifestyle", "premium", "editorial", "product"],
              Icon: Package,
              imageUrl: "/img/imagine/furniture.webp",
              tone: "url('/img/imagine/furniture.webp') center / cover no-repeat",
              aspectRatio: "941 / 1672",
              size: "large",
            },
            {
              id: "sneaker-campaigns",
              title: "Sneaker campaigns",
              description: "Athletic footwear ads with motion, grit, and bold campaign type.",
              prompt: "Create a premium sneaker campaign advertisement with an athletic hero subject, dramatic outdoor lighting, bold oversized typography, performance-focused copy, and polished sportswear brand direction.",
              placeholder: "Create a sneaker campaign",
              defaultStyles: ["product", "bold", "cinematic", "professional"],
              Icon: Flame,
              imageUrl: "/img/imagine/sneakers.webp",
              tone: "url('/img/imagine/sneakers.webp') center / cover no-repeat",
              aspectRatio: "1536 / 1024",
              size: "wide",
            },
            {
              id: "brand-campaigns",
              title: "Brand campaigns",
              description: "Cinematic campaign art directions for bold launches and seasonal moments.",
              prompt: "Design a cinematic brand campaign image with dramatic lighting, clear message, and premium composition.",
              placeholder: "Design a brand campaign",
              defaultStyles: ["professional", "premium", "bold", "editorial"],
              Icon: Paintbrush,
              imageUrl: "/img/imagine/boxer-ad.webp",
              tone: "url('/img/imagine/boxer-ad.webp') center / cover no-repeat",
              aspectRatio: "1672 / 941",
              size: "wide",
            },
            {
              id: "infographics",
              title: "Infographics",
              description: "Clean explainers, diagrams, and visual summaries.",
              prompt: "Create a polished infographic that explains the main idea with clear hierarchy and simple visual metaphors.",
              placeholder: "Make an infographic",
              defaultStyles: ["data-driven", "minimal", "technical", "professional"],
              Icon: LayoutGrid,
              imageUrl: "/img/imagine/raptor.webp",
              tone: "url('/img/imagine/raptor.webp') center / cover no-repeat",
              aspectRatio: "900 / 1200",
              size: "large",
            },
            {
              id: "technical-drawings",
              title: "Technical drawings",
              description: "Exploded views, engineering sketches, and precise product diagrams.",
              prompt: "Create a precise technical drawing with an exploded mechanical view, crisp ink detail, clean annotations, and a polished engineering illustration style.",
              placeholder: "Create a technical drawing",
              defaultStyles: ["technical", "minimal", "professional", "data-driven"],
              Icon: Code2,
              imageUrl: "/img/imagine/engine-drawing.webp",
              tone: "url('/img/imagine/engine-drawing.webp') center / cover no-repeat",
              aspectRatio: "1448 / 1086",
              size: "wide",
            },
            {
              id: "app-screens",
              title: "App screens",
              description: "Mockups, dashboard concepts, and product UI visuals.",
              prompt: "Create a high-end SaaS dashboard concept with dense but readable product UI and realistic data.",
              placeholder: "Mock up an app screen",
              defaultStyles: ["technical", "product", "minimal", "professional"],
              Icon: Monitor,
              imageUrl: "/img/imagine/app-screen.webp",
              tone: "url('/img/imagine/app-screen.webp') center / cover no-repeat",
              aspectRatio: "941 / 1672",
              size: "large",
            },
            {
              id: "editorial",
              title: "Editorial images",
              description: "Magazine-style visuals with artful composition and premium texture.",
              prompt: "Create an editorial hero image with artful composition, cinematic lighting, and premium visual texture.",
              placeholder: "Create an editorial image",
              defaultStyles: ["editorial", "cinematic", "premium"],
              Icon: Camera,
              imageUrl: "/img/imagine/panther.webp",
              tone: "url('/img/imagine/panther.webp') center / cover no-repeat",
              aspectRatio: "1038 / 1515",
              size: "large",
            },
            {
              id: "social-posts",
              title: "Social posts",
              description: "Vertical posts, carousel-ready creative, and high-impact feed visuals.",
              prompt: "Create a social media campaign visual with bold typography, strong hierarchy, and a premium feed-ready composition.",
              placeholder: "Create a social post",
              defaultStyles: ["social", "bold", "playful"],
              Icon: ImageIcon,
              imageUrl: "/img/imagine/social-post.webp",
              tone: "url('/img/imagine/social-post.webp') center / cover no-repeat",
              aspectRatio: "1024 / 1536",
              size: "large",
            },
            {
              id: "restaurant-ads",
              title: "Restaurant ads",
              description: "Menu launches, food posters, and local campaign visuals.",
              prompt: "Create a premium restaurant ad for a seasonal dish with appetizing food photography, elegant typography, a price badge, and a clear call to action.",
              placeholder: "Create a restaurant ad",
              defaultStyles: ["food", "premium", "editorial", "professional"],
              Icon: ReceiptText,
              imageUrl: "/img/imagine/salad-ad.webp",
              tone: "url('/img/imagine/salad-ad.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "comparison-ads",
              title: "Comparison ads",
              description: "Before-and-after creative that makes product value obvious.",
              prompt: "Create a polished before-and-after comparison ad with two clear panels, concise benefit copy, expressive illustration, and premium product branding.",
              placeholder: "Create a comparison ad",
              defaultStyles: ["campaign", "minimal", "bold", "professional"],
              Icon: Split,
              imageUrl: "/img/imagine/comparison-ad.webp",
              tone: "url('/img/imagine/comparison-ad.webp') center / cover no-repeat",
              aspectRatio: "1 / 1",
            },
            {
              id: "data-visuals",
              title: "Data visuals",
              description: "Charts, report covers, and visualized insights.",
              prompt: "Create a sophisticated data visualization artwork for a business report, with charts integrated naturally.",
              placeholder: "Visualize this data",
              defaultStyles: ["data-driven", "professional", "minimal"],
              Icon: ChartNoAxesColumnIncreasing,
              imageUrl: "/img/imagine/data-vis.webp",
              tone: "url('/img/imagine/data-vis.webp') center / cover no-repeat",
              aspectRatio: "1672 / 941",
              size: "wide",
            },
            {
              id: "fashion-campaigns",
              title: "Fashion campaigns",
              description: "Editorial looks, lookbook visuals, and polished campaign assets.",
              prompt: "Create a high-end fashion campaign image with editorial styling, premium lighting, and a strong brand-forward composition.",
              placeholder: "Create a fashion campaign",
              defaultStyles: ["editorial", "premium", "studio", "professional"],
              Icon: Wand2,
              imageUrl: "/img/imagine/fashion.webp",
              tone: "url('/img/imagine/fashion.webp') center / cover no-repeat",
              aspectRatio: "900 / 1200",
              size: "large",
            },
            {
              id: "portrait-studio",
              title: "Portrait studio",
              description: "Refined profile portraits, creator images, and personal-brand visuals.",
              prompt: "Create a refined studio portrait with natural expression, premium lighting, and a clean personal-brand composition.",
              placeholder: "Create a portrait",
              defaultStyles: ["portrait", "studio", "professional", "premium"],
              Icon: Camera,
              imageUrl: "/img/imagine/woman-portrait.webp",
              tone: "url('/img/imagine/woman-portrait.webp') center / cover no-repeat",
              aspectRatio: "1024 / 1536",
              size: "large",
            },
            {
              id: "animated-characters",
              title: "Animated characters",
              description: "Playful character art for stories, campaigns, and product mascots.",
              prompt: "Create a charming animated character image with expressive personality, rich color, and clean storybook composition.",
              placeholder: "Create a character",
              defaultStyles: ["playful", "illustrated", "bold"],
              Icon: Sparkles,
              imageUrl: "/img/imagine/animated-dog.webp",
              tone: "url('/img/imagine/animated-dog.webp') center / cover no-repeat",
              aspectRatio: "1086 / 1448",
              size: "large",
            },
            {
              id: "cinematic-wildlife",
              title: "Cinematic wildlife",
              description: "Dramatic animals, nature stories, and atmospheric campaign visuals.",
              prompt: "Create a cinematic wildlife image with dramatic lighting, atmospheric depth, and premium editorial composition.",
              placeholder: "Create a wildlife scene",
              defaultStyles: ["cinematic", "editorial", "bold"],
              Icon: Telescope,
              imageUrl: "/img/imagine/lions.webp",
              tone: "url('/img/imagine/lions.webp') center / cover no-repeat",
              aspectRatio: "1448 / 1086",
              size: "wide",
            },
            {
              id: "concept-art",
              title: "Concept art",
              description: "Worldbuilding, environments, and visual exploration.",
              prompt: "Create concept art for a futuristic workspace with cinematic depth and production-ready detail.",
              placeholder: "Create concept art",
              defaultStyles: ["exploratory", "cinematic", "bold"],
              Icon: Telescope,
              imageUrl: "/img/imagine/wolf.webp",
              tone: "url('/img/imagine/wolf.webp') center / cover no-repeat",
              aspectRatio: "1672 / 941",
              size: "wide",
            },
          ], []);

          const normalizedCustomTemplates = useMemo(() => {
            const normalizeCustomTemplate = (template, extras = {}) => {
              const normalizedTemplate = { ...(template || {}) };
              delete normalizedTemplate["long" + "Description"];
              return {
                ...normalizedTemplate,
                ...extras,
                isCustom: true,
                Icon: ImageIcon,
                tone: normalizedTemplate.tone || ("url('" + normalizedTemplate.imageUrl + "') center / cover no-repeat"),
                defaultStyles: Array.isArray(normalizedTemplate.defaultStyles) ? normalizedTemplate.defaultStyles : ["professional"],
                defaultAspectRatio: String(normalizedTemplate.defaultAspectRatio || "").trim(),
              };
            };
            const templatesById = new Map();
            sharedCustomTemplates.forEach((template) => {
              const normalizedId = String(template?.id || "").trim();
              if (normalizedId) {
                templatesById.set(normalizedId, normalizeCustomTemplate(template, { isShared: true }));
              }
            });
            customTemplates.forEach((template) => {
              const normalizedId = String(template?.id || "").trim();
              if (normalizedId) {
                templatesById.set(normalizedId, normalizeCustomTemplate(template));
              }
            });
            return Array.from(templatesById.values());
          }, [customTemplates, sharedCustomTemplates]);

          const allTemplates = useMemo(() => {
            return normalizedCustomTemplates.concat(templates);
          }, [normalizedCustomTemplates, templates]);

          const selectedTemplate = useMemo(
            () => allTemplates.find((template) => template.id === selectedTemplateId) || null,
            [allTemplates, selectedTemplateId]
          );

          const filterGroups = useMemo(() => ({
            campaign: ["product-ads", "luxury-watch-ads", "fragrance-ads", "coffee-ads", "beauty-ads", "payment-ads", "logo-branding", "furniture-campaigns", "sneaker-campaigns", "brand-campaigns", "social-posts", "restaurant-ads", "comparison-ads"],
            product: ["product-ads", "luxury-watch-ads", "fragrance-ads", "coffee-ads", "beauty-ads", "payment-ads", "furniture-campaigns", "sneaker-campaigns", "technical-drawings", "app-screens", "data-visuals"],
            editorial: ["editorial", "logo-branding", "fashion-campaigns", "portrait-studio"],
            concept: ["infographics", "technical-drawings", "concept-art", "animated-characters", "cinematic-wildlife"],
          }), []);

          const filterOptions = useMemo(() => [
            { id: "all", label: "All templates", description: "Show every image template" },
            { id: "campaign", label: "Campaigns", description: "Ads, launches, and social visuals" },
            { id: "product", label: "Product", description: "Product ads, apps, dashboards, and data visuals" },
            { id: "editorial", label: "Editorial", description: "Stories, blogs, and fashion campaigns" },
            { id: "concept", label: "Concepts", description: "Explainers, concept art, and worlds" },
          ], []);

          const sortOptions = useMemo(() => [
            { id: "featured", label: "Featured" },
            { id: "name-asc", label: "Name" },
            { id: "name-desc", label: "Name descending" },
          ], []);

          const filteredTemplates = useMemo(() => {
            const query = String(searchQuery || "").trim().toLowerCase();
            let nextTemplates = activeTab === "my-templates"
              ? normalizedCustomTemplates
              : activeTab === "favourites"
                ? allTemplates.filter((template) => favouriteTemplateIds.includes(template.id))
                : templates;
            if (query) {
              nextTemplates = nextTemplates.filter((template) => (
                template.title.toLowerCase().includes(query)
                || template.description.toLowerCase().includes(query)
                || template.prompt.toLowerCase().includes(query)
              ));
            }
            if (filterMode !== "all" && activeTab === "explore") {
              const group = filterGroups[filterMode] || [];
              nextTemplates = nextTemplates.filter((template) => group.includes(template.id));
            }
            if (sortMode === "name-asc") {
              nextTemplates = [...nextTemplates].sort((a, b) => a.title.localeCompare(b.title));
            } else if (sortMode === "name-desc") {
              nextTemplates = [...nextTemplates].sort((a, b) => b.title.localeCompare(a.title));
            }
            return nextTemplates;
          }, [activeTab, allTemplates, favouriteTemplateIds, filterGroups, filterMode, normalizedCustomTemplates, searchQuery, sortMode, templates]);

          const updateTemplateDraft = useCallback((field, value) => {
            setTemplateDraft((current) => ({
              ...current,
              [field]: value,
            }));
            setTemplateFormError("");
          }, []);

          const applyTemplateMarkdownSelection = useCallback((field, textareaRef, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) => {
            setTemplateDraft((current) => ({
              ...current,
              [field]: nextValue,
            }));
            setTemplateFormError("");
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            });
          }, []);

          const buildWrappedTemplateMarkdownEdit = useCallback((value, selectionStart, selectionEnd, prefix, suffix = prefix) => {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                const nextValue = value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd);
                return {
                  value: nextValue,
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
              const wrappedText = prefix + selectedText + suffix;
              const nextValue = value.slice(0, safeStart) + wrappedText + value.slice(safeEnd);
              return {
                value: nextValue,
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
            const insertedText = prefix + suffix;
            const nextValue = value.slice(0, safeStart) + insertedText + value.slice(safeEnd);
            return {
              value: nextValue,
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }, []);

          const buildTemplateMarkdownListEdit = useCallback((value, selectionStart, selectionEnd) => {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\\n");
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^(\\s*)-\\s+/.test(line));
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                return shouldRemoveList ? line : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(/^(\\s*)-\\s+/, "$1");
              }
              if (/^(\\s*)-\\s+/.test(line)) {
                return line;
              }
              return line.replace(/^(\\s*)/, "$1- ");
            });
            const nextBlock = nextLines.join("\\n");
            const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 2)
              : safeStart - lineStart + 2;
            return {
              value: nextValue,
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }, []);

          const handleTemplateMarkdownFormat = useCallback((field, textareaRef, formatType) => {
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(templateDraft?.[field] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;

            if (formatType === "bold") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedTemplateMarkdownEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildTemplateMarkdownListEdit(value, selectionStart, selectionEnd);
            }

            if (!edit) {
              return;
            }

            applyTemplateMarkdownSelection(field, textareaRef, edit.value, edit.selectionStart, edit.selectionEnd);
          }, [applyTemplateMarkdownSelection, buildTemplateMarkdownListEdit, buildWrappedTemplateMarkdownEdit, templateDraft]);

          const handleTemplateImageFile = useCallback((file) => {
            if (!file) {
              return;
            }
            if (!String(file.type || "").startsWith("image/")) {
              setTemplateFormError("Choose an image file to create a template.");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              const imageUrl = String(reader.result || "");
              if (!imageUrl) {
                setTemplateFormError("Could not read that image.");
                return;
              }
              const image = new Image();
              image.onload = () => {
                const width = image.naturalWidth || 4;
                const height = image.naturalHeight || 3;
                setTemplateDraft((current) => ({
                  ...current,
                  imageUrl,
                  aspectRatio: width + " / " + height,
                }));
                setTemplateFormError("");
              };
              image.onerror = () => {
                setTemplateDraft((current) => ({
                  ...current,
                  imageUrl,
                  aspectRatio: "4 / 3",
                }));
                setTemplateFormError("");
              };
              image.src = imageUrl;
            };
            reader.onerror = () => {
              setTemplateFormError("Could not read that image.");
            };
            reader.readAsDataURL(file);
          }, []);

          const openCreateReferenceFileBrowser = useCallback(() => {
            setTemplateFormError("");
            setCreateReferenceImportState({ status: "idle", error: "" });
            setCreateReferenceFileBrowserRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              source: "workspace",
            });
          }, []);

          const buildCreateReferenceDownloadUrl = useCallback((fileId) => {
            const normalizedBackendUrl = String(backendUrl || "").replace(/\/+$/, "");
            const normalizedEnvironmentId = String(createReferenceEnvironmentIdRef.current || environmentId || "").trim();
            let normalizedPath = String(fileId || "").trim().replace(/^\/+/, "");
            if (normalizedPath.startsWith("workspace/")) {
              normalizedPath = normalizedPath.slice("workspace/".length);
            }
            if (!normalizedBackendUrl || !normalizedEnvironmentId || !normalizedPath) {
              return "";
            }
            const encodedPath = normalizedPath
              .split("/")
              .filter(Boolean)
              .map((segment) => encodeURIComponent(segment))
              .join("/");
            return normalizedBackendUrl + "/environments/" + encodeURIComponent(normalizedEnvironmentId) + "/files/download/" + encodedPath;
          }, [backendUrl, environmentId]);

          const importCreateReferenceWorkspaceFile = useCallback(async (fileId) => {
            const normalizedFileId = String(fileId || "").trim();
            if (!normalizedFileId) {
              return;
            }
            const downloadUrl = buildCreateReferenceDownloadUrl(normalizedFileId);
            if (!downloadUrl) {
              const message = "Select a computer before choosing a reference image.";
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
              return;
            }
            setCreateReferenceImportState({ status: "loading", error: "" });
            try {
              const headers = new Headers(requestHeaders || undefined);
              const normalizedApiKey = String(apiKey || "").trim();
              if (normalizedApiKey && !headers.has("Authorization")) {
                headers.set("Authorization", "Bearer " + normalizedApiKey);
              }
              if (normalizedApiKey && !headers.has("x-api-key")) {
                headers.set("x-api-key", normalizedApiKey);
              }
              const response = await fetch(downloadUrl, { method: "GET", headers });
              if (!response.ok) {
                throw new Error("Could not load that file from Computer Agents files.");
              }
              const blob = await response.blob();
              const fileName = normalizedFileId.split("/").filter(Boolean).pop() || "reference-image";
              const mimeType = blob.type || (/\.webp$/i.test(fileName) ? "image/webp" : /\.png$/i.test(fileName) ? "image/png" : /\.jpe?g$/i.test(fileName) ? "image/jpeg" : "");
              if (!String(mimeType || "").startsWith("image/") && !/\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(fileName)) {
                throw new Error("Choose an image file to create a template.");
              }
              const BrowserFile = globalThis.File;
              const importedFile = typeof BrowserFile === "function"
                ? new BrowserFile([blob], fileName, { type: mimeType || "image/png" })
                : blob;
              handleTemplateImageFile(importedFile);
              setCreateReferenceImportState({ status: "idle", error: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error || "Could not import that image.");
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
            }
          }, [apiKey, buildCreateReferenceDownloadUrl, handleTemplateImageFile, requestHeaders]);

          const handleCreateReferenceWorkspaceAttach = useCallback((fileIds) => {
            const firstFileId = Array.isArray(fileIds) ? fileIds.find(Boolean) : "";
            if (!firstFileId) {
              return;
            }
            void importCreateReferenceWorkspaceFile(firstFileId);
          }, [importCreateReferenceWorkspaceFile]);

          const handleCreateReferenceEnvironmentChange = useCallback((nextEnvironmentId) => {
            createReferenceEnvironmentIdRef.current = String(nextEnvironmentId || "");
            if (typeof onEnvironmentChange === "function") {
              onEnvironmentChange(nextEnvironmentId);
            }
          }, [onEnvironmentChange]);

          const resetTemplateDraft = useCallback(() => {
            setTemplateDraft({
              title: "",
              description: "",
              prompt: "",
              imageUrl: "",
              aspectRatio: "4 / 3",
              defaultAspectRatio: "",
              defaultStyles: ["professional"],
            });
            setEditingTemplateId("");
            setTemplateFormError("");
            setCreateAspectRatioSelectorOpen(false);
            setCreateStylePickerOpen(false);
          }, []);

          const handleCreateTemplateSubmit = useCallback((event) => {
            event.preventDefault();
            const title = String(templateDraft.title || "").trim();
            const description = String(templateDraft.description || "").trim();
            const prompt = String(templateDraft.prompt || "").trim();
            if (!title) {
              setTemplateFormError("Add a template name.");
              return;
            }
            if (!description) {
              setTemplateFormError("Add a short description.");
              return;
            }
            if (!templateDraft.imageUrl) {
              setTemplateFormError("Upload a reference image.");
              return;
            }
            const id = editingTemplateId || ("custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8));
            const nextTemplate = {
              id,
              title,
              description,
              prompt: prompt || ("Create an image in the same style as the " + title + " template."),
              placeholder: title,
              defaultStyles: Array.isArray(templateDraft.defaultStyles) && templateDraft.defaultStyles.length
                ? templateDraft.defaultStyles
                : ["professional"],
              defaultAspectRatio: String(templateDraft.defaultAspectRatio || "").trim(),
              imageUrl: templateDraft.imageUrl,
              tone: "url('" + templateDraft.imageUrl + "') center / cover no-repeat",
              aspectRatio: templateDraft.aspectRatio || "4 / 3",
              size: "custom",
              isCustom: true,
            };
            setCustomTemplates((current) => {
              if (!editingTemplateId) {
                return [nextTemplate].concat(current);
              }
              return current.map((template) => template.id === editingTemplateId ? nextTemplate : template);
            });
            resetTemplateDraft();
            setSelectedTemplateId(id);
            setActiveImagineTab("my-templates");
          }, [editingTemplateId, resetTemplateDraft, setActiveImagineTab, templateDraft]);

          const handleStartCustomTemplate = useCallback(() => {
            resetTemplateDraft();
            setSelectedTemplateId("");
            setActiveImagineTab("create-template");
          }, [resetTemplateDraft, setActiveImagineTab]);

          const handleEditCustomTemplate = useCallback((template) => {
            if (!template?.isCustom) {
              return;
            }
            setEditingTemplateId(template.id);
            setTemplateDraft({
              title: String(template.title || ""),
              description: String(template.description || ""),
              prompt: String(template.prompt || ""),
              imageUrl: String(template.imageUrl || ""),
              aspectRatio: String(template.aspectRatio || "4 / 3"),
              defaultAspectRatio: String(template.defaultAspectRatio || ""),
              defaultStyles: Array.isArray(template.defaultStyles) && template.defaultStyles.length
                ? template.defaultStyles
                : ["professional"],
            });
            setTemplateFormError("");
            setCreateAspectRatioSelectorOpen(false);
            setCreateStylePickerOpen(false);
            setSelectedTemplateId("");
            setActiveImagineTab("create-template");
          }, [setActiveImagineTab]);

          const handleToggleFavouriteTemplate = useCallback((templateId) => {
            const normalizedTemplateId = String(templateId || "").trim();
            if (!normalizedTemplateId) {
              return;
            }
            setFavouriteTemplateIds((current) => {
              const currentIds = Array.isArray(current)
                ? current.map((id) => String(id || "").trim()).filter(Boolean)
                : [];
              return currentIds.includes(normalizedTemplateId)
                ? currentIds.filter((id) => id !== normalizedTemplateId)
                : currentIds.concat(normalizedTemplateId);
            });
          }, []);

          const handleDeleteCustomTemplate = useCallback((template) => {
            if (!template?.isCustom) {
              return;
            }
            const templateTitle = String(template.title || "this template").trim() || "this template";
            if (typeof window !== "undefined" && !window.confirm("Delete " + templateTitle + "?")) {
              return;
            }
            setCustomTemplates((current) => current.filter((item) => item.id !== template.id));
            setFavouriteTemplateIds((current) => (
              Array.isArray(current) ? current.filter((id) => id !== template.id) : []
            ));
            if (selectedTemplateId === template.id) {
              setSelectedTemplateId("");
            }
            if (editingTemplateId === template.id) {
              resetTemplateDraft();
            }
            setActiveImagineTab("my-templates");
          }, [editingTemplateId, resetTemplateDraft, selectedTemplateId, setActiveImagineTab]);

          const handleCreateAspectRatioSelect = useCallback((nextAspectRatio) => {
            updateTemplateDraft("defaultAspectRatio", String(nextAspectRatio || "").trim());
            setCreateAspectRatioSelectorOpen(false);
          }, [updateTemplateDraft]);

          const toggleCreateStyleOption = useCallback((styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setTemplateDraft((current) => {
              const currentStyles = Array.isArray(current.defaultStyles)
                ? current.defaultStyles.map((id) => String(id || "").trim()).filter(Boolean)
                : [];
              return {
                ...current,
                defaultStyles: currentStyles.includes(normalizedStyleId)
                  ? currentStyles.filter((id) => id !== normalizedStyleId)
                  : currentStyles.concat(normalizedStyleId),
              };
            });
            setTemplateFormError("");
          }, []);

          const removeCreateStyleOption = useCallback((styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setTemplateDraft((current) => ({
              ...current,
              defaultStyles: Array.isArray(current.defaultStyles)
                ? current.defaultStyles.filter((id) => id !== normalizedStyleId)
                : [],
            }));
            setTemplateFormError("");
          }, []);

          const renderCreateAspectRatioSelector = () => React.createElement("section", { className: "playground-imagine-template-aspect-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Default aspect ratio"),
            React.createElement("div", {
              ref: createAspectRatioSelectorRef,
              className: "playground-imagine-template-aspect-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-aspect-button" + (templateDraft.defaultAspectRatio ? "" : " is-empty"),
                onClick: () => setCreateAspectRatioSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedCreateAspectRatioOption.label),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              createAspectRatioSelectorOpen
                ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-aspect-menu" },
                    aspectRatioOptions.map((option) => React.createElement("button", {
                      key: "create-aspect:" + (option.value || "none"),
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (templateDraft.defaultAspectRatio === option.value ? " selected" : ""),
                      onClick: () => handleCreateAspectRatioSelect(option.value),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        templateDraft.defaultAspectRatio === option.value
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label),
                        React.createElement("span", null, option.description)
                      )
                    ))
                  )
                : null
            )
          );

          const renderCreateStylePicker = () => React.createElement("section", { ref: createStylePickerRef, className: "playground-imagine-template-style-picker" },
            React.createElement("div", { className: "playground-imagine-template-style-picker-header" },
              React.createElement("div", { className: "playground-imagine-template-section-title" }, "Default Styles"),
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-template-style-manage-button" + (createStylePickerOpen ? " is-active" : ""),
                onClick: () => setCreateStylePickerOpen((current) => !current),
              }, "Manage Styles")
            ),
            React.createElement("div", { className: "playground-imagine-template-style-pill-list" },
              selectedCreateStyleOptions.length
                ? selectedCreateStyleOptions.map((style) => {
                    const StyleIcon = style.Icon || Paintbrush;
                    return React.createElement("span", { key: "create-selected-style:" + style.id, className: "playground-imagine-template-style-pill is-selected" },
                      React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-style-pill-remove",
                        "aria-label": "Remove " + style.label,
                        onClick: (event) => {
                          event.stopPropagation();
                          removeCreateStyleOption(style.id);
                        },
                      }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.8 }))
                    );
                  })
                : React.createElement("span", { className: "playground-imagine-template-style-pill is-empty" },
                    React.createElement(Paintbrush, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                    React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, "No style selected")
                  )
            ),
            createStylePickerOpen
              ? React.createElement("div", { className: "playground-imagine-template-style-picker-options" },
                  styleOptions.map((style) => {
                    const StyleIcon = style.Icon || Paintbrush;
                    const isSelected = Array.isArray(templateDraft.defaultStyles) && templateDraft.defaultStyles.includes(style.id);
                    return React.createElement("button", {
                      key: "create-style:" + style.id,
                      type: "button",
                      className: "playground-imagine-template-style-pill" + (isSelected ? " is-selected" : ""),
                      onClick: () => toggleCreateStyleOption(style.id),
                    },
                      React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isSelected
                          ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                          : null
                      )
                    );
                  })
                )
              : null
          );

          const createMarkdownFormatActions = [
            { id: "bold", label: "Bold", Icon: Bold },
            { id: "italic", label: "Italic", Icon: Italic },
            { id: "underline", label: "Underline", Icon: Underline },
            { id: "list", label: "List", Icon: List },
          ];

          const renderCreateMarkdownSection = ({ title, field, textareaRef, placeholder }) =>
            React.createElement("section", { className: "playground-tasks-detail-description playground-imagine-create-markdown-section" + (field === "description" ? " is-description" : "") },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("h3", { className: "playground-tasks-detail-section-title" }, title),
                React.createElement("div", { className: "playground-tasks-detail-format-actions", "aria-label": title + " formatting" },
                  createMarkdownFormatActions.map((action) =>
                    React.createElement("button", {
                      key: title + ":" + action.id,
                      type: "button",
                      className: "playground-tasks-detail-format-button",
                      "aria-label": action.label,
                      onClick: () => handleTemplateMarkdownFormat(field, textareaRef, action.id),
                    }, React.createElement(action.Icon, { width: 14, height: 14, strokeWidth: 1.75 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing playground-imagine-create-markdown-editor" },
                React.createElement("textarea", {
                  ref: textareaRef,
                  className: "playground-tasks-detail-description-input is-editing playground-imagine-create-markdown-input",
                  value: templateDraft[field],
                  onChange: (event) => updateTemplateDraft(field, event.target.value),
                  placeholder,
                })
              )
            );

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine mode.",
            "The user is asking for image generation only. Do not produce video unless the user explicitly asks to leave Imagine mode.",
            "Use the available image generation skill when possible. Produce polished image prompts, create the image, and summarize the image outputs concisely.",
            selectedTemplate ? "The user selected this image template: " + selectedTemplate.title + ". Suggested direction: " + selectedTemplate.prompt : "",
          ].filter(Boolean).join("\\n");

          if (activeTab === "create-template") {
            return React.createElement("div", { className: "playground-imagine-page" },
              React.createElement("div", { className: "playground-imagine-shell" },
                React.createElement("div", { className: "playground-imagine-grid-scroll is-create-template" },
                  React.createElement("div", { className: "playground-imagine-create-page" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-imagine-create-back playground-imagine-template-back is-icon-only",
                      "aria-label": editingTemplateId ? "Back to template" : "Back to My Templates",
                      onClick: () => {
                        if (editingTemplateId) {
                          setSelectedTemplateId(editingTemplateId);
                          setActiveImagineTab("my-templates");
                        } else {
                          setActiveImagineTab("my-templates");
                        }
                      },
                    },
                      React.createElement(ArrowLeft, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, editingTemplateId ? "Back to template" : "Back to My Templates")
                    ),
                    React.createElement("form", {
                      className: "playground-imagine-template-form",
                      onSubmit: handleCreateTemplateSubmit,
                    },
                      React.createElement("div", { className: "playground-imagine-form-grid" },
                        React.createElement("div", { className: "playground-imagine-create-title-section" },
                          React.createElement("label", { className: "playground-imagine-template-section-title", htmlFor: "imagine-template-name" }, "Template name"),
                          React.createElement("input", {
                            id: "imagine-template-name",
                            className: "playground-imagine-create-title-input",
                            value: templateDraft.title,
                            onChange: (event) => updateTemplateDraft("title", event.target.value),
                            placeholder: "Brand launch visuals",
                          })
                        ),
                        renderCreateMarkdownSection({
                          title: "Description",
                          field: "description",
                          textareaRef: templateDescriptionTextareaRef,
                          placeholder: "A concise note about what this template is best for.",
                        }),
                        renderCreateAspectRatioSelector(),
                        renderCreateStylePicker(),
                        React.createElement("section", { className: "playground-imagine-template-section is-attachments playground-imagine-create-reference-section" },
                          React.createElement("div", { className: "playground-imagine-template-attachments-toolbar" },
                            React.createElement("div", { className: "playground-imagine-template-section-title" }, "Reference image"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-imagine-template-from-computer",
                              disabled: createReferenceImportState.status === "loading",
                              onClick: openCreateReferenceFileBrowser,
                            }, createReferenceImportState.status === "loading" ? "Importing..." : "From Computer")
                          ),
                          React.createElement("div", { className: "playground-imagine-template-attachments-surface playground-imagine-create-upload-surface" },
                            React.createElement("label", {
                              className: "playground-imagine-template-dropzone playground-imagine-create-upload-dropzone",
                              onDragOver: (event) => event.preventDefault(),
                              onDrop: (event) => {
                                event.preventDefault();
                                handleTemplateImageFile(event.dataTransfer?.files && event.dataTransfer.files[0]);
                              },
                            },
                              templateDraft.imageUrl
                                ? React.createElement("span", { className: "playground-imagine-create-upload-preview" },
                                    React.createElement("img", { src: templateDraft.imageUrl, alt: "" })
                                  )
                                : null,
                              React.createElement(ArrowUpFromLine, { width: 19, height: 19, strokeWidth: 1.8 }),
                              React.createElement("span", { className: "playground-imagine-template-dropzone-title" }, templateDraft.imageUrl ? "Replace reference image" : "Drag & drop image here"),
                              React.createElement("span", { className: "playground-imagine-template-dropzone-copy" }, "or click to browse"),
                              React.createElement("input", {
                                type: "file",
                                accept: "image/*",
                                onChange: (event) => handleTemplateImageFile(event.target.files && event.target.files[0]),
                              })
                            )
                          )
                        ),
                        renderCreateMarkdownSection({
                          title: "Default instruction",
                          field: "prompt",
                          textareaRef: templatePromptTextareaRef,
                          placeholder: "Create a polished image in this style with the user's requested changes.",
                        })
                      ),
                      React.createElement("div", { className: "playground-imagine-form-actions" },
                        templateFormError
                          ? React.createElement("span", { className: "playground-imagine-form-error" }, templateFormError)
                          : null,
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-secondary-button",
                          onClick: resetTemplateDraft,
                        }, React.createElement("span", null, "Reset")),
                        React.createElement("button", {
                          type: "submit",
                          className: "playground-imagine-primary-button",
                        },
                          React.createElement(editingTemplateId ? Check : Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, editingTemplateId ? "Save Template" : "Create Template")
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-imagine-create-file-browser-runner" },
                      React.createElement(RunnerChat, {
                        key: "imagine-create-reference-browser:" + String(createReferenceFileBrowserRequest?.token || "initial"),
                        className: "playground-imagine-create-file-browser-chat",
                        backendUrl,
                        apiKey,
                        fetchCustomSkills,
                        speechToTextUrl: speechToTextUrl || undefined,
                        requestHeaders,
                        appId: "runner-web-sdk-demo-imagine-create-reference",
                        inputMode: "computer-agents",
                        computerAgents: {
                          ...(computerAgents || {}),
                          workspace: {
                            ...((computerAgents && computerAgents.workspace) || {}),
                            onAttach: handleCreateReferenceWorkspaceAttach,
                          },
                        },
                        environments: Array.isArray(environments) ? environments : [],
                        agents: Array.isArray(agents) ? agents : [],
                        skills: Array.isArray(skills) ? skills : [],
                        skillDefaults,
                        environmentId: environmentId || undefined,
                        agentId: agentId || undefined,
                        maxAttachments: 1,
                        showUsageInStatus: false,
                        placeholder: "Select a reference image",
                        externalFileBrowserRequest: createReferenceFileBrowserRequest,
                        onThreadIdChange: () => {},
                        onEnvironmentChange: handleCreateReferenceEnvironmentChange,
                        onAgentChange,
                        onOpenPlansBudget,
                        onDocumentPreviewOpenChange: () => {},
                        onDeepResearchDetailOpenChange: () => {},
                      })
                    )
                  )
                )
              )
            );
          }

          if (selectedTemplate) {
            const detailTemplates = activeTab === "favourites"
              ? (filteredTemplates.some((template) => template.id === selectedTemplate.id)
                  ? filteredTemplates
                  : [selectedTemplate].concat(filteredTemplates))
              : selectedTemplate.isCustom
                ? normalizedCustomTemplates
                : templates;
            return React.createElement(PlaygroundImagineTemplatePage, {
              templates: detailTemplates,
              initialTemplateId: selectedTemplate.id,
              backendUrl,
              apiKey,
              speechToTextUrl,
              requestHeaders,
              computerAgents,
              environments,
              agents,
              skills,
              skillDefaults,
              environmentId,
              agentId,
              fetchCustomSkills,
              onThreadStarted,
              onAgentChange,
              onEnvironmentChange,
              onOpenPlansBudget,
              onEditTemplate: handleEditCustomTemplate,
              onDeleteTemplate: handleDeleteCustomTemplate,
              favouriteTemplateIds,
              onToggleFavouriteTemplate: handleToggleFavouriteTemplate,
              onBack: () => setSelectedTemplateId(""),
            });
          }

          return React.createElement("div", { className: "playground-imagine-page" },
            React.createElement("div", { className: "playground-imagine-shell" },
              React.createElement("div", { className: "playground-imagine-grid-scroll" },
                activeTab === "my-templates" && !normalizedCustomTemplates.length
                  ? React.createElement("div", { className: "playground-imagine-empty" },
                      React.createElement("img", {
                        className: "playground-imagine-empty-visual",
                        src: "/img/empty-state/no-agent-usage.avif",
                        alt: "",
                        draggable: false,
                      }),
                      React.createElement("h2", { className: "playground-imagine-empty-title" }, "Create your first image template"),
                      React.createElement("p", { className: "playground-imagine-empty-copy" }, "Upload a reference image, describe the reusable style, and use it whenever you want agents to generate new images in that direction."),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-primary-button",
                        onClick: handleStartCustomTemplate,
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Create first template")
                      )
                    )
                  : activeTab === "favourites" && !filteredTemplates.length
                    ? React.createElement("div", { className: "playground-imagine-empty" },
                        React.createElement("img", {
                          className: "playground-imagine-empty-visual",
                          src: "/img/empty-state/no-users-yet.avif",
                          alt: "",
                          draggable: false,
                        }),
                        React.createElement("h2", { className: "playground-imagine-empty-title" }, "No favourites yet"),
                        React.createElement("p", { className: "playground-imagine-empty-copy" }, "Save templates you like and come back to them here."),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-primary-button",
                          onClick: () => setActiveImagineTab("explore"),
                        },
                          React.createElement(Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Explore templates")
                        )
                      )
                  : filteredTemplates.length
                    ? React.createElement("div", { className: "playground-imagine-grid" },
                        filteredTemplates.map((template) => {
                          return React.createElement("button", {
                            key: template.id,
                            type: "button",
                            className: [
                              "playground-imagine-template",
                              template.size === "large" ? "is-large" : "",
                              template.size === "wide" ? "is-wide" : "",
                              selectedTemplateId === template.id ? "is-selected" : "",
                            ].filter(Boolean).join(" "),
                            style: {
                              "--imagine-template-bg": template.tone,
                              "--imagine-template-aspect-ratio": template.aspectRatio || "4 / 3",
                            },
                            onClick: () => setSelectedTemplateId(template.id),
                          },
                            React.createElement("span", { className: "playground-imagine-template-copy" },
                              React.createElement("span", { className: "playground-imagine-template-title" }, template.title),
                              React.createElement("span", { className: "playground-imagine-template-description" }, template.description)
                            )
                          );
                        })
                      )
                    : React.createElement("div", { className: "playground-imagine-empty" }, "No image templates found.")
              )
            ),
            activeTab === "explore"
              ? React.createElement("div", { className: "playground-imagine-composer-wrap" },
                  selectedTemplate
                    ? React.createElement("div", { className: "playground-imagine-selected-preset" },
                        React.createElement(Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Template: ", React.createElement("strong", null, selectedTemplate.title)),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-selected-preset-clear",
                          onClick: () => setSelectedTemplateId(""),
                          "aria-label": "Clear selected template",
                        }, React.createElement(X, { strokeWidth: 2 }))
                      )
                    : null,
                  React.createElement("div", { className: "playground-imagine-composer-shell" },
                    React.createElement(RunnerChat, {
                      key: "imagine-runner:" + (selectedTemplateId || "__none__"),
                      className: "playground-imagine-runner",
                      backendUrl,
                      apiKey,
                      fetchCustomSkills,
                      speechToTextUrl: speechToTextUrl || undefined,
                      requestHeaders,
                      appId: "runner-web-sdk-demo",
                      inputMode: "computer-agents",
                      computerAgents: computerAgents || undefined,
                      environments: Array.isArray(environments) ? environments : [],
                      agents: Array.isArray(agents) ? agents : [],
                      skills: Array.isArray(skills) ? skills : [],
                      skillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: selectedTemplate ? (selectedTemplate.placeholder || selectedTemplate.title) : "Describe an image",
                      hiddenSystemPrompt,
                      onThreadIdChange: () => {},
                      onExternalRunRequestCreate: (request) => {
                        const normalizedThreadId = String(request?.threadId || "").trim();
                        if (!normalizedThreadId || typeof onThreadStarted !== "function") {
                          return false;
                        }
                        onThreadStarted(normalizedThreadId, {
                          taskRunRequest: request,
                        });
                        const titlePrompt = String(request?.displayPrompt || request?.prompt || "").trim();
                        if (titlePrompt) {
                          void generateImagineThreadTitle(normalizedThreadId, titlePrompt)
                            .then((generatedTitle) => {
                              if (generatedTitle && typeof onThreadTitleGenerated === "function") {
                                onThreadTitleGenerated(normalizedThreadId, generatedTitle);
                              }
                            })
                            .catch((error) => {
                              console.warn("[PlaygroundImaginePage] Failed to generate thread title", error);
                            });
                        }
                        return true;
                      },
                      onRunFinish: (_result, threadId) => {
                        const normalizedThreadId = String(threadId || "").trim();
                        if (normalizedThreadId && typeof onThreadStarted === "function") {
                          onThreadStarted(normalizedThreadId);
                        }
                      },
                      onAgentChange,
                      onEnvironmentChange,
                      onOpenPlansBudget,
                      onDocumentPreviewOpenChange: () => {},
                      onDeepResearchDetailOpenChange: () => {},
                    })
                  )
                )
              : null
          );
        }
`;
