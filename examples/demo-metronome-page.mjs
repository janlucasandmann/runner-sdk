export const METRONOME_PAGE_CSS = String.raw`
      .playground-metronome-page {
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: inherit;
        background: #050505;
        color: rgba(255, 255, 255, 0.94);
        overflow: hidden;
      }

      .playground-metronome-page.is-overview {
        overflow-y: auto;
      }

      .playground-metronome-page.is-editor {
        overflow: hidden;
      }

      .playground-metronome-page.is-editor.is-code {
        padding: 42px 44px 12px;
      }

      .playground-metronome-overview {
        width: 100%;
        margin: 0 auto;
        padding: 34px 38px 48px;
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .playground-metronome-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-metronome-kicker {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        margin-bottom: 9px;
      }

      .playground-metronome-title {
        margin: 0;
        font-size: 28px;
        line-height: 1.08;
        font-weight: 600;
        letter-spacing: 0;
      }

      .playground-metronome-copy {
        margin: 10px 0 0;
        max-width: 760px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 14px;
        line-height: 1.55;
      }

      .playground-metronome-primary-button,
      .playground-metronome-secondary-button,
      .playground-metronome-icon-button {
        position: relative;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.94);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        outline: none;
      }

      .playground-metronome-primary-button::before,
      .playground-metronome-secondary-button::before,
      .playground-metronome-icon-button::before,
      .playground-metronome-table::before,
      .playground-metronome-empty::before,
      .playground-metronome-code-button::before {
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

      .playground-metronome-primary-button {
        min-height: 38px;
        padding: 0 16px;
        background: #fff;
        color: #050505;
      }

      .playground-metronome-secondary-button {
        min-height: 38px;
        padding: 0 16px;
      }

      .playground-metronome-icon-button {
        width: 38px;
        height: 38px;
        padding: 0;
      }

      .playground-metronome-kpis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        border-radius: 16px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.045);
      }

      .playground-metronome-kpi {
        min-height: 102px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 14px;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-kpi:last-child {
        border-right: 0;
      }

      .playground-metronome-kpi-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.52);
        font-weight: 500;
      }

      .playground-metronome-kpi-value {
        font-size: 25px;
        line-height: 1;
        font-weight: 600;
      }

      .playground-metronome-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 6px;
      }

      .playground-metronome-section-title {
        font-size: 16px;
        font-weight: 600;
      }

      .playground-metronome-table,
      .playground-metronome-empty {
        position: relative;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.025);
        overflow: hidden;
      }

      .playground-metronome-table-row {
        display: grid;
        grid-template-columns: minmax(280px, 1.6fr) minmax(160px, 0.7fr) minmax(180px, 0.8fr) minmax(140px, 0.6fr) 40px;
        align-items: center;
        gap: 18px;
        padding: 18px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        color: inherit;
        background: transparent;
        width: 100%;
        text-align: left;
        font: inherit;
      }

      .playground-metronome-table-row:first-child {
        border-top: 0;
      }

      .playground-metronome-table-row.is-head {
        min-height: 52px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 600;
        cursor: default;
      }

      button.playground-metronome-table-row {
        cursor: pointer;
      }

      button.playground-metronome-table-row:hover {
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-metronome-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .playground-metronome-name-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.12);
        color: #66a6ff;
        flex: 0 0 auto;
      }

      .playground-metronome-name-title {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-name-subtitle {
        margin-top: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.48);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-chip {
        width: fit-content;
        border-radius: 999px;
        padding: 6px 10px;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.08);
        font-size: 12px;
        font-weight: 600;
      }

      .playground-metronome-chip.is-active {
        background: rgba(45, 212, 191, 0.12);
        color: rgba(153, 246, 228, 0.94);
      }

      .playground-metronome-empty {
        min-height: 340px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 42px;
      }

      .playground-metronome-empty-inner {
        max-width: 430px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .playground-metronome-empty-icon {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.1);
        color: #66a6ff;
      }

      .playground-metronome-empty-title {
        font-size: 20px;
        font-weight: 600;
      }

      .playground-metronome-empty-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 13px;
        line-height: 1.5;
      }

      .playground-metronome-editor {
        position: relative;
        height: 100%;
        min-height: 0;
        background: #050505;
        color: rgba(255, 255, 255, 0.94);
        overflow: hidden;
      }

      .playground-metronome-node-palette {
        position: absolute;
        left: 24px;
        top: 24px;
        z-index: 10;
        width: 214px;
        max-height: calc(100% - 48px);
        overflow: auto;
        margin: 0;
        border-radius: 0;
        background: transparent;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-metronome-editor-main {
        position: relative;
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .playground-metronome-code-view {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin: 0 auto;
        height: 100%;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #050505;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-code-header {
        flex: 0 0 auto;
      }

      .playground-metronome-code-content {
        flex: 1 1 0;
        min-height: 0;
        height: auto;
      }

      .playground-metronome-code-toolbar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-metronome-code-title {
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-metronome-code-copy {
        margin-top: 5px;
        max-width: 680px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-code-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-code-button {
        position: relative;
        min-height: 34px;
        border: 0;
        border-radius: 999px;
        padding: 0 13px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        cursor: pointer;
      }

      .playground-metronome-code-button.is-primary {
        background: #fff;
        color: #050505;
      }

      .playground-metronome-code-editor-shell {
        position: relative;
        flex: 1;
        min-height: 0;
        border-radius: 10px;
        overflow: hidden;
        background: #050505;
      }

      .playground-metronome-code-workspace {
        flex: 1 1 0;
        min-height: 0;
        height: 100%;
        max-height: 100%;
      }

      .playground-metronome-code-workspace.playground-servers-code-workspace {
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-code-file-row {
        min-height: 34px;
      }

      .playground-metronome-code-statusbar-message {
        min-width: 0;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-code-statusbar-message.is-success {
        color: #6ee7b7;
      }

      .playground-metronome-code-statusbar-message.is-error {
        color: #ff9a9a;
      }

      .playground-metronome-code-statusbar-message.is-loading {
        color: #66a6ff;
      }

      .playground-metronome-code-monaco {
        position: absolute;
        inset: 0;
        opacity: 0;
        pointer-events: none;
      }

      .playground-metronome-code-monaco.is-ready {
        opacity: 1;
        pointer-events: auto;
      }

      .playground-metronome-code-textarea {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        outline: 0;
        resize: none;
        padding: 16px;
        background: #050505;
        color: rgba(255, 255, 255, 0.86);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-metronome-code-status {
        min-height: 16px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.3;
      }

      .playground-metronome-code-status.is-success {
        color: #6ee7b7;
      }

      .playground-metronome-code-status.is-error {
        color: #ff9a9a;
      }

      .playground-metronome-code-status.is-loading {
        color: #66a6ff;
      }

      .playground-metronome-palette-header {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 28px;
      }

      .playground-metronome-palette-title {
        min-width: 0;
        flex: 1;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-palette-back-button {
        width: auto;
        height: auto;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.74);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font: inherit;
      }

      .playground-metronome-palette-back-button:hover {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-palette-list {
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.1);
        padding: 11px 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(18px);
      }

      .playground-metronome-palette-section {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-palette-section-title {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
        padding: 0 5px 3px;
      }

      .playground-metronome-palette-item {
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        min-height: 34px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 4px 5px;
        font: inherit;
        cursor: grab;
        text-align: left;
        width: 100%;
      }

      .playground-metronome-palette-item:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-palette-item-icon {
        width: 25px;
        height: 25px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .playground-metronome-palette-item-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .playground-metronome-palette-item-label {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.1;
      }

      .playground-metronome-palette-item-copy {
        display: none;
      }

      .playground-metronome-node {
        width: 232px;
        border-radius: 16px;
        background: rgba(24, 24, 25, 0.94);
        color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }

      .playground-metronome-node.is-condition {
        width: 232px;
      }

      .playground-metronome-node.is-selected {
        border-color: rgba(102, 166, 255, 0.78);
        box-shadow: 0 0 0 1px rgba(102, 166, 255, 0.28), 0 18px 46px rgba(0, 0, 0, 0.36);
      }

      .playground-metronome-node.is-run-completed {
        border-color: rgba(102, 166, 255, 0.58);
        box-shadow: 0 0 0 1px rgba(102, 166, 255, 0.24), 0 18px 42px rgba(0, 0, 0, 0.32);
      }

      .playground-metronome-node.is-run-active {
        border-color: rgba(110, 231, 183, 0.9);
        box-shadow: 0 0 0 1px rgba(110, 231, 183, 0.34), 0 0 34px rgba(110, 231, 183, 0.16), 0 18px 42px rgba(0, 0, 0, 0.34);
      }

      .playground-metronome-node-header {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px;
      }

      .playground-metronome-node-icon {
        width: 31px;
        height: 31px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .playground-metronome-node-title {
        font-size: 13px;
        line-height: 1.15;
        font-weight: 600;
      }

      .playground-metronome-node-subtitle {
        margin-top: 2px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.48);
      }

      .playground-metronome-node-body {
        margin: 0 12px 12px;
        border-radius: 11px;
        padding: 9px 10px;
        background: rgba(0, 0, 0, 0.24);
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-condition-branches {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 12px 12px;
      }

      .playground-metronome-condition-branch {
        min-height: 39px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.3);
        color: rgba(255, 255, 255, 0.72);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 12px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.2;
        text-align: right;
      }

      .playground-metronome-condition-branch.is-empty {
        color: rgba(255, 255, 255, 0.34);
      }

      .playground-metronome-condition-branch.is-else {
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-metronome-node .react-flow__handle {
        width: 9px;
        height: 9px;
        border: 2px solid rgba(255, 255, 255, 0.72);
        background: #050505;
      }

      .playground-metronome-node .react-flow__handle.playground-metronome-condition-handle {
        right: -5px;
      }

      .playground-metronome-node-inspector {
        position: relative;
        z-index: 1;
        width: 100%;
        min-width: 0;
        min-height: 0;
        height: 100%;
        border-radius: 0;
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-metronome-inspector-header {
        min-height: 56px;
        padding: 0 10px;
        border-bottom: 0;
        background: transparent;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-inspector-navbar-title {
        flex: 1 1 auto;
        min-width: 0;
      }

      .playground-metronome-inspector-title-input {
        font-size: 13px;
        font-weight: 500;
      }

      .playground-metronome-inspector-node-kind {
        flex: 0 0 auto;
        color: #66a6ff;
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-metronome-inspector-close {
        flex: 0 0 auto;
      }

      .playground-metronome-inspector-body {
        padding: 14px 28px 28px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 0;
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

      .playground-metronome-inspector-note {
        border-radius: 14px;
        padding: 12px;
        background: rgba(102, 166, 255, 0.09);
        color: rgba(214, 230, 255, 0.9);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-node-inspector .playground-metronome-field {
        gap: 8px;
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-node-inspector .playground-metronome-field:first-child {
        padding-top: 4px;
      }

      .playground-metronome-node-inspector .playground-metronome-field-label {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
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
        font-size: 13px;
        line-height: 1.45;
      }

      .playground-metronome-node-inspector .playground-metronome-input,
      .playground-metronome-node-inspector .playground-metronome-select {
        height: 24px;
      }

      .playground-metronome-node-inspector .playground-metronome-select {
        cursor: pointer;
      }

      .playground-metronome-node-inspector .playground-metronome-textarea {
        min-height: 64px;
        resize: none;
      }

      .playground-metronome-field-hint {
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description {
        margin-top: 0;
        padding: 15px 0;
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
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.64);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: help;
      }

      .playground-metronome-field-tooltip-popover {
        position: absolute;
        left: 50%;
        top: calc(100% + 8px);
        width: 260px;
        transform: translateX(-50%) translateY(-4px);
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

      .playground-metronome-field-tooltip:hover .playground-metronome-field-tooltip-popover,
      .playground-metronome-field-tooltip:focus-visible .playground-metronome-field-tooltip-popover {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-help {
        margin: 0 0 10px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-editor {
        position: relative;
        min-height: 108px;
        overflow: hidden;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        cursor: text;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-editor.is-editing {
        overflow: visible;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-preview-scope.tb-runner-chat {
        position: absolute;
        inset: 0;
        display: block;
        grid-template-rows: none;
        width: 100%;
        height: 100%;
        min-height: 100%;
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
        padding: 0 0 14px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.6;
        min-height: 108px;
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
        min-height: 108px;
        padding: 0 0 14px;
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
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input.is-preview {
        color: transparent;
        height: 100% !important;
        min-height: 100%;
        padding-bottom: 0;
        caret-color: transparent;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input::placeholder {
        color: transparent;
      }

      .playground-metronome-node-inspector .playground-tasks-detail-description-input.is-editing::placeholder {
        color: rgba(255, 255, 255, 0.38);
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
        gap: 12px;
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
        display: grid;
        grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr) auto;
        align-items: center;
        gap: 10px;
        min-width: 0;
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
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .playground-metronome-condition-editor-row.is-fixed .playground-metronome-input {
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
        font-weight: 600;
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
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
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

      .playground-metronome-json-output-box {
        margin-top: 6px;
        border-radius: 0;
        padding: 14px 0 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        display: flex;
        flex-direction: column;
        gap: 9px;
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

      .playground-metronome-code-section .playground-metronome-code-editor-shell {
        min-height: 260px;
        height: 260px;
      }

      .playground-metronome-thread-attachments.playground-tasks-attachments {
        padding: 15px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
        cursor: grab;
      }

      .playground-metronome-flow .react-flow__pane.dragging {
        cursor: grabbing;
      }

      .playground-metronome-flow .react-flow__edge-path {
        stroke: rgba(255, 255, 255, 0.25);
        stroke-width: 1.4;
      }

      .playground-metronome-flow .react-flow__edge.selected .react-flow__edge-path {
        stroke: rgba(255, 255, 255, 0.25);
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
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: rgba(24, 24, 25, 0.72);
        backdrop-filter: blur(18px);
      }

      .playground-metronome-flow-control-button {
        background: transparent;
        border: 0;
        color: rgba(255, 255, 255, 0.74);
        width: 34px;
        height: 34px;
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

      .playground-metronome-flow-control-button:disabled {
        cursor: default;
        opacity: 0.34;
      }

      .playground-metronome-flow-controls-divider {
        width: 1px;
        height: 18px;
        flex: 0 0 1px;
        margin: 0 17px;
        background: rgba(255, 255, 255, 0.14);
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

      .playground-metronome-runs-view {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        height: 100%;
        min-height: 0;
        margin: 0 auto;
        padding: 42px 44px 22px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        overflow: hidden;
        background: #050505;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-metronome-runs-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-metronome-runs-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-metronome-runs-copy {
        margin-top: 5px;
        max-width: 620px;
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-runs-layout {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
      }

      .playground-metronome-runs-list,
      .playground-metronome-run-detail {
        position: relative;
        min-height: 0;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        overflow: hidden;
      }

      .playground-metronome-runs-list::before,
      .playground-metronome-run-detail::before,
      .playground-metronome-run-sidebar-submit::before {
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

      .playground-metronome-runs-list {
        width: 100%;
        overflow-y: auto;
      }

      .playground-metronome-run-row {
        width: 100%;
        min-height: 74px;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 14px 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
      }

      .playground-metronome-run-row:hover,
      .playground-metronome-run-row.is-active {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-run-row-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .playground-metronome-run-row-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-run-row-meta {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.2;
      }

      .playground-metronome-run-status {
        flex: 0 0 auto;
        border-radius: 999px;
        padding: 5px 8px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.72);
        font-size: 11px;
        font-weight: 600;
        text-transform: capitalize;
      }

      .playground-metronome-run-status.is-completed {
        background: rgba(110, 231, 183, 0.1);
        color: rgba(167, 243, 208, 0.95);
      }

      .playground-metronome-run-detail {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-metronome-run-detail-header {
        flex: 0 0 auto;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-metronome-run-detail-title {
        font-size: 16px;
        line-height: 1.2;
        font-weight: 600;
      }

      .playground-metronome-run-detail-copy {
        margin-top: 7px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-run-detail-body {
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        padding: 18px 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-metronome-run-section-title {
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        font-weight: 600;
      }

      .playground-metronome-run-steps {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }

      .playground-metronome-run-step {
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.22);
        padding: 12px;
        display: grid;
        grid-template-columns: 28px minmax(0, 1fr);
        gap: 11px;
      }

      .playground-metronome-run-step-index {
        width: 28px;
        height: 28px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(102, 166, 255, 0.14);
        color: #66a6ff;
        font-size: 12px;
        font-weight: 700;
      }

      .playground-metronome-run-step-title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
      }

      .playground-metronome-run-step-summary {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-step-branch {
        margin-top: 9px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.25;
      }

      .playground-metronome-run-step-branch-chip {
        min-width: 0;
        max-width: 100%;
        border-radius: 999px;
        padding: 4px 8px;
        background: rgba(102, 166, 255, 0.13);
        color: #9fc6ff;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-metronome-run-step-branch-reason {
        flex-basis: 100%;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.35;
      }

      .playground-metronome-run-thread-list,
      .playground-metronome-run-log-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-metronome-run-thread,
      .playground-metronome-run-log {
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.2);
        padding: 12px;
      }

      .playground-metronome-run-thread-title,
      .playground-metronome-run-log-message {
        font-size: 12px;
        font-weight: 600;
        line-height: 1.35;
      }

      .playground-metronome-run-thread-meta,
      .playground-metronome-run-log-meta {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-metronome-runs-empty {
        height: 100%;
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 32px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 13px;
        line-height: 1.45;
      }

      .playground-metronome-run-sidebar {
        position: relative;
        z-index: 1;
        width: 100%;
        min-height: 0;
        height: 100%;
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .playground-metronome-run-sidebar-header {
        flex: 0 0 auto;
        min-height: 56px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-metronome-run-sidebar-title {
        font-size: 13px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-metronome-run-sidebar-body {
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 10px 132px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-metronome-run-sidebar-copy {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-run-sidebar-log {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        padding: 11px 12px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-metronome-run-sidebar-log.is-error {
        color: #ffb4b4;
        background: rgba(255, 88, 88, 0.08);
      }

      .playground-metronome-run-empty-state {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .playground-metronome-run-user-row {
        display: flex;
        justify-content: flex-end;
      }

      .playground-metronome-run-user-bubble {
        max-width: 78%;
        border-radius: 18px 18px 5px 18px;
        padding: 9px 15px;
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-trace {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-metronome-run-trace-step {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .playground-metronome-run-trace-heading {
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: flex-start;
        gap: 8px;
      }

      .playground-metronome-run-trace-icon {
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-metronome-run-trace-title-group {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-metronome-run-trace-title {
        min-width: 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-link {
        width: fit-content;
        max-width: 100%;
        border: 0;
        padding: 0;
        background: transparent;
        color: #66a6ff;
        font: inherit;
        font-size: 10px;
        line-height: 1.2;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-run-thread-link:hover {
        text-decoration: underline;
      }

      .playground-metronome-run-trace-status {
        color: rgba(255, 255, 255, 0.45);
        font-size: 10px;
        line-height: 1.2;
        text-transform: capitalize;
      }

      .playground-metronome-run-trace-summary {
        margin-left: 26px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-output-block {
        margin: 3px 0 0 26px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.18);
        padding: 12px 14px;
        color: rgba(255, 255, 255, 0.84);
        font-family: var(--font-mono, "SFMono-Regular", Consolas, "Liberation Mono", monospace);
        font-size: 11px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow: auto;
      }

      .playground-metronome-run-output-markdown {
        margin: 3px 0 0 26px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        line-height: 1.45;
        overflow-wrap: anywhere;
      }

      .playground-metronome-run-output-markdown-scope {
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-run-output-markdown.tb-message-markdown,
      .playground-metronome-run-output-markdown .tb-message-markdown,
      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-heading,
      .playground-metronome-run-output-markdown .tb-message-markdown-strong,
      .playground-metronome-run-output-markdown .tb-message-markdown-em,
      .playground-metronome-run-output-markdown .tb-message-markdown-inline-code,
      .playground-metronome-run-output-markdown .tb-message-markdown-link {
        color: rgba(255, 255, 255, 0.7);
      }

      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-heading {
        margin: 0;
      }

      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph + .tb-message-markdown-paragraph,
      .playground-metronome-run-output-markdown .tb-message-markdown-paragraph + .tb-message-markdown-list,
      .playground-metronome-run-output-markdown .tb-message-markdown-list + .tb-message-markdown-paragraph {
        margin-top: 6px;
      }

      .playground-metronome-run-running-row {
        border-radius: 12px;
        background: rgba(102, 166, 255, 0.08);
        color: rgba(255, 255, 255, 0.74);
        padding: 10px 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        line-height: 1.3;
      }

      .playground-metronome-run-sidebar-composer {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 15px;
        z-index: 8;
        border-radius: 18px;
        background: transparent;
        display: block;
        padding: 0;
        overflow: visible;
      }

      .playground-metronome-run-sidebar-composer > .tb-runner-chat.playground-metronome-run-sidebar-runner-chat {
        position: relative;
        width: 100%;
        max-width: none !important;
        height: auto;
        min-height: 0;
        display: block;
        grid-template-rows: none;
        flex: none;
        overflow: visible;
        background: transparent;
      }

      .playground-metronome-run-sidebar-runner-chat .tb-input-width {
        width: 100% !important;
        max-width: none !important;
      }

      .playground-metronome-run-sidebar-runner-chat > :not(.tb-input-shell) {
        display: none !important;
      }

      .playground-metronome-run-sidebar-runner-chat .tb-input-shell {
        position: relative;
        left: auto;
        right: auto;
        bottom: auto;
        width: 100% !important;
        max-width: none !important;
        min-height: 0;
        padding: 0;
        margin: 0;
        display: block;
      }

      .playground-metronome-run-sidebar-runner-chat .task-input-box {
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.94);
        --tb-task-input-overlay: transparent;
        width: 100%;
        max-width: none;
      }

      .playground-metronome-run-sidebar-runner-chat .sidebar-textarea {
        min-height: 46px;
        padding-top: 14px;
      }

      .playground-metronome-run-sidebar-textarea {
        flex: 1 1 auto;
        min-width: 0;
        width: 100%;
        height: 48px;
        border: 0;
        outline: 0;
        resize: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.92);
        font: inherit;
        font-size: 13px;
        line-height: 1.35;
      }

      .playground-metronome-run-sidebar-textarea::placeholder {
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-metronome-run-sidebar-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-run-sidebar-control-button,
      .playground-metronome-run-sidebar-submit {
        position: relative;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: #fff;
        color: #050505;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-metronome-run-sidebar-control-button {
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-metronome-run-sidebar-submit:disabled {
        opacity: 0.52;
        cursor: default;
      }

      .playground-metronome-run-sidebar-select-shell {
        min-width: 0;
        max-width: 148px;
        height: 34px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        line-height: 1;
      }

      .playground-metronome-run-sidebar-select-shell.is-computer {
        margin-left: auto;
      }

      .playground-metronome-run-sidebar-select-shell select {
        min-width: 0;
        max-width: 118px;
        border: 0;
        outline: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
        line-height: 1;
        appearance: none;
        cursor: pointer;
      }

      .playground-metronome-run-sidebar-select-shell option {
        background: #111;
        color: #fff;
      }

      .playground-metronome-top-nav-menu-shell {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .playground-top-nav-private-chat-button.playground-metronome-top-nav-menu-trigger {
        width: 30px;
        min-width: 30px;
        padding: 0;
      }

      .playground-top-nav-private-chat-button.playground-metronome-top-nav-menu-trigger::before {
        display: none !important;
        content: none !important;
      }

      .playground-metronome-top-nav-menu {
        position: absolute;
        z-index: 2200;
        top: calc(100% + 8px);
        right: 0;
        width: 190px;
        min-width: 190px;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0 !important;
        padding: 0 !important;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        background: #323232 !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: blur(10px);
      }

      .playground-metronome-top-nav-menu .tb-popup-row {
        width: 100% !important;
        min-height: 40px;
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 12px !important;
        padding: 10px 14px !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        color: white !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        line-height: 1.2 !important;
        text-align: left !important;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-metronome-top-nav-menu .tb-popup-row:hover,
      .playground-metronome-top-nav-menu .tb-popup-row:focus-visible {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
        outline: none;
      }

      .playground-metronome-top-nav-menu .tb-popup-row .tb-popup-icon {
        width: 14px !important;
        height: 14px !important;
        flex: 0 0 auto;
        color: currentColor !important;
      }

      .playground-metronome-top-nav-menu .tb-popup-row.is-danger {
        color: rgba(255, 118, 118, 0.96) !important;
      }

      .playground-metronome-top-nav-menu .tb-popup-row.is-danger:hover,
      .playground-metronome-top-nav-menu .tb-popup-row.is-danger:focus-visible {
        background: rgba(255, 80, 80, 0.12) !important;
        color: rgba(255, 142, 142, 0.98) !important;
      }

      .playground-metronome-name-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.62);
        backdrop-filter: blur(18px);
      }

      .playground-metronome-name-modal {
        width: min(460px, 100%);
        border-radius: 18px;
        background: rgba(22, 22, 23, 0.96);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.44);
        overflow: hidden;
      }

      .playground-metronome-name-modal-header {
        padding: 18px 18px 14px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-metronome-name-modal-title {
        font-size: 16px;
        font-weight: 600;
      }

      .playground-metronome-name-modal-copy {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-name-modal-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-metronome-name-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .playground-metronome-environment-file-picker-portal.tb-runner-chat {
        position: fixed;
        inset: 0;
        z-index: 2147483002;
        display: block;
        width: 100vw;
        max-width: none;
        height: 100dvh;
        min-height: 100dvh;
        overflow: visible;
        pointer-events: none;
        background: transparent;
      }

      .playground-metronome-environment-file-picker-portal.tb-runner-chat > .tb-file-browser-scrim {
        pointer-events: auto;
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.6);
        z-index: 2147483002;
      }

      @media (max-width: 980px) {
        .playground-metronome-overview {
          padding: 24px 18px 36px;
        }

        .playground-metronome-kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-metronome-table-row {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-metronome-table-row.is-head {
          display: none;
        }

        .playground-metronome-node-palette {
          left: 12px;
          top: 12px;
          width: 220px;
          max-height: calc(100% - 24px);
        }
      }
`;

