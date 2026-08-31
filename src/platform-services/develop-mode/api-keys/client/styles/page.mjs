export const API_KEYS_PAGE_CSS_FRAGMENT = `      .resource-overview-page.is-develop-api-keys .playground-settings-api-keys-name-row {
        max-width: 100%;
      }

      .resource-overview-page.is-develop-api-keys .playground-develop-api-keys-secret {
        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
      }

      .resource-overview-page.is-develop-api-keys .playground-develop-api-keys-created-notice {
        flex: 0 0 auto;
      }

      .playground-develop-api-keys-base-url {
        min-width: 0;
        padding: 14px 16px;
        display: grid;
        grid-template-columns: minmax(220px, 0.7fr) minmax(320px, 1.3fr);
        align-items: center;
        gap: 24px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-develop-api-keys-base-url-title,
      .playground-develop-api-keys-base-url-description {
        margin: 0;
      }

      .playground-develop-api-keys-base-url-title {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
      }

      .playground-develop-api-keys-base-url-description {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.55);
        font-size: 11px;
        line-height: 1.45;
      }

      .playground-develop-api-keys-base-url-description code {
        color: rgba(255, 255, 255, 0.78);
        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
      }

      .playground-develop-api-keys-base-url-value {
        min-width: 0;
      }

      .playground-develop-api-keys-base-url-value .playground-settings-code {
        min-width: 0;
        padding: 9px 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: all;
      }

      @media (max-width: 760px) {
        .playground-develop-api-keys-base-url {
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
        }
      }

      .playground-api-key-reveal-modal .playground-settings-code-row {
        margin-top: 4px;
      }

      .playground-api-key-reveal-modal .playground-settings-code {
        min-width: 0;
        overflow-wrap: anywhere;
        white-space: normal;
        user-select: all;
      }

      .playground-api-key-reveal-modal .platform-modal-header {
        border-bottom: 0;
      }

      .playground-api-key-reveal-modal .playground-settings-code-row {
        position: relative;
        display: block;
        margin-top: -12px;
      }

      .playground-api-key-reveal-modal .playground-settings-code-input {
        box-sizing: border-box;
        padding-right: 52px;
        border: none;
        margin-bottom: 12px;
        color: #fff;
        outline: none;
      }

      .playground-api-key-reveal-modal .playground-settings-code-input:focus-visible {
        border-color: rgba(77, 163, 255, 0.5);
      }

      .playground-api-key-reveal-modal .playground-settings-code-copy {
        position: absolute;
        top: 50%;
        right: 8px;
        width: 30px;
        min-width: 30px;
        height: 30px;
        transform: translateY(-50%);
      }

      .playground-api-key-reveal-error {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
        line-height: 1.5;
      }

      .platform-api-key-management-modal__body {
        display: grid;
        gap: 18px;
      }

      .platform-api-key-create-modal.platform-modal-surface {
        display: flex;
        flex-direction: column;
      }

      .platform-api-key-create-modal > .platform-modal-header,
      .platform-api-key-create-modal > .platform-modal-footer {
        flex: 0 0 auto;
      }

      .platform-api-key-create-modal > .platform-modal-header.is-search {
        gap: 10px;
      }

      .platform-api-key-create-modal > .platform-modal-header .platform-modal-header__leading {
        overflow: visible;
      }

      .platform-api-key-create-modal > .platform-modal-header .platform-modal-header__search-input {
        font-size: 16px;
      }

      .platform-api-key-create-modal__icon {
        box-sizing: border-box;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border-radius: 6px;
        background: transparent;
        color: #fff;
      }

      .platform-api-key-create-modal__body.platform-modal-body {
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .platform-api-key-create-modal .platform-api-key-create-modal__description-editor.platform-instructions-editor {
        margin: 0;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.075);
        overflow: hidden;
      }

      .platform-api-key-create-modal__description-editor > .platform-instructions-editor__header {
        margin-bottom: 12px;
      }

      .platform-api-key-create-modal__description-editor .platform-instructions-editor__prosemirror {
        min-height: 120px;
      }

      .platform-api-key-create-modal .platform-api-key-management-scopes {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .platform-api-key-create-modal .platform-api-key-management-scopes legend {
        grid-column: 1 / -1;
        margin-bottom: 12px;
        color: #fff;
      }

      .platform-api-key-create-modal .playground-settings-scope-option {
        min-height: 86px;
      }

      .platform-api-key-management-scopes {
        min-width: 0;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 10px;
        border: 0;
      }

      .platform-api-key-management-scopes legend {
        margin-bottom: 8px;
        padding: 0;
        color: rgba(255, 255, 255, 0.78);
        font-size: 12px;
      }

      .platform-api-key-management-scopes .playground-settings-scope-option {
        gap: 4px;
        padding: 12px;
        border-radius: 10px;
      }

      .platform-api-key-management-scopes strong {
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 500;
      }

      .platform-api-key-management-scopes span {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.45;
      }

      .platform-api-key-management-modal__error,
      .platform-api-key-management-modal__notice {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
      }

      .platform-api-key-management-modal__error {
        color: rgba(248, 113, 113, 0.95);
      }

      .platform-api-key-management-modal__notice {
        color: rgba(255, 255, 255, 0.5);
      }

      .platform-api-key-management-modal__loading {
        min-height: 76px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
      }

      .platform-api-key-management-modal__spinner {
        flex: 0 0 auto;
        animation: platform-api-key-management-spin 800ms linear infinite;
      }

      @keyframes platform-api-key-management-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 720px) {
        .platform-api-key-create-modal .platform-api-key-management-scopes {
          grid-template-columns: minmax(0, 1fr);
        }

        .platform-api-key-create-modal .playground-settings-scope-option {
          min-height: 0;
        }
      }
`;
