export const IMAGINE_TEMPLATE_CONFIGURATION_CSS = String.raw`
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

`;
