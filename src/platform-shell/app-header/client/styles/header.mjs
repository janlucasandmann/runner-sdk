export const APP_HEADER_CSS = `      .playground-top-nav-search-divider {
        flex: 0 0 1px;
        width: 1px;
        height: 22px;
        margin: 0 2px 0 6px;
        background: rgba(255, 255, 255, 0.15);
      }

      .playground-top-nav-private-chat-button {
        --playground-top-nav-private-chat-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        min-height: 30px;
        height: 30px;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
        padding: 0 14px;
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
        transition: color 160ms ease, background 160ms ease;
      }

      .playground-top-nav-private-chat-button.is-active,
      .playground-top-nav-private-chat-button:hover,
      .playground-top-nav-private-chat-button:focus-visible {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.98);
        outline: none;
      }

      .playground-top-nav-private-chat-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-private-chat-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-top-nav-private-chat-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-top-nav-private-chat-button svg {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
      }

      .playground-skills-top-nav-action-button {
        padding-left: 12px;
        padding-right: 12px;
      }

      .playground-skills-top-nav-action-button:disabled {
        cursor: default;
        opacity: 0.45;
      }

      .playground-agent-detail-header-center {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .playground-top-nav-pill-button {
        --playground-top-nav-pill-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        min-height: 30px;
        height: 30px;
        overflow: hidden;
        border: 0;
        border-radius: 999px;
        background: transparent;
        padding: 0 14px;
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 400;
        line-height: 1;
        cursor: pointer;
        transition: color 160ms ease, background 160ms ease;
      }

      .playground-top-nav-pill-button.is-active,
      .playground-top-nav-pill-button:hover,
      .playground-top-nav-pill-button:focus-visible {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.98);
        outline: none;
      }

      .playground-top-nav-pill-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-top-nav-pill-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-top-nav-pill-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-top-nav-pill-button svg {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-unified-top-navbar .playground-environments-editor-navbar-copy {
        flex-direction: row;
        align-items: center;
        gap: 16px;
      }

      .playground-top-nav-path {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.52);
      }

      .playground-top-nav-path-item {
        min-width: auto;
        max-width: none;
        flex: 0 0 auto;
        overflow: visible;
        text-overflow: clip;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 0;
        padding: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.58);
        font: inherit;
        font-size: 12px;
        cursor: default;
      }

      button.playground-top-nav-path-item {
        cursor: pointer;
        transition: color 160ms ease;
      }

      button.playground-top-nav-path-item:hover {
        color: rgba(255, 255, 255, 0.82);
      }

      .playground-top-nav-path-item.is-current {
        min-width: 0;
        max-width: min(360px, 42vw);
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-top-nav-path-leading {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: currentColor;
      }

      .playground-top-nav-path-leading > svg {
        width: 14px;
        height: 14px;
      }

      .playground-top-nav-path-item-group {
        min-width: auto;
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 4px;
      }

      .playground-top-nav-path-item-group.is-current {
        min-width: 0;
        max-width: min(360px, 42vw);
        flex: 0 1 auto;
        overflow: hidden;
      }

      .playground-top-nav-path-item-group.is-current > .playground-top-nav-path-item.is-current {
        max-width: none;
        flex: 1 1 auto;
      }

      .playground-top-nav-path-item-group.is-current > :not(.playground-top-nav-path-item) {
        flex: 0 0 auto;
      }

      .playground-top-nav-path-label {
        min-width: auto;
        flex: 0 0 auto;
        font-size: 14px;
        overflow: visible;
        text-overflow: clip;
        white-space: nowrap;
      }

      .playground-top-nav-path-item.is-current .playground-top-nav-path-label {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-top-nav-path-separator {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.34);
        width: 12px;
        height: 12px;
      }

      .playground-top-nav-left-extra {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

`;
