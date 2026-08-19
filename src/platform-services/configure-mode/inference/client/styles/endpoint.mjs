export const INFERENCE_STYLE_ENDPOINT = `      .playground-settings-inference-endpoint-card {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-settings-inference-endpoint-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-settings-inference-endpoint-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-settings-inference-endpoint-toggle {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .playground-settings-inference-endpoint-toggle-label {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }

      .playground-settings-inference-status-value {
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.82);
        line-height: 1.4;
        text-align: right;
      }

      .inference-endpoint-detail {
        width: min(100%, var(--playground-centered-page-max-width, var(--platform-page-content-max-width, 87.5rem)));
        max-width: var(--playground-centered-page-max-width, var(--platform-page-content-max-width, 87.5rem));
        margin-inline: auto;
      }

      .playground-settings-page.is-inference-detail {
        padding: 42px 44px 56px;
      }

      .playground-settings-page.is-inference-detail .playground-settings-detail-scroll {
        width: min(100%, var(--playground-centered-page-max-width, var(--platform-page-content-max-width, 87.5rem)));
        max-width: var(--playground-centered-page-max-width, var(--platform-page-content-max-width, 87.5rem));
        margin-inline: auto;
      }

      .inference-endpoint-detail__main,
      .inference-endpoint-detail__analytics,
      .inference-endpoint-detail__main > .platform-settings-section-list {
        min-width: 0;
        width: 100%;
      }

      .inference-endpoint-detail__settings-content,
      .inference-endpoint-detail__settings-layout,
      .inference-endpoint-detail__access-settings,
      .inference-endpoint-detail__access-table {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
      }

      .inference-endpoint-detail .inference-endpoint-detail__settings-content.playground-server-detail-content,
      .inference-endpoint-detail .inference-endpoint-detail__settings-layout.playground-server-settings-tab {
        width: 100%;
        max-width: none;
        margin-inline: 0;
        align-self: stretch;
      }

      .inference-endpoint-detail__storage-map {
        margin-block: 0;
      }

      .inference-endpoint-detail__access-unavailable {
        box-sizing: border-box;
        width: 100%;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.5;
      }

      .inference-endpoint-detail__topnav-actions {
        display: flex;
        align-items: center;
      }

      .inference-endpoint-detail.is-general-tab {
        --resource-detail-section-gap: 24px;
      }

      .inference-endpoint-detail__identity-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.62);
        background: rgba(255, 255, 255, 0.075);
      }

      .inference-endpoint-detail__identity .platform-service-detail-identity__copy {
        min-width: 0;
      }

      .inference-endpoint-detail__identity-timeframe {
        flex: 0 0 auto;
        margin-left: auto;
        align-self: center;
      }

      .inference-endpoint-detail__version-changes {
        width: 100%;
        min-width: 0;
      }

      .inference-endpoint-detail__identity-name.platform-service-detail-identity__title-input {
        max-width: none;
        font-size: 24px;
        font-weight: 600;
        line-height: 1.2;
      }

      .inference-endpoint-detail__identity-description.platform-service-detail-identity__description-input {
        max-width: 620px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
        font-weight: 400;
        line-height: 1.35;
      }

      .inference-endpoint-detail__identity-description.platform-service-detail-identity__description-input:focus {
        color: rgba(255, 255, 255, 0.82);
      }

      .inference-endpoint-detail__header,
      .inference-endpoint-detail__header-copy {
        min-width: 0;
        display: flex;
        align-items: center;
      }

      .inference-endpoint-detail__header {
        gap: 8px;
      }

      .inference-endpoint-detail__header-copy {
        gap: 12px;
      }

      .inference-endpoint-detail__title {
        min-width: 0;
        margin: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        font-weight: 500;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .inference-endpoint-detail__banner {
        box-sizing: border-box;
        width: 100%;
        margin-bottom: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.45;
      }

      .inference-endpoint-detail__banner.is-error {
        background: rgba(245, 59, 58, 0.1);
        color: #ff8c8b;
      }

      .inference-endpoint-detail__banner.is-success {
        background: rgba(133, 223, 123, 0.1);
        color: #85df7b;
      }

      .inference-endpoint-detail__settings-detail-section .platform-settings-section__title {
        font-size: 14px;
      }

      .inference-endpoint-detail__settings-detail-list.platform-service-detail-page__property-list {
        gap: 0;
      }

      .inference-endpoint-detail__settings-detail-list .platform-service-detail-page__property {
        min-height: 46px;
        grid-template-columns: minmax(140px, 1fr) minmax(0, 1fr);
        padding: 0 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .inference-endpoint-detail__settings-detail-list .platform-service-detail-page__property:last-child {
        border-bottom: 0;
      }

      .inference-endpoint-detail__settings-detail-list .platform-service-detail-page__property-value {
        overflow: visible;
      }

      .inference-endpoint-detail__settings-control {
        width: min(100%, 460px);
        margin-left: auto;
      }

      .inference-endpoint-detail__input-shell {
        position: relative;
        min-width: 0;
      }

      .inference-endpoint-detail__input-shell .inference-endpoint-detail__input {
        padding-right: 76px;
      }

      .inference-endpoint-detail__input-action.platform-button {
        position: absolute;
        top: 50%;
        right: 2px;
        transform: translateY(-50%);
      }

      .inference-endpoint-detail__input-row {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .inference-endpoint-detail__input {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        min-height: 34px;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        outline: none;
      }

      .inference-endpoint-detail__input:focus {
        border-color: #4da3ff;
        box-shadow: 0 0 0 1px #4da3ff;
      }

      .inference-endpoint-detail__input:disabled {
        opacity: 0.5;
        cursor: default;
      }

      .inference-endpoint-detail__input::placeholder {
        color: rgba(255, 255, 255, 0.34);
      }

      .inference-endpoint-detail__configuration-section .inference-endpoint-detail__input {
        min-height: 30px;
        border: 0;
        background: rgba(255, 255, 255, 0.035);
      }

      .inference-endpoint-detail__configuration-section .inference-endpoint-detail__input:focus {
        border: 0;
        background: rgba(74, 167, 255, 0.045);
        box-shadow: none;
      }

      .inference-endpoint-detail__property {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .inference-endpoint-detail__property-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 400;
      }

      .inference-endpoint-detail__property-value {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-size: 12px;
        font-weight: 400;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .inference-endpoint-detail__properties {
        display: flex;
        flex-direction: column;
      }

      .inference-endpoint-detail__properties-list {
        gap: 4px;
      }

      .inference-endpoint-detail__identity-row .platform-service-detail-page__property-value,
      .inference-endpoint-detail__owner-row .platform-service-detail-page__property-value {
        min-width: 0;
        overflow: visible;
      }

      .inference-endpoint-detail__identity-row .resource-overview-identity {
        width: 100%;
        min-width: 0;
        justify-content: flex-end;
      }

      .inference-endpoint-detail__identity-row .resource-overview-identity__visual,
      .inference-endpoint-detail__owner-selector .platform-owner-selector__avatar {
        box-sizing: border-box;
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        border-radius: 50%;
      }

      .inference-endpoint-detail__owner-row {
        width: 100%;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .inference-endpoint-detail__owner-selector,
      .inference-endpoint-detail__owner-trigger {
        width: 100%;
      }

      .inference-endpoint-detail__owner-trigger {
        justify-content: flex-end;
      }

      .inference-endpoint-detail__primary-action {
        width: 100%;
        margin-top: 8px;
      }

      .inference-endpoint-detail__primary-action .platform-button-selector__group {
        width: 100%;
      }

      .inference-endpoint-detail__models-table {
        width: 100%;
        min-width: 0;
      }

      .inference-endpoint-model-modal__field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        font-weight: 400;
      }

      .inference-endpoint-model-modal__field .inference-endpoint-detail__input {
        min-height: 36px;
      }

      .inference-endpoint-detail__missing {
        min-height: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        text-align: center;
      }

      @media (max-width: 760px) {
        .playground-settings-page.is-inference-detail {
          padding: 16px;
        }

        .inference-endpoint-detail__settings-detail-list .platform-service-detail-page__property {
          grid-template-columns: minmax(116px, 0.65fr) minmax(0, 1fr);
        }

        .inference-endpoint-detail__settings-control {
          width: 100%;
        }
      }
`;