export const METRONOME_PAGE_SCRIPT = String.raw`
        const METRONOME_STORAGE_KEY = "runner_demo_metronomes_v1";

        const METRONOME_NODE_KIND_META = {
          trigger: {
            label: "Trigger",
            copy: "Start from events, schedules, connectors, and platform changes.",
            color: "#6ee7b7",
            Icon: Play,
            subtypes: [
              { id: "thread_event", label: "Thread event" },
              { id: "periodic", label: "Periodic schedule" },
              { id: "email", label: "Email received" },
              { id: "telegram", label: "Telegram message" },
              { id: "github", label: "GitHub event" },
              { id: "project_ticket", label: "Project ticket event" },
              { id: "resource", label: "Resource event" },
              { id: "database_entry", label: "Database entry added" },
            ],
          },
	          condition: {
	            label: "Condition",
	            copy: "Branch workflow runs by the previous node output, database values, or JSON payloads.",
	            color: "#fbbf24",
	            Icon: Split,
	            subtypes: [
	              { id: "previous_output_contains", label: "Previous Node Output contains" },
	              { id: "database_document_field", label: "Database Document field" },
	              { id: "ticket_status", label: "Ticket status" },
	              { id: "json", label: "JSON" },
	            ],
          },
          action: {
            label: "Thread",
            copy: "Start or continue agent work inside a computer or project.",
            color: "#66a6ff",
            Icon: Bot,
            subtypes: [
              { id: "start_thread", label: "Start a thread" },
            ],
          },
          ticket: {
            label: "Ticket",
            copy: "Create tickets, update status, and write comments in project workflows.",
            color: "#facc15",
            Icon: ListTodo,
            subtypes: [
              { id: "create_or_update_ticket", label: "Create or update ticket" },
              { id: "update_ticket_status", label: "Change ticket status" },
              { id: "add_ticket_comment", label: "Add ticket comment" },
            ],
          },
          code: {
            label: "Code",
            copy: "Run custom workflow code and pass the result to later nodes.",
            color: "#a3e635",
            Icon: Code2,
            subtypes: [
              { id: "run_code", label: "Run custom code" },
            ],
          },
          imagine: {
            label: "Imagine",
            copy: "Start an Imagine thread with a template, prompt, project context, and attachments.",
            color: "#f472b6",
            Icon: Clapperboard,
            subtypes: [
              { id: "start_imagine", label: "Start Imagine" },
            ],
          },
          function: {
            label: "Function",
            copy: "Call a deployed Computer Agents function and route its output through the workflow.",
            color: "#38bdf8",
            Icon: FunctionSquare,
            subtypes: [
              { id: "invoke_function", label: "Invoke function" },
            ],
          },
          database: {
            label: "Database",
            copy: "Insert, update, or delete documents in a Computer Agents database resource.",
            color: "#22c55e",
            Icon: Database,
            subtypes: [
              { id: "insert_document", label: "Insert document" },
              { id: "update_document", label: "Update document" },
              { id: "delete_document", label: "Delete document" },
            ],
          },
          metronome: {
            label: "Metronome",
            copy: "Trigger another Metronome workflow and route its result into this workflow.",
            color: "#8b5cf6",
            Icon: Metronome,
            subtypes: [
              { id: "run_workflow", label: "Run workflow" },
            ],
          },
          loop: {
            label: "Loop",
            copy: "Repeat actions over lists, files, rows, or connector payloads.",
            color: "#c084fc",
            Icon: RefreshCw,
            subtypes: [
              { id: "for_each_item", label: "For each item" },
              { id: "for_each_file", label: "For each file" },
              { id: "for_each_database_row", label: "For each database row" },
              { id: "until_condition", label: "Until condition passes" },
              { id: "until_approval", label: "Until approval resolves" },
            ],
          },
          approval: {
            label: "User Approval",
            copy: "Pause work until a human approves, rejects, or edits the run.",
            color: "#f472b6",
            Icon: Shield,
            subtypes: [
              { id: "approve_deploy", label: "Approve deploy" },
              { id: "approve_external_message", label: "Approve external message" },
              { id: "approve_project_write", label: "Approve project update" },
              { id: "approve_ct_spend", label: "Approve CT spend" },
              { id: "approve_team_resource", label: "Approve team resource write" },
            ],
          },
          note: {
            label: "Note",
            copy: "Add non-executable context, comments, and instructions to the workflow.",
            color: "#d4d4d8",
            Icon: MessageSquare,
            subtypes: [
              { id: "annotation", label: "Workflow note" },
            ],
          },
          end: {
            label: "End",
            copy: "Finish the workflow and stop the current run.",
            color: "#a3e635",
            Icon: CircleCheckBig,
            subtypes: [
              { id: "complete", label: "Complete workflow" },
            ],
          },
        };

        const METRONOME_NODE_PALETTE_GROUPS = [
          {
            title: "Core",
            items: [
              { id: "trigger", kind: "trigger", label: "Trigger" },
              { id: "action", kind: "action", label: "Thread" },
              { id: "ticket", kind: "ticket", label: "Ticket" },
              { id: "code", kind: "code", label: "Code" },
              { id: "imagine", kind: "imagine", label: "Imagine" },
              { id: "function", kind: "function", label: "Function" },
              { id: "database", kind: "database", label: "Database" },
              { id: "metronome", kind: "metronome", label: "Metronome" },
              { id: "end", kind: "end", label: "End" },
              { id: "note", kind: "note", label: "Note" },
            ],
          },
          {
            title: "Logic",
            items: [
              { id: "condition", kind: "condition", label: "Condition" },
              { id: "loop", kind: "loop", label: "Loop" },
              { id: "approval", kind: "approval", label: "User Approval" },
            ],
          },
        ];

        function createMetronomeNodeFromPaletteItem(item, position) {
          const normalizedItem = item && typeof item === "object" ? item : {};
          const kind = normalizedItem.kind || "action";
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          return createMetronomeNode(kind, position, {
            subtype: normalizedItem.subtype,
            label: normalizedItem.label || meta.label,
            description: normalizedItem.copy || normalizedItem.description || meta.copy,
          });
        }

        function normalizeMetronomeOptionList(items, fallbackItems = []) {
          const sourceItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems;
          return sourceItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.value || item.key || "").trim();
              if (!id) return null;
              const name = String(item.name || item.title || item.label || id).trim();
              return { id, name: name || id };
            })
            .filter(Boolean);
        }

        const METRONOME_CONDITION_TYPES = new Set(["previous_output_contains", "database_document_field", "ticket_status", "json"]);

        function normalizeMetronomeConditionType(value) {
          const candidate = String(value || "").trim();
          return METRONOME_CONDITION_TYPES.has(candidate) ? candidate : "previous_output_contains";
        }

        function normalizeMetronomeApprovalBranches(value) {
          return [
            { id: "true", label: "True", rule: "true" },
            { id: "false", label: "False", rule: "false" },
          ];
        }

        function normalizeMetronomeConditionBranches(value, conditionType = "previous_output_contains") {
          const normalizedConditionType = normalizeMetronomeConditionType(conditionType);
          if (normalizedConditionType === "database_document_field" || normalizedConditionType === "ticket_status") {
            return [
              { id: "true", label: "True", rule: "true" },
              { id: "false", label: "False", rule: "false" },
            ];
          }
          const sourceBranches = Array.isArray(value) ? value : [];
          const usedIds = new Set();
          const normalized = sourceBranches
            .map((branch, index) => {
              const source = branch && typeof branch === "object"
                ? branch
                : { label: String(branch || "").trim() };
              const rawLabel = String(source.label || source.name || "").trim();
              const isElse = String(source.id || "").trim() === "else" || rawLabel.toLowerCase() === "else" || rawLabel.toLowerCase() === "default";
              const baseId = isElse
                ? "else"
                : String(source.id || "condition-" + (index + 1)).trim() || "condition-" + (index + 1);
              let id = baseId;
              let suffix = 2;
              while (usedIds.has(id) && id !== "else") {
                id = baseId + "-" + suffix;
                suffix += 1;
              }
              if (usedIds.has("else") && id === "else") {
                return null;
              }
              usedIds.add(id);
              return {
                id,
                label: isElse ? "Default" : rawLabel,
                rule: String(source.rule || source.expression || source.value || "").trim(),
              };
            })
            .filter(Boolean);
          const conditionBranches = normalized.filter((branch) => branch.id !== "else");
          if (conditionBranches.length === 0) {
            conditionBranches.push({ id: "condition-1", label: normalizedConditionType === "json" ? "Match" : "", rule: "" });
          }
          const elseBranch = normalized.find((branch) => branch.id === "else") || { id: "else", label: "Default", rule: "" };
          return [
            ...conditionBranches,
            { ...elseBranch, id: "else", label: "Default", rule: "" },
          ];
        }

        function createMetronomeConditionBranchId() {
          return "condition-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
        }

        const METRONOME_FALLBACK_AGENTS = [
          { id: "assistant-agent", name: "Assistant" },
        ];

        const METRONOME_FALLBACK_COMPUTERS = [
          { id: "default-computer", name: "Default" },
        ];

        const METRONOME_FALLBACK_PROJECTS = [
          { id: "project-context", name: "Project context" },
        ];

        function getMetronomePreferredOption(options, preferredTerms, fallback) {
          const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
          const terms = (Array.isArray(preferredTerms) ? preferredTerms : [])
            .map((term) => String(term || "").toLowerCase().trim())
            .filter(Boolean);
          const preferred = normalizedOptions.find((option) => {
            const haystack = String((option?.name || "") + " " + (option?.id || "")).toLowerCase();
            return terms.some((term) => haystack.includes(term));
          });
          return preferred || normalizedOptions[0] || fallback || null;
        }

        function getMetronomeSubtypeLabel(kind, subtype) {
          const options = METRONOME_NODE_KIND_META[kind]?.subtypes || [];
          return options.find((item) => item.id === subtype)?.label || options[0]?.label || "";
        }

        function stopMetronomeInputKeyPropagation(event) {
          if (!event || typeof event.stopPropagation !== "function") return;
          event.stopPropagation();
        }

        function createMetronomeNode(kind, position, overrides = {}) {
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const subtype = overrides.subtype || meta.subtypes[0]?.id || kind;
          const normalizedSubtype = kind === "trigger" && subtype === "thread" ? "thread_event" : subtype;
          const nodeId = overrides.id || "node_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
          const overrideConfig = overrides.config || {};
          const conditionType = kind === "condition"
            ? normalizeMetronomeConditionType(overrideConfig.conditionType || normalizedSubtype)
            : "";
          return {
            id: nodeId,
            type: "metronome",
            position: position || { x: 120, y: 140 },
            data: {
              kind,
              label: overrides.label || meta.label,
              subtype: normalizedSubtype,
              description: overrides.description || getMetronomeSubtypeLabel(kind, normalizedSubtype),
	              config: kind === "condition"
	                ? {
	                    conditionType,
	                    databaseId: "",
	                    databaseName: "",
	                    databaseCollection: "",
	                    databaseDocumentId: "",
	                    databaseFieldPath: "",
	                    databaseOperator: "equals",
                    databaseCompareValue: "",
                    ticketProjectId: "",
                    ticketProjectName: "",
                    ticketId: "",
                    ticketStatusOperator: "equals",
                    ticketStatusValue: "planned",
                    ...overrideConfig,
                    conditionType,
                    conditions: normalizeMetronomeConditionBranches(overrideConfig.conditions, conditionType),
                  }
                : kind === "trigger"
                  ? {
                      triggerType: normalizedSubtype,
                      threadCommand: "@metronome",
                      promptExtension: "",
                      ...overrideConfig,
	                    }
	                : kind === "metronome"
                  ? {
                      ...overrideConfig,
                    }
                : kind === "ticket"
                  ? {
                      operation: normalizedSubtype,
                      projectId: "",
                      projectName: "",
                      ticketId: "",
                      ticketTitle: "",
                      ticketStatus: "planned",
                      comment: "",
                      fieldsJson: "{\n  \"status\": \"planned\"\n}",
                      ...overrideConfig,
                    }
                : kind === "code"
	                  ? {
	                      language: "python",
	                      source: "def run(previous):\n    # previous.output contains the result of the node before this one.\n    return {\n        \"ok\": True,\n        \"input\": previous.output,\n    }\n",
	                      ...overrideConfig,
	                    }
	                : kind === "imagine"
	                  ? {
	                      prompt: "Create an image from this workflow context.",
	                      templateId: "",
	                      templateName: "",
	                      attachmentsJson: "[]",
	                      projectId: "",
	                      projectName: "",
	                      aspectRatio: "",
	                      ...overrideConfig,
	                    }
                : kind === "action"
	                  ? {
	                      requireJsonOutput: false,
	                      jsonOutputSchema: "{\n  \"status\": \"success\",\n  \"summary\": \"string\",\n  \"data\": {}\n}",
	                      message: "Review the current project and propose the next action.",
	                      attachments: [],
	                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
	                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
	                      contextType: "computer",
	                      resource: "computer",
	                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
	                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
	                      ...overrideConfig,
	                    }
	                : kind === "approval"
	                  ? {
	                      message: "Approve this workflow step before it continues.",
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                      conditionType: "user_approval",
	                      ...overrideConfig,
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                    }
	                : overrideConfig,
            },
          };
        }

        function createDefaultMetronomeGraph() {
          const trigger = createMetronomeNode("trigger", { x: 120, y: 190 }, {
            id: "trigger_start",
            subtype: "thread_event",
            label: "Trigger",
            description: "Start when a thread message begins with @metronome.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@metronome",
              promptExtension: "",
            },
          });
          const condition = createMetronomeNode("condition", { x: 430, y: 190 }, {
            id: "condition_needs_work",
            subtype: "previous_output_contains",
            label: "Condition",
            description: "Branch by the previous node output.",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Deploy needed", rule: "deploy" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const action = createMetronomeNode("action", { x: 760, y: 126 }, {
            id: "action_run_thread",
            subtype: "start_thread",
            label: "Start agent thread",
            description: "Ask an agent to prepare the next project update.",
            config: { message: "Review the current project and propose the next action." },
          });
          const approval = createMetronomeNode("approval", { x: 760, y: 286 }, {
            id: "approval_before_deploy",
            subtype: "approve_deploy",
            label: "Approve deploy",
            description: "Pause before deploying resource changes.",
            config: { approver: "Project owner" },
          });
          return {
            nodes: [trigger, condition, action, approval],
            edges: [
              { id: "edge_trigger_condition", source: "trigger_start", target: "condition_needs_work", type: "simplebezier" },
              { id: "edge_condition_action", source: "condition_needs_work", sourceHandle: "condition-1", target: "action_run_thread", type: "simplebezier" },
              { id: "edge_condition_approval", source: "condition_needs_work", sourceHandle: "else", target: "approval_before_deploy", type: "simplebezier" },
            ],
          };
        }

        function createDefaultMetronomeWorkflow(name = "Project operating rhythm") {
          const graph = createDefaultMetronomeGraph();
          return {
            id: "met_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
            name,
            status: "draft",
            triggerSummary: "Weekday schedule",
            lastRunAt: "",
            runsToday: 0,
            waitingApprovals: 0,
            nodes: graph.nodes,
            edges: graph.edges,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        function readMetronomeWorkflowsFromStorage() {
          try {
            const parsed = JSON.parse(localStorage.getItem(METRONOME_STORAGE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
          } catch {
            return [];
          }
        }

        function writeMetronomeWorkflowsToStorage(workflows) {
          try {
            localStorage.setItem(METRONOME_STORAGE_KEY, JSON.stringify(Array.isArray(workflows) ? workflows : []));
          } catch {}
        }

        function normalizeMetronomeNodes(nodes) {
          return (Array.isArray(nodes) ? nodes : [])
            .filter((node) => node && typeof node === "object")
            .map((node, index) => {
              const nodeData = node.data && typeof node.data === "object" ? node.data : {};
              if (nodeData.kind) {
                return {
                  ...node,
                  type: node.type || "metronome",
                  position: node.position && typeof node.position === "object"
                    ? node.position
                    : { x: 120 + index * 260, y: 160 },
                  data: {
                    ...nodeData,
                    config: nodeData.config && typeof nodeData.config === "object" ? nodeData.config : {},
                  },
                };
              }
              const kind = String(node.kind || "").trim() || "action";
              const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
              return createMetronomeNode(kind, node.position && typeof node.position === "object"
                ? node.position
                : { x: 120 + index * 260, y: 160 }, {
                id: String(node.id || "node_" + index),
                subtype: String(node.subtype || ""),
                label: String(node.label || meta.label),
                description: String(node.description || ""),
                config: node.config && typeof node.config === "object" ? node.config : {},
              });
            });
        }

        function normalizeMetronomeWorkflow(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const rawNodes = Array.isArray(workflow.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          const rawEdges = Array.isArray(workflow.edges)
            ? workflow.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
          const nodes = normalizeMetronomeNodes(rawNodes);
          const edges = normalizeMetronomeEdges(rawEdges);
          return {
            id: String(workflow.id || ""),
            name: String(workflow.name || "Untitled Metronome"),
            description: String(workflow.description || ""),
            status: workflow.status === "active" ? "active" : workflow.status === "paused" ? "paused" : "draft",
            triggerSummary: String(workflow.triggerSummary || workflow.trigger_summary || deriveMetronomeTriggerSummary(nodes) || "Manual"),
            lastRunAt: workflow.lastRunAt || workflow.last_run_at || "",
            runsToday: Number(workflow.runsToday || workflow.runs_today || 0) || 0,
            waitingApprovals: Number(workflow.waitingApprovals || workflow.waiting_approvals || 0) || 0,
            nodes,
            edges,
            createdAt: workflow.createdAt || workflow.created_at || "",
            updatedAt: workflow.updatedAt || workflow.updated_at || "",
          };
        }

        function normalizeMetronomeEdges(edges) {
          return (Array.isArray(edges) ? edges : [])
            .filter((edge) => edge && typeof edge === "object")
            .map((edge) => {
              const {
                label,
                labelBgPadding,
                labelBgBorderRadius,
                labelBgStyle,
                labelStyle,
                markerEnd,
                markerStart,
                animated,
                ...rest
              } = edge;
              return {
                ...rest,
                type: "simplebezier",
              };
            });
        }

        function deriveMetronomeTriggerSummary(nodes) {
          const triggerNode = Array.isArray(nodes)
            ? nodes.find((node) => node?.data?.kind === "trigger" || node?.kind === "trigger")
            : null;
          if (!triggerNode) return "Manual";
          const triggerData = triggerNode.data && typeof triggerNode.data === "object" ? triggerNode.data : triggerNode;
          return triggerData?.label || getMetronomeSubtypeLabel("trigger", triggerData?.subtype) || "Trigger";
        }

        function createMetronomeApiPayload(workflow) {
          return {
            name: workflow?.name || "Untitled Metronome",
            description: workflow?.description || "",
            status: workflow?.status || "draft",
            triggerSummary: workflow?.triggerSummary || deriveMetronomeTriggerSummary(workflow?.nodes || []),
            definition: createMetronomeWorkflowDefinition(workflow, workflow?.nodes || [], workflow?.edges || []),
          };
        }

        async function fetchMetronomeWorkflowsFromApi() {
          const response = await fetch("/api/real/metronomes", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load Metronomes");
          }
          const data = await response.json();
          return Array.isArray(data?.data) ? data.data.map(normalizeMetronomeWorkflow) : [];
        }

        async function readMetronomeApiJson(response, fallbackMessage) {
          const text = await response.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { message: text };
          }
          if (!response.ok) {
            throw createMetronomeApiError(fallbackMessage, response, data);
          }
          return data;
        }

        async function createMetronomeWorkflowApi(workflow) {
          const response = await fetch("/api/real/metronomes", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to create Metronome");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        function createMetronomeApiError(message, response, data) {
          const upstreamMessage = String(data?.message || data?.error || "").trim();
          const error = new Error(upstreamMessage ? String(message || "Metronome request failed.") + ": " + upstreamMessage : (message || "Metronome request failed."));
          error.status = Number(response?.status || 0) || 0;
          error.data = data || null;
          return error;
        }

        async function updateMetronomeWorkflowApi(workflow) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId), {
            method: "PATCH",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          const data = await readMetronomeApiJson(response, "Failed to save Metronome");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        async function saveMetronomeWorkflowApi(workflow) {
          const workflowId = String(workflow?.id || "").trim();
          if (!workflowId) return createMetronomeWorkflowApi(workflow);
          try {
            return await updateMetronomeWorkflowApi(workflow);
          } catch (error) {
            if (error?.status === 404) {
              return createMetronomeWorkflowApi(workflow);
            }
            throw error;
          }
        }

        async function publishMetronomeWorkflowApi(workflowId, active) {
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: Boolean(active) }),
          });
          const data = await readMetronomeApiJson(response, "Failed to update Metronome status");
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        async function deleteMetronomeWorkflowApi(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Missing Metronome id");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to delete Metronome");
          }
          return true;
        }

        function normalizeMetronomeServerKind(value) {
          return String(value || "").toLowerCase().replace(/[-\s]+/g, "_");
        }

        function getMetronomeServerKindCandidates(item) {
          if (!item || typeof item !== "object") return [];
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const config = item.config && typeof item.config === "object" ? item.config : {};
          const details = item.details && typeof item.details === "object" ? item.details : {};
          return [
            item.kind,
            item.type,
            item.serverKind,
            item.server_kind,
            item.resourceKind,
            item.resource_kind,
            item.resourceType,
            item.resource_type,
            item.category,
            item.subtype,
            metadata.kind,
            metadata.serverKind,
            metadata.server_kind,
            metadata.resourceKind,
            metadata.resource_kind,
            metadata.resourceType,
            metadata.resource_type,
            config.kind,
            config.serverKind,
            config.server_kind,
            details.kind,
            details.serverKind,
            details.server_kind,
          ].map(normalizeMetronomeServerKind).filter(Boolean);
        }

        function isMetronomeDatabaseServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "database",
            "databases",
            "db",
            "sql",
            "sql_database",
            "document_database",
            "collection_database",
            "postgres",
            "postgresql",
            "postgres_database",
            "postgresql_database",
            "server_database",
            "database_server",
          ].includes(kind) || kind.endsWith("_database") || kind.endsWith("_databases");
        }

        function isMetronomeFunctionServerKind(value) {
          const kind = normalizeMetronomeServerKind(value);
          if (!kind) return false;
          return [
            "function",
            "functions",
            "cloud_function",
            "cloud_functions",
            "server_function",
            "edge_function",
            "edge_functions",
          ].includes(kind) || kind.endsWith("_function") || kind.endsWith("_functions");
        }

        async function fetchMetronomeServerResourcesApi() {
          const response = await fetch("/api/real/servers", {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load server resources");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.servers)
              ? data.servers
              : Array.isArray(data)
                ? data
                : [];
          return rawItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(item.id || item.serverId || item.server_id || "").trim();
              if (!id) return null;
              const name = String(item.name || item.title || item.label || id).trim();
              const kindCandidates = getMetronomeServerKindCandidates(item);
              const kind = kindCandidates.find(isMetronomeDatabaseServerKind)
                || kindCandidates.find(isMetronomeFunctionServerKind)
                || kindCandidates[0]
                || "";
              return { id, name: name || id, kind };
            })
            .filter(Boolean);
        }

        async function testRunMetronomeWorkflowApi(workflowId, definition) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before running a test.");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/test-run", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ definition, inputs: {} }),
          });
          if (!response.ok) {
            throw createMetronomeApiError("Test run is not available on this backend yet.", response);
          }
          const data = await response.json();
          return normalizeMetronomeRun(data?.data || data);
        }

        function normalizeMetronomeRun(rawRun) {
          const raw = rawRun && typeof rawRun === "object" ? rawRun : {};
          const output = raw.output && typeof raw.output === "object" ? raw.output : {};
          const input = raw.input && typeof raw.input === "object" ? raw.input : {};
          const steps = Array.isArray(output.steps)
            ? output.steps.map((step, index) => ({
                id: String(step?.id || "step_" + (index + 1)),
                index: Number(step?.index || index + 1) || index + 1,
                nodeId: String(step?.nodeId || "").trim(),
                edgeId: String(step?.edgeId || "").trim(),
                selectedEdgeId: String(step?.selectedEdgeId || step?.output?.selectedEdgeId || "").trim(),
                kind: String(step?.kind || "").trim(),
                label: String(step?.label || "Step " + (index + 1)).trim(),
                status: String(step?.status || raw.status || "completed").trim(),
                summary: String(step?.summary || step?.message || "").trim(),
                branchId: String(step?.branchId || step?.output?.branchId || step?.output?.branch?.id || "").trim(),
                branchLabel: String(step?.branchLabel || step?.output?.branchLabel || step?.output?.branch?.label || "").trim(),
                branchRule: String(step?.branchRule || step?.output?.branchRule || step?.output?.branch?.rule || "").trim(),
                branchMatched: Boolean(step?.branchMatched || step?.output?.branchMatched || step?.output?.branch?.matched),
                branchReason: String(step?.branchReason || step?.output?.branchReason || step?.output?.branch?.reason || "").trim(),
                startedAt: String(step?.startedAt || raw.startedAt || raw.createdAt || "").trim(),
                completedAt: String(step?.completedAt || raw.completedAt || "").trim(),
                output: step?.output && typeof step.output === "object" ? step.output : {},
              }))
            : [];
          const logs = Array.isArray(output.logs)
            ? output.logs.map((log, index) => ({
                id: String(log?.id || "log_" + (index + 1)),
                level: String(log?.level || "info").trim(),
                nodeId: String(log?.nodeId || "").trim(),
                edgeId: String(log?.edgeId || "").trim(),
                message: String(log?.message || "").trim(),
                createdAt: String(log?.createdAt || raw.createdAt || "").trim(),
              }))
            : steps.map((step) => ({
                id: "log_" + step.id,
                level: "info",
                nodeId: step.nodeId,
                edgeId: step.edgeId,
                message: step.summary,
                createdAt: step.completedAt || step.startedAt || raw.createdAt || "",
              }));
          const threads = Array.isArray(output.threads)
            ? output.threads.map((thread, index) => ({
                id: String(thread?.id || "thread_preview_" + (index + 1)),
                nodeId: String(thread?.nodeId || "").trim(),
                title: String(thread?.title || "Thread").trim(),
                prompt: String(thread?.prompt || "").trim(),
                agentName: String(thread?.agentName || "Computer Agent").trim(),
                computerName: String(thread?.computerName || "Default").trim(),
                projectName: String(thread?.projectName || "").trim(),
                status: String(thread?.status || "planned").trim(),
              }))
            : [];
          const completedNodeIds = Array.isArray(output.completedNodeIds)
            ? output.completedNodeIds.map((id) => String(id || "").trim()).filter(Boolean)
            : steps.map((step) => step.nodeId).filter(Boolean);
          const completedEdgeIds = Array.isArray(output.completedEdgeIds)
            ? output.completedEdgeIds.map((id) => String(id || "").trim()).filter(Boolean)
            : steps.flatMap((step) => [step.edgeId, step.selectedEdgeId]).filter(Boolean);
          steps.forEach((step) => {
            if (step.selectedEdgeId && !completedEdgeIds.includes(step.selectedEdgeId)) {
              completedEdgeIds.push(step.selectedEdgeId);
            }
          });
          return {
            id: String(raw.id || "").trim(),
            metronomeId: String(raw.metronomeId || raw.metronome_id || "").trim(),
            triggerType: String(raw.triggerType || raw.trigger_type || "").trim(),
            status: String(raw.status || "completed").trim(),
            input,
            output: {
              ...output,
              message: String(output.message || "").trim(),
              prompt: String(output.prompt || input.prompt || "").trim(),
              steps,
              logs,
              threads,
              completedNodeIds,
              completedEdgeIds,
              activeNodeId: output.activeNodeId ? String(output.activeNodeId).trim() : "",
              activeEdgeId: output.activeEdgeId ? String(output.activeEdgeId).trim() : "",
            },
            error: raw.error || "",
            startedAt: String(raw.startedAt || raw.started_at || "").trim(),
            completedAt: String(raw.completedAt || raw.completed_at || "").trim(),
            createdAt: String(raw.createdAt || raw.created_at || new Date().toISOString()).trim(),
            updatedAt: String(raw.updatedAt || raw.updated_at || "").trim(),
          };
        }

        async function fetchMetronomeRunsApi(workflowId, limit = 50) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return [];
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs?limit=" + encodeURIComponent(String(limit || 50)), {
            method: "GET",
            credentials: "same-origin",
          });
          if (!response.ok) {
            throw new Error("Failed to load Metronome runs.");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          return rawItems.map(normalizeMetronomeRun).filter((run) => run.id);
        }

        async function createMetronomeRunApi(workflowId, { definition, prompt, inputs } = {}) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) throw new Error("Save this Metronome before running it.");
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/runs", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              definition,
              inputs: {
                source: "manual_chat",
                ...(inputs && typeof inputs === "object" ? inputs : {}),
                prompt: String(prompt || "").trim(),
              },
            }),
          });
          const data = await readMetronomeApiJson(response, "Failed to start Metronome run.");
          return normalizeMetronomeRun(data?.data || data);
        }

        function createMetronomeWorkflowDefinition(workflow, nodes, edges) {
          return {
            version: 1,
            name: String(workflow?.name || "Untitled Metronome"),
            nodes: (Array.isArray(nodes) ? nodes : []).map((node) => {
              const data = node?.data && typeof node.data === "object" ? node.data : {};
              return {
                id: String(node?.id || ""),
                kind: String(data.kind || node?.kind || "action"),
                subtype: String(data.subtype || node?.subtype || ""),
                label: String(data.label || node?.label || ""),
                description: String(data.description || node?.description || ""),
                config: data.config && typeof data.config === "object"
                  ? data.config
                  : node?.config && typeof node.config === "object"
                    ? node.config
                    : {},
                position: node?.position && typeof node.position === "object" ? node.position : undefined,
              };
            }),
            edges: normalizeMetronomeEdges(edges).map((edge) => ({
              id: String(edge?.id || ""),
              source: String(edge?.source || ""),
              sourceHandle: edge?.sourceHandle ? String(edge.sourceHandle) : undefined,
              target: String(edge?.target || ""),
              targetHandle: edge?.targetHandle ? String(edge.targetHandle) : undefined,
            })),
          };
        }

        function escapeMetronomePythonString(value) {
          return JSON.stringify(String(value || ""));
        }

        function metronomePythonLiteral(value, indentLevel = 0) {
          const indent = " ".repeat(indentLevel);
          const nextIndent = " ".repeat(indentLevel + 4);
          if (value === null || value === undefined) return "None";
          if (typeof value === "string") return JSON.stringify(value);
          if (typeof value === "number") return Number.isFinite(value) ? String(value) : "None";
          if (typeof value === "boolean") return value ? "True" : "False";
          if (Array.isArray(value)) {
            if (!value.length) return "[]";
            return "[\n"
              + value.map((item) => nextIndent + metronomePythonLiteral(item, indentLevel + 4) + ",").join("\n")
              + "\n" + indent + "]";
          }
          if (typeof value === "object") {
            const entries = Object.entries(value).filter(([, item]) => item !== undefined);
            if (!entries.length) return "{}";
            return "{\n"
              + entries.map(([key, item]) => nextIndent + JSON.stringify(key) + ": " + metronomePythonLiteral(item, indentLevel + 4) + ",").join("\n")
              + "\n" + indent + "}";
          }
          return "None";
        }

        function getMetronomePythonNodeClass(kind) {
          const normalizedKind = String(kind || "").toLowerCase();
          if (normalizedKind === "trigger") return "TriggerNode";
          if (normalizedKind === "condition") return "ConditionNode";
          if (normalizedKind === "action") return "ThreadNode";
          if (normalizedKind === "ticket") return "TicketNode";
          if (normalizedKind === "code") return "CodeNode";
          if (normalizedKind === "imagine") return "ImagineNode";
          if (normalizedKind === "function") return "FunctionNode";
          if (normalizedKind === "database") return "DatabaseNode";
          if (normalizedKind === "metronome") return "MetronomeRunNode";
          if (normalizedKind === "loop") return "LoopNode";
          if (normalizedKind === "approval") return "UserApprovalNode";
          if (normalizedKind === "end") return "EndNode";
          if (normalizedKind === "note") return "NoteNode";
          return "MetronomeNode";
        }

        function getMetronomePythonNodeSubtypeArgument(kind, subtype) {
          const normalizedKind = String(kind || "").toLowerCase();
          const normalizedSubtype = String(subtype || "").trim();
          if (normalizedKind === "trigger") return ["trigger_type", normalizedSubtype || "manual"];
          if (normalizedKind === "ticket") return ["operation", normalizedSubtype || "update_ticket_status"];
          if (normalizedKind === "code") return ["operation", normalizedSubtype || "run_code"];
          if (normalizedKind === "imagine") return ["operation", normalizedSubtype || "start_imagine"];
          if (normalizedKind === "database") return ["operation", normalizedSubtype || "insert_document"];
          if (normalizedKind === "metronome") return ["operation", normalizedSubtype || "run_workflow"];
          return null;
        }

        function createMetronomePythonCall(className, args, indentLevel = 8) {
          const indent = " ".repeat(indentLevel);
          const closingIndent = " ".repeat(Math.max(0, indentLevel - 4));
          const lines = [className + "("];
          args.forEach(([key, value]) => {
            if (value === undefined) return;
            lines.push(indent + key + "=" + metronomePythonLiteral(value, indentLevel) + ",");
          });
          lines.push(closingIndent + ")");
          return lines.join("\n");
        }

        function createMetronomePythonConfigReader(config) {
          const rest = config && typeof config === "object" && !Array.isArray(config) ? { ...config } : {};
          const take = (...keys) => {
            for (const key of keys) {
              if (!Object.prototype.hasOwnProperty.call(rest, key)) continue;
              const value = rest[key];
              delete rest[key];
              if (value !== undefined && value !== null && value !== "") return value;
            }
            return undefined;
          };
          const remove = (...keys) => keys.forEach((key) => delete rest[key]);
          return { take, remove, rest };
        }

        function createMetronomePythonNodeCall(node) {
          const kind = String(node?.kind || "action");
          const className = getMetronomePythonNodeClass(kind);
          const subtypeArg = getMetronomePythonNodeSubtypeArgument(kind, node?.subtype);
          const configReader = createMetronomePythonConfigReader(node?.config);
          const args = [["id", String(node?.id || "")]];
          if (subtypeArg) args.push(subtypeArg);
          if (className === "MetronomeNode") {
            args.push(["kind", kind]);
            if (node?.subtype) args.push(["subtype", node.subtype]);
          }
	          if (className === "ConditionNode") {
            args.push(["condition_type", configReader.take("conditionType", "condition_type")]);
            args.push(["conditions", configReader.take("conditions")]);
	            args.push(["database_id", configReader.take("databaseId", "database_id")]);
            args.push(["database_name", configReader.take("databaseName", "database_name")]);
            args.push(["database_collection", configReader.take("databaseCollection", "database_collection", "collection")]);
	            args.push(["database_document_id", configReader.take("databaseDocumentId", "database_document_id")]);
            args.push(["database_field_path", configReader.take("databaseFieldPath", "database_field_path")]);
	            args.push(["database_operator", configReader.take("databaseOperator", "database_operator")]);
            args.push(["database_compare_value", configReader.take("databaseCompareValue", "database_compare_value")]);
            args.push(["ticket_project_id", configReader.take("ticketProjectId", "ticket_project_id")]);
            args.push(["ticket_project_name", configReader.take("ticketProjectName", "ticket_project_name")]);
            args.push(["ticket_id", configReader.take("ticketId", "ticket_id")]);
            args.push(["ticket_status_operator", configReader.take("ticketStatusOperator", "ticket_status_operator")]);
            args.push(["ticket_status", configReader.take("ticketStatusValue", "ticket_status", "status")]);
          } else if (className === "ThreadNode") {
            args.push(["message", configReader.take("message", "prompt")]);
            args.push(["agent_id", configReader.take("agentId", "agent_id")]);
            args.push(["agent_name", configReader.take("agentName", "agent_name")]);
            args.push(["computer_id", configReader.take("environmentId", "computerId", "computer_id")]);
            args.push(["computer_name", configReader.take("environmentName", "computerName", "computer_name")]);
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["require_json_output", configReader.take("requireJsonOutput", "require_json_output")]);
            args.push(["json_output_schema", configReader.take("jsonOutputSchema", "json_output_schema")]);
            configReader.remove("contextType", "resource");
          } else if (className === "TicketNode") {
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["ticket_id", configReader.take("ticketId", "ticket_id")]);
            args.push(["title", configReader.take("ticketTitle", "title")]);
            args.push(["status", configReader.take("ticketStatus", "ticket_status", "status")]);
            args.push(["comment", configReader.take("comment")]);
            args.push(["fields", configReader.take("fieldsJson", "fields_json", "fields")]);
            configReader.remove("operation");
	          } else if (className === "CodeNode") {
	            args.push(["language", configReader.take("language")]);
	            args.push(["source", configReader.take("source", "code")]);
	            configReader.remove("inputJson", "input", "payload", "payload_json", "outputKey", "output_key");
          } else if (className === "ImagineNode") {
            args.push(["template_id", configReader.take("templateId", "template_id")]);
            args.push(["template_name", configReader.take("templateName", "template_name")]);
            args.push(["prompt", configReader.take("prompt", "message")]);
            args.push(["attachments", configReader.take("attachments", "attachmentsJson", "attachments_json")]);
            args.push(["project_id", configReader.take("projectId", "project_id")]);
            args.push(["project_name", configReader.take("projectName", "project_name")]);
            args.push(["aspect_ratio", configReader.take("aspectRatio", "aspect_ratio")]);
            configReader.remove("outputKey", "output_key");
          } else if (className === "FunctionNode") {
            args.push(["function_id", configReader.take("functionId", "function_id")]);
            args.push(["function_name", configReader.take("functionName", "function_name")]);
            args.push(["payload", configReader.take("payload", "payloadJson", "payload_json")]);
            configReader.remove("outputKey", "output_key");
          } else if (className === "DatabaseNode") {
            args.push(["database_id", configReader.take("databaseId", "database_id")]);
            args.push(["database_name", configReader.take("databaseName", "database_name")]);
            args.push(["collection", configReader.take("collection", "collectionName", "collection_name")]);
            args.push(["document_id", configReader.take("documentId", "document_id")]);
            args.push(["document", configReader.take("document", "documentJson", "document_json")]);
            configReader.remove("outputKey", "output_key");
          } else if (className === "MetronomeRunNode") {
            args.push(["workflow_id", configReader.take("workflowId", "workflow_id")]);
            args.push(["workflow_name", configReader.take("workflowName", "workflow_name")]);
            configReader.remove("inputJson", "input", "payload", "payload_json", "outputKey", "output_key");
          } else if (className === "LoopNode") {
            args.push(["break_condition", configReader.take("rule", "breakCondition", "break_condition")]);
	          } else if (className === "UserApprovalNode") {
	            args.push(["instructions", configReader.take("message", "instructions")]);
	            args.push(["condition_type", "user_approval"]);
	            args.push(["conditions", normalizeMetronomeApprovalBranches(configReader.take("conditions"))]);
	          } else if (className === "NoteNode") {
            args.push(["text", configReader.take("message", "text")]);
          }
          if (node?.label) args.push(["label", node.label]);
          if (node?.description) args.push(["description", node.description]);
          const remainingConfig = Object.fromEntries(
            Object.entries(configReader.rest).filter(([, value]) => value !== undefined)
          );
          if (Object.keys(remainingConfig).length || className === "MetronomeNode") {
            args.push(["config", remainingConfig]);
          }
          if (node?.position && typeof node.position === "object") {
            args.push(["position", node.position]);
          }
          return createMetronomePythonCall(className, args);
        }

        function createMetronomePythonEdgeCall(edge) {
          const args = [
            ["id", String(edge?.id || "")],
            ["source", String(edge?.source || "")],
            ["target", String(edge?.target || "")],
          ];
          if (edge?.sourceHandle) args.push(["source_handle", String(edge.sourceHandle)]);
          if (edge?.targetHandle) args.push(["target_handle", String(edge.targetHandle)]);
          return createMetronomePythonCall("MetronomeEdge", args);
        }

        function generateMetronomePythonSdkFiles(workflow, nodes, edges) {
          const definition = createMetronomeWorkflowDefinition(workflow, nodes, edges);
          const workflowName = escapeMetronomePythonString(workflow?.name || "Untitled Metronome");
          const workflowId = String(workflow?.id || "").trim();
          const nodeLines = [
            "from computer_agents import (",
            "    TriggerNode,",
            "    ThreadNode,",
            "    TicketNode,",
            "    ConditionNode,",
            "    CodeNode,",
            "    ImagineNode,",
            "    FunctionNode,",
            "    DatabaseNode,",
            "    MetronomeRunNode,",
            "    LoopNode,",
            "    UserApprovalNode,",
            "    EndNode,",
            "    NoteNode,",
            ")",
            "",
            "",
            "def build_nodes():",
            "    return [",
            ...(definition.nodes || []).map((node) => createMetronomePythonNodeCall(node).split("\n").map((line) => "        " + line).join("\n") + ","),
            "    ]",
          ];
          const edgeLines = [
            "from computer_agents import MetronomeEdge",
            "",
            "",
            "def build_edges():",
            "    return [",
            ...(definition.edges || []).map((edge) => createMetronomePythonEdgeCall(edge).split("\n").map((line) => "        " + line).join("\n") + ","),
            "    ]",
          ];
          const mainLines = [
            "from computer_agents import ComputerAgentsClient, MetronomeWorkflow",
            "",
            "from nodes import build_nodes",
            "from edges import build_edges",
            "",
            "",
            "client = ComputerAgentsClient()",
            "",
            "",
            "def build_workflow():",
            "    return MetronomeWorkflow(",
            "        name=" + workflowName + ",",
            "        nodes=build_nodes(),",
            "        edges=build_edges(),",
            "    )",
            "",
            "",
            "workflow_definition = build_workflow()",
            "",
            "",
            "def deploy_workflow():",
            "    workflow = client.metronomes.upsert(",
            "        name=workflow_definition.name,",
          ];
          if (workflowId) {
            mainLines.push("        metronome_id=" + escapeMetronomePythonString(workflowId) + ",");
          }
          mainLines.push(
            "        status=\"draft\",",
            "        definition=workflow_definition,",
            "    )",
            "    return workflow",
            "",
            "# Publish the workflow when you are ready for it to react to real events.",
            "# client.metronomes.publish(deploy_workflow()[\"id\"])",
            "",
            "# Test-run with a sample payload before publishing.",
            "def test_workflow():",
            "    workflow = deploy_workflow()",
            "    return client.metronomes.test_run(",
            "        workflow[\"id\"],",
            "        inputs={},",
            "        definition=workflow_definition,",
            "    )",
            "",
            "",
            "if __name__ == \"__main__\":",
            "    print(test_workflow())"
          );
          return [
            { path: "main.py", language: "python", value: mainLines.join("\n") },
            { path: "nodes.py", language: "python", value: nodeLines.join("\n") },
            { path: "edges.py", language: "python", value: edgeLines.join("\n") },
            { path: "requirements.txt", language: "plaintext", value: "computer-agents\n" },
          ];
        }

        function generateMetronomePythonSdkCode(workflow, nodes, edges) {
          return generateMetronomePythonSdkFiles(workflow, nodes, edges).find((file) => file.path === "main.py")?.value || "";
        }

        function createMetronomePythonExpressionParser(source) {
          const input = String(source || "");
          let index = 0;

          const isWhitespace = (char) => /\s/.test(char || "");
          const isIdentifierStart = (char) => /[A-Za-z_]/.test(char || "");
          const isIdentifierPart = (char) => /[A-Za-z0-9_]/.test(char || "");

          const skip = () => {
            while (index < input.length) {
              const char = input[index];
              if (isWhitespace(char)) {
                index += 1;
                continue;
              }
              if (char === "#") {
                while (index < input.length && input[index] !== "\n") index += 1;
                continue;
              }
              break;
            }
          };

          const readIdentifier = () => {
            skip();
            if (!isIdentifierStart(input[index])) return "";
            const start = index;
            index += 1;
            while (index < input.length && isIdentifierPart(input[index])) index += 1;
            return input.slice(start, index);
          };

          const parseString = () => {
            const quote = input[index];
            index += 1;
            let value = "";
            while (index < input.length) {
              const char = input[index];
              if (char === "\\") {
                const next = input[index + 1];
                if (next === "n") value += "\n";
                else if (next === "t") value += "\t";
                else if (next === "r") value += "\r";
                else value += next || "";
                index += 2;
                continue;
              }
              if (char === quote) {
                index += 1;
                return value;
              }
              value += char;
              index += 1;
            }
            throw new Error("Unterminated string literal.");
          };

          const parseNumber = () => {
            const start = index;
            if (input[index] === "-") index += 1;
            while (/[0-9]/.test(input[index] || "")) index += 1;
            if (input[index] === ".") {
              index += 1;
              while (/[0-9]/.test(input[index] || "")) index += 1;
            }
            const value = Number(input.slice(start, index));
            if (!Number.isFinite(value)) throw new Error("Invalid number literal.");
            return value;
          };

          const parseList = () => {
            const items = [];
            index += 1;
            while (index < input.length) {
              skip();
              if (input[index] === "]") {
                index += 1;
                return items;
              }
              items.push(parseExpression());
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === "]") continue;
              throw new Error("Expected comma or closing bracket in list.");
            }
            throw new Error("Unterminated list literal.");
          };

          const parseDict = () => {
            const object = {};
            index += 1;
            while (index < input.length) {
              skip();
              if (input[index] === "}") {
                index += 1;
                return object;
              }
              const key = parseExpression();
              skip();
              if (input[index] !== ":") throw new Error("Expected colon in dictionary.");
              index += 1;
              object[String(key)] = parseExpression();
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === "}") continue;
              throw new Error("Expected comma or closing brace in dictionary.");
            }
            throw new Error("Unterminated dictionary literal.");
          };

          const parseIdentifierOrCall = () => {
            const identifier = readIdentifier();
            if (!identifier) throw new Error("Expected identifier.");
            if (identifier === "True") return true;
            if (identifier === "False") return false;
            if (identifier === "None") return null;
            skip();
            if (input[index] !== "(") {
              return { __identifier: identifier };
            }
            index += 1;
            const positional = [];
            const kwargs = {};
            while (index < input.length) {
              skip();
              if (input[index] === ")") {
                index += 1;
                return { __call: identifier, args: positional, kwargs };
              }
              const beforeArgument = index;
              const maybeKey = readIdentifier();
              skip();
              if (maybeKey && input[index] === "=") {
                index += 1;
                kwargs[maybeKey] = parseExpression();
              } else {
                index = beforeArgument;
                positional.push(parseExpression());
              }
              skip();
              if (input[index] === ",") {
                index += 1;
                continue;
              }
              if (input[index] === ")") continue;
              throw new Error("Expected comma or closing parenthesis in call.");
            }
            throw new Error("Unterminated call expression.");
          };

          function parseExpression() {
            skip();
            const char = input[index];
            if (char === "\"" || char === "'") return parseString();
            if (char === "[") return parseList();
            if (char === "{") return parseDict();
            if (char === "-" || /[0-9]/.test(char || "")) return parseNumber();
            return parseIdentifierOrCall();
          }

          return {
            parseExpressionAt(position) {
              index = Math.max(0, Number(position) || 0);
              return parseExpression();
            },
          };
        }

        function getMetronomePythonCallKeyword(call, key, fallback = undefined) {
          return call && call.kwargs && Object.prototype.hasOwnProperty.call(call.kwargs, key)
            ? call.kwargs[key]
            : fallback;
        }

        function parseMetronomePythonSdkCode(source) {
          const input = String(source || "");
          const assignmentIndex = input.indexOf("workflow_definition");
          const searchStart = assignmentIndex >= 0 ? assignmentIndex : 0;
          const callIndex = input.indexOf("MetronomeWorkflow(", searchStart);
          if (callIndex < 0) {
            throw new Error("Could not find workflow_definition = MetronomeWorkflow(...).");
          }
          const parser = createMetronomePythonExpressionParser(input);
          const workflowCall = parser.parseExpressionAt(callIndex);
          if (!workflowCall || workflowCall.__call !== "MetronomeWorkflow") {
            throw new Error("Expected a MetronomeWorkflow constructor.");
          }
          const workflowName = String(getMetronomePythonCallKeyword(workflowCall, "name", "Untitled Metronome") || "Untitled Metronome");
          const nodeCalls = getMetronomePythonCallKeyword(workflowCall, "nodes", []);
          const edgeCalls = getMetronomePythonCallKeyword(workflowCall, "edges", []);
          if (!Array.isArray(nodeCalls)) throw new Error("MetronomeWorkflow nodes must be a list.");
          if (!Array.isArray(edgeCalls)) throw new Error("MetronomeWorkflow edges must be a list.");

          const nodeClassToKind = {
            TriggerNode: "trigger",
            ConditionNode: "condition",
            ThreadNode: "action",
            TicketNode: "ticket",
            CodeNode: "code",
            ImagineNode: "imagine",
            FunctionNode: "function",
            DatabaseNode: "database",
            MetronomeRunNode: "metronome",
            LoopNode: "loop",
            UserApprovalNode: "approval",
            EndNode: "end",
            NoteNode: "note",
          };
          const subtypeKeywordByClass = {
            TriggerNode: "trigger_type",
            TicketNode: "operation",
            CodeNode: "operation",
            ImagineNode: "operation",
            DatabaseNode: "operation",
            MetronomeRunNode: "operation",
          };
          const normalizeConfigObject = (value) => value && typeof value === "object" && !Array.isArray(value) && !value.__call
            ? { ...value }
            : {};
          const nodes = nodeCalls.map((nodeCall, nodeIndex) => {
            if (!nodeCall || typeof nodeCall !== "object" || !nodeCall.__call) {
              throw new Error("Each workflow node must be a node constructor.");
            }
            const className = nodeCall.__call;
            const kind = className === "MetronomeNode"
              ? String(getMetronomePythonCallKeyword(nodeCall, "kind", "action") || "action")
              : nodeClassToKind[className] || "action";
            const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
            const config = normalizeConfigObject(getMetronomePythonCallKeyword(nodeCall, "config", {}));
            const subtypeKeyword = subtypeKeywordByClass[className];
            let subtype = String(
              subtypeKeyword
                ? getMetronomePythonCallKeyword(nodeCall, subtypeKeyword, "")
                : getMetronomePythonCallKeyword(nodeCall, "subtype", "")
              || meta.subtypes[0]?.id
              || kind
            );
            if (className === "ConditionNode") {
              const parsedConditionType = normalizeMetronomeConditionType(
                getMetronomePythonCallKeyword(nodeCall, "condition_type", config.conditionType || subtype)
              );
              subtype = parsedConditionType;
              config.conditionType = parsedConditionType;
              config.conditions = normalizeMetronomeConditionBranches(
                getMetronomePythonCallKeyword(nodeCall, "conditions", config.conditions),
                parsedConditionType
              );
	              const databaseId = getMetronomePythonCallKeyword(nodeCall, "database_id", undefined);
              const databaseName = getMetronomePythonCallKeyword(nodeCall, "database_name", undefined);
              const databaseCollection = getMetronomePythonCallKeyword(nodeCall, "database_collection", getMetronomePythonCallKeyword(nodeCall, "collection", undefined));
	              const databaseDocumentId = getMetronomePythonCallKeyword(nodeCall, "database_document_id", undefined);
              const databaseFieldPath = getMetronomePythonCallKeyword(nodeCall, "database_field_path", undefined);
              const databaseOperator = getMetronomePythonCallKeyword(nodeCall, "database_operator", undefined);
              const databaseCompareValue = getMetronomePythonCallKeyword(nodeCall, "database_compare_value", undefined);
              const ticketProjectId = getMetronomePythonCallKeyword(nodeCall, "ticket_project_id", undefined);
              const ticketProjectName = getMetronomePythonCallKeyword(nodeCall, "ticket_project_name", undefined);
              const ticketId = getMetronomePythonCallKeyword(nodeCall, "ticket_id", undefined);
              const ticketStatusOperator = getMetronomePythonCallKeyword(nodeCall, "ticket_status_operator", undefined);
              const ticketStatusValue = getMetronomePythonCallKeyword(nodeCall, "ticket_status", undefined);
              if (databaseId !== undefined) config.databaseId = databaseId;
              if (databaseName !== undefined) config.databaseName = databaseName;
              if (databaseCollection !== undefined) config.databaseCollection = databaseCollection;
	              if (databaseDocumentId !== undefined) config.databaseDocumentId = databaseDocumentId;
              if (databaseFieldPath !== undefined) config.databaseFieldPath = databaseFieldPath;
              if (databaseOperator !== undefined) config.databaseOperator = databaseOperator;
              if (databaseCompareValue !== undefined) config.databaseCompareValue = databaseCompareValue;
              if (ticketProjectId !== undefined) config.ticketProjectId = ticketProjectId;
              if (ticketProjectName !== undefined) config.ticketProjectName = ticketProjectName;
              if (ticketId !== undefined) config.ticketId = ticketId;
              if (ticketStatusOperator !== undefined) config.ticketStatusOperator = ticketStatusOperator;
              if (ticketStatusValue !== undefined) config.ticketStatusValue = ticketStatusValue;
            }
            if (className === "ThreadNode") {
              const message = getMetronomePythonCallKeyword(nodeCall, "message", undefined);
              const agentId = getMetronomePythonCallKeyword(nodeCall, "agent_id", undefined);
              const agentName = getMetronomePythonCallKeyword(nodeCall, "agent_name", undefined);
              const computerId = getMetronomePythonCallKeyword(nodeCall, "computer_id", undefined);
              const computerName = getMetronomePythonCallKeyword(nodeCall, "computer_name", undefined);
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const requireJsonOutput = getMetronomePythonCallKeyword(nodeCall, "require_json_output", undefined);
              const jsonOutputSchema = getMetronomePythonCallKeyword(nodeCall, "json_output_schema", undefined);
              if (message !== undefined) config.message = message;
              if (agentId !== undefined) config.agentId = agentId;
              if (agentName !== undefined) config.agentName = agentName;
              if (computerId !== undefined) config.environmentId = computerId;
              if (computerName !== undefined) config.environmentName = computerName;
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (requireJsonOutput !== undefined) config.requireJsonOutput = Boolean(requireJsonOutput);
              if (jsonOutputSchema !== undefined) config.jsonOutputSchema = jsonOutputSchema;
              if (projectId || projectName) config.contextType = "project";
            }
            if (className === "TicketNode") {
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const ticketId = getMetronomePythonCallKeyword(nodeCall, "ticket_id", undefined);
              const title = getMetronomePythonCallKeyword(nodeCall, "title", undefined);
              const status = getMetronomePythonCallKeyword(nodeCall, "status", undefined);
              const comment = getMetronomePythonCallKeyword(nodeCall, "comment", undefined);
              const fields = getMetronomePythonCallKeyword(nodeCall, "fields", undefined);
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (ticketId !== undefined) config.ticketId = ticketId;
              if (title !== undefined) config.ticketTitle = title;
              if (status !== undefined) config.ticketStatus = status;
              if (comment !== undefined) config.comment = comment;
              if (fields !== undefined) config.fieldsJson = fields;
            }
	            if (className === "CodeNode") {
	              const language = getMetronomePythonCallKeyword(nodeCall, "language", undefined);
	              const source = getMetronomePythonCallKeyword(nodeCall, "source", undefined);
	              if (language !== undefined) config.language = language;
	              if (source !== undefined) config.source = source;
	            }
            if (className === "ImagineNode") {
              const templateId = getMetronomePythonCallKeyword(nodeCall, "template_id", undefined);
              const templateName = getMetronomePythonCallKeyword(nodeCall, "template_name", undefined);
              const prompt = getMetronomePythonCallKeyword(nodeCall, "prompt", undefined);
              const attachments = getMetronomePythonCallKeyword(nodeCall, "attachments", undefined);
              const projectId = getMetronomePythonCallKeyword(nodeCall, "project_id", undefined);
              const projectName = getMetronomePythonCallKeyword(nodeCall, "project_name", undefined);
              const aspectRatio = getMetronomePythonCallKeyword(nodeCall, "aspect_ratio", undefined);
              if (templateId !== undefined) config.templateId = templateId;
              if (templateName !== undefined) config.templateName = templateName;
              if (prompt !== undefined) config.prompt = prompt;
              if (attachments !== undefined) config.attachmentsJson = attachments;
              if (projectId !== undefined) config.projectId = projectId;
              if (projectName !== undefined) config.projectName = projectName;
              if (aspectRatio !== undefined) config.aspectRatio = aspectRatio;
            }
            if (className === "FunctionNode") {
              const functionId = getMetronomePythonCallKeyword(nodeCall, "function_id", undefined);
              const functionName = getMetronomePythonCallKeyword(nodeCall, "function_name", undefined);
              const payload = getMetronomePythonCallKeyword(nodeCall, "payload", undefined);
              if (functionId !== undefined) config.functionId = functionId;
              if (functionName !== undefined) config.functionName = functionName;
              if (payload !== undefined) config.payload = payload;
            }
            if (className === "DatabaseNode") {
              const databaseId = getMetronomePythonCallKeyword(nodeCall, "database_id", undefined);
              const databaseName = getMetronomePythonCallKeyword(nodeCall, "database_name", undefined);
              const collection = getMetronomePythonCallKeyword(nodeCall, "collection", undefined);
              const documentId = getMetronomePythonCallKeyword(nodeCall, "document_id", undefined);
              const document = getMetronomePythonCallKeyword(nodeCall, "document", undefined);
              if (databaseId !== undefined) config.databaseId = databaseId;
              if (databaseName !== undefined) config.databaseName = databaseName;
              if (collection !== undefined) config.collection = collection;
              if (documentId !== undefined) config.documentId = documentId;
              if (document !== undefined) config.document = document;
            }
            if (className === "MetronomeRunNode") {
              const workflowId = getMetronomePythonCallKeyword(nodeCall, "workflow_id", undefined);
              const workflowName = getMetronomePythonCallKeyword(nodeCall, "workflow_name", undefined);
              if (workflowId !== undefined) config.workflowId = workflowId;
              if (workflowName !== undefined) config.workflowName = workflowName;
            }
            if (className === "LoopNode") {
              const breakCondition = getMetronomePythonCallKeyword(nodeCall, "break_condition", undefined);
              if (breakCondition !== undefined) config.rule = breakCondition;
            }
	            if (className === "UserApprovalNode") {
	              const instructions = getMetronomePythonCallKeyword(nodeCall, "instructions", undefined);
	              const approvalConditions = getMetronomePythonCallKeyword(nodeCall, "conditions", undefined);
	              if (instructions !== undefined) config.message = instructions;
	              config.conditionType = "user_approval";
	              config.conditions = normalizeMetronomeApprovalBranches(approvalConditions || config.conditions);
	            }
            if (className === "NoteNode") {
              const text = getMetronomePythonCallKeyword(nodeCall, "text", undefined);
              if (text !== undefined) config.message = text;
            }
            const position = getMetronomePythonCallKeyword(nodeCall, "position", null);
            const normalizedPosition = position && typeof position === "object" && !Array.isArray(position)
              ? { x: Number(position.x) || 120 + nodeIndex * 280, y: Number(position.y) || 160 }
              : { x: 120 + nodeIndex * 280, y: 160 };
            return {
              id: String(getMetronomePythonCallKeyword(nodeCall, "id", "node_" + (nodeIndex + 1)) || "node_" + (nodeIndex + 1)),
              type: "metronome",
              position: normalizedPosition,
              data: {
                kind,
                subtype,
                label: String(getMetronomePythonCallKeyword(nodeCall, "label", meta.label) || meta.label),
                description: String(getMetronomePythonCallKeyword(nodeCall, "description", getMetronomeSubtypeLabel(kind, subtype)) || ""),
                config,
              },
            };
          });
          const edges = normalizeMetronomeEdges(edgeCalls.map((edgeCall, edgeIndex) => {
            if (!edgeCall || typeof edgeCall !== "object" || edgeCall.__call !== "MetronomeEdge") {
              throw new Error("Each workflow edge must be a MetronomeEdge constructor.");
            }
            return {
              id: String(getMetronomePythonCallKeyword(edgeCall, "id", "edge_" + (edgeIndex + 1)) || "edge_" + (edgeIndex + 1)),
              source: String(getMetronomePythonCallKeyword(edgeCall, "source", "") || ""),
              target: String(getMetronomePythonCallKeyword(edgeCall, "target", "") || ""),
              sourceHandle: getMetronomePythonCallKeyword(edgeCall, "source_handle", undefined) || undefined,
              targetHandle: getMetronomePythonCallKeyword(edgeCall, "target_handle", undefined) || undefined,
            };
          }));
          return { name: workflowName, nodes, edges };
        }

        function extractMetronomeReturnedListSource(source, functionName) {
          const input = String(source || "");
          const normalizedFunctionName = String(functionName || "").trim();
          if (!normalizedFunctionName) throw new Error("Missing function name.");
          const functionIndex = input.indexOf("def " + normalizedFunctionName + "(");
          if (functionIndex < 0) throw new Error("Could not find " + normalizedFunctionName + "().");
          const returnIndex = input.indexOf("return", functionIndex);
          if (returnIndex < 0) throw new Error("Could not find return statement in " + normalizedFunctionName + "().");
          const listStart = input.indexOf("[", returnIndex);
          if (listStart < 0) throw new Error(normalizedFunctionName + "() must return a list.");
          let depth = 0;
          let quote = "";
          let escaped = false;
          let inComment = false;
          for (let index = listStart; index < input.length; index += 1) {
            const char = input[index];
            if (inComment) {
              if (char === "\n") inComment = false;
              continue;
            }
            if (quote) {
              if (escaped) {
                escaped = false;
                continue;
              }
              if (char === "\\") {
                escaped = true;
                continue;
              }
              if (char === quote) quote = "";
              continue;
            }
            if (char === "#") {
              inComment = true;
              continue;
            }
            if (char === "\"" || char === "'") {
              quote = char;
              continue;
            }
            if (char === "[") depth += 1;
            if (char === "]") {
              depth -= 1;
              if (depth === 0) {
                return input.slice(listStart, index + 1);
              }
            }
          }
          throw new Error("Could not parse list returned by " + normalizedFunctionName + "().");
        }

        function parseMetronomeWorkflowNameFromMainFile(source, fallbackName = "Untitled Metronome") {
          const input = String(source || "");
          const callIndex = input.indexOf("MetronomeWorkflow(");
          if (callIndex >= 0) {
            try {
              const parser = createMetronomePythonExpressionParser(input);
              const workflowCall = parser.parseExpressionAt(callIndex);
              const parsedName = getMetronomePythonCallKeyword(workflowCall, "name", "");
              if (parsedName) return String(parsedName);
            } catch (_error) {}
          }
          return String(fallbackName || "Untitled Metronome");
        }

        function getMetronomeCodeFileSource(files, path) {
          const normalizedPath = String(path || "").trim();
          const file = (Array.isArray(files) ? files : []).find((entry) => String(entry?.path || entry?.name || "").trim() === normalizedPath);
          return String(file?.value || "");
        }

        function parseMetronomePythonSdkFiles(files, fallbackName = "Untitled Metronome") {
          const mainSource = getMetronomeCodeFileSource(files, "main.py");
          const nodesSource = getMetronomeCodeFileSource(files, "nodes.py");
          const edgesSource = getMetronomeCodeFileSource(files, "edges.py");
          if (nodesSource && edgesSource) {
            const workflowName = parseMetronomeWorkflowNameFromMainFile(mainSource, fallbackName);
            const nodeListSource = extractMetronomeReturnedListSource(nodesSource, "build_nodes");
            const edgeListSource = extractMetronomeReturnedListSource(edgesSource, "build_edges");
            return parseMetronomePythonSdkCode([
              "workflow_definition = MetronomeWorkflow(",
              "    name=" + escapeMetronomePythonString(workflowName) + ",",
              "    nodes=" + nodeListSource + ",",
              "    edges=" + edgeListSource + ",",
              ")",
            ].join("\n"));
          }
          if (mainSource) return parseMetronomePythonSdkCode(mainSource);
          throw new Error("Metronome code must include main.py, nodes.py, and edges.py.");
        }

        function replaceMetronomeWorkflow(workflows, nextWorkflow) {
          const normalized = normalizeMetronomeWorkflow(nextWorkflow);
          if (!normalized.id) return workflows;
          const seen = new Set();
          const next = workflows.map((workflow) => {
            if (workflow.id !== normalized.id) return workflow;
            seen.add(normalized.id);
            return normalized;
          });
          return seen.has(normalized.id) ? next : [normalized, ...next];
        }

        function replaceMetronomeWorkflowById(workflows, oldWorkflowId, nextWorkflow) {
          const normalized = normalizeMetronomeWorkflow(nextWorkflow);
          if (!normalized.id) return workflows;
          const oldId = String(oldWorkflowId || "").trim();
          let replaced = false;
          let inserted = false;
          const next = (Array.isArray(workflows) ? workflows : []).reduce((items, workflow) => {
            const workflowId = String(workflow?.id || "").trim();
            if (workflowId === oldId || workflowId === normalized.id) {
              replaced = true;
              if (!inserted) {
                items.push(normalized);
                inserted = true;
              }
              return items;
            }
            items.push(workflow);
            return items;
          }, []);
          return replaced ? next : [normalized, ...next];
        }

        function formatMetronomeDate(value) {
          if (!value) return "Never";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "Never";
          return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        }

        function MetronomeWorkflowNode({ id, data, selected }) {
          const kind = data?.kind || "action";
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const Icon = meta.Icon || Play;
          const color = meta.color || "#66a6ff";
	          const isEndNode = kind === "end";
	          const isConditionNode = kind === "condition";
	          const isApprovalNode = kind === "approval";
          const isBranchNode = isConditionNode || isApprovalNode;
          const isTicketNode = kind === "ticket";
          const isCodeNode = kind === "code";
          const isImagineNode = kind === "imagine";
          const isFunctionNode = kind === "function";
          const isDatabaseNode = kind === "database";
          const isMetronomeNode = kind === "metronome";
	          const shouldHideBody = kind === "action" || kind === "trigger" || isApprovalNode || isTicketNode || isCodeNode || isImagineNode || isFunctionNode || isDatabaseNode || isMetronomeNode || isEndNode || isConditionNode;
          const config = data?.config || {};
          const title = kind === "trigger"
            ? "Trigger"
            : kind === "action"
            ? "Thread"
            : isTicketNode
              ? "Ticket"
            : isApprovalNode
              ? "User Approval"
            : isCodeNode
              ? "Code"
            : isImagineNode
              ? "Imagine"
            : isFunctionNode
              ? "Function"
            : isDatabaseNode
              ? "Database"
            : isMetronomeNode
              ? "Metronome"
            : isEndNode
              ? "End"
              : isConditionNode
                ? "Condition"
              : (data?.label || meta.label);
          const threadAgentLabel = String(config.agentName || config.agentId || "Computer Agent").trim();
          const threadTargetLabel = String(
            config.contextType === "project"
              ? (config.projectName || config.projectId || "Project")
              : (config.environmentName || config.environmentId || "Default")
          ).trim();
          const subtitle = kind === "trigger"
            ? ""
            : kind === "action"
              ? [threadAgentLabel, threadTargetLabel].filter(Boolean).join(" · ")
              : isTicketNode
                ? [
                    getMetronomeSubtypeLabel(kind, data?.subtype) || "Ticket",
                    String(config.projectName || config.projectId || "Select project").trim(),
                  ].filter(Boolean).join(" · ")
              : isCodeNode
                ? String(config.language || "Python").trim()
              : isImagineNode
                ? String(config.templateName || config.templateId || "Select template").trim()
              : isFunctionNode
                ? String(config.functionName || config.functionId || "Select function").trim()
              : isDatabaseNode
                ? [
                    getMetronomeSubtypeLabel(kind, data?.subtype) || "Database operation",
                    String(config.databaseName || config.databaseId || "Select database").trim(),
                  ].filter(Boolean).join(" · ")
              : isMetronomeNode
                ? String(config.workflowName || config.workflowId || "Select workflow").trim()
              : isEndNode || isConditionNode || isApprovalNode
                ? ""
                : meta.label + " · " + getMetronomeSubtypeLabel(kind, data?.subtype);
	          const conditionBranches = isConditionNode
	            ? normalizeMetronomeConditionBranches(config.conditions, config.conditionType || data?.subtype)
	            : isApprovalNode
	              ? normalizeMetronomeApprovalBranches(config.conditions)
	              : [];
          const conditionHandleBaseTop = 75;
          const conditionHandleStep = 47;
          const runStateClass = data?.runState ? " is-run-" + String(data.runState) : "";
	          return React.createElement("div", { className: "playground-metronome-node" + (selected ? " is-selected" : "") + (isBranchNode ? " is-condition" : "") + (isEndNode ? " is-end" : "") + runStateClass },
            React.createElement(Handle, { type: "target", position: Position.Left }),
            React.createElement("div", { className: "playground-metronome-node-header" },
              React.createElement("span", {
                className: "playground-metronome-node-icon",
                style: { backgroundColor: color, color: "#050505" },
              }, React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.9 })),
              React.createElement("div", { style: { minWidth: 0 } },
                React.createElement("div", { className: "playground-metronome-node-title" }, title),
                subtitle ? React.createElement("div", { className: "playground-metronome-node-subtitle" }, subtitle) : null
              )
            ),
            shouldHideBody ? null : React.createElement("div", { className: "playground-metronome-node-body" }, data?.description || meta.copy),
	            isBranchNode
	              ? React.createElement("div", { className: "playground-metronome-condition-branches" },
                  conditionBranches.map((branch, index) => {
                    const label = String(branch.label || branch.rule || "").trim();
                    return React.createElement("div", {
                      key: branch.id,
                      className: "playground-metronome-condition-branch" + (label ? "" : " is-empty") + (branch.id === "else" ? " is-else" : ""),
                    }, label || "\u00a0");
                  })
                )
              : null,
	            isBranchNode
	              ? conditionBranches.map((branch, index) => React.createElement(Handle, {
                  key: "condition-handle-" + branch.id,
                  id: branch.id,
                  type: "source",
                  position: Position.Right,
                  className: "playground-metronome-condition-handle",
                  style: { top: conditionHandleBaseTop + index * conditionHandleStep },
                }))
              : isEndNode ? null : React.createElement(Handle, { type: "source", position: Position.Right })
          );
        }

        function MetronomeFlowCanvas({
          nodes,
          edges,
          nodeTypes,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onCreateNode,
          onSelectNode,
          onPaneClick,
          onUndo,
          onRedo,
          canUndo,
          canRedo,
        }) {
          const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();

          const handleDrop = useCallback((event) => {
            event.preventDefault();
            const rawPayload = event.dataTransfer.getData("application/metronome-node-payload");
            let paletteItem = null;
            if (rawPayload) {
              try {
                const parsedPayload = JSON.parse(rawPayload);
                paletteItem = parsedPayload && typeof parsedPayload === "object" ? parsedPayload : null;
              } catch {
                paletteItem = null;
              }
            }
            const fallbackKind = event.dataTransfer.getData("application/metronome-node-kind");
            const kind = paletteItem?.kind || fallbackKind;
            if (!kind || !METRONOME_NODE_KIND_META[kind]) return;
            const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            onCreateNode(createMetronomeNodeFromPaletteItem(paletteItem || { kind }, {
              x: flowPosition.x - 116,
              y: flowPosition.y - 48,
            }));
          }, [onCreateNode, screenToFlowPosition]);

          const handleDragOver = useCallback((event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }, []);

          return React.createElement(ReactFlow, {
            className: "playground-metronome-flow",
            nodes,
            edges,
            nodeTypes,
            onNodesChange,
            onEdgesChange,
            onConnect,
            onDrop: handleDrop,
            onDragOver: handleDragOver,
            onNodeClick: (_event, node) => onSelectNode(node.id),
            onPaneClick,
            fitView: true,
            minZoom: 0.35,
            maxZoom: 1.35,
            defaultEdgeOptions: { type: "simplebezier" },
          },
            React.createElement(Background, { color: "rgba(255,255,255,0.16)", gap: 18, size: 1 }),
            React.createElement("div", { className: "playground-metronome-flow-controls" },
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Undo",
                disabled: !canUndo,
                onClick: onUndo,
              }, React.createElement(RotateCcw, { width: 15, height: 15, strokeWidth: 1.8 })),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Redo",
                disabled: !canRedo,
                onClick: onRedo,
              }, React.createElement(RotateCw, { width: 15, height: 15, strokeWidth: 1.8 })),
              React.createElement("span", { className: "playground-metronome-flow-controls-divider", "aria-hidden": "true" }),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Zoom in",
                onClick: () => zoomIn({ duration: 150 }),
              }, React.createElement(Plus, { width: 15, height: 15, strokeWidth: 1.9 })),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Zoom out",
                onClick: () => zoomOut({ duration: 150 }),
              }, React.createElement(Minus, { width: 15, height: 15, strokeWidth: 1.9 })),
              React.createElement("button", {
                type: "button",
                className: "playground-metronome-flow-control-button",
                "aria-label": "Center workflow",
                onClick: () => fitView({ duration: 180, padding: 0.22 }),
              }, React.createElement(Maximize2, { width: 15, height: 15, strokeWidth: 1.8 }))
            )
          );
        }

        function MetronomeGeneratedCodeEditor({ file, value, onChange }) {
          const [editorModule, setEditorModule] = useState(null);
          const [editorModuleError, setEditorModuleError] = useState("");
          const [isMonacoReady, setIsMonacoReady] = useState(false);
          const MonacoEditorComponent = editorModule?.default || null;
          const filePath = String(file?.path || "main.py").trim() || "main.py";
          const language = String(file?.language || (filePath.endsWith(".txt") ? "plaintext" : "python")).trim() || "python";

          useEffect(() => {
            let cancelled = false;
            if (typeof loadPlaygroundCodeEditorModule !== "function") {
              return () => {};
            }
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled || !module) return;
                setEditorModule(module);
                void module.loader?.init?.()
                  .then((monaco) => {
                    if (!cancelled && typeof ensurePlaygroundCodeEditorTheme === "function") {
                      ensurePlaygroundCodeEditorTheme(monaco);
                    }
                  })
                  .catch(() => {});
              })
              .catch((error) => {
                if (!cancelled) {
                  setEditorModuleError(error instanceof Error ? error.message : "Failed to load editor.");
                }
              });
            return () => {
              cancelled = true;
            };
          }, []);

          if (MonacoEditorComponent) {
            return React.createElement("div", { className: "playground-metronome-code-editor-shell playground-code-preview-editor-shell playground-servers-code-editor-shell" },
              React.createElement("div", {
                className: "playground-metronome-code-monaco" + (isMonacoReady ? " is-ready" : ""),
              },
                React.createElement(MonacoEditorComponent, {
                  path: "metronome/" + filePath,
                  height: "100%",
                  defaultLanguage: language,
                  language,
                  theme: typeof PLAYGROUND_CODE_EDITOR_THEME_NAME === "string" ? PLAYGROUND_CODE_EDITOR_THEME_NAME : "vs-dark",
                  value: String(value || ""),
                  beforeMount: ensurePlaygroundCodeEditorTheme,
                  onMount: () => setIsMonacoReady(true),
                  onChange: (nextValue) => {
                    if (typeof onChange === "function") {
                      onChange(String(nextValue || ""));
                    }
                  },
                  options: {
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    readOnly: false,
                    fontSize: 12,
                    lineHeight: 20,
                    tabSize: 2,
                    insertSpaces: true,
                    renderLineHighlight: "none",
                    lineNumbersMinChars: 3,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    wordWrap: "on",
                    padding: { top: 14, bottom: 14 },
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  },
                })
              )
            );
          }

          if (!editorModuleError) {
            return React.createElement("div", { className: "playground-metronome-code-editor-shell playground-servers-code-editor-shell" },
              React.createElement("div", { className: "playground-metronome-code-loading" },
                React.createElement(Loader2, { width: 16, height: 16, strokeWidth: 1.8 }),
                React.createElement("span", null, "Loading editor...")
              )
            );
          }

          return React.createElement("div", { className: "playground-metronome-code-editor-shell playground-servers-code-editor-shell" },
            React.createElement("textarea", {
              className: "playground-metronome-code-textarea playground-code-preview-textarea playground-servers-source-editor-textarea",
              value: String(value || ""),
              onChange: (event) => {
                if (typeof onChange === "function") {
                  onChange(event.target.value);
                }
              },
              spellCheck: false,
            })
          );
        }

        function PlaygroundMetronomePage({
          onTopNavStateChange,
          topNavActionsRef,
          onNodeDetailOpenChange,
          inspectorPortalId,
          agents = [],
          environments = [],
          projects = [],
          backendUrl = "/api/real",
          apiKey = "",
          requestHeaders = {},
          onThreadOpen,
        } = {}) {
          const [workflows, setWorkflows] = useState(() => readMetronomeWorkflowsFromStorage());
          const [isMetronomeApiAvailable, setIsMetronomeApiAvailable] = useState(true);
          const [isLoadingMetronomes, setIsLoadingMetronomes] = useState(true);
          const [activeWorkflowId, setActiveWorkflowId] = useState("");
          const activeWorkflow = workflows.find((workflow) => workflow.id === activeWorkflowId) || null;
          const isEditor = Boolean(activeWorkflow);
          const initialNodes = activeWorkflow?.nodes || [];
          const initialEdges = activeWorkflow?.edges || [];
          const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
          const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
          const [selectedNodeId, setSelectedNodeId] = useState("");
          const [activeMetronomeRichTextField, setActiveMetronomeRichTextField] = useState("");
          const promptExtensionTextareaRef = useRef(null);
          const metronomeAttachmentInputRef = useRef(null);
          const [metronomeAttachmentModalOpen, setMetronomeAttachmentModalOpen] = useState(false);
          const [isMetronomeAttachmentDragging, setIsMetronomeAttachmentDragging] = useState(false);
          const [metronomeAttachmentStatus, setMetronomeAttachmentStatus] = useState("");
          const [metronomeEnvironmentFilePickerSearch, setMetronomeEnvironmentFilePickerSearch] = useState("");
          const [metronomeEnvironmentFilePickerInventory, setMetronomeEnvironmentFilePickerInventory] = useState([]);
          const [metronomeEnvironmentFilePickerExpandedFolders, setMetronomeEnvironmentFilePickerExpandedFolders] = useState([]);
          const [metronomeEnvironmentFilePickerSelectedPaths, setMetronomeEnvironmentFilePickerSelectedPaths] = useState([]);
          const [metronomeEnvironmentFilePickerState, setMetronomeEnvironmentFilePickerState] = useState({ status: "idle", error: "" });
          const [isMetronomeAttachmentUploading, setIsMetronomeAttachmentUploading] = useState(false);
          const [workflowNameModal, setWorkflowNameModal] = useState(null);
          const [workflowNameDraft, setWorkflowNameDraft] = useState("");
          const [metronomeEditorMode, setMetronomeEditorMode] = useState("edit");
          const [graphUndoStack, setGraphUndoStack] = useState([]);
          const [graphRedoStack, setGraphRedoStack] = useState([]);
          const [metronomeServerResources, setMetronomeServerResources] = useState([]);
          const [metronomeCodeRunState, setMetronomeCodeRunState] = useState({ status: "idle", message: "" });
          const [metronomeCodeFilesDraft, setMetronomeCodeFilesDraft] = useState([]);
          const [activeMetronomeCodeFilePath, setActiveMetronomeCodeFilePath] = useState("main.py");
          const [isMetronomeCodeDirty, setIsMetronomeCodeDirty] = useState(false);
          const [metronomeRuns, setMetronomeRuns] = useState([]);
          const [isLoadingMetronomeRuns, setIsLoadingMetronomeRuns] = useState(false);
          const [selectedMetronomeRunId, setSelectedMetronomeRunId] = useState("");
          const [isMetronomeRunSidebarOpen, setIsMetronomeRunSidebarOpen] = useState(false);
          const [metronomeRunPrompt, setMetronomeRunPrompt] = useState("");
          const [metronomeRunState, setMetronomeRunState] = useState({ status: "idle", message: "" });
          const [metronomeRunAgentId, setMetronomeRunAgentId] = useState("");
          const [metronomeRunEnvironmentId, setMetronomeRunEnvironmentId] = useState("");
          const metronomeAgentOptions = useMemo(() => normalizeMetronomeOptionList(agents, METRONOME_FALLBACK_AGENTS), [agents]);
          const metronomeComputerOptions = useMemo(() => normalizeMetronomeOptionList(environments, METRONOME_FALLBACK_COMPUTERS), [environments]);
          const metronomeProjectOptions = useMemo(() => normalizeMetronomeOptionList(projects, METRONOME_FALLBACK_PROJECTS), [projects]);
          const metronomeFunctionOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => isMetronomeFunctionServerKind(resource.kind))
              .map((resource) => ({ id: resource.id, name: resource.name }));
          }, [metronomeServerResources]);
          const metronomeDatabaseOptions = useMemo(() => {
            return metronomeServerResources
              .filter((resource) => {
                if (isMetronomeDatabaseServerKind(resource.kind)) return true;
                const id = String(resource.id || "").toLowerCase();
                const name = String(resource.name || "").toLowerCase();
                return id.startsWith("db_") || /\b(database|postgres|db)\b/.test(name);
              })
              .map((resource) => ({ id: resource.id, name: resource.name }));
          }, [metronomeServerResources]);
          const defaultMetronomeAgentOption = useMemo(() => {
            return getMetronomePreferredOption(metronomeAgentOptions, ["assistant"], METRONOME_FALLBACK_AGENTS[0]);
          }, [metronomeAgentOptions]);
          const defaultMetronomeComputerOption = useMemo(() => {
            return getMetronomePreferredOption(metronomeComputerOptions, ["default"], METRONOME_FALLBACK_COMPUTERS[0]);
          }, [metronomeComputerOptions]);
          const metronomeWorkflowOptions = useMemo(() => {
            return (Array.isArray(workflows) ? workflows : [])
              .filter((workflow) => workflow && workflow.id && workflow.id !== activeWorkflowId)
              .map((workflow) => ({
                id: String(workflow.id),
                name: String(workflow.name || workflow.id || "Untitled Metronome"),
              }));
          }, [workflows, activeWorkflowId]);

          useEffect(() => {
            if (!metronomeRunAgentId && defaultMetronomeAgentOption?.id) {
              setMetronomeRunAgentId(defaultMetronomeAgentOption.id);
            }
          }, [metronomeRunAgentId, defaultMetronomeAgentOption]);

          useEffect(() => {
            if (!metronomeRunEnvironmentId && defaultMetronomeComputerOption?.id) {
              setMetronomeRunEnvironmentId(defaultMetronomeComputerOption.id);
            }
          }, [metronomeRunEnvironmentId, defaultMetronomeComputerOption]);

          useEffect(() => {
            writeMetronomeWorkflowsToStorage(workflows);
          }, [workflows]);

          useEffect(() => {
            let cancelled = false;
            setIsLoadingMetronomes(true);
            void fetchMetronomeWorkflowsFromApi()
              .then((items) => {
                if (cancelled) return;
                setWorkflows(items);
                setIsMetronomeApiAvailable(true);
              })
              .catch((error) => {
                if (cancelled) return;
                console.warn("[Metronome] Falling back to local drafts", error);
                setIsMetronomeApiAvailable(false);
                setWorkflows(readMetronomeWorkflowsFromStorage());
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomes(false);
              });
            return () => {
              cancelled = true;
            };
          }, []);

          useEffect(() => {
            let cancelled = false;
            void fetchMetronomeServerResourcesApi()
              .then((items) => {
                if (!cancelled) setMetronomeServerResources(items);
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load server resources", error);
                  setMetronomeServerResources([]);
                }
              });
            return () => {
              cancelled = true;
            };
          }, []);

          useEffect(() => {
            setNodes(activeWorkflow?.nodes || []);
            setEdges(normalizeMetronomeEdges(activeWorkflow?.edges || []));
            setSelectedNodeId("");
            setActiveMetronomeRichTextField("");
            setMetronomeEditorMode("edit");
            setGraphUndoStack([]);
            setGraphRedoStack([]);
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeFilesDraft([]);
            setActiveMetronomeCodeFilePath("main.py");
            setMetronomeCodeRunState({ status: "idle", message: "" });
            setMetronomeRuns([]);
            setSelectedMetronomeRunId("");
            setIsMetronomeRunSidebarOpen(false);
            setMetronomeRunPrompt("");
            setMetronomeRunState({ status: "idle", message: "" });
            setMetronomeAttachmentModalOpen(false);
            setIsMetronomeAttachmentDragging(false);
            setMetronomeAttachmentStatus("");
            setMetronomeEnvironmentFilePickerSearch("");
            setMetronomeEnvironmentFilePickerInventory([]);
            setMetronomeEnvironmentFilePickerExpandedFolders([]);
            setMetronomeEnvironmentFilePickerSelectedPaths([]);
            setMetronomeEnvironmentFilePickerState({ status: "idle", error: "" });
            setIsMetronomeAttachmentUploading(false);
          }, [activeWorkflowId]);

          useEffect(() => {
            setActiveMetronomeRichTextField("");
          }, [selectedNodeId]);

          useEffect(() => {
            let cancelled = false;
            if (!activeWorkflowId || !isMetronomeApiAvailable) {
              setMetronomeRuns([]);
              setSelectedMetronomeRunId("");
              setIsLoadingMetronomeRuns(false);
              return () => {
                cancelled = true;
              };
            }
            setIsLoadingMetronomeRuns(true);
            void fetchMetronomeRunsApi(activeWorkflowId)
              .then((items) => {
                if (cancelled) return;
                setMetronomeRuns(items);
                setSelectedMetronomeRunId((current) => current && items.some((run) => run.id === current) ? current : (items[0]?.id || ""));
              })
              .catch((error) => {
                if (!cancelled) {
                  console.warn("[Metronome] Failed to load runs", error);
                  setMetronomeRuns([]);
                  setSelectedMetronomeRunId("");
                }
              })
              .finally(() => {
                if (!cancelled) setIsLoadingMetronomeRuns(false);
              });
            return () => {
              cancelled = true;
            };
          }, [activeWorkflowId, isMetronomeApiAvailable]);

          useEffect(() => {
            if (!activeWorkflowId) return;
            setWorkflows((current) => current.map((workflow) => workflow.id === activeWorkflowId
              ? { ...workflow, nodes, edges, updatedAt: new Date().toISOString() }
              : workflow
            ));
          }, [nodes, edges, activeWorkflowId]);

          const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
          const selectedMetronomeRun = useMemo(() => {
            return metronomeRuns.find((run) => run.id === selectedMetronomeRunId) || metronomeRuns[0] || null;
          }, [metronomeRuns, selectedMetronomeRunId]);
          const metronomeRunHighlight = useMemo(() => {
            const output = selectedMetronomeRun?.output && typeof selectedMetronomeRun.output === "object" ? selectedMetronomeRun.output : {};
            const completedNodeIds = new Set(Array.isArray(output.completedNodeIds) ? output.completedNodeIds.map((id) => String(id || "").trim()).filter(Boolean) : []);
            const completedEdgeIds = new Set(Array.isArray(output.completedEdgeIds) ? output.completedEdgeIds.map((id) => String(id || "").trim()).filter(Boolean) : []);
            const activeNodeId = String(output.activeNodeId || "").trim();
            const activeEdgeId = String(output.activeEdgeId || "").trim();
            return { completedNodeIds, completedEdgeIds, activeNodeId, activeEdgeId };
          }, [selectedMetronomeRun]);
          const renderedMetronomeNodes = useMemo(() => nodes.map((node) => {
            const nodeId = String(node.id || "");
            const runState = metronomeRunHighlight.activeNodeId === nodeId
              ? "active"
              : metronomeRunHighlight.completedNodeIds.has(nodeId)
                ? "completed"
                : "";
            return {
              ...node,
              data: {
                ...(node.data || {}),
                runState,
              },
            };
          }), [nodes, metronomeRunHighlight]);
          const renderedMetronomeEdges = useMemo(() => normalizeMetronomeEdges(edges).map((edge) => {
            const edgeId = String(edge.id || "");
            const isActive = metronomeRunHighlight.activeEdgeId === edgeId;
            const isCompleted = metronomeRunHighlight.completedEdgeIds.has(edgeId);
            const className = [edge.className, isActive ? "is-metronome-run-active" : "", isCompleted ? "is-metronome-run-completed" : ""].filter(Boolean).join(" ");
            return {
              ...edge,
              className,
              style: {
                ...(edge.style || {}),
                stroke: isActive ? "#66a6ff" : isCompleted ? "rgba(102,166,255,0.88)" : "rgba(255,255,255,0.25)",
                strokeWidth: isActive || isCompleted ? 2 : 1.35,
              },
            };
          }), [edges, metronomeRunHighlight]);
          const nodeTypes = useMemo(() => ({ metronome: MetronomeWorkflowNode }), []);
          const metronomeWorkflowDefinition = useMemo(
            () => createMetronomeWorkflowDefinition(activeWorkflow, nodes, edges),
            [activeWorkflow, nodes, edges]
          );
          const generatedMetronomePythonFiles = useMemo(
            () => generateMetronomePythonSdkFiles(activeWorkflow, nodes, edges),
            [activeWorkflow, nodes, edges]
          );
          const generatedMetronomePythonCode = useMemo(
            () => generatedMetronomePythonFiles.find((file) => file.path === "main.py")?.value || "",
            [generatedMetronomePythonFiles]
          );
          useEffect(() => {
            if (!isMetronomeCodeDirty) {
              setMetronomeCodeFilesDraft(generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value })));
            }
          }, [generatedMetronomePythonFiles, isMetronomeCodeDirty]);
          const metronomeCodeFiles = metronomeCodeFilesDraft.length ? metronomeCodeFilesDraft : generatedMetronomePythonFiles;
          const activeMetronomeCodeFile = metronomeCodeFiles.find((file) => file.path === activeMetronomeCodeFilePath)
            || metronomeCodeFiles.find((file) => file.path === "main.py")
            || metronomeCodeFiles[0]
            || null;
          const cloneGraphValue = useCallback((value) => JSON.parse(JSON.stringify(value || [])), []);
          const getGraphSnapshot = useCallback(() => ({
            nodes: cloneGraphValue(nodes),
            edges: cloneGraphValue(edges),
          }), [nodes, edges, cloneGraphValue]);
          const getSemanticGraphSnapshotKey = useCallback((snapshot) => JSON.stringify({
            nodes: (snapshot?.nodes || []).map((node) => ({
              id: node.id,
              type: node.type,
              data: node.data || {},
            })),
            edges: (snapshot?.edges || []).map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle || "",
              targetHandle: edge.targetHandle || "",
              type: edge.type || "",
              label: edge.label || "",
              data: edge.data || {},
            })),
          }), []);
          const restoreGraphSnapshot = useCallback((snapshot) => {
            const snapshotNodes = cloneGraphValue(snapshot?.nodes || []);
            const snapshotEdges = cloneGraphValue(snapshot?.edges || []);
            setNodes((currentNodes) => {
              const currentById = new Map((currentNodes || []).map((node) => [node.id, node]));
              return snapshotNodes.map((node) => {
                const currentNode = currentById.get(node.id);
                if (!currentNode) {
                  return { ...node, selected: false };
                }
                return {
                  ...node,
                  position: currentNode.position || node.position,
                  positionAbsolute: currentNode.positionAbsolute || node.positionAbsolute,
                  measured: currentNode.measured || node.measured,
                  selected: false,
                };
              });
            });
            setEdges(normalizeMetronomeEdges(snapshotEdges).map((edge) => ({ ...edge, selected: false })));
          }, [cloneGraphValue, setNodes, setEdges]);
          const pushGraphHistory = useCallback(() => {
            const snapshot = getGraphSnapshot();
            const snapshotKey = getSemanticGraphSnapshotKey(snapshot);
            setGraphUndoStack((current) => {
              const last = current[current.length - 1];
              if (last && getSemanticGraphSnapshotKey(last) === snapshotKey) {
                return current;
              }
              return [...current.slice(-24), snapshot];
            });
            setGraphRedoStack([]);
          }, [getGraphSnapshot, getSemanticGraphSnapshotKey]);
          const undoGraphChange = useCallback(() => {
            setGraphUndoStack((current) => {
              const previous = current[current.length - 1];
              if (!previous) return current;
              setGraphRedoStack((redoCurrent) => [getGraphSnapshot(), ...redoCurrent].slice(0, 25));
              restoreGraphSnapshot(previous);
              setSelectedNodeId("");
              return current.slice(0, -1);
            });
          }, [getGraphSnapshot, restoreGraphSnapshot]);
          const redoGraphChange = useCallback(() => {
            setGraphRedoStack((current) => {
              const next = current[0];
              if (!next) return current;
              setGraphUndoStack((undoCurrent) => [...undoCurrent.slice(-24), getGraphSnapshot()]);
              restoreGraphSnapshot(next);
              setSelectedNodeId("");
              return current.slice(1);
            });
          }, [getGraphSnapshot, restoreGraphSnapshot]);
          const isSemanticNodeChange = useCallback((change) => {
            if (!change || !change.type) return false;
            if (change.type === "select" || change.type === "position" || change.type === "dimensions") {
              return false;
            }
            return true;
          }, []);
          const isSemanticEdgeChange = useCallback((change) => {
            if (!change || !change.type) return false;
            return change.type !== "select";
          }, []);
          const handleNodesChangeWithHistory = useCallback((changes) => {
            if (Array.isArray(changes) && changes.some(isSemanticNodeChange)) {
              pushGraphHistory();
            }
            onNodesChange(changes);
          }, [onNodesChange, pushGraphHistory, isSemanticNodeChange]);
          const handleEdgesChangeWithHistory = useCallback((changes) => {
            if (Array.isArray(changes) && changes.some(isSemanticEdgeChange)) {
              pushGraphHistory();
            }
            onEdgesChange(changes);
          }, [onEdgesChange, pushGraphHistory, isSemanticEdgeChange]);
          const kpis = useMemo(() => {
            const activeCount = workflows.filter((workflow) => workflow.status === "active").length;
            const runsToday = workflows.reduce((sum, workflow) => sum + (Number(workflow.runsToday) || 0), 0);
            const approvals = workflows.reduce((sum, workflow) => sum + (Number(workflow.waitingApprovals) || 0), 0);
            return [
              { label: "Workflows", value: workflows.length },
              { label: "Active", value: activeCount },
              { label: "Triggered today", value: runsToday },
              { label: "Waiting approvals", value: approvals },
              { label: "Failed runs", value: 0 },
            ];
          }, [workflows]);

          const saveWorkflowGraph = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const nextWorkflow = {
              ...activeWorkflow,
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            setWorkflows((current) => replaceMetronomeWorkflow(current, nextWorkflow));
            if (isMetronomeApiAvailable) {
              void saveMetronomeWorkflowApi(nextWorkflow)
                .then((savedWorkflow) => {
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, nextWorkflow.id, savedWorkflow));
                  if (savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                    setActiveWorkflowId(savedWorkflow.id);
                  }
                })
                .catch((error) => {
                  console.warn("[Metronome] Failed to persist draft", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, isMetronomeApiAvailable]);

          const openCreateWorkflowModal = useCallback(() => {
            setWorkflowNameDraft("Project operating rhythm");
            setWorkflowNameModal({ mode: "create", workflowId: "" });
          }, []);

          const openEditWorkflowModal = useCallback(() => {
            if (!activeWorkflow) return;
            setWorkflowNameDraft(activeWorkflow.name || "Untitled Metronome");
            setWorkflowNameModal({ mode: "edit", workflowId: activeWorkflow.id });
          }, [activeWorkflow]);

          const closeWorkflowNameModal = useCallback(() => {
            setWorkflowNameModal(null);
            setWorkflowNameDraft("");
          }, []);

          const commitWorkflowNameModal = useCallback(async () => {
            if (!workflowNameModal) return;
            const nextName = workflowNameDraft.trim() || "Untitled Metronome";
            if (workflowNameModal.mode === "create") {
              const workflow = createDefaultMetronomeWorkflow(nextName);
              if (isMetronomeApiAvailable) {
                try {
                  const savedWorkflow = await createMetronomeWorkflowApi(workflow);
                  setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                  setActiveWorkflowId(savedWorkflow.id);
                  closeWorkflowNameModal();
                  return;
                } catch (error) {
                  console.warn("[Metronome] Failed to create persisted workflow", error);
                  setIsMetronomeApiAvailable(false);
                }
              }
              setWorkflows((current) => [workflow, ...current]);
              setActiveWorkflowId(workflow.id);
              closeWorkflowNameModal();
              return;
            }
            const targetWorkflow = workflows.find((workflow) => workflow.id === workflowNameModal.workflowId) || activeWorkflow;
            if (!targetWorkflow) {
              closeWorkflowNameModal();
              return;
            }
            const nextWorkflow = {
              ...targetWorkflow,
              name: nextName,
              nodes: targetWorkflow.id === activeWorkflowId ? nodes : targetWorkflow.nodes,
              edges: targetWorkflow.id === activeWorkflowId ? edges : targetWorkflow.edges,
              triggerSummary: targetWorkflow.id === activeWorkflowId ? deriveMetronomeTriggerSummary(nodes) : targetWorkflow.triggerSummary,
              updatedAt: new Date().toISOString(),
            };
            setWorkflows((current) => replaceMetronomeWorkflow(current, nextWorkflow));
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await saveMetronomeWorkflowApi(nextWorkflow);
                setWorkflows((current) => replaceMetronomeWorkflowById(current, nextWorkflow.id, savedWorkflow));
                if (targetWorkflow.id === activeWorkflowId && savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
              } catch (error) {
                console.warn("[Metronome] Failed to rename persisted workflow", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            closeWorkflowNameModal();
          }, [workflowNameModal, workflowNameDraft, isMetronomeApiAvailable, closeWorkflowNameModal, workflows, activeWorkflow, activeWorkflowId, nodes, edges]);

          const toggleWorkflowPublished = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const nextActive = activeWorkflow.status !== "active";
            const nextWorkflow = {
              ...activeWorkflow,
              status: nextActive ? "active" : "draft",
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            setWorkflows((current) => replaceMetronomeWorkflow(current, nextWorkflow));
            if (isMetronomeApiAvailable) {
              void saveMetronomeWorkflowApi(nextWorkflow)
                .then((savedWorkflow) => publishMetronomeWorkflowApi(savedWorkflow.id, nextActive)
                  .then((publishedWorkflow) => ({ savedWorkflow, publishedWorkflow })))
                .then(({ savedWorkflow, publishedWorkflow }) => {
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, nextWorkflow.id, publishedWorkflow));
                  if (savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                    setActiveWorkflowId(savedWorkflow.id);
                  }
                })
                .catch((error) => {
                  console.warn("[Metronome] Failed to update published state", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, isMetronomeApiAvailable]);

          const duplicateActiveWorkflow = useCallback(async () => {
            if (!activeWorkflow) return;
            const now = new Date().toISOString();
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              id: "met_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
              name: (activeWorkflow.name || "Untitled Metronome") + " copy",
              status: "draft",
              nodes: JSON.parse(JSON.stringify(nodes || activeWorkflow.nodes || [])),
              edges: JSON.parse(JSON.stringify(edges || activeWorkflow.edges || [])),
              triggerSummary: deriveMetronomeTriggerSummary(nodes || activeWorkflow.nodes || []),
              lastRunAt: "",
              runsToday: 0,
              waitingApprovals: 0,
              createdAt: now,
              updatedAt: now,
            });
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await createMetronomeWorkflowApi(nextWorkflow);
                setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                setActiveWorkflowId(savedWorkflow.id);
                return;
              } catch (error) {
                console.warn("[Metronome] Failed to duplicate persisted workflow", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            setWorkflows((current) => [nextWorkflow, ...current]);
            setActiveWorkflowId(nextWorkflow.id);
          }, [activeWorkflow, nodes, edges, isMetronomeApiAvailable]);

          const deleteActiveWorkflow = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const confirmed = window.confirm("Delete \"" + (activeWorkflow.name || "Untitled Metronome") + "\"? This cannot be undone.");
            if (!confirmed) return;
            const workflowId = activeWorkflowId;
            setWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));
            setActiveWorkflowId("");
            setSelectedNodeId("");
            if (isMetronomeApiAvailable) {
              void deleteMetronomeWorkflowApi(workflowId)
                .catch((error) => {
                  console.warn("[Metronome] Failed to delete persisted workflow", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflow, activeWorkflowId, isMetronomeApiAvailable]);

          const handleMetronomeCodeFileSelect = useCallback((path) => {
            const normalizedPath = String(path || "").trim();
            if (normalizedPath) setActiveMetronomeCodeFilePath(normalizedPath);
          }, []);

          const handleMetronomeCodeFileChange = useCallback((nextCode) => {
            const activePath = String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "main.py");
            setMetronomeCodeFilesDraft((current) => {
              const baseFiles = current.length ? current : generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value }));
              return baseFiles.map((file) => file.path === activePath
                ? { ...file, value: String(nextCode || "") }
                : file
              );
            });
            setIsMetronomeCodeDirty(true);
            setMetronomeCodeRunState({ status: "idle", message: "" });
          }, [activeMetronomeCodeFile, activeMetronomeCodeFilePath, generatedMetronomePythonFiles]);

          const handleRevertMetronomeCodeDraft = useCallback(() => {
            setMetronomeCodeFilesDraft(generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value })));
            setActiveMetronomeCodeFilePath("main.py");
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeRunState({ status: "idle", message: "Reverted to the visual workflow." });
          }, [generatedMetronomePythonFiles]);

          const applyMetronomeCodeDraftToGraph = useCallback((options = {}) => {
            if (!activeWorkflowId || !activeWorkflow) {
              throw new Error("Open a Metronome workflow before applying code.");
            }
            const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
            const nextNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
            const nextEdges = normalizeMetronomeEdges(parsed.edges);
            pushGraphHistory();
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            const nextName = String(parsed.name || activeWorkflow.name || "Untitled Metronome").trim() || "Untitled Metronome";
            setWorkflows((current) => current.map((workflow) => workflow.id === activeWorkflowId
              ? {
                  ...workflow,
                  name: nextName,
                  nodes: nextNodes,
                  edges: nextEdges,
                  triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
                  updatedAt: new Date().toISOString(),
                }
              : workflow
            ));
            setIsMetronomeCodeDirty(false);
            const nextFiles = generateMetronomePythonSdkFiles({ ...activeWorkflow, name: nextName }, nextNodes, nextEdges)
              .map((file) => ({ ...file, originalValue: file.value }));
            setMetronomeCodeFilesDraft(nextFiles);
            setActiveMetronomeCodeFilePath((currentPath) => nextFiles.some((file) => file.path === currentPath) ? currentPath : "main.py");
            if (!options.silent) {
              setMetronomeCodeRunState({ status: "success", message: "Code applied to the visual editor." });
            }
            return { name: nextName, nodes: nextNodes, edges: nextEdges };
          }, [activeWorkflow, activeWorkflowId, metronomeCodeFiles, pushGraphHistory, setNodes, setEdges]);

          const handleApplyMetronomeCodeDraft = useCallback(() => {
            try {
              applyMetronomeCodeDraftToGraph();
            } catch (error) {
              setMetronomeCodeRunState({ status: "error", message: error?.message || "Could not apply code to the visual editor." });
            }
          }, [applyMetronomeCodeDraftToGraph]);

          const setMetronomeEditorModeFromNav = useCallback((nextMode) => {
            const normalizedMode = nextMode === "runs" ? "runs" : nextMode === "code" ? "code" : "edit";
            if (normalizedMode !== "code" && metronomeEditorMode === "code" && isMetronomeCodeDirty) {
              try {
                applyMetronomeCodeDraftToGraph({ silent: true });
              } catch (error) {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Fix code errors before returning to the visual editor." });
                return;
              }
            }
            setMetronomeEditorMode(normalizedMode);
          }, [metronomeEditorMode, isMetronomeCodeDirty, applyMetronomeCodeDraftToGraph]);

          const handleCopyGeneratedMetronomeCode = useCallback(() => {
            if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
              void navigator.clipboard.writeText(String(activeMetronomeCodeFile?.value || ""));
            }
          }, [activeMetronomeCodeFile]);

          const handleTestRunGeneratedMetronome = useCallback(() => {
            if (!activeWorkflow?.id) {
              setMetronomeCodeRunState({ status: "error", message: "Save the workflow before running a test." });
              return;
            }
            let nextDefinition = metronomeWorkflowDefinition;
            if (isMetronomeCodeDirty) {
              try {
                const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
                nextDefinition = createMetronomeWorkflowDefinition(
                  { ...activeWorkflow, name: parsed.name || activeWorkflow.name },
                  parsed.nodes,
                  parsed.edges
                );
              } catch (error) {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Fix code errors before running a test." });
                return;
              }
            }
            setMetronomeCodeRunState({ status: "loading", message: "Starting test run..." });
            const workflowForRun = {
              ...activeWorkflow,
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            void saveMetronomeWorkflowApi(workflowForRun)
              .then((savedWorkflow) => {
                setWorkflows((current) => replaceMetronomeWorkflowById(current, workflowForRun.id, savedWorkflow));
                if (savedWorkflow.id && savedWorkflow.id !== activeWorkflow.id) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
                return testRunMetronomeWorkflowApi(savedWorkflow.id, nextDefinition);
              })
              .then(() => {
                setMetronomeCodeRunState({ status: "success", message: "Test run started." });
              })
              .catch((error) => {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Test run failed." });
              });
          }, [activeWorkflow, nodes, edges, metronomeWorkflowDefinition, metronomeCodeFiles, isMetronomeCodeDirty]);

          const openMetronomeRunSidebar = useCallback((runId = "") => {
            setSelectedNodeId("");
            const normalizedRunId = String(runId || "").trim();
            if (normalizedRunId) {
              setSelectedMetronomeRunId(normalizedRunId);
            }
            setIsMetronomeRunSidebarOpen(true);
          }, []);

          const closeMetronomeRunSidebar = useCallback(() => {
            setIsMetronomeRunSidebarOpen(false);
          }, []);

          const getRunnableMetronomeDefinition = useCallback(() => {
            if (!activeWorkflow) {
              throw new Error("Open a Metronome workflow before running.");
            }
            if (metronomeEditorMode === "code" && isMetronomeCodeDirty) {
              const parsed = parseMetronomePythonSdkFiles(metronomeCodeFiles, activeWorkflow.name);
              return createMetronomeWorkflowDefinition(
                { ...activeWorkflow, name: parsed.name || activeWorkflow.name },
                parsed.nodes,
                parsed.edges
              );
            }
            return metronomeWorkflowDefinition;
          }, [activeWorkflow, metronomeEditorMode, isMetronomeCodeDirty, metronomeCodeFiles, metronomeWorkflowDefinition]);

          const startMetronomeRun = useCallback((prompt = metronomeRunPrompt, options = {}) => {
            if (!activeWorkflow?.id) {
              setMetronomeRunState({ status: "error", message: "Save this Metronome before running it." });
              return;
            }
            const runAgentId = String(options?.agentId || metronomeRunAgentId || defaultMetronomeAgentOption?.id || "").trim();
            const runEnvironmentId = String(options?.environmentId || metronomeRunEnvironmentId || defaultMetronomeComputerOption?.id || "").trim();
            let nextDefinition = metronomeWorkflowDefinition;
            try {
              nextDefinition = getRunnableMetronomeDefinition();
            } catch (error) {
              setMetronomeRunState({ status: "error", message: error?.message || "Fix workflow code before running." });
              return;
            }
            const workflowForRun = {
              ...activeWorkflow,
              nodes,
              edges,
              triggerSummary: deriveMetronomeTriggerSummary(nodes),
              updatedAt: new Date().toISOString(),
            };
            setMetronomeRunState({ status: "loading", message: "Starting workflow run..." });
            void saveMetronomeWorkflowApi(workflowForRun)
              .then((savedWorkflow) => {
                setIsMetronomeApiAvailable(true);
                setWorkflows((current) => replaceMetronomeWorkflowById(current, workflowForRun.id, savedWorkflow));
                if (savedWorkflow.id && savedWorkflow.id !== activeWorkflow.id) {
                  setActiveWorkflowId(savedWorkflow.id);
                }
                return createMetronomeRunApi(savedWorkflow.id, {
                  definition: nextDefinition,
                  prompt,
                  inputs: {
                    agentId: runAgentId,
                    environmentId: runEnvironmentId,
                    sourceThreadId: options?.sourceThreadId || null,
                    attachments: Array.isArray(options?.attachments) ? options.attachments : [],
                    enabledSkills: options?.enabledSkills || null,
                  },
                })
                  .then((run) => ({ run, savedWorkflow }))
                  .catch((error) => {
                    if (error?.status !== 404) {
                      throw error;
                    }
                    return createMetronomeWorkflowApi(workflowForRun)
                      .then((recreatedWorkflow) => {
                        setIsMetronomeApiAvailable(true);
                        setWorkflows((current) => replaceMetronomeWorkflowById(current, savedWorkflow.id || workflowForRun.id, recreatedWorkflow));
                        if (recreatedWorkflow.id && recreatedWorkflow.id !== activeWorkflow.id) {
                          setActiveWorkflowId(recreatedWorkflow.id);
                        }
                        return createMetronomeRunApi(recreatedWorkflow.id, {
                          definition: nextDefinition,
                          prompt,
                          inputs: {
                            agentId: runAgentId,
                            environmentId: runEnvironmentId,
                            sourceThreadId: options?.sourceThreadId || null,
                            attachments: Array.isArray(options?.attachments) ? options.attachments : [],
                            enabledSkills: options?.enabledSkills || null,
                          },
                        }).then((run) => ({ run, savedWorkflow: recreatedWorkflow }));
                      });
                  });
              })
              .then((run) => {
                const nextRun = run?.run || run;
                const savedWorkflow = run?.savedWorkflow || activeWorkflow;
                setMetronomeRuns((current) => [nextRun, ...current.filter((item) => item.id !== nextRun.id)]);
                setSelectedMetronomeRunId(nextRun.id);
                setMetronomeEditorMode("runs");
                setIsMetronomeRunSidebarOpen(true);
                setMetronomeRunPrompt("");
                setMetronomeRunState({ status: "success", message: "Workflow run completed." });
                setWorkflows((current) => current.map((workflow) => workflow.id === savedWorkflow.id
                  ? {
                      ...workflow,
                      lastRunAt: nextRun.createdAt || new Date().toISOString(),
                      runsToday: (Number(workflow.runsToday) || 0) + 1,
                    }
                  : workflow
                ));
              })
              .catch((error) => {
                setMetronomeRunState({ status: "error", message: error?.message || "Workflow run failed." });
              });
          }, [activeWorkflow, nodes, edges, metronomeWorkflowDefinition, getRunnableMetronomeDefinition, metronomeRunPrompt, metronomeRunAgentId, metronomeRunEnvironmentId, defaultMetronomeAgentOption, defaultMetronomeComputerOption]);

          const returnToMetronomeOverview = useCallback(() => {
            setActiveWorkflowId("");
            setSelectedNodeId("");
            setIsMetronomeRunSidebarOpen(false);
          }, []);

          useEffect(() => {
            if (!topNavActionsRef) return;
            topNavActionsRef.current = activeWorkflow
              ? {
                  edit: openEditWorkflowModal,
                  rename: openEditWorkflowModal,
                  duplicate: duplicateActiveWorkflow,
                  delete: deleteActiveWorkflow,
                  publish: toggleWorkflowPublished,
                  run: openMetronomeRunSidebar,
                  goOverview: returnToMetronomeOverview,
                  setMode: setMetronomeEditorModeFromNav,
                }
              : {
                  edit: null,
                  rename: null,
                  duplicate: null,
                  delete: null,
                  publish: null,
                  run: null,
                  goOverview: returnToMetronomeOverview,
                  setMode: null,
                };
          }, [topNavActionsRef, activeWorkflow, openEditWorkflowModal, duplicateActiveWorkflow, deleteActiveWorkflow, toggleWorkflowPublished, openMetronomeRunSidebar, returnToMetronomeOverview, setMetronomeEditorModeFromNav]);

          useEffect(() => {
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(Boolean(selectedNodeId || isMetronomeRunSidebarOpen));
            }
          }, [onNodeDetailOpenChange, selectedNodeId, isMetronomeRunSidebarOpen]);

          useEffect(() => {
            if (typeof onTopNavStateChange !== "function") return;
            if (!activeWorkflow) {
              onTopNavStateChange(null);
              return;
            }
            onTopNavStateChange({
              mode: "editor",
              workflowId: activeWorkflow.id,
              title: activeWorkflow.name || "Untitled Metronome",
              status: activeWorkflow.status === "active" ? "active" : "draft",
              editorMode: metronomeEditorMode === "runs" ? "runs" : metronomeEditorMode === "code" ? "code" : "edit",
            });
          }, [onTopNavStateChange, activeWorkflow?.id, activeWorkflow?.name, activeWorkflow?.status, metronomeEditorMode]);

          useEffect(() => () => {
            if (topNavActionsRef) {
              topNavActionsRef.current = { edit: null, rename: null, duplicate: null, delete: null, publish: null, run: null, goOverview: null, setMode: null };
            }
            if (typeof onTopNavStateChange === "function") {
              onTopNavStateChange(null);
            }
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(false);
            }
          }, []);

          const handleConnect = useCallback((params) => {
            pushGraphHistory();
            setEdges((current) => addEdge({ ...params, type: "simplebezier" }, current));
          }, [setEdges, pushGraphHistory]);

          const handleDragStart = useCallback((event, item) => {
            const paletteItem = item && typeof item === "object" ? item : { kind: String(item || "action") };
            event.dataTransfer.setData("application/metronome-node-kind", paletteItem.kind || "action");
            event.dataTransfer.setData("application/metronome-node-payload", JSON.stringify({
              kind: paletteItem.kind || "action",
              subtype: paletteItem.subtype || "",
              label: paletteItem.label || "",
              copy: paletteItem.copy || "",
            }));
            event.dataTransfer.effectAllowed = "move";
          }, []);

          const handleCreateNode = useCallback((nextNode) => {
            if (!nextNode) return;
            pushGraphHistory();
            setNodes((current) => [...current, nextNode]);
            setSelectedNodeId(nextNode.id);
          }, [setNodes, pushGraphHistory]);

          const updateSelectedNodeData = useCallback((patch) => {
            if (!selectedNodeId) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              const nextData = { ...(node.data || {}), ...patch };
              return { ...node, data: nextData };
            }));
          }, [selectedNodeId, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfig = useCallback((key, value) => {
            if (!selectedNodeId) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    [key]: value,
                  },
                },
              };
            }));
          }, [selectedNodeId, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfigPatch = useCallback((patch) => {
            if (!selectedNodeId) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...(patch || {}),
                  },
                },
              };
            }));
          }, [selectedNodeId, setNodes, pushGraphHistory]);

          useEffect(() => {
            if (!selectedNodeId || selectedNode?.data?.kind !== "action") return;
            const currentConfig = selectedNode.data?.config && typeof selectedNode.data.config === "object"
              ? selectedNode.data.config
              : {};
            const patch = {};
            const hasFallbackAgent = currentConfig.agentId === METRONOME_FALLBACK_AGENTS[0].id && defaultMetronomeAgentOption?.id !== METRONOME_FALLBACK_AGENTS[0].id;
            if ((!currentConfig.agentId || hasFallbackAgent) && defaultMetronomeAgentOption?.id) {
              patch.agentId = defaultMetronomeAgentOption.id;
              patch.agentName = defaultMetronomeAgentOption.name || "Assistant";
            }
            const contextType = currentConfig.contextType === "project" ? "project" : "computer";
            const hasFallbackComputer = currentConfig.environmentId === METRONOME_FALLBACK_COMPUTERS[0].id && defaultMetronomeComputerOption?.id !== METRONOME_FALLBACK_COMPUTERS[0].id;
            if (contextType === "computer" && (!currentConfig.environmentId || hasFallbackComputer) && defaultMetronomeComputerOption?.id) {
              patch.contextType = "computer";
              patch.resource = "computer";
              patch.environmentId = defaultMetronomeComputerOption.id;
              patch.environmentName = defaultMetronomeComputerOption.name || "Default";
            }
            if (!Object.keys(patch).length) return;
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...patch,
                  },
                },
              };
            }));
          }, [selectedNodeId, selectedNode, defaultMetronomeAgentOption, defaultMetronomeComputerOption, setNodes]);

          const renderOverview = () => React.createElement("div", { className: "playground-metronome-overview" },
            React.createElement("div", { className: "playground-metronome-header" },
              React.createElement("div", null,
                React.createElement("div", { className: "playground-metronome-kicker" }, "Create"),
                React.createElement("h1", { className: "playground-metronome-title" }, "Metronome"),
                React.createElement("p", { className: "playground-metronome-copy" },
                  "Build agentic workflows that connect schedules, threads, projects, files, computers, resources, connectors, approvals, and deployed outputs."
                )
              ),
              React.createElement("button", { type: "button", className: "playground-metronome-primary-button", onClick: openCreateWorkflowModal },
                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 2 }),
                React.createElement("span", null, "New Metronome")
              )
            ),
            React.createElement("div", { className: "playground-metronome-kpis" },
              kpis.map((kpi) => React.createElement("div", { key: kpi.label, className: "playground-metronome-kpi" },
                React.createElement("div", { className: "playground-metronome-kpi-label" }, kpi.label),
                React.createElement("div", { className: "playground-metronome-kpi-value" }, kpi.value)
              ))
            ),
            React.createElement("div", { className: "playground-metronome-section-header" },
              React.createElement("div", { className: "playground-metronome-section-title" }, "Agentic workflows"),
              workflows.length
                ? React.createElement("button", { type: "button", className: "playground-metronome-secondary-button", onClick: openCreateWorkflowModal },
                    React.createElement(Plus, { width: 14, height: 14, strokeWidth: 2 }),
                    React.createElement("span", null, "Create")
                  )
                : null
            ),
            isLoadingMetronomes
              ? React.createElement("div", { className: "playground-metronome-empty" },
                  React.createElement("div", { className: "playground-metronome-empty-inner" },
                    React.createElement("span", { className: "playground-metronome-empty-icon" }, React.createElement(Metronome, { width: 24, height: 24, strokeWidth: 1.8 })),
                    React.createElement("div", { className: "playground-metronome-empty-title" }, "Loading Metronomes"),
                    React.createElement("div", { className: "playground-metronome-empty-copy" }, "Fetching persisted workflow drafts and published automations.")
                  )
                )
              : workflows.length
                ? React.createElement("div", { className: "playground-metronome-table" },
                  React.createElement("div", { className: "playground-metronome-table-row is-head" },
                    React.createElement("div", null, "Metronome"),
                    React.createElement("div", null, "Status"),
                    React.createElement("div", null, "Trigger"),
                    React.createElement("div", null, "Last run"),
                    React.createElement("div", null)
                  ),
                  workflows.map((workflow) => React.createElement("button", {
                    key: workflow.id,
                    type: "button",
                    className: "playground-metronome-table-row",
                    onClick: () => setActiveWorkflowId(workflow.id),
                  },
                    React.createElement("div", { className: "playground-metronome-name-cell" },
                      React.createElement("span", { className: "playground-metronome-name-icon" }, React.createElement(Metronome, { width: 17, height: 17, strokeWidth: 1.9 })),
                      React.createElement("div", { style: { minWidth: 0 } },
                        React.createElement("div", { className: "playground-metronome-name-title" }, workflow.name || "Untitled metronome"),
                        React.createElement("div", { className: "playground-metronome-name-subtitle" }, (workflow.nodes?.length || 0) + " nodes · " + (workflow.edges?.length || 0) + " connections")
                      )
                    ),
                    React.createElement("div", null, React.createElement("span", { className: "playground-metronome-chip" + (workflow.status === "active" ? " is-active" : "") }, workflow.status === "active" ? "Active" : "Draft")),
                    React.createElement("div", { className: "playground-metronome-name-subtitle" }, workflow.triggerSummary || "Manual"),
                    React.createElement("div", { className: "playground-metronome-name-subtitle" }, formatMetronomeDate(workflow.lastRunAt)),
                    React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 })
                  ))
                )
              : React.createElement("div", { className: "playground-metronome-empty" },
                  React.createElement("div", { className: "playground-metronome-empty-inner" },
                    React.createElement("span", { className: "playground-metronome-empty-icon" }, React.createElement(Metronome, { width: 24, height: 24, strokeWidth: 1.8 })),
                    React.createElement("div", { className: "playground-metronome-empty-title" }, "No Metronomes yet"),
                    React.createElement("div", { className: "playground-metronome-empty-copy" },
                      "Create a workflow that starts from a schedule, thread, ticket, resource, connector event, or database change, then lets agents act with project context."
                    ),
                    React.createElement("button", { type: "button", className: "playground-metronome-primary-button", onClick: openCreateWorkflowModal },
                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 2 }),
                      React.createElement("span", null, "Create workflow")
                    )
                  )
                )
          );

          const renderPalette = () => React.createElement("aside", { className: "playground-metronome-node-palette" },
            React.createElement("div", { className: "playground-metronome-palette-header" },
              React.createElement("button", { type: "button", className: "playground-metronome-palette-back-button", onClick: () => setActiveWorkflowId("") },
                React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.9 })
              ),
              React.createElement("div", { className: "playground-metronome-palette-title" }, activeWorkflow?.name || "Metronome")
            ),
            React.createElement("div", { className: "playground-metronome-palette-list" },
              METRONOME_NODE_PALETTE_GROUPS.map((group) => React.createElement("div", {
                key: group.title,
                className: "playground-metronome-palette-section",
              },
                React.createElement("div", { className: "playground-metronome-palette-section-title" }, group.title),
                group.items.map((item) => {
                  const meta = METRONOME_NODE_KIND_META[item.kind] || METRONOME_NODE_KIND_META.action;
                  const Icon = item.Icon || meta.Icon || Play;
                  const color = item.color || meta.color || "#66a6ff";
                  return React.createElement("button", {
                    key: item.id || item.kind + "-" + item.label,
                    type: "button",
                    className: "playground-metronome-palette-item",
                    draggable: true,
                    onDragStart: (event) => handleDragStart(event, item),
                    onClick: () => {
                      const nextNode = createMetronomeNodeFromPaletteItem(item, { x: 260 + nodes.length * 28, y: 160 + nodes.length * 18 });
                      handleCreateNode(nextNode);
                    },
                  },
                    React.createElement("span", {
                      className: "playground-metronome-palette-item-icon",
                      style: { backgroundColor: color, color: item.iconColor || "#050505" },
                    }, React.createElement(Icon, { width: 14, height: 14, strokeWidth: 2 })),
                    React.createElement("span", { className: "playground-metronome-palette-item-text" },
                      React.createElement("span", { className: "playground-metronome-palette-item-label" }, item.label),
                      React.createElement("span", { className: "playground-metronome-palette-item-copy" }, item.copy)
                    )
                  );
                })
              ))
            )
          );

          const renderInspector = () => {
            if (!selectedNode) return null;
            const kind = selectedNode.data?.kind || "action";
            const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
            const config = selectedNode.data?.config || {};
            const subtype = selectedNode.data?.subtype || meta.subtypes[0]?.id || "";
            const threadContextType = config.contextType === "project" ? "project" : "computer";
            const selectedConditionType = kind === "condition"
              ? normalizeMetronomeConditionType(config.conditionType || subtype)
              : "";
            const conditionBranches = kind === "condition"
              ? normalizeMetronomeConditionBranches(config.conditions, selectedConditionType)
              : [];
            const editableConditionBranchCount = conditionBranches.filter((branch) => branch.id !== "else").length;
            const canEditConditionBranches = selectedConditionType === "previous_output_contains" || selectedConditionType === "json";
            const canAddConditionBranches = canEditConditionBranches;
            const updateConditionBranch = (branchId, patch) => {
              const nextBranches = normalizeMetronomeConditionBranches(conditionBranches.map((branch) => branch.id === branchId
                ? { ...branch, ...(patch || {}) }
                : branch
              ), selectedConditionType);
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const addConditionBranch = () => {
              if (!canAddConditionBranches) return;
              const elseBranch = conditionBranches.find((branch) => branch.id === "else") || { id: "else", label: "Else", rule: "" };
              const branchesBeforeElse = conditionBranches.filter((branch) => branch.id !== "else");
              const nextBranches = normalizeMetronomeConditionBranches([
                ...branchesBeforeElse,
                { id: createMetronomeConditionBranchId(), label: "", rule: "" },
                elseBranch,
              ], selectedConditionType);
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const removeConditionBranch = (branchId) => {
              if (!canEditConditionBranches || branchId === "else" || editableConditionBranchCount <= 1) return;
              updateSelectedNodeConfigPatch({
                conditions: normalizeMetronomeConditionBranches(
                  conditionBranches.filter((branch) => branch.id !== branchId),
                  selectedConditionType
                ),
              });
            };
            const selectedTriggerType = kind === "trigger"
              ? String(config.triggerType || subtype || "thread_event").trim() || "thread_event"
              : "";
            const normalizedThreadCommand = (value) => {
              const rawValue = String(value || "").trim();
              if (!rawValue) return "@";
              return rawValue.startsWith("@") ? rawValue : "@" + rawValue;
            };
            const handleMetronomeRichFieldFormat = (fieldKey, formatType) => {
              const textarea = promptExtensionTextareaRef.current;
              const current = String(config[fieldKey] || "");
              const start = typeof textarea?.selectionStart === "number" ? textarea.selectionStart : current.length;
              const end = typeof textarea?.selectionEnd === "number" ? textarea.selectionEnd : current.length;
              const selected = current.slice(start, end);
              let before = "";
              let after = "";
              let fallbackText = "text";
              if (formatType === "bold") {
                before = "**";
                after = "**";
                fallbackText = "important context";
              } else if (formatType === "italic") {
                before = "_";
                after = "_";
                fallbackText = "context";
              } else if (formatType === "underline") {
                before = "<u>";
                after = "</u>";
                fallbackText = "context";
              } else if (formatType === "list") {
                before = current && !current.endsWith("\n") ? "\n- " : "- ";
                fallbackText = "instruction";
              }
              const replacement = selected || fallbackText;
              const nextValue = current.slice(0, start) + before + replacement + after + current.slice(end);
              updateSelectedNodeConfig(fieldKey, nextValue);
              window.setTimeout(() => {
                if (!textarea) return;
                textarea.focus();
                const nextStart = start + before.length;
                const nextEnd = nextStart + replacement.length;
                textarea.setSelectionRange(nextStart, nextEnd);
                if (typeof resizeTaskDescriptionTextarea === "function") {
                  resizeTaskDescriptionTextarea(textarea);
                }
              }, 0);
            };
            const renderMetronomeFieldTooltip = (copy) => copy
              ? React.createElement("span", {
                  className: "playground-metronome-field-tooltip",
                  tabIndex: 0,
                  "aria-label": copy,
                },
                  React.createElement(Info, { width: 11, height: 11, strokeWidth: 2 }),
                  React.createElement("span", { className: "playground-metronome-field-tooltip-popover" }, copy)
                )
              : null;
            const renderMetronomeRichTextField = ({ fieldKey, title, placeholder, tooltip, description }) => {
              const fieldValue = String(config[fieldKey] || "");
              const isEditing = activeMetronomeRichTextField === fieldKey;
              return React.createElement("div", { className: "playground-tasks-detail-description" },
                React.createElement("div", { className: "playground-tasks-detail-section-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title playground-metronome-prompt-title-row" },
                    React.createElement("span", null, title),
                    renderMetronomeFieldTooltip(tooltip)
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                    [
                      { id: "bold", label: "Bold", icon: Bold },
                      { id: "italic", label: "Italic", icon: Italic },
                      { id: "underline", label: "Underline", icon: Underline },
                      { id: "list", label: "List", icon: List },
                    ].map((action) => {
                      const ActionIcon = action.icon;
                      return React.createElement("button", {
                        key: action.id,
                        type: "button",
                        className: "playground-tasks-detail-format-button",
                        title: action.label,
                        "aria-label": action.label,
                        onMouseDown: (event) => event.preventDefault(),
                        onClick: () => handleMetronomeRichFieldFormat(fieldKey, action.id),
                      }, React.createElement(ActionIcon, { width: 14, height: 14, strokeWidth: 1.8 }));
                    })
                  )
                ),
                description
                  ? React.createElement("p", { className: "playground-tasks-detail-description-help" }, description)
                  : null,
                React.createElement("div", {
                  className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview"),
                  onMouseDown: (event) => {
                    if (event.target && event.target.tagName === "TEXTAREA") {
                      return;
                    }
                    const textarea = event.currentTarget.querySelector("textarea");
                    if (!textarea) {
                      return;
                    }
                    event.preventDefault();
                    setActiveMetronomeRichTextField(fieldKey);
                    window.setTimeout(() => {
                      textarea.focus();
                      const valueLength = String(textarea.value || "").length;
                      textarea.setSelectionRange(valueLength, valueLength);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(textarea);
                      }
                    }, 0);
                  },
                },
                  !isEditing
                    ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                        React.createElement("div", { className: "playground-tasks-detail-description-preview" },
                          fieldValue
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, { content: fieldValue })
                            : React.createElement("span", { className: "playground-tasks-detail-description-placeholder" }, placeholder)
                        )
                      )
                    : null,
                  React.createElement("textarea", {
                    ref: promptExtensionTextareaRef,
                    className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                    rows: 1,
                    placeholder: isEditing ? placeholder : "",
                    value: fieldValue,
                    onFocus: (event) => {
                      setActiveMetronomeRichTextField(fieldKey);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      }
                    },
                    onChange: (event) => {
                      updateSelectedNodeConfig(fieldKey, event.target.value);
                      if (typeof resizeTaskDescriptionTextarea === "function") {
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      }
                    },
                    onBlur: () => setActiveMetronomeRichTextField(""),
                  })
                )
              );
            };
            const renderConditionHint = () => {
              if (selectedConditionType === "previous_output_contains") {
                return "Each branch checks whether the previous node output contains its substring. Default runs when nothing matches.";
              }
              if (selectedConditionType === "database_document_field") {
                return "Reads the selected document field and routes through True or False based on the operator.";
              }
              if (selectedConditionType === "ticket_status") {
                return "Checks the current status of a ticket in a project and routes through True or False.";
              }
              if (selectedConditionType === "json") {
                return "Evaluates branch rules against previous.output. Use expressions such as previous.output.status == 'ready'. Default runs when nothing matches.";
              }
              return "";
            };
            const renderTriggerSettings = () => React.createElement(React.Fragment, null,
              selectedTriggerType === "thread_event" || selectedTriggerType === "thread"
                ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Thread message command"),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.threadCommand || "@metronome",
                        placeholder: "@campaign",
                        onChange: (event) => updateSelectedNodeConfig("threadCommand", event.target.value),
                        onBlur: (event) => updateSelectedNodeConfig("threadCommand", normalizedThreadCommand(event.target.value)),
                      }),
                      React.createElement("div", { className: "playground-metronome-field-hint" }, "Runs immediately when a user message starts with this command.")
                    ),
                    renderMetronomeRichTextField({
                      fieldKey: "promptExtension",
                      title: "Prompt extension",
                      placeholder: "Add prompt extension here",
                      description: "Additional instructions appended to the triggering message before the workflow continues.",
                    })
                  )
                : React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("div", { className: "playground-metronome-field-hint" }, "This trigger type is not runnable yet. Thread events are the first supported trigger.")
                )
            );
            const renderConditionSettings = () => {
              const isFixedBranches = selectedConditionType === "database_document_field" || selectedConditionType === "ticket_status";
              const branchRulePlaceholder = selectedConditionType === "json"
                ? "previous.output.status == 'ready'"
                : selectedConditionType === "previous_output_contains"
                  ? "Substring to match"
                  : "Resolved value";
              const branchLabelPlaceholder = selectedConditionType === "json"
                ? "Branch label"
                : selectedConditionType === "previous_output_contains"
                  ? "Branch label"
                  : "Branch";
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field-hint" }, renderConditionHint()),
                selectedConditionType === "database_document_field"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Database"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: config.databaseId || "",
                          onChange: (event) => {
                            const nextDatabaseId = event.target.value;
                            const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                            updateSelectedNodeConfigPatch({
                              databaseId: nextDatabaseId,
                              databaseName: nextDatabase?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select database"),
                          metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Collection"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCollection || config.collection || "",
                          placeholder: "customers",
                          onChange: (event) => updateSelectedNodeConfig("databaseCollection", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Document ID"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseDocumentId || "",
                          placeholder: "doc_123 or {{ previous.document_id }}",
                          onChange: (event) => updateSelectedNodeConfig("databaseDocumentId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-condition-compact-grid" },
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Field path"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: config.databaseFieldPath || "",
                            placeholder: "status",
                            onChange: (event) => updateSelectedNodeConfig("databaseFieldPath", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Operator"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.databaseOperator || "equals",
                            onChange: (event) => updateSelectedNodeConfig("databaseOperator", event.target.value),
                          },
                            React.createElement("option", { value: "equals" }, "Equals"),
                            React.createElement("option", { value: "not_equals" }, "Not equals"),
                            React.createElement("option", { value: "contains" }, "Contains"),
                            React.createElement("option", { value: "not_contains" }, "Not contains")
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Compare value"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.databaseCompareValue || "",
                          placeholder: "active",
                          onChange: (event) => updateSelectedNodeConfig("databaseCompareValue", event.target.value),
                        })
                      )
                    )
                  : null,
                selectedConditionType === "ticket_status"
                  ? React.createElement("div", { className: "playground-metronome-condition-fields" },
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Project"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: config.ticketProjectId || "",
                          onChange: (event) => {
                            const nextProjectId = event.target.value;
                            const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                            updateSelectedNodeConfigPatch({
                              ticketProjectId: nextProjectId,
                              ticketProjectName: nextProject?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select project"),
                          metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                        )
                      ),
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Ticket ID"),
                        React.createElement("input", {
                          type: "text",
                          className: "playground-metronome-input",
                          value: config.ticketId || "",
                          placeholder: "ticket_123 or {{ previous.ticket_id }}",
                          onChange: (event) => updateSelectedNodeConfig("ticketId", event.target.value),
                        })
                      ),
                      React.createElement("div", { className: "playground-metronome-condition-compact-grid" },
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Operator"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.ticketStatusOperator || "equals",
                            onChange: (event) => updateSelectedNodeConfig("ticketStatusOperator", event.target.value),
                          },
                            React.createElement("option", { value: "equals" }, "Equals"),
                            React.createElement("option", { value: "not_equals" }, "Not equals")
                          )
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Status"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.ticketStatusValue || "planned",
                            onChange: (event) => updateSelectedNodeConfig("ticketStatusValue", event.target.value),
                          },
                            ticketStatusOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                          )
                        )
                      )
                    )
                  : null,
                isFixedBranches
                  ? null
                  : React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Branches"),
                    React.createElement("div", { className: "playground-metronome-condition-editor" },
                      conditionBranches.map((branch) => {
                        const isElseBranch = branch.id === "else";
                        const isLockedBranch = isElseBranch || isFixedBranches;
                        return React.createElement("div", {
                          key: branch.id,
                          className: "playground-metronome-condition-editor-row" + (isFixedBranches ? " is-fixed" : ""),
                        },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: branch.label || "",
                            placeholder: isElseBranch ? "Default" : branchLabelPlaceholder,
                            disabled: isLockedBranch,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateConditionBranch(branch.id, { label: event.target.value }),
                          }),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: branch.rule || "",
                            placeholder: isElseBranch ? "No match" : branchRulePlaceholder,
                            disabled: isLockedBranch,
                            onKeyDown: stopMetronomeInputKeyPropagation,
                            onKeyUp: stopMetronomeInputKeyPropagation,
                            onChange: (event) => updateConditionBranch(branch.id, { rule: event.target.value }),
                          }),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-condition-editor-remove",
                            disabled: isLockedBranch || editableConditionBranchCount <= 1,
                            "aria-label": "Remove condition branch",
                            onClick: () => removeConditionBranch(branch.id),
                          }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                        );
                      }),
                      canAddConditionBranches
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-condition-editor-add",
                            onClick: addConditionBranch,
                          },
                            React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                            React.createElement("span", null, selectedConditionType === "json" ? "Add JSON branch" : "Add substring branch")
                          )
                        : null
                    )
                  )
              );
            };
            const getMetronomeBackendUrl = () => {
              let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
              while (normalizedBackendUrl.length > 1 && normalizedBackendUrl.endsWith("/")) {
                normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
              }
              return normalizedBackendUrl;
            };
            const resolveMetronomeAttachmentEnvironment = (nodeConfig = config) => {
              const configuredEnvironmentId = String(nodeConfig.environmentId || "").trim();
              if (configuredEnvironmentId) {
                const configuredEnvironment = metronomeComputerOptions.find((environment) => String(environment.id) === configuredEnvironmentId);
                if (configuredEnvironment) {
                  return configuredEnvironment;
                }
              }
              return metronomeComputerOptions[0] || null;
            };
            const loadMetronomeEnvironmentFileInventory = async (environmentId) => {
              const normalizedEnvironmentId = String(environmentId || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the environment." });
                setMetronomeEnvironmentFilePickerInventory([]);
                return false;
              }
              setMetronomeEnvironmentFilePickerState({ status: "loading", error: "" });
              setMetronomeEnvironmentFilePickerInventory([]);
              setMetronomeEnvironmentFilePickerExpandedFolders([]);
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              try {
                const filesUrl = buildPlaygroundEnvironmentFilesListUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, "", -1);
                const response = await fetch(filesUrl, {
                  method: "GET",
                  headers: requestHeaders || {},
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load environment files.");
                }
                const nextInventory = normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data);
                setMetronomeEnvironmentFilePickerInventory(nextInventory);
                setMetronomeEnvironmentFilePickerState({ status: "ready", error: "" });
                return true;
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load environment files.";
                setMetronomeEnvironmentFilePickerInventory([]);
                setMetronomeEnvironmentFilePickerState({ status: "error", error: errorMessage });
                return false;
              }
            };
            const openMetronomeEnvironmentFilePicker = () => {
              if (isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              if (!attachmentEnvironment?.id) {
                setMetronomeAttachmentStatus("Select a computer before attaching files from the environment.");
                return;
              }
              setMetronomeAttachmentStatus("");
              setMetronomeEnvironmentFilePickerSearch("");
              setMetronomeEnvironmentFilePickerSelectedPaths([]);
              setMetronomeAttachmentModalOpen(true);
              void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id);
            };
            const uploadMetronomeAttachmentContent = async ({ filename, mimeType, data, options = {} }) => {
              const normalizedEnvironmentId = typeof options === "string"
                ? String(options || "").trim()
                : String(options?.environmentId || "").trim();
              const normalizedSourcePath = typeof options === "object" && options?.sourcePath
                ? normalizeHistoryPath(options.sourcePath)
                : "";
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(getMetronomeBackendUrl() + "/attachments/upload", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  filename: filename || "attachment",
                  mimeType: mimeType || "application/octet-stream",
                  data,
                  ...(normalizedEnvironmentId ? { environmentId: normalizedEnvironmentId } : {}),
                }),
              });
              const uploadResult = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(uploadResult?.message || uploadResult?.error || "Failed to upload attachment.");
              }
              const rawAttachment = uploadResult?.attachment && typeof uploadResult.attachment === "object"
                ? uploadResult.attachment
                : {};
              const normalizedMimeType = String(rawAttachment.mimeType || rawAttachment.contentType || mimeType || "application/octet-stream");
              const attachmentId = String(rawAttachment.id || rawAttachment.attachmentId || ("metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8)));
              const attachmentUrl = rawAttachment.url || (attachmentId ? getMetronomeBackendUrl() + "/attachments/" + encodeURIComponent(attachmentId) : "");
              return {
                ...rawAttachment,
                id: attachmentId,
                name: rawAttachment.name || rawAttachment.filename || filename || "Attachment",
                filename: rawAttachment.filename || rawAttachment.name || filename || "Attachment",
                mimeType: normalizedMimeType,
                type: rawAttachment.type || (normalizedMimeType.startsWith("image/") ? "image" : "file"),
                size: Number(rawAttachment.size || rawAttachment.byteSize || 0),
                url: attachmentUrl,
                previewUrl: rawAttachment.previewUrl || attachmentUrl,
                environmentId: normalizedEnvironmentId || rawAttachment.environmentId || rawAttachment.sourceEnvironmentId || "",
                sourceEnvironmentId: normalizedEnvironmentId || rawAttachment.sourceEnvironmentId || rawAttachment.environmentId || "",
                sourcePath: normalizedSourcePath || rawAttachment.sourcePath || rawAttachment.workspacePath || "",
                workspacePath: normalizedSourcePath || rawAttachment.workspacePath || rawAttachment.sourcePath || "",
                source: "environment",
              };
            };
            const uploadMetronomeAttachmentFile = async (file, options = {}) => uploadMetronomeAttachmentContent({
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              data: await readFileAsBase64(file),
              options,
            });
            const appendMetronomeUploadedAttachments = (uploadedAttachments) => {
              const normalizedAttachments = (Array.isArray(uploadedAttachments) ? uploadedAttachments : []).filter(Boolean);
              if (!normalizedAttachments.length) {
                return false;
              }
              const currentNode = nodes.find((node) => node.id === selectedNodeId) || selectedNode;
              const latestAttachments = Array.isArray(currentNode?.data?.config?.attachments)
                ? currentNode.data.config.attachments
                : Array.isArray(config.attachments)
                  ? config.attachments
                  : [];
              updateSelectedNodeConfig("attachments", latestAttachments.concat(normalizedAttachments));
              return true;
            };
            const toggleMetronomeEnvironmentFileSelection = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerSelectedPaths((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const toggleMetronomeEnvironmentFileFolder = (path) => {
              const normalizedPath = normalizeHistoryPath(path);
              if (!normalizedPath) return;
              setMetronomeEnvironmentFilePickerExpandedFolders((current) =>
                current.includes(normalizedPath)
                  ? current.filter((value) => value !== normalizedPath)
                  : current.concat(normalizedPath)
              );
            };
            const handleAttachMetronomeEnvironmentFiles = async () => {
              if (!metronomeAttachmentModalOpen || isMetronomeAttachmentUploading) {
                return;
              }
              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const normalizedEnvironmentId = String(attachmentEnvironment?.id || "").trim();
              if (!normalizedEnvironmentId) {
                setMetronomeEnvironmentFilePickerState({ status: "error", error: "Select a computer before attaching files from the environment." });
                return;
              }
              const selectedEntries = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              );
              if (!selectedEntries.length) {
                return;
              }
              setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: "" }));
              setMetronomeAttachmentStatus("");
              setIsMetronomeAttachmentUploading(true);
              try {
                const uploadedAttachments = [];
                for (const entry of selectedEntries) {
                  const downloadUrl = buildPlaygroundEnvironmentDownloadUrl(getMetronomeBackendUrl(), normalizedEnvironmentId, entry.path);
                  const response = await fetch(downloadUrl, {
                    method: "GET",
                    headers: requestHeaders || {},
                  });
                  if (!response.ok) {
                    throw new Error("Failed to load " + (entry.name || "file") + " (" + response.status + ")");
                  }
                  const blob = await response.blob();
                  const file = new globalThis.File([blob], entry.name || "file", {
                    type: entry.mimeType || blob.type || "application/octet-stream",
                  });
                  uploadedAttachments.push(await uploadMetronomeAttachmentFile(file, {
                    environmentId: normalizedEnvironmentId,
                    sourcePath: entry.path,
                  }));
                }
                appendMetronomeUploadedAttachments(uploadedAttachments);
                setMetronomeAttachmentModalOpen(false);
                setMetronomeEnvironmentFilePickerSelectedPaths([]);
                setMetronomeEnvironmentFilePickerSearch("");
                setMetronomeAttachmentStatus(uploadedAttachments.length === 1 ? "1 file attached." : uploadedAttachments.length + " files attached.");
                setIsMetronomeAttachmentUploading(false);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to attach environment files.";
                setMetronomeEnvironmentFilePickerState((current) => ({ ...current, error: errorMessage }));
                setMetronomeAttachmentStatus(errorMessage);
                setIsMetronomeAttachmentUploading(false);
              }
            };
            const renderMetronomeEnvironmentFilePickerIcon = (entry) => {
              if (entry?.isFolder) {
                return React.createElement("img", {
                  src: PLAYGROUND_FOLDER_ICON_URL,
                  alt: "",
                  draggable: false,
                  className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
                });
              }
              if (getPlaygroundFileKind(entry) === "image") {
                return React.createElement(ImageIcon, {
                  className: "tb-file-browser-item-icon tb-file-browser-item-icon-file",
                  strokeWidth: 1.75,
                });
              }
              return React.createElement("img", {
                src: PLAYGROUND_TEXT_FILE_ICON_URL,
                alt: "",
                draggable: false,
                className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
              });
            };
            const renderMetronomeEnvironmentFilePickerRow = (row) => {
              const entry = row.entry;
              const normalizedPath = normalizeHistoryPath(entry.path);
              const isSelected = metronomeEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
              const isExpanded = metronomeEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
              const metaValue = row.searchMatch
                ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
                : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);

              return React.createElement("div", { key: normalizedPath || entry.id },
                React.createElement("div", {
                  className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                  role: "button",
                  tabIndex: 0,
                  onClick: () => {
                    if (entry.isFolder && !row.searchMatch) {
                      toggleMetronomeEnvironmentFileFolder(normalizedPath);
                      return;
                    }
                    toggleMetronomeEnvironmentFileSelection(normalizedPath);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (entry.isFolder && !row.searchMatch) {
                        toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        return;
                      }
                      toggleMetronomeEnvironmentFileSelection(normalizedPath);
                    }
                  },
                  style: row.searchMatch ? undefined : { paddingLeft: String(12 + row.level * 20) + "px" },
                },
                  entry.isFolder && !row.searchMatch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-item-leading",
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileFolder(normalizedPath);
                        },
                      },
                        isExpanded
                          ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                          : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                      )
                    : React.createElement("div", {
                        className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          toggleMetronomeEnvironmentFileSelection(normalizedPath);
                        },
                      },
                        isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                      ),
                  renderMetronomeEnvironmentFilePickerIcon(entry),
                  React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
                  React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
                  React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
                )
              );
            };
            const renderMetronomeEnvironmentFilePickerSidebar = (attachmentEnvironment) => React.createElement("div", { className: "tb-file-browser-sidebar" },
              React.createElement("div", { className: "tb-file-browser-search-wrap" },
                React.createElement("div", { className: "tb-file-browser-search" },
                  React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                  React.createElement("input", {
                    className: "tb-file-browser-search-input",
                    value: metronomeEnvironmentFilePickerSearch,
                    placeholder: "Search files...",
                    onChange: (event) => setMetronomeEnvironmentFilePickerSearch(event.target.value),
                  }),
                  metronomeEnvironmentFilePickerSearch
                    ? React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-search-clear",
                        onClick: () => setMetronomeEnvironmentFilePickerSearch(""),
                        "aria-label": "Clear search",
                      }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                    : null
                )
              ),
              attachmentEnvironment
                ? React.createElement("div", { className: "tb-file-browser-sidebar-section tb-file-browser-sidebar-section-environments" },
                    React.createElement("div", { className: "tb-file-browser-sidebar-title" }, "Environments"),
                    React.createElement("div", { className: "tb-file-browser-sidebar-list tb-file-browser-sidebar-list-environments" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-source-row active",
                        onClick: () => void loadMetronomeEnvironmentFileInventory(attachmentEnvironment.id),
                      },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 }),
                        React.createElement("span", { className: "tb-file-browser-source-label" }, attachmentEnvironment.name || "Environment")
                      )
                    )
                  )
                : null
            );
            const renderThreadAttachments = () => {
              const attachments = Array.isArray(config.attachments) ? config.attachments : [];
              const hasAttachments = attachments.length > 0;
              const openMetronomeAttachmentPicker = () => {
                if (metronomeAttachmentInputRef.current) {
                  metronomeAttachmentInputRef.current.click();
                }
              };
              const normalizeMetronomeAttachmentFiles = (fileList) => Array.from(fileList || [])
                .filter(Boolean)
                .map((file) => ({
                  id: "metronome_attachment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
                  name: file.name || "Attachment",
                  filename: file.name || "Attachment",
                  size: Number(file.size || 0),
                  type: file.type || "application/octet-stream",
                  source: "upload",
                }));
              const addMetronomeAttachmentFiles = (fileList) => {
                const nextFiles = normalizeMetronomeAttachmentFiles(fileList);
                if (!nextFiles.length) {
                  return;
                }
                updateSelectedNodeConfig("attachments", attachments.concat(nextFiles));
                setMetronomeAttachmentStatus(nextFiles.length === 1 ? "1 file attached." : nextFiles.length + " files attached.");
              };
              const removeMetronomeAttachment = (attachmentToRemove) => {
                const removeKey = String(attachmentToRemove?.id || attachmentToRemove?.path || attachmentToRemove?.filename || attachmentToRemove?.name || "");
                updateSelectedNodeConfig("attachments", attachments.filter((attachment, index) => {
                  const key = String(attachment?.id || attachment?.path || attachment?.filename || attachment?.name || index);
                  return key !== removeKey;
                }));
              };
              const renderMetronomeAttachmentChip = (attachment, index) => {
                const label = String(attachment?.filename || attachment?.name || attachment?.path || "Attachment");
                return React.createElement("div", {
                  key: String(attachment?.id || attachment?.path || label || index),
                  className: "runner-attachment runner-attachment-file",
                },
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-file-button",
                    tabIndex: -1,
                    "aria-label": "Attached " + label,
                  },
                    React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                      React.createElement(FileText, { className: "runner-attachment-file-icon", width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("div", { className: "runner-attachment-file-name", title: label }, label)
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-remove runner-attachment-remove-file",
                    "aria-label": "Remove " + label,
                    onClick: () => removeMetronomeAttachment(attachment),
                  }, React.createElement(X, { className: "runner-attachment-remove-icon", width: 12, height: 12, strokeWidth: 2 }))
                );
              };
              const handleMetronomeAttachmentDrop = (event) => {
                event.preventDefault();
                setIsMetronomeAttachmentDragging(false);
                addMetronomeAttachmentFiles(event.dataTransfer?.files);
              };
              return React.createElement("div", { className: "playground-tasks-attachments playground-metronome-thread-attachments" },
                React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
                  React.createElement("div", { className: "playground-tasks-attachments-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                      onClick: openMetronomeEnvironmentFilePicker,
                    }, "From Environment")
                  )
                ),
                React.createElement("input", {
                  ref: metronomeAttachmentInputRef,
                  type: "file",
                  multiple: true,
                  hidden: true,
                  onChange: (event) => {
                    addMetronomeAttachmentFiles(event.target.files);
                    event.target.value = "";
                  },
                }),
                React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                  React.createElement("div", {
                    className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isMetronomeAttachmentDragging ? " dragging" : "") + (hasAttachments ? " is-filled" : ""),
                    onDragOver: (event) => {
                      event.preventDefault();
                      setIsMetronomeAttachmentDragging(true);
                    },
                    onDragLeave: (event) => {
                      if (event.currentTarget.contains(event.relatedTarget)) {
                        return;
                      }
                      setIsMetronomeAttachmentDragging(false);
                    },
                    onDrop: handleMetronomeAttachmentDrop,
                  },
                    hasAttachments
                      ? React.createElement(React.Fragment, null,
                          React.createElement("div", { className: "playground-tasks-attachments-topline" },
                            React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                            React.createElement("span", null, isMetronomeAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-browse",
                              onClick: openMetronomeAttachmentPicker,
                            }, "browse.")
                          ),
                          React.createElement("div", { className: "runner-attachments" },
                            attachments.map((attachment, index) => renderMetronomeAttachmentChip(attachment, index))
                          )
                        )
                      : React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-attachments-empty-button",
                          onClick: openMetronomeAttachmentPicker,
                        },
                          React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                          React.createElement("span", { className: "tb-popup-dropzone-title" }, isMetronomeAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                          React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                        )
                    )
                ),
                metronomeAttachmentStatus
                  ? React.createElement("div", { className: "playground-tasks-attachments-status" }, metronomeAttachmentStatus)
                  : null
              );
            };
            const renderMetronomeAttachmentModal = () => {
              if (!metronomeAttachmentModalOpen) {
                return null;
              }

              const attachmentEnvironment = resolveMetronomeAttachmentEnvironment(config);
              const selectedFilesCount = metronomeEnvironmentFilePickerInventory.filter((entry) =>
                !entry.isFolder && metronomeEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
              ).length;
              const searchQuery = String(metronomeEnvironmentFilePickerSearch || "").trim();
              const metronomeEnvironmentFilePickerRows = searchQuery
                ? buildPlaygroundEnvironmentSearchRows(metronomeEnvironmentFilePickerInventory, searchQuery, { filesOnly: true })
                : buildPlaygroundEnvironmentVisibleRows(
                    buildPlaygroundEnvironmentTree(metronomeEnvironmentFilePickerInventory),
                    "",
                    new Set(metronomeEnvironmentFilePickerExpandedFolders)
                  ).map((row) => ({ ...row, searchMatch: false }));

              return React.createElement("div", { className: "tb-runner-chat playground-metronome-environment-file-picker-portal" },
                React.createElement("div", {
                  className: "tb-file-browser-scrim",
                  onClick: () => {
                    if (!isMetronomeAttachmentUploading) {
                      setMetronomeAttachmentModalOpen(false);
                    }
                  },
                },
                  React.createElement("div", {
                    className: "tb-file-browser-modal",
                    onClick: (event) => event.stopPropagation(),
                  },
                    React.createElement("div", { className: "tb-file-browser-body" },
                      renderMetronomeEnvironmentFilePickerSidebar(attachmentEnvironment),
                      React.createElement("div", { className: "tb-file-browser-main" },
                        React.createElement("div", { className: "tb-file-browser-header" },
                          React.createElement("button", {
                            type: "button",
                            className: "tb-file-browser-nav-button",
                            onClick: () => {
                              if (!isMetronomeAttachmentUploading) {
                                setMetronomeAttachmentModalOpen(false);
                              }
                            },
                            "aria-label": "Close environment files",
                          }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                          React.createElement("div", { className: "tb-file-browser-header-icon" },
                            React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                          ),
                          React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                            React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                              React.createElement("button", {
                                type: "button",
                                className: "tb-file-browser-breadcrumb active",
                              }, attachmentEnvironment?.name || "Environment")
                            )
                          ),
                          React.createElement("div", { className: "tb-file-browser-count" }, selectedFilesCount + (selectedFilesCount === 1 ? " file selected" : " files selected"))
                        ),
                        React.createElement("div", { className: "tb-file-browser-list" },
                          metronomeEnvironmentFilePickerState.status === "loading"
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading environment files...")
                            : metronomeEnvironmentFilePickerState.error
                              ? React.createElement("div", { className: "tb-file-browser-empty" }, metronomeEnvironmentFilePickerState.error)
                              : metronomeEnvironmentFilePickerRows.length === 0
                                ? React.createElement("div", { className: "tb-file-browser-empty" }, searchQuery ? "No matching files found." : "No files found in this environment.")
                                : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                    metronomeEnvironmentFilePickerRows.map((row) => renderMetronomeEnvironmentFilePickerRow(row))
                                  )
                        )
                      )
                    ),
                    React.createElement("div", { className: "tb-file-browser-footer" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                        onClick: () => {
                          if (!isMetronomeAttachmentUploading) {
                            setMetronomeAttachmentModalOpen(false);
                          }
                        },
                      }, "Cancel"),
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                        onClick: () => void handleAttachMetronomeEnvironmentFiles(),
                        disabled: selectedFilesCount === 0 || isMetronomeAttachmentUploading,
                      },
                        React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                          isMetronomeAttachmentUploading
                            ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                            : null,
                          React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                            isMetronomeAttachmentUploading ? "Attaching Files..." : "Attach Files"
                          )
                        )
                      )
                    )
                  )
                )
              );
            };
            const renderMetronomeAttachmentModalPortal = () => {
              const modalElement = renderMetronomeAttachmentModal();
              if (!modalElement) {
                return null;
              }
              if (typeof document === "undefined" || typeof createPortal !== "function") {
                return modalElement;
              }
              return createPortal(modalElement, document.body);
            };
            const renderJsonSchemaEditor = () => React.createElement("div", { className: "playground-metronome-json-output-box" },
              React.createElement("div", { className: "playground-metronome-field playground-metronome-code-section" },
                React.createElement("label", { className: "playground-metronome-field-label" }, "Expected JSON object"),
                React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                  React.createElement(MetronomeGeneratedCodeEditor, {
                    file: { path: "schema.json", language: "json" },
                    value: config.jsonOutputSchema || "{\n  \"status\": \"success\",\n  \"summary\": \"string\",\n  \"data\": {}\n}",
                    onChange: (value) => updateSelectedNodeConfig("jsonOutputSchema", value),
                  })
                ),
                React.createElement("div", { className: "playground-metronome-field-hint" },
                  "At run time this schema is appended to the initial thread prompt with an instruction to return only JSON in the run summary."
                )
              )
            );
            const renderThreadSettings = () => React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Prompt adaption",
                placeholder: "Add prompt adaption here",
                tooltip: "Append instructions or context to the triggering message before the agent continues. Use this to pass workflow output contracts, project context, or formatting requirements.",
              }),
              renderThreadAttachments(),
              React.createElement("div", { className: "playground-metronome-field" },
                React.createElement("label", { className: "playground-metronome-field-label" }, "Agent"),
                React.createElement("select", {
                  className: "playground-metronome-select",
                  value: config.agentId || defaultMetronomeAgentOption?.id || "",
                  onChange: (event) => {
                    const nextAgentId = event.target.value;
                    const nextAgent = metronomeAgentOptions.find((option) => option.id === nextAgentId) || null;
                    updateSelectedNodeConfigPatch({
                      agentId: nextAgentId,
                      agentName: nextAgent?.name || "",
                    });
                  },
                },
                  metronomeAgentOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                )
              ),
              React.createElement("div", { className: "playground-metronome-field" },
                React.createElement("label", { className: "playground-metronome-field-label" }, "Run target"),
                React.createElement("select", {
                  className: "playground-metronome-select",
                  value: threadContextType,
                  onChange: (event) => {
                    const nextContextType = event.target.value === "project" ? "project" : "computer";
                    updateSelectedNodeConfigPatch({
                      contextType: nextContextType,
                      resource: nextContextType,
                      projectId: nextContextType === "project" ? config.projectId || "" : "",
                      projectName: nextContextType === "project" ? config.projectName || "" : "",
                      environmentId: nextContextType === "computer" ? (config.environmentId || defaultMetronomeComputerOption?.id || "") : "",
                      environmentName: nextContextType === "computer" ? (config.environmentName || defaultMetronomeComputerOption?.name || "") : "",
                    });
                  },
                },
                  React.createElement("option", { value: "computer" }, "Computer"),
                  React.createElement("option", { value: "project" }, "Project")
                )
              ),
              threadContextType === "project"
                ? React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Project"),
                    React.createElement("select", {
                      className: "playground-metronome-select",
                      value: config.projectId || "",
                      onChange: (event) => {
                        const nextProjectId = event.target.value;
                        const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                        updateSelectedNodeConfigPatch({
                          contextType: "project",
                          resource: "project",
                          projectId: nextProjectId,
                          projectName: nextProject?.name || "",
                        });
                      },
                    },
                      React.createElement("option", { value: "" }, "Select project"),
                      metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                    )
                  )
                : React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Computer"),
                    React.createElement("select", {
                      className: "playground-metronome-select",
                      value: config.environmentId || defaultMetronomeComputerOption?.id || "",
                      onChange: (event) => {
                        const nextEnvironmentId = event.target.value;
                        const nextEnvironment = metronomeComputerOptions.find((option) => option.id === nextEnvironmentId) || null;
                        updateSelectedNodeConfigPatch({
                          contextType: "computer",
                          resource: "computer",
                          environmentId: nextEnvironmentId,
                          environmentName: nextEnvironment?.name || "",
                        });
                      },
                    },
                      metronomeComputerOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                    )
                  ),
              React.createElement("div", { className: "playground-metronome-field" },
                React.createElement("div", { className: "playground-metronome-switch-row" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-metronome-field-label" }, "Require JSON run summary"),
                    React.createElement("div", { className: "playground-metronome-field-hint" },
                      "Adds a prompt contract so downstream condition nodes can consume this thread output as structured data."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-switch" + (config.requireJsonOutput ? " is-on" : ""),
                    role: "switch",
                    "aria-checked": Boolean(config.requireJsonOutput),
                    onClick: () => updateSelectedNodeConfigPatch({
                      requireJsonOutput: !config.requireJsonOutput,
                      jsonOutputSchema: config.jsonOutputSchema || "{\n  \"status\": \"success\",\n  \"summary\": \"string\",\n  \"data\": {}\n}",
                    }),
                  }, React.createElement("span", null))
                ),
                config.requireJsonOutput ? renderJsonSchemaEditor() : null
              ),
              renderMetronomeAttachmentModalPortal()
            );
            const renderTicketSettings = () => {
              const ticketStatusOptions = [
                { id: "planned", label: "Planned" },
                { id: "in_review", label: "In Review" },
                { id: "blocked", label: "Blocked" },
                { id: "done", label: "Done" },
                { id: "canceled", label: "Canceled" },
              ];
              const isCreateOrUpdate = subtype === "create_or_update_ticket";
              const isStatusUpdate = subtype === "update_ticket_status";
              const isComment = subtype === "add_ticket_comment";
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Project"),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: config.projectId || "",
                    onChange: (event) => {
                      const nextProjectId = event.target.value;
                      const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                      updateSelectedNodeConfigPatch({
                        projectId: nextProjectId,
                        projectName: nextProject?.name || "",
                      });
                    },
                  },
                    React.createElement("option", { value: "" }, "Select project"),
                    metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Ticket ID"),
                  React.createElement("input", {
                    type: "text",
                    className: "playground-metronome-input",
                    value: config.ticketId || "",
                    placeholder: isCreateOrUpdate ? "Optional for new tickets" : "ticket_123 or {{ previous.ticket_id }}",
                    onKeyDown: stopMetronomeInputKeyPropagation,
                    onKeyUp: stopMetronomeInputKeyPropagation,
                    onChange: (event) => updateSelectedNodeConfig("ticketId", event.target.value),
                  })
                ),
                isCreateOrUpdate
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Title"),
                      React.createElement("input", {
                        type: "text",
                        className: "playground-metronome-input",
                        value: config.ticketTitle || "",
                        placeholder: "Draft follow-up ticket title",
                        onKeyDown: stopMetronomeInputKeyPropagation,
                        onKeyUp: stopMetronomeInputKeyPropagation,
                        onChange: (event) => updateSelectedNodeConfig("ticketTitle", event.target.value),
                      })
                    )
                  : null,
                isCreateOrUpdate || isStatusUpdate
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Status"),
                      React.createElement("select", {
                        className: "playground-metronome-select",
                        value: config.ticketStatus || "planned",
                        onChange: (event) => updateSelectedNodeConfig("ticketStatus", event.target.value),
                      },
                        ticketStatusOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                      )
                    )
                  : null,
                isComment
                  ? renderMetronomeRichTextField({
                      fieldKey: "comment",
                      title: "Comment",
                      placeholder: "Write a ticket comment",
                      description: "Write the comment that should be added to the selected project ticket.",
                    })
                  : null,
                isCreateOrUpdate
                  ? React.createElement("div", { className: "playground-metronome-field playground-metronome-code-section" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Additional fields"),
                      React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                        React.createElement(MetronomeGeneratedCodeEditor, {
                          file: { path: "ticket-fields.json", language: "json" },
                          value: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                          onChange: (value) => updateSelectedNodeConfig("fieldsJson", value),
                        })
                      )
                    )
                  : null
              );
            };
            const renderCodeSettings = () => {
              const language = config.language === "javascript" ? "javascript" : "python";
              const defaultSource = language === "javascript"
                ? "export function run(previous) {\n  // previous.output contains the result of the node before this one.\n  return {\n    ok: true,\n    input: previous.output,\n  };\n}\n"
                : "def run(previous):\n    # previous.output contains the result of the node before this one.\n    return {\n        \"ok\": True,\n        \"input\": previous.output,\n    }\n";
              return React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Language"),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: language,
                    onChange: (event) => updateSelectedNodeConfigPatch({
                      language: event.target.value,
                      source: event.target.value === "javascript"
                        ? "export function run(previous) {\n  return {\n    ok: true,\n    input: previous.output,\n  };\n}\n"
                        : "def run(previous):\n    return {\n        \"ok\": True,\n        \"input\": previous.output,\n    }\n",
                    }),
                  },
                    React.createElement("option", { value: "python" }, "Python"),
                    React.createElement("option", { value: "javascript" }, "JavaScript")
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field playground-metronome-code-section" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Code"),
                  React.createElement("div", { className: "playground-metronome-inline-code-editor" },
                    React.createElement(MetronomeGeneratedCodeEditor, {
                      file: { path: language === "javascript" ? "run.js" : "run.py", language },
                      value: config.source || defaultSource,
                      onChange: (value) => updateSelectedNodeConfig("source", value),
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-field-hint" },
                    "Read the previous node with previous.output and return a value that later nodes can consume."
                  )
                )
              );
            };
            const renderApprovalSettings = () => React.createElement(React.Fragment, null,
              renderMetronomeRichTextField({
                fieldKey: "message",
                title: "Approval instructions",
                placeholder: "Describe what needs approval",
              }),
              React.createElement("div", { className: "playground-metronome-field-hint" },
                "User Approval routes to True when approved and False when rejected."
              )
            );
            const showTypeSelector = !["action", "code", "approval", "end", "note"].includes(kind);
            return React.createElement("aside", { className: "playground-metronome-node-inspector" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-inspector-header" },
                React.createElement("div", { className: "playground-tasks-detail-navbar-title playground-metronome-inspector-navbar-title" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-meta" },
                    React.createElement("span", { className: "playground-metronome-inspector-node-kind" }, meta.label)
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                    React.createElement("input", {
                      type: "text",
                      className: "playground-content-title playground-tasks-detail-navbar-title-input playground-metronome-inspector-title-input",
                      value: selectedNode.data?.label || "",
                      placeholder: meta.label,
                      "aria-label": "Node label",
                      onChange: (event) => updateSelectedNodeData({ label: event.target.value }),
                      onKeyDown: (event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      },
                    })
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" }),
                React.createElement("button", { type: "button", className: "playground-files-header-icon-button is-plain playground-metronome-inspector-close", onClick: () => setSelectedNodeId("") },
                  React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 })
                )
              ),
              React.createElement("div", { className: "playground-metronome-inspector-body" },
                showTypeSelector ? React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Type"),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: kind === "trigger" && subtype === "thread" ? "thread_event" : subtype,
                    onChange: (event) => {
                      const rawSubtype = event.target.value;
                      const nextSubtype = kind === "trigger" && rawSubtype === "thread" ? "thread_event" : rawSubtype;
                      updateSelectedNodeData({
                        subtype: nextSubtype,
                        description: getMetronomeSubtypeLabel(kind, nextSubtype),
                      });
                      if (kind === "trigger") {
                        updateSelectedNodeConfigPatch({
                          triggerType: nextSubtype,
                          threadCommand: config.threadCommand || "@metronome",
                          promptExtension: config.promptExtension || "",
                        });
                      } else if (kind === "condition") {
                        const nextConditionType = normalizeMetronomeConditionType(nextSubtype);
                        updateSelectedNodeConfigPatch({
                          conditionType: nextConditionType,
                          databaseId: config.databaseId || "",
                          databaseName: config.databaseName || "",
                          databaseCollection: config.databaseCollection || config.collection || "",
                          databaseDocumentId: config.databaseDocumentId || "",
                          databaseFieldPath: config.databaseFieldPath || "",
                          databaseOperator: config.databaseOperator || "equals",
                          databaseCompareValue: config.databaseCompareValue || "",
                          ticketProjectId: config.ticketProjectId || "",
                          ticketProjectName: config.ticketProjectName || "",
                          ticketId: config.ticketId || "",
                          ticketStatusOperator: config.ticketStatusOperator || "equals",
                          ticketStatusValue: config.ticketStatusValue || "planned",
                          conditions: normalizeMetronomeConditionBranches(config.conditions, nextConditionType),
                        });
                      } else if (kind === "ticket") {
                        updateSelectedNodeConfigPatch({
                          operation: nextSubtype,
                          projectId: config.projectId || "",
                          projectName: config.projectName || "",
                          ticketId: config.ticketId || "",
                          ticketTitle: config.ticketTitle || "",
                          ticketStatus: config.ticketStatus || "planned",
                          comment: config.comment || "",
                          fieldsJson: config.fieldsJson || "{\n  \"status\": \"planned\"\n}",
                        });
                      }
                    },
                  },
                    meta.subtypes.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                  )
                ) : null,
                kind === "trigger"
                  ? renderTriggerSettings()
                  : kind === "condition"
                    ? renderConditionSettings()
                    : kind === "action"
                      ? renderThreadSettings()
                      : kind === "ticket"
                        ? renderTicketSettings()
                      : kind === "code"
                        ? renderCodeSettings()
                        : kind === "approval"
                          ? renderApprovalSettings()
                          : kind === "imagine"
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Template name"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: config.templateName || "",
                            placeholder: "Fashion campaigns",
                            onChange: (event) => updateSelectedNodeConfig("templateName", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Template ID"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: config.templateId || "",
                            placeholder: "Optional template id",
                            onChange: (event) => updateSelectedNodeConfig("templateId", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Prompt"),
                          React.createElement("textarea", {
                            className: "playground-metronome-textarea",
                            value: config.prompt || "Create an image from this workflow context.",
                            onChange: (event) => updateSelectedNodeConfig("prompt", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Project context"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.projectId || "",
                            onChange: (event) => {
                              const nextProjectId = event.target.value;
                              const nextProject = metronomeProjectOptions.find((option) => option.id === nextProjectId) || null;
                              updateSelectedNodeConfigPatch({
                                projectId: nextProjectId,
                                projectName: nextProject?.name || "",
                              });
                            },
                          },
                            React.createElement("option", { value: "" }, "No project"),
                            metronomeProjectOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                          )
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Aspect ratio"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.aspectRatio || "",
                            onChange: (event) => updateSelectedNodeConfig("aspectRatio", event.target.value),
                          },
                            React.createElement("option", { value: "" }, "No preference"),
                            React.createElement("option", { value: "1:1" }, "1:1"),
                            React.createElement("option", { value: "4:5" }, "4:5"),
                            React.createElement("option", { value: "16:9" }, "16:9"),
                            React.createElement("option", { value: "9:16" }, "9:16")
                          )
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Attachments JSON"),
                          React.createElement("textarea", {
                            className: "playground-metronome-textarea",
                            value: config.attachmentsJson || "[]",
                            spellCheck: false,
                            onChange: (event) => updateSelectedNodeConfig("attachmentsJson", event.target.value),
                          })
                        ),
	                      )
	                  : kind === "function"
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Function"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.functionId || "",
                            onChange: (event) => {
                              const nextFunctionId = event.target.value;
                              const nextFunction = metronomeFunctionOptions.find((option) => option.id === nextFunctionId) || null;
                              updateSelectedNodeConfigPatch({
                                functionId: nextFunctionId,
                                functionName: nextFunction?.name || "",
                              });
                            },
                          },
                            React.createElement("option", { value: "" }, "Select function"),
                            metronomeFunctionOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                          )
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Request payload JSON"),
                          React.createElement("textarea", {
                            className: "playground-metronome-textarea",
	                            value: config.payloadJson || "{\n  \"input\": \"{{ previous.output }}\"\n}",
	                            spellCheck: false,
	                            onChange: (event) => updateSelectedNodeConfig("payloadJson", event.target.value),
	                          })
	                        )
	                      )
                  : kind === "database"
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Database"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.databaseId || "",
                            onChange: (event) => {
                              const nextDatabaseId = event.target.value;
                              const nextDatabase = metronomeDatabaseOptions.find((option) => option.id === nextDatabaseId) || null;
                              updateSelectedNodeConfigPatch({
                                databaseId: nextDatabaseId,
                                databaseName: nextDatabase?.name || "",
                              });
                            },
                          },
                            React.createElement("option", { value: "" }, "Select database"),
                            metronomeDatabaseOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                          )
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Collection"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: config.collection || "",
                            placeholder: "customers",
                            onChange: (event) => updateSelectedNodeConfig("collection", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Document ID"),
                          React.createElement("input", {
                            type: "text",
                            className: "playground-metronome-input",
                            value: config.documentId || "",
                            placeholder: subtype === "insert_document" ? "Optional" : "Document id or expression",
                            onChange: (event) => updateSelectedNodeConfig("documentId", event.target.value),
                          })
                        ),
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, subtype === "delete_document" ? "Delete reason or metadata JSON" : "Document JSON"),
                          React.createElement("textarea", {
                            className: "playground-metronome-textarea",
	                            value: config.documentJson || "{\n  \"source\": \"metronome\",\n  \"payload\": \"{{ previous.output }}\"\n}",
	                            spellCheck: false,
	                            onChange: (event) => updateSelectedNodeConfig("documentJson", event.target.value),
	                          })
	                        )
	                      )
                  : kind === "metronome"
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "playground-metronome-field" },
                          React.createElement("label", { className: "playground-metronome-field-label" }, "Workflow"),
                          React.createElement("select", {
                            className: "playground-metronome-select",
                            value: config.workflowId || "",
                            onChange: (event) => {
                              const nextWorkflowId = event.target.value;
                              const nextWorkflow = metronomeWorkflowOptions.find((option) => option.id === nextWorkflowId) || null;
                              updateSelectedNodeConfigPatch({
                                workflowId: nextWorkflowId,
                                workflowName: nextWorkflow?.name || "",
                              });
                            },
                          },
                            React.createElement("option", { value: "" }, "Select Metronome"),
                            metronomeWorkflowOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                          )
                        ),
	                        React.createElement("div", { className: "playground-metronome-field-hint" },
	                          "This workflow receives previous.output as its input and returns its run result to the next node."
	                        )
	                      )
                  : null
              )
            );
          };

          const renderInspectorPortal = () => {
            const inspector = renderInspector();
            if (!inspector) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : inspector;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(inspector, portalTarget) : null;
          };

          const renderMetronomeCodeFileRow = (file) => {
            const normalizedPath = String(file?.path || "").trim();
            if (!normalizedPath) return null;
            const isActive = normalizedPath === String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "");
            const Icon = normalizedPath === "requirements.txt" ? Package : FileText;
            return React.createElement("button", {
              key: normalizedPath,
              type: "button",
              className: "playground-servers-code-file-row playground-metronome-code-file-row" + (isActive ? " is-active" : ""),
              onClick: () => handleMetronomeCodeFileSelect(normalizedPath),
            },
              React.createElement("span", { className: "playground-servers-code-file-chevron", "aria-hidden": "true" }),
              React.createElement("span", { className: "playground-servers-code-file-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 15, height: 15, strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "playground-servers-code-file-name" }, normalizedPath)
            );
          };

          const renderCodeMode = () => {
            const codeStatusMessage = metronomeCodeRunState.message
              || (isMetronomeCodeDirty ? "Unsaved changes" : (activeMetronomeCodeFile?.path || "Generated from visual workflow"));
            const codeStatusClassName = "playground-metronome-code-statusbar-message is-" + (metronomeCodeRunState.status || "idle");
            return React.createElement("div", { className: "playground-metronome-code-view playground-resources-page is-develop-server-kind-page" },
              React.createElement("div", { className: "playground-metronome-palette-header playground-metronome-code-header" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-palette-back-button",
                  onClick: returnToMetronomeOverview,
                  title: "Back to Metronomes",
                  "aria-label": "Back to Metronomes",
                }, React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.9 })),
                React.createElement("div", { className: "playground-metronome-palette-title" }, activeWorkflow?.name || "Metronome")
              ),
              React.createElement("div", { className: "playground-server-detail-content is-code-tab playground-metronome-code-content" },
                React.createElement("div", { className: "playground-servers-code-workspace playground-metronome-code-workspace" },
                  React.createElement("aside", { className: "playground-servers-code-sidebar" },
                    React.createElement("div", { className: "playground-servers-code-sidebar-header" },
                      React.createElement("div", { className: "playground-servers-code-sidebar-title" }, "Files")
                    ),
                    React.createElement("div", { className: "playground-servers-code-file-list" },
                      metronomeCodeFiles.length
                        ? metronomeCodeFiles.map((file) => renderMetronomeCodeFileRow(file))
                        : React.createElement("div", { className: "playground-servers-code-empty" }, "No code files.")
                    )
                  ),
                  React.createElement("section", { className: "playground-servers-code-editor-main" },
                    React.createElement("div", { className: "playground-servers-code-editor-body" },
                      activeMetronomeCodeFile
                        ? React.createElement(MetronomeGeneratedCodeEditor, {
                            file: activeMetronomeCodeFile,
                            value: activeMetronomeCodeFile.value,
                            onChange: handleMetronomeCodeFileChange,
                          })
                        : React.createElement("div", { className: "playground-servers-code-empty" }, "Select a file to edit.")
                    ),
                    React.createElement("div", { className: "playground-servers-code-editor-statusbar" },
                      React.createElement("div", { className: codeStatusClassName }, codeStatusMessage),
                      React.createElement("div", { className: "playground-servers-code-editor-status-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: handleRevertMetronomeCodeDraft,
                          disabled: !isMetronomeCodeDirty,
                        }, React.createElement("span", null, "Revert")),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button is-primary",
                          onClick: handleApplyMetronomeCodeDraft,
                          disabled: !isMetronomeCodeDirty,
                        },
                          React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Save")
                        )
                      )
                    )
                  )
                )
              )
            );
          };

          const renderMetronomeRunStatusLabel = (run) => {
            const status = String(run?.status || "completed").toLowerCase();
            return React.createElement("span", {
              className: "playground-metronome-run-status" + (status === "completed" ? " is-completed" : ""),
            }, status || "completed");
          };

          const formatMetronomeRunTimestamp = (value) => {
            if (!value) return "Just now";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "Just now";
            return date.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          };

          const getMetronomeRunPrompt = (run) => {
            const directPrompt = String(run?.prompt || "").trim();
            if (directPrompt) return directPrompt;
            const inputPrompt = String(run?.input?.prompt || run?.inputs?.prompt || "").trim();
            if (inputPrompt) return inputPrompt;
            return "Manual workflow run";
          };

          const getMetronomeRunStepIcon = (step) => {
            const kind = String(step?.kind || "").toLowerCase();
            if (kind === "trigger") return Play;
            if (kind === "action") return Bot;
            if (kind === "condition") return Split;
            if (kind === "end") return CircleCheckBig;
            if (kind === "code") return Code2;
            if (kind === "imagine") return Clapperboard;
            if (kind === "function") return FunctionSquare;
            if (kind === "database") return Database;
            if (kind === "ticket") return ListTodo;
            if (kind === "metronome") return Metronome;
            if (kind === "loop") return RefreshCw;
            if (kind === "approval") return Shield;
            if (kind === "note") return MessageSquare;
            return Circle;
          };

          const formatMetronomeRunValue = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return JSON.stringify(JSON.parse(trimmed), null, 2);
              } catch (_error) {
                return trimmed;
              }
            }
            try {
              return JSON.stringify(value, null, 2);
            } catch (_error) {
              return String(value || "");
            }
          };

          const extractMetronomeReadableOutputText = (value) => {
            if (value === null || typeof value === "undefined") return "";
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return "";
              try {
                return extractMetronomeReadableOutputText(JSON.parse(trimmed));
              } catch (_error) {
                return trimmed;
              }
            }
            if (typeof value !== "object") {
              return String(value || "").trim();
            }
            if (Array.isArray(value)) {
              return value
                .map((item) => extractMetronomeReadableOutputText(item))
                .filter(Boolean)
                .join("\n\n");
            }
            const preferredKeys = [
              "output_text",
              "outputText",
              "markdown",
              "text",
              "message",
              "summary",
              "content",
              "response",
            ];
            for (const key of preferredKeys) {
              const extracted = extractMetronomeReadableOutputText(value[key]);
              if (extracted) return extracted;
            }
            for (const key of ["result", "output", "data"]) {
              const nested = value[key];
              if (nested && typeof nested === "object" && !Array.isArray(nested)) {
                const extracted = extractMetronomeReadableOutputText(nested);
                if (extracted) return extracted;
              }
            }
            return "";
          };

          const hasMetronomeRunOutput = (value) => {
            if (!value || typeof value !== "object") return Boolean(formatMetronomeRunValue(value));
            return Object.keys(value).some((key) => {
              if (["selectedEdgeId", "branchId", "branchLabel", "branchRule", "branchMatched", "branchReason"].includes(key)) {
                return false;
              }
              const item = value[key];
              if (item === null || typeof item === "undefined") return false;
              if (typeof item === "string") return item.trim().length > 0;
              if (Array.isArray(item)) return item.length > 0;
              if (typeof item === "object") return Object.keys(item).length > 0;
              return true;
            });
          };

          const findMetronomeRunThreadForStep = (step, threads) => {
            const nodeId = String(step?.nodeId || "").trim();
            if (!nodeId || !Array.isArray(threads)) return null;
            return threads.find((thread) => String(thread?.nodeId || "").trim() === nodeId) || null;
          };

          const renderMetronomeRunOutputMarkdown = (value, fallback = "") => {
            const text = extractMetronomeReadableOutputText(value) || String(fallback || "").trim();
            if (!text) return null;
            return React.createElement("div", { className: "playground-metronome-run-output-markdown-scope tb-runner-chat" },
              React.createElement(PlaygroundTaskDescriptionMarkdown, {
                content: text,
                className: "playground-metronome-run-output-markdown tb-message-markdown",
              })
            );
          };

          const renderMetronomeRunTrace = (run, { includeComposerPrompt = false } = {}) => {
            const output = run?.output && typeof run.output === "object" ? run.output : {};
            const steps = Array.isArray(output.steps) ? output.steps : [];
            const threads = Array.isArray(output.threads) ? output.threads : [];
            const logs = Array.isArray(output.logs) ? output.logs : [];
            const prompt = getMetronomeRunPrompt(run);
            const traceItems = [];
            if (includeComposerPrompt && prompt && prompt !== "Manual workflow run") {
              traceItems.push(React.createElement("div", { key: "prompt", className: "playground-metronome-run-user-row" },
                React.createElement("div", { className: "playground-metronome-run-user-bubble" }, prompt)
              ));
            }
            if (steps.length) {
              steps.forEach((step, index) => {
                const StepIcon = getMetronomeRunStepIcon(step);
                const thread = findMetronomeRunThreadForStep(step, threads);
                const stepKind = String(step.kind || "").toLowerCase();
                const isThreadStep = stepKind === "thread";
                const stepTitle = String(step.label || getMetronomeSubtypeLabel(step.kind, step.subtype) || step.kind || "Workflow step").trim();
                const readableOutputText = stepKind === "trigger" || stepKind === "condition"
                  ? ""
                  : extractMetronomeReadableOutputText(step.output);
                const summary = String(
                  isThreadStep
                    ? (readableOutputText ? "" : step.summary || thread?.prompt || step.status || "Completed")
                    : step.summary || step.status || "Completed"
                ).trim();
                const shouldRenderOutputText = Boolean(readableOutputText && (isThreadStep || readableOutputText !== summary));
                traceItems.push(React.createElement("div", { key: step.id || step.nodeId || index, className: "playground-metronome-run-trace-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(StepIcon, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title-group" },
                      React.createElement("div", { className: "playground-metronome-run-trace-title" }, stepTitle),
                      thread?.id
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-metronome-run-thread-link",
                            onClick: () => {
                              if (typeof onThreadOpen === "function") {
                                onThreadOpen(thread.id, { contentMode: "chat" });
                              }
                            },
                          }, thread.id)
                        : null
                    )
                  ),
                  summary
                    ? React.createElement("div", { className: "playground-metronome-run-trace-summary" }, summary)
                    : null,
                  shouldRenderOutputText
                    ? renderMetronomeRunOutputMarkdown(readableOutputText)
                    : null
                ));
              });
            } else if (logs.length) {
              logs.forEach((log, index) => {
                traceItems.push(React.createElement("div", { key: log.id || index, className: "playground-metronome-run-trace-step" },
                  React.createElement("div", { className: "playground-metronome-run-trace-heading" },
                    React.createElement("span", { className: "playground-metronome-run-trace-icon" },
                      React.createElement(MessageSquare, { width: 13, height: 13, strokeWidth: 1.9 })
                    ),
                    React.createElement("div", { className: "playground-metronome-run-trace-title" }, String(log.message || "Workflow event"))
                  )
                ));
              });
            }
            if (!traceItems.length) {
              traceItems.push(React.createElement("div", { key: "empty", className: "playground-metronome-run-sidebar-copy" },
                metronomeRunState.status === "loading"
                  ? "Waiting for the first workflow event..."
                  : "No run trace has been recorded yet."
              ));
            }
            return React.createElement("div", { className: "playground-metronome-run-trace" }, traceItems);
          };

          const renderRunsMode = () => {
            const selectedRunForDisplay = selectedMetronomeRun || metronomeRuns[0] || null;
            return React.createElement("div", { className: "playground-metronome-runs-view" },
              React.createElement("div", { className: "playground-metronome-runs-header" },
                React.createElement("div", null,
                  React.createElement("h2", { className: "playground-metronome-runs-title" }, activeWorkflow?.name || "Metronome runs"),
                  React.createElement("div", { className: "playground-metronome-runs-copy" },
                    "Inspect workflow runs, node steps, generated threads, and intermediary results."
                  )
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-metronome-primary-button",
                  onClick: openMetronomeRunSidebar,
                },
                  React.createElement(Play, { width: 14, height: 14, strokeWidth: 1.9 }),
                  React.createElement("span", null, "Run")
                )
              ),
              React.createElement("div", { className: "playground-metronome-runs-layout" },
                React.createElement("div", { className: "playground-metronome-runs-list" },
                  isLoadingMetronomeRuns
                    ? React.createElement("div", { className: "playground-metronome-runs-empty" }, "Loading runs...")
                    : metronomeRuns.length
                      ? metronomeRuns.map((run) => {
                          const isSelected = (selectedRunForDisplay?.id || "") === run.id;
                          return React.createElement("button", {
                            key: run.id,
                            type: "button",
                            className: "playground-metronome-run-row" + (isSelected ? " is-active" : ""),
                            onClick: () => openMetronomeRunSidebar(run.id),
                          },
                            React.createElement("div", { className: "playground-metronome-run-row-main" },
                              React.createElement("div", { className: "playground-metronome-run-row-title" }, getMetronomeRunPrompt(run)),
                              React.createElement("div", { className: "playground-metronome-run-row-meta" },
                                [
                                  formatMetronomeRunTimestamp(run.createdAt),
                                  ((run.output?.steps || []).length || 0) + " steps",
                                  ((run.output?.threads || []).length || 0) + " threads",
                                ].join(" · ")
                              )
                            ),
                            renderMetronomeRunStatusLabel(run)
                          );
                        })
                      : React.createElement("div", { className: "playground-metronome-runs-empty" },
                          "No runs yet. Start this workflow from the Run button."
                        )
                )
              )
            );
          };

          const renderMetronomeRunSidebar = () => {
            if (!isMetronomeRunSidebarOpen) return null;
            const isRunning = metronomeRunState.status === "loading";
            const selectedAgentId = metronomeRunAgentId || defaultMetronomeAgentOption?.id || "";
            const selectedEnvironmentId = metronomeRunEnvironmentId || defaultMetronomeComputerOption?.id || "";
            return React.createElement("aside", { className: "playground-metronome-node-inspector playground-metronome-run-sidebar" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-metronome-run-sidebar-header" },
                React.createElement("div", { className: "playground-metronome-run-sidebar-title" }, selectedMetronomeRun ? "Run trace" : "New chat"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-header-icon-button is-plain playground-metronome-inspector-close",
                  onClick: closeMetronomeRunSidebar,
                  "aria-label": "Close run panel",
                }, React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-metronome-run-sidebar-body" },
                selectedMetronomeRun
                  ? renderMetronomeRunTrace(selectedMetronomeRun, { includeComposerPrompt: true })
                  : React.createElement("div", { className: "playground-metronome-run-empty-state" },
                      React.createElement("div", { className: "playground-metronome-run-sidebar-copy" },
                        "Send a prompt to trigger this Metronome manually. Started threads, node outputs, and branch decisions will appear here."
                      )
                    ),
                isRunning
                  ? React.createElement("div", { className: "playground-metronome-run-running-row" },
                      React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Running workflow...")
                    )
                  : null,
                metronomeRunState.message && metronomeRunState.status === "error"
                  ? React.createElement("div", { className: "playground-metronome-run-sidebar-log is-error" }, metronomeRunState.message)
                  : null
              ),
              React.createElement("div", { className: "playground-metronome-run-sidebar-composer" },
                React.createElement(RunnerChat, {
                  key: "metronome-run-composer:" + (activeWorkflow?.id || "new") + ":" + (selectedMetronomeRun?.id || "draft"),
                  className: "playground-metronome-run-sidebar-runner-chat",
                  backendUrl,
                  apiKey,
                  requestHeaders,
                  appId: "runner-web-sdk-demo",
                  environmentId: selectedEnvironmentId,
                  agentId: selectedAgentId,
                  agents: metronomeAgentOptions,
                  environments: metronomeComputerOptions,
                  inputMode: "computer-agents",
                  placeholder: "Message this workflow...",
                  autoCreateThread: true,
                  autoFocusComposer: !selectedMetronomeRun,
                  keepFocusOnSubmit: true,
                  showUsageInStatus: false,
                  maxAttachments: 10,
                  disabled: isRunning,
                  onAgentChange: (nextAgentId) => {
                    const normalizedNextAgentId = String(nextAgentId || "").trim();
                    if (normalizedNextAgentId) {
                      setMetronomeRunAgentId(normalizedNextAgentId);
                    }
                  },
                  onEnvironmentChange: (nextEnvironmentId) => {
                    const normalizedNextEnvironmentId = String(nextEnvironmentId || "").trim();
                    if (normalizedNextEnvironmentId) {
                      setMetronomeRunEnvironmentId(normalizedNextEnvironmentId);
                    }
                  },
                  onExternalRunRequestCreate: (request) => {
                    const prompt = String(request?.displayPrompt || request?.prompt || "").trim();
                    setMetronomeRunPrompt(prompt);
                    if (request?.agentId) {
                      setMetronomeRunAgentId(String(request.agentId || "").trim());
                    }
                    if (request?.environmentId) {
                      setMetronomeRunEnvironmentId(String(request.environmentId || "").trim());
                    }
                    void startMetronomeRun(prompt, {
                      agentId: request?.agentId || selectedAgentId,
                      environmentId: request?.environmentId || selectedEnvironmentId,
                      sourceThreadId: request?.threadId || null,
                      attachments: Array.isArray(request?.attachments) ? request.attachments : [],
                      enabledSkills: request?.enabledSkills || null,
                    });
                    return true;
                  },
                  onRunError: (error) => {
                    setMetronomeRunState({
                      status: "error",
                      message: error instanceof Error ? error.message : "Failed to start workflow run.",
                    });
                  },
                  onOpenPlansBudget: () => {},
                  onDocumentPreviewOpenChange: () => {},
                  onDeepResearchDetailOpenChange: () => {},
                })
              )
            );
          };

          const renderMetronomeRunSidebarPortal = () => {
            const sidebar = renderMetronomeRunSidebar();
            if (!sidebar) return null;
            if (!inspectorPortalId || typeof document === "undefined" || typeof createPortal !== "function") {
              return inspectorPortalId ? null : sidebar;
            }
            const portalTarget = document.getElementById(inspectorPortalId);
            return portalTarget ? createPortal(sidebar, portalTarget) : null;
          };

          const renderEditor = () => metronomeEditorMode === "code"
            ? React.createElement(React.Fragment, null,
                renderCodeMode(),
                renderMetronomeRunSidebarPortal()
              )
            : metronomeEditorMode === "runs"
              ? React.createElement(React.Fragment, null,
                  renderRunsMode(),
                  renderMetronomeRunSidebarPortal()
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-metronome-editor" },
                    React.createElement("main", { className: "playground-metronome-editor-main" },
                      React.createElement(ReactFlowProvider, null,
                        React.createElement(MetronomeFlowCanvas, {
                          nodes: renderedMetronomeNodes,
                          edges: renderedMetronomeEdges,
                          nodeTypes,
                          onNodesChange: handleNodesChangeWithHistory,
                          onEdgesChange: handleEdgesChangeWithHistory,
                          onConnect: handleConnect,
                          onCreateNode: handleCreateNode,
                          onSelectNode: (nodeId) => {
                            setIsMetronomeRunSidebarOpen(false);
                            setSelectedNodeId(nodeId);
                          },
                          onPaneClick: () => setSelectedNodeId(""),
                          onUndo: undoGraphChange,
                          onRedo: redoGraphChange,
                          canUndo: graphUndoStack.length > 0,
                          canRedo: graphRedoStack.length > 0,
                        })
                      ),
                      renderPalette()
                    )
                  ),
                  renderInspectorPortal(),
                  renderMetronomeRunSidebarPortal()
                );

          const renderWorkflowNameModal = () => {
            if (!workflowNameModal) return null;
            const isCreate = workflowNameModal.mode === "create";
            return React.createElement("div", {
              className: "playground-metronome-name-modal-backdrop",
              role: "dialog",
              "aria-modal": "true",
            },
              React.createElement("div", { className: "playground-metronome-name-modal" },
                React.createElement("div", { className: "playground-metronome-name-modal-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-metronome-name-modal-title" }, isCreate ? "New Metronome" : "Edit Metronome"),
                    React.createElement("div", { className: "playground-metronome-name-modal-copy" },
                      isCreate
                        ? "Name this workflow before opening the builder."
                        : "Rename this workflow."
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-metronome-icon-button",
                    onClick: closeWorkflowNameModal,
                    "aria-label": "Close",
                  },
                    React.createElement(X, { width: 15, height: 15, strokeWidth: 1.9 })
                  )
                ),
                React.createElement("div", { className: "playground-metronome-name-modal-body" },
                  React.createElement("div", { className: "playground-metronome-field" },
                    React.createElement("label", { className: "playground-metronome-field-label" }, "Name"),
                    React.createElement("input", {
                      className: "playground-metronome-input",
                      value: workflowNameDraft,
                      autoFocus: true,
                      onChange: (event) => setWorkflowNameDraft(event.target.value),
                      onKeyDown: (event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void commitWorkflowNameModal();
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          closeWorkflowNameModal();
                        }
                      },
                    })
                  ),
                  React.createElement("div", { className: "playground-metronome-name-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-secondary-button",
                      onClick: closeWorkflowNameModal,
                    }, "Cancel"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-metronome-primary-button",
                      onClick: () => void commitWorkflowNameModal(),
                    }, isCreate ? "Create" : "Save")
                  )
                )
              )
            );
          };

          return React.createElement(React.Fragment, null,
            React.createElement("div", {
              className: "playground-metronome-page"
                + (isEditor ? " is-editor" : " is-overview")
                + (isEditor && metronomeEditorMode === "code" ? " is-code" : ""),
            }, isEditor ? renderEditor() : renderOverview()),
            renderWorkflowNameModal()
          );
        }
`;
