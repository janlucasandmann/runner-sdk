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

  .knowledge-library-identity__icon {
    display: inline-grid;
    place-items: center;
    border: 0;
    border-radius: 10px;
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .playground-content-body:has(
    > .knowledge-detail-page.file-resource-detail-page.is-code-tab
  ) {
    display: flex;
    flex-direction: column;
  }

  .playground-content-body
    > .knowledge-detail-page.file-resource-detail-page.is-code-tab {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 0;
    flex: 1 1 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
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
  }

  .knowledge-detail-content { min-width: 0; }
  .knowledge-detail-page__settings,
  .knowledge-detail-page__settings-content,
  .knowledge-settings-layout {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
  }

  .knowledge-detail-page .knowledge-detail-page__settings-content {
    max-width: none;
    margin-inline: 0;
  }

  .knowledge-settings-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .knowledge-detail-page__storage-map {
    margin-block: 0;
  }

  .knowledge-detail-page__settings-sidebar,
  .knowledge-detail-page__settings-sidebar-properties {
    min-width: 0;
  }

  .knowledge-detail-page__start-thread-button.platform-button {
    width: 100%;
    margin-top: 12px;
  }

  .knowledge-library-identity__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex: 0 0 52px;
    border-radius: 12px;
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .knowledge-detail-page__document-workspace {
    width: 100%;
    min-height: 0;
    flex: 1 1 0;
  }

  .knowledge-document-workspace__sidebar-heading {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .knowledge-document-workspace__select-all.platform-checkbox {
    flex: 0 0 auto;
  }

  .knowledge-access-add-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .knowledge-document-workspace__title-input {
    box-sizing: border-box;
    min-width: 0;
    width: min(100%, 640px);
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }

  .knowledge-document-workspace__title-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
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

  .knowledge-version-changes-page {
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

`;
