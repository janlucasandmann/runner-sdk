export const PLAYGROUND_ASSURANCE_CSS = String.raw`
  .assurance-overview-guide {
    display: grid;
    gap: 28px;
  }

  .assurance-overview-guide__hero {
    max-width: 940px;
  }

  .assurance-overview-guide__cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }

  .resource-overview-page.is-assurance {
    --resource-overview-accent: #8f7bff;
  }

  .assurance-status-label {
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

  .assurance-status-label.is-passed,
  .assurance-status-label.is-active {
    color: #86e29d;
    border-color: rgba(73, 198, 105, 0.24);
    background: rgba(45, 147, 72, 0.13);
  }

  .assurance-status-label.is-failed,
  .assurance-status-label.is-cancelled {
    color: #ff9b9b;
    border-color: rgba(255, 91, 91, 0.24);
    background: rgba(181, 42, 42, 0.14);
  }

  .assurance-status-label.is-running,
  .assurance-status-label.is-pending {
    color: #9bcaff;
    border-color: rgba(74, 167, 255, 0.26);
    background: rgba(42, 117, 190, 0.15);
  }

  .assurance-status-label.is-blocked {
    color: #ffd58b;
    border-color: rgba(244, 173, 61, 0.28);
    background: rgba(164, 105, 21, 0.15);
  }

  .assurance-status-label.is-draft,
  .assurance-status-label.is-archived,
  .assurance-status-label.is-idle {
    color: rgba(255, 255, 255, 0.54);
  }

  .assurance-centered-state {
    display: grid;
    min-height: calc(100vh - 160px);
    place-items: center;
    padding: 32px;
  }

  .assurance-page-error,
  .assurance-form-error {
    margin: 0;
    color: #ff9696;
    font-size: 13px;
  }

  .assurance-detail-page {
    min-height: calc(100vh - var(--playground-navbar-height, 68px));
  }

  .assurance-detail-content {
    min-width: 0;
  }

  .assurance-detail-stack {
    display: grid;
    align-content: start;
    gap: 24px;
    padding: 24px 28px 48px;
  }

  .assurance-detail-sidebar {
    padding-top: 24px;
  }

  .assurance-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .assurance-kpi-card {
    display: grid;
    min-height: 126px;
    align-content: center;
    gap: 8px;
    padding: 20px;
  }

  .assurance-kpi-card > span {
    color: rgba(255, 255, 255, 0.52);
    font-size: 12px;
    font-weight: 650;
    letter-spacing: 0.02em;
  }

  .assurance-kpi-card > strong {
    color: #f7f7f7;
    font-size: 28px;
    font-weight: 650;
    letter-spacing: -0.035em;
  }

  .assurance-kpi-card > small {
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
  }

  .assurance-kpi-card.is-success {
    border-color: rgba(73, 198, 105, 0.25);
  }

  .assurance-kpi-card.is-danger {
    border-color: rgba(255, 91, 91, 0.23);
  }

  .assurance-kpi-card.is-warning {
    border-color: rgba(244, 173, 61, 0.25);
  }

  .assurance-sidebar-properties {
    display: grid;
    gap: 15px;
  }

  .assurance-sidebar-property {
    display: grid;
    grid-template-columns: minmax(92px, 0.8fr) minmax(0, 1.2fr);
    align-items: start;
    gap: 16px;
    font-size: 13px;
  }

  .assurance-sidebar-property > span:first-child {
    color: rgba(255, 255, 255, 0.46);
  }

  .assurance-sidebar-property > strong {
    min-width: 0;
    color: rgba(255, 255, 255, 0.82);
    font-weight: 500;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .assurance-sidebar-property .assurance-status-label {
    justify-self: end;
  }

  .assurance-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .assurance-form-field {
    display: grid;
    align-content: start;
    gap: 8px;
    min-width: 0;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 600;
  }

  .assurance-form-field.is-span-2 {
    grid-column: 1 / -1;
  }

  .assurance-form-field input,
  .assurance-form-field textarea,
  .assurance-definition-editor {
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

  .assurance-form-field input {
    height: 39px;
    padding: 0 11px;
  }

  .assurance-form-field textarea {
    min-height: 84px;
    padding: 10px 11px;
    resize: vertical;
  }

  .assurance-form-field input:focus,
  .assurance-form-field textarea:focus,
  .assurance-definition-editor:focus {
    border-color: rgba(143, 123, 255, 0.58);
    background: rgba(143, 123, 255, 0.045);
  }

  .assurance-definition-editor {
    min-height: 440px;
    padding: 16px;
    resize: vertical;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 12px;
    line-height: 1.55;
    tab-size: 2;
  }

  .assurance-table-identity {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .assurance-table-identity > svg {
    flex: 0 0 auto;
    color: #a596ff;
  }

  .assurance-table-identity > span {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .assurance-table-identity strong {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.86);
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .assurance-table-identity small {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    font-weight: 450;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .assurance-version-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.84);
    font-weight: 600;
  }

  .assurance-version-label em {
    border-radius: 999px;
    padding: 3px 7px;
    color: #86e29d;
    background: rgba(45, 147, 72, 0.13);
    font-size: 10px;
    font-style: normal;
    font-weight: 650;
  }

  .assurance-mono,
  .assurance-event-payload {
    color: rgba(255, 255, 255, 0.6);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .assurance-event-payload {
    display: block;
    max-width: 420px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .assurance-inline-error {
    margin: 20px 28px 0;
    padding: 13px 15px;
    color: #ff9b9b;
    border-color: rgba(255, 91, 91, 0.25);
    background: rgba(155, 37, 37, 0.12);
    font-size: 13px;
  }

  .assurance-create-modal__body {
    display: grid;
    gap: 24px;
  }

  .assurance-form-notice {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid rgba(244, 173, 61, 0.24);
    border-radius: 8px;
    color: #ffd58b;
    background: rgba(164, 105, 21, 0.1);
    font-size: 12px;
  }

  .assurance-decision-banner,
  .assurance-evidence-banner {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px 19px;
    border: 1px solid rgba(143, 123, 255, 0.24);
    border-radius: 10px;
    color: #b6aaff;
    background: rgba(95, 72, 190, 0.1);
  }

  .assurance-decision-banner.is-passed {
    border-color: rgba(73, 198, 105, 0.25);
    color: #86e29d;
    background: rgba(45, 147, 72, 0.1);
  }

  .assurance-decision-banner.is-failed,
  .assurance-decision-banner.is-cancelled {
    border-color: rgba(255, 91, 91, 0.25);
    color: #ff9b9b;
    background: rgba(181, 42, 42, 0.1);
  }

  .assurance-decision-banner.is-blocked {
    border-color: rgba(244, 173, 61, 0.26);
    color: #ffd58b;
    background: rgba(164, 105, 21, 0.1);
  }

  .assurance-decision-banner > div,
  .assurance-evidence-banner > div {
    display: grid;
    gap: 4px;
  }

  .assurance-decision-banner strong,
  .assurance-evidence-banner strong {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
  }

  .assurance-decision-banner span,
  .assurance-evidence-banner span {
    color: rgba(255, 255, 255, 0.52);
    font-size: 12px;
  }

  .assurance-evidence-identity {
    display: grid;
    margin: 0;
    gap: 13px;
  }

  .assurance-evidence-identity > div {
    display: grid;
    grid-template-columns: minmax(170px, 0.4fr) minmax(0, 1fr);
    gap: 20px;
  }

  .assurance-evidence-identity dt {
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }

  .assurance-evidence-identity dd {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .assurance-evidence-json {
    min-height: 160px;
    max-height: 520px;
    margin: 0;
    padding: 14px;
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

  .assurance-access-add-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .assurance-spin {
    animation: assurance-spin 900ms linear infinite;
  }

  .assurance-danger-button {
    color: #ff9b9b;
  }

  @keyframes assurance-spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1080px) {
    .assurance-kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 780px) {
    .assurance-overview-guide__cards,
    .assurance-form-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .assurance-form-field.is-span-2 {
      grid-column: auto;
    }

    .assurance-detail-stack {
      padding-inline: 18px;
    }

    .assurance-inline-error {
      margin-inline: 18px;
    }

    .assurance-evidence-identity > div {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
    }
  }

  @media (max-width: 560px) {
    .assurance-kpi-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
