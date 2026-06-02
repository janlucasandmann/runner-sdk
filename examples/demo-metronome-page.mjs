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
      .playground-metronome-empty::before {
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
              { id: "periodic", label: "Periodic schedule" },
              { id: "email", label: "Email received" },
              { id: "telegram", label: "Telegram message" },
              { id: "github", label: "GitHub event" },
              { id: "thread", label: "Thread event" },
              { id: "project_ticket", label: "Project ticket event" },
              { id: "resource", label: "Resource event" },
              { id: "database_entry", label: "Database entry added" },
            ],
          },
          condition: {
            label: "Condition",
            copy: "Branch workflow runs by thread, project, resource, or payload state.",
            color: "#fbbf24",
            Icon: GitFork,
            subtypes: [
              { id: "thread_project", label: "Thread started in project" },
              { id: "message_contains", label: "First message contains" },
              { id: "thread_agent", label: "Thread used agent" },
              { id: "thread_computer", label: "Thread used computer" },
              { id: "ticket_status", label: "Ticket status matches" },
              { id: "resource_kind", label: "Resource kind matches" },
              { id: "database_field", label: "Database field matches" },
            ],
          },
          action: {
            label: "Thread",
            copy: "Run agent work, update projects, deploy resources, and write data.",
            color: "#66a6ff",
            Icon: Play,
            subtypes: [
              { id: "start_thread", label: "Start a thread" },
              { id: "upsert_ticket", label: "Add or edit ticket" },
              { id: "ticket_comment", label: "Comment on ticket" },
              { id: "mission_control", label: "Run Mission Control" },
              { id: "deploy_resource", label: "Deploy resource" },
              { id: "invoke_function", label: "Invoke function/API" },
              { id: "insert_database_entry", label: "Add database entry" },
              { id: "generate_imagine", label: "Generate Imagine asset" },
              { id: "send_message", label: "Send external message" },
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

        function normalizeMetronomeConditionBranches(value) {
          const sourceBranches = Array.isArray(value) ? value : [];
          const usedIds = new Set();
          const normalized = sourceBranches
            .map((branch, index) => {
              const source = branch && typeof branch === "object"
                ? branch
                : { label: String(branch || "").trim() };
              const rawLabel = String(source.label || source.name || "").trim();
              const isElse = String(source.id || "").trim() === "else" || rawLabel.toLowerCase() === "else";
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
                label: isElse ? "Else" : rawLabel,
                rule: String(source.rule || source.expression || source.value || "").trim(),
              };
            })
            .filter(Boolean);
          const conditionBranches = normalized.filter((branch) => branch.id !== "else");
          if (conditionBranches.length === 0) {
            conditionBranches.push({ id: "condition-1", label: "", rule: "" });
          }
          const elseBranch = normalized.find((branch) => branch.id === "else") || { id: "else", label: "Else", rule: "" };
          return [
            ...conditionBranches,
            { ...elseBranch, id: "else", label: elseBranch.label || "Else" },
          ];
        }

        function createMetronomeConditionBranchId() {
          return "condition-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
        }

        const METRONOME_FALLBACK_AGENTS = [
          { id: "default-agent", name: "Computer Agent" },
        ];

        const METRONOME_FALLBACK_COMPUTERS = [
          { id: "default-computer", name: "Default" },
        ];

        const METRONOME_FALLBACK_PROJECTS = [
          { id: "project-context", name: "Project context" },
        ];

        function getMetronomeSubtypeLabel(kind, subtype) {
          const options = METRONOME_NODE_KIND_META[kind]?.subtypes || [];
          return options.find((item) => item.id === subtype)?.label || options[0]?.label || "";
        }

        function createMetronomeNode(kind, position, overrides = {}) {
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const subtype = overrides.subtype || meta.subtypes[0]?.id || kind;
          const nodeId = overrides.id || "node_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
          return {
            id: nodeId,
            type: "metronome",
            position: position || { x: 120, y: 140 },
            data: {
              kind,
              label: overrides.label || meta.label,
              subtype,
              description: overrides.description || getMetronomeSubtypeLabel(kind, subtype),
              config: kind === "condition"
                ? {
                    ...(overrides.config || {}),
                    conditions: normalizeMetronomeConditionBranches((overrides.config || {}).conditions),
                  }
                : overrides.config || {},
            },
          };
        }

        function createDefaultMetronomeGraph() {
          const trigger = createMetronomeNode("trigger", { x: 120, y: 190 }, {
            id: "trigger_start",
            subtype: "periodic",
            label: "Every weekday",
            description: "Run at 09:00 and inspect project state.",
            config: { schedule: "Every weekday at 09:00" },
          });
          const condition = createMetronomeNode("condition", { x: 430, y: 190 }, {
            id: "condition_needs_work",
            subtype: "ticket_status",
            label: "Open work exists",
            description: "Continue when planned or blocked tickets exist.",
            config: {
              rule: "ticket.status in planned, blocked",
              conditions: [
                { id: "condition-1", label: "Needs work", rule: "ticket.status in planned, blocked" },
                { id: "else", label: "Else", rule: "" },
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

        function normalizeMetronomeWorkflow(rawWorkflow) {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" ? workflow.definition : {};
          const nodes = Array.isArray(workflow.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : [];
          const edges = Array.isArray(workflow.edges)
            ? workflow.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : [];
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
            edges: normalizeMetronomeEdges(edges),
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
            ? nodes.find((node) => node?.data?.kind === "trigger")
            : null;
          if (!triggerNode) return "Manual";
          return triggerNode.data?.label || getMetronomeSubtypeLabel("trigger", triggerNode.data?.subtype) || "Trigger";
        }

        function createMetronomeApiPayload(workflow) {
          return {
            name: workflow?.name || "Untitled Metronome",
            description: workflow?.description || "",
            status: workflow?.status || "draft",
            triggerSummary: workflow?.triggerSummary || deriveMetronomeTriggerSummary(workflow?.nodes || []),
            definition: {
              nodes: Array.isArray(workflow?.nodes) ? workflow.nodes : [],
              edges: normalizeMetronomeEdges(workflow?.edges),
            },
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

        async function createMetronomeWorkflowApi(workflow) {
          const response = await fetch("/api/real/metronomes", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createMetronomeApiPayload(workflow)),
          });
          if (!response.ok) {
            throw new Error("Failed to create Metronome");
          }
          const data = await response.json();
          return normalizeMetronomeWorkflow(data?.data || data);
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
          if (!response.ok) {
            throw new Error("Failed to save Metronome");
          }
          const data = await response.json();
          return normalizeMetronomeWorkflow(data?.data || data);
        }

        async function publishMetronomeWorkflowApi(workflowId, active) {
          const response = await fetch("/api/real/metronomes/" + encodeURIComponent(workflowId) + "/publish", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: Boolean(active) }),
          });
          if (!response.ok) {
            throw new Error("Failed to update Metronome status");
          }
          const data = await response.json();
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
          const shouldHideBody = kind === "action" || kind === "trigger" || kind === "approval" || isEndNode || isConditionNode;
          const config = data?.config || {};
          const title = kind === "trigger"
            ? "Trigger"
            : kind === "action"
            ? "Thread"
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
              : isEndNode || isConditionNode
                ? ""
                : meta.label + " · " + getMetronomeSubtypeLabel(kind, data?.subtype);
          const conditionBranches = isConditionNode ? normalizeMetronomeConditionBranches(config.conditions) : [];
          const conditionHandleBaseTop = 75;
          const conditionHandleStep = 47;
          return React.createElement("div", { className: "playground-metronome-node" + (selected ? " is-selected" : "") + (isConditionNode ? " is-condition" : "") + (isEndNode ? " is-end" : "") },
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
            isConditionNode
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
            isConditionNode
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

        function PlaygroundMetronomePage({
          onTopNavStateChange,
          topNavActionsRef,
          onNodeDetailOpenChange,
          inspectorPortalId,
          agents = [],
          environments = [],
          projects = [],
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
          const [workflowNameModal, setWorkflowNameModal] = useState(null);
          const [workflowNameDraft, setWorkflowNameDraft] = useState("");
          const [metronomeEditorMode, setMetronomeEditorMode] = useState("edit");
          const [graphUndoStack, setGraphUndoStack] = useState([]);
          const [graphRedoStack, setGraphRedoStack] = useState([]);
          const metronomeAgentOptions = useMemo(() => normalizeMetronomeOptionList(agents, METRONOME_FALLBACK_AGENTS), [agents]);
          const metronomeComputerOptions = useMemo(() => normalizeMetronomeOptionList(environments, METRONOME_FALLBACK_COMPUTERS), [environments]);
          const metronomeProjectOptions = useMemo(() => normalizeMetronomeOptionList(projects, METRONOME_FALLBACK_PROJECTS), [projects]);

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
            setNodes(activeWorkflow?.nodes || []);
            setEdges(normalizeMetronomeEdges(activeWorkflow?.edges || []));
            setSelectedNodeId("");
            setMetronomeEditorMode("edit");
            setGraphUndoStack([]);
            setGraphRedoStack([]);
          }, [activeWorkflowId]);

          useEffect(() => {
            if (!activeWorkflowId) return;
            setWorkflows((current) => current.map((workflow) => workflow.id === activeWorkflowId
              ? { ...workflow, nodes, edges, updatedAt: new Date().toISOString() }
              : workflow
            ));
          }, [nodes, edges, activeWorkflowId]);

          const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) || null, [nodes, selectedNodeId]);
          const nodeTypes = useMemo(() => ({ metronome: MetronomeWorkflowNode }), []);
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
              void updateMetronomeWorkflowApi(nextWorkflow)
                .then((savedWorkflow) => setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow)))
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
                const savedWorkflow = await updateMetronomeWorkflowApi(nextWorkflow);
                setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
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
              void updateMetronomeWorkflowApi(nextWorkflow)
                .then(() => publishMetronomeWorkflowApi(activeWorkflowId, nextActive))
                .then((savedWorkflow) => setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow)))
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

          const returnToMetronomeOverview = useCallback(() => {
            setActiveWorkflowId("");
            setSelectedNodeId("");
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
                  goOverview: returnToMetronomeOverview,
                  setMode: setMetronomeEditorMode,
                }
              : {
                  edit: null,
                  rename: null,
                  duplicate: null,
                  delete: null,
                  publish: null,
                  goOverview: returnToMetronomeOverview,
                  setMode: null,
                };
          }, [topNavActionsRef, activeWorkflow, openEditWorkflowModal, duplicateActiveWorkflow, deleteActiveWorkflow, toggleWorkflowPublished, returnToMetronomeOverview]);

          useEffect(() => {
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(Boolean(selectedNodeId));
            }
          }, [onNodeDetailOpenChange, selectedNodeId]);

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
              editorMode: metronomeEditorMode === "run" ? "run" : "edit",
            });
          }, [onTopNavStateChange, activeWorkflow?.id, activeWorkflow?.name, activeWorkflow?.status, metronomeEditorMode]);

          useEffect(() => () => {
            if (topNavActionsRef) {
              topNavActionsRef.current = { edit: null, rename: null, duplicate: null, delete: null, publish: null, goOverview: null, setMode: null };
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
            const promptLabel = kind === "trigger"
              ? "Event filter"
              : kind === "condition"
                ? "Condition expression"
                : kind === "loop"
                  ? "Break condition"
                  : kind === "approval"
                    ? "Approval instructions"
                    : kind === "end"
                      ? "Completion note"
                      : "Message or payload";
            const conditionBranches = kind === "condition" ? normalizeMetronomeConditionBranches(config.conditions) : [];
            const editableConditionBranchCount = conditionBranches.filter((branch) => branch.id !== "else").length;
            const updateConditionBranch = (branchId, patch) => {
              const nextBranches = normalizeMetronomeConditionBranches(conditionBranches.map((branch) => branch.id === branchId
                ? { ...branch, ...(patch || {}) }
                : branch
              ));
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const addConditionBranch = () => {
              const elseBranch = conditionBranches.find((branch) => branch.id === "else") || { id: "else", label: "Else", rule: "" };
              const branchesBeforeElse = conditionBranches.filter((branch) => branch.id !== "else");
              const nextBranches = normalizeMetronomeConditionBranches([
                ...branchesBeforeElse,
                { id: createMetronomeConditionBranchId(), label: "", rule: "" },
                elseBranch,
              ]);
              updateSelectedNodeConfigPatch({ conditions: nextBranches });
            };
            const removeConditionBranch = (branchId) => {
              if (branchId === "else" || editableConditionBranchCount <= 1) return;
              updateSelectedNodeConfigPatch({
                conditions: normalizeMetronomeConditionBranches(conditionBranches.filter((branch) => branch.id !== branchId)),
              });
            };
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
                React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Type"),
                  React.createElement("select", {
                    className: "playground-metronome-select",
                    value: subtype,
                    onChange: (event) => {
                      const nextSubtype = event.target.value;
                      updateSelectedNodeData({
                        subtype: nextSubtype,
                        description: getMetronomeSubtypeLabel(kind, nextSubtype),
                      });
                    },
                  },
                    meta.subtypes.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.label))
                  )
                ),
                React.createElement("div", { className: "playground-metronome-field" },
                  React.createElement("label", { className: "playground-metronome-field-label" }, "Description"),
                  React.createElement("textarea", {
                    className: "playground-metronome-textarea",
                    value: selectedNode.data?.description || "",
                    onChange: (event) => updateSelectedNodeData({ description: event.target.value }),
                  })
                ),
                kind === "condition"
                  ? React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Branches"),
                      React.createElement("div", { className: "playground-metronome-condition-editor" },
                        conditionBranches.map((branch, index) => {
                          const isElseBranch = branch.id === "else";
                          return React.createElement("div", {
                            key: branch.id,
                            className: "playground-metronome-condition-editor-row",
                          },
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.label || "",
                              placeholder: isElseBranch ? "Else" : "Condition label",
                              disabled: isElseBranch,
                              onChange: (event) => updateConditionBranch(branch.id, { label: event.target.value }),
                            }),
                            React.createElement("input", {
                              type: "text",
                              className: "playground-metronome-input",
                              value: branch.rule || "",
                              placeholder: isElseBranch ? "Fallback branch" : "Rule or expression",
                              disabled: isElseBranch,
                              onChange: (event) => updateConditionBranch(branch.id, { rule: event.target.value }),
                            }),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-metronome-condition-editor-remove",
                              disabled: isElseBranch || editableConditionBranchCount <= 1,
                              "aria-label": "Remove condition branch",
                              onClick: () => removeConditionBranch(branch.id),
                            }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.9 }))
                          );
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-metronome-condition-editor-add",
                          onClick: addConditionBranch,
                        },
                          React.createElement(Plus, { width: 13, height: 13, strokeWidth: 2 }),
                          React.createElement("span", null, "Add condition")
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, promptLabel),
                      React.createElement("textarea", {
                        className: "playground-metronome-textarea",
                        value: config.prompt || config.rule || config.schedule || config.message || "",
                        placeholder: kind === "trigger" ? "Every weekday at 09:00" : "Describe what this node should evaluate or execute",
                        onChange: (event) => {
                          const key = kind === "trigger" ? "schedule" : kind === "loop" ? "rule" : "message";
                          updateSelectedNodeConfig(key, event.target.value);
                        },
                      })
                    ),
                kind === "action"
                  ? React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "playground-metronome-field" },
                        React.createElement("label", { className: "playground-metronome-field-label" }, "Agent"),
                        React.createElement("select", {
                          className: "playground-metronome-select",
                          value: config.agentId || "",
                          onChange: (event) => {
                            const nextAgentId = event.target.value;
                            const nextAgent = metronomeAgentOptions.find((option) => option.id === nextAgentId) || null;
                            updateSelectedNodeConfigPatch({
                              agentId: nextAgentId,
                              agentName: nextAgent?.name || "",
                            });
                          },
                        },
                          React.createElement("option", { value: "" }, "Select agent"),
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
                              environmentId: nextContextType === "computer" ? config.environmentId || "" : "",
                              environmentName: nextContextType === "computer" ? config.environmentName || "" : "",
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
                              value: config.environmentId || "",
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
                              React.createElement("option", { value: "" }, "Select computer"),
                              metronomeComputerOptions.map((option) => React.createElement("option", { key: option.id, value: option.id }, option.name))
                            )
                          )
                    )
                  : kind === "condition"
                    ? null
                    : React.createElement("div", { className: "playground-metronome-field" },
                      React.createElement("label", { className: "playground-metronome-field-label" }, "Connected resource"),
                      React.createElement("select", {
                        className: "playground-metronome-select",
                        value: config.resource || "",
                        onChange: (event) => updateSelectedNodeConfig("resource", event.target.value),
                      },
                        React.createElement("option", { value: "" }, "Select later"),
                        React.createElement("option", { value: "thread" }, "Thread"),
                        React.createElement("option", { value: "project" }, "Project"),
                        React.createElement("option", { value: "computer" }, "Computer"),
                        React.createElement("option", { value: "agent" }, "Agent"),
                        React.createElement("option", { value: "resource" }, "Server resource"),
                        React.createElement("option", { value: "connector" }, "Connector")
                      )
                    ),
                React.createElement("div", { className: "playground-metronome-inspector-note" },
                  "Execution will run on backend Metronome workers. This draft UI already models the graph, node configuration, and resource links so humans and agents can edit the workflow safely."
                )
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

          const renderEditor = () => React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-metronome-editor" },
              React.createElement("main", { className: "playground-metronome-editor-main" },
                React.createElement(ReactFlowProvider, null,
                  React.createElement(MetronomeFlowCanvas, {
                    nodes,
                    edges,
                    nodeTypes,
                    onNodesChange: handleNodesChangeWithHistory,
                    onEdgesChange: handleEdgesChangeWithHistory,
                    onConnect: handleConnect,
                    onCreateNode: handleCreateNode,
                    onSelectNode: setSelectedNodeId,
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
            renderInspectorPortal()
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
            React.createElement("div", { className: "playground-metronome-page" + (isEditor ? " is-editor" : " is-overview") }, isEditor ? renderEditor() : renderOverview()),
            renderWorkflowNameModal()
          );
        }
`;
