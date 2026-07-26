export const PLAYGROUND_TESTS_CSS = String.raw`
  .tests-overview-guide {
    display: grid;
    gap: 28px;
  }

  .tests-overview-guide__hero {
    max-width: 920px;
  }

  .tests-overview-guide__cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .resource-overview-page.is-tests {
    --resource-overview-accent: #4aa7ff;
  }

  .tests-status-label {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 9px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.72);
    background: rgba(255, 255, 255, 0.045);
    font-size: 12px;
    font-weight: 650;
    line-height: 1;
    white-space: nowrap;
  }

  .tests-status-label.is-passed,
  .tests-status-label.is-active {
    color: #86e29d;
    border-color: rgba(73, 198, 105, 0.24);
    background: rgba(45, 147, 72, 0.13);
  }

  .tests-status-label.is-failed,
  .tests-status-label.is-error,
  .tests-status-label.is-completed_with_errors {
    color: #ff9b9b;
    border-color: rgba(255, 91, 91, 0.24);
    background: rgba(181, 42, 42, 0.14);
  }

  .tests-status-label.is-running,
  .tests-status-label.is-queued {
    color: #8cc7ff;
    border-color: rgba(74, 167, 255, 0.26);
    background: rgba(42, 117, 190, 0.15);
  }

  .tests-status-label.is-warning {
    color: #f4c978;
    border-color: rgba(232, 177, 70, 0.26);
    background: rgba(155, 104, 18, 0.15);
  }

  .tests-status-label.is-cancelled,
  .tests-status-label.is-archived,
  .tests-status-label.is-skipped {
    color: rgba(255, 255, 255, 0.54);
  }

  .tests-centered-state {
    display: grid;
    min-height: calc(100vh - 160px);
    place-items: center;
    padding: 32px;
  }

  .tests-page-error,
  .tests-form-error {
    margin: 0;
    color: #ff9696;
    font-size: 13px;
  }

  .tests-detail-page {
    min-height: calc(100vh - var(--playground-navbar-height, 68px));
  }

  .tests-detail-content {
    min-width: 0;
  }

  .tests-detail-stack {
    display: grid;
    align-content: start;
    gap: 24px;
    padding: 24px 28px 48px;
  }

  .tests-detail-sidebar {
    padding-top: 24px;
  }

  .tests-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .tests-kpi-card {
    display: grid;
    min-height: 126px;
    align-content: center;
    gap: 8px;
    padding: 20px;
  }

  .tests-kpi-card > span {
    color: rgba(255, 255, 255, 0.52);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.02em;
  }

  .tests-kpi-card > strong {
    color: #f7f7f7;
    font-size: 28px;
    font-weight: 650;
    letter-spacing: -0.035em;
  }

  .tests-kpi-card > small {
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
  }

  .tests-kpi-card.is-success {
    border-color: rgba(73, 198, 105, 0.25);
  }

  .tests-kpi-card.is-danger {
    border-color: rgba(255, 91, 91, 0.23);
  }

  .tests-sidebar-properties {
    display: grid;
    gap: 15px;
  }

  .tests-sidebar-property {
    display: grid;
    grid-template-columns: minmax(92px, 0.8fr) minmax(0, 1.2fr);
    align-items: start;
    gap: 16px;
    font-size: 13px;
  }

  .tests-sidebar-property > span:first-child {
    color: rgba(255, 255, 255, 0.46);
  }

  .tests-sidebar-property > strong {
    min-width: 0;
    color: rgba(255, 255, 255, 0.82);
    font-weight: 500;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .tests-sidebar-property .tests-status-label {
    justify-self: end;
  }

  .tests-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .tests-form-field {
    display: grid;
    align-content: start;
    gap: 8px;
    min-width: 0;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 600;
  }

  .tests-form-field.is-span-2 {
    grid-column: 1 / -1;
  }

  .tests-form-field input,
  .tests-form-field textarea,
  .tests-definition-editor {
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

  .tests-form-field input {
    height: 39px;
    padding: 0 11px;
  }

  .tests-form-field textarea {
    min-height: 84px;
    padding: 10px 11px;
    resize: vertical;
  }

  .tests-form-field input:focus,
  .tests-form-field textarea:focus,
  .tests-definition-editor:focus {
    border-color: rgba(74, 167, 255, 0.58);
    background: rgba(74, 167, 255, 0.045);
  }

  .tests-definition-editor {
    min-height: 420px;
    padding: 16px;
    resize: vertical;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 12px;
    line-height: 1.55;
    tab-size: 2;
  }

  .tests-table-identity {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .tests-table-identity > svg {
    flex: 0 0 auto;
    color: #69b6ff;
  }

  .tests-table-identity > span {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .tests-table-identity strong {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.86);
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-table-identity small {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    font-weight: 450;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-version-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.84);
    font-weight: 600;
  }

  .tests-version-label em {
    border-radius: 999px;
    padding: 3px 7px;
    color: #86e29d;
    background: rgba(45, 147, 72, 0.13);
    font-size: 10px;
    font-style: normal;
    font-weight: 650;
  }

  .tests-inline-error {
    margin: 20px 28px 0;
    padding: 13px 15px;
    color: #ff9b9b;
    border-color: rgba(255, 91, 91, 0.25);
    background: rgba(155, 37, 37, 0.12);
    font-size: 13px;
  }

  .tests-create-modal__body {
    display: grid;
    gap: 24px;
  }

  .tests-create-modal__case {
    display: grid;
    gap: 18px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tests-create-modal__case h3 {
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
    font-weight: 620;
  }

  .tests-section-kicker {
    color: rgba(255, 255, 255, 0.42);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .tests-spin {
    animation: tests-spin 900ms linear infinite;
  }

  @keyframes tests-spin {
    to { transform: rotate(360deg); }
  }

  .tests-result-evidence-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .tests-result-evidence-grid > div {
    display: grid;
    min-width: 0;
    gap: 7px;
  }

  .tests-result-evidence-grid span {
    color: rgba(255, 255, 255, 0.46);
    font-size: 11px;
    font-weight: 650;
  }

  .tests-result-evidence-grid pre,
  .tests-evidence-json {
    min-height: 72px;
    max-height: 300px;
    margin: 0;
    padding: 12px;
    overflow: auto;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    color: rgba(255, 255, 255, 0.72);
    background: rgba(0, 0, 0, 0.26);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .tests-evidence-banner {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px 19px;
    border: 1px solid rgba(74, 167, 255, 0.22);
    border-radius: 10px;
    color: #8cc7ff;
    background: rgba(42, 117, 190, 0.09);
  }

  .tests-evidence-banner.is-untrusted {
    color: #f4c978;
    border-color: rgba(232, 177, 70, 0.24);
    background: rgba(155, 104, 18, 0.1);
  }

  .tests-evidence-banner > div {
    display: grid;
    gap: 4px;
  }

  .tests-evidence-banner strong {
    color: rgba(255, 255, 255, 0.88);
    font-size: 13px;
  }

  .tests-evidence-banner span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }

  .tests-evidence-identity {
    display: grid;
    margin: 0;
    gap: 13px;
  }

  .tests-evidence-identity > div {
    display: grid;
    grid-template-columns: minmax(150px, 0.4fr) minmax(0, 1fr);
    gap: 20px;
  }

  .tests-evidence-identity dt {
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }

  .tests-evidence-identity dd {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .tests-artifact-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #8cc7ff;
    text-decoration: none;
  }

  .tests-artifact-link:hover {
    color: #b8ddff;
  }

  .tests-access-add-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  @media (max-width: 1080px) {
    .tests-kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 780px) {
    .tests-overview-guide__cards,
    .tests-form-grid,
    .tests-result-evidence-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .tests-form-field.is-span-2 {
      grid-column: auto;
    }

    .tests-detail-stack {
      padding-inline: 18px;
    }

    .tests-inline-error {
      margin-inline: 18px;
    }
  }

  @media (max-width: 560px) {
    .tests-kpi-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
