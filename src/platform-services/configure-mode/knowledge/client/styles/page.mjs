export const PLAYGROUND_KNOWLEDGE_CSS = String.raw`
  .resource-overview-page.is-knowledge {
    --resource-overview-accent: #8f7dff;
  }

  .knowledge-centered-state {
    display: grid;
    min-height: calc(100vh - 160px);
    place-items: center;
    padding: 32px;
  }

  .knowledge-page-error,
  .knowledge-inline-error,
  .knowledge-form-error {
    margin: 0;
    color: #ff9696;
    font-size: 13px;
  }

  .knowledge-spin { animation: knowledge-spin 900ms linear infinite; }
  @keyframes knowledge-spin { to { transform: rotate(360deg); } }

  .knowledge-create-modal__description-editor.platform-instructions-editor {
    margin: 0;
  }

  .knowledge-create-modal__description-editor
    .platform-instructions-editor__prosemirror {
    min-height: 88px;
  }

  .knowledge-library-identity__icon.is-project-linked {
    color: var(--knowledge-project-icon-color, #79d0ff);
    background: color-mix(
      in srgb,
      var(--knowledge-project-icon-color, #79d0ff) 10%,
      transparent
    );
  }

  .knowledge-overview-identity
    .resource-overview-identity__visual.is-project-linked {
    color: var(--knowledge-project-icon-color, #79d0ff);
    background: color-mix(
      in srgb,
      var(--knowledge-project-icon-color, #79d0ff) 10%,
      transparent
    );
  }

  .playground-content-body:has(
    > .knowledge-detail-page.file-resource-detail-page.is-code-tab
  ) {
    display: flex;
    flex-direction: column;
    padding-bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .playground-content-body
    > .knowledge-detail-page.file-resource-detail-page.is-code-tab {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 100%;
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  .knowledge-detail-page {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    min-width: 0;
    min-height: 0;
    height: 100%;
    margin: 0;
  }

  .knowledge-detail-page.file-resource-detail-page.is-settings-tab {
    width: min(100%, var(--playground-centered-page-max-width, 87.5rem));
    max-width: var(--playground-centered-page-max-width, 87.5rem);
    margin-inline: auto;
    padding: 0;
  }

  .knowledge-detail-page.file-resource-detail-page.is-settings-tab.is-access-detail-view {
    width: 100%;
    max-width: none;
    margin-inline: 0;
  }

  .knowledge-detail-content { min-width: 0; }
  .knowledge-detail-page__settings,
  .knowledge-detail-page__settings-content {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }

  .knowledge-detail-page__storage-map {
    margin-block: 0;
  }

  .knowledge-connector-settings {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 14px;
  }

  .knowledge-connector-settings__heading,
  .knowledge-connector-settings__heading-copy {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 8px;
  }

  .knowledge-connector-settings__title-line {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  .knowledge-connector-settings__title-line h2 {
    margin: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.3;
  }

  .knowledge-connector-settings__heading-copy > p {
    margin: 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    line-height: 1.45;
  }

  .knowledge-connector-settings__providers,
  .knowledge-connector-settings__provider-group,
  .knowledge-connector-settings__resources {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .knowledge-connector-settings__providers {
    gap: 0;
  }

  .knowledge-connector-settings__provider-group {
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .knowledge-connector-settings__provider-row {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
    min-height: 64px;
    gap: 20px;
    padding: 14px 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .knowledge-connector-settings__provider-identity {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: 12px;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
  }

  .knowledge-connector-settings__provider-icon {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    object-fit: contain;
  }

  .knowledge-connector-settings__resources {
    gap: 10px;
  }

  .knowledge-connector-settings.is-project-managed
    .knowledge-connector-settings__provider-row {
    opacity: 0.55;
  }

  .knowledge-detail-page__settings-sidebar,
  .knowledge-detail-page__settings-sidebar-properties {
    min-width: 0;
  }

  .knowledge-detail-page__document-workspace {
    box-sizing: border-box;
    width: min(100%, var(--playground-centered-page-max-width, 87.5rem));
    max-width: var(--playground-centered-page-max-width, 87.5rem);
    height: auto;
    min-height: calc(100dvh - 56px);
    flex: 0 0 auto;
    margin-inline: auto;
    padding-inline: 44px;
  }

  .knowledge-detail-page__library-workspace {
    box-sizing: border-box;
    width: 100%;
    height: auto;
    min-width: 0;
    min-height: 100%;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .knowledge-library-cover {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: 420px;
    min-height: 420px;
    flex: 0 0 420px;
    margin: 0;
    overflow: hidden;
    background: #0b3972;
  }

  .knowledge-library-cover__gradient,
  .knowledge-library-cover__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .knowledge-library-cover__gradient {
    background:
      radial-gradient(circle at 72% 20%, rgba(95, 174, 255, 0.64), transparent 42%),
      linear-gradient(135deg, #082957 0%, #125caa 48%, #397fc7 100%);
  }

  .knowledge-library-cover__image {
    display: block;
    object-fit: cover;
    user-select: none;
    transition: opacity 120ms ease;
  }

  .knowledge-library-cover.is-image {
    background: rgba(255, 255, 255, 0.1);
  }

  .knowledge-library-cover.is-image-loading .knowledge-library-cover__image {
    opacity: 0;
  }

  .knowledge-library-cover__loading.platform-loading-state {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }

  .knowledge-library-cover__settings-menu.platform-popup-anchor {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2;
    display: inline-flex;
    min-height: 28px;
    opacity: 0;
    transform: translateY(-2px);
    pointer-events: none;
    transition:
      opacity 140ms ease,
      transform 140ms ease;
  }

  .knowledge-library-cover__settings-button.platform-button {
    min-height: 28px;
    gap: 7px;
  }

  .knowledge-library-cover:hover
    .knowledge-library-cover__settings-menu.platform-popup-anchor,
  .knowledge-library-cover:focus-within
    .knowledge-library-cover__settings-menu.platform-popup-anchor,
  .knowledge-library-cover__settings-menu.platform-popup-anchor.is-open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .knowledge-library-cover__settings-button > svg,
  .knowledge-document-workspace__add-cover-button > svg {
    width: 14px;
    height: 14px;
  }

  .knowledge-library-cover__upload-input {
    position: fixed;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .knowledge-library-cover-crop-modal.platform-modal-surface {
    height: min(760px, calc(100dvh - 48px));
    display: flex;
    flex-direction: column;
  }

  .knowledge-library-cover-crop-modal__header.platform-modal-header {
    min-height: 64px;
    padding: 14px 20px;
    align-items: center;
    border-bottom-color: rgba(255, 255, 255, 0.075);
  }

  .knowledge-library-cover-crop-modal__title.platform-modal-header__title {
    font-size: 14px;
    font-weight: 400;
  }

  .knowledge-library-cover-crop-modal__default-close {
    display: none;
  }

  .knowledge-library-cover-crop-modal__back.platform-icon-button {
    width: 32px;
    height: 32px;
    color: #fff;
  }

  .knowledge-library-cover-crop-modal__back > svg {
    width: 20px;
    height: 20px;
  }

  .knowledge-library-cover-crop-modal__apply.platform-button {
    min-width: 92px;
    min-height: 34px;
  }

  .knowledge-library-cover-crop-modal__body.platform-modal-body {
    min-height: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 24px;
    overflow: hidden;
    background: #111;
  }

  .knowledge-library-cover-crop-modal__stage {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    min-height: 320px;
    flex: 1 1 auto;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }

  .knowledge-library-cover-crop-modal__source-preview {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    filter: brightness(0.48) saturate(0.8);
    pointer-events: none;
    user-select: none;
    transition: opacity 120ms ease;
  }

  .knowledge-library-cover-crop-modal__stage.is-ready
    .knowledge-library-cover-crop-modal__source-preview {
    opacity: 0.58;
  }

  .knowledge-library-cover-crop-modal__crop-area {
    position: absolute;
    top: 50%;
    left: 24px;
    right: 24px;
    z-index: 2;
    aspect-ratio: var(--knowledge-library-cover-crop-aspect-ratio, 3);
    max-height: calc(100% - 48px);
    overflow: hidden;
    border: 2px solid #4da3ff;
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
    cursor: grab;
    touch-action: none;
    transform: translateY(-50%);
  }

  .knowledge-library-cover-crop-modal__crop-area:focus-visible {
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.45),
      0 0 0 3px rgba(77, 163, 255, 0.25);
  }

  .knowledge-library-cover-crop-modal__crop-area.is-dragging {
    cursor: grabbing;
  }

  .knowledge-library-cover-crop-modal__crop-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    user-select: none;
    will-change: transform, object-position;
  }

  .knowledge-library-cover-crop-modal__loading.platform-loading-state,
  .knowledge-library-cover-crop-modal__image-error {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .knowledge-library-cover-crop-modal__loading.platform-loading-state {
    background: transparent;
  }

  .knowledge-library-cover-crop-modal__image-error {
    padding: 24px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    text-align: center;
  }

  .knowledge-library-cover-crop-modal__controls {
    min-height: 32px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
  }

  .knowledge-library-cover-crop-modal__controls .platform-icon-button {
    color: rgba(255, 255, 255, 0.62);
  }

  .knowledge-library-cover-crop-modal__zoom {
    width: min(560px, 70%);
    height: 16px;
    padding: 0;
    border: 0;
    outline: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .knowledge-library-cover-crop-modal__zoom::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
  }

  .knowledge-library-cover-crop-modal__zoom::-webkit-slider-thumb {
    width: 12px;
    height: 12px;
    margin-top: -5px;
    border: 0;
    border-radius: 999px;
    appearance: none;
    -webkit-appearance: none;
    background: #fff;
    box-shadow: none;
  }

  .knowledge-library-cover-crop-modal__zoom::-moz-range-track {
    width: 100%;
    height: 2px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
  }

  .knowledge-library-cover-crop-modal__zoom::-moz-range-progress {
    height: 2px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
  }

  .knowledge-library-cover-crop-modal__zoom::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 0;
    border-radius: 999px;
    background: #fff;
    box-shadow: none;
  }

  .knowledge-library-cover-crop-modal__zoom:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
  }

  .knowledge-library-cover-crop-modal__zoom:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
  }

  .knowledge-library-cover-crop-modal__zoom:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .knowledge-library-cover-crop-modal__help {
    margin: -8px 0 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    text-align: center;
  }

  .knowledge-library-cover-crop-modal__error {
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    text-align: center;
  }

  .knowledge-detail-page__document-workspace.is-minimalistic-ui {
    height: auto;
    min-height: calc(100dvh - 56px);
  }

  .knowledge-detail-page.is-general-tab .knowledge-detail-content {
    height: auto;
    min-height: 100%;
    overflow: visible;
  }

  .knowledge-detail-page.is-general-tab .knowledge-detail-page__general,
  .knowledge-detail-page.is-general-tab .knowledge-detail-page__workspace {
    height: auto;
    min-height: 0;
    margin-bottom: 0;
    padding-bottom: 0;
    overflow: visible;
  }

  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace.is-minimalistic-ui {
    height: auto;
    min-height: calc(100dvh - 56px);
    align-items: start;
    grid-template-rows: auto;
    overflow: visible;
  }

  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace.is-minimalistic-ui
    .platform-code-editor-workspace__sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    width: 100%;
    height: calc(100dvh - 56px);
    max-height: calc(100dvh - 56px);
    overflow: hidden;
  }

  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace.is-minimalistic-ui
    .platform-code-editor-workspace__editor,
  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace.is-minimalistic-ui
    .platform-code-editor-workspace__markdown-editor.platform-instructions-editor,
  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace.is-minimalistic-ui
    .platform-instructions-editor__body {
    height: auto;
    min-height: calc(100dvh - 56px);
    overflow: visible;
  }

  .knowledge-detail-page.is-general-tab
    .platform-code-editor-workspace__markdown-editor,
  .knowledge-detail-page.is-general-tab
    .platform-instructions-editor__body,
  .knowledge-detail-page.is-general-tab
    .platform-instructions-editor__content-viewport,
  .knowledge-detail-page.is-general-tab
    .platform-instructions-editor__prosemirror {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .knowledge-detail-page.is-general-tab
    .platform-instructions-editor.is-block-editor
    .platform-instructions-editor__content,
  .knowledge-detail-page.is-general-tab
    .platform-instructions-editor.is-block-editor
    .platform-instructions-editor__prosemirror {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }

  .knowledge-document-workspace__sidebar-heading {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.62);
  }

  .knowledge-document-workspace__select-all.platform-checkbox {
    flex: 0 0 auto;
  }

  .knowledge-document-workspace__body-title-input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 1.3em;
    flex: 1 1 auto;
    field-sizing: content;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    outline: 0;
    background: transparent;
    color: #fff;
    font: inherit;
    line-height: inherit;
    overflow: hidden;
    overflow-wrap: anywhere;
    resize: none;
    white-space: pre-wrap;
  }

  .knowledge-document-workspace__body-title {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .knowledge-document-workspace__add-cover-button.platform-button {
    flex: 0 0 auto;
    min-height: 28px;
    gap: 7px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }

  .knowledge-document-workspace__body-title:focus-within
    .knowledge-document-workspace__add-cover-button.platform-button {
    opacity: 1;
    pointer-events: auto;
  }

  .knowledge-library-cover-browser.platform-file-explorer-modal.is-browser-layout
    .platform-file-explorer__sidebar-body {
    min-height: 0;
    overflow: hidden;
  }

  .knowledge-library-cover-browser.platform-file-explorer-modal.is-browser-layout
    .tb-file-browser-sidebar-section-environments {
    min-height: 0;
    flex: 1 1 auto;
    padding-bottom: 12px;
  }

  .knowledge-library-cover-browser.platform-file-explorer-modal.is-browser-layout
    .tb-file-browser-sidebar-title {
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
  }

  .knowledge-library-cover-browser.platform-file-explorer-modal.is-browser-layout
    .tb-file-browser-sidebar-list-environments {
    min-height: 0;
    max-height: none;
    flex: 1 1 auto;
    overflow-y: auto;
  }

  .knowledge-library-cover-browser.platform-file-explorer-modal.is-browser-layout
    .tb-file-browser-breadcrumb.active {
    font-size: 12px;
  }

  .knowledge-library-cover-browser__check {
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
    color: #4da3ff;
  }

  .knowledge-access-add-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .knowledge-detail-page__notice {
    padding: 10px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
    background: rgba(255, 90, 90, 0.05);
  }

  .knowledge-version-changes-surface {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: auto;
  }

  .knowledge-version-changes-surface__error {
    display: grid;
    min-height: 240px;
    place-items: center;
    padding: 32px;
    color: #ff9696;
    font-size: 13px;
  }

  .knowledge-version-changes-modal {
    min-height: 100%;
  }

  .knowledge-document-detail-page {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .knowledge-document-editor { width: 100%; min-height: 100%; flex: 1 1 auto; }
  .knowledge-document-editor-title { min-width: 0; display: inline-flex; align-items: center; gap: 10px; }
  .knowledge-document-editor-title input {
    min-width: 0;
    width: min(520px, 55vw);
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.94);
    font: inherit;
  }

  @media (max-width: 760px) {
    .knowledge-detail-page__document-workspace {
      padding-inline: 20px;
    }
  }

`;
