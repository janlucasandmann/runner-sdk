export const METRONOME_INSPECTOR_CSS_01_FRAGMENT = String.raw`
      .playground-metronome-inspector-header {
        min-height: 78px;
        padding: 12px 14px 11px;
        border-bottom: 0;
        background: transparent;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: 5px;
      }

      .playground-metronome-inspector-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
      }

      .playground-metronome-inspector-navbar-title {
        flex: 1 1 auto;
        min-width: 0;
      }

      .playground-metronome-inspector-navbar-title .playground-tasks-detail-navbar-title-main {
        min-width: 0;
        display: flex;
        align-items: center;
      }

      .playground-metronome-inspector-title-input {
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-inspector-title-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-inspector-title-description {
        margin-top: 2px;
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.48);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .playground-metronome-inspector-node-kind {
        flex: 0 0 auto;
        color: #66a6ff;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-metronome-inspector-node-kind.is-icon {
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-inspector-close {
        flex: 0 0 auto;
      }

      .playground-metronome-inspector-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-left: auto;
      }

      .playground-metronome-inspector-delete:not(:disabled) {
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-metronome-inspector-delete:not(:disabled):hover {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-inspector-body {
        flex: 1 1 auto;
        min-height: 0;
        padding: 12px 14px 24px;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 0;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .playground-metronome-inspector-body::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .playground-metronome-inspector-body > * {
        flex: 0 0 auto;
        min-height: 0;
      }

      .playground-metronome-inspector-fieldset {
        min-width: 0;
        min-inline-size: 0;
        border: 0;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-node-inspector.is-readonly .playground-metronome-inspector-body {
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-metronome-node-inspector.is-readonly .playground-metronome-inspector-body button,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-inspector-body input,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-inspector-body select,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-inspector-body textarea,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-inline-code-editor,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-agent-selector-field,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-workspace-selector-field,
      .playground-metronome-node-inspector.is-readonly .playground-tasks-detail-description-editor {
        cursor: default;
      }

      .playground-metronome-node-inspector.is-readonly .playground-metronome-inline-code-editor,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-agent-selector-field,
      .playground-metronome-node-inspector.is-readonly .playground-metronome-workspace-selector-field {
        pointer-events: none;
      }

      .playground-metronome-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-metronome-field-label {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 600;
      }

      .playground-metronome-input,
      .playground-metronome-select,
      .playground-metronome-textarea {
        width: 100%;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 13px;
        outline: none;
      }

      .playground-metronome-input,
      .playground-metronome-select {
        height: 40px;
        padding: 0 12px;
      }

      .playground-metronome-textarea {
        min-height: 92px;
        resize: vertical;
        padding: 11px 12px;
        line-height: 1.45;
      }

      .playground-metronome-media-switch {
        width: 100%;
        min-height: 34px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        border-radius: 999px;
        padding: 3px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-media-switch-button {
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.56);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        min-height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        cursor: pointer;
        transition: background-color 140ms ease, color 140ms ease;
      }

      .playground-metronome-media-switch-button.is-active {
        background: rgba(255, 255, 255, 0.18);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-inspector-note {
        border-radius: 14px;
        padding: 12px;
        background: rgba(102, 166, 255, 0.09);
        color: rgba(214, 230, 255, 0.9);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-node-inspector .playground-metronome-field {
        flex: 0 0 auto;
        gap: 8px;
        padding: 0 0 12px;
        border-bottom: 0;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-database-document-field {
        border-bottom: 0;
        padding-bottom: 0;
      }

      .playground-metronome-node-inspector .playground-metronome-field:first-child {
        padding-top: 4px;
      }

      .playground-metronome-node-inspector .playground-metronome-node-name-field {
        padding-bottom: 0;
      }

      .playground-metronome-node-inspector .playground-metronome-field-label {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-metronome-node-inspector .playground-metronome-field-label.playground-metronome-field-title {
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-metronome-node-inspector .playground-metronome-input,
      .playground-metronome-node-inspector .playground-metronome-select,
      .playground-metronome-node-inspector .playground-metronome-textarea {
        border: 0;
        border-radius: 0;
        background: transparent;
        padding: 0;
        min-height: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-node-inspector .playground-metronome-input,
      .playground-metronome-node-inspector .playground-metronome-select {
        height: 28px;
      }

      .playground-metronome-node-inspector .playground-metronome-select {
        cursor: pointer;
      }

      .playground-metronome-node-inspector .playground-metronome-textarea {
        min-height: 64px;
        resize: none;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-input),
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select),
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-inspector-central-selector) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 8px;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-node-type-field:has(> .playground-metronome-select),
      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-node-type-field:has(> .playground-metronome-inspector-central-selector) {
        padding-bottom: 24px;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-inspector-central-selector) > .playground-metronome-field-label {
        flex: 0 0 50px;
        min-width: 50px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
      }

      .playground-metronome-node-inspector .playground-metronome-project-trigger-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-project-trigger-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
        flex-basis: 84px;
        min-width: 84px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-thread-output-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-thread-output-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
        flex-basis: 80px;
        min-width: 80px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-imagine-model-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
        flex-basis: 86px;
        min-width: 86px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-database-input-source-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
        flex-basis: 84px;
        min-width: 84px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-database-upsert-key-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
        flex-basis: 74px;
        min-width: 74px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-firecrawl-output-key-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
        flex-basis: 74px;
        min-width: 74px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-firecrawl-source-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
        flex-basis: 112px;
        min-width: 112px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-table-fallback-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-table-batch-size-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-table-output-key-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
        flex-basis: 78px;
        min-width: 78px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-loop-input-binding-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-loop-item-limit-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
        flex-basis: 104px;
        min-width: 104px;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-function-type-field:has(> .playground-metronome-select) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-function-method-field:has(> .playground-metronome-select) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-function-url-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
        flex-basis: 72px;
        min-width: 72px;
        white-space: nowrap;
      }

      .playground-metronome-function-headers-field {
        gap: 10px;
      }

      .playground-metronome-function-headers-field > .playground-metronome-field-title {
        margin-top: 12px;
      }

      .playground-metronome-function-headers-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-metronome-function-header-row {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr) 24px;
        align-items: center;
        gap: 6px;
      }

      .playground-metronome-function-header-row .playground-metronome-input,
      .playground-metronome-function-header-row .playground-metronome-select {
        width: 100%;
        min-width: 0;
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding: 0 12px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 30px;
        text-align: left;
      }

      .playground-metronome-function-header-delete {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        padding: 0;
        border-radius: 999px;
        cursor: pointer;
      }

      .playground-metronome-function-header-delete:disabled {
        opacity: 0.35;
        cursor: default;
      }

      .playground-metronome-function-header-delete:not(:disabled):hover {
        color: rgba(255, 255, 255, 0.92);
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-metronome-function-header-actions {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-top: 6px;
      }

      .playground-metronome-function-header-link {
        border: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        padding: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .playground-metronome-function-header-link:hover {
        color: #8bbbff;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-input) > .playground-metronome-input,
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select) > .playground-metronome-select {
        flex: 1 1 auto;
        min-width: 0;
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding: 0 12px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 30px;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-input) > .playground-metronome-input {
        flex: 0 1 calc(100% - 114px);
        max-width: calc(100% - 114px);
        margin-left: auto;
        text-align: left;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select) > .playground-metronome-select {
        background: transparent;
        border-radius: 0;
        padding: 0 0 0 8px;
        text-align: right;
        text-align-last: right;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-metronome-inspector-central-selector {
        min-width: 0;
        --platform-control-height: 30px;
      }

      .playground-metronome-node-inspector .playground-metronome-field > .playground-metronome-inspector-central-selector {
        width: 0;
        min-width: 0;
        max-width: none;
        height: auto;
        flex: 1 1 0%;
        align-self: stretch;
        margin-left: auto;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        line-height: normal;
      }

      .playground-metronome-node-inspector .playground-metronome-field > .playground-metronome-inspector-central-selector .playground-metronome-inspector-central-selector-trigger {
        width: 100%;
        min-width: 0;
        min-height: 30px;
        justify-content: flex-end;
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        font-weight: 400;
        line-height: 30px;
        text-align: right;
      }

      .playground-metronome-node-inspector .playground-metronome-field > .playground-metronome-inspector-central-selector .platform-selector__value {
        max-width: calc(100% - 18px);
        justify-content: flex-end;
      }

      .playground-metronome-inspector-selector-selection {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 7px;
      }

      .playground-metronome-inspector-selector-selection-leading {
        display: inline-flex;
        flex: 0 0 auto;
      }

      .playground-metronome-inspector-selector-selection-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-node-inspector .playground-metronome-inspector-selector-field {
        flex: 0 0 auto;
        align-self: stretch;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        min-height: 0;
        padding: 0 0 8px;
        border: 0;
        border-radius: 0;
        background: transparent;
        overflow: visible;
        box-sizing: border-box;
      }

      .playground-metronome-node-inspector .playground-metronome-inspector-selector-field > .playground-metronome-field-label {
        flex: 0 0 64px;
        min-width: 64px;
        min-height: 0;
        margin: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        white-space: nowrap;
      }

      .playground-metronome-email-address-control {
        display: flex;
        align-items: center;
        gap: 0;
        width: 100%;
        min-width: 0;
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
      }

      .playground-metronome-node-inspector .playground-metronome-email-local-input {
        width: auto;
        flex: 1 1 0;
        min-width: 0;
        padding-right: 0;
      }

      .playground-metronome-email-domain {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.45;
        padding-left: 0;
        white-space: nowrap;
      }

      .playground-metronome-email-filter-stack {
        display: flex;
        flex-direction: column;
        margin-top: 12px;
      }

      .playground-metronome-node-inspector .playground-metronome-schedule-settings,
      .playground-metronome-schedule-settings {
        position: relative;
        flex: 0 0 auto;
        margin: 0 0 12px;
        padding: 14px 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.1);
        box-shadow: none;
        overflow: visible;
        isolation: isolate;
      }

      .playground-metronome-node-inspector .playground-metronome-schedule-settings::before,
      .playground-metronome-schedule-settings::before {
        content: none;
        display: none;
      }

      .playground-metronome-node-inspector .playground-metronome-schedule-settings > *,
      .playground-metronome-schedule-settings > * {
        position: relative;
        z-index: 3;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-facts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 0;
        margin-bottom: 0;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-section-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-facts-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-fact {
        display: grid;
        grid-template-columns: minmax(76px, 90px) minmax(0, 1fr);
        min-height: 30px;
        align-items: center;
        gap: 12px;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-fact-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-fact-control {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-metronome-schedule-settings .playground-tasks-schedule-anchor {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        min-height: 32px;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-select-trigger {
        width: auto;
        max-width: 100%;
        min-height: 32px;
        margin-left: auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        font-size: 12px;
        line-height: 1.35;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        text-align: right;
        cursor: pointer;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-select-trigger:hover,
      .playground-metronome-schedule-settings .playground-tasks-detail-select-trigger.is-active {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-select-trigger-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-schedule-settings .playground-tasks-detail-select-trigger-chevron {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
      }

      .playground-metronome-schedule-popover {
        width: min(320px, calc(100vw - 40px));
        overflow: hidden;
      }

      .playground-metronome-schedule-popover-body {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-metronome-schedule-popover .tb-popup-field-row {
        margin-bottom: 8px;
      }

      .playground-metronome-schedule-settings .tb-popup-panel-section,
      .playground-metronome-schedule-popover .tb-popup-panel-section {
        padding: 0;
        margin: 0;
      }

      .playground-metronome-schedule-settings .tb-popup-nav,
      .playground-metronome-schedule-popover .tb-popup-nav {
        width: fit-content;
        max-width: 100%;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 3px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      .playground-metronome-schedule-settings .tb-popup-nav-button,
      .playground-metronome-schedule-popover .tb-popup-nav-button {
        min-height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
      }

      .playground-metronome-schedule-settings .tb-popup-nav-button.active,
      .playground-metronome-schedule-popover .tb-popup-nav-button.active {
        background: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-schedule-settings .playground-metronome-schedule-popover .tb-popup-nav {
        width: 100%;
      }

      .playground-metronome-schedule-popover .tb-popup-nav {
        width: 100%;
      }

      .playground-metronome-schedule-settings .playground-metronome-schedule-popover .tb-popup-nav-button,
      .playground-metronome-schedule-popover .tb-popup-nav-button {
        flex: 1 1 0;
      }

      .playground-metronome-schedule-settings .tb-popup-field-row,
      .playground-metronome-schedule-popover .tb-popup-field-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }

      .playground-metronome-schedule-settings .tb-popup-field-row-followup,
      .playground-metronome-schedule-popover .tb-popup-field-row-followup {
        margin-top: 14px;
      }

      .playground-metronome-schedule-settings .tb-popup-field-label,
      .playground-metronome-schedule-popover .tb-popup-field-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-metronome-schedule-settings .tb-popup-select-wrap,
      .playground-metronome-schedule-settings .tb-popup-select-wrap-schedule,
      .playground-metronome-schedule-popover .tb-popup-select-wrap,
      .playground-metronome-schedule-popover .tb-popup-select-wrap-schedule {
        position: relative;
        width: 100%;
        margin: 0;
        border-radius: 999px;
        background: transparent;
      }

      .playground-metronome-schedule-settings .tb-popup-select-wrap::before,
      .playground-metronome-schedule-settings .tb-popup-select-wrap-schedule::before,
      .playground-metronome-schedule-popover .tb-popup-select-wrap::before,
      .playground-metronome-schedule-popover .tb-popup-select-wrap-schedule::before {
        display: none;
      }

      .playground-metronome-schedule-settings .tb-popup-select,
      .playground-metronome-schedule-settings .tb-popup-select-schedule,
      .playground-metronome-schedule-popover .tb-popup-select,
      .playground-metronome-schedule-popover .tb-popup-select-schedule {
        width: 100%;
        height: 32px;
        padding: 0 13px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: rgba(255, 255, 255, 0.92);
        color-scheme: dark;
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        outline: none;
      }

      .playground-metronome-schedule-settings .tb-popup-select-schedule::-webkit-calendar-picker-indicator,
      .playground-metronome-schedule-popover .tb-popup-select-schedule::-webkit-calendar-picker-indicator {
        opacity: 0;
        pointer-events: none;
      }

      .playground-metronome-schedule-settings .tb-popup-preset-list,
      .playground-metronome-schedule-popover .tb-popup-preset-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-metronome-schedule-settings .tb-popup-preset-row,
      .playground-metronome-schedule-popover .tb-popup-preset-row {
        width: 100%;
        min-height: 34px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        text-align: left;
      }

      .playground-metronome-schedule-settings .tb-popup-preset-row:hover,
      .playground-metronome-schedule-settings .tb-popup-preset-row.selected,
      .playground-metronome-schedule-popover .tb-popup-preset-row:hover,
      .playground-metronome-schedule-popover .tb-popup-preset-row.selected {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-schedule-settings .tb-popup-check-slot,
      .playground-metronome-schedule-popover .tb-popup-check-slot {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-metronome-schedule-settings .tb-popup-check,
      .playground-metronome-schedule-popover .tb-popup-check {
        width: 13px;
        height: 13px;
      }

      .playground-metronome-field-hint {
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-node-inspector .playground-metronome-thread-command-field {
        flex-wrap: wrap;
      }

      .playground-metronome-thread-command-status {
        width: calc(100% - 64px);
        margin: -2px 0 0 auto;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.35;
        text-align: right;
      }

      .playground-metronome-thread-command-status.is-available {
        color: rgba(108, 219, 160, 0.86);
      }

      .playground-metronome-thread-command-status.is-taken,
      .playground-metronome-thread-command-status.is-invalid,
      .playground-metronome-thread-command-status.is-error {
        color: rgba(255, 118, 118, 0.86);
      }

      .playground-metronome-firecrawl-credential-hint.playground-metronome-field-hint {
        margin-top: 0;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-metronome-github-setup-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 10px;
        padding: 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-github-setup-card::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-github-setup-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-metronome-github-setup-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .playground-metronome-github-setup-step {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        gap: 8px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-github-setup-step-index {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.72);
        font-size: 10px;
        font-weight: 400;
      }

      .playground-metronome-github-setup-step strong {
        color: rgba(255, 255, 255, 0.88);
        font-weight: 500;
      }

      .playground-metronome-github-setup-code {
        color: rgba(255, 255, 255, 0.88);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 11px;
        white-space: nowrap;
      }

      .playground-metronome-trigger-diagnostics {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 12px;
        padding: 14px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-metronome-trigger-diagnostics::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 1;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-metronome-trigger-diagnostics > * {
        position: relative;
        z-index: 2;
      }

      .playground-metronome-trigger-diagnostics-header,
      .playground-metronome-trigger-diagnostics-row-top,
      .playground-metronome-trigger-diagnostics-row-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
      }

      .playground-metronome-trigger-diagnostics-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-metronome-trigger-diagnostics-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex: 0 0 auto;
      }

      .playground-metronome-trigger-diagnostics-meta,
      .playground-metronome-trigger-diagnostics-row-meta,
      .playground-metronome-trigger-diagnostics-empty {
        color: rgba(255, 255, 255, 0.44);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-metronome-trigger-diagnostics-empty {
        padding: 2px 0 1px;
      }

      .playground-metronome-trigger-diagnostics-empty.is-error {
        color: rgba(255, 118, 118, 0.82);
      }

      .playground-metronome-trigger-diagnostics-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-metronome-trigger-diagnostics-row {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding-top: 10px;
        border-top: 1px dotted rgba(255, 255, 255, 0.12);
      }

      .playground-metronome-trigger-diagnostics-row:first-child {
        padding-top: 0;
        border-top: 0;
      }

      .playground-metronome-trigger-diagnostics-summary {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.74);
        font-size: 12px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-trigger-diagnostics-status {
        flex: 0 0 auto;
        border-radius: 999px;
        padding: 3px 7px;
`;
