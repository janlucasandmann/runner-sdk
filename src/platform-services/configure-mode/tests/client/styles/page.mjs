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

  .tests-cases-table .platform-data-table__toolbar-title {
    font-size: 18px;
  }

  .tests-detail-run-button.platform-button {
    width: 100%;
    margin-top: 8px;
  }

  .tests-detail-target-row .platform-service-detail-page__property-value {
    min-width: 0;
    overflow: visible;
  }

  .tests-detail-target-selector,
  .tests-detail-target-trigger {
    width: 100%;
  }

  .tests-detail-target-trigger {
    max-width: 100%;
    justify-content: flex-end;
    text-align: right;
  }

  .tests-detail-target-selector-value {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
    width: 100%;
    min-width: 0;
  }

  .tests-detail-target-selector-value > svg {
    flex: 0 0 auto;
  }

  .tests-detail-target-selector-value > span {
    min-width: 0;
    overflow: hidden;
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

  .tests-form-field > small {
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    font-weight: 400;
    line-height: 1.45;
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

  .tests-plan-settings-identity {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tests-plan-settings-identity__icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.62);
    background: rgba(255, 255, 255, 0.075);
  }

  .tests-plan-settings-identity__copy {
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .tests-plan-settings-identity__name,
  .tests-plan-settings-identity__description {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    overflow: hidden;
    border: 0;
    outline: 0;
    background: transparent;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-plan-settings-identity__name {
    max-width: none;
    color: rgba(255, 255, 255, 0.96);
    font: inherit;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
  }

  .tests-plan-settings-identity__description {
    max-width: 620px;
    color: rgba(255, 255, 255, 0.6);
    font: inherit;
    font-size: 13px;
    font-weight: 400;
    line-height: 1.35;
  }

  .tests-plan-settings-identity__name::placeholder,
  .tests-plan-settings-identity__description::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  .tests-plan-settings-identity__description:focus {
    color: rgba(255, 255, 255, 0.82);
  }

  .tests-settings-page .tests-evidence-policy {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .tests-run-summary-card.platform-ui-card {
    padding: 18px;
    background: rgba(255, 255, 255, 0.045);
  }

  .tests-run-summary-card.is-passed {
    border-color: rgba(134, 226, 157, 0.2);
  }

  .tests-run-summary-card.is-failed,
  .tests-run-summary-card.is-completed_with_errors {
    border-color: rgba(255, 91, 91, 0.22);
  }

  .tests-run-summary-card__content {
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 13px;
  }

  .tests-run-summary-card__icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 34px;
    border-radius: 50%;
    color: #8cc7ff;
    background: rgba(74, 167, 255, 0.1);
  }

  .tests-run-summary-card.is-passed .tests-run-summary-card__icon {
    color: #86e29d;
    background: rgba(45, 147, 72, 0.12);
  }

  .tests-run-summary-card.is-failed .tests-run-summary-card__icon,
  .tests-run-summary-card.is-completed_with_errors .tests-run-summary-card__icon {
    color: #ff9b9b;
    background: rgba(181, 42, 42, 0.12);
  }

  .tests-run-summary-card__content > div {
    min-width: 0;
    display: grid;
    gap: 5px;
    flex: 1 1 auto;
  }

  .tests-run-summary-card h2,
  .tests-run-summary-card p {
    margin: 0;
  }

  .tests-run-summary-card h2 {
    color: rgba(255, 255, 255, 0.94);
    font-size: 16px;
    font-weight: 400;
    line-height: 1.35;
  }

  .tests-run-summary-card p {
    max-width: 760px;
    color: rgba(255, 255, 255, 0.56);
    font-size: 12px;
    line-height: 1.5;
  }

  .tests-run-summary-card__content > .platform-label {
    flex: 0 0 auto;
  }

  .tests-table-summary {
    display: block;
    min-width: 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.58);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-run-case-output-list {
    display: grid;
  }

  .tests-run-case-output {
    min-width: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
  }

  .tests-run-case-output:first-child {
    border-top: 1px solid rgba(255, 255, 255, 0.075);
  }

  .tests-run-case-output > summary {
    min-width: 0;
    min-height: 54px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 4px;
    color: inherit;
    cursor: pointer;
    list-style: none;
  }

  .tests-run-case-output > summary::-webkit-details-marker {
    display: none;
  }

  .tests-run-case-output__icon {
    display: inline-flex;
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.5);
  }

  .tests-run-case-output.is-passed .tests-run-case-output__icon {
    color: #86e29d;
  }

  .tests-run-case-output.is-failed .tests-run-case-output__icon,
  .tests-run-case-output.is-error .tests-run-case-output__icon {
    color: #ff9b9b;
  }

  .tests-run-case-output__copy {
    min-width: 0;
    display: grid;
    gap: 3px;
    flex: 1 1 auto;
  }

  .tests-run-case-output__copy strong,
  .tests-run-case-output__copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tests-run-case-output__copy strong {
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    font-weight: 500;
  }

  .tests-run-case-output__copy small {
    color: rgba(255, 255, 255, 0.42);
    font-size: 10px;
  }

  .tests-run-case-output__body {
    display: grid;
    gap: 14px;
    padding: 4px 4px 18px 30px;
  }

  .tests-run-case-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 0;
  }

  .tests-run-case-metadata > div {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .tests-run-case-metadata dt,
  .tests-run-case-metadata dd {
    margin: 0;
    font-size: 10px;
  }

  .tests-run-case-metadata dt {
    color: rgba(255, 255, 255, 0.4);
  }

  .tests-run-case-metadata dd {
    color: rgba(255, 255, 255, 0.72);
  }

  .tests-run-verification-card.platform-ui-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 18px;
    background: rgba(255, 255, 255, 0.035);
  }

  .tests-run-verification-card > svg {
    flex: 0 0 auto;
    margin-top: 1px;
    color: rgba(255, 255, 255, 0.5);
  }

  .tests-run-verification-card.is-trusted > svg {
    color: #86e29d;
  }

  .tests-run-verification-card.is-recorded > svg {
    color: #f4c978;
  }

  .tests-run-verification-card > div {
    min-width: 0;
    display: grid;
    gap: 4px;
    flex: 1 1 auto;
  }

  .tests-run-verification-card h2,
  .tests-run-verification-card p {
    margin: 0;
  }

  .tests-run-verification-card h2 {
    color: rgba(255, 255, 255, 0.88);
    font-size: 12px;
    font-weight: 500;
  }

  .tests-run-verification-card p {
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    line-height: 1.45;
  }

  .tests-run-verification-card > .platform-label {
    flex: 0 0 auto;
  }

  .tests-run-technical-details {
    min-width: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tests-run-technical-details > summary {
    min-height: 58px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    cursor: pointer;
    list-style: none;
  }

  .tests-run-technical-details > summary::-webkit-details-marker {
    display: none;
  }

  .tests-run-technical-details > summary > span {
    display: grid;
    gap: 4px;
  }

  .tests-run-technical-details > summary strong {
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    font-weight: 400;
  }

  .tests-run-technical-details > summary small {
    color: rgba(255, 255, 255, 0.42);
    font-size: 10px;
  }

  .tests-run-technical-details__body {
    display: grid;
    gap: 20px;
    padding: 4px 6px 18px;
  }

  .tests-run-raw-evidence {
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.075);
  }

  .tests-run-raw-evidence > summary {
    color: rgba(255, 255, 255, 0.62);
    font-size: 11px;
    cursor: pointer;
  }

  .tests-run-raw-evidence[open] .tests-evidence-json {
    margin-top: 12px;
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
    .tests-result-evidence-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .tests-run-summary-card__content,
    .tests-run-verification-card.platform-ui-card {
      flex-wrap: wrap;
    }

    .tests-run-summary-card__content > .platform-label,
    .tests-run-verification-card > .platform-label {
      margin-left: 46px;
    }

    .tests-run-case-output__body {
      padding-left: 4px;
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
