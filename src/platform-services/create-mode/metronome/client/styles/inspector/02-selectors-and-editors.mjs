export const METRONOME_INSPECTOR_CSS_02_FRAGMENT = String.raw`        background: rgba(255, 255, 255, 0.08);
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

      .playground-metronome-dynamic-content-popup-shell {
        display: inline-flex;
        align-items: center;
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
        display: flex;
        flex-direction: column;
        overflow: hidden;
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
        margin: 10px 14px 12px;
        min-height: 34px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-dynamic-content-search .platform-popup-search-header__icon {
        color: rgba(255, 255, 255, 0.44);
      }

      .playground-metronome-dynamic-content-search .platform-popup-search-header__input {
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
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
`;
