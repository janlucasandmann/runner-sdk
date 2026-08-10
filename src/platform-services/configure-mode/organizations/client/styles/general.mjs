export const ORGANIZATIONS_GENERAL_CSS = `      .playground-organization-admin-page .playground-team-shell {
        gap: 24px;
      }

      .playground-organization-admin-heading {
        min-width: 0;
      }

      .playground-organization-admin-context {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.4;
      }

      .playground-organization-owner-selector .platform-owner-selector__avatar {
        width: 20px !important;
        height: 20px !important;
        min-width: 20px;
        max-width: 20px;
        min-height: 20px;
        max-height: 20px;
        flex: 0 0 20px;
        overflow: hidden;
        border-radius: 50%;
      }

      .playground-organization-owner-selector .platform-owner-selector__avatar-image {
        width: 100% !important;
        height: 100% !important;
        min-width: 0;
        max-width: 100%;
        min-height: 0;
        max-height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .playground-organization-general {
        width: 100%;
      }

      .playground-organization-settings {
        display: grid;
        width: 100%;
        gap: 24px;
      }

      .playground-organization-settings-card {
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-settings-card-content {
        padding: 24px;
      }

      .playground-organization-settings-title {
        margin: 0;
        border: none;
        color: #fff;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 400;
        letter-spacing: 0;
        -webkit-appearance: none;
        appearance: none;
      }

      .playground-organization-settings-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .playground-organization-settings-switcher-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-organization-settings-switcher-option .tb-popup-check {
        margin-left: auto;
      }

      .playground-organization-settings-switcher-footer {
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-organization-settings-member-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin: 36px 0 30px;
      }

      .playground-organization-settings-member-copy,
      .playground-organization-settings-danger-copy {
        min-width: 0;
      }

      .playground-organization-settings-member-label,
      .playground-organization-settings-danger-label,
      .playground-organization-settings-field-label {
        display: block;
        color: #fff;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 400;
      }

      .playground-organization-settings-member-description,
      .playground-organization-settings-danger-description {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-organization-settings-member-count {
        flex: 0 0 auto;
        color: #fff;
        font-size: 18px;
        line-height: 1;
        font-weight: 400;
      }

      .playground-organization-settings-fields {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
      }

      .playground-organization-settings-field {
        display: grid;
        min-width: 0;
        gap: 8px;
      }

      .playground-organization-settings-input {
        box-sizing: border-box;
        width: 100%;
        height: 40px;
        min-width: 0;
        padding: 0 12px;
        border: none;
        border-radius: 8px;
        outline: none;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.9);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0;
        transition: border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease;
      }

      .playground-organization-settings-input:hover:not(:disabled):not(.is-readonly) {
        background: rgba(255, 255, 255, 0.09);
      }

      .playground-organization-settings-input:focus-visible {
        border-color: rgba(77, 163, 255, 0.72);
        box-shadow: 0 0 0 2px rgba(77, 163, 255, 0.16);
      }

      .playground-organization-settings-input:disabled,
      .playground-organization-settings-input.is-readonly {
        color: rgba(255, 255, 255, 0.58);
      }

      .playground-organization-settings-id-control {
        display: flex;
        min-width: 0;
      }

      .playground-organization-settings-id-control .playground-organization-settings-input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .playground-organization-settings-copy-button.platform-icon-button {
        --platform-icon-button-size: 40px;
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        flex: 0 0 40px;
        border: 0 !important;
        border-radius: 0 8px 8px 0 !important;
        background: rgba(255, 255, 255, 0.075) !important;
      }

      .playground-organization-settings-copy-button.platform-icon-button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.12) !important;
      }

      .playground-organization-settings-card-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-height: 62px;
        padding: 12px 24px;
        width: 100%;
        box-sizing: border-box;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
        background: rgba(255, 255, 255, 0.025);
      }

      .playground-organization-settings-danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        margin-top: 36px;
      }

      .playground-organization-settings-danger-description {
        max-width: 760px;
      }

      .playground-organization-settings-delete-button {
        flex: 0 0 auto;
      }

      .playground-organization-admin-loading {
        min-height: 240px;
      }

      @media (max-width: 720px) {
        .playground-organization-settings-card-content {
          padding: 20px;
        }

        .playground-organization-settings-fields {
          grid-template-columns: 1fr;
        }

        .playground-organization-settings-danger-row {
          align-items: flex-start;
          flex-direction: column;
          gap: 16px;
        }

        .playground-organization-settings-card-footer {
          padding-right: 20px;
          padding-left: 20px;
        }
      }

      @media (max-width: 480px) {
        .playground-organization-settings-title-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-organization-settings-member-summary {
          align-items: flex-start;
        }

        .playground-organization-settings-member-count {
          font-size: 18px;
        }
      }
`;
