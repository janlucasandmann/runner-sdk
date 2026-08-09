export const FILES_CONTENT_CSS = `
      .playground-files-action-error {
        font-size: 12px;
        line-height: 1.45;
        color: #ff9c9c;
      }

      .playground-files-view-toggle {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
      }

      .playground-files-view-toggle-button {
        width: 34px;
        height: 20px;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-view-toggle-button.is-active {
        background: rgba(255, 255, 255, 0.24);
        color: #fff;
      }

      .playground-files-page .playground-files-browser-body {
        width: min(100%, calc(var(--playground-thread-content-max-width) + 48px));
        max-width: calc(var(--playground-thread-content-max-width) + 48px);
        position: relative;
        z-index: 1;
        min-height: 0;
        flex: 1;
        overflow: auto;
        margin: 0 auto;
        padding: 0 24px 18px;
        border: 0;
        border-radius: 0;
        background: transparent;
        background-clip: border-box;
        box-sizing: border-box;
        transition: background-color 160ms ease, box-shadow 160ms ease;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .playground-files-page .playground-files-browser-body::-webkit-scrollbar {
        display: none;
      }

      .playground-files-browser-body.is-drop-target {
        background: rgba(54, 120, 255, 0.08);
        box-shadow: inset 0 0 0 1px rgba(82, 146, 255, 0.26);
      }

      .playground-files-browser-body.is-file-drop-active {
        overflow: hidden;
      }

      .playground-files-page .playground-files-browser-body.is-changes-view {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      .playground-files-page .playground-files-browser-body.is-connectors-view .platform-empty-state {
        align-self: center;
        margin: auto;
      }

      .playground-files-screen-drop-overlay {
        position: absolute;
        inset: 0;
        z-index: 24;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(28, 28, 28, 0.9);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        pointer-events: none;
      }

      .playground-files-screen-drop-overlay-panel {
        width: min(100%, 520px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        text-align: center;
      }

      .playground-files-screen-drop-overlay-illustration {
        position: relative;
        width: 112px;
        height: 96px;
        margin-bottom: 4px;
      }

      .playground-files-screen-drop-overlay-icon-card {
        position: absolute;
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, rgba(125, 140, 255, 0.96), rgba(66, 88, 244, 0.96));
        box-shadow: 0 16px 30px rgba(37, 46, 119, 0.32);
        color: white;
      }

      .playground-files-screen-drop-overlay-icon-card-back {
        left: 8px;
        top: 16px;
        transform: rotate(-12deg);
        opacity: 0.95;
      }

      .playground-files-screen-drop-overlay-icon-card-front {
        left: 36px;
        top: 36px;
        z-index: 2;
      }

      .playground-files-screen-drop-overlay-icon-card-side {
        right: 6px;
        top: 18px;
        transform: rotate(14deg);
        opacity: 0.95;
      }

      .playground-files-screen-drop-overlay-icon {
        width: 20px;
        height: 20px;
      }

      .playground-files-screen-drop-overlay-title {
        font-size: 17px;
        line-height: 1.2;
        font-weight: 600;
        color: white;
      }

      .playground-files-screen-drop-overlay-copy {
        max-width: 360px;
        font-size: 14px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.76);
      }

      .playground-files-entry-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 4px;
        margin-top: 12px;
      }

      .playground-files-entry-row {
        width: calc(100% + 24px);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: -12px;
        margin-right: -12px;
        padding: 5px 12px;
        border: 0;
        border-radius: 14px;
        background: transparent;
        color: rgba(255, 255, 255, 0.88);
        cursor: pointer;
        text-align: left;
        user-select: none;
        box-sizing: border-box;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
      }

      .playground-files-entry-selection-checkbox {
        flex: 0 0 14px;
        margin: 0;
      }

      .playground-files-entry-row:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .playground-files-entry-row.is-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-entry-row.is-drop-target {
        background: rgba(54, 120, 255, 0.14);
        box-shadow: inset 0 0 0 1px rgba(82, 146, 255, 0.38);
      }

      .playground-files-entry-row.is-dragging {
        opacity: 0.48;
      }

      .playground-files-entry-chevron-button {
        width: 14px;
        height: 14px;
        padding: 0;
        border: 0;
        background: transparent;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .playground-files-entry-chevron {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-files-entry-chevron.is-spinning {
        animation: spinner-rotate 1s linear infinite;
      }

      .playground-files-entry-chevron.is-placeholder {
        opacity: 0;
      }

      .playground-files-entry-row .playground-files-entry-chevron-button,
      .playground-files-entry-row .playground-files-entry-chevron.is-placeholder {
        display: none;
      }

      .playground-files-entry-main {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-files-entry-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-files-entry-icon.is-large {
        width: 64px;
        height: 64px;
      }

      .playground-files-entry-icon.is-asset {
        display: block;
        object-fit: contain;
      }

      .playground-files-entry-icon.is-thumbnail {
        width: 34px;
        height: 34px;
        box-sizing: border-box;
        padding: 5px;
        border-radius: 4px;
        object-fit: cover;
        background: transparent;
      }

      .playground-files-entry-row .playground-files-entry-icon:not(.is-large):not(.is-thumbnail) {
        width: 34px;
        height: 34px;
        box-sizing: border-box;
        border-radius: 6px;
        border: 0;
        background: transparent;
      }

      .playground-files-entry-row svg.playground-files-entry-icon:not(.is-large):not(.is-thumbnail) {
        padding: 10px;
      }

      .playground-files-entry-row .playground-files-entry-icon.is-asset:not(.is-large):not(.is-thumbnail) {
        padding: 7px;
        object-fit: contain;
      }

      .playground-files-entry-icon.is-large.is-thumbnail {
        width: 64px;
        height: 64px;
        border-radius: 8px;
      }

      .playground-files-entry-icon.is-folder {
        color: rgba(255, 255, 255, 0.74);
      }

      .playground-files-entry-icon.is-image {
        color: rgba(255, 255, 255, 0.88);
      }

      .playground-files-entry-icon.is-code {
        color: #8ce1c5;
      }

      .playground-files-entry-icon.is-document {
        color: #d9b57c;
      }

      .playground-files-entry-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-files-entry-name {
        min-width: 0;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-files-entry-meta {
        display: inline-flex;
        align-items: center;
        gap: 20px;
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.44);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-files-entry-date,
      .playground-files-entry-size {
        white-space: nowrap;
      }

      .playground-files-entry-date {
        min-width: 92px;
        text-align: right;
      }

      .playground-files-entry-size {
        min-width: 70px;
        text-align: right;
      }

      .playground-files-entry-options-button {
        width: 28px;
        height: 28px;
        margin-left: 6px;
        flex-shrink: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(255, 255, 255, 0.52);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .playground-files-entry-options-button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-files-entry-options-icon {
        width: 15px;
        height: 15px;
        display: block;
      }

      .playground-files-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-top: 12px;
      }

      .playground-files-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px 12px;
        border: 1px solid transparent;
        border-radius: 16px;
        background: transparent;
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, opacity 160ms ease;
      }

      .playground-files-grid-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-files-grid-item.is-active {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
      }

      .playground-files-grid-item.is-drop-target {
        background: rgba(54, 120, 255, 0.12);
        border-color: rgba(82, 146, 255, 0.42);
      }

      .playground-files-grid-item.is-dragging {
        opacity: 0.5;
      }

      .playground-files-grid-item-name {
        width: 100%;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.94);
        text-align: center;
        word-break: break-word;
      }

      .playground-files-grid-item-meta {
        width: 100%;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.42);
        text-align: center;
      }

      .playground-files-state {
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 24px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
        line-height: 1.5;
        text-align: center;
      }

      .playground-auth-users-empty-state,
      .playground-agent-runtime-empty-state {
        flex-direction: column;
        gap: 12px;
      }

      .playground-auth-users-empty-state-image,
      .playground-agent-runtime-empty-state-image {
        display: block;
        width: 200px;
        max-width: min(200px, 100%);
        height: auto;
        flex: 0 0 auto;
      }

      .playground-auth-users-empty-state-title {
        color: #fff;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-configure-usage-empty-state .playground-auth-users-empty-state-image {
        width: 184px;
        max-width: min(184px, 100%);
      }

      .playground-configure-usage-empty-state .playground-auth-users-empty-state-title {
        margin-top: 12px;
      }

      .playground-auth-users-empty-state-copy {
        max-width: 320px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.45;
        text-align: center;
      }

      .playground-files-empty-state-card-wrap {
        min-height: 0;
        width: 100%;
        justify-content: flex-start;
        align-items: stretch;
        padding: 24px 0;
      }

      .playground-files-empty-state-card {
        width: 100%;
        max-width: none;
      }

      .playground-files-empty-workspace {
        width: 100%;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 72px 0 32px;
        box-sizing: border-box;
      }

      .playground-files-empty-banner {
        position: relative;
        width: 100%;
        min-height: 230px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        background:
          radial-gradient(circle at 18% 18%, rgba(102, 166, 255, 0.16), transparent 25%),
          radial-gradient(circle at 82% 10%, rgba(255, 255, 255, 0.08), transparent 24%),
          #08090b;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .playground-files-empty-banner::before {
        content: "";
        position: absolute;
        inset: 0;
        opacity: 0.5;
        background-image: radial-gradient(rgba(255, 255, 255, 0.24) 1px, transparent 1px);
        background-size: 24px 24px;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.5));
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.5));
      }

      .playground-files-empty-banner::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(8, 9, 11, 0.82) 0%, transparent 26%, transparent 74%, rgba(8, 9, 11, 0.82) 100%),
          linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.36) 100%);
      }

      .playground-files-empty-banner-content {
        position: relative;
        z-index: 3;
        width: min(100%, 560px);
        min-height: 230px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 34px 24px;
        text-align: center;
        box-sizing: border-box;
      }

      .playground-files-empty-banner-title {
        margin: 0;
        color: #fff;
        font-size: 21px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: 0;
      }

      .playground-files-empty-banner-copy {
        max-width: 500px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 13px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-files-empty-banner-button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 6px;
        padding: 0 18px;
        border: 0;
        border-radius: 999px;
        background: #fff;
        color: #050505;
        font-size: 13px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
      }

      .playground-files-empty-banner-button:disabled {
        cursor: default;
        opacity: 0.62;
      }

      .playground-files-empty-banner-card {
        position: absolute;
        z-index: 2;
        overflow: hidden;
        border: 2px solid #fff;
        background: rgba(255, 255, 255, 0.06);
        box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
      }

      .playground-files-empty-banner-card img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-files-empty-banner-card.is-left {
        left: 74px;
        bottom: 22px;
        width: 212px;
        height: 118px;
      }

      .playground-files-empty-banner-card.is-right {
        right: 70px;
        top: 44px;
        width: 194px;
        height: 142px;
      }

      .playground-files-empty-banner-art {
        position: absolute;
        z-index: 1;
        overflow: hidden;
        opacity: 0.86;
      }

      .playground-files-empty-banner-art img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .playground-files-empty-banner-art.is-left {
        left: 38px;
        top: -20px;
        width: 170px;
        height: 190px;
      }

      .playground-files-empty-banner-art.is-right {
        right: -2px;
        top: -12px;
        width: 162px;
        height: 152px;
      }

      .playground-files-empty-banner-badge {
        position: absolute;
        z-index: 4;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: #fff;
        color: #050505;
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
      }

      .playground-files-empty-banner-badge.is-left {
        left: 56px;
        bottom: 85px;
      }

      .playground-files-empty-banner-badge.is-right {
        right: 42px;
        bottom: 54px;
      }

      @media (max-width: 980px) {
        .playground-files-empty-banner-card.is-left,
        .playground-files-empty-banner-card.is-right,
        .playground-files-empty-banner-art,
        .playground-files-empty-banner-badge {
          display: none;
        }

        .playground-files-empty-banner-content {
          width: min(100%, 560px);
        }
      }

      .playground-files-empty-folder {
        position: relative;
        width: min(100%, 920px);
        margin: 0 auto;
        padding: 86px 34px 28px;
        border: 0;
        border-radius: 18px 18px 10px 10px;
        background: #0F0F0F;
        color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
        overflow: visible;
      }

      .playground-files-empty-folder-top {
        position: absolute;
        left: 0;
        right: 0;
        top: -34px;
        z-index: 1;
        width: 100%;
        height: 92px;
        overflow: visible;
        pointer-events: none;
        display: block;
      }

      .playground-files-empty-folder-inner {
        position: relative;
        z-index: 2;
      }

      .playground-files-empty-folder-rule {
        width: 100%;
        height: 1px;
        margin: 0 0 22px;
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-files-empty-folder-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 28px;
      }

      .playground-files-empty-folder-upload-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        flex: 0 0 auto;
        overflow: hidden;
        border: 0;
        background: transparent;
      }

      .playground-files-empty-folder-upload-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-control-button-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-files-empty-folder-upload-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-files-empty-folder-title {
        max-width: 430px;
        margin: 0;
        color: #fff;
        font-size: 28px;
        line-height: normal;
        font-weight: 500;
        letter-spacing: -0.055em;
      }

      .playground-files-empty-folder-title span {
        display: block;
        color: rgba(255, 255, 255, 0.54);
      }

      .playground-files-empty-folder-copy {
        max-width: 420px;
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-files-empty-folder-table {
        width: 100%;
        margin-top: 74px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-collapse: collapse;
        table-layout: fixed;
      }

      .playground-files-empty-folder-table th,
      .playground-files-empty-folder-table td {
        padding: 13px 14px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: rgba(255, 255, 255, 0.72);
        font-size: 11px;
        line-height: 1.45;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: -0.02em;
        vertical-align: top;
      }

      .playground-files-empty-folder-table th {
        color: rgba(255, 255, 255, 0.88);
        font-weight: 600;
        text-align: left;
      }

      .playground-files-empty-folder-table td:first-child {
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-files-empty-folder-table-check {
        color: #fff;
        margin-right: 8px;
      }

      @media (max-width: 760px) {
        .playground-files-empty-folder {
          padding: 78px 20px 22px;
        }

        .playground-files-empty-folder-header {
          flex-direction: column;
        }

        .playground-files-empty-folder-table {
          margin-top: 36px;
        }
      }

      .playground-files-state.is-error {
        color: #ff9c9c;
      }

      .playground-files-state-loader {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        animation: spinner-rotate 1s linear infinite;
      }
`;
