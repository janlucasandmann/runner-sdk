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

      .playground-tasks-project-modal-backdrop.playground-metronome-workflow-modal-backdrop,
      .playground-metronome-workflow-modal-backdrop.playground-metronome-name-modal-backdrop {
        z-index: 99980;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        transition: background-color 75ms linear !important;
      }

      .playground-tasks-project-modal-backdrop.playground-metronome-workflow-modal-backdrop.is-visible,
      .playground-metronome-workflow-modal-backdrop.playground-metronome-name-modal-backdrop.is-visible {
        background: rgba(0, 0, 0, 0.5) !important;
      }

      .playground-metronome-workflow-modal.playground-metronome-name-modal {
        --tb-runner-input-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        width: min(520px, calc(100vw - 32px));
        max-width: min(520px, calc(100vw - 32px));
        max-height: min(720px, calc(100vh - 48px));
        overflow: visible;
        border: 0 !important;
        border-radius: 25px;
        padding: 16px;
        background: rgba(30, 30, 30, 0.5) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        transform-origin: center;
        opacity: 0.5;
        transform: scale(0.5);
        transition: opacity 75ms linear, transform 75ms linear !important;
        will-change: opacity, transform;
      }

      .playground-metronome-workflow-modal.playground-metronome-name-modal.is-visible {
        opacity: 1;
        transform: scale(1);
      }

      .playground-tasks-project-composer-modal.playground-metronome-workflow-modal::before,
      .playground-metronome-workflow-modal.playground-metronome-name-modal::before {
        content: "" !important;
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        display: block !important;
        border-radius: inherit;
        padding: 1px;
        background: var(--tb-task-input-border, var(--tb-runner-input-border));
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-tasks-project-composer-modal.playground-metronome-workflow-modal::after,
      .playground-metronome-workflow-modal.playground-metronome-name-modal::after {
        content: none !important;
        display: none !important;
      }

      .playground-metronome-workflow-modal-scroll {
        position: relative;
        z-index: 6;
        max-height: calc(min(720px, calc(100vh - 48px)) - 32px);
        overflow: auto;
      }

      .playground-metronome-workflow-modal .playground-tasks-project-modal-top {
        align-items: center;
        gap: 16px;
        margin-bottom: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-metronome-workflow-modal-icon {
        flex: 0 0 auto;
        cursor: default;
      }

      .playground-metronome-workflow-modal-name-input {
        min-width: 0;
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
      }
`;
