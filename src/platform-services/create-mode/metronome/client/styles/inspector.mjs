export const METRONOME_INSPECTOR_CSS = String.raw`
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

      .playground-metronome-select option {
        background: #171718;
        color: #fff;
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
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 8px;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-node-type-field:has(> .playground-metronome-select) {
        padding-bottom: 24px;
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-input) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-select) > .playground-metronome-field-label {
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

      .playground-metronome-node-inspector .playground-metronome-firecrawl-source-field:has(> .playground-metronome-select) > .playground-metronome-field-label,
      .playground-metronome-node-inspector .playground-metronome-firecrawl-fallback-field:has(> .playground-metronome-input) > .playground-metronome-field-label {
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
      .playground-metronome-function-header-row .playground-metronome-select,
      .playground-metronome-function-header-row .playground-metronome-custom-select-trigger {
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

      .playground-metronome-function-header-row .playground-metronome-custom-select-trigger {
        justify-content: space-between;
        gap: 8px;
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
        padding: 0 18px 0 8px;
        text-align: right;
        text-align-last: right;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-metronome-node-inspector .playground-metronome-field:has(> .playground-metronome-custom-select-trigger) > .playground-metronome-custom-select-trigger {
        width: auto;
        min-width: 0;
        max-width: calc(100% - 64px);
        margin-left: auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0;
        cursor: pointer;
        font: inherit;
        font-size: 12px;
        line-height: 30px;
        text-align: right;
        appearance: none;
        -webkit-appearance: none;
      }

      .playground-metronome-custom-select-trigger:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-metronome-custom-select-trigger-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-custom-select-trigger-icon {
        flex: 0 0 auto;
        margin-left: 12px;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-metronome-inspector-select-popup {
        --platform-popup-padding: 7px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transform-origin: top right;
      }

      .playground-metronome-inspector-select-search {
        height: 34px;
        flex: 0 0 auto;
        border: none;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 10px;
        color: rgba(255, 255, 255, 0.64);
      }

      .playground-metronome-inspector-select-search input {
        min-width: 0;
        flex: 1 1 auto;
        border: 0;
        outline: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
      }

      .playground-metronome-inspector-select-search input::placeholder {
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-metronome-inspector-select-list {
        margin-top: 7px;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: auto;
        padding-bottom: 1px;
        scrollbar-width: none;
      }

      .playground-metronome-inspector-select-list::-webkit-scrollbar {
        display: none;
      }

      .playground-metronome-inspector-select-option {
        width: 100%;
        height: auto;
        min-height: 0;
        flex: 0 0 auto;
        box-sizing: border-box;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        display: flex;
        gap: 7px;
        align-items: flex-start;
        padding: 7px 8px;
        text-align: left;
        cursor: pointer;
        font: inherit;
        line-height: normal;
      }

      .playground-metronome-inspector-select-option:hover,
      .playground-metronome-inspector-select-option:focus-visible,
      .playground-metronome-inspector-select-option.is-selected {
        background: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .playground-metronome-inspector-select-option-check {
        color: rgba(255, 255, 255, 0.86);
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 15px;
        padding-top: 0;
      }

      .playground-metronome-inspector-select-option-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .playground-metronome-inspector-select-option-label {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-inspector-select-option-description {
        display: block;
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.3;
        white-space: normal;
        overflow-wrap: anywhere;
      }

      .playground-metronome-inspector-select-empty {
        padding: 14px 9px 12px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.4;
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
        position: fixed;
        width: min(320px, calc(100vw - 40px));
        overflow: hidden;
        z-index: 100001;
        transform-origin: top right;
      }

      .playground-metronome-schedule-popover-header {
        height: 44px;
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) 40px;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-schedule-popover-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 600;
        line-height: 1.2;
        text-align: center;
      }

      .playground-metronome-schedule-popover-action {
        width: 100%;
        height: 100%;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.84);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-schedule-popover-action:hover {
        color: rgba(255, 255, 255, 0.98);
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
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.62);
        font-size: 10px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-metronome-trigger-diagnostics-status.is-matched {
        background: rgba(48, 209, 88, 0.14);
        color: rgba(148, 255, 177, 0.9);
      }

      .playground-metronome-trigger-diagnostics-status.is-ignored {
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-metronome-trigger-diagnostics-status.is-failed,
      .playground-metronome-trigger-diagnostics-status.is-unauthorized {
        background: rgba(255, 69, 58, 0.14);
        color: rgba(255, 149, 149, 0.92);
      }

      .playground-metronome-trigger-diagnostics-link {
        border: 0;
        padding: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        cursor: pointer;
      }

      .playground-metronome-trigger-diagnostics-link:hover,
      .playground-metronome-trigger-diagnostics-link:focus-visible {
        color: #8ebdff;
        text-decoration: underline;
        outline: none;
      }

      .playground-metronome-trigger-diagnostics-test {
        min-height: 25px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        padding: 0 10px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.86);
        font: inherit;
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        transition: background 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-metronome-trigger-diagnostics-test:hover,
      .playground-metronome-trigger-diagnostics-test:focus-visible {
        border-color: rgba(255, 255, 255, 0.24);
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.96);
        outline: none;
      }

      .playground-metronome-trigger-diagnostics-test:disabled {
        cursor: default;
        opacity: 0.58;
      }

      .playground-metronome-trigger-evaluate-row {
        display: flex;
        justify-content: flex-end;
        padding: 8px 0 0;
        text-align: right;
      }

      .playground-metronome-trigger-evaluate-row.is-thread-more-row {
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        transition: margin-bottom 180ms ease;
      }

      .playground-metronome-trigger-evaluate-row.is-thread-more-row.is-open {
        margin-bottom: 12px;
      }

      .playground-metronome-trigger-evaluate-link {
        border: 0;
        padding: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        cursor: pointer;
      }

      .playground-metronome-thread-more-toggle {
        border: 0;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        cursor: pointer;
      }

      .playground-metronome-thread-more-toggle:hover,
      .playground-metronome-thread-more-toggle:focus-visible {
        color: rgba(255, 255, 255, 0.92);
        outline: none;
      }

      .playground-metronome-thread-more-toggle-icon {
        flex: 0 0 auto;
        transition: transform 160ms ease;
      }

      .playground-metronome-thread-more-toggle.is-open .playground-metronome-thread-more-toggle-icon {
        transform: rotate(180deg);
      }

      .playground-metronome-thread-more-sections {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition: grid-template-rows 220ms ease, opacity 160ms ease;
      }

      .playground-metronome-thread-more-sections.is-open {
        grid-template-rows: 1fr;
        opacity: 1;
      }

      .playground-metronome-thread-more-sections-inner {
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .playground-metronome-trigger-evaluate-link:hover,
      .playground-metronome-trigger-evaluate-link:focus-visible {
        color: #8ebdff;
        text-decoration: underline;
        outline: none;
      }

      .playground-metronome-trigger-diagnostics-modal {
        width: min(560px, 100%);
      }

      .playground-metronome-trigger-diagnostics-modal .playground-metronome-trigger-diagnostics {
        margin-top: 0;
      }

      .playground-metronome-node-inspector .playground-metronome-type-description {
        margin-top: -18px;
        margin-bottom: 24px;
      }

      .playground-metronome-node-inspector .playground-metronome-loop-type-description {
        margin-bottom: 24px;
      }

      .playground-metronome-node-inspector .playground-metronome-workflow-selector-description {
        margin-top: 12px;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description {
        flex: 0 0 auto;
        min-height: 0;
        margin-top: 0;
        gap: 6px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description .playground-tasks-detail-section-header {
        margin-bottom: 4px;
      }

      .playground-metronome-prompt-title-row {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
      }

      .playground-metronome-field-tooltip {
        position: relative;
        width: 17px;
        height: 17px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.64);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: help;
      }

      .playground-metronome-field-tooltip-popover {
        position: absolute;
        left: calc(100% + 8px);
        top: 50%;
        width: 260px;
        transform: translateX(-4px) translateY(-50%);
        border-radius: 10px;
        padding: 9px 10px;
        background: rgba(26, 26, 27, 0.96);
        color: rgba(255, 255, 255, 0.76);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.45;
        opacity: 0;
        pointer-events: none;
        transition: opacity 140ms ease, transform 140ms ease;
        z-index: 20;
      }

      .playground-metronome-field-tooltip-popover.is-portal {
        position: fixed;
        left: auto;
        top: auto;
        opacity: 1;
        transform: none;
        pointer-events: none;
        z-index: 100002;
      }

      .playground-metronome-field-tooltip:hover .playground-metronome-field-tooltip-popover,
      .playground-metronome-field-tooltip:focus-visible .playground-metronome-field-tooltip-popover {
        opacity: 1;
        transform: translateX(0) translateY(-50%);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-help {
        margin: 0 0 10px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-editor {
        position: relative;
        min-height: 0;
        overflow: visible;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        cursor: text;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-editor.is-editing {
        min-height: 72px;
        overflow: visible;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        position: relative;
        inset: auto;
        display: block;
        grid-template-rows: none;
        width: 100%;
        height: auto;
        min-height: 0;
        flex: none;
        overflow: visible;
        background: transparent;
        pointer-events: none;
        z-index: 1;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-editor.is-editing .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        display: none;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-preview {
        padding: 0 0 8px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.6;
        min-height: 0;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-preview.tb-message-markdown,
      .playground-metronome-node-inspector .playground-tasks-detail-description-preview .tb-message-markdown,
      .playground-metronome-node-inspector .playground-tasks-detail-description-preview .tb-message-markdown-paragraph,
      .playground-metronome-node-inspector .playground-tasks-detail-description-preview .tb-message-markdown-list,
      .playground-metronome-node-inspector .playground-tasks-detail-description-preview .tb-message-markdown-heading {
        font-size: 12px;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input {
        display: block;
        width: 100%;
        min-width: 0;
        min-height: 72px;
        padding: 0 0 8px;
        border: 0;
        border-radius: 0;
        outline: none;
        background: transparent;
        color: transparent;
        caret-color: rgba(255, 255, 255, 0.96);
        font-family: inherit;
        font-size: 12px;
        line-height: 1.6;
        box-sizing: border-box;
        resize: none;
        overflow: hidden;
        position: absolute;
        inset: 0;
        z-index: 2;
        cursor: text;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input.is-editing {
        position: relative;
        height: auto;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input.is-preview {
        position: absolute;
        inset: 0;
        color: transparent;
        height: 100% !important;
        min-height: 0;
        padding: 0;
        caret-color: transparent;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input::placeholder {
        color: transparent;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input.is-editing::placeholder {
        color: rgba(255, 255, 255, 0.38);
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field {
        gap: 0;
        padding: 8px 0 12px;
        border-bottom: 0;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 18px;
        margin-bottom: 6px;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-section-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-format-actions {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-attachments-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-format-button {
        width: 24px;
        height: 24px;
        min-width: 24px;
        min-height: 24px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        padding: 4px;
        box-sizing: border-box;
        box-shadow: none;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-format-button:hover,
      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-format-button:focus-visible {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.96);
        outline: none;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-attachments-trigger.has-attachments {
        background: rgba(102, 166, 255, 0.1);
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-attachments-trigger.is-active {
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-instructions-attachments-popover {
        --platform-popup-padding: 10px;
        position: fixed;
        z-index: 100001;
        width: min(330px, calc(100vw - 32px));
        overflow: hidden;
        transform-origin: top right;
      }

      .playground-metronome-instructions-attachments-popover .playground-metronome-thread-attachments {
        border: 0;
        padding: 0;
        background: transparent;
      }

      .playground-metronome-instructions-attachments-popover .playground-tasks-attachments-toolbar {
        margin-bottom: 8px;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-description-editor {
        position: relative;
        min-height: 118px;
        overflow: hidden;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-instructions-highlight {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: auto;
        pointer-events: none;
        padding: 12px 13px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        line-height: 1.45;
        font-family: inherit;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        box-sizing: border-box;
        scrollbar-width: none;
      }

      .playground-metronome-instructions-highlight::-webkit-scrollbar {
        display: none;
      }

      .playground-metronome-instructions-highlight-token {
        color: #66a6ff;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-description-input {
        position: relative;
        z-index: 2;
        inset: auto;
        display: block;
        width: 100%;
        min-height: 118px;
        height: 118px;
        padding: 12px 13px;
        color: rgba(255, 255, 255, 0.72);
        caret-color: rgba(255, 255, 255, 0.96);
        background: transparent;
        font-size: 12px;
        line-height: 1.45;
        overflow: auto;
        resize: none;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-description-input.has-dynamic-highlight {
        color: transparent;
        -webkit-text-fill-color: transparent;
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-description-input.has-dynamic-highlight::placeholder {
        color: rgba(255, 255, 255, 0.48);
        -webkit-text-fill-color: rgba(255, 255, 255, 0.48);
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-tasks-detail-description-input::placeholder {
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-metronome-dynamic-content-trigger {
        color: rgba(255, 214, 92, 0.92);
      }

      .playground-metronome-node-inspector .playground-metronome-instructions-field .playground-metronome-dynamic-content-trigger.is-active,
      .playground-metronome-node-inspector .playground-metronome-instructions-attachments-trigger.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-dynamic-content-trigger:hover:not(.is-active),
      .playground-metronome-dynamic-content-trigger:focus-visible:not(.is-active) {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 225, 124, 0.98);
      }

      .playground-metronome-dynamic-content-picker {
        position: fixed;
        width: min(360px, calc(100vw - 24px));
        max-height: min(520px, calc(100dvh - 28px));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 0;
        border-radius: 15px;
        background: #1A1A1A;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        z-index: 2147483004;
      }

      .playground-metronome-dynamic-content-picker-header {
        padding: 20px 14px 0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 0;
      }

      .playground-metronome-dynamic-content-picker-title {
        display: flex;
        align-items: center;
        min-width: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.25;
        margin-bottom: 12px;
      }

      .playground-metronome-dynamic-content-picker-copy {
        margin-top: 2px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-metronome-dynamic-content-picker-close {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .playground-metronome-dynamic-content-picker-close:hover,
      .playground-metronome-dynamic-content-picker-close:focus-visible {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.92);
        outline: none;
      }

      .playground-metronome-dynamic-content-search {
        position: relative;
        margin: 10px 14px 12px;
      }

      .playground-metronome-dynamic-content-search svg {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.44);
        pointer-events: none;
      }

      .playground-metronome-dynamic-content-search input {
        width: 100%;
        min-width: 0;
        height: 34px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.9);
        padding: 0 10px 0 32px;
        font-size: 12px;
        outline: none;
        box-sizing: border-box;
      }

      .playground-metronome-dynamic-content-search input:focus {
        border-color: transparent;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-dynamic-content-list {
        min-height: 0;
        overflow: auto;
        padding: 0 8px 10px;
      }

      .playground-metronome-dynamic-content-group {
        padding: 6px 0 8px;
      }

      .playground-metronome-dynamic-content-group + .playground-metronome-dynamic-content-group {
        border-top: 1px solid rgba(255, 255, 255, 0.07);
      }

      .playground-metronome-dynamic-content-group-heading {
        padding: 7px 6px 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .playground-metronome-dynamic-content-group-title {
        color: rgba(255, 255, 255, 0.64);
        font-size: 11px;
        font-weight: 600;
        line-height: 1.3;
        text-transform: uppercase;
      }

      .playground-metronome-dynamic-content-group-subtitle {
        color: rgba(255, 255, 255, 0.36);
        font-size: 10px;
        line-height: 1.3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-dynamic-content-row {
        width: 100%;
        min-width: 0;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        padding: 9px 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        text-align: left;
        cursor: pointer;
      }

      .playground-metronome-dynamic-content-row:hover,
      .playground-metronome-dynamic-content-row:focus-visible {
        background: rgba(255, 255, 255, 0.08);
        outline: none;
      }

      .playground-metronome-dynamic-content-row-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-dynamic-content-row-label {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-dynamic-content-row-path {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.42);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 10px;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-dynamic-content-row-type {
        align-self: start;
        max-width: 96px;
        overflow: hidden;
        border-radius: 999px;
        padding: 3px 7px;
        background: rgba(102, 166, 255, 0.12);
        color: rgba(102, 166, 255, 0.96);
        font-size: 10px;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-dynamic-content-empty {
        padding: 22px 14px 24px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
      }

      .playground-metronome-output-contract-builder {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-metronome-output-contract-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-metronome-output-contract-row {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 8px;
        padding: 7px 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.045);
      }

      .playground-metronome-output-contract-key {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.84);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 11px;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-output-contract-type {
        border-radius: 999px;
        padding: 3px 7px;
        background: rgba(255, 255, 255, 0.07);
        color: rgba(255, 255, 255, 0.58);
        font-size: 10px;
        line-height: 1.2;
      }

      .playground-metronome-output-contract-delete {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.58);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-output-contract-delete:hover,
      .playground-metronome-output-contract-delete:focus-visible {
        background: rgba(255, 86, 86, 0.12);
        color: rgba(255, 150, 150, 0.96);
        outline: none;
      }

      .playground-metronome-output-contract-composer {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(92px, 0.48fr) auto;
        gap: 8px;
      }

      .playground-metronome-output-contract-add {
        min-width: 34px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #050505;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-output-contract-add:disabled {
        cursor: default;
        opacity: 0.45;
      }

      .playground-metronome-function-trigger-endpoint-field .playground-metronome-input {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 11px;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-function-trigger-endpoint-field {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .playground-metronome-function-trigger-endpoint-control {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 30px;
        align-items: center;
        gap: 6px;
        width: 100%;
      }

      .playground-metronome-function-trigger-endpoint-control .playground-metronome-input {
        width: 100%;
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding: 0 12px;
        color: rgba(255, 255, 255, 0.92);
        line-height: 30px;
      }

      .playground-metronome-function-trigger-endpoint-copy {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-metronome-function-trigger-endpoint-copy:disabled {
        opacity: 0.35;
        cursor: default;
      }

      .playground-metronome-function-trigger-endpoint-copy:not(:disabled):hover,
      .playground-metronome-function-trigger-endpoint-copy:not(:disabled):focus-visible {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.92);
        outline: none;
      }

      .playground-metronome-function-trigger-payload-field {
        padding-top: 8px;
      }

      .playground-metronome-function-trigger-payload-builder {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }

      .playground-metronome-function-trigger-payload-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-metronome-function-trigger-payload-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(110px, 0.52fr) 24px;
        align-items: center;
        gap: 6px;
      }

      .playground-metronome-function-trigger-payload-row .playground-metronome-input,
      .playground-metronome-function-trigger-payload-row .playground-metronome-select,
      .playground-metronome-function-trigger-payload-row .playground-metronome-custom-select-trigger {
        width: 100%;
        min-width: 0;
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding: 0 10px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 30px;
      }

      .playground-metronome-function-trigger-payload-row .playground-metronome-custom-select-trigger {
        justify-content: space-between;
        gap: 8px;
      }

      .playground-metronome-function-trigger-payload-add {
        align-self: flex-start;
        border: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }

      .playground-metronome-function-trigger-payload-add:hover {
        color: #8bbbff;
      }

      .playground-metronome-node-inspector .playground-metronome-inspector-note {
        margin-top: 14px;
        border-radius: 0;
        padding: 14px 0 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        color: rgba(255, 255, 255, 0.54);
      }

      .playground-metronome-condition-editor {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-condition-editor-field {
        padding-bottom: 0;
      }

      .playground-metronome-condition-fields {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-metronome-condition-compact-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
      }

      .playground-metronome-condition-editor-row {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 0;
      }

      .playground-metronome-condition-editor-row-header {
        min-height: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-condition-editor-row-kind {
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-metronome-condition-editor-row-fields {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-metronome-condition-editor-row .playground-metronome-input {
        height: 30px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
        padding: 0 10px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        line-height: 30px;
      }

      .playground-metronome-condition-editor-row .playground-metronome-input:disabled {
        opacity: 1;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-metronome-condition-editor-remove {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.44);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-condition-editor-remove:hover,
      .playground-metronome-condition-editor-remove:focus-visible {
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.08);
        outline: none;
      }

      .playground-metronome-condition-editor-remove:disabled {
        opacity: 0.28;
        cursor: default;
        background: transparent;
      }

      .playground-metronome-condition-editor-row.is-fixed {
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-condition-editor-add {
        align-self: flex-start;
        min-height: 30px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        padding: 0 11px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
      }

      .playground-metronome-condition-editor-add:hover,
      .playground-metronome-condition-editor-add:focus-visible {
        background: rgba(255, 255, 255, 0.12);
        outline: none;
      }

      .playground-metronome-checkbox-row {
        min-height: 28px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        line-height: 1.35;
        cursor: pointer;
      }

      .playground-metronome-checkbox-row input {
        width: 15px;
        height: 15px;
        accent-color: #66a6ff;
      }

      .playground-metronome-switch-row {
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
      }

      .playground-metronome-switch-row.is-workflow-context {
        margin-top: 0;
        border-bottom: 0;
      }

      .playground-metronome-switch-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-metronome-switch-title-with-tooltip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-metronome-switch-copy small {
        max-width: 320px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-metronome-switch {
        position: relative;
        width: 36px;
        height: 20px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        padding: 0;
        cursor: pointer;
        transition: background 140ms ease;
      }

      .playground-metronome-switch::after {
        content: "";
        position: absolute;
        left: 3px;
        top: 3px;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.86);
        transition: transform 140ms ease;
      }

      .playground-metronome-switch.is-on {
        background: rgba(102, 166, 255, 0.74);
      }

      .playground-metronome-switch.is-on::after {
        transform: translateX(16px);
        background: #fff;
      }

      .playground-metronome-inline-code-editor {
        min-height: 178px;
        border-radius: 10px;
        overflow: hidden;
        background: #050505;
      }

      .playground-metronome-inline-code-editor .playground-metronome-code-editor-shell {
        min-height: 178px;
        height: 178px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
      }

      .playground-metronome-database-document-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px 0 0;
      }

      .playground-metronome-database-document-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-database-document-title {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 14px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-metronome-database-mode-switch {
        min-width: 116px;
        width: auto;
        gap: 5px;
        padding: 2px;
      }

      .playground-metronome-database-mode-switch .content-mode-button {
        min-height: 24px;
        padding: 0 9px;
        font-size: 10px;
        font-weight: 400;
      }

      .playground-metronome-database-fields-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 2px 0 0;
      }

      .playground-metronome-database-fields-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 13px;
        margin-top: 12px;
        padding: 14px;
        border-radius: 7px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-database-fields-card::before {
        content: none;
        display: none;
      }

      .playground-metronome-database-fields-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-database-fields-title {
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-metronome-database-field-tree,
      .playground-metronome-database-field-children {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-metronome-database-field-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 30px;
      }

      .playground-metronome-database-field-main {
        min-width: 0;
        flex: 1 1 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-database-field-toggle,
      .playground-metronome-database-field-toggle-placeholder {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .playground-metronome-database-field-toggle {
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.38);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-database-field-toggle svg {
        transform: rotate(-90deg);
        transition: transform 160ms ease;
      }

      .playground-metronome-database-field-toggle.is-expanded {
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-metronome-database-field-toggle.is-expanded svg {
        transform: rotate(0deg);
      }

      .playground-metronome-database-field-key,
      .playground-metronome-database-field-separator,
      .playground-metronome-database-field-preview,
      .playground-metronome-database-value-static {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-metronome-database-field-key {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-database-field-separator {
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-metronome-database-field-group {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .playground-metronome-database-field-type-pill {
        display: inline-flex;
        align-items: center;
        min-height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.64);
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .playground-metronome-database-field-preview {
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-metronome-database-field-value-shell {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        align-items: center;
      }

      .playground-metronome-database-value-input,
      .playground-metronome-database-value-select {
        width: 100%;
        min-width: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        color: rgba(255, 255, 255, 0.96);
        font-size: 12px;
        outline: none;
      }

      .playground-metronome-database-value-input {
        width: min(280px, 100%);
        height: auto;
        padding: 0;
      }

      .playground-metronome-database-value-select {
        height: auto;
        padding: 0 18px 0 0;
        appearance: none;
      }

      .playground-metronome-database-value-static {
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-metronome-database-field-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease;
      }

      .playground-metronome-database-field-row:hover .playground-metronome-database-field-actions,
      .playground-metronome-database-field-row:focus-within .playground-metronome-database-field-actions {
        opacity: 1;
        pointer-events: auto;
      }

      .playground-metronome-database-field-action {
        width: auto;
        height: auto;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-database-field-action:hover {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-metronome-database-field-action.is-danger:hover {
        color: rgba(255, 173, 173, 0.98);
      }

      .playground-metronome-database-empty-fields {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0 4px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-metronome-database-add-field {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #8db2ff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
        cursor: pointer;
      }

      .playground-metronome-database-json-editor-shell.playground-metronome-inline-code-editor .playground-metronome-code-editor-shell {
        min-height: 240px;
        height: 240px;
      }

      .playground-tasks-project-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99980;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.62);
        backdrop-filter: blur(16px);
      }

      .playground-tasks-project-modal {
        position: relative;
        width: min(520px, 100%);
        max-height: min(720px, calc(100vh - 48px));
        overflow: auto;
        border-radius: 16px;
        background: #101010;
        color: rgba(255, 255, 255, 0.92);
        padding: 18px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56);
      }

      .playground-tasks-project-modal::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border, linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-tasks-project-modal-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 12px;
      }

      .playground-tasks-project-modal-name-row {
        position: relative;
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 0;
      }

      .playground-tasks-project-modal-icon-trigger {
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-tasks-project-modal-icon-trigger:hover,
      .playground-tasks-project-modal-icon-trigger.is-active {
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-tasks-project-composer-modal {
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      .playground-tasks-project-composer-modal::before,
      .playground-tasks-project-composer-modal::after {
        content: none !important;
        display: none !important;
      }

      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger:hover,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger.is-active,
      .playground-tasks-project-composer-modal .playground-tasks-project-modal-icon-trigger:focus-visible {
        background: transparent !important;
        box-shadow: none !important;
      }

      .playground-tasks-project-modal-name-input {
        flex: 1;
        min-width: 0;
        height: 36px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.98);
        font: inherit;
        font-size: 17px;
        line-height: 1.2;
        font-weight: 400;
        outline: none;
      }

      .playground-tasks-project-modal-name-input::placeholder {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-tasks-project-composer-modal .playground-tasks-project-modal-top {
        align-items: center;
      }

      .playground-tasks-project-modal-close,
      .playground-settings-icon-button {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-tasks-project-modal-close:hover,
      .playground-settings-icon-button:hover {
        color: rgba(255, 255, 255, 0.96);
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-database-browser-modal-title-row {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-database-browser-modal-title {
        color: rgba(255, 255, 255, 0.98);
        font-size: 17px;
        font-weight: 400;
        line-height: 1.2;
      }

      .playground-database-browser-modal-copy {
        margin: 0 0 16px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-database-browser-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px 16px;
        align-items: start;
      }

      .playground-tasks-project-modal-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .playground-tasks-project-modal-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.3;
      }

      .playground-environments-input,
      .playground-environments-select {
        width: 100%;
        min-height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 12px;
        outline: none;
        padding: 0 12px;
      }

      .playground-environments-input:focus,
      .playground-environments-select:focus {
        border-color: rgba(102, 166, 255, 0.46);
      }

      .playground-database-browser-modal-select-shell {
        position: relative;
      }

      .playground-database-browser-value-select {
        appearance: none;
        padding-right: 34px;
      }

      .playground-database-browser-select-chevron {
        position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(255, 255, 255, 0.52);
        pointer-events: none;
      }

      .playground-database-browser-modal-value-row {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-database-browser-modal-value-input {
        width: 100%;
      }

      .playground-database-browser-modal-hint {
        min-height: 40px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-tasks-project-modal-error {
        margin-top: 12px;
        color: #ff9797;
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-tasks-project-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 18px;
      }

      .playground-tasks-project-modal-actions .playground-environments-action-button {
        height: 36px;
        min-height: 36px;
        padding: 0 18px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        text-align: center;
      }

      .playground-tasks-project-modal-actions .playground-environments-action-button.is-primary:not(:disabled),
      .playground-tasks-project-modal-actions .playground-environments-action-button.is-primary:not(:disabled):hover {
        border: 0;
        background: #ffffff;
        color: #111111;
      }

      .playground-environments-action-button {
        min-height: 34px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        padding: 0 14px;
        cursor: pointer;
      }

      .playground-environments-action-button.is-primary {
        background: #fff;
        color: #050505;
      }

      .playground-metronome-function-test-section {
        padding: 14px 0 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-function-test-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-function-test-button {
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 12px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #050505;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
      }

      .playground-metronome-function-test-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .playground-metronome-function-test-button svg {
        flex: 0 0 auto;
      }

      .playground-metronome-function-test-button.is-loading svg {
        animation: playground-metronome-spin 850ms linear infinite;
      }

      .playground-metronome-function-test-result,
      .playground-metronome-function-test-error {
        margin-top: 12px;
        border-radius: 10px;
        padding: 11px 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 11px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow: auto;
        max-height: 240px;
      }

      .playground-metronome-function-test-result {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.045);
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-metronome-function-test-error {
        border: 1px solid rgba(248, 113, 113, 0.22);
        background: rgba(248, 113, 113, 0.08);
        color: rgba(254, 202, 202, 0.95);
      }

      @keyframes playground-metronome-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .playground-metronome-code-section .playground-metronome-code-editor-shell {
        min-height: 260px;
        height: 260px;
      }

      .playground-metronome-thread-attachments.playground-tasks-attachments {
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-thread-attachments.is-borderless {
        border-bottom: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-toolbar .playground-tasks-detail-section-title {
        margin-bottom: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-environment-button {
        min-height: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: #66a6ff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-environment-button:hover:not(:disabled) {
        background: transparent;
        color: #66a6ff;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat {
        display: block;
        width: auto;
        height: auto;
        max-width: none;
        min-height: 0;
        overflow: visible;
        flex: 0 0 auto;
        border-radius: 10px;
        background: transparent;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat .tb-popup-dropzone {
        min-height: 168px;
        border-radius: 10px;
        background: transparent;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone {
        position: relative;
        padding: 0;
        align-items: stretch;
        justify-content: flex-start;
        gap: 0;
        overflow: hidden;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-empty-button {
        width: 100%;
        min-height: 168px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 20px 16px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-topline {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 20px;
        margin-bottom: 14px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled .playground-tasks-attachments-topline {
        justify-content: center;
        text-align: center;
        width: 100%;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-topline .tb-popup-dropzone-icon {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.78);
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-browse {
        padding: 0;
        border: 0;
        background: transparent;
        color: #4da3ff;
        font-size: 12px;
        line-height: 1.35;
        cursor: pointer;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-browse:hover {
        color: #78bbff;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-surface.tb-runner-chat .runner-attachments {
        padding-top: 0;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-dropzone.is-filled .runner-attachments {
        width: auto;
        max-width: 100%;
        display: inline-flex;
        justify-content: center;
        flex-wrap: wrap;
        padding: 0;
        margin: 0 auto;
      }

      .playground-metronome-thread-attachments .playground-tasks-attachments-status {
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-workspace-selector-field {
        position: relative;
        z-index: 18;
      }

      .playground-metronome-agent-selector-field {
        position: relative;
        z-index: 18;
      }

      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-workspace-selector-field,
      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-agent-selector-field,
      .playground-metronome-node-inspector .playground-metronome-field.playground-metronome-inspector-selector-field {
        flex: 0 0 auto;
        align-self: stretch;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 0 0 8px;
        border: 0;
        background: transparent;
        border-radius: 0;
        overflow: visible;
        min-height: 0;
        box-sizing: border-box;
      }

      .playground-metronome-workspace-selector-field .playground-metronome-field-label.playground-metronome-field-title,
      .playground-metronome-agent-selector-field .playground-metronome-field-label.playground-metronome-field-title,
      .playground-metronome-inspector-selector-field .playground-metronome-field-label.playground-metronome-field-title {
        flex: 0 0 64px;
        min-width: 64px;
        margin: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        min-height: 0;
        white-space: nowrap;
      }

      .playground-metronome-workspace-selector-field .tb-selector-anchor,
      .playground-metronome-agent-selector-field .tb-selector-anchor {
        position: relative;
        display: block;
        flex: 0 0 auto;
        width: 100%;
        height: auto;
        min-height: 0;
      }

      .playground-metronome-workspace-selector-trigger,
      .playground-metronome-agent-selector-trigger {
        flex: 0 0 auto;
        width: 100%;
        min-height: 24px;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0;
        cursor: pointer;
      }

      .playground-metronome-workspace-selector-trigger:hover,
      .playground-metronome-agent-selector-trigger:hover {
        color: #fff;
      }

      .playground-metronome-workspace-selector-trigger-label,
      .playground-metronome-agent-selector-trigger-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-workspace-popup-portal {
        position: fixed;
        z-index: 100000;
        display: block;
        pointer-events: auto;
      }

      .playground-metronome-agent-popup-portal {
        position: fixed;
        z-index: 100000;
        display: block;
        pointer-events: auto;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu {
        position: static;
        z-index: auto;
        min-width: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(10px);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-agent {
        width: 100%;
        max-height: inherit;
        display: flex;
        flex-direction: column;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-title {
        flex: 0 0 auto;
        padding: 12px 16px 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-panel-section-attach-header {
        flex: 0 0 auto;
        padding: 12px 16px 0;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav {
        display: flex;
        gap: 8px;
        padding: 2px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav-button {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 4px 12px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 1rem;
        cursor: pointer;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-nav-button.active {
        background: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-body-agent {
        flex: 0 1 auto;
        min-height: 0;
        overflow-y: auto;
        margin-top: 12px;
        padding-top: 12px;
        padding-bottom: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        max-height: 180px;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: white;
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 14px;
        line-height: 1.2;
        transition: background-color 160ms ease;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row:last-child {
        margin-bottom: 0;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row-select.selected {
        background: transparent;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-row-agent.selected .tb-popup-icon {
        color: white;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-icon,
      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-check {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon {
        display: block;
        object-fit: contain;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon.is-openai,
      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-provider-icon[title="xAI"] {
        filter: invert(1);
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-check-slot {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-menu-inline-empty {
        padding: 0 16px 12px;
      }

      .playground-metronome-agent-popup-portal.tb-runner-chat .tb-popup-empty-state {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-workspace-popup {
        box-sizing: border-box;
        width: 100%;
        min-width: 240px;
        max-width: 320px;
        max-height: inherit;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: #323232;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(10px);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-workspace-popup-title {
        flex: 0 0 auto;
        padding: 12px 16px 0;
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-metronome-workspace-popup-tab-shell {
        flex: 0 0 auto;
        padding: 12px 16px 0;
      }

      .playground-metronome-workspace-popup-tabs {
        display: flex;
        gap: 8px;
        padding: 2px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.1);
        line-height: 1rem;
        overflow: hidden;
      }

      .playground-metronome-workspace-popup-tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 4px 12px;
        border: 0;
        border-radius: 20px;
        background: transparent;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 500;
        line-height: 1rem;
        cursor: pointer;
      }

      .playground-metronome-workspace-popup-tab.is-active {
        background: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      .playground-metronome-workspace-popup-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-workspace-popup-row {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 0;
        background: transparent;
        color: #fff;
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 14px;
        line-height: 1.2;
        transition: background-color 160ms ease;
      }

      .playground-metronome-workspace-popup-row:hover,
      .playground-metronome-workspace-popup-row.is-selected {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-workspace-popup-row:disabled {
        cursor: not-allowed;
        opacity: 0.48;
      }

      .playground-metronome-workspace-popup-row-icon,
      .playground-metronome-workspace-popup-row-check {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-metronome-workspace-popup-row-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-workspace-popup-row-check-slot {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .playground-metronome-workspace-popup-empty-wrap {
        padding: 0 16px 12px;
      }

      .playground-metronome-workspace-popup-empty {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-attachment-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: rgba(0, 0, 0, 0.36);
        display: flex;
        justify-content: flex-end;
      }

      .playground-metronome-attachment-modal {
        width: min(420px, 92vw);
        margin: 74px 22px 22px 0;
        align-self: flex-start;
        border-radius: 16px;
        background: rgba(24, 24, 25, 0.96);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
        padding: 18px;
        color: #fff;
      }

      .playground-metronome-attachment-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .playground-metronome-attachment-modal-title {
        font-size: 15px;
        font-weight: 600;
      }

      .playground-metronome-attachment-modal-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-flow {
        width: 100%;
        height: 100%;
        min-height: calc(100vh - 72px);
      }

      .playground-metronome-flow .react-flow__pane {
        cursor: default;
      }

      .playground-metronome-flow.is-pan-mode .react-flow__pane {
        cursor: grab;
      }

      .playground-metronome-flow.is-pan-mode .react-flow__pane.dragging {
        cursor: grabbing;
      }

      .playground-metronome-flow .react-flow__edge-path {
        stroke: rgba(255, 255, 255, 0.25);
        stroke-width: 1.4;
      }

      .playground-metronome-flow .react-flow__edge.selected .react-flow__edge-path {
        stroke: rgba(102, 166, 255, 0.78);
      }

      .playground-metronome-flow .react-flow__edge-text,
      .playground-metronome-flow .react-flow__edge-textbg {
        display: none;
      }

      .playground-metronome-flow-controls {
        position: absolute;
        z-index: 8;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
        padding: 7px;
        border-radius: 999px;
        background: rgba(45, 45, 47, 0.82);
        backdrop-filter: blur(22px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
      }

      .playground-metronome-flow-control-button {
        background: transparent;
        border: 0;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.42);
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 150ms ease, background 150ms ease, opacity 150ms ease;
      }

      .playground-metronome-flow-control-button:hover:not(:disabled),
      .playground-metronome-flow-control-button:focus-visible:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
        outline: none;
      }

      .playground-metronome-flow-control-button.is-active {
        background: rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-metronome-flow-control-button:disabled {
        cursor: default;
        opacity: 0.34;
      }

      .playground-metronome-flow-controls-spacer {
        width: 0;
        flex: 0 0 0;
      }

      .playground-metronome-flow .react-flow__attribution {
        display: none;
      }

      .playground-metronome-flow .react-flow__edge.is-metronome-run-completed path {
        stroke: rgba(102, 166, 255, 0.88) !important;
        stroke-width: 2 !important;
      }

      .playground-metronome-flow .react-flow__edge.is-metronome-run-active path {
        stroke: #66a6ff !important;
        stroke-width: 2.25 !important;
      }

      .playground-metronome-flow .react-flow__edge.selected path,
      .playground-metronome-flow .react-flow__edge.selected .react-flow__edge-path {
        stroke: rgba(102, 166, 255, 0.78) !important;
        stroke-width: 2.25 !important;
      }
`;
