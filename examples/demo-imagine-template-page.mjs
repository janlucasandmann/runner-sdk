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

      .playground-imagine-template-style-picker {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 6px 0;
      }

      .playground-imagine-template-style-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-imagine-template-style-manage-button {
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

      .playground-imagine-template-style-manage-button:hover {
        color: #8dc5ff;
      }

      .playground-imagine-template-style-pill-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .playground-imagine-template-style-pill {
        min-width: 0;
        min-height: 30px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.84);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px 0 10px;
        box-sizing: border-box;
        font: inherit;
        font-size: 12px;
        line-height: 1.35;
        font-weight: 500;
        cursor: pointer;
      }

      .playground-imagine-template-style-pill.is-empty {
        cursor: default;
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-imagine-template-style-pill.is-selected {
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-imagine-template-style-pill-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-imagine-template-style-pill-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-imagine-template-style-pill-remove {
        width: 18px;
        height: 18px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-style-pill-remove:hover {
        color: rgba(255, 255, 255, 0.92);
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-imagine-template-style-picker-options {
        position: absolute;
        left: 0;
        right: 0;
        top: calc(100% + 8px);
        z-index: 80;
        max-height: 232px;
        overflow: auto;
        scrollbar-width: none;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        background: rgba(31, 31, 32, 0.98);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);
        padding: 8px;
        box-sizing: border-box;
      }

      .playground-imagine-template-style-picker-options::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-style-picker-options .playground-imagine-template-style-pill {
        width: 100%;
        min-height: 34px;
        border: 0;
        border-radius: 8px;
        justify-content: flex-start;
        padding: 0 10px;
      }

      .playground-imagine-template-style-picker-options .playground-imagine-template-style-pill:hover,
      .playground-imagine-template-style-picker-options .playground-imagine-template-style-pill.is-selected {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-imagine-template-style-picker-options .tb-popup-check-slot {
        margin-left: auto;
      }

      .playground-imagine-template-asset-picker {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-imagine-template-asset-picker-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .playground-imagine-template-asset-option {
        position: relative;
        aspect-ratio: 1;
        min-width: 0;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        overflow: hidden;
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-asset-option img,
      .playground-imagine-template-asset-option video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-imagine-template-asset-option::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: rgba(0, 0, 0, 0.46);
        opacity: 1;
        transition: opacity 160ms ease;
      }

      .playground-imagine-template-asset-option.is-selected::after {
        opacity: 0;
      }

      .playground-imagine-template-asset-option-check {
        position: absolute;
        right: 7px;
        bottom: 7px;
        z-index: 2;
        width: 19px;
        height: 19px;
        border-radius: 999px;
        background: rgba(102, 166, 255, 0.96);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
      }

      .playground-imagine-template-asset-option:not(.is-selected) .playground-imagine-template-asset-option-check {
        display: none;
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

      .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .playground-imagine-template-media-controls {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        pointer-events: none;
      }

      .playground-imagine-template-media-dots,
      .playground-imagine-template-media-arrows {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        pointer-events: auto;
      }

      .playground-imagine-template-media-dot {
        width: 5px;
        height: 5px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.42);
        padding: 0;
        cursor: pointer;
      }

      .playground-imagine-template-media-dot.is-active {
        background: rgba(255, 255, 255, 0.92);
      }

      .playground-imagine-template-media-arrow {
        width: 24px;
        height: 24px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.46);
        color: rgba(255, 255, 255, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
      }

      .playground-imagine-template-media-arrow:hover,
      .playground-imagine-template-media-dot:hover {
        background: rgba(255, 255, 255, 0.18);
      }

      .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-video.is-current {
        animation: playgroundImagineTemplatePreviewIn 280ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-video.is-previous {
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
        padding: 0;
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
        width: var(--imagine-template-main-width, min(56rem, calc(100% - 144px)));
        height: var(--imagine-template-main-height, min(68vh, calc(100% - 170px)));
        max-width: none;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
      }

      .playground-imagine-template-preview-frame {
        position: relative;
        width: 100%;
        height: 100%;
        max-height: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .playground-imagine-template-preview-stage {
        position: relative;
        width: 100%;
        height: 100%;
        max-height: none;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
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
        animation: playgroundImagineTemplateSlideIn 460ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell.is-static {
        z-index: 2;
        animation: none;
      }

      .playground-imagine-template-slide-shell.is-previous {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        animation: playgroundImagineTemplateSlideOut 460ms cubic-bezier(0.2, 0.85, 0.22, 1) both;
      }

      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none;
      }

      @keyframes playgroundImagineTemplateSlideIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * 112%));
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
          transform: translateX(calc(var(--imagine-template-transition-direction, 1) * -112%));
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
      .playground-imagine-template-preview-video,
      .playground-imagine-template-preview-fallback {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
        border-radius: inherit;
      }

      .playground-imagine-template-preview-fallback {
        background: var(--imagine-template-preview-bg, linear-gradient(135deg, #171717, #333));
      }

      .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-preview-fallback.is-current {
        animation: playgroundImagineTemplatePreviewInY 320ms ease both;
      }

      .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-video.is-previous,
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
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-current,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-slide-shell .playground-imagine-template-preview-fallback.is-previous {
        animation: none !important;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback {
        position: absolute;
        inset: 0;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image.is-current,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video.is-current,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback.is-current {
        z-index: 2;
        animation: playgroundImagineTemplateDetailAssetIn 240ms ease both !important;
      }

      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-image.is-previous,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-video.is-previous,
      .playground-imagine-template-preview-media.is-asset-transitioning .playground-imagine-template-preview-fallback.is-previous {
        z-index: 1;
        animation: playgroundImagineTemplateDetailAssetOut 240ms ease both !important;
      }

      @keyframes playgroundImagineTemplateDetailAssetIn {
        from {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * 112%));
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes playgroundImagineTemplateDetailAssetOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }

        to {
          opacity: 0;
          transform: translateX(calc(var(--imagine-template-asset-direction, 1) * -112%));
        }
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
        color: #fff;
      }

      .playground-imagine-template-action-button.is-liked svg {
        fill: #fff;
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

      .playground-imagine-template-popup-row.is-danger {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-imagine-template-popup-row.is-danger:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.98);
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

      .playground-imagine-template-popup-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      .playground-imagine-template-popup-button {
        min-width: 72px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        padding: 0 12px;
        font: inherit;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-imagine-template-popup-button.is-primary {
        background: #fff;
        color: #000;
      }

      .playground-imagine-template-popup-button.is-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-imagine-template-popup-button:disabled {
        opacity: 0.48;
        cursor: default;
      }

      .playground-imagine-template-popup-error {
        margin: 8px 0 0;
        color: rgba(255, 170, 170, 0.92);
        font-size: 11px;
        line-height: 1.35;
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
        padding: 0;
      }

      .playground-imagine-template-main {
        position: absolute;
        top: var(--imagine-template-main-top, 24px);
        left: 50%;
        z-index: 4;
        width: var(--imagine-template-main-width, min(56rem, calc(100% - 144px)));
        height: var(--imagine-template-main-height, min(68vh, calc(100% - 170px)));
        max-height: none;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
        max-width: none;
        min-width: 0;
        transform: translateX(-50%);
      }

      .playground-imagine-template-preview-frame,
      .playground-imagine-template-flip-card,
      .playground-imagine-template-flip-inner {
        width: 100%;
        height: 100%;
        aspect-ratio: var(--imagine-template-detail-aspect-ratio, 4 / 3);
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
        gap: 12px;
      }

      .playground-imagine-template-settings-back::-webkit-scrollbar {
        display: none;
      }

      .playground-imagine-template-settings-back-title {
        width: 100%;
        flex: 0 0 auto;
        box-sizing: border-box;
        margin: 0;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        line-height: 1.2;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-attachments-toolbar {
        margin-top: 12px;
        margin-bottom: 12px;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-attachments-surface,
      .playground-imagine-template-settings-back .playground-imagine-template-dropzone {
        min-height: 132px;
      }

      .playground-imagine-template-settings-back .playground-imagine-template-connectors-list {
        column-gap: 18px;
      }

      .playground-imagine-template-action-button.is-editing {
        background: rgba(255, 255, 255, 0.1);
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
        .playground-imagine-template-main {
          width: var(--imagine-template-main-width, min(82vw, 640px));
          max-width: none;
        }

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
          padding: 0;
        }

        .playground-imagine-template-main {
          width: var(--imagine-template-main-width, calc(100% - 96px));
          max-width: none;
        }

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
        function normalizePlaygroundImagineTemplatePageAssets(template) {
          const normalizedAssets = [];
          const pushAsset = (asset) => {
            if (!asset) {
              return;
            }
            const url = String(asset.url || asset.imageUrl || asset.videoUrl || "").trim();
            if (!url) {
              return;
            }
            const explicitType = String(asset.type || asset.mediaType || "").toLowerCase();
            const type = explicitType === "video" || /\.(mp4|webm|mov)(?:[?#].*)?$/i.test(url) ? "video" : "image";
            normalizedAssets.push({
              ...asset,
              url,
              type,
              title: String(asset.title || template?.title || "").trim(),
              aspectRatio: String(asset.aspectRatio || template?.aspectRatio || "").trim(),
            });
          };
          (Array.isArray(template?.assets) ? template.assets : []).forEach(pushAsset);
          (Array.isArray(template?.mediaItems) ? template.mediaItems : []).forEach(pushAsset);
          if (!normalizedAssets.length) {
            const imageUrl = String(template?.imageUrl || "").trim();
            const videoUrl = String(template?.videoUrl || "").trim();
            if (imageUrl) {
              pushAsset({ type: "image", url: imageUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            } else if (videoUrl) {
              pushAsset({ type: "video", url: videoUrl, title: template?.title, aspectRatio: template?.aspectRatio });
            }
          }
          return normalizedAssets;
        }

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
          mediaMode,
          fetchCustomSkills,
          onThreadStarted,
          onMediaModeChange,
          onAgentChange,
          onEnvironmentChange,
          onOpenPlansBudget,
          onEditTemplate,
          onDeleteTemplate,
          favouriteTemplateIds,
          onToggleFavouriteTemplate,
          canGenerateVideo = true,
          onUpgradeToIndividual,
          onBack,
        }) {
          const normalizedTemplates = useMemo(() => Array.isArray(templates) ? templates : [], [templates]);
          const [activeTemplateId, setActiveTemplateId] = useState(String(initialTemplateId || "").trim());
          const [templateWindowStart, setTemplateWindowStart] = useState(0);
          const [imageName, setImageName] = useState("");
          const [selectedConnectors, setSelectedConnectors] = useState([]);
          const [fileBrowserRequest, setFileBrowserRequest] = useState(null);
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
          const [selectedStyleIds, setSelectedStyleIds] = useState([]);
          const [activeActionPopup, setActiveActionPopup] = useState("");
          const [shareTeams, setShareTeams] = useState([]);
          const [shareTeamId, setShareTeamId] = useState("");
          const [shareLoading, setShareLoading] = useState(false);
          const [shareError, setShareError] = useState("");
          const [localLikedTemplateIds, setLocalLikedTemplateIds] = useState([]);
          const [activeTemplateAssetIndex, setActiveTemplateAssetIndex] = useState(0);
          const [activeTemplateAssetDirection, setActiveTemplateAssetDirection] = useState(1);
          const [activeTemplateAssetTransition, setActiveTemplateAssetTransition] = useState({
            previousIndex: null,
            direction: 1,
            token: 0,
          });
          const [selectedTemplateAssetKeys, setSelectedTemplateAssetKeys] = useState([]);
          const [settingsFlipped, setSettingsFlipped] = useState(false);
          const [stylePickerOpen, setStylePickerOpen] = useState(false);
          const [videoUpgradeModalOpen, setVideoUpgradeModalOpen] = useState(false);
          const [videoUpgradeCheckoutLoading, setVideoUpgradeCheckoutLoading] = useState(false);
          const fileInputRef = useRef(null);
          const projectSelectorRef = useRef(null);
          const aspectRatioSelectorRef = useRef(null);
          const stylePickerRef = useRef(null);
          const previewTransitionTimeoutRef = useRef(null);
          const assetTransitionTimeoutRef = useRef(null);
          const detailRef = useRef(null);
          const composerWrapRef = useRef(null);
          const [previewSize, setPreviewSize] = useState({ width: 0, height: 0, top: 24 });
          const imagineTemplateModelStorageKey = "runner_demo_imagine_model_settings_v1";
          const imagineTemplateImageModelOptions = useMemo(() => [
            {
              id: "gpt-image-2",
              label: "GPT Image 2",
              description: "Highest-fidelity OpenAI image generation and editing.",
            },
            {
              id: "gemini-3.1-flash-image-preview",
              label: "Gemini 3.1 Flash Image",
              description: "Fast multimodal image generation and editing preview.",
            },
          ], []);
          const imagineTemplateVideoModelOptions = useMemo(() => [
            {
              id: "seedance-2.0-fast",
              label: "Seedance 2.0 Fast",
              description: "Fast default video drafts and short motion clips.",
            },
            {
              id: "seedance-2.0",
              label: "Seedance 2.0",
              description: "Higher-quality Seedance video generation.",
            },
            {
              id: "grok-imagine-video",
              label: "Grok Imagine Video",
              description: "Alternative video model for imaginative motion.",
            },
          ], []);
          const normalizeImagineTemplateModelId = (mode, modelId) => {
            const options = String(mode || "") === "video" ? imagineTemplateVideoModelOptions : imagineTemplateImageModelOptions;
            const normalizedModelId = String(modelId || "").trim();
            return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
          };
          const readStoredImagineTemplateModelSettings = () => {
            if (typeof window === "undefined" || !window.localStorage) {
              return {};
            }
            try {
              const parsed = JSON.parse(window.localStorage.getItem(imagineTemplateModelStorageKey) || "{}");
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch (_error) {
              return {};
            }
          };
          const storedImagineTemplateModelSettings = readStoredImagineTemplateModelSettings();
          const [selectedImagineTemplateImageModelId, setSelectedImagineTemplateImageModelId] = useState(() =>
            normalizeImagineTemplateModelId("image", storedImagineTemplateModelSettings.image || skillDefaults?.imageGeneration?.model || "gpt-image-2")
          );
          const [selectedImagineTemplateVideoModelId, setSelectedImagineTemplateVideoModelId] = useState(() =>
            normalizeImagineTemplateModelId("video", storedImagineTemplateModelSettings.video || skillDefaults?.videoGeneration?.model || "seedance-2.0-fast")
          );
          const [imagineTemplateModelSelectorOpen, setImagineTemplateModelSelectorOpen] = useState(false);
          const imagineTemplateModelSelectorRef = useRef(null);

          useEffect(() => {
            const nextTemplateId = String(initialTemplateId || "").trim();
            if (nextTemplateId) {
              setActiveTemplateId(nextTemplateId);
            }
          }, [initialTemplateId]);

          const activeTemplate = useMemo(() => {
            return normalizedTemplates.find((template) => template.id === activeTemplateId) || normalizedTemplates[0] || null;
          }, [activeTemplateId, normalizedTemplates]);
          const canUseVideoGeneration = canGenerateVideo !== false;
          const rawActiveMediaMode = String(mediaMode || "").toLowerCase() === "video" ? "video" : "image";
          const activeMediaMode = rawActiveMediaMode === "video" && !canUseVideoGeneration ? "image" : rawActiveMediaMode;
          const activeImagineTemplateModelOptions = activeMediaMode === "video" ? imagineTemplateVideoModelOptions : imagineTemplateImageModelOptions;
          const selectedImagineTemplateImageModel = imagineTemplateImageModelOptions.find((option) => option.id === selectedImagineTemplateImageModelId) || imagineTemplateImageModelOptions[0];
          const selectedImagineTemplateVideoModel = imagineTemplateVideoModelOptions.find((option) => option.id === selectedImagineTemplateVideoModelId) || imagineTemplateVideoModelOptions[0];
          const selectedImagineTemplateModel = activeMediaMode === "video" ? selectedImagineTemplateVideoModel : selectedImagineTemplateImageModel;
          const imagineTemplateSkillDefaults = useMemo(() => {
            const source = skillDefaults && typeof skillDefaults === "object" ? skillDefaults : {};
            const imageGeneration = source.imageGeneration && typeof source.imageGeneration === "object" ? source.imageGeneration : {};
            const videoGeneration = source.videoGeneration && typeof source.videoGeneration === "object" ? source.videoGeneration : {};
            return {
              ...source,
              imageGeneration: {
                ...imageGeneration,
                model: selectedImagineTemplateImageModel.id,
              },
              videoGeneration: {
                ...videoGeneration,
                model: selectedImagineTemplateVideoModel.id,
              },
            };
          }, [selectedImagineTemplateImageModel.id, selectedImagineTemplateVideoModel.id, skillDefaults]);
          const imagineTemplateRunnerSkills = useMemo(() => {
            const sourceSkills = Array.isArray(skills) ? skills : [];
            return sourceSkills.map((skill) => {
              const normalizedSkillId = String(skill?.id || skill?.name || "").trim().toLowerCase();
              if (
                normalizedSkillId === "video_generation"
                || normalizedSkillId === "video-generation"
                || normalizedSkillId === "videogeneration"
                || normalizedSkillId.includes("video-generation")
              ) {
                return { ...skill, enabled: canUseVideoGeneration };
              }
              return skill;
            });
          }, [skills, canUseVideoGeneration]);

          useEffect(() => {
            if (!canUseVideoGeneration && rawActiveMediaMode === "video" && typeof onMediaModeChange === "function") {
              onMediaModeChange("image");
            }
          }, [canUseVideoGeneration, rawActiveMediaMode, onMediaModeChange]);

          const normalizedFavouriteTemplateIds = useMemo(() => {
            if (!Array.isArray(favouriteTemplateIds)) {
              return [];
            }
            return Array.from(new Set(favouriteTemplateIds.map((id) => String(id || "").trim()).filter(Boolean)));
          }, [favouriteTemplateIds]);

          const likedTemplateIds = typeof onToggleFavouriteTemplate === "function"
            ? normalizedFavouriteTemplateIds
            : localLikedTemplateIds;

          useEffect(() => {
            if (activeActionPopup !== "share-template") {
              return undefined;
            }
            let cancelled = false;
            const loadShareTeams = async () => {
              const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
              if (!normalizedBackendUrl) {
                if (!cancelled) {
                  setShareTeams([]);
                  setShareError("Team sharing is unavailable in this session.");
                }
                return;
              }
              setShareLoading(true);
              setShareError("");
              try {
                const headers = new Headers(requestHeaders || {});
                if (apiKey) {
                  headers.set("X-API-Key", apiKey);
                }
                const response = await fetch(normalizedBackendUrl + "/teams", {
                  method: "GET",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load teams.");
                }
                const teams = Array.isArray(data?.data) ? data.data : [];
                if (!cancelled) {
                  setShareTeams(teams);
                  setShareTeamId((current) => {
                    if (current && teams.some((team) => String(team?.id || "") === current)) {
                      return current;
                    }
                    return teams[0]?.id ? String(teams[0].id) : "";
                  });
                }
              } catch (error) {
                if (!cancelled) {
                  setShareTeams([]);
                  setShareError(error instanceof Error ? error.message : "Failed to load teams.");
                }
              } finally {
                if (!cancelled) {
                  setShareLoading(false);
                }
              }
            };
            void loadShareTeams();
            return () => {
              cancelled = true;
            };
          }, [activeActionPopup, apiKey, backendUrl, requestHeaders]);

          useEffect(() => {
            return () => {
              if (previewTransitionTimeoutRef.current) {
                clearTimeout(previewTransitionTimeoutRef.current);
              }
              if (assetTransitionTimeoutRef.current) {
                clearTimeout(assetTransitionTimeoutRef.current);
              }
            };
          }, []);

          useEffect(() => {
            if (typeof window === "undefined" || !window.localStorage) {
              return;
            }
            try {
              const current = readStoredImagineTemplateModelSettings();
              window.localStorage.setItem(imagineTemplateModelStorageKey, JSON.stringify({
                ...current,
                image: selectedImagineTemplateImageModel.id,
                video: selectedImagineTemplateVideoModel.id,
              }));
            } catch (_error) {}
          }, [selectedImagineTemplateImageModel.id, selectedImagineTemplateVideoModel.id]);

          useEffect(() => {
            if (!imagineTemplateModelSelectorOpen || typeof document === "undefined") {
              return;
            }
            const handlePointerDown = (event) => {
              const target = event.target;
              if (imagineTemplateModelSelectorRef.current && target && imagineTemplateModelSelectorRef.current.contains(target)) {
                return;
              }
              setImagineTemplateModelSelectorOpen(false);
            };
            const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                setImagineTemplateModelSelectorOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            document.addEventListener("touchstart", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
              document.removeEventListener("touchstart", handlePointerDown);
              document.removeEventListener("keydown", handleKeyDown);
            };
          }, [imagineTemplateModelSelectorOpen]);

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

          useEffect(() => {
            if (!stylePickerOpen) {
              return undefined;
            }
            const handlePointerDown = (event) => {
              if (stylePickerRef.current && !stylePickerRef.current.contains(event.target)) {
                setStylePickerOpen(false);
              }
            };
            document.addEventListener("mousedown", handlePointerDown);
            return () => {
              document.removeEventListener("mousedown", handlePointerDown);
            };
          }, [stylePickerOpen]);

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

          const styleOptions = useMemo(() => [
            { id: "professional", label: "Professional", Icon: Award },
            { id: "editorial", label: "Editorial", Icon: Camera },
            { id: "premium", label: "Premium", Icon: Sparkles },
            { id: "minimal", label: "Minimal", Icon: Minus },
            { id: "cinematic", label: "Cinematic", Icon: Film },
            { id: "studio", label: "Studio", Icon: Crop },
            { id: "lifestyle", label: "Lifestyle", Icon: User },
            { id: "bold", label: "Bold", Icon: Flame },
            { id: "playful", label: "Playful", Icon: Wand2 },
            { id: "technical", label: "Technical", Icon: Code2 },
            { id: "data-driven", label: "Data-driven", Icon: ChartNoAxesColumnIncreasing },
            { id: "product", label: "Product", Icon: Package },
            { id: "social", label: "Social", Icon: MessageCircle },
            { id: "exploratory", label: "Exploratory", Icon: Telescope },
          ], []);
          const selectedStyleOptions = useMemo(() => {
            const selectedSet = new Set(selectedStyleIds);
            return styleOptions.filter((option) => selectedSet.has(option.id));
          }, [selectedStyleIds, styleOptions]);
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

          useEffect(() => {
            if (!activeTemplate) {
              return;
            }
            const knownStyleIds = new Set(styleOptions.map((option) => option.id));
            const templateDefaults = Array.isArray(activeTemplate.defaultStyles)
              ? activeTemplate.defaultStyles
                  .map((styleId) => String(styleId || "").trim())
                  .filter((styleId) => knownStyleIds.has(styleId))
              : [];
            setSelectedStyleIds(templateDefaults.length ? templateDefaults : ["professional"]);
            const knownAspectRatios = new Set(aspectRatioOptions.map((option) => option.value));
            const templateDefaultAspectRatio = String(activeTemplate.defaultAspectRatio || "").trim();
            setAspectRatio(knownAspectRatios.has(templateDefaultAspectRatio) ? templateDefaultAspectRatio : "");
            setStylePickerOpen(false);
            setAspectRatioSelectorOpen(false);
          }, [activeTemplate?.id, aspectRatioOptions, styleOptions]);

          const activeTemplateAssets = useMemo(() => normalizePlaygroundImagineTemplatePageAssets(activeTemplate), [activeTemplate]);
          const normalizedActiveTemplateAssetIndex = activeTemplateAssets.length
            ? Math.max(0, Math.min(activeTemplateAssetIndex, activeTemplateAssets.length - 1))
            : 0;
          const activeTemplatePrimaryAsset = activeTemplateAssets[normalizedActiveTemplateAssetIndex] || activeTemplateAssets[0] || null;
          const getActiveTemplateAssetKey = useCallback((asset, assetIndex) => String(assetIndex) + ":" + String(asset?.url || ""), []);
          const selectedTemplateAssets = useMemo(() => {
            const selectedKeys = new Set(selectedTemplateAssetKeys);
            const selectedAssets = activeTemplateAssets.filter((asset, assetIndex) => selectedKeys.has(getActiveTemplateAssetKey(asset, assetIndex)));
            return selectedAssets.length ? selectedAssets : activeTemplateAssets;
          }, [activeTemplateAssets, getActiveTemplateAssetKey, selectedTemplateAssetKeys]);
          const setActiveTemplateAsset = useCallback((nextIndex, direction) => {
            if (activeTemplateAssets.length <= 1) {
              return;
            }
            const normalizedIndex = ((Number(nextIndex) || 0) + activeTemplateAssets.length) % activeTemplateAssets.length;
            if (normalizedIndex === normalizedActiveTemplateAssetIndex) {
              return;
            }
            const normalizedDirection = Number(direction || 0) < 0 ? -1 : (Number(direction || 0) > 0 ? 1 : (normalizedIndex >= normalizedActiveTemplateAssetIndex ? 1 : -1));
            if (assetTransitionTimeoutRef.current) {
              clearTimeout(assetTransitionTimeoutRef.current);
            }
            setActiveTemplateAssetDirection(normalizedDirection);
            setActiveTemplateAssetTransition({
              previousIndex: normalizedActiveTemplateAssetIndex,
              direction: normalizedDirection,
              token: Date.now(),
            });
            setActiveTemplateAssetIndex(normalizedIndex);
            assetTransitionTimeoutRef.current = setTimeout(() => {
              setActiveTemplateAssetTransition((current) => ({
                ...current,
                previousIndex: null,
              }));
            }, 300);
          }, [activeTemplateAssets.length, normalizedActiveTemplateAssetIndex]);
          const activeTemplateBackground = activeTemplatePrimaryAsset?.type === "image"
            ? "url('" + activeTemplatePrimaryAsset.url + "') center / cover no-repeat"
            : (activeTemplate?.tone || "linear-gradient(135deg, #141414, #333)");
          const activeTemplateAspectRatio = String(activeTemplatePrimaryAsset?.aspectRatio || activeTemplate?.aspectRatio || "4 / 3").replace(":", " / ");
          const activeTemplateAspectRatioNumber = useMemo(() => {
            const ratioText = String(activeTemplateAspectRatio || "4 / 3");
            const parts = ratioText.split("/").map((part) => Number(String(part || "").trim()));
            const width = parts[0];
            const height = parts[1];
            if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
              return width / height;
            }
            return 4 / 3;
          }, [activeTemplateAspectRatio]);

          useEffect(() => {
            setActiveTemplateAssetIndex(0);
            setActiveTemplateAssetDirection(1);
            setActiveTemplateAssetTransition({
              previousIndex: null,
              direction: 1,
              token: 0,
            });
          }, [activeTemplate?.id]);

          useEffect(() => {
            setSelectedTemplateAssetKeys(activeTemplateAssets.map((asset, assetIndex) => getActiveTemplateAssetKey(asset, assetIndex)));
          }, [activeTemplate?.id, activeTemplateAssets, getActiveTemplateAssetKey]);

          useLayoutEffect(() => {
            const detailNode = detailRef.current;
            const composerNode = composerWrapRef.current;
            if (!detailNode || !composerNode) {
              return undefined;
            }

            let frameId = 0;
            const updatePreviewSize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                const detailRect = detailNode.getBoundingClientRect();
                const composerRect = composerNode.getBoundingClientRect();
                if (!detailRect.width || !detailRect.height) {
                  return;
                }

                const topMargin = 24;
                const bottomGap = 24;
                const composerTop = Math.max(0, composerRect.top - detailRect.top);
                const availableHeight = Math.max(180, composerTop - topMargin - bottomGap);
                const composerWidth = composerRect.width || Math.min(896, Math.max(0, detailRect.width - 64));
                const availableWidth = Math.max(180, Math.min(composerWidth, detailRect.width - 132));
                const safeRatio = Number.isFinite(activeTemplateAspectRatioNumber) && activeTemplateAspectRatioNumber > 0
                  ? activeTemplateAspectRatioNumber
                  : 4 / 3;
                let nextWidth = Math.min(availableWidth, availableHeight * safeRatio);
                let nextHeight = nextWidth / safeRatio;
                if (nextHeight > availableHeight) {
                  nextHeight = availableHeight;
                  nextWidth = nextHeight * safeRatio;
                }

                nextWidth = Math.max(180, Math.floor(nextWidth));
                nextHeight = Math.max(180, Math.floor(nextHeight));
                const nextTop = Math.max(topMargin, Math.floor(topMargin + ((availableHeight - nextHeight) / 2)));
                setPreviewSize((current) => (
                  Math.abs(current.width - nextWidth) > 1 || Math.abs(current.height - nextHeight) > 1 || Math.abs(current.top - nextTop) > 1
                    ? { width: nextWidth, height: nextHeight, top: nextTop }
                    : current
                ));
              });
            };

            updatePreviewSize();
            window.addEventListener("resize", updatePreviewSize);
            let detailObserver = null;
            let composerObserver = null;
            if (typeof ResizeObserver !== "undefined") {
              detailObserver = new ResizeObserver(updatePreviewSize);
              composerObserver = new ResizeObserver(updatePreviewSize);
              detailObserver.observe(detailNode);
              composerObserver.observe(composerNode);
            }

            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              window.removeEventListener("resize", updatePreviewSize);
              if (detailObserver) {
                detailObserver.disconnect();
              }
              if (composerObserver) {
                composerObserver.disconnect();
              }
            };
          }, [activeTemplateAspectRatioNumber]);

          const selectedConnectorLabels = connectors
            .filter((connector) => selectedConnectors.includes(connector.id))
            .map((connector) => connector.label);

          const imagineTemplateReferenceAttachments = useMemo(() => {
            if (!activeTemplate || !selectedTemplateAssets.length) {
              return [];
            }
            const safeTitle = String(activeTemplate.title || "template")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || "template";
            return selectedTemplateAssets.map((asset, assetIndex) => {
              const referenceUrl = String(asset?.url || "").trim();
              const isVideoReference = asset?.type === "video";
              const extensionMatch = referenceUrl.match(/\.([a-z0-9]+)(?:[?#].*)?$/i);
              const rawExtension = String(extensionMatch?.[1] || (isVideoReference ? "mp4" : "webp")).toLowerCase();
              const normalizedExtension = rawExtension === "jpg" ? "jpeg" : rawExtension;
              const mimeType = isVideoReference
                ? (normalizedExtension === "webm" ? "video/webm" : "video/mp4")
                : (
                    normalizedExtension === "jpeg" || normalizedExtension === "png" || normalizedExtension === "webp" || normalizedExtension === "avif"
                      ? "image/" + normalizedExtension
                      : "image/webp"
                  );
              const fileExtension = normalizedExtension === "jpeg" ? "jpg" : normalizedExtension;
              const suffix = selectedTemplateAssets.length > 1 ? "-" + String(assetIndex + 1).padStart(2, "0") : "";
              return {
                url: referenceUrl,
                filename: "imagine-template-" + safeTitle + suffix + "." + fileExtension,
                mimeType,
                type: isVideoReference ? "video" : "image",
                runnerAttachmentRole: "imagine_template_reference",
              };
            });
          }, [activeTemplate, selectedTemplateAssets]);

          const imagineTemplateReferenceSummary = imagineTemplateReferenceAttachments.map((attachment) => attachment.filename).join(", ");
          const imagineTemplateReferenceLabel = imagineTemplateReferenceAttachments.length > 1
            ? String(imagineTemplateReferenceAttachments.length) + " selected template references"
            : "the selected template reference";
          const selectedAspectRatioLabel = aspectRatio || "No fixed aspect ratio";
          const preferredGenerationAspectRatio = aspectRatio || String(activeTemplate?.aspectRatio || "").trim() || "infer from the template media";
          const outputName = String(imageName || "").trim() || (activeTemplate?.title || "Generated image");
          const safeOutputSlug = outputName
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase() || "generated-image";
          const multiAssetTemplateOutputDirectory = "/workspace/imagine/" + safeOutputSlug;
          const selectedStyleLabels = selectedStyleOptions.map((option) => option.label).join(", ");

          const setActiveTemplateMediaMode = useCallback((nextMode) => {
            const normalizedNextMode = String(nextMode || "").toLowerCase() === "video" ? "video" : "image";
            if (normalizedNextMode === "video" && !canUseVideoGeneration) {
              setVideoUpgradeModalOpen(true);
              return;
            }
            if (typeof onMediaModeChange === "function") {
              onMediaModeChange(normalizedNextMode);
            }
          }, [canUseVideoGeneration, onMediaModeChange]);

          const selectImagineTemplateModel = (modelId) => {
            const normalizedModelId = normalizeImagineTemplateModelId(activeMediaMode, modelId);
            if (activeMediaMode === "video") {
              setSelectedImagineTemplateVideoModelId(normalizedModelId);
            } else {
              setSelectedImagineTemplateImageModelId(normalizedModelId);
            }
            setImagineTemplateModelSelectorOpen(false);
          };

          const renderImagineTemplateMediaModeSwitch = () =>
            React.createElement("div", { className: "playground-imagine-media-switch", role: "group", "aria-label": "Generation type" },
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-media-switch-button" + (activeMediaMode === "image" ? " is-active" : ""),
                onClick: () => setActiveTemplateMediaMode("image"),
              }, "Image"),
              React.createElement("button", {
                type: "button",
                className: "playground-imagine-media-switch-button" + (activeMediaMode === "video" ? " is-active" : ""),
                onClick: () => setActiveTemplateMediaMode("video"),
              }, "Video")
            );

          const renderImagineTemplateModelSelector = () =>
            React.createElement("div", { ref: imagineTemplateModelSelectorRef, className: "tb-selector-anchor playground-imagine-model-selector" },
              React.createElement("button", {
                type: "button",
                className: "tb-inline-selector tb-inline-selector-agent" + (imagineTemplateModelSelectorOpen ? " active" : ""),
                onClick: () => setImagineTemplateModelSelectorOpen((open) => !open),
                "aria-haspopup": "menu",
                "aria-expanded": imagineTemplateModelSelectorOpen ? "true" : "false",
              },
                React.createElement("span", null, selectedImagineTemplateModel.label),
                React.createElement(ChevronDown, { className: "tb-inline-selector-chevron", strokeWidth: 1.8 })
              ),
              imagineTemplateModelSelectorOpen
                ? React.createElement("div", { className: "tb-popup-menu tb-popup-menu-inline tb-popup-menu-inline-agent playground-tasks-toolbar-popup-menu-animate-up-in playground-imagine-model-menu" },
                    React.createElement("div", { className: "tb-popup-menu-title" }, activeMediaMode === "video" ? "Video model" : "Image model"),
                    React.createElement("div", { className: "tb-popup-menu-inline-body tb-popup-menu-inline-body-agent" },
                      activeImagineTemplateModelOptions.map((option) =>
                        React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (option.id === selectedImagineTemplateModel.id ? " selected" : ""),
                          onClick: () => selectImagineTemplateModel(option.id),
                        },
                          React.createElement(activeMediaMode === "video" ? Film : ImageIcon, { className: "tb-popup-icon", strokeWidth: 1.8 }),
                          React.createElement("span", { className: "playground-imagine-model-option-copy" },
                            React.createElement("span", { className: "playground-imagine-model-option-title" }, option.label),
                            React.createElement("span", { className: "playground-imagine-model-option-description" }, option.description)
                          ),
                          React.createElement("span", { className: "tb-popup-check-slot" },
                            option.id === selectedImagineTemplateModel.id
                              ? React.createElement(Check, { className: "tb-popup-check", strokeWidth: 1.8 })
                              : null
                          )
                        )
                      )
                    )
                  )
                : null
            );

          const handleVideoUpgradeCheckout = useCallback(async () => {
            if (typeof onUpgradeToIndividual !== "function") {
              return;
            }
            setVideoUpgradeCheckoutLoading(true);
            try {
              await Promise.resolve(onUpgradeToIndividual());
            } finally {
              setVideoUpgradeCheckoutLoading(false);
            }
          }, [onUpgradeToIndividual]);

          const renderImagineTemplateVideoUpgradeModal = () => {
            if (!videoUpgradeModalOpen) {
              return null;
            }
            return React.createElement("div", {
              className: "playground-calendar-upgrade-backdrop",
              onClick: () => setVideoUpgradeModalOpen(false),
            },
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain playground-calendar-upgrade-close",
                "aria-label": "Close video generation upgrade prompt",
                onClick: () => setVideoUpgradeModalOpen(false),
              }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 })),
              React.createElement("div", {
                className: "playground-calendar-upgrade-shell",
                onClick: (event) => event.stopPropagation(),
              },
                React.createElement("div", { className: "playground-calendar-upgrade-pill" }, "Video generation"),
                React.createElement("h2", { className: "playground-calendar-upgrade-headline" },
                  "Try Individual for ",
                  React.createElement("span", { className: "playground-calendar-upgrade-headline-price" }, "$0"),
                  " for 14 days"
                ),
                React.createElement("div", { className: "playground-calendar-upgrade-modal" },
                  React.createElement("div", { className: "playground-calendar-upgrade-modal-top" },
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-header" },
                      React.createElement("div", { className: "playground-calendar-upgrade-modal-title" }, "Individual"),
                      React.createElement("div", { className: "playground-calendar-upgrade-modal-offer" }, "14 day trial")
                    ),
                    React.createElement("p", { className: "playground-calendar-upgrade-modal-copy" },
                      "Video generation is available on paid plans because it uses premium video models and Compute Tokens."
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-calendar-upgrade-modal-button",
                      onClick: () => void handleVideoUpgradeCheckout(),
                      disabled: videoUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function",
                    }, videoUpgradeCheckoutLoading ? "Opening checkout..." : "Try Individual free")
                  )
                )
              )
            );
          };

          const hiddenSystemPrompt = [
            "You are running inside Computer Agents Imagine template mode. Treat this as a visual generation workflow, not a general chat.",
            imagineTemplateReferenceAttachments.length
              ? "The selected Imagine template reference asset" + (imagineTemplateReferenceAttachments.length > 1 ? "s are" : " is") + " attached to this turn as " + imagineTemplateReferenceSummary + ". " + (imagineTemplateReferenceAttachments.length > 1 ? "They are the primary visual references" : "It is the primary visual reference") + " and must appear above the user message as normal attachment" + (imagineTemplateReferenceAttachments.length > 1 ? "s." : ".")
              : "",
            imagineTemplateReferenceAttachments.length
              ? "Use the exact /workspace/uploads/... paths listed for " + imagineTemplateReferenceLabel + " in the attachment system prompt. Do not guess uploaded paths."
              : "",
            activeMediaMode === "video"
              ? "The user is creating a video. Use the Video Generation skill when possible and save generated videos into /workspace/generated_videos."
              : "The user is creating an image. Do not produce video unless the user switches this Imagine request to video or explicitly asks for video.",
            activeMediaMode === "video"
              ? "Selected video model: " + selectedImagineTemplateVideoModel.id + " (" + selectedImagineTemplateVideoModel.label + "). Include --model " + selectedImagineTemplateVideoModel.id + " when calling the video generation script unless the user explicitly asks for another model."
              : "Selected image model: " + selectedImagineTemplateImageModel.id + " (" + selectedImagineTemplateImageModel.label + "). Include --model " + selectedImagineTemplateImageModel.id + " when calling the image generation script unless the user explicitly asks for another model.",
            activeMediaMode === "video"
              ? "Generate exactly one final video for this Imagine request. Do not create variations, alternates, or run a second generate-video.py call after a video has been saved."
              : "",
            activeTemplate ? "Selected template: " + activeTemplate.title + "." : "",
            activeTemplate ? "Template direction: " + activeTemplate.prompt + "." : "",
            activeTemplate?.description ? "Template description: " + activeTemplate.description : "",
            selectedTemplateAssets.length > 1
              ? "Multi-asset output organization: create one dedicated directory inside the Imagine local workspace at " + multiAssetTemplateOutputDirectory + " and place every generated resource for this thread there. If a generation tool initially saves output elsewhere, copy or move the final deliverables into this directory before summarizing the result."
              : "",
            "Output name: " + outputName + ".",
            "Aspect ratio setting: " + selectedAspectRatioLabel + ". Generation aspect ratio: " + preferredGenerationAspectRatio + ".",
            selectedStyleOptions.length
              ? "Style direction: " + selectedStyleLabels + "."
              : "Style direction: no explicit style selected.",
            selectedConnectorLabels.length ? "User selected connector context: " + selectedConnectorLabels.join(", ") + "." : "",
            attachedFiles.length ? "User attached local context filenames: " + attachedFiles.join(", ") + "." : "",
            selectedProject ? "Project context: attach this Imagine generation thread to project " + selectedProject.name + " (" + selectedProject.id + ") and use that project's strategy, tasks, files, and history as relevant context." : "",
            activeMediaMode === "video"
              ? "Video workflow: create the final video with the video generation skill using the selected model. If a template image or video reference is attached and the model supports it, pass it as the visual reference. Keep the template subject, composition, motion mood, and selected styles consistent unless the user asks to change them. Do not answer with only a plan; generate the video and summarize the output file path."
              : "Image workflow: run exactly one image-understanding command for this Imagine request when a template image or additional user reference images are attached, then create the final image with the image generation skill using " + selectedImagineTemplateImageModel.label + " edit mode. If no explicit aspect ratio is selected, infer the closest supported aspect ratio from the template. Do not read image files as text. Do not answer with only a plan; generate the image and summarize the output file path.",
          ].filter(Boolean).join("\\n");
          const imagineTemplateThreadMetadata = {
            runnerPlayground: {
              source: "imagine",
              mediaMode: activeMediaMode,
              generationType: activeMediaMode,
              templateId: activeTemplate?.id || undefined,
              videoGenerationMaxOutputs: activeMediaMode === "video" ? 1 : undefined,
            },
          };

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
            const fallbackPrompt = activeMediaMode === "video" ? "Create this video." : "Create this image.";
            const prompt = String(activeTemplate?.placeholder || activeTemplate?.prompt || activeTemplate?.title || fallbackPrompt).trim() || fallbackPrompt;
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
            setActiveTemplateMediaMode(String(nextTemplate.mediaType || "image") === "video" ? "video" : "image");
            setImageName(nextTemplate.title || "");
            setActiveActionPopup("");
            setSettingsFlipped(false);
            setStylePickerOpen(false);
            previewTransitionTimeoutRef.current = setTimeout(() => {
              setPreviewTransition((current) => (
                current.token === transitionToken
                  ? { ...current, previousTemplate: null }
                  : current
              ));
            }, 520);
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

          const requestFileBrowser = (source) => {
            const normalizedSource = String(source || "").trim() || "workspace";
            setActiveActionPopup("");
            setFileBrowserRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              source: normalizedSource,
            });
          };

          const handleConnectorBrowse = (connector) => {
            const connectorId = String(connector?.id || "").trim();
            const connectorSource = String(connector?.source || connectorId).trim();
            if (connectorSource) {
              requestFileBrowser(connectorSource);
              return;
            }
            if (connectorId) {
              toggleConnector(connectorId);
            }
          };

          const toggleStyleOption = (styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setSelectedStyleIds((current) => (
              current.includes(normalizedStyleId)
                ? current.filter((id) => id !== normalizedStyleId)
                : [...current, normalizedStyleId]
            ));
          };

          const removeStyleOption = (styleId) => {
            const normalizedStyleId = String(styleId || "").trim();
            if (!normalizedStyleId) {
              return;
            }
            setSelectedStyleIds((current) => current.filter((id) => id !== normalizedStyleId));
          };

          const toggleTemplateAssetSelection = (asset, assetIndex) => {
            const assetKey = getActiveTemplateAssetKey(asset, assetIndex);
            if (!assetKey) {
              return;
            }
            setSelectedTemplateAssetKeys((current) => {
              const currentSet = new Set(current);
              if (currentSet.has(assetKey)) {
                if (currentSet.size <= 1) {
                  return current;
                }
                currentSet.delete(assetKey);
                return Array.from(currentSet);
              }
              currentSet.add(assetKey);
              return Array.from(currentSet);
            });
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
              onClick: () => {
                setActiveTemplateId(template.id);
                setActiveTemplateMediaMode(String(template.mediaType || "image") === "video" ? "video" : "image");
              },
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
            React.createElement("h3", { className: "playground-imagine-template-settings-back-title" }, "Personalization Settings"),
            renderProjectSelector(),
            renderAspectRatioSelector(),
            React.createElement("section", { ref: stylePickerRef, className: "playground-imagine-template-style-picker" },
              React.createElement("div", { className: "playground-imagine-template-style-picker-header" },
                React.createElement("div", { className: "playground-imagine-template-section-title" }, "Style"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-style-manage-button" + (stylePickerOpen ? " is-active" : ""),
                  onClick: () => setStylePickerOpen((current) => !current),
                }, "Manage Styles")
              ),
              React.createElement("div", { className: "playground-imagine-template-style-pill-list" },
                selectedStyleOptions.length
                  ? selectedStyleOptions.map((style) => {
                      const StyleIcon = style.Icon || Paintbrush;
                      return React.createElement("span", { key: "selected-style:" + style.id, className: "playground-imagine-template-style-pill is-selected" },
                        React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-imagine-template-style-pill-remove",
                          "aria-label": "Remove " + style.label,
                          onClick: (event) => {
                            event.stopPropagation();
                            removeStyleOption(style.id);
                          },
                        }, React.createElement(X, { width: 12, height: 12, strokeWidth: 1.8 }))
                      );
                    })
                  : React.createElement("span", { className: "playground-imagine-template-style-pill is-empty" },
                      React.createElement(Paintbrush, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, "No style selected")
                    )
              ),
              stylePickerOpen
                ? React.createElement("div", { className: "playground-imagine-template-style-picker-options" },
                    styleOptions.map((style) => {
                      const StyleIcon = style.Icon || Paintbrush;
                      const isSelected = selectedStyleIds.includes(style.id);
                      return React.createElement("button", {
                        key: style.id,
                        type: "button",
                        className: "playground-imagine-template-style-pill" + (isSelected ? " is-selected" : ""),
                        onClick: () => toggleStyleOption(style.id),
                      },
                        React.createElement(StyleIcon, { className: "playground-imagine-template-style-pill-icon", strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-imagine-template-style-pill-label" }, style.label),
                        React.createElement("span", { className: "tb-popup-check-slot" },
                          isSelected
                            ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                            : null
                        )
                      );
                    })
                  )
                : null
            ),
            activeTemplateAssets.length > 1
              ? React.createElement("section", { className: "playground-imagine-template-asset-picker" },
                  React.createElement("div", { className: "playground-imagine-template-section-title" }, "Template assets"),
                  React.createElement("div", { className: "playground-imagine-template-asset-picker-grid" },
                    activeTemplateAssets.map((asset, assetIndex) => {
                      const assetKey = getActiveTemplateAssetKey(asset, assetIndex);
                      const isSelected = selectedTemplateAssetKeys.includes(assetKey);
                      const isVideoAsset = asset?.type === "video";
                      return React.createElement("button", {
                        key: assetKey,
                        type: "button",
                        className: "playground-imagine-template-asset-option" + (isSelected ? " is-selected" : ""),
                        "aria-label": (isSelected ? "Deselect " : "Select ") + (asset?.title || "template asset " + (assetIndex + 1)),
                        "aria-pressed": isSelected ? "true" : "false",
                        onClick: () => toggleTemplateAssetSelection(asset, assetIndex),
                      },
                        isVideoAsset
                          ? React.createElement("video", {
                              src: asset.url,
                              muted: true,
                              loop: true,
                              playsInline: true,
                              preload: "metadata",
                            })
                          : React.createElement("img", {
                              src: asset.url,
                              alt: "",
                              draggable: false,
                              loading: "lazy",
                            }),
                        React.createElement("span", { className: "playground-imagine-template-asset-option-check" },
                          React.createElement(Check, { width: 12, height: 12, strokeWidth: 2 })
                        )
                      );
                    })
                  )
                )
              : null,
            React.createElement("section", { className: "playground-imagine-template-section is-attachments" },
              React.createElement("div", { className: "playground-imagine-template-attachments-toolbar" },
                React.createElement("div", { className: "playground-imagine-template-section-title" }, "Attachments"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-imagine-template-from-computer",
                  onClick: () => requestFileBrowser("workspace"),
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
                    onClick: () => handleConnectorBrowse(connector),
                  },
                    React.createElement("span", { className: "playground-imagine-template-connector-service" },
                      renderImagineConnectorIcon(connector),
                      React.createElement("span", null, connector.label)
                    ),
                    React.createElement("span", { className: "playground-imagine-template-connector-value" }, "Browse")
                  );
                })
              )
            )
          );

          const renderPreviewLayer = (template, className, key, assetIndex = 0) => {
            if (!template) {
              return null;
            }
            const previewAssets = normalizePlaygroundImagineTemplatePageAssets(template);
            const safeAssetIndex = previewAssets.length
              ? Math.max(0, Math.min(Number(assetIndex) || 0, previewAssets.length - 1))
              : 0;
            const previewAsset = previewAssets[safeAssetIndex] || previewAssets[0] || null;
            if (previewAsset?.type === "video") {
              return React.createElement("video", {
                key,
                className: "playground-imagine-template-preview-video " + className,
                src: previewAsset.url,
                title: template.title || "Video template",
                controls: className.includes("is-current"),
                muted: false,
                loop: true,
                playsInline: true,
                preload: "metadata",
              });
            }
            if (previewAsset?.type === "image") {
              return React.createElement("img", {
                key,
                className: "playground-imagine-template-preview-image " + className,
                src: previewAsset.url,
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

          const handleShareTemplateWithTeam = async () => {
            const normalizedBackendUrl = String(backendUrl || "").trim().replace(new RegExp("/+$"), "");
            const normalizedTeamId = String(shareTeamId || "").trim();
            const normalizedTemplateId = String(activeTemplate?.id || "").trim();
            if (!normalizedBackendUrl || !normalizedTeamId || !normalizedTemplateId || !activeTemplate?.isCustom) {
              return;
            }
            setShareLoading(true);
            setShareError("");
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              if (apiKey) {
                headers.set("X-API-Key", apiKey);
              }
              const templatePayload = {
                ...activeTemplate,
              };
              delete templatePayload["long" + "Description"];
              const response = await fetch(
                normalizedBackendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
                {
                  method: "POST",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                  body: JSON.stringify({
                    resourceType: "imagine_template",
                    resourceId: normalizedTemplateId,
                    accessLevel: "use",
                    metadata: {
                      template: templatePayload,
                    },
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to share template.");
              }
              setActiveActionPopup("");
              setShareError("");
            } catch (error) {
              setShareError(error instanceof Error ? error.message : "Failed to share template.");
            } finally {
              setShareLoading(false);
            }
          };

          const renderActionPopup = () => {
            if (!activeActionPopup) {
              return null;
            }
            if (activeActionPopup === "template-actions") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Template actions"),
                React.createElement("div", { className: "playground-imagine-template-popup-list" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-row",
                    onClick: () => {
                      setShareError("");
                      setActiveActionPopup("share-template");
                    },
                  },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                      React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, "Share with team"),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Make this template available to a team")
                    )
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-row is-danger",
                    onClick: () => {
                      setActiveActionPopup("");
                      setSettingsFlipped(false);
                      if (typeof onDeleteTemplate === "function") {
                        onDeleteTemplate(activeTemplate);
                      }
                    },
                  },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                    React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                      React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, "Delete template"),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Remove it from My Templates")
                    )
                  )
                )
              );
            }
            if (activeActionPopup === "share-template") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, "Share with team"),
                shareLoading && !shareTeams.length
                  ? React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "Loading teams...")
                  : React.createElement("div", { className: "playground-imagine-template-popup-list" },
                      shareTeams.length
                        ? shareTeams.map((team) => renderPopupRow({
                            key: "share-team:" + team.id,
                            selected: String(team.id || "") === shareTeamId,
                            label: team.name || "Untitled team",
                            description: "Use this Imagine template",
                            onClick: () => setShareTeamId(String(team.id || "")),
                          }))
                        : React.createElement("p", { className: "playground-imagine-template-action-popup-copy" }, "No teams available yet.")
                    ),
                shareError
                  ? React.createElement("p", { className: "playground-imagine-template-popup-error" }, shareError)
                  : null,
                React.createElement("div", { className: "playground-imagine-template-popup-footer" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-button is-secondary",
                    onClick: () => {
                      setShareError("");
                      setActiveActionPopup("template-actions");
                    },
                  }, "Back"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-imagine-template-popup-button is-primary",
                    disabled: shareLoading || !shareTeamId,
                    onClick: () => {
                      void handleShareTemplateWithTeam();
                    },
                  }, shareLoading ? "Sharing..." : "Share")
                )
              );
            }
            if (activeActionPopup === "info") {
              return React.createElement("div", { className: "playground-imagine-template-action-popup" },
                React.createElement("h3", { className: "playground-imagine-template-action-popup-title" }, activeTemplate?.title || "Template"),
                React.createElement("p", { className: "playground-imagine-template-action-popup-copy" },
                  activeTemplate?.description || "Use this template as visual direction for the generated image."
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
                      onClick: () => handleConnectorBrowse(connector),
                    },
                      React.createElement("span", { className: "tb-popup-check-slot" },
                        isSelected
                          ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                          : null
                      ),
                      React.createElement("span", { className: "playground-imagine-template-popup-row-copy" },
                        React.createElement("span", { className: "playground-imagine-template-popup-row-label" }, connector.label),
                        React.createElement("span", { className: "playground-imagine-template-popup-row-description" }, "Open file explorer")
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
          const canManageCustomTemplate = Boolean(activeTemplate?.isCustom);
          const renderGhostActionRail = () => React.createElement("div", {
            className: "playground-imagine-template-action-rail is-ghost",
            "aria-hidden": "true",
          },
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(canManageCustomTemplate ? SquarePen : Heart, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(Info, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            React.createElement("span", { className: "playground-imagine-template-action-button" },
              React.createElement(SlidersHorizontal, { width: 16, height: 16, strokeWidth: 1.8 })
            ),
            canManageCustomTemplate
              ? React.createElement("span", { className: "playground-imagine-template-action-button" },
                  React.createElement(Ellipsis, { width: 16, height: 16, strokeWidth: 1.8 })
                )
              : null
          );

          const templatePageElement = React.createElement("div", { className: "playground-imagine-template-page" },
            React.createElement("div", { className: "playground-imagine-template-shell" },
              React.createElement("main", { className: "playground-imagine-template-detail", ref: detailRef },
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
                React.createElement("div", {
                  className: "playground-imagine-template-main",
                  style: {
                    "--imagine-template-detail-aspect-ratio": activeTemplateAspectRatio,
                    "--imagine-template-main-width": previewSize.width ? previewSize.width + "px" : undefined,
                    "--imagine-template-main-height": previewSize.height ? previewSize.height + "px" : undefined,
                    "--imagine-template-main-top": previewSize.top ? previewSize.top + "px" : undefined,
                  },
                },
                  previewTransition.previousTemplate
                    ? React.createElement("div", {
                        key: "previous:" + previewTransition.token,
                        className: "playground-imagine-template-slide-shell is-previous",
                        style: {
                          "--imagine-template-transition-direction": previewTransition.direction,
                          "--imagine-template-detail-aspect-ratio": String(previewTransition.previousTemplate?.aspectRatio || activeTemplateAspectRatio || "4 / 3").replace(":", " / "),
                        },
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
                    className: "playground-imagine-template-slide-shell " + (previewTransition.token ? "is-current" : "is-static"),
                    style: {
                      "--imagine-template-transition-direction": previewTransition.direction,
                      "--imagine-template-detail-aspect-ratio": activeTemplateAspectRatio,
                    },
                  },
                    React.createElement("div", { className: "playground-imagine-template-preview-frame" },
                      React.createElement("div", { className: "playground-imagine-template-flip-card" + (settingsFlipped ? " is-flipped" : "") },
                        React.createElement("div", { className: "playground-imagine-template-flip-inner" },
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-front" },
                            React.createElement("div", {
                              className: "playground-imagine-template-preview-stage",
                              style: {
                                "--imagine-template-preview-bg": activeTemplateBackground,
                                "--imagine-template-transition-direction": activeTemplateAssetTransition.previousIndex !== null ? activeTemplateAssetTransition.direction : previewTransition.direction,
                              },
                            },
                              React.createElement("div", {
                                className: "playground-imagine-template-preview-media" + (activeTemplateAssetTransition.previousIndex !== null ? " is-asset-transitioning" : ""),
                                style: { "--imagine-template-asset-direction": activeTemplateAssetTransition.previousIndex !== null ? activeTemplateAssetTransition.direction : 1 },
                              },
                                activeTemplateAssetTransition.previousIndex !== null
                                  ? renderPreviewLayer(activeTemplate, "is-previous", "asset-previous:" + activeTemplateAssetTransition.token, activeTemplateAssetTransition.previousIndex)
                                  : null,
                                renderPreviewLayer(activeTemplate, "is-current", "asset-current:" + (activeTemplate?.id || "") + ":" + normalizedActiveTemplateAssetIndex + ":" + activeTemplateAssetTransition.token, normalizedActiveTemplateAssetIndex)
                              ),
                              activeTemplateAssets.length > 1
                                ? React.createElement("span", {
                                    className: "playground-imagine-template-media-controls",
                                    onClick: (event) => event.stopPropagation(),
                                  },
                                    React.createElement("span", { className: "playground-imagine-template-media-dots" },
                                      activeTemplateAssets.map((asset, assetIndex) =>
                                        React.createElement("button", {
                                          key: "detail-asset-dot:" + String(activeTemplate?.id || "template") + ":" + assetIndex,
                                          type: "button",
                                          className: "playground-imagine-template-media-dot" + (assetIndex === normalizedActiveTemplateAssetIndex ? " is-active" : ""),
                                          "aria-label": "Show template asset " + (assetIndex + 1),
                                          onClick: (event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setActiveTemplateAsset(assetIndex, assetIndex >= normalizedActiveTemplateAssetIndex ? 1 : -1);
                                          },
                                        })
                                      )
                                    ),
                                    React.createElement("span", { className: "playground-imagine-template-media-arrows" },
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-imagine-template-media-arrow",
                                        "aria-label": "Previous template asset",
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setActiveTemplateAsset(normalizedActiveTemplateAssetIndex - 1, -1);
                                        },
                                      }, React.createElement(ChevronLeft, { width: 14, height: 14, strokeWidth: 1.9 })),
                                      React.createElement("button", {
                                        type: "button",
                                        className: "playground-imagine-template-media-arrow",
                                        "aria-label": "Next template asset",
                                        onClick: (event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          setActiveTemplateAsset(normalizedActiveTemplateAssetIndex + 1, 1);
                                        },
                                      }, React.createElement(ChevronRight, { width: 14, height: 14, strokeWidth: 1.9 }))
                                    )
                                  )
                                : null
                            )
                          ),
                          React.createElement("div", { className: "playground-imagine-template-flip-face is-back" },
                            renderSettingsBackside()
                          )
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-imagine-template-action-rail" },
                      canManageCustomTemplate
                        ? renderActionButton({
                            id: "edit-template",
                            label: "Edit template",
                            Icon: SquarePen,
                            onClick: () => {
                              setActiveActionPopup("");
                              setSettingsFlipped(false);
                              if (typeof onEditTemplate === "function") {
                                onEditTemplate(activeTemplate);
                              }
                            },
                          })
                        : renderActionButton({
                            id: "like",
                            label: "Like",
                            Icon: Heart,
                            className: activeTemplateLiked ? "is-liked" : "",
                            onClick: () => {
                              const normalizedTemplateId = String(activeTemplate?.id || "").trim();
                              if (!normalizedTemplateId) {
                                return;
                              }
                              if (typeof onToggleFavouriteTemplate === "function") {
                                onToggleFavouriteTemplate(normalizedTemplateId);
                                return;
                              }
                              setLocalLikedTemplateIds((current) => {
                                const currentIds = Array.isArray(current)
                                  ? current.map((id) => String(id || "").trim()).filter(Boolean)
                                  : [];
                                return currentIds.includes(normalizedTemplateId)
                                  ? currentIds.filter((id) => id !== normalizedTemplateId)
                                  : currentIds.concat(normalizedTemplateId);
                              });
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
                      canManageCustomTemplate
                        ? renderActionButton({
                            id: "template-actions",
                            label: "Template actions",
                            Icon: Ellipsis,
                            onClick: () => {
                              setActiveActionPopup((current) => current === "template-actions" ? "" : "template-actions");
                            },
                          })
                        : null,
                      renderActionPopup()
                    )
                  )
                ),
                React.createElement("div", { className: "playground-imagine-template-composer-wrap", ref: composerWrapRef },
                  React.createElement("div", { className: "playground-imagine-template-composer-shell" },
                    React.createElement(RunnerChat, {
                      key: "imagine-template-runner:" + activeMediaMode + ":" + (activeTemplate?.id || "__none__"),
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
                      skills: imagineTemplateRunnerSkills,
                      skillDefaults: imagineTemplateSkillDefaults,
                      environmentId: environmentId || undefined,
                      agentId: agentId || undefined,
                      projectId: selectedProjectId || undefined,
                      autoFocusComposer: true,
                      keepFocusOnSubmit: true,
                      showUsageInStatus: false,
                      placeholder: activeMediaMode === "video"
                        ? "Describe a video"
                        : activeTemplate?.placeholder || activeTemplate?.title || "Describe an image",
                      composerLeadingControl: renderImagineTemplateMediaModeSwitch(),
                      composerBeforeAgentControl: renderImagineTemplateModelSelector(),
                      hiddenSystemPrompt,
                      threadMetadata: imagineTemplateThreadMetadata,
                      implicitAttachments: imagineTemplateReferenceAttachments,
                      externalFileBrowserRequest: fileBrowserRequest,
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
          return React.createElement(React.Fragment, null,
            templatePageElement,
            renderImagineTemplateVideoUpgradeModal()
          );
        }
`;
