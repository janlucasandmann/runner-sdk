export const IMAGINE_TEMPLATE_PAGE_CSS = String.raw`
      .playground-imagine-template-page {
        position: fixed;
        inset: 0;
        isolation: isolate;
        width: 100%;
        height: 100vh;
        min-height: 0;
        overflow: hidden;
        z-index: 10000;
        background: rgba(6, 6, 10, 0.96);
        -webkit-backdrop-filter: blur(18px);
        backdrop-filter: blur(18px);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-template-shell {
        width: 100%;
        max-width: none;
        height: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 0;
        background: #000;
        min-height: 0;
      }

      .playground-imagine-template-config {
        min-width: 0;
        min-height: 0;
        overflow: auto;
        scrollbar-width: none;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 20px 22px 22px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-template-config::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-back {
        width: fit-content;
        height: 28px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.66);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        font-size: 13px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
      }

      .playground-imagine-template-back:hover {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-template-heading {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-imagine-template-heading.is-compact {
        margin-top: -4px;
      }

      .playground-imagine-template-project-top {
        flex: 0 0 auto;
        margin-bottom: 0;
      }

      .playground-imagine-template-kicker {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.2;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .playground-imagine-template-heading-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.98);
        font-size: 24px;
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: -0.03em;
      }

      .playground-imagine-template-heading-copy {
        margin: 0;
        max-width: 34rem;
        color: rgba(255, 255, 255, 0.58);
        font-size: 13px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-imagine-template-description-area {
        margin-top: 4px;
        max-width: 38rem;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
      }

      .playground-imagine-template-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-imagine-template-label,
      .playground-imagine-template-section-title {
        color: rgba(255, 255, 255, 0.76);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-imagine-template-input {
        width: 100%;
        height: 38px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
        outline: none;
        padding: 0 12px;
        box-sizing: border-box;
        font: inherit;
        font-size: 13px;
        font-weight: 400;
      }

      .playground-imagine-template-input:focus {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.56);
      }

      .playground-imagine-template-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-imagine-template-section.is-attachments {
        gap: 0;
      }

      .playground-imagine-template-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-imagine-template-slider-actions {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .playground-imagine-template-icon-button {
        width: 28px;
        height: 28px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.82);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-icon-button:disabled {
        opacity: 0.32;
        cursor: default;
      }

      .playground-imagine-template-slider {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .playground-imagine-template-thumb {
        position: relative;
        isolation: isolate;
        min-width: 0;
        aspect-ratio: 1;
        border: 0;
        border-radius: 10px;
        background: var(--imagine-template-thumb-bg, rgba(255, 255, 255, 0.08));
        overflow: hidden;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-thumb::before,
      .playground-imagine-template-connector,
      .playground-imagine-template-chip,
      .playground-imagine-template-attach-button {
        position: relative;
      }

      .playground-imagine-template-thumb::before,
      .playground-imagine-template-connector::before,
      .playground-imagine-template-chip::before,
      .playground-imagine-template-attach-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-project-overview-chart-border, linear-gradient(-10deg, rgba(255,255,255,0.06), rgba(255,255,255,0.3), rgba(255,255,255,0.08)));
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        mask-composite: exclude;
      }

      .playground-imagine-template-thumb::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.5));
      }

      .playground-imagine-template-thumb.is-active {
        box-shadow: inset 0 0 0 1px rgba(102, 166, 255, 0.86);
      }

      .playground-imagine-template-thumb-title {
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 8px;
        z-index: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.94);
        font-size: 10px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-imagine-template-context-grid,
      .playground-imagine-template-style-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .playground-imagine-template-attachments-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-imagine-template-from-computer {
        border: 0;
        background: transparent;
        color: #66a6ff;
        padding: 0;
        font: inherit;
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-template-attachments.playground-tasks-attachments {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        padding-top: 0;
      }

      .playground-imagine-template-attachments .playground-tasks-attachments-toolbar {
        width: 100%;
        margin-bottom: 10px;
      }

      .playground-imagine-template-attachments .playground-tasks-attachments-surface.tb-runner-chat,
      .playground-imagine-template-attachments .playground-tasks-connectors {
        width: 100%;
      }

      .playground-imagine-template-attachments .playground-tasks-attachments-surface.tb-runner-chat .tb-popup-dropzone,
      .playground-imagine-template-attachments .playground-tasks-attachments-empty-button {
        min-height: 168px;
      }

      .playground-imagine-template-attachments .playground-tasks-connectors-list {
        width: 100%;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .playground-imagine-template-attachments .playground-tasks-connector-service-icon.is-github,
      .playground-imagine-template-attachments .playground-tasks-connector-service-icon.is-notion {
        filter: invert(1);
      }

      .playground-imagine-template-project-row {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        min-height: 32px;
      }

      .playground-imagine-template-row-title {
        color: rgba(255, 255, 255, 0.76);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-imagine-template-aspect-row {
        position: relative;
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        min-height: 32px;
      }

      .playground-imagine-template-style-cards {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .playground-imagine-template-style-card {
        min-width: 0;
        height: 42px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.055);
        color: rgba(255, 255, 255, 0.66);
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 7px;
        padding: 0 10px;
        box-sizing: border-box;
        font: inherit;
        font-size: 12px;
        line-height: 1;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
      }

      .playground-imagine-template-style-card.is-selected {
        border-color: rgba(102, 166, 255, 0.42);
        background: rgba(102, 166, 255, 0.14);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-template-style-card svg {
        width: 13px;
        height: 13px;
        flex: 0 0 auto;
        color: currentColor;
      }

      .playground-imagine-template-style-card span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-template-project-select,
      .playground-imagine-template-aspect-select {
        position: relative;
        min-width: 0;
        display: flex;
        justify-content: flex-end;
      }

      .playground-imagine-template-project-button,
      .playground-imagine-template-aspect-button {
        max-width: min(340px, 52vw);
        justify-content: flex-end;
        gap: 7px;
      }

      .playground-imagine-template-project-button span,
      .playground-imagine-template-aspect-button span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-template-project-menu,
      .playground-imagine-template-aspect-menu {
        left: auto;
        right: 0;
        top: calc(100% + 8px);
        min-width: 260px;
        max-width: min(340px, 68vw);
        max-height: 280px;
        overflow: auto;
      }

      .playground-imagine-template-aspect-menu {
        min-width: 220px;
      }

      .playground-imagine-template-attachments-surface {
        min-height: 168px;
        border: 1px dashed rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        background: transparent;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        overflow: hidden;
      }

      .playground-imagine-template-dropzone {
        width: 100%;
        min-height: 166px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 18px;
        box-sizing: border-box;
        text-align: center;
        cursor: pointer;
      }

      .playground-imagine-template-dropzone svg {
        width: 19px;
        height: 19px;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-imagine-template-dropzone-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-imagine-template-dropzone-copy {
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-imagine-template-connectors {
        margin-top: 10px;
      }

      .playground-imagine-template-connectors-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 26px;
        row-gap: 0;
      }

      .playground-imagine-template-connector-row {
        min-width: 0;
        min-height: 32px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.84);
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 12px;
        padding: 0;
        box-sizing: border-box;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-imagine-template-connector-service {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-template-connector-service svg {
        width: 14px;
        height: 14px;
        color: rgba(255, 255, 255, 0.82);
        flex: 0 0 auto;
      }

      .playground-imagine-template-connector-service span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 500;
      }

      .playground-imagine-template-connector-value {
        color: rgba(255, 255, 255, 0.54);
        font-size: 12px;
        line-height: 1.3;
        font-weight: 400;
      }

      .playground-imagine-template-connector-row.is-selected .playground-imagine-template-connector-value {
        color: rgba(102, 166, 255, 0.96);
      }

      .playground-imagine-template-connector,
      .playground-imagine-template-chip,
      .playground-imagine-template-attach-button {
        min-height: 36px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.72);
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 0 12px;
        box-sizing: border-box;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        text-align: left;
        cursor: pointer;
      }

      .playground-imagine-template-connector.is-selected,
      .playground-imagine-template-chip.is-selected {
        background: rgba(102, 166, 255, 0.14);
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-template-connector svg,
      .playground-imagine-template-chip svg,
      .playground-imagine-template-attach-button svg {
        flex: 0 0 auto;
        color: currentColor;
      }

      .playground-imagine-template-file-input {
        display: none;
      }

      .playground-imagine-template-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .playground-imagine-template-attachment {
        min-width: 0;
        max-width: 100%;
        height: 28px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        line-height: 1;
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-imagine-template-attachment span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-template-preview-pane {
        position: relative;
        isolation: isolate;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        border-radius: 0;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 66px 22px 116px;
        box-sizing: border-box;
      }

      .playground-imagine-template-preview-frame {
        position: relative;
        width: min(100%, 584px);
        max-height: calc(100vh - 206px);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-stage {
        position: relative;
        width: min(500px, calc(100% - 84px));
        max-height: calc(100vh - 206px);
        aspect-ratio: 4 / 5;
        overflow: hidden;
        background: var(--imagine-template-preview-bg, #111);
        border-radius: 10px;
      }

      .playground-imagine-template-preview-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        background: var(--imagine-template-preview-bg, #111);
      }

      .playground-imagine-template-preview-stage::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        overflow: hidden;
        background:
          linear-gradient(to bottom, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.22) 56%, rgba(0, 0, 0, 0.72)),
          radial-gradient(circle at 50% 78%, rgba(0, 0, 0, 0.24), transparent 44%);
      }

      .playground-imagine-template-preview-image {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-imagine-template-preview-image.is-current {
        animation: playgroundImagineTemplatePreviewIn 280ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        animation: playgroundImagineTemplatePreviewOut 280ms ease both;
      }

      @keyframes playgroundImagineTemplatePreviewIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * 28px));
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplatePreviewOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * -28px));
        }
      }

      .playground-imagine-template-preview-nav {
        position: absolute;
        top: 50%;
        z-index: 7;
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        transform: translateY(-50%);
      }

      .playground-imagine-template-preview-nav:disabled {
        opacity: 0.32;
        cursor: default;
      }

      .playground-imagine-template-preview-nav.is-previous {
        left: 0;
      }

      .playground-imagine-template-preview-nav.is-next {
        right: 0;
      }

      .playground-imagine-template-preview-copy {
        position: absolute;
        left: 24px;
        right: 24px;
        top: 24px;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        pointer-events: none;
      }

      .playground-imagine-template-preview-title {
        max-width: 28rem;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        line-height: 1.18;
        font-weight: 500;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 18px rgba(0, 0, 0, 0.42);
      }

      .playground-imagine-template-preview-meta {
        flex: 0 0 auto;
        border-radius: 999px;
        padding: 7px 10px;
        background: rgba(0, 0, 0, 0.36);
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.74);
        font-size: 11px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-imagine-template-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 20px;
        z-index: 6;
        width: min(100%, calc(100% - 44px));
        transform: translateX(-50%);
      }

      .playground-imagine-template-composer-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-input-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-input-width,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .embedded-runner-input,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .tb-composer-textarea-shell,
      .playground-imagine-template-composer-shell .tb-runner-chat.playground-imagine-template-runner .task-input-controls {
        background: transparent !important;
      }

      .tb-runner-chat.playground-imagine-template-runner {
        width: 100%;
        min-width: 0;
        display: block;
        flex: 0 0 auto;
        height: auto;
        min-height: 0;
        overflow: visible;
      }

      .tb-runner-chat.playground-imagine-template-runner .workinglogsbox {
        display: none !important;
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-input-shell {
        position: static;
        right: auto;
        bottom: auto;
        padding: 0;
        background: none;
        pointer-events: auto;
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-input-width,
      .tb-runner-chat.playground-imagine-template-runner .embedded-runner-input {
        width: 100%;
        max-width: none;
      }

      .tb-runner-chat.playground-imagine-template-runner .task-input-box {
        --tb-runner-input-bg: rgba(0, 0, 0, 0.35);
        --tb-task-input-base-bg: rgba(0, 0, 0, 0.35);
        background: rgba(0, 0, 0, 0.35) !important;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .tb-runner-chat.playground-imagine-template-runner .tb-context-indicator-anchor {
        display: none;
      }

      .playground-imagine-template-actions {
        margin-top: auto;
        padding-top: 4px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }

      .playground-imagine-template-generate-button {
        flex: 0 0 auto;
      }

      @media (max-width: 1080px) {
        .playground-imagine-template-shell {
          grid-template-columns: minmax(340px, 0.48fr) minmax(0, 0.52fr);
        }
      }

      @media (max-width: 860px) {
        .playground-imagine-template-shell {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(420px, 1fr);
          overflow: auto;
          scrollbar-width: none;
          background: rgba(6, 6, 10, 0.96);
        }

        .playground-imagine-template-shell::-webkit-scrollbar {
          display: none;
        }

        .playground-imagine-template-config {
          overflow: visible;
        }

        .playground-imagine-template-preview-pane {
          min-height: 520px;
          border-radius: 15px;
        }
      }

      @media (max-width: 640px) {
        .playground-imagine-template-shell {
          padding: 12px;
        }

        .playground-imagine-template-context-grid,
        .playground-imagine-template-style-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-imagine-template-slider {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-imagine-template-composer-wrap {
          width: calc(100% - 24px);
        }
      }

      .playground-imagine-template-page {
        position: relative;
        inset: auto;
        z-index: auto;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        isolation: isolate;
        background: #000;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .playground-imagine-template-shell {
        width: 100%;
        height: 100%;
        min-height: 0;
        display: block;
        background: #000;
      }

      .playground-imagine-template-detail {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 0;
        overflow: hidden;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px 18px 22px;
        box-sizing: border-box;
      }

      .playground-imagine-template-back.is-icon-only {
        position: absolute;
        top: 18px;
        left: 18px;
        z-index: 20;
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 0;
        background: transparent;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        color: rgba(255, 255, 255, 0.86);
        justify-content: center;
      }

      .playground-imagine-template-back.is-icon-only span {
        display: none;
      }

      .playground-imagine-template-top-nav {
        position: absolute;
        top: 18px;
        right: 18px;
        z-index: 20;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-template-top-nav .playground-imagine-template-preview-nav {
        position: relative;
        inset: auto;
        transform: none;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-top-nav .playground-imagine-template-preview-nav:hover {
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-main {
        position: relative;
        width: min(49vw, 710px);
        max-width: calc(100vw - 300px);
        min-width: 320px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-frame {
        position: relative;
        width: 100%;
        max-height: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-stage {
        position: relative;
        width: 100%;
        max-height: calc(100vh - 174px);
        aspect-ratio: 4 / 5;
        overflow: hidden;
        background: transparent;
        border-radius: 10px;
      }

      .playground-imagine-template-preview-stage::after {
        display: none;
      }

      .playground-imagine-template-slide-shell {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        will-change: transform, opacity;
      }

      .playground-imagine-template-slide-shell.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateSlideIn 360ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        animation: playgroundImagineTemplateSlideOut 360ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none;
      }

      @keyframes playgroundImagineTemplateSlideIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * min(54vw, 920px)));
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * min(-54vw, -920px)));
        }
      }

      .playground-imagine-template-preview-media {
        position: absolute;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        background: transparent;
      }

      .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-fallback {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        border-radius: inherit;
      }

      .playground-imagine-template-preview-fallback {
        background: var(--imagine-template-preview-bg, linear-gradient(135deg, #171717, #333));
      }

      .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-fallback.is-current {
        animation: playgroundImagineTemplatePreviewInY 320ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-fallback.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        animation: playgroundImagineTemplatePreviewOutY 320ms ease both;
      }

      @keyframes playgroundImagineTemplatePreviewInY {
        from {
          opacity: 0;
          transform: translateY(calc(var(--imagine-template-transition-direction, 1) * 32px));
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes playgroundImagineTemplatePreviewOutY {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(calc(var(--imagine-template-transition-direction, 1) * -32px));
        }
      }

      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none !important;
      }

      .playground-imagine-template-vertical-nav {
        position: absolute;
        left: -50px;
        top: 50%;
        z-index: 8;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-imagine-template-vertical-nav .playground-imagine-template-preview-nav {
        position: static;
        transform: none;
        width: 34px;
        height: 34px;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-imagine-template-action-rail {
        position: absolute;
        right: -54px;
        bottom: 0;
        z-index: 14;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .playground-imagine-template-action-spacer {
        display: none;
      }

      .playground-imagine-template-action-button {
        --sidebar-workspace-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.86);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        overflow: hidden;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        transition: background 140ms ease, color 140ms ease, transform 140ms ease;
      }

      .playground-imagine-template-action-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--sidebar-workspace-border);
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-imagine-template-action-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-imagine-template-action-button:hover,
      .playground-imagine-template-action-button.is-active {
        background: transparent;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-action-button.is-liked {
        color: #ff6f9b;
      }

      .playground-imagine-template-action-rail.is-ghost .playground-imagine-template-action-button {
        pointer-events: none;
      }

      .playground-imagine-template-action-popup {
        position: absolute;
        right: 44px;
        bottom: 0;
        z-index: 18;
        width: min(300px, 72vw);
        max-height: min(420px, calc(100vh - 180px));
        overflow: auto;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(22, 22, 24, 0.94);
        -webkit-backdrop-filter: blur(28px);
        backdrop-filter: blur(28px);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.3);
        padding: 12px;
        box-sizing: border-box;
        scrollbar-width: none;
      }

      .playground-imagine-template-action-popup::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-action-popup-title {
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.94);
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-imagine-template-action-popup-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-imagine-template-popup-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-imagine-template-popup-row {
        width: 100%;
        min-height: 38px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.76);
        display: grid;
        grid-template-columns: 18px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 7px 8px;
        box-sizing: border-box;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-imagine-template-popup-row:hover,
      .playground-imagine-template-popup-row.is-selected {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-imagine-template-popup-row-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-imagine-template-popup-row-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-imagine-template-popup-row-description {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-imagine-template-popup-dropzone {
        width: 100%;
        min-height: 106px;
        border: 1px dashed rgba(255, 255, 255, 0.18);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px;
        box-sizing: border-box;
        font: inherit;
        text-align: center;
        cursor: pointer;
      }

      .playground-imagine-template-popup-dropzone.is-dragging {
        border-color: rgba(102, 166, 255, 0.7);
        background: rgba(102, 166, 255, 0.1);
      }

      .playground-imagine-template-popup-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
      }

      .playground-imagine-template-composer-wrap {
        position: relative;
        left: auto;
        bottom: auto;
        z-index: 10;
        width: min(49vw, 760px);
        max-width: calc(100vw - 240px);
        min-width: 320px;
        transform: none;
        margin-top: 16px;
      }

      .playground-imagine-template-detail {
        padding: 24px 18px 144px;
      }

      .playground-imagine-template-main {
        width: auto;
        height: min(72vh, calc(100vh - 178px));
        max-height: calc(100vh - 178px);
        aspect-ratio: 4 / 5;
        max-width: min(72vw, 760px);
        min-width: 0;
      }

      .playground-imagine-template-preview-frame,
      .playground-imagine-template-flip-card,
      .playground-imagine-template-flip-inner {
        width: auto;
        height: 100%;
        aspect-ratio: 4 / 5;
      }

      .playground-imagine-template-flip-card {
        position: relative;
        perspective: 1600px;
      }

      .playground-imagine-template-flip-inner {
        position: relative;
        transform-style: preserve-3d;
        transition: transform 460ms cubic-bezier(0.2, 0.85, 0.22, 1);
      }

      .playground-imagine-template-flip-card.is-flipped .playground-imagine-template-flip-inner {
        transform: rotateY(180deg);
      }

      .playground-imagine-template-flip-face {
        position: absolute;
        inset: 0;
        border-radius: 10px;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        overflow: hidden;
      }

      .playground-imagine-template-flip-face.is-back {
        transform: rotateY(180deg);
      }

      .playground-imagine-template-preview-stage {
        width: 100%;
        height: 100%;
        max-height: none;
      }

      .playground-imagine-template-settings-back {
        width: 100%;
        height: 100%;
        overflow: auto;
        scrollbar-width: none;
        border-radius: inherit;
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-imagine-template-settings-back::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-settings-back-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: -0.01em;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-description-area {
        margin-top: 0;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-attachments-surface,
      .playground-imagine-template-settings-back .playground-imagine-template-dropzone {
        min-height: 132px;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-connectors-list {
        column-gap: 18px;
      }

      .playground-imagine-template-action-button.is-editing {
        background: transparent;
        color: rgba(255, 255, 255, 0.98);
      }

      .playground-imagine-template-composer-wrap {
        position: absolute;
        left: 50%;
        bottom: 10px;
        z-index: 18;
        width: min(56rem, calc(100% - 64px));
        max-width: none;
        min-width: 0;
        transform: translateX(-50%);
        margin-top: 0;
      }

      @media (max-width: 960px) {
        .playground-imagine-template-detail {
          padding-left: 64px;
          padding-right: 64px;
        }

        .playground-imagine-template-main,
        .playground-imagine-template-composer-wrap {
          width: min(82vw, 640px);
          max-width: 100%;
        }

        .playground-imagine-template-vertical-nav {
          left: -42px;
        }

        .playground-imagine-template-action-rail {
          right: -42px;
        }
      }

      @media (max-width: 640px) {
        .playground-imagine-template-detail {
          padding: 62px 48px 18px;
        }

        .playground-imagine-template-main,
        .playground-imagine-template-composer-wrap {
          width: 100%;
          min-width: 0;
        }

        .playground-imagine-template-preview-stage {
          max-height: calc(100vh - 210px);
        }
      }
`;

