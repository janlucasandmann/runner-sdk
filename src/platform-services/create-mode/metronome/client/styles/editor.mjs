export const METRONOME_EDITOR_CSS = String.raw`
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
        width: 150px;
        max-height: calc(100% - 48px);
        overflow: visible;
        margin: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: none;
      }

      .playground-metronome-inline-node-inspector {
        position: absolute;
        top: 64px;
        right: 24px;
        z-index: 16;
        width: min(360px, calc(100% - 220px));
        min-width: 300px;
        height: auto;
        max-height: calc(100% - 88px);
        min-height: 0;
        border: 0;
        border-radius: 15px;
        background: #1A1A1A;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: max-height 220ms ease, min-height 220ms ease, height 220ms ease;
      }

      .playground-metronome-inline-node-inspector .playground-metronome-node-inspector {
        min-height: 0;
        height: auto;
        max-height: 100%;
        border-radius: 15px;
        transition: max-height 220ms ease, min-height 220ms ease, height 220ms ease;
      }

      .playground-metronome-editor-main {
        position: relative;
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .playground-metronome-editor-content-header {
        position: absolute;
        top: 24px;
        left: 198px;
        right: 24px;
        z-index: 18;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        pointer-events: none;
      }

      .playground-metronome-editor-content-header > * {
        pointer-events: auto;
      }

      .playground-metronome-editor-content-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        line-height: 1.25;
        font-weight: 500;
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-metronome-code-header.playground-metronome-palette-header {
        width: 100%;
        max-width: 100%;
        justify-content: space-between;
      }

      .playground-metronome-code-header-title {
        min-width: 0;
        flex: 1 1 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-metronome-code-header .playground-metronome-detail-header-controls {
        margin-left: auto;
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

      .playground-metronome-code-loading {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.2;
        text-align: center;
      }

      .playground-metronome-code-loading-dot-loader {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
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
        width: max-content;
        max-width: min(520px, calc(100vw - 72px));
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 28px;
      }

      .playground-metronome-palette-title {
        min-width: 0;
        flex: 0 1 auto;
        max-width: min(460px, calc(100vw - 118px));
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: none;
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
        width: 150px;
        max-height: calc(100vh - 94px);
        overflow: auto;
        border: 0;
        border-radius: 15px;
        background: #1A1A1A;
        padding: 11px 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        transition: none;
      }

      .playground-metronome-palette-section {
        display: flex;
        flex-direction: column;
        gap: 3px;
        width: 100%;
      }

      .playground-metronome-palette-section-title {
        color: rgba(255, 255, 255, 0.7);
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 0;
        text-transform: none;
        padding: 0 5px 3px;
        max-height: 18px;
        transition: none;
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
        transition: background-color 160ms ease;
      }

      .playground-metronome-palette-item:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-metronome-palette-item-icon {
        position: relative;
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
        max-width: 96px;
        transition: none;
      }

      .playground-metronome-palette-item-label {
        font-size: 12px;
        font-weight: 500;
        line-height: 1.1;
      }

      .playground-metronome-palette-item-copy {
        display: none;
      }

      .playground-metronome-node {
        width: max-content;
        min-width: 118px;
        max-width: 220px;
        border-radius: 16px;
        background: rgba(24, 24, 25, 0.94);
        color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }

      .playground-metronome-node.is-condition {
        width: max-content;
        min-width: 142px;
        max-width: 240px;
      }

      .playground-metronome-node.is-loop {
        width: 100%;
        max-width: none;
        height: 100%;
        max-height: none;
        min-width: 420px;
        min-height: 170px;
        border-radius: 24px;
        background: rgba(5, 5, 5, 0.42);
        border: 1px dashed rgba(255, 255, 255, 0.28);
        box-shadow: none;
        overflow: visible;
      }

      .playground-metronome-node.is-loop.is-selected {
        border-color: rgba(255, 255, 255, 0.42);
        box-shadow: none;
      }

      .playground-metronome-loop-header {
        position: absolute;
        z-index: 3;
        top: 14px;
        left: 16px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        pointer-events: none;
      }

      .playground-metronome-loop-icon {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-metronome-node.is-loop .react-flow__handle {
        width: 9px;
        height: 9px;
        border: 2px solid rgba(255, 255, 255, 0.72);
        background: #050505;
      }

      .playground-metronome-node.is-loop .react-flow__handle-left {
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .playground-metronome-node.is-loop .react-flow__handle-right {
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
      }

      .playground-metronome-node.is-loop .playground-metronome-loop-handle {
        position: absolute;
        top: 50%;
        width: 9px;
        height: 9px;
        border-color: rgba(255, 255, 255, 0.72);
        background: #050505;
      }

      .playground-metronome-node.is-loop .playground-metronome-loop-handle.is-left {
        left: 0;
        transform: translate(-50%, -50%);
      }

      .playground-metronome-node.is-loop .playground-metronome-loop-handle.is-right {
        right: 0;
        transform: translate(50%, -50%);
      }

      .playground-metronome-node.is-note {
        width: 100%;
        max-width: none;
        height: 100%;
        max-height: none;
        min-width: 180px;
        min-height: 96px;
        border-radius: 16px;
        background: #B08915;
        border: 0;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
        color: rgba(0, 0, 0, 0.88);
        overflow: visible;
        padding: 8px;
        box-sizing: border-box;
      }

      .playground-metronome-node.is-note.is-selected,
      .playground-metronome-node.is-note.is-run-active,
      .playground-metronome-node.is-note.is-run-completed {
        border-color: transparent;
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
      }

      .playground-metronome-note-textarea {
        width: 100%;
        min-width: 0;
        max-width: none;
        height: 100%;
        min-height: 0;
        max-height: none;
        box-sizing: border-box;
        display: block;
        resize: none;
        border: 0;
        border-radius: inherit;
        outline: none;
        background: transparent;
        color: rgba(0, 0, 0, 0.88);
        padding: 20px 22px;
        font: inherit;
        font-size: 13px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-metronome-note-textarea::placeholder {
        color: rgba(0, 0, 0, 0.5);
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
        position: relative;
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-node-subtitle {
        margin-top: 2px;
        font-size: 11px;
        line-height: 1.15;
        color: rgba(255, 255, 255, 0.48);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-metronome-node-body {
        margin: 0 12px 12px;
        border-radius: 11px;
        padding: 9px 10px;
        background: rgba(0, 0, 0, 0.24);
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        line-height: 1.35;
        max-width: 196px;
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

      .playground-metronome-loop-resize-handle {
        display: none;
        position: absolute;
        width: 6px;
        height: 6px;
        min-width: 6px;
        min-height: 6px;
        max-width: 6px;
        max-height: 6px;
        border: 1px solid #66a6ff;
        border-radius: 1px;
        background: #050505;
        box-sizing: border-box;
        z-index: 12;
        pointer-events: auto;
      }

      .playground-metronome-node.is-loop.is-selected .playground-metronome-loop-resize-handle,
      .playground-metronome-node.is-note.is-selected .playground-metronome-loop-resize-handle {
        display: block;
      }

      .playground-metronome-loop-resize-handle.is-top-left {
        top: -3px;
        left: -3px;
        cursor: nwse-resize;
      }

      .playground-metronome-loop-resize-handle.is-top-right {
        top: -3px;
        right: -3px;
        cursor: nesw-resize;
      }

      .playground-metronome-loop-resize-handle.is-bottom-left {
        bottom: -3px;
        left: -3px;
        cursor: nesw-resize;
      }

      .playground-metronome-loop-resize-handle.is-bottom-right {
        right: -3px;
        bottom: -3px;
        cursor: nwse-resize;
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
        border-radius: 10px;
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
`;
