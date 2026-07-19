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
        width: 100%;
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

      .inference-endpoint-detail__form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .inference-endpoint-detail__field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .inference-endpoint-detail__field.is-span-2 {
        grid-column: 1 / -1;
      }

      .inference-endpoint-detail__field-label {
        color: rgba(255, 255, 255, 0.62);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.35;
      }

      .inference-endpoint-detail__input-row,
      .inference-endpoint-detail__model-entry {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .inference-endpoint-detail__input,
      .inference-endpoint-detail__selector-trigger {
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

      .inference-endpoint-detail__input:focus,
      .inference-endpoint-detail__selector-trigger:focus-visible {
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

      .inference-endpoint-detail__facts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0 24px;
      }

      .inference-endpoint-detail__fact,
      .inference-endpoint-detail__property {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .inference-endpoint-detail__fact {
        min-height: 42px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .inference-endpoint-detail__fact:nth-last-child(-n + 2) {
        border-bottom: 0;
      }

      .inference-endpoint-detail__fact-label,
      .inference-endpoint-detail__property-label {
        color: rgba(255, 255, 255, 0.56);
        font-size: 12px;
        font-weight: 400;
      }

      .inference-endpoint-detail__fact-value,
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

      .inference-endpoint-detail__properties,
      .inference-endpoint-detail__actions {
        display: flex;
        flex-direction: column;
      }

      .inference-endpoint-detail__properties {
        gap: 10px;
      }

      .inference-endpoint-detail__actions {
        gap: 8px;
      }

      .inference-endpoint-detail__model-entry {
        padding: 12px 6px;
      }

      .inference-endpoint-detail__model-entry .inference-endpoint-detail__input {
        flex: 1 1 auto;
      }

      .inference-endpoint-detail__runtime-content {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .inference-endpoint-detail__runtime-content > section {
        margin: 0;
      }

      .inference-endpoint-detail__section-copy,
      .inference-endpoint-detail__inline-error {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
      }

      .inference-endpoint-detail__section-copy {
        color: rgba(255, 255, 255, 0.64);
      }

      .inference-endpoint-detail__inline-error {
        margin-top: 12px;
        color: #ff8c8b;
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
        .inference-endpoint-detail__form-grid,
        .inference-endpoint-detail__facts {
          grid-template-columns: minmax(0, 1fr);
        }

        .inference-endpoint-detail__field.is-span-2 {
          grid-column: auto;
        }

        .inference-endpoint-detail__fact:nth-last-child(-n + 2) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .inference-endpoint-detail__fact:last-child {
          border-bottom: 0;
        }
      }
`;