export const IMAGINE_TEMPLATE_PAGE_SCRIPT = String.raw`
        function PlaygroundImagineTemplatePage({
          templates,
          initialTemplateId,
          backendUrl,
          apiKey,
          speechToTextUrl,
          requestHeaders,
          computerAgents,
          environments,
          agents,
          skills,
          skillDefaults,
          environmentId,
          agentId,
          fetchCustomSkills,
          onThreadStarted,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onBack,
        }) {
          const normalizedTemplates = useMemo(() => Array.isArray(templates) ? templates : [], [templates]);
          const [activeTemplateId, setActiveTemplateId] = useState(String(initialTemplateId || "").trim());
          const [templateWindowStart, setTemplateWindowStart] = useState(0);
          const [imageName, setImageName] = useState("");
          const [selectedConnectors, setSelectedConnectors] = useState([]);
          const [attachedFiles, setAttachedFiles] = useState([]);
          const [isAttachmentDragging, setIsAttachmentDragging] = useState(false);
          const [selectedProjectId, setSelectedProjectId] = useState("");
          const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
          const [aspectRatioSelectorOpen, setAspectRatioSelectorOpen] = useState(false);
          const [previewTransition, setPreviewTransition] = useState({
            previousTemplate: null,
            direction: 1,
            token: 0,
          });
          const [aspectRatio, setAspectRatio] = useState("");
          const [styleDirection, setStyleDirection] = useState("Editorial");
          const [activeActionPopup, setActiveActionPopup] = useState("");
          const [likedTemplateIds, setLikedTemplateIds] = useState([]);
          const [settingsFlipped, setSettingsFlipped] = useState(false);
          const fileInputRef = useRef(null);
          const projectSelectorRef = useRef(null);
          const aspectRatioSelectorRef = useRef(null);
          const previewTransitionTimeoutRef = useRef(null);

          useEffect(() => {
            const nextTemplateId = String(initialTemplateId || "").trim();
            if (nextTemplateId) {
              setActiveTemplateId(nextTemplateId);
            }
          }, [initialTemplateId]);

          const activeTemplate = useMemo(() => {
            return normalizedTemplates.find((template) => template.id === activeTemplateId) || normalizedTemplates[0] || null;
          }, [activeTemplateId, normalizedTemplates]);

          useEffect(() => {
            return () => {
              if (previewTransitionTimeoutRef.current) {
                clearTimeout(previewTransitionTimeoutRef.current);
              }
            };
          }, []);

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            setImageName((current) => String(current || "").trim() ? current : activeTemplate.title);
          }, [activeTemplate]);

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            const activeIndex = normalizedTemplates.findIndex((template) => template.id === activeTemplate.id);
            if (activeIndex < 0) {
              return;
            }
            setTemplateWindowStart((current) => {
              const maxStart = Math.max(0, normalizedTemplates.length - 4);
              if (activeIndex < current) {
                return Math.max(0, activeIndex);
              }
              if (activeIndex >= current + 4) {
                return Math.min(maxStart, Math.max(0, activeIndex - 3));
              }
              return Math.min(current, maxStart);
            });
          }, [activeTemplate, normalizedTemplates]);

          const visibleTemplates = useMemo(() => {
            return normalizedTemplates.slice(templateWindowStart, templateWindowStart + 4);
          }, [normalizedTemplates, templateWindowStart]);

          const connectors = useMemo(() => [
            {
              id: "google-drive",
              source: "google-drive",
              label: "Google Drive",
              Icon: Folder,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
            },
            {
              id: "onedrive",
              source: "one-drive",
              label: "OneDrive",
              Icon: Cloud,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg",
            },
            {
              id: "notion",
              source: "notion",
              label: "Notion",
              Icon: FileText,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
            },
            {
              id: "github",
              source: "github",
              label: "GitHub",
              Icon: GitFork,
              logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
            },
          ], []);

          const availableProjects = useMemo(() => {
            const sourceProjects = Array.isArray(computerAgents?.projects?.items)
              ? computerAgents.projects.items
              : [];
            const merged = new Map();
            sourceProjects.forEach((project) => {
              const projectId = String(project?.id || project?.projectId || "").trim();
              if (!projectId) {
                return;
              }
              merged.set(projectId, {
                ...project,
                id: projectId,
                name: String(project?.name || project?.title || "Untitled Project").trim() || "Untitled Project",
              });
            });
            return Array.from(merged.values());
          }, [computerAgents]);

          useEffect(() => {
            if (!projectSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (projectSelectorRef.current && !projectSelectorRef.current.contains(event.target)) {
                setProjectSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [projectSelectorOpen]);

          useEffect(() => {
            if (!aspectRatioSelectorOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (aspectRatioSelectorRef.current && !aspectRatioSelectorRef.current.contains(event.target)) {
                setAspectRatioSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [aspectRatioSelectorOpen]);

          const renderImagineConnectorIcon = (connector) => {
            if (typeof renderTaskConnectorServiceIcon === "function") {
              return renderTaskConnectorServiceIcon(connector.source || connector.id, "playground-tasks-connector-service-icon");
            }
            if (connector.logoUrl) {
              return React.createElement("img", {
                src: connector.logoUrl,
                alt: "",
                draggable: false,
                className: "playground-tasks-connector-service-icon" + (connector.id === "github" ? " is-github" : "") + (connector.id === "notion" ? " is-notion" : ""),
              });
            }
            const ConnectorIcon = connector.Icon || Link2;
            return React.createElement(ConnectorIcon, { className: "playground-tasks-connector-service-icon", strokeWidth: 1.8 });
          };

          const styleDirections = useMemo(() => ["Editorial", "Studio", "Outdoor", "Minimal"], []);
          const aspectRatioOptions = useMemo(() => [
            { value: "", label: "No preference", description: "Let the agent choose the best format" },
            { value: "1:1", label: "1:1", description: "Square composition" },
            { value: "4:5", label: "4:5", description: "Portrait campaign image" },
            { value: "16:9", label: "16:9", description: "Wide landscape image" },
            { value: "9:16", label: "9:16", description: "Vertical story format" },
          ], []);
          const selectedAspectRatioOption = useMemo(() => {
            return aspectRatioOptions.find((option) => option.value === aspectRatio) || aspectRatioOptions[0];
          }, [aspectRatio, aspectRatioOptions]);
          const selectedProject = useMemo(() => {
            return availableProjects.find((project) => project.id === selectedProjectId) || null;
          }, [availableProjects, selectedProjectId]);

          const activeTemplateBackground = activeTemplate?.imageUrl
            ? "url('" + activeTemplate.imageUrl + "') center / cover no-repeat"
            : (activeTemplate?.tone || "linear-gradient(135deg, #141414, #333)");

          const selectedConnectorLabels = connectors
            .filter((connector) => selectedConnectors.includes(connector.id))
            .map((connector) => connector.label);

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine template mode.",
            "The user is creating images only. Do not produce video unless the user explicitly asks to leave Imagine mode.",
            activeTemplate ? "Selected template: " + activeTemplate.title + "." : "",
            activeTemplate ? "Template direction: " + activeTemplate.prompt : "",
            "Image name: " + (String(imageName || "").trim() || (activeTemplate?.title || "Generated image")) + ".",
            aspectRatio
              ? "Aspect ratio: " + aspectRatio + "."
              : "Aspect ratio: no preference; choose the strongest format for the selected template and prompt.",
            "Style direction: " + styleDirection + ".",
            selectedConnectorLabels.length ? "User selected connector context: " + selectedConnectorLabels.join(", ") + "." : "",
            attachedFiles.length ? "User attached local context filenames: " + attachedFiles.join(", ") + "." : "",
            selectedProject ? "Project context: attach this image generation thread to project " + selectedProject.name + " (" + selectedProject.id + ") and use that project's strategy, tasks, files, and history as relevant context." : "",
            "Use the selected template image as the visual direction and reference for composition, mood, and quality.",
            "Use the available image generation skill when possible. Create the image and summarize the output concisely.",
          ].filter(Boolean).join("\\n");

          const handleProjectSelect = (nextProjectId) => {
            const normalizedProjectId = String(nextProjectId || "").trim();
            setSelectedProjectId(normalizedProjectId);
            setProjectSelectorOpen(false);
            setActiveActionPopup("");
            try {
              computerAgents?.projects?.onProjectChange?.(normalizedProjectId);
            } catch (error) {
              console.warn("[Imagine] Failed to update selected project", error);
            }
          };

          const handleAspectRatioSelect = (nextAspectRatio) => {
            setAspectRatio(String(nextAspectRatio || "").trim());
            setAspectRatioSelectorOpen(false);
            setActiveActionPopup("");
          };

          const handleGenerateWithoutInstructions = () => {
            const runnerRoot = document.querySelector(".playground-imagine-template-runner");
            const textarea = runnerRoot?.querySelector?.("textarea.sidebar-textarea");
            if (!textarea) {
              return;
            }
            const prompt = String(activeTemplate?.placeholder || activeTemplate?.prompt || activeTemplate?.title || "Create this image.").trim() || "Create this image.";
            const descriptor = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value");
            if (descriptor?.set) {
              descriptor.set.call(textarea, prompt);
            } else {
              textarea.value = prompt;
            }
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.focus();
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                const sendButton = runnerRoot?.querySelector?.('button[aria-label="Send message"]');
                if (sendButton && !sendButton.disabled) {
                  sendButton.click();
                }
              });
            });
          };

          const selectTemplateByOffset = (offset) => {
            if (!normalizedTemplates.length || normalizedTemplates.length <= 1) {
              return;
            }
            const currentIndex = Math.max(0, normalizedTemplates.findIndex((template) => template.id === activeTemplate?.id));
            const nextIndex = (currentIndex + offset + normalizedTemplates.length) % normalizedTemplates.length;
            const nextTemplate = normalizedTemplates[nextIndex] || null;
            if (!nextTemplate || nextTemplate.id === activeTemplate?.id) {
              return;
            }
            if (previewTransitionTimeoutRef.current) {
              clearTimeout(previewTransitionTimeoutRef.current);
            }
            const transitionToken = Date.now() + Math.random();
            setPreviewTransition({
              previousTemplate: activeTemplate || null,
              direction: offset >= 0 ? 1 : -1,
              token: transitionToken,
            });
            setActiveTemplateId(nextTemplate.id);
            setImageName(nextTemplate.title || "");
            setActiveActionPopup("");
            setSettingsFlipped(false);
            previewTransitionTimeoutRef.current = setTimeout(() => {
              setPreviewTransition((current) => (
                current.token === transitionToken
                  ? { ...current, previousTemplate: null }
                  : current
              ));
            }, 320);
          };

          const handleTemplatePrevious = () => {
            selectTemplateByOffset(-1);
          };

          const handleTemplateNext = () => {
            selectTemplateByOffset(1);
          };

          const addAttachedFiles = (files) => {
            const normalizedFiles = Array.from(files || []);
            if (!normalizedFiles.length) {
              return;
            }
            setAttachedFiles((current) => {
              const names = new Set(current);
              normalizedFiles.forEach((file) => {
                if (file?.name) {
                  names.add(file.name);
                }
              });
              return Array.from(names).slice(0, 8);
            });
          };

          const handleFilesSelected = (event) => {
            const files = Array.from(event?.target?.files || []);
            if (!files.length) {
              return;
            }
            addAttachedFiles(files);
            if (event?.target) {
              event.target.value = "";
            }
          };

          const handleAttachmentDrop = (event) => {
            event.preventDefault();
            setIsAttachmentDragging(false);
            addAttachedFiles(event?.dataTransfer?.files || []);
          };

          const toggleConnector = (connectorId) => {
            setSelectedConnectors((current) => (
              current.includes(connectorId)
                ? current.filter((id) => id !== connectorId)
                : [...current, connectorId]
            ));
          };

          const renderTemplatePreview = (template) => {
            const previewBackground = template?.imageUrl
              ? "url('" + template.imageUrl + "') center / cover no-repeat"
              : (template?.tone || "linear-gradient(135deg, #141414, #333)");
            return React.createElement("button", {
              key: template.id,
              type: "button",
              className: "playground-imagine-template-thumb" + (template.id === activeTemplate?.id ? " is-active" : ""),
              style: { "--imagine-template-thumb-bg": previewBackground },
              onClick: () => setActiveTemplateId(template.id),
            },
              React.createElement("span", { className: "playground-imagine-template-thumb-title" }, template.title)
            );
          };

          const renderProjectSelector = () => React.createElement("section", { className: "playground-imagine-template-project-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Project"),
            React.createElement("div", {
              ref: projectSelectorRef,
              className: "playground-imagine-template-project-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-project-button" + (selectedProject ? "" : " is-empty"),
                onClick: () => setProjectSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedProject ? selectedProject.name : "None"),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              projectSelectorOpen
                ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-project-menu" },
                    React.createElement("button", {
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (!selectedProjectId ? " selected" : ""),
                      onClick: () => handleProjectSelect(""),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        !selectedProjectId
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, "None"),
                        React.createElement("span", null, "Create this image without project context")
                      )
                    ),
                    availableProjects.length
                      ? availableProjects.map((project) => React.createElement("button", {
                          key: project.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (selectedProjectId === project.id ? " selected" : ""),
                          onClick: () => handleProjectSelect(project.id),
                        },
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            selectedProjectId === project.id
                              ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                              : null
                          ),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, project.name),
                            React.createElement("span", null, "Use project strategy, files, tasks, and history")
                          )
                        ))
                      : React.createElement("div", { className: "tb-popup-row tb-popup-row-muted" },
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "No projects available")
                          )
                        )
                  )
                : null
            )
          );

          const renderAspectRatioSelector = () => React.createElement("section", { className: "playground-imagine-template-aspect-row" },
            React.createElement("div", { className: "playground-imagine-template-row-title" }, "Aspect ratio"),
            React.createElement("div", {
              ref: aspectRatioSelectorRef,
              className: "playground-imagine-template-aspect-select playground-tasks-toolbar-popup-shell",
            },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-detail-fact-button playground-imagine-template-aspect-button" + (aspectRatio ? "" : " is-empty"),
                onClick: () => setAspectRatioSelectorOpen((current) => !current),
              },
                React.createElement("span", null, selectedAspectRatioOption.label),
                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              aspectRatioSelectorOpen
                ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in playground-imagine-template-aspect-menu" },
                    aspectRatioOptions.map((option) => React.createElement("button", {
                      key: "aspect:" + (option.value || "none"),
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (aspectRatio === option.value ? " selected" : ""),
                      onClick: () => handleAspectRatioSelect(option.value),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        aspectRatio === option.value
                          ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, option.label),
                        React.createElement("span", null, option.description)
                      )
                    ))
                  )
                : null
            )
          );

          const renderSettingsBackside = () => React.createElement("div", { className: "playground-imagine-template-settings-back" },
            React.createElement("h3", { className: "playground-imagine-template-settings-back-title" }, "Image settings"),
            React.createElement("label", { className: "playground-imagine-template-field" },
              React.createElement("span", { className: "playground-imagine-template-label" }, "Image name"),
              React.createElement("input", {
                className: "playground-imagine-template-input",
                value: imageName,
                onChange: (event) => setImageName(event.target.value),
                placeholder: activeTemplate?.title || "Untitled image",
              })
            ),
            React.createElement("div", { className: "playground-imagine-template-description-area" },
              activeTemplate?.longDescription || activeTemplate?.description || "Use this template as a visual starting point and add precise direction in the composer."
            ),
            renderProjectSelector(),
            renderAspectRatioSelector(),
            React.createElement("section", { className: "playground-imagine-template-section" },
              React.createElement("div", { className: "playground-imagine-template-section-title" }, "Style"),
              React.createElement("div", { className: "playground-imagine-template-style-cards" },
                styleDirections.map((style) => React.createElement("button", {
                  key: style,
                  type: "button",
                  className: "playground-imagine-template-style-card" + (styleDirection === style ? " is-selected" : ""),
                  onClick: () => setStyleDirection(style),
                },
                  React.createElement(Paintbrush, { width: 13, height: 13, strokeWidth: 1.8 }),
                  React.createElement("span", null, style)
                ))
              )
            ),
            React.createElement("section", { className: "playground-imagine-template-section is-attachments" },
              React.createElement("div", { className: "playground-imagine-template-attachments-toolbar" },
                React.createElement("div", { className: "playground-imagine-template-section-title" }, "Attachments"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-from-computer",
                  onClick: () => fileInputRef.current?.click(),
                }, "From Computer")
              ),
              React.createElement("div", { className: "playground-imagine-template-attachments-surface" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-dropzone" + (isAttachmentDragging ? " is-dragging" : ""),
                  onClick: () => fileInputRef.current?.click(),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setIsAttachmentDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) {
                      return;
                    }
                    setIsAttachmentDragging(false);
                  },
                  onDrop: handleAttachmentDrop,
                },
                  React.createElement(ArrowUpFromLine, { width: 19, height: 19, strokeWidth: 1.8 }),
                  React.createElement("span", { className: "playground-imagine-template-dropzone-title" }, isAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                  React.createElement("span", { className: "playground-imagine-template-dropzone-copy" }, "or click to browse")
                )
              ),
              attachedFiles.length
                ? React.createElement("div", { className: "playground-imagine-template-attachments" },
                    attachedFiles.map((fileName) => React.createElement("span", { key: fileName, className: "playground-imagine-template-attachment" },
                      React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.8 }),
                      React.createElement("span", null, fileName)
                    ))
                  )
                : null
            ),
            React.createElement("section", { className: "playground-imagine-template-connectors" },
              React.createElement("div", { className: "playground-imagine-template-connectors-list" },
                connectors.map((connector) => {
                  const isSelected = selectedConnectors.includes(connector.id);
                  return React.createElement("button", {
                    key: connector.id,
                    type: "button",
                    className: "playground-imagine-template-connector-row" + (isSelected ? " is-selected" : ""),
                    onClick: () => toggleConnector(connector.id),
                  },
                    React.createElement("span", { className: "playground-imagine-template-connector-service" },
                      renderImagineConnectorIcon(connector),
                      React.createElement("span", null, connector.label)
                    ),
                    React.createElement("span", { className: "playground-imagine-template-connector-value" }, isSelected ? "Connected" : "None")
                  );
                })
              )
            )
          );

          const renderPreviewLayer = (template, className, key) => {
            if (!template) {
              return null;
            }
            if (template.imageUrl) {
              return React.createElement("img", {
                key,
                className: "playground-imagine-template-preview-image " + className,
                src: template.imageUrl,
                alt: template.title || "Image template",
              });
            }
            return React.createElement("div", {
              key,
              className: "playground-imagine-template-preview-fallback " + className,
              style: { "--imagine-template-preview-bg": template.tone || "linear-gradient(135deg, #171717, #333)" },
              "aria-label": template.title || "Image template",
            });
          };

          const renderPopupRow = ({ key, selected, label, description, onClick }) => React.createElement("button", {
            key,
            type: "button",
            className: "playground-imagine-template-popup-row" + (selected ? " is-selected" : ""),
            onClick,
          },
            React.createElement("span", { className: "tb-popup-check-slot" },
              selected
                ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                : null
            ),
            React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
              React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, label),
              description
                ? React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, description)
                : null
            )
          );

          const renderActionPopup = () => {
            if (!activeActionPopup) {
              return null;
            }
            if (activeActionPopup === "info") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, activeTemplate?.title || "Template"),
                React.createElement("p", { className: "playground-imagine-template-action-popup-copy" },
                  activeTemplate?.longDescription || activeTemplate?.description || "Use this template as visual direction for the generated image."
                )
              );
            }
            if (activeActionPopup === "attachments") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Attachments"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-popup-dropzone" + (isAttachmentDragging ? " is-dragging" : ""),
                  onClick: () => fileInputRef.current?.click(),
                  onDragOver: (event) => {
                    event.preventDefault();
                    setIsAttachmentDragging(true);
                  },
                  onDragLeave: (event) => {
                    if (event.currentTarget.contains(event.relatedTarget)) {
                      return;
                    }
                    setIsAttachmentDragging(false);
                  },
                  onDrop: handleAttachmentDrop,
                },
                  React.createElement(Paperclip, { width: 16, height: 16, strokeWidth: 1.8 }),
                  React.createElement("span", null, isAttachmentDragging ? "Drop files here" : "Attach files")
                ),
                attachedFiles.length
                  ? React.createElement("div", { className: "playground-imagine-template-popup-attachments" },
                      attachedFiles.map((fileName) => React.createElement("span", { key: fileName, className: "playground-imagine-template-attachment" },
                        React.createElement(FileText, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, fileName)
                      ))
                    )
                  : null
              );
            }
            if (activeActionPopup === "projects") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Project"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  renderPopupRow({
                    key: "project:none",
                    selected: !selectedProjectId,
                    label: "None",
                    description: "Generate without project context",
                    onClick: () => handleProjectSelect(""),
                  }),
                  availableProjects.length
                    ? availableProjects.map((project) => renderPopupRow({
                        key: "project:" + project.id,
                        selected: selectedProjectId === project.id,
                        label: project.name,
                        description: "Use strategy, tasks, files, and history",
                        onClick: () => handleProjectSelect(project.id),
                      }))
                    : React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "No projects available.")
                )
              );
            }
            if (activeActionPopup === "aspect") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Aspect ratio"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  aspectRatioOptions.map((option) => renderPopupRow({
                    key: "aspect:" + (option.value || "none"),
                    selected: aspectRatio === option.value,
                    label: option.label,
                    description: option.description,
                    onClick: () => handleAspectRatioSelect(option.value),
                  }))
                )
              );
            }
            if (activeActionPopup === "connectors") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Connectors"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  connectors.map((connector) => {
                    const isSelected = selectedConnectors.includes(connector.id);
                    return React.createElement("button", {
                      key: connector.id,
                      type: "button",
                      className: "playground-imagine-template-popup-row" + (isSelected ? " is-selected" : ""),
                      onClick: () => toggleConnector(connector.id),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isSelected
                          ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                        React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, connector.label),
                        React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, isSelected ? "Connected" : "Use as context")
                      )
                    );
                  })
                )
              );
            }
            return null;
          };

          const renderActionButton = ({ id, label, Icon, onClick, className }) => React.createElement("button", {
            key: id,
            type: "button",
            className: "playground-imagine-template-action-button" + (activeActionPopup === id ? " is-active" : "") + (className ? " " + className : ""),
            title: label,
            "aria-label": label,
            onClick: onClick || (() => setActiveActionPopup((current) => current === id ? "" : id)),
          }, React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 }));

          const activeTemplateLiked = activeTemplate?.id ? likedTemplateIds.includes(activeTemplate.id) : false;
          const renderGhostActionRail = () => React.createElement("div", {
            className: "playground-imagine-template-action-rail is-ghost",
            "aria-hidden": "true",
          },
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(Heart, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(Info, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(SlidersHorizontal, { width: 16, height: 16, strokeWidth: 1.8 })
            )
          );

          const templatePageElement = React.createElement("div", { className: "playground-imagine-template-page" },
            React.createElement("div", { className: "playground-imagine-template-shell" },
              React.createElement("main", { className: "playground-imagine-template-detail" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-back is-icon-only",
                  onClick: () => {
                    if (typeof onBack === "function") {
                      onBack();
                    }
                  },
                  "aria-label": "Back to Imagine",
                },
                  React.createElement(ArrowLeft, { width: 16, height: 16, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Back")
                ),
                normalizedTemplates.length > 1
                  ? React.createElement("div", { className: "playground-imagine-template-top-nav" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-preview-nav is-previous",
                        onClick: handleTemplatePrevious,
                        "aria-label": "Previous template",
                      }, React.createElement(ChevronLeft, { width: 18, height: 18, strokeWidth: 1.9 })),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-imagine-template-preview-nav is-next",
                        onClick: handleTemplateNext,
                        "aria-label": "Next template",
                      }, React.createElement(ChevronRight, { width: 18, height: 18, strokeWidth: 1.9 }))
                    )
                  : null,
                React.createElement("input", {
                  ref: fileInputRef,
                  className: "playground-imagine-template-file-input",
                  type: "file",
                  multiple: true,
                  onChange: handleFilesSelected,
                }),
                React.createElement("div", { className: "playground-imagine-template-main" },
                  previewTransition.previousTemplate
                    ? React.createElement("div", {
                        key: "previous:" + previewTransition.token,
                        className: "playground-imagine-template-slide-shell is-previous",
                        style: { "--imagine-template-transition-direction": previewTransition.direction },
                      },
                        React.createElement("div", { className: "playground-imagine-template-preview-frame" },
                          React.createElement("div", {
                            className: "playground-imagine-template-preview-stage",
                            style: {
                              "--imagine-template-preview-bg": previewTransition.previousTemplate?.tone || activeTemplateBackground,
                              "--imagine-template-transition-direction": previewTransition.direction,
                            },
                          },
                            React.createElement("div", { className: "playground-imagine-template-preview-media" },
                              renderPreviewLayer(previewTransition.previousTemplate, "is-current", "previous-image:" + previewTransition.token)
                            )
                          )
                        ),
                        renderGhostActionRail()
                      )
                    : null,
                  React.createElement("div", {
                    key: "current:" + (activeTemplate?.id || "") + ":" + previewTransition.token,
                    className: "playground-imagine-template-slide-shell is-current",
                    style: { "--imagine-template-transition-direction": previewTransition.direction },
                  },
                    React.createElement("div", { className: "playground-imagine-template-preview-frame" },
                      React.createElement("div", { className: "playground-imagine-template-flip-card" + (settingsFlipped ? " is-flipped" : "") },
                        React.createElement("div", { className: "playground-imagine-template-flip-inner" },
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-front" },
                            React.createElement("div", {
                              className: "playground-imagine-template-preview-stage",
                              style: {
                                "--imagine-template-preview-bg": activeTemplateBackground,
                                "--imagine-template-transition-direction": previewTransition.direction,
                              },
                            },
                              React.createElement("div", { className: "playground-imagine-template-preview-media" },
                                renderPreviewLayer(activeTemplate, "is-current", "current:" + (activeTemplate?.id || "") + ":" + previewTransition.token)
                              )
                            )
                          ),
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-back" },
                            renderSettingsBackside()
                          )
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-imagine-template-action-rail" },
                      renderActionButton({
                        id: "like",
                        label: "Like",
                        Icon: Heart,
                        className: activeTemplateLiked ? "is-liked" : "",
                        onClick: () => {
                          if (!activeTemplate?.id) {
                            return;
                          }
                          setLikedTemplateIds((current) => (
                            current.includes(activeTemplate.id)
                              ? current.filter((id) => id !== activeTemplate.id)
                              : [...current, activeTemplate.id]
                          ));
                        },
                      }),
                      renderActionButton({ id: "info", label: "Template info", Icon: Info }),
                      React.createElement("div", { className: "playground-imagine-template-action-spacer" }),
                      renderActionButton({
                        id: "edit",
                        label: settingsFlipped ? "Show image" : "Edit image settings",
                        Icon: SlidersHorizontal,
                        className: settingsFlipped ? "is-editing" : "",
                        onClick: () => {
                          setActiveActionPopup("");
                          setSettingsFlipped((current) => !current);
                        },
                      }),
                      renderActionPopup()
                    )
                  )
                ),
                React.createElement("div", { className: "playground-imagine-template-composer-wrap" },
                  React.createElement("div", { className: "playground-imagine-template-composer-shell" },
                    React.createElement(RunnerChat, {
                      key: "imagine-template-runner",
                      className: "playground-imagine-template-runner",
                      backendUrl,
                      apiKey,
                      fetchCustomSkills,
                      speechToTextUrl: speechToTextUrl || undefined,
                      requestHeaders,
                      appId: "runner-web-sdk-demo",
                      inputMode: "computer-agents",
                      computerAgents: computerAgents || undefined,
                      environments: Array.isArray(environments) ? environments : [],
                      agents: Array.isArray(agents) ? agents : [],
                      skills: Array.isArray(skills) ? skills : [],
                      skillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      projectId: selectedProjectId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: activeTemplate?.placeholder || activeTemplate?.title || "Describe an image",
                      hiddenSystemPrompt,
                      onThreadIdChange: () => {},
                      onExternalRunRequestCreate: (request) => {
                        const normalizedThreadId = String(request?.threadId || "").trim();
                        if (!normalizedThreadId || typeof onThreadStarted !== "function") {
                          return false;
                        }
                        const nextRunRequest = {
                          ...request,
                          projectId: String(request?.projectId || selectedProjectId || "").trim() || null,
                        };
                        onThreadStarted(normalizedThreadId, {
                          taskRunRequest: nextRunRequest,
                        });
                        return true;
                      },
                      onRunFinish: (_result, threadId) => {
                        const normalizedThreadId = String(threadId || "").trim();
                        if (normalizedThreadId && typeof onThreadStarted === "function") {
                          onThreadStarted(normalizedThreadId);
                        }
                      },
                      onAgentChange,
                      onEnvironmentChange,
                      onOpenPlansBudget,
                      onDocumentPreviewOpenChange: () => {},
                      onDeepResearchDetailOpenChange: () => {},
                    })
                  )
                )
              )
            )
          );
          return templatePageElement;
        }
`;
