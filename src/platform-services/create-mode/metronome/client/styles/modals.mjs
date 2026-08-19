export const METRONOME_MODALS_CSS = String.raw`
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

      .playground-metronome-name-modal.is-share-workflow {
        width: min(520px, 100%);
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

      .playground-metronome-workflow-name-modal__body {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .playground-metronome-workflow-name-modal__input {
        box-sizing: border-box;
      }

      .playground-metronome-workflow-wallpaper-field {
        width: 100%;
        margin-top: 0;
      }

      .playground-tasks-project-initial-setup-label {
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        line-height: 1.3;
        font-weight: 500;
        margin-bottom: 10px;
      }

      .playground-tasks-project-wallpaper-picker {
        width: 100%;
        margin: 0 0 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ffffff;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-tasks-project-wallpaper-picker-preview {
        position: relative;
        width: 100%;
        height: 188px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }

      .playground-tasks-project-wallpaper-picker-preview-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        will-change: transform;
      }

      .playground-tasks-project-wallpaper-picker-preview.is-next .playground-tasks-project-wallpaper-picker-preview-image.is-outgoing {
        animation: playgroundProjectWallpaperSlideOutLeft 360ms ease both;
      }

      .playground-tasks-project-wallpaper-picker-preview.is-next .playground-tasks-project-wallpaper-picker-preview-image.is-incoming {
        animation: playgroundProjectWallpaperSlideInRight 360ms ease both;
      }

      .playground-tasks-project-wallpaper-picker-preview.is-prev .playground-tasks-project-wallpaper-picker-preview-image.is-outgoing {
        animation: playgroundProjectWallpaperSlideOutRight 360ms ease both;
      }

      .playground-tasks-project-wallpaper-picker-preview.is-prev .playground-tasks-project-wallpaper-picker-preview-image.is-incoming {
        animation: playgroundProjectWallpaperSlideInLeft 360ms ease both;
      }

      .playground-tasks-project-wallpaper-picker-controls {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }

      .playground-tasks-project-wallpaper-picker-button {
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: color 160ms ease;
      }

      .playground-tasks-project-wallpaper-picker-button:hover {
        color: #ffffff;
      }

      .playground-tasks-project-wallpaper-picker-label {
        color: #ffffff;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        min-width: 110px;
        text-align: center;
      }

      @keyframes playgroundProjectWallpaperSlideOutLeft {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
      }

      @keyframes playgroundProjectWallpaperSlideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }

      @keyframes playgroundProjectWallpaperSlideOutRight {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }

      @keyframes playgroundProjectWallpaperSlideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }

      .playground-metronome-share-status {
        margin: 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-share-status.is-error {
        color: rgba(255, 154, 154, 0.96);
      }

      .playground-metronome-name-modal-close {
        width: auto;
        height: auto;
        min-height: 0;
        padding: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-metronome-name-modal-close::before {
        display: none;
      }

      .playground-metronome-execution-test-modal {
        width: min(720px, calc(100vw - 32px));
      }

      .playground-metronome-execution-test-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 0;
      }

      .playground-metronome-execution-test-fields {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;
      }

      .playground-metronome-execution-test-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
        min-width: 0;
      }

      .playground-metronome-execution-test-field.is-task-input {
        gap: 5px;
      }

      .playground-metronome-execution-test-composer.tb-runner-chat {
        position: relative;
        display: block;
        width: 100%;
        max-width: none;
        height: auto;
        min-height: 0;
        margin: 0;
        overflow: visible;
        background: transparent;
        grid-template-rows: none;
      }

      .playground-metronome-execution-test-composer > :not(.tb-input-shell) {
        display: none !important;
      }

      .playground-metronome-execution-test-composer.tb-runner-chat .tb-input-shell {
        position: static;
        inset: auto;
        display: block;
        width: 100%;
        min-height: 0;
        margin: 0;
        padding: 0;
      }

      .playground-metronome-execution-test-composer .tb-input-width {
        width: 100%;
        max-width: none;
      }

      .playground-metronome-execution-test-composer .task-input-box {
        --tb-task-input-base-bg: rgba(255, 255, 255, 0.025);
        --tb-task-input-overlay: transparent;
        height: auto;
      }

      .playground-metronome-execution-test-composer .sidebar-textarea {
        min-height: 72px;
        padding-top: 14px;
      }

      .playground-metronome-execution-test-field.is-toggle {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 36px;
      }

      .playground-metronome-execution-test-field-copy {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .playground-metronome-execution-test-field-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.3;
      }

      .playground-metronome-execution-test-field-required {
        color: #7bb7ff;
      }

      .playground-metronome-execution-test-field-description {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-metronome-execution-test-input {
        box-sizing: border-box;
        width: 100%;
        min-height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        outline: none;
        padding: 9px 11px;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 13px;
        line-height: 1.45;
      }

      textarea.playground-metronome-execution-test-input {
        min-height: 108px;
        resize: vertical;
      }

      .playground-metronome-execution-test-input::placeholder {
        color: rgba(255, 255, 255, 0.36);
      }

      .playground-metronome-execution-test-input:focus {
        border-color: rgba(102, 166, 255, 0.5);
      }

      .playground-metronome-execution-test-input:disabled {
        opacity: 0.55;
      }

      .playground-metronome-execution-test-empty-input {
        padding: 12px 13px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-metronome-execution-test-error {
        padding: 10px 12px;
        border: 1px solid rgba(255, 118, 118, 0.2);
        border-radius: 10px;
        background: rgba(255, 118, 118, 0.08);
        color: rgba(255, 170, 170, 0.96);
        font-size: 12px;
        line-height: 1.45;
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
        .playground-metronome-overview,
        .playground-metronome-runs-view {
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
          width: 150px;
          max-height: calc(100% - 24px);
        }

        .playground-metronome-inline-node-inspector {
          top: 12px;
          right: 12px;
          max-height: calc(100% - 24px);
        }
      }
`;
