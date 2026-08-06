export const PLAYGROUND_TESTS_CSS = String.raw`
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
    width: 100%;
    min-height: 0;
  }

  .tests-detail-content {
    min-width: 0;
  }

  .tests-detail-stack {
    display: grid;
    align-content: start;
    gap: 24px;
    padding: 0;
  }

  .tests-detail-sidebar {
    padding-top: 0;
  }

  .tests-detail-analytics {
    width: 100%;
  }

  .tests-cases-panel,
  .tests-cases-table {
    width: 100%;
    min-width: 0;
  }

  .tests-detail-run-button.platform-button {
    width: 100%;
    margin-top: 8px;
  }

  .tests-detail-truncated-property .platform-service-detail-page__property-value {
    min-width: 0;
  }

  .tests-detail-truncated-property__value {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-detail-identity-row .platform-service-detail-page__property-value,
  .tests-detail-owner-row .platform-service-detail-page__property-value {
    min-width: 0;
    overflow: visible;
  }

  .tests-detail-identity-row .resource-overview-identity,
  .tests-detail-owner-selector .resource-overview-identity {
    width: 100%;
    min-width: 0;
    justify-content: flex-end;
  }

  .tests-detail-identity-row .resource-overview-identity__visual,
  .tests-detail-owner-selector .resource-overview-identity__visual,
  .tests-detail-owner-option-avatar {
    box-sizing: border-box;
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    border-radius: 50%;
  }

  .tests-detail-owner-option-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.82);
    font-size: 9px;
    font-weight: 400;
  }

  .tests-detail-owner-option-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tests-detail-owner-row {
    width: 100%;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tests-detail-owner-selector,
  .tests-detail-owner-trigger {
    width: 100%;
  }

  .tests-detail-owner-trigger {
    justify-content: flex-end;
  }

  .playground-tests-section-controls,
  .tests-detail-header-switch,
  .tests-case-detail-header-switch {
    min-width: 0;
  }

  .tests-case-detail-page {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    max-width: none;
    min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .tests-case-detail-identity {
    box-sizing: border-box;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tests-case-detail-title-input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    border-radius: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.96);
    font: inherit;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 400;
    letter-spacing: 0;
  }

  .tests-case-detail-description-input {
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    line-height: 1.5;
  }

  .tests-case-detail-title-input::placeholder,
  .tests-case-detail-description-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  .tests-case-detail-notice {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 24px;
    border-bottom: 1px solid rgba(255, 91, 91, 0.2);
    color: #ff9b9b;
    background: rgba(155, 37, 37, 0.1);
    font-size: 12px;
    line-height: 1.45;
  }

  .tests-case-detail-workspace {
    min-height: 0;
    flex: 1 1 0;
  }

  .tests-case-detail-editor {
    box-sizing: border-box;
    width: 100%;
    min-height: 0;
    flex: 1 1 0;
    margin: 0;
    padding: 16px 18px;
    border: 0;
    outline: 0;
    border-radius: 0;
    background: #000;
    color: rgba(255, 255, 255, 0.92);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
    line-height: 1.6;
    resize: none;
    tab-size: 2;
  }

  .tests-case-detail-settings-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .tests-case-detail-settings-title {
    margin: 0;
    color: #fff;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 400;
  }

  .tests-case-detail-configuration {
    min-width: 0;
  }

  .tests-case-detail-configuration-row {
    min-width: 0;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    line-height: 1.4;
  }

  .tests-case-detail-configuration-row + .tests-case-detail-configuration-row {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tests-case-detail-configuration-label {
    min-width: 0;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }

  .tests-case-detail-setting-selector {
    min-width: 160px;
  }

  .tests-case-detail-setting-input {
    box-sizing: border-box;
    width: min(320px, 50%);
    min-width: 160px;
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 7px;
    outline: 0;
    background: transparent;
    color: #fff;
    font: inherit;
    text-align: right;
  }

  .tests-case-detail-setting-input.is-number {
    width: 96px;
    min-width: 96px;
  }

  .tests-case-detail-setting-input:focus {
    border-color: rgba(74, 167, 255, 0.58);
    background: rgba(74, 167, 255, 0.045);
  }

  .tests-case-detail-sidebar-card.platform-ui-card {
    min-width: 0;
  }

  .tests-case-detail-delete-button.platform-button {
    width: 100%;
    margin-top: 12px;
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
    margin: 0;
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

  .tests-case-create-modal__body,
  .tests-case-create-modal__contract,
  .tests-case-create-modal__assertions,
  .tests-plan-save-modal .platform-modal__body {
    display: grid;
    gap: 20px;
  }

  .tests-case-method-fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .tests-case-method-fieldset legend {
    margin-bottom: 9px;
    color: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 600;
  }

  .tests-case-method-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .tests-case-method-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-content: start;
    gap: 8px 10px;
    min-height: 128px;
    padding: 13px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9px;
    color: rgba(255, 255, 255, 0.68);
    background: rgba(255, 255, 255, 0.025);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease;
  }

  .tests-case-method-card:hover,
  .tests-case-method-card.is-selected {
    border-color: rgba(74, 167, 255, 0.5);
    background: rgba(74, 167, 255, 0.08);
  }

  .tests-case-method-card > svg {
    margin-top: 1px;
    color: #8cc7ff;
  }

  .tests-case-method-card > span {
    display: grid;
    gap: 4px;
  }

  .tests-case-method-card strong {
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    font-weight: 620;
  }

  .tests-case-method-card small,
  .tests-case-method-card em {
    color: rgba(255, 255, 255, 0.46);
    font-size: 10px;
    font-style: normal;
    line-height: 1.45;
  }

  .tests-case-method-card em {
    grid-column: 1 / -1;
    align-self: end;
  }

  .tests-case-create-modal__checks,
  .tests-evidence-policy {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
  }

  .tests-case-create-modal__checks label,
  .tests-evidence-policy label,
  .tests-form-checkbox-field label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 12px;
    font-weight: 480;
  }

  .tests-case-create-modal__assertions > div:first-child,
  .tests-case-detail-assertion-editor > div:first-child {
    display: grid;
    gap: 4px;
  }

  .tests-case-create-modal__assertions strong,
  .tests-evidence-policy > strong,
  .tests-case-detail-assertion-editor > div:first-child span {
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    font-weight: 620;
  }

  .tests-case-create-modal__assertions > div:first-child span,
  .tests-case-detail-assertion-editor > div:first-child small {
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
  }

  .tests-assertion-builder,
  .tests-assertion-builder__rows {
    display: grid;
    gap: 9px;
  }

  .tests-assertion-builder__header,
  .tests-assertion-builder__row {
    display: grid;
    grid-template-columns: minmax(110px, 1fr) minmax(150px, .8fr) minmax(120px, 1fr) 30px;
    gap: 8px;
    align-items: center;
  }

  .tests-assertion-builder__header {
    color: rgba(255, 255, 255, 0.38);
    font-size: 10px;
    font-weight: 620;
  }

  .tests-assertion-builder__row > input {
    box-sizing: border-box;
    width: 100%;
    height: 34px;
    padding: 0 9px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 7px;
    outline: 0;
    color: rgba(255, 255, 255, 0.82);
    background: rgba(255, 255, 255, 0.03);
    font: inherit;
    font-size: 11px;
  }

  .tests-assertion-builder__empty {
    padding: 16px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.42);
    font-size: 11px;
    line-height: 1.5;
  }

  .tests-case-detail-assertion-editor {
    display: grid;
    align-content: start;
    gap: 18px;
    height: 100%;
    box-sizing: border-box;
    padding: 20px;
    overflow: auto;
  }

  .tests-case-detail-configuration-value {
    max-width: 330px;
    color: rgba(255, 255, 255, 0.48);
    font-size: 11px;
    text-align: right;
  }

  .tests-plan-state-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(74, 167, 255, 0.2);
    border-radius: 8px;
    color: #8cc7ff;
    background: rgba(74, 167, 255, 0.06);
  }

  .tests-plan-state-banner.is-warning {
    border-color: rgba(244, 201, 120, 0.24);
    color: #f4c978;
    background: rgba(244, 201, 120, 0.06);
  }

  .tests-plan-state-banner > span {
    display: grid;
    gap: 2px;
    color: rgba(255, 255, 255, 0.56);
    font-size: 11px;
    line-height: 1.45;
  }

  .tests-plan-state-banner strong {
    color: rgba(255, 255, 255, 0.88);
    font-size: 12px;
  }

  .tests-table-truncated-value {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-evidence-policy {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .tests-evidence-policy > strong {
    flex: 0 0 100%;
  }

  .tests-advanced-definition {
    display: grid;
    gap: 14px;
  }

  .tests-advanced-definition summary {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
  }

  .tests-advanced-definition[open] .tests-definition-editor {
    margin-top: 14px;
  }

  .tests-plan-save-modal__summary,
  .tests-run-contract-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
  }

  .tests-plan-save-modal__summary strong,
  .tests-run-contract-summary strong {
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
  }

  .tests-plan-save-modal__summary span,
  .tests-run-contract-summary span {
    color: rgba(255, 255, 255, 0.44);
    font-size: 11px;
  }

  .tests-run-contract-summary > div {
    display: grid;
    gap: 4px;
  }

  .tests-run-contract-summary > div:last-child {
    text-align: right;
  }

  .tests-run-trust-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 16px 0;
    padding: 12px 14px;
    border: 1px solid rgba(244, 201, 120, 0.2);
    border-radius: 8px;
    color: #f4c978;
    background: rgba(244, 201, 120, 0.05);
  }

  .tests-run-trust-card.is-verified_worker {
    border-color: rgba(134, 226, 157, 0.22);
    color: #86e29d;
    background: rgba(134, 226, 157, 0.05);
  }

  .tests-run-trust-card > span {
    display: grid;
    gap: 3px;
    color: rgba(255, 255, 255, 0.48);
    font-size: 11px;
    line-height: 1.45;
  }

  .tests-run-trust-card strong {
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
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

  .tests-run-evidence-card.platform-ui-card {
    width: 100%;
  }

  .tests-run-evidence-card.is-trusted {
    border-color: rgba(74, 222, 128, 0.28);
  }

  .tests-run-evidence-card.is-untrusted {
    border-color: rgba(250, 204, 21, 0.28);
  }

  .tests-evidence-banner-copy {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .tests-evidence-banner-copy > svg {
    flex: 0 0 auto;
    margin-top: 1px;
    color: #8cc7ff;
  }

  .tests-run-evidence-card.is-trusted .tests-evidence-banner-copy > svg {
    color: #86e29d;
  }

  .tests-run-evidence-card.is-untrusted .tests-evidence-banner-copy > svg {
    color: #f4c978;
  }

  .tests-evidence-banner-copy > div {
    display: grid;
    gap: 4px;
  }

  .tests-evidence-banner-copy strong {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 600;
  }

  .tests-evidence-banner-copy span {
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    line-height: 1.55;
  }

  .tests-run-evidence-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 24px;
    margin: 18px 0 0;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tests-run-evidence-grid > div {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .tests-run-evidence-grid dt,
  .tests-run-evidence-grid dd {
    min-width: 0;
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
  }

  .tests-run-evidence-grid dt {
    color: rgba(255, 255, 255, 0.52);
  }

  .tests-run-evidence-grid dd {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.9);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  @media (max-width: 780px) {
    .tests-case-detail-identity {
      padding: 20px;
    }

    .tests-case-detail-configuration-row {
      align-items: stretch;
      flex-direction: column;
      gap: 8px;
    }

    .tests-case-detail-setting-input,
    .tests-case-detail-setting-input.is-number,
    .tests-case-detail-setting-selector {
      width: 100%;
      min-width: 0;
    }

    .tests-overview-guide__cards,
    .tests-case-method-grid,
    .tests-form-grid,
    .tests-result-evidence-grid,
    .tests-run-evidence-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .tests-assertion-builder__header {
      display: none;
    }

    .tests-assertion-builder__row {
      grid-template-columns: minmax(0, 1fr);
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
    }

    .tests-assertion-builder__row .platform-icon-button {
      justify-self: end;
    }

    .tests-case-detail-configuration-value {
      max-width: none;
      text-align: left;
    }

    .tests-form-field.is-span-2 {
      grid-column: auto;
    }

  }
`;
