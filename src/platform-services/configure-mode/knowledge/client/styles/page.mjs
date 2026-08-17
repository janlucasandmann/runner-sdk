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

  .knowledge-form-grid,
  .knowledge-form-field {
    display: grid;
    gap: 10px;
  }

  .knowledge-form-field > span {
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
  }

  .knowledge-form-field input,
  .knowledge-form-field textarea {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    outline: none;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font: inherit;
    font-size: 13px;
  }

  .knowledge-form-field input { height: 40px; padding: 0 12px; }
  .knowledge-form-field textarea { min-height: 88px; padding: 10px 12px; resize: vertical; }
  .knowledge-form-field input:focus,
  .knowledge-form-field textarea:focus { border-color: rgba(111, 168, 255, 0.65); }

  .knowledge-library-identity__icon {
    display: inline-grid;
    place-items: center;
    border: 0;
    border-radius: 10px;
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .knowledge-detail-frame { padding-inline: 24px; }
  .knowledge-detail-page { width: 100%; }
  .knowledge-detail-page.is-general-tab { grid-template-columns: minmax(0, 1fr); }
  .knowledge-detail-content { min-width: 0; }
  .knowledge-general-stack,
  .knowledge-settings-layout {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .knowledge-library-identity { padding-bottom: 20px; }
  .knowledge-library-identity__icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
  }

  .knowledge-home-editor {
    min-height: 360px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 15px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.025);
  }

  .knowledge-header-actions,
  .knowledge-access-add-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .knowledge-document-identity {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .knowledge-document-identity > span {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .knowledge-document-identity__title,
  .knowledge-table-value { color: rgba(255, 255, 255, 0.9); font-size: 12px; font-weight: 400; }
  .knowledge-document-identity__summary { color: rgba(255, 255, 255, 0.5); font-size: 12px; }

  .knowledge-settings-layout {
    width: min(100%, var(--platform-page-content-max-width, 87.5rem));
    margin-inline: auto;
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

  @media (max-width: 900px) {
    .knowledge-detail-frame { padding-inline: 18px; }
  }
`;
