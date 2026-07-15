export const APP_HEADER_SEARCH_MODAL_CSS = `      .thread-search-modal {
        --playground-top-nav-popup-border: var(--tb-task-input-border, var(--tb-runner-input-border, linear-gradient(-10deg, rgba(200, 200, 200, 0.25), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.375))));
        position: relative;
        width: min(792px, calc(100vw - 24px));
        max-height: min(78vh, 720px);
        padding-top: 4px;
        padding-bottom: 4px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 25px;
        border: 0;
        background: rgba(30, 30, 30, 0.5);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);
      }

      .thread-search-modal::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-popup-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .thread-search-input-row {
        position: relative;
        display: flex;
        align-items: center;
        min-height: 46px;
        padding: 0 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .thread-search-input {
        width: 100%;
        height: 100%;
        padding: 0 34px 0 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        outline: none;
        font-size: 12px;
        font-weight: 400;
      }

      .thread-search-input::placeholder {
        color: rgba(255, 255, 255, 0.44);
      }

      .thread-search-input-icon {
        position: absolute;
        right: 16px;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.56);
        pointer-events: none;
      }

      .thread-search-body {
        min-height: 0;
        flex: 1;
        overflow: auto;
        padding: 0 16px 10px;
      }

      .thread-search-section {
        padding-top: 10px;
      }

      .thread-search-section + .thread-search-section {
        margin-top: 8px;
      }

      .thread-search-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 4px 10px;
      }

      .thread-search-section-label {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.5);
      }

      .thread-search-section-link {
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      }

      .thread-search-section-link:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .thread-search-action-card {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 42px;
        padding: 0 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.96);
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease, border-color 160ms ease;
      }

      .thread-search-action-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.14);
      }

      .thread-search-action-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .thread-search-action-copy {
        font-size: 13px;
        font-weight: 500;
      }

      .thread-search-result-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .thread-search-result {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 42px;
        padding: 0 12px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: transparent;
        color: rgba(255, 255, 255, 0.96);
        cursor: pointer;
        text-align: left;
        transition: background-color 160ms ease, border-color 160ms ease, opacity 160ms ease;
      }

      .thread-search-result:hover,
      .thread-search-result.is-active {
        opacity: 1;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.1);
      }

      .thread-search-result-title {
        min-width: 0;
        flex: 1;
        font-size: 13px;
        font-weight: 400;
        color: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .thread-search-result-time {
        flex-shrink: 0;
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.48);
        white-space: nowrap;
      }

      .thread-search-result-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.64);
      }

      .thread-search-result-copy {
        min-width: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .thread-search-result-subtitle {
        min-width: 0;
        color: rgba(255, 255, 255, 0.44);
        font-size: 11px;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .thread-search-empty-state {
        padding: 24px 4px 12px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
        line-height: 1.5;
      }

      .thread-search-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 44px;
        padding: 0 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 500;
      }

      .thread-search-footer-copy,
      .thread-search-footer-meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .thread-search-footer-icon {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
      }

      .thread-search-footer-separator {
        color: rgba(255, 255, 255, 0.24);
      }

`;
