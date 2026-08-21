export const BATCHES_PAGE_CSS = String.raw`
  .resource-overview-table.is-batches.is-catalog-ui
    .platform-data-table__row-group.is-grouped-row
    > .platform-data-table__row {
    padding-left: var(--platform-data-table-catalog-inline-padding);
  }

  .batches-create-modal__header {
    min-height: 46px;
    padding: 7px 16px;
  }

  .batches-create-modal__header .platform-search {
    min-width: 0;
  }

  .batches-create-modal__type-anchor {
    flex: 0 0 auto;
  }

  .batches-create-modal__type-button {
    white-space: nowrap;
  }

  .batches-create-modal__type-menu .tb-popup-row {
    align-items: flex-start;
  }

  .batches-create-modal__type-menu .tb-popup-check-slot {
    margin-top: 1px;
  }

  .batches-create-modal__type-option-copy {
    min-width: 0;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 2px;
  }

  .batches-create-modal__type-option-copy > span:first-child {
    color: rgba(255, 255, 255, 0.96);
    font-size: 12px;
    font-weight: 400;
  }

  .batches-create-modal__type-option-copy > span:last-child:not(:first-child) {
    color: rgba(255, 255, 255, 0.48);
    font-size: 11px;
    font-weight: 400;
  }

  .batches-create-modal__description-editor.platform-instructions-editor {
    grid-column: 1 / -1;
    margin: 0;
  }

  .batches-create-modal__description-editor
    .platform-instructions-editor__prosemirror {
    min-height: 72px;
  }

  .batches-create-modal__footer {
    justify-content: space-between;
    gap: 16px;
  }

  .batches-create-modal__footer-policy,
  .batches-create-modal__footer-actions {
    display: flex;
    align-items: center;
  }

  .batches-create-modal__footer-policy {
    min-width: 0;
    margin-right: auto;
    gap: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 500;
  }

  .batches-create-modal__footer-actions {
    flex: 0 0 auto;
    margin-left: auto;
    gap: 8px;
  }

  .batches-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .batches-form-field {
    display: grid;
    align-content: start;
    gap: 8px;
    min-width: 0;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 400;
  }

  .batches-form-field > small {
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    font-weight: 400;
    line-height: 1.45;
  }

  .batches-form-field.is-span-2 {
    grid-column: 1 / -1;
  }

  .batches-create-modal__resource-trigger {
    min-height: 39px;
    justify-content: space-between;
    gap: 12px;
    padding: 0 11px;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
    transition: border-color 140ms ease, background 140ms ease;
  }

  .batches-create-modal__resource-trigger:hover:not(:disabled),
  .batches-create-modal__resource-trigger:focus-visible {
    border-color: rgba(255, 255, 255, 0.19);
    background: rgba(255, 255, 255, 0.055);
  }

  .batches-create-modal__resource-trigger .platform-selector__value {
    flex: 1 1 auto;
  }

  .batches-create-modal__resource-status {
    text-transform: capitalize;
  }

  .batches-form-field > small.is-error {
    color: #ff9696;
  }

  .batches-create-modal__thread-composer.tb-runner-chat {
    grid-column: 1 / -1;
    position: relative;
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 0;
    margin-top: 24px;
    display: block;
    grid-template-rows: none;
    overflow: visible;
    background: transparent;
  }

  .batches-create-modal__thread-composer > :not(.tb-input-shell) {
    display: none !important;
  }

  .batches-create-modal
    .batches-create-modal__thread-composer.tb-runner-chat
    .tb-input-shell {
    position: static;
    inset: auto;
    width: 100%;
    min-height: 0;
    padding: 0;
    margin: 0;
    display: block;
  }

  .batches-create-modal__thread-composer .tb-input-width {
    width: 100%;
    max-width: none;
  }

  .batches-create-modal__thread-composer .task-input-box {
    --tb-task-input-base-bg: rgba(255, 255, 255, 0.025);
    --tb-task-input-overlay: transparent;
    height: auto;
  }

  .batches-create-modal__thread-composer .sidebar-textarea {
    min-height: 72px;
    padding-top: 14px;
  }

  .metronome-manual-run-inputs {
    grid-column: 1 / -1;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .metronome-manual-run-inputs__trigger,
  .metronome-manual-run-inputs__composer,
  .metronome-manual-run-inputs__fields {
    grid-column: 1 / -1;
  }

  .metronome-manual-run-inputs__fields {
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .metronome-manual-run-inputs__field.is-toggle {
    min-height: 39px;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .metronome-manual-run-inputs__field.is-toggle > div {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .metronome-manual-run-inputs__field-description {
    display: block;
  }

  .batches-create-modal__workflow-loading,
  .batches-create-modal__workflow-error {
    grid-column: 1 / -1;
    min-height: 54px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.48);
    font-size: 12px;
  }

  .batches-create-modal__workflow-error {
    color: #ff9696;
  }

  .batches-form-field input,
  .batches-form-field textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 8px;
    outline: none;
    color: rgba(255, 255, 255, 0.88);
    background: rgba(255, 255, 255, 0.035);
    font: inherit;
    font-weight: 450;
    transition: border-color 140ms ease, background 140ms ease;
  }

  .batches-form-field input {
    height: 39px;
    padding: 0 11px;
  }

  .batches-form-field textarea {
    min-height: 84px;
    padding: 10px 11px;
    resize: vertical;
  }

  .batches-form-field input:focus,
  .batches-form-field textarea:focus {
    border-color: rgba(74, 167, 255, 0.58);
    background: rgba(74, 167, 255, 0.045);
  }

  .batches-form-error,
  .batches-page-error {
    margin: 0;
    color: #ff9696;
    font-size: 13px;
  }

  .batches-page-error {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 90;
    max-width: min(440px, calc(100vw - 48px));
    padding: 12px 14px;
    border: 1px solid rgba(255, 105, 105, 0.28);
    border-radius: 8px;
    background: rgba(39, 11, 14, 0.96);
  }

  .batches-spin {
    animation: batches-spin 900ms linear infinite;
  }

  @keyframes batches-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 760px) {
    .batches-form-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .metronome-manual-run-inputs,
    .metronome-manual-run-inputs__fields {
      grid-template-columns: minmax(0, 1fr);
    }

    .batches-form-field.is-span-2 {
      grid-column: auto;
    }

    .batches-create-modal__footer {
      align-items: stretch;
      flex-direction: column;
    }

    .batches-create-modal__footer-actions {
      margin-left: 0;
      justify-content: flex-end;
    }
  }
`;
