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

      .playground-imagine-media-switch {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        height: 28px;
        padding: 1px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 999px;
        background: transparent;
        overflow: hidden;
      }

      .playground-imagine-media-switch::before {
        content: none !important;
        display: none !important;
      }

      .playground-imagine-media-switch-button {
        position: relative;
        z-index: 1;
        height: 24px;
        min-width: 46px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        padding: 0 10px;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-media-switch-button.is-active {
        background: rgba(255, 255, 255, 0.2) !important;
        color: #fff;
      }

      .tb-runner-chat .tb-composer-leading-control .playground-imagine-media-switch {
        margin-left: -10px !important;
        margin-right: 0 !important;
      }

      .playground-imagine-model-selector .tb-inline-selector {
        max-width: 190px;
        min-height: 32px;
      }

      .playground-imagine-model-selector-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-model-menu {
        width: 300px !important;
        -webkit-backdrop-filter: blur(5px) !important;
        backdrop-filter: blur(5px) !important;
      }

      .playground-imagine-model-menu-body {
        flex: 1;
        min-height: 0;
        max-height: 168px;
        overflow-y: auto;
        padding-top: 4px;
        padding-bottom: 4px;
        border-top: 0;
      }

      .playground-imagine-model-menu .tb-popup-row {
        align-items: center;
        gap: 10px;
        min-height: 42px;
      }

      .playground-imagine-model-provider-icon-shell {
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.8);
      }

      .playground-imagine-model-provider-icon-shell .playground-agents-model-provider-icon {
        width: 16px;
        height: 16px;
      }

      .playground-imagine-model-selector-icon {
        width: 16px;
        height: 16px;
      }

      .playground-imagine-model-option-copy {
        min-width: 0;
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        text-align: left;
      }

      .playground-imagine-model-option-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        z-index: 1;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.58));
        opacity: 0;
        transition: opacity 180ms ease;
      }

      .playground-imagine-template-media {
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        display: block;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-imagine-template-media-image,
      .playground-imagine-template-video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        pointer-events: none;
      }

      .playground-imagine-template-media-layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .playground-imagine-template-media-transition {
        position: absolute;
        inset: 0;
        display: block;
      }

      .playground-imagine-template-media-layer.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateAssetIn 240ms ease both;
      }

      .playground-imagine-template-media-layer.is-static {
        z-index: 2;
      }

      .playground-imagine-template-media-layer.is-previous {
        z-index: 1;
        animation: playgroundImagineTemplateAssetOut 240ms ease both;
      }

      @keyframes playgroundImagineTemplateAssetIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * 112%));
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateAssetOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }

        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * -112%));
        }
      }

      .playground-imagine-template-video-placeholder {
        width: 100%;
        height: 100%;
        background: var(--imagine-template-bg, rgba(255, 255, 255, 0.06));
      }

      .playground-imagine-template-media-controls {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 4;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        pointer-events: none;
      }

      .playground-imagine-template-media-dots,
      .playground-imagine-template-media-arrows {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        pointer-events: auto;
      }

      .playground-imagine-template-media-dot {
        width: 5px;
        height: 5px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.42);
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-media-dot.is-active {
        background: rgba(255, 255, 255, 0.92);
      }

      .playground-imagine-template-media-arrow {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.46);
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
      }

      .playground-imagine-template-media-arrow:hover,
      .playground-imagine-template-media-dot:hover {
        background: rgba(255, 255, 255, 0.18);
      }

      .playground-imagine-template.is-multi-asset .playground-imagine-template-copy {
        bottom: 28px;
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
        position: relative;
        z-index: 2;
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

      .playground-imagine-create-reference-section .playground-tasks-attachments {
        padding-top: 0;
      }

      .playground-imagine-create-reference-section .playground-tasks-attachments-surface.tb-runner-chat,
      .playground-imagine-create-reference-section .playground-tasks-attachments-surface.tb-runner-chat .tb-popup-dropzone {
        min-height: 166px;
      }

      .playground-imagine-create-reference-section .playground-tasks-attachments-dropzone.is-filled {
        min-height: 166px;
      }

      .playground-imagine-create-reference-section .runner-attachment-image-button {
        border: 0;
        padding: 0;
        background: transparent;
        cursor: default;
      }

      .playground-imagine-create-reference-section .runner-attachment-file-button {
        cursor: default;
      }

      .playground-imagine-create-reference-section .runner-attachment-file-icon-slot svg {
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.72);
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
        function normalizePlaygroundImagineTemplateAssets(template) {
          const normalizedAssets = [];
          const pushAsset = (asset) => {
            if (!asset) {
              return;
            }
            const url = String(asset.url || asset.imageUrl || asset.videoUrl || "").trim();
            if (!url) {
              return;
            }
            const explicitType = String(asset.type || asset.mediaType || "").toLowerCase();
            const type = explicitType === "video" || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url) ? "video" : "image";
            normalizedAssets.push({
              ...asset,
              url,
              type,
              title: String(asset.title || template?.title || "").trim(),
              aspectRatio: String(asset.aspectRatio || template?.aspectRatio || "").trim(),
            });
          };
          (Array.isArray(template?.assets) ? template.assets : []).forEach(pushAsset);
          (Array.isArray(template?.mediaItems) ? template.mediaItems : []).forEach(pushAsset);
          if (!normalizedAssets.length) {
            const imageUrl = String(template?.imageUrl || "").trim();
            const videoUrl = String(template?.videoUrl || "").trim();
            if (imageUrl) {
              pushAsset({ type: "image", url: imageUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            } else if (videoUrl) {
              pushAsset({ type: "video", url: videoUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            }
          }
          return normalizedAssets;
        }

        function getPlaygroundImagineModelProviderIcon(model) {
          const normalizedProvider = String(model?.provider || model?.providerType || "").trim().toLowerCase();
          const normalizedModelId = String(model?.id || model?.baseModelId || "").trim().toLowerCase();
          const haystack = [normalizedProvider, normalizedModelId].filter(Boolean).join(" ");
          if (haystack.includes("bytedance") || haystack.includes("seedance")) {
            return { src: "/img/05-model-provider-icons/bytedance.svg", alt: "ByteDance", className: "" };
          }
          if (haystack.includes("xai") || haystack.includes("x.ai") || haystack.includes("grok")) {
            return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "" };
          }
          if (haystack.includes("google") || haystack.includes("gemini")) {
            return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" };
          }
          if (haystack.includes("openai") || haystack.includes("open-ai") || normalizedModelId.startsWith("gpt-")) {
            return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
          }
          return null;
        }

        function createPlaygroundImagineComposerPopupSourceId(prefix) {
          return String(prefix || "imagine-popup") + ":" + Math.random().toString(36).slice(2);
        }

        function emitPlaygroundImagineComposerPopupOpen(sourceId) {
          if (typeof window === "undefined") {
            return;
          }
          window.dispatchEvent(new CustomEvent("tb-runner-composer-popup-open", {
            detail: { sourceId },
          }));
        }

        function getPlaygroundImagineComposerPopupEventSource(event) {
          return event instanceof CustomEvent && typeof event.detail?.sourceId === "string"
            ? event.detail.sourceId
            : "";
        }

        function usePlaygroundImaginePopupAnimation(open) {
          const [rendered, setRendered] = useState(open);
          const [phase, setPhase] = useState(open ? "enter" : "idle");

          useEffect(() => {
            if (open) {
              setRendered(true);
              setPhase("enter");
              return undefined;
            }
            if (!rendered) {
              setPhase("idle");
              return undefined;
            }
            setPhase("exit");
            if (typeof window === "undefined") {
              setRendered(false);
              setPhase("idle");
              return undefined;
            }
            const timeoutId = window.setTimeout(() => {
              setRendered(false);
              setPhase("idle");
            }, 180);
            return () => window.clearTimeout(timeoutId);
          }, [open, rendered]);

          return {
            shouldRender: rendered,
            className: phase === "exit" ? "tb-popup-menu-animate-up-out" : "tb-popup-menu-animate-up-in",
          };
        }

        function usePlaygroundImagineAnchoredPopupStyle({
          open,
          anchorRef,
          popupRef,
          gap = 8,
          viewportPadding = 8,
        }) {
          const [style, setStyle] = useState(null);

          useLayoutEffect(() => {
            if (!open) {
              setStyle(null);
              return undefined;
            }

            if (typeof window === "undefined") {
              return undefined;
            }

            let frameId = 0;
            const settleFrameIds = [];
            const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => scheduleUpdate()) : null;
            let observedElements = new Set();

            const observeCurrentElements = (...elements) => {
              if (!resizeObserver) {
                return;
              }

              const nextElements = new Set(elements.filter(Boolean));
              observedElements.forEach((element) => {
                if (!nextElements.has(element)) {
                  resizeObserver.unobserve(element);
                }
              });
              nextElements.forEach((element) => {
                if (!observedElements.has(element)) {
                  resizeObserver.observe(element);
                }
              });
              observedElements = nextElements;
            };

            const update = () => {
              const anchor = anchorRef.current;
              if (!anchor) {
                setStyle(null);
                return;
              }

              const popup = popupRef.current;
              const anchorRect = anchor.getBoundingClientRect();
              const popupWidth = popup?.offsetWidth || 300;
              const popupHeight = popup?.offsetHeight || 0;
              const visualViewport = window.visualViewport;
              const viewportWidth = visualViewport?.width || window.innerWidth;
              const viewportHeight = visualViewport?.height || window.innerHeight;
              const viewportLeft = visualViewport?.offsetLeft || 0;
              const viewportTop = visualViewport?.offsetTop || 0;
              const layoutViewportHeight = window.innerHeight;
              const viewportBottom = viewportTop + viewportHeight;
              const maxLeft = viewportLeft + viewportWidth - popupWidth - viewportPadding;
              const maxBottom = Math.max(viewportPadding, layoutViewportHeight - viewportBottom + viewportPadding);
              const bottomEdge = anchorRect.top - gap;
              let bottom = layoutViewportHeight - bottomEdge;
              const unclampedTop = bottomEdge - popupHeight;

              if (unclampedTop < viewportTop + viewportPadding) {
                bottom = Math.min(bottom, layoutViewportHeight - (viewportTop + viewportPadding + popupHeight));
              }

              const clampedLeft = Math.min(
                Math.max(anchorRect.left, viewportLeft + viewportPadding),
                Math.max(viewportLeft + viewportPadding, maxLeft)
              );

              observeCurrentElements(anchor, popup || null);
              setStyle({
                left: Math.round(clampedLeft) + "px",
                top: "auto",
                bottom: Math.max(maxBottom, Math.round(bottom)) + "px",
                visibility: "visible",
              });
            };

            const scheduleUpdate = () => {
              window.cancelAnimationFrame(frameId);
              frameId = window.requestAnimationFrame(update);
            };

            update();
            const scheduleSettledUpdate = (remainingFrames) => {
              const settledFrameId = window.requestAnimationFrame(() => {
                scheduleUpdate();
                if (remainingFrames > 1) {
                  scheduleSettledUpdate(remainingFrames - 1);
                }
              });
              settleFrameIds.push(settledFrameId);
            };
            scheduleSettledUpdate(4);

            window.addEventListener("resize", scheduleUpdate);
            window.addEventListener("scroll", scheduleUpdate, true);
            window.visualViewport?.addEventListener("resize", scheduleUpdate);
            window.visualViewport?.addEventListener("scroll", scheduleUpdate);
            observeCurrentElements(anchorRef.current, popupRef.current);

            return () => {
              window.cancelAnimationFrame(frameId);
              settleFrameIds.forEach((id) => window.cancelAnimationFrame(id));
              window.removeEventListener("resize", scheduleUpdate);
              window.removeEventListener("scroll", scheduleUpdate, true);
              window.visualViewport?.removeEventListener("resize", scheduleUpdate);
              window.visualViewport?.removeEventListener("scroll", scheduleUpdate);
              resizeObserver?.disconnect();
            };
          }, [anchorRef, gap, open, popupRef, viewportPadding]);

          return style;
        }

        function renderPlaygroundImaginePopupPortal(content, style) {
          if (!content || typeof document === "undefined") {
            return null;
          }

          const resolvedStyle = style || {
            left: "-9999px",
            top: "0px",
            bottom: "auto",
            visibility: "hidden",
          };

          return createPortal(
            React.createElement("div", { className: "tb-composer-popup-portal-root", style: resolvedStyle },
              React.createElement("div", { className: "tb-runner-chat tb-composer-popup-portal-scope" }, content)
            ),
            document.body
          );
        }

        function PlaygroundImagineTemplatePreviewMedia({ template }) {
          const mediaRef = useRef(null);
          const lastAssetRef = useRef(null);
          const transitionTimeoutRef = useRef(null);
          const [shouldLoad, setShouldLoad] = useState(false);
          const [transitionState, setTransitionState] = useState({
            previousAsset: null,
            direction: 1,
            token: 0,
          });
          const assets = useMemo(() => normalizePlaygroundImagineTemplateAssets(template), [template]);
          const activeIndex = Math.max(0, Number(template?.activeAssetIndex || 0) || 0);
          const activeAsset = assets[activeIndex] || assets[0] || null;
          const isVideo = activeAsset?.type === "video";
          const videoUrl = isVideo ? String(activeAsset?.url || "").trim() : "";

          useEffect(() => {
            if (!isVideo) {
              return undefined;
            }
            const node = mediaRef.current;
            if (!node || typeof IntersectionObserver === "undefined") {
              setShouldLoad(true);
              return undefined;
            }
            const observer = new IntersectionObserver((entries) => {
              if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
                setShouldLoad(true);
                observer.disconnect();
              }
            }, { root: null, rootMargin: "420px 0px", threshold: 0.01 });
            observer.observe(node);
            return () => observer.disconnect();
          }, [isVideo, videoUrl]);

          useEffect(() => {
            const currentKey = activeAsset ? String(activeAsset.type || "") + ":" + String(activeAsset.url || "") : "";
            const previous = lastAssetRef.current;
            if (previous?.key && currentKey && previous.key !== currentKey) {
              const direction = Number(template?.assetDirection || 1) < 0 ? -1 : 1;
              if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
              }
              setTransitionState({
                previousAsset: previous.asset,
                direction,
                token: Date.now(),
              });
              transitionTimeoutRef.current = setTimeout(() => {
                setTransitionState((current) => ({
                  ...current,
                  previousAsset: null,
                }));
              }, 280);
            }
            lastAssetRef.current = activeAsset ? { key: currentKey, asset: activeAsset } : null;
            return undefined;
          }, [activeAsset?.type, activeAsset?.url, template?.assetDirection]);

          useEffect(() => {
            return () => {
              if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
              }
            };
          }, []);

          if (!activeAsset) {
            return null;
          }

          const renderAsset = (asset, className, key) => {
            const assetIsVideo = asset?.type === "video";
            const assetUrl = String(asset?.url || "").trim();
            return React.createElement("span", { key, className: "playground-imagine-template-media-layer " + className },
              assetIsVideo
                ? (
                    shouldLoad
                      ? React.createElement("video", {
                          className: "playground-imagine-template-video",
                          src: assetUrl,
                          muted: true,
                          loop: true,
                          playsInline: true,
                          autoPlay: true,
                          preload: "metadata",
                          onTimeUpdate: (event) => {
                            const video = event.currentTarget;
                            if (video.currentTime > 4) {
                              video.currentTime = 0;
                              void video.play?.();
                            }
                          },
                        })
                      : React.createElement("span", { className: "playground-imagine-template-video-placeholder" })
                  )
                : React.createElement("img", {
                    className: "playground-imagine-template-media-image",
                    src: assetUrl,
                    alt: "",
                    draggable: false,
                    loading: "lazy",
                  })
            );
          };

          return React.createElement("span", { ref: mediaRef, className: "playground-imagine-template-media", "aria-hidden": "true" },
            React.createElement("span", {
              className: "playground-imagine-template-media-transition",
              style: { "--imagine-template-asset-direction": transitionState.direction },
            },
              transitionState.previousAsset
                ? renderAsset(transitionState.previousAsset, "is-previous", "previous:" + transitionState.token)
                : null,
              renderAsset(
                activeAsset,
                transitionState.previousAsset ? "is-current" : "is-static",
                "current:" + String(activeAsset.url || "") + ":" + transitionState.token
              )
            )
          );
        }

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
          canGenerateVideo = true,
          onUpgradeToIndividual,
          activeView,
          mediaMode,
          filterMode: externalFilterMode,
          sortMode: externalSortMode,
          focusedTemplateId = "",
          focusedTemplateSelectionToken = "",
          onActiveViewChange,
          onMediaModeChange,
          isAgentSelectionBlocked,
          onBlockedAgentSelect,
        }) {
          const [localActiveTab, setLocalActiveTab] = useState("explore");
          const [searchQuery, setSearchQuery] = useState("");
          const [selectedTemplateId, setSelectedTemplateId] = useState("");
          const [templateAssetIndexes, setTemplateAssetIndexes] = useState({});
          const [templateAssetDirections, setTemplateAssetDirections] = useState({});
          const lastAppliedFocusedTemplateSelectionTokenRef = useRef("");
          const customTemplateStorageKey = "runner_demo_imagine_custom_templates_v1";
          const favouriteTemplateStorageKey = "runner_demo_imagine_favourite_template_ids_v1";
          const [customTemplates, setCustomTemplates] = useState(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return [];
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(customTemplateStorageKey) || "[]");
              return Array.isArray(parsed)
                ? parsed.filter((template) => template && template.id && (template.imageUrl || template.videoUrl || (Array.isArray(template.assets) && template.assets.length)))
                : [];
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
          const imagineModelStorageKey = "runner_demo_imagine_model_settings_v1";
          const imagineImageModelOptions = useMemo(() => [
            {
              id: "gpt-image-2",
              label: "GPT Image 2",
              provider: "OpenAI",
              description: "Highest-fidelity OpenAI image generation and editing.",
            },
            {
              id: "gemini-3.1-flash-image-preview",
              label: "Gemini 3.1 Flash Image",
              provider: "Google DeepMind",
              description: "Fast multimodal image generation and editing preview.",
            },
          ], []);
          const imagineVideoModelOptions = useMemo(() => [
            {
              id: "seedance-2.0-fast",
              label: "Seedance 2.0 Fast",
              provider: "ByteDance",
              description: "Fast default video drafts and short motion clips.",
            },
            {
              id: "seedance-2.0",
              label: "Seedance 2.0",
              provider: "ByteDance",
              description: "Higher-quality Seedance video generation.",
            },
            {
              id: "grok-imagine-video",
              label: "Grok Imagine Video",
              provider: "xAI",
              description: "Alternative video model for imaginative motion.",
            },
          ], []);
          const normalizeImagineModelId = (mode, modelId) => {
            const options = String(mode || "") === "video" ? imagineVideoModelOptions : imagineImageModelOptions;
            const normalizedModelId = String(modelId || "").trim();
            return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
          };
          const readStoredImagineModelSettings = () => {
            if (typeof window === "undefined" || !window.localStorage) {
              return {};
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(imagineModelStorageKey) || "{}");
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch (_error) {
              return {};
            }
          };
          const storedImagineModelSettings = readStoredImagineModelSettings();
          const [selectedImagineImageModelId, setSelectedImagineImageModelId] = useState(() =>
            normalizeImagineModelId("image", storedImagineModelSettings.image || skillDefaults?.imageGeneration?.model || "gpt-image-2")
          );
          const [selectedImagineVideoModelId, setSelectedImagineVideoModelId] = useState(() =>
            normalizeImagineModelId("video", storedImagineModelSettings.video || skillDefaults?.videoGeneration?.model || "seedance-2.0-fast")
          );
          const [imagineModelSelectorOpen, setImagineModelSelectorOpen] = useState(false);
          const [videoUpgradeModalOpen, setVideoUpgradeModalOpen] = useState(false);
          const [videoUpgradeCheckoutLoading, setVideoUpgradeCheckoutLoading] = useState(false);
          const imagineModelSelectorRef = useRef(null);
          const imagineModelSelectorButtonRef = useRef(null);
          const imagineModelMenuRef = useRef(null);
          const imagineModelPopupSourceIdRef = useRef(createPlaygroundImagineComposerPopupSourceId("imagine-model"));
          const imagineModelSelectorAnimation = usePlaygroundImaginePopupAnimation(imagineModelSelectorOpen);
          const imagineModelMenuStyle = usePlaygroundImagineAnchoredPopupStyle({
            open: imagineModelSelectorAnimation.shouldRender,
            anchorRef: imagineModelSelectorButtonRef,
            popupRef: imagineModelMenuRef,
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
            assets: [],
            imageUrl: "",
            videoUrl: "",
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
          const canUseVideoGeneration = canGenerateVideo !== false;
          const rawActiveMediaMode = String(mediaMode || "").toLowerCase() === "video" ? "video" : "image";
          const activeMediaMode = rawActiveMediaMode === "video" && !canUseVideoGeneration ? "image" : rawActiveMediaMode;
          const activeImagineModelOptions = activeMediaMode === "video" ? imagineVideoModelOptions : imagineImageModelOptions;
          const selectedImagineModelId = activeMediaMode === "video" ? selectedImagineVideoModelId : selectedImagineImageModelId;
          const selectedImagineModel = activeImagineModelOptions.find((option) => option.id === selectedImagineModelId) || activeImagineModelOptions[0];
          const selectedImagineImageModel = imagineImageModelOptions.find((option) => option.id === selectedImagineImageModelId) || imagineImageModelOptions[0];
          const selectedImagineVideoModel = imagineVideoModelOptions.find((option) => option.id === selectedImagineVideoModelId) || imagineVideoModelOptions[0];
          const imagineSkillDefaults = useMemo(() => {
            const source = skillDefaults && typeof skillDefaults === "object" ? skillDefaults : {};
            const imageGeneration = source.imageGeneration && typeof source.imageGeneration === "object" ? source.imageGeneration : {};
            const videoGeneration = source.videoGeneration && typeof source.videoGeneration === "object" ? source.videoGeneration : {};
            return {
              ...source,
              imageGeneration: {
                ...imageGeneration,
                model: selectedImagineImageModel.id,
              },
              videoGeneration: {
                ...videoGeneration,
                model: selectedImagineVideoModel.id,
              },
            };
          }, [selectedImagineImageModel.id, selectedImagineVideoModel.id, skillDefaults]);
          const imagineRunnerSkills = useMemo(() => {
            const sourceSkills = Array.isArray(skills) ? skills : [];
            return sourceSkills.map((skill) => {
              const normalizedSkillId = String(skill?.id || skill?.name || "").trim().toLowerCase();
              if (
                normalizedSkillId === "video_generation"
                || normalizedSkillId === "video-generation"
                || normalizedSkillId === "videogeneration"
                || normalizedSkillId.includes("video-generation")
              ) {
                return { ...skill, enabled: canUseVideoGeneration };
              }
              return skill;
            });
          }, [skills, canUseVideoGeneration]);
          useEffect(() => {
            if (!canUseVideoGeneration && rawActiveMediaMode === "video" && typeof onMediaModeChange === "function") {
              onMediaModeChange("image");
            }
          }, [canUseVideoGeneration, rawActiveMediaMode, onMediaModeChange]);
          const setActiveMediaMode = useCallback((nextMode) => {
            const normalizedNextMode = String(nextMode || "").toLowerCase() === "video" ? "video" : "image";
            if (normalizedNextMode === "video" && !canUseVideoGeneration) {
              setVideoUpgradeModalOpen(true);
              return;
            }
            if (typeof onMediaModeChange === "function") {
              onMediaModeChange(normalizedNextMode);
            }
          }, [canUseVideoGeneration, onMediaModeChange]);
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
          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              window.localStorage.setItem(imagineModelStorageKey, JSON.stringify({
                image: selectedImagineImageModel.id,
                video: selectedImagineVideoModel.id,
              }));
            } catch (_error) {}
          }, [selectedImagineImageModel.id, selectedImagineVideoModel.id]);
          useEffect(() => {
            if (!imagineModelSelectorOpen || typeof document === "undefined") {
              return;
            }
            const handlePointerDown = (event) => {
              const target = event.target;
              if (imagineModelSelectorRef.current && target && imagineModelSelectorRef.current.contains(target)) {
                return;
              }
              if (imagineModelMenuRef.current && target && imagineModelMenuRef.current.contains(target)) {
                return;
              }
              setImagineModelSelectorOpen(false);
            };
            const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                setImagineModelSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            document.addEventListener("touchstart", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
              document.removeEventListener("touchstart", handlePointerDown);
              document.removeEventListener("keydown", handleKeyDown);
            };
          }, [imagineModelSelectorOpen]);
          useEffect(() => {
            if (typeof window === "undefined") {
              return undefined;
            }
            const handleComposerPopupOpen = (event) => {
              const sourceId = getPlaygroundImagineComposerPopupEventSource(event);
              if (!sourceId || sourceId === imagineModelPopupSourceIdRef.current) {
                return;
              }
              setImagineModelSelectorOpen(false);
            };
            window.addEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
            return () => window.removeEventListener("tb-runner-composer-popup-open", handleComposerPopupOpen);
          }, []);
          useEffect(() => {
            setImagineModelSelectorOpen(false);
          }, [activeMediaMode]);
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
              id: "astra-ads",
              title: "AstraFlow ads",
              description: "Sci-fi SaaS launch ads with cinematic product mood and bold conversion copy.",
              prompt: "Create a sci-fi SaaS early-access advertisement with an astronaut product hero, luminous platform blocks, bold launch typography, premium dark-blue lighting, concise offer copy, and a polished conversion-focused call to action.",
              placeholder: "Create an AstraFlow ad",
              defaultStyles: ["product", "premium", "cinematic", "bold"],
              Icon: Sparkles,
              imageUrl: "/img/imagine/astra-ad.webp",
              tone: "url('/img/imagine/astra-ad.webp') center / cover no-repeat",
              aspectRatio: "4 / 5",
              size: "large",
            },
            {
              id: "multi-asset-campaign-set",
              title: "Pitch deck",
              description: "Modern multi-slide pitch decks with sharp narrative, data, and visual hierarchy.",
              prompt: "Create a modern pitch deck that follows the attached slide references: crisp startup narrative, strong page hierarchy, premium black/white/blue visual language, investor-ready copy, and a coherent slide system across every generated asset.",
              placeholder: "Create a pitch deck",
              defaultStyles: ["professional", "minimal", "data-driven", "premium"],
              Icon: LayoutGrid,
              imageUrl: "/img/imagine/pitch-deck/01.webp",
              tone: "url('/img/imagine/pitch-deck/01.webp') center / cover no-repeat",
              aspectRatio: "16 / 9",
              assets: [
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck/01.webp",
                  title: "Problem slide reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck/02.webp",
                  title: "Platform overview reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck/03.webp",
                  title: "Market validation reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck/04.webp",
                  title: "Use case reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck/05.webp",
                  title: "Business model reference",
                  aspectRatio: "16 / 9",
                },
              ],
            },
            {
              id: "modern-pitch-deck",
              title: "Modern pitch deck",
              description: "Elegant investor and report slides with editorial type, clean metrics, and operational storytelling.",
              prompt: "Create a modern pitch deck that follows the attached slide references: elegant editorial typography, clean white space, soft green analytical panels, polished metrics, strong platform impact storytelling, and a cohesive report-ready slide system across every generated asset.",
              placeholder: "Create a modern deck",
              defaultStyles: ["professional", "minimal", "data-driven", "premium"],
              Icon: LayoutGrid,
              imageUrl: "/img/imagine/pitch-deck-modern/01.webp",
              tone: "url('/img/imagine/pitch-deck-modern/01.webp') center / cover no-repeat",
              aspectRatio: "16 / 9",
              assets: [
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-modern/01.webp",
                  title: "Platform impact slide reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-modern/02.webp",
                  title: "Efficiency metrics slide reference",
                  aspectRatio: "16 / 9",
                },
              ],
            },
            {
              id: "classic-pitch-deck",
              title: "Classic pitch deck",
              description: "Clean investor slides with timeless layouts, structured storytelling, and polished presentation hierarchy.",
              prompt: "Create a classic investor pitch deck that follows the attached slide references: clean presentation structure, confident business storytelling, strong section hierarchy, refined typography, crisp visuals, and a cohesive slide system across every generated asset.",
              placeholder: "Create a classic pitch deck",
              defaultStyles: ["professional", "minimal", "data-driven", "premium"],
              Icon: LayoutGrid,
              imageUrl: "/img/imagine/pitch-deck-classic/01.webp",
              tone: "url('/img/imagine/pitch-deck-classic/01.webp') center / cover no-repeat",
              aspectRatio: "16 / 9",
              assets: [
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-classic/01.webp",
                  title: "Title slide reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-classic/02.webp",
                  title: "Problem and opportunity reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-classic/03.webp",
                  title: "Solution and product reference",
                  aspectRatio: "16 / 9",
                },
                {
                  type: "image",
                  url: "/img/imagine/pitch-deck-classic/04.webp",
                  title: "Business and traction reference",
                  aspectRatio: "16 / 9",
                },
              ],
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
              id: "video-product-launch",
              title: "Product launch video",
              description: "Short cinematic product videos with motion, pacing, and campaign polish.",
              prompt: "Create a short cinematic product launch video with premium camera movement, crisp lighting, restrained motion graphics, and a clear brand reveal.",
              placeholder: "Create a product launch video",
              defaultStyles: ["product", "premium", "cinematic", "professional"],
              Icon: Film,
              imageUrl: "/img/imagine/product-ad.webp",
              tone: "url('/img/imagine/product-ad.webp') center / cover no-repeat",
              aspectRatio: "16 / 9",
              size: "wide",
              mediaType: "video",
            },
            {
              id: "akita-space-video",
              title: "Akita in space",
              description: "A playful Akita drifting through deep space with cinematic motion.",
              prompt: "Create a playful cinematic video of an Akita floating weightlessly through deep space with gentle camera motion, soft starlight, and a polished sci-fi finish.",
              placeholder: "Create an Akita space video",
              defaultStyles: ["cinematic", "editorial", "premium", "exploratory"],
              Icon: Film,
              videoUrl: "/img/imagine/akita.mp4",
              tone: "linear-gradient(135deg, rgba(5, 9, 20, 0.95), rgba(20, 31, 58, 0.72))",
              aspectRatio: "16 / 9",
              size: "wide",
              mediaType: "video",
            },
            {
              id: "cell-division-video",
              title: "Cell division",
              description: "Close-up microscopic motion for biology, science, and research visuals.",
              prompt: "Create a close-up microscopic video of cell division with organic motion, subtle depth, clean scientific detail, and a polished research-film finish.",
              placeholder: "Create a cell division video",
              defaultStyles: ["cinematic", "technical", "premium", "exploratory"],
              Icon: Film,
              videoUrl: "/img/imagine/cell-division.mp4",
              tone: "linear-gradient(135deg, rgba(5, 12, 10, 0.96), rgba(20, 52, 45, 0.74))",
              aspectRatio: "16 / 9",
              size: "wide",
              mediaType: "video",
            },
            {
              id: "youtube-intro-video",
              title: "YouTube intro",
              description: "Polished creator intros with cinematic pacing, title energy, and channel-ready motion.",
              prompt: "Create a polished YouTube intro video with strong creator branding, cinematic motion, crisp title timing, and a high-retention opening sequence.",
              placeholder: "Create a YouTube intro",
              defaultStyles: ["cinematic", "bold", "premium", "professional"],
              Icon: Film,
              videoUrl: "/img/imagine/youtuber-intro.mp4",
              tone: "linear-gradient(135deg, rgba(6, 8, 18, 0.95), rgba(38, 30, 68, 0.76))",
              aspectRatio: "16 / 9",
              size: "wide",
              mediaType: "video",
            },
            {
              id: "video-cinematic-scene",
              title: "Cinematic scene video",
              description: "Atmospheric short scenes with camera direction and production mood.",
              prompt: "Create a cinematic short video with atmospheric depth, slow camera movement, natural motion, and a premium filmic finish.",
              placeholder: "Create a cinematic scene",
              defaultStyles: ["cinematic", "editorial", "premium", "exploratory"],
              Icon: Film,
              imageUrl: "/img/imagine/lions.webp",
              tone: "url('/img/imagine/lions.webp') center / cover no-repeat",
              aspectRatio: "16 / 9",
              size: "wide",
              mediaType: "video",
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
              id: "metal-typography-ads",
              title: "Metal typography ads",
              description: "Premium poster ads with reflective type, product drama, and bold brand presence.",
              prompt: "Create a premium typography-led campaign ad with metallic dimensional lettering, dramatic studio lighting, refined product placement, and a polished high-end brand finish.",
              placeholder: "Create a metal text ad",
              defaultStyles: ["product", "premium", "bold", "studio"],
              Icon: Paintbrush,
              imageUrl: "/img/imagine/metal-text-ad.webp",
              tone: "url('/img/imagine/metal-text-ad.webp') center / cover no-repeat",
              aspectRatio: "1122 / 1402",
              size: "large",
            },
            {
              id: "text-led-ads",
              title: "Text-led ads",
              description: "Clean campaign posters where the message, layout, and product work together.",
              prompt: "Create a clean text-led advertising poster with confident headline typography, elegant product composition, restrained color, and a premium campaign layout.",
              placeholder: "Create a text-led ad",
              defaultStyles: ["product", "minimal", "premium", "professional"],
              Icon: ReceiptText,
              imageUrl: "/img/imagine/text-ad.webp",
              tone: "url('/img/imagine/text-ad.webp') center / cover no-repeat",
              aspectRatio: "1122 / 1402",
              size: "large",
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
                tone: normalizedTemplate.tone || (normalizedTemplate.imageUrl
                  ? "url('" + normalizedTemplate.imageUrl + "') center / cover no-repeat"
                  : "linear-gradient(135deg, rgba(20, 20, 22, 0.96), rgba(42, 42, 48, 0.72))"),
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

          useEffect(() => {
            const normalizedToken = String(focusedTemplateSelectionToken || "").trim();
            const normalizedTemplateId = String(focusedTemplateId || "").trim();
            if (!normalizedToken || !normalizedTemplateId) {
              return;
            }
            if (lastAppliedFocusedTemplateSelectionTokenRef.current === normalizedToken) {
              return;
            }
            const focusedTemplate = allTemplates.find((template) => String(template?.id || "").trim() === normalizedTemplateId) || null;
            if (!focusedTemplate) {
              return;
            }
            lastAppliedFocusedTemplateSelectionTokenRef.current = normalizedToken;
            setActiveImagineTab(focusedTemplate.isCustom || focusedTemplate.isShared ? "my-templates" : "explore");
            window.setTimeout(() => {
              setSelectedTemplateId(normalizedTemplateId);
            }, 0);
          }, [allTemplates, focusedTemplateId, focusedTemplateSelectionToken, setActiveImagineTab]);

          const getTemplateAssetIndex = useCallback((template) => {
            const templateId = String(template?.id || "").trim();
            const assets = normalizePlaygroundImagineTemplateAssets(template);
            const rawIndex = Number(templateAssetIndexes[templateId] || 0) || 0;
            if (!assets.length) {
              return 0;
            }
            return Math.max(0, Math.min(rawIndex, assets.length - 1));
          }, [templateAssetIndexes]);
          const setTemplateAssetIndex = useCallback((template, nextIndex, direction) => {
            const templateId = String(template?.id || "").trim();
            const assets = normalizePlaygroundImagineTemplateAssets(template);
            if (!templateId || assets.length <= 1) {
              return;
            }
            const currentIndex = Math.max(0, Math.min(Number(templateAssetIndexes[templateId] || 0) || 0, assets.length - 1));
            const normalizedIndex = ((Number(nextIndex) || 0) + assets.length) % assets.length;
            const normalizedDirection = Number(direction || 0) < 0 ? -1 : (Number(direction || 0) > 0 ? 1 : (normalizedIndex >= currentIndex ? 1 : -1));
            setTemplateAssetDirections((current) => ({
              ...current,
              [templateId]: normalizedDirection,
            }));
            setTemplateAssetIndexes((current) => ({
              ...current,
              [templateId]: normalizedIndex,
            }));
          }, [templateAssetIndexes]);

          const filterGroups = useMemo(() => ({
            campaign: ["product-ads", "astra-ads", "multi-asset-campaign-set", "modern-pitch-deck", "luxury-watch-ads", "video-product-launch", "akita-space-video", "youtube-intro-video", "fragrance-ads", "coffee-ads", "beauty-ads", "metal-typography-ads", "text-led-ads", "payment-ads", "logo-branding", "furniture-campaigns", "sneaker-campaigns", "brand-campaigns", "social-posts", "restaurant-ads", "comparison-ads"],
            product: ["product-ads", "astra-ads", "multi-asset-campaign-set", "modern-pitch-deck", "luxury-watch-ads", "video-product-launch", "fragrance-ads", "coffee-ads", "beauty-ads", "metal-typography-ads", "text-led-ads", "payment-ads", "furniture-campaigns", "sneaker-campaigns", "technical-drawings", "app-screens", "data-visuals"],
            editorial: ["editorial", "logo-branding", "fashion-campaigns", "portrait-studio"],
            concept: ["akita-space-video", "cell-division-video", "youtube-intro-video", "video-cinematic-scene", "infographics", "technical-drawings", "concept-art", "animated-characters", "cinematic-wildlife"],
          }), []);

          const filterOptions = useMemo(() => [
            { id: "all", label: "All templates", description: "Show every template" },
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

          const inferTemplateAssetType = useCallback((file) => {
            const mimeType = String(file?.type || "").toLowerCase();
            const fileName = String(file?.name || "").toLowerCase();
            if (mimeType.startsWith("image/") || /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(fileName)) {
              return "image";
            }
            if (mimeType.startsWith("video/") || /\.(m4v|mkv|mov|mp4|webm)$/i.test(fileName)) {
              return "video";
            }
            return "";
          }, []);

          const inferTemplateAssetMimeType = useCallback((fileName, fallbackType = "") => {
            const normalizedFallback = String(fallbackType || "").trim();
            if (normalizedFallback) {
              return normalizedFallback;
            }
            const normalizedFileName = String(fileName || "").toLowerCase();
            if (normalizedFileName.endsWith(".avif")) return "image/avif";
            if (normalizedFileName.endsWith(".gif")) return "image/gif";
            if (normalizedFileName.endsWith(".jpg") || normalizedFileName.endsWith(".jpeg")) return "image/jpeg";
            if (normalizedFileName.endsWith(".png")) return "image/png";
            if (normalizedFileName.endsWith(".svg")) return "image/svg+xml";
            if (normalizedFileName.endsWith(".webp")) return "image/webp";
            if (normalizedFileName.endsWith(".webm")) return "video/webm";
            if (normalizedFileName.endsWith(".mov")) return "video/quicktime";
            if (normalizedFileName.endsWith(".m4v")) return "video/x-m4v";
            if (normalizedFileName.endsWith(".mkv")) return "video/x-matroska";
            if (normalizedFileName.endsWith(".mp4")) return "video/mp4";
            return "";
          }, []);

          const buildTemplateDraftAssetPatch = useCallback((assets) => {
            const normalizedAssets = (Array.isArray(assets) ? assets : [])
              .filter((asset) => asset && asset.url)
              .map((asset, index) => ({
                id: String(asset.id || ("template-asset-" + Date.now().toString(36) + "-" + index + "-" + Math.random().toString(36).slice(2, 8))),
                type: asset.type === "video" ? "video" : "image",
                url: String(asset.url || ""),
                title: String(asset.title || asset.fileName || ("Reference asset " + (index + 1))).trim(),
                fileName: String(asset.fileName || asset.title || ("reference-asset-" + (index + 1))).trim(),
                mimeType: String(asset.mimeType || ""),
                aspectRatio: String(asset.aspectRatio || "").trim(),
                size: Number(asset.size || 0) || 0,
                durationSeconds: Number(asset.durationSeconds || 0) || 0,
              }));
            const firstAsset = normalizedAssets[0] || null;
            const firstImageAsset = normalizedAssets.find((asset) => asset.type === "image") || null;
            const firstVideoAsset = normalizedAssets.find((asset) => asset.type === "video") || null;
            return {
              assets: normalizedAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : "",
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : "",
              aspectRatio: firstAsset?.aspectRatio || firstImageAsset?.aspectRatio || firstVideoAsset?.aspectRatio || "4 / 3",
            };
          }, []);

          const readTemplateAssetFile = useCallback((file) => new Promise((resolve, reject) => {
            const assetType = inferTemplateAssetType(file);
            if (!assetType) {
              reject(new Error("Choose image or video files to create a template."));
              return;
            }
            const fileName = String(file?.name || (assetType === "video" ? "reference-video" : "reference-image")).trim();
            const mimeType = inferTemplateAssetMimeType(fileName, file?.type);
            const reader = new FileReader();
            const resolveAsset = (url, aspectRatio, extra = {}) => {
              resolve({
                id: "template-asset-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8),
                type: assetType,
                url,
                title: fileName,
                fileName,
                mimeType,
                aspectRatio,
                size: Number(file?.size || 0) || 0,
                ...extra,
              });
            };
            reader.onload = () => {
              const assetUrl = String(reader.result || "");
              if (!assetUrl) {
                reject(new Error("Could not read that file."));
                return;
              }
              if (assetType === "video") {
                const video = document.createElement("video");
                video.preload = "metadata";
                video.muted = true;
                video.playsInline = true;
                video.onloadedmetadata = () => {
                  const width = video.videoWidth || 16;
                  const height = video.videoHeight || 9;
                  resolveAsset(assetUrl, width + " / " + height, {
                    durationSeconds: Number(video.duration || 0) || 0,
                  });
                };
                video.onerror = () => {
                  resolveAsset(assetUrl, "16 / 9");
                };
                video.src = assetUrl;
                return;
              }
              const image = new Image();
              image.onload = () => {
                const width = image.naturalWidth || 4;
                const height = image.naturalHeight || 3;
                resolveAsset(assetUrl, width + " / " + height);
              };
              image.onerror = () => {
                resolveAsset(assetUrl, "4 / 3");
              };
              image.src = assetUrl;
            };
            reader.onerror = () => {
              reject(new Error("Could not read that file."));
            };
            reader.readAsDataURL(file);
          }), [inferTemplateAssetMimeType, inferTemplateAssetType]);

          const handleTemplateAssetFiles = useCallback((fileList, options = {}) => {
            const files = Array.from(fileList || []).filter(Boolean);
            const supportedFiles = files.filter((file) => inferTemplateAssetType(file));
            if (!supportedFiles.length) {
              setTemplateFormError("Choose image or video files to create a template.");
              return Promise.resolve([]);
            }
            return Promise.all(supportedFiles.map((file) => readTemplateAssetFile(file)))
              .then((nextAssets) => {
                setTemplateDraft((current) => {
                  const currentAssets = options.replace ? [] : (Array.isArray(current.assets) ? current.assets : []);
                  return {
                    ...current,
                    ...buildTemplateDraftAssetPatch(currentAssets.concat(nextAssets)),
                  };
                });
                setTemplateFormError("");
                return nextAssets;
              })
              .catch((error) => {
                const message = error instanceof Error ? error.message : String(error || "Could not read those files.");
                setTemplateFormError(message);
                return [];
              });
          }, [buildTemplateDraftAssetPatch, inferTemplateAssetType, readTemplateAssetFile]);

          const removeTemplateAssetAtIndex = useCallback((assetIndex) => {
            const normalizedIndex = Number(assetIndex);
            setTemplateDraft((current) => {
              const currentAssets = Array.isArray(current.assets) ? current.assets : [];
              return {
                ...current,
                ...buildTemplateDraftAssetPatch(currentAssets.filter((_asset, index) => index !== normalizedIndex)),
              };
            });
            setTemplateFormError("");
          }, [buildTemplateDraftAssetPatch]);

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

          const importCreateReferenceWorkspaceFiles = useCallback(async (fileIds) => {
            const normalizedFileIds = (Array.isArray(fileIds) ? fileIds : [fileIds])
              .map((fileId) => String(fileId || "").trim())
              .filter(Boolean);
            if (!normalizedFileIds.length) {
              return;
            }
            const firstDownloadUrl = buildCreateReferenceDownloadUrl(normalizedFileIds[0]);
            if (!firstDownloadUrl) {
              const message = "Select a computer before choosing reference assets.";
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
              return;
            }
            setCreateReferenceImportState({ status: "loading", error: "" });
            try {
              const importedFiles = [];
              for (const normalizedFileId of normalizedFileIds) {
                const downloadUrl = buildCreateReferenceDownloadUrl(normalizedFileId);
                if (!downloadUrl) {
                  continue;
                }
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
                const fileName = normalizedFileId.split("/").filter(Boolean).pop() || "reference-asset";
                const mimeType = inferTemplateAssetMimeType(fileName, blob.type);
                const fileShape = {
                  name: fileName,
                  type: mimeType,
                  size: blob.size,
                };
                if (!inferTemplateAssetType(fileShape)) {
                  throw new Error("Choose image or video files to create a template.");
                }
                const BrowserFile = globalThis.File;
                if (typeof BrowserFile === "function") {
                  importedFiles.push(new BrowserFile([blob], fileName, { type: mimeType || blob.type || "application/octet-stream" }));
                } else {
                  try {
                    Object.defineProperty(blob, "name", { value: fileName, configurable: true });
                  } catch (_error) {
                    blob.name = fileName;
                  }
                  importedFiles.push(blob);
                }
              }
              await handleTemplateAssetFiles(importedFiles);
              setCreateReferenceImportState({ status: "idle", error: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error || "Could not import those assets.");
              setCreateReferenceImportState({ status: "error", error: message });
              setTemplateFormError(message);
            }
          }, [apiKey, buildCreateReferenceDownloadUrl, handleTemplateAssetFiles, inferTemplateAssetMimeType, inferTemplateAssetType, requestHeaders]);

          const handleCreateReferenceWorkspaceAttach = useCallback((fileIds) => {
            const normalizedFileIds = (Array.isArray(fileIds) ? fileIds : [fileIds])
              .map((fileId) => String(fileId || "").trim())
              .filter(Boolean);
            if (!normalizedFileIds.length) {
              return;
            }
            void importCreateReferenceWorkspaceFiles(normalizedFileIds);
          }, [importCreateReferenceWorkspaceFiles]);

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
              assets: [],
              imageUrl: "",
              videoUrl: "",
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
            const draftAssets = Array.isArray(templateDraft.assets)
              ? templateDraft.assets.filter((asset) => asset && asset.url)
              : [];
            if (!draftAssets.length) {
              setTemplateFormError("Upload at least one reference image or video.");
              return;
            }
            const firstAsset = draftAssets[0] || null;
            const firstImageAsset = draftAssets.find((asset) => asset.type === "image") || null;
            const firstVideoAsset = draftAssets.find((asset) => asset.type === "video") || null;
            const id = editingTemplateId || ("custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8));
            const nextTemplate = {
              id,
              title,
              description,
              prompt: prompt || ("Create in the same style as the " + title + " template."),
              placeholder: title,
              defaultStyles: Array.isArray(templateDraft.defaultStyles) && templateDraft.defaultStyles.length
                ? templateDraft.defaultStyles
                : ["professional"],
              defaultAspectRatio: String(templateDraft.defaultAspectRatio || "").trim(),
              assets: draftAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : (firstImageAsset?.url || ""),
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : (firstVideoAsset?.url || ""),
              mediaType: firstAsset?.type === "video" ? "video" : "image",
              tone: firstAsset?.type === "image"
                ? "url('" + firstAsset.url + "') center / cover no-repeat"
                : "linear-gradient(135deg, rgba(102, 166, 255, 0.2), rgba(255, 255, 255, 0.06))",
              aspectRatio: firstAsset?.aspectRatio || templateDraft.aspectRatio || "4 / 3",
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
            const templateAssets = normalizePlaygroundImagineTemplateAssets(template);
            const firstAsset = templateAssets[0] || null;
            setTemplateDraft({
              title: String(template.title || ""),
              description: String(template.description || ""),
              prompt: String(template.prompt || ""),
              assets: templateAssets,
              imageUrl: firstAsset?.type === "image" ? firstAsset.url : "",
              videoUrl: firstAsset?.type === "video" ? firstAsset.url : "",
              aspectRatio: String(firstAsset?.aspectRatio || template.aspectRatio || "4 / 3"),
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

          const renderCreateTemplateAssetChip = (asset, index) => {
            const resolvedAsset = asset || {};
            const assetTitle = String(resolvedAsset.title || resolvedAsset.fileName || ("Reference asset " + (index + 1))).trim();
            const isVideoAsset = resolvedAsset.type === "video";
            const assetUrl = String(resolvedAsset.url || "").trim();
            return React.createElement("div", {
              key: resolvedAsset.id || assetTitle + ":" + index,
              className: "runner-attachment " + (isVideoAsset ? "runner-attachment-file" : "runner-attachment-image"),
            },
              isVideoAsset
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-file-button",
                      tabIndex: -1,
                      "aria-label": assetTitle,
                    },
                      React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                        React.createElement(Film, { strokeWidth: 1.8 })
                      ),
                      React.createElement("div", { className: "runner-attachment-file-name", title: assetTitle }, assetTitle)
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-remove runner-attachment-remove-file",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeTemplateAssetAtIndex(index);
                      },
                      "aria-label": "Remove " + assetTitle,
                    }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "runner-attachment-image-frame" },
                      React.createElement("button", {
                        type: "button",
                        className: "runner-attachment-image-button",
                        tabIndex: -1,
                        "aria-label": assetTitle,
                      },
                        assetUrl
                          ? React.createElement("img", {
                              src: assetUrl,
                              alt: "",
                              draggable: false,
                              className: "runner-attachment-image-preview",
                            })
                          : React.createElement(ImageIcon, { className: "runner-attachment-image-preview", strokeWidth: 1.8 })
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "runner-attachment-remove runner-attachment-remove-image",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeTemplateAssetAtIndex(index);
                      },
                      "aria-label": "Remove " + assetTitle,
                    }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                  )
            );
          };

          const renderImagineMediaModeSwitch = () =>
            React.createElement("div", { className: "playground-imagine-media-switch", role: "tablist", "aria-label": "Imagine media mode" },
              [
                { id: "image", label: "Image" },
                { id: "video", label: "Video" },
              ].map((option) =>
                React.createElement("button", {
                  key: option.id,
                  type: "button",
                  role: "tab",
                  className: "playground-imagine-media-switch-button" + (activeMediaMode === option.id ? " is-active" : ""),
                  "aria-selected": activeMediaMode === option.id ? "true" : "false",
                  onClick: () => setActiveMediaMode(option.id),
                }, option.label)
              )
            );

          const selectImagineModel = (modelId) => {
            const normalizedModelId = normalizeImagineModelId(activeMediaMode, modelId);
            if (activeMediaMode === "video") {
              setSelectedImagineVideoModelId(normalizedModelId);
            } else {
              setSelectedImagineImageModelId(normalizedModelId);
            }
            setImagineModelSelectorOpen(false);
          };

          const toggleImagineModelSelector = () => {
            setImagineModelSelectorOpen((open) => {
              const nextOpen = !open;
              if (nextOpen) {
                emitPlaygroundImagineComposerPopupOpen(imagineModelPopupSourceIdRef.current);
              }
              return nextOpen;
            });
          };

          const renderImagineModelProviderIcon = (option, extraClassName = "") => {
            const providerIcon = getPlaygroundImagineModelProviderIcon(option);
            const shellClassName = [
              "playground-agents-model-provider-icon-shell",
              "playground-imagine-model-provider-icon-shell",
              extraClassName,
            ].filter(Boolean).join(" ");
            if (!providerIcon) {
              return React.createElement("span", { className: shellClassName, "aria-hidden": "true" });
            }
            return React.createElement("span", { className: shellClassName, "aria-hidden": "true" },
              React.createElement("img", {
                src: providerIcon.src,
                alt: "",
                draggable: "false",
                className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
              })
            );
          };

          const renderImagineModelSelector = () =>
            React.createElement("div", { ref: imagineModelSelectorRef, className: "tb-selector-anchor playground-imagine-model-selector" },
              React.createElement("button", {
                ref: imagineModelSelectorButtonRef,
                type: "button",
                className: "tb-inline-selector tb-inline-selector-agent" + (imagineModelSelectorOpen ? " active" : ""),
                onClick: toggleImagineModelSelector,
                "aria-haspopup": "menu",
                "aria-expanded": imagineModelSelectorOpen ? "true" : "false",
              },
                renderImagineModelProviderIcon(selectedImagineModel, "playground-imagine-model-selector-icon"),
                React.createElement("span", { className: "playground-imagine-model-selector-label" }, selectedImagineModel.label),
                React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
              ),
              imagineModelSelectorAnimation.shouldRender
                ? renderPlaygroundImaginePopupPortal(
                    React.createElement("div", {
                      ref: imagineModelMenuRef,
                      className: "tb-popup-menu tb-popup-menu-inline tb-popup-menu-inline-agent playground-imagine-model-menu " + imagineModelSelectorAnimation.className,
                      onClick: (event) => event.stopPropagation(),
                    },
                    React.createElement("div", { className: "tb-popup-menu-inline-body playground-imagine-model-menu-body" },
                      activeImagineModelOptions.map((option) =>
                        React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (option.id === selectedImagineModel.id ? " selected" : ""),
                          onClick: () => selectImagineModel(option.id),
                        },
                          renderImagineModelProviderIcon(option),
                          React.createElement("span", { className: "playground-imagine-model-option-copy" },
                            React.createElement("span", { className: "playground-imagine-model-option-title" }, option.label)
                          ),
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            option.id === selectedImagineModel.id
                              ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.8 })
                              : null
                          )
                        )
                      )
                    )
                  ),
                  imagineModelMenuStyle
                )
                : null
            );

          const handleVideoUpgradeCheckout = useCallback(async () => {
            if (typeof onUpgradeToIndividual !== "function") {
              return;
            }
            setVideoUpgradeCheckoutLoading(true);
            try {
              await Promise.resolve(onUpgradeToIndividual());
            } finally {
              setVideoUpgradeCheckoutLoading(false);
            }
          }, [onUpgradeToIndividual]);

          const renderImagineVideoUpgradeModal = () => {
            if (!videoUpgradeModalOpen) {
              return null;
            }
            return React.createElement("div", {
              className: "playground-calendar-upgrade-backdrop",
              onClick: () => setVideoUpgradeModalOpen(false),
            },
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-calendar-upgrade-close",
                "aria-label": "Close video generation upgrade prompt",
                onClick: () => setVideoUpgradeModalOpen(false),
              }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 })),
              React.createElement("div", {
                className: "playground-calendar-upgrade-shell",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "playground-calendar-upgrade-pill" }, "Video generation"),
                React.createElement("h2", { className: "playground-calendar-upgrade-headline" },
                  "Try Individual for ",
                  React.createElement("span", { className: "playground-calendar-upgrade-headline-price" }, "$0"),
                  " for 14 days"
                ),
                React.createElement("div", { className: "playground-calendar-upgrade-modal" },
                  React.createElement("div", { className: "playground-calendar-upgrade-modal-top" },
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-header" },
                      React.createElement("div", { className: "playground-calendar-upgrade-modal-title" }, "Individual"),
                      React.createElement("div", { className: "playground-calendar-upgrade-modal-offer" }, "14 day trial")
                    ),
                    React.createElement("p", { className: "playground-calendar-upgrade-modal-copy" },
                      "Video generation is available on paid plans because it uses premium video models and usage-based credits."
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-calendar-upgrade-modal-button",
                      onClick: () => void handleVideoUpgradeCheckout(),
                      disabled: videoUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function",
                    }, videoUpgradeCheckoutLoading ? "Opening checkout..." : "Try Individual free")
                  )
                )
              )
            );
          };

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine mode.",
            activeMediaMode === "video"
              ? "The user is asking for video generation. Use the Video Generation skill when possible and save generated videos into /workspace/generated_videos."
              : "The user is asking for image generation only. Do not produce video unless the user explicitly asks to leave Imagine mode.",
            activeMediaMode === "video"
              ? "Create concise, production-ready video prompts. Selected video model: " + selectedImagineVideoModel.id + " (" + selectedImagineVideoModel.label + "). Include --model " + selectedImagineVideoModel.id + " when calling the video generation script unless the user explicitly asks for another model."
              : "Use the available image generation skill when possible. Selected image model: " + selectedImagineImageModel.id + " (" + selectedImagineImageModel.label + "). Include --model " + selectedImagineImageModel.id + " when calling the image generation script unless the user explicitly asks for another model.",
            activeMediaMode === "video"
              ? "Generate exactly one final video for this Imagine request. Do not create variations, alternates, or run a second generate-video.py call after a video has been saved."
              : "",
            selectedTemplate ? "The user selected this " + (activeMediaMode === "video" ? "video" : "image") + " template: " + selectedTemplate.title + ". Suggested direction: " + selectedTemplate.prompt : "",
          ].filter(Boolean).join("\\n");
          const imagineThreadMetadata = {
            runnerPlayground: {
              source: "imagine",
              mediaMode: activeMediaMode,
              generationType: activeMediaMode,
              videoGenerationMaxOutputs: activeMediaMode === "video" ? 1 : undefined,
            },
          };

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
                            React.createElement("div", { className: "playground-imagine-template-section-title" }, "Reference assets"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-imagine-template-from-computer",
                              disabled: createReferenceImportState.status === "loading",
                              onClick: openCreateReferenceFileBrowser,
                            }, createReferenceImportState.status === "loading" ? "Importing..." : "Upload from Computer")
                          ),
                          React.createElement("div", { className: "playground-tasks-attachments playground-imagine-create-upload-surface" },
                            React.createElement("input", {
                              id: "imagine-template-reference-assets-input",
                              type: "file",
                              multiple: true,
                              accept: "image/*,video/*",
                              hidden: true,
                              onChange: (event) => {
                                void handleTemplateAssetFiles(event.target.files);
                                event.target.value = "";
                              },
                            }),
                            React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                              React.createElement("div", {
                              className: "tb-popup-dropzone playground-tasks-attachments-dropzone playground-imagine-create-upload-dropzone" + ((Array.isArray(templateDraft.assets) && templateDraft.assets.length) ? " is-filled" : ""),
                              onDragOver: (event) => event.preventDefault(),
                              onDrop: (event) => {
                                event.preventDefault();
                                void handleTemplateAssetFiles(event.dataTransfer?.files);
                              },
                            },
                                Array.isArray(templateDraft.assets) && templateDraft.assets.length
                                  ? React.createElement(React.Fragment, null,
                                      React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                        React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                        React.createElement("span", null, "Drop files to add, or"),
                                        React.createElement("button", {
                                          type: "button",
                                          className: "playground-tasks-attachments-browse",
                                          onClick: () => document.getElementById("imagine-template-reference-assets-input")?.click(),
                                        }, "browse.")
                                      ),
                                      React.createElement("div", { className: "runner-attachments" },
                                        templateDraft.assets.map((asset, index) => renderCreateTemplateAssetChip(asset, index))
                                      )
                                    )
                                  : React.createElement("button", {
                                      type: "button",
                                      className: "playground-tasks-attachments-empty-button",
                                      onClick: () => document.getElementById("imagine-template-reference-assets-input")?.click(),
                                    },
                                      React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                      React.createElement("span", { className: "tb-popup-dropzone-title" }, "Drag & drop files here"),
                                      React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                                    )
                              )
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
                        isAgentSelectionBlocked,
                        onBlockedAgentSelect,
                        skills: imagineRunnerSkills,
                        skillDefaults,
                        environmentId: environmentId || undefined,
                        agentId: agentId || undefined,
                        maxAttachments: 20,
                        showUsageInStatus: false,
                        placeholder: "Select reference assets",
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
            return React.createElement(React.Fragment, null,
              React.createElement(PlaygroundImagineTemplatePage, {
              templates: detailTemplates,
              initialTemplateId: selectedTemplate.id,
              backendUrl,
              apiKey,
              speechToTextUrl,
              requestHeaders,
              computerAgents,
              environments,
              agents,
              skills: imagineRunnerSkills,
              skillDefaults,
              canGenerateVideo: canUseVideoGeneration,
              onUpgradeToIndividual,
              environmentId,
              agentId,
              mediaMode: activeMediaMode,
              fetchCustomSkills,
              onThreadStarted,
              onMediaModeChange: setActiveMediaMode,
              onAgentChange,
              onEnvironmentChange,
              onOpenPlansBudget,
              onEditTemplate: handleEditCustomTemplate,
              onDeleteTemplate: handleDeleteCustomTemplate,
              favouriteTemplateIds,
              onToggleFavouriteTemplate: handleToggleFavouriteTemplate,
              onBack: () => setSelectedTemplateId(""),
              }),
              renderImagineVideoUpgradeModal()
            );
          }

          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-imagine-page" },
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
                      React.createElement("p", { className: "playground-imagine-empty-copy" }, "Upload reference images or videos, describe the reusable style, and use it whenever you want agents to generate new assets in that direction."),
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
                          const templateAssets = normalizePlaygroundImagineTemplateAssets(template);
                          const activeAssetIndex = getTemplateAssetIndex(template);
                          const activeAsset = templateAssets[activeAssetIndex] || templateAssets[0] || null;
                          const templateMediaType = String(activeAsset?.type || template.mediaType || "image") === "video" ? "video" : "image";
                          const hasMultipleAssets = templateAssets.length > 1;
                          const handleOpenTemplate = () => {
                            if (templateMediaType === "video" && !canUseVideoGeneration) {
                              setActiveMediaMode("video");
                              return;
                            }
                            setActiveMediaMode(templateMediaType);
                            setSelectedTemplateId(template.id);
                          };
                          return React.createElement("div", {
                            key: template.id,
                            role: "button",
                            tabIndex: 0,
                            className: [
                              "playground-imagine-template",
                              template.size === "large" ? "is-large" : "",
                              template.size === "wide" ? "is-wide" : "",
                              selectedTemplateId === template.id ? "is-selected" : "",
                              templateMediaType === "video" ? "is-video" : "",
                              hasMultipleAssets ? "is-multi-asset" : "",
                            ].filter(Boolean).join(" "),
                            style: {
                              "--imagine-template-bg": template.tone,
                              "--imagine-template-aspect-ratio": activeAsset?.aspectRatio || template.aspectRatio || "4 / 3",
                            },
                            onClick: handleOpenTemplate,
                            onKeyDown: (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleOpenTemplate();
                              }
                            },
                          },
                            React.createElement(PlaygroundImagineTemplatePreviewMedia, {
                              template: {
                                ...template,
                                activeAssetIndex,
                                assetDirection: templateAssetDirections[String(template.id || "").trim()] || 1,
                              },
                            }),
                            hasMultipleAssets
                              ? React.createElement("span", {
                                  className: "playground-imagine-template-media-controls",
                                  onClick: (event) => event.stopPropagation(),
                                },
                                  React.createElement("span", { className: "playground-imagine-template-media-dots" },
                                    templateAssets.map((asset, assetIndex) =>
                                      React.createElement("button", {
                                        key: "asset-dot:" + template.id + ":" + assetIndex,
                                        type: "button",
                                        className: "playground-imagine-template-media-dot" + (assetIndex === activeAssetIndex ? " is-active" : ""),
                                        "aria-label": "Show template asset " + (assetIndex + 1),
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setTemplateAssetIndex(template, assetIndex, assetIndex >= activeAssetIndex ? 1 : -1);
                                        },
                                      })
                                    )
                                  ),
                                  React.createElement("span", { className: "playground-imagine-template-media-arrows" },
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-imagine-template-media-arrow",
                                      "aria-label": "Previous template asset",
                                      onClick: (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setTemplateAssetIndex(template, activeAssetIndex - 1, -1);
                                      },
                                    }, React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.9 })),
                                    React.createElement("button", {
                                      type: "button",
                                      className: "playground-imagine-template-media-arrow",
                                      "aria-label": "Next template asset",
                                      onClick: (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setTemplateAssetIndex(template, activeAssetIndex + 1, 1);
                                      },
                                    }, React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 }))
                                  )
                                )
                              : null,
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
                        React.createElement(activeMediaMode === "video" ? Film : Sparkles, { width: 14, height: 14, strokeWidth: 1.8 }),
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
                      key: "imagine-runner:" + activeMediaMode + ":" + (selectedTemplateId || "__none__"),
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
                      isAgentSelectionBlocked,
                      onBlockedAgentSelect,
                      skills: imagineRunnerSkills,
                      skillDefaults: imagineSkillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: activeMediaMode === "video"
                        ? "Describe a video"
                        : selectedTemplate ? (selectedTemplate.placeholder || selectedTemplate.title) : "Describe an image",
                      composerLeadingControl: renderImagineMediaModeSwitch(),
                      composerBeforeAgentControl: renderImagineModelSelector(),
                      hiddenSystemPrompt,
                      threadMetadata: imagineThreadMetadata,
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
            ),
            renderImagineVideoUpgradeModal()
          );
        }
`;
