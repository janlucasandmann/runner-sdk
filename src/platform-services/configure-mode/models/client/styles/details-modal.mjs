export const MODELS_STYLE_DETAILS_MODAL = String.raw`
      .models-overview-details-modal {
        overflow: hidden !important;
      }

      .models-overview-details-modal__title-content {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        max-width: 100%;
      }

      .models-overview-details-modal__provider-icon {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
      }

      .models-overview-details-modal__provider-icon .playground-agents-model-provider-icon {
        display: block;
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .models-overview-details-modal__provider-icon .playground-agents-model-provider-icon.is-openai {
        filter: brightness(0) invert(1);
      }

      .models-overview-details-modal__title-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .models-overview-details-modal__body {
        box-sizing: border-box;
        max-height: min(66vh, 680px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
      }

      .models-overview-details-modal__section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .models-overview-details-modal__section:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: 0;
      }

      .models-overview-details-modal__section h3 {
        margin: 0 0 12px;
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.3;
      }

      .models-overview-details-modal__facts {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        margin: 0;
      }

      .models-overview-details-modal__fact {
        box-sizing: border-box;
        min-width: 0;
        padding: 11px 12px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 10px;
        background: #0b0b0b;
      }

      .models-overview-details-modal__fact dt {
        margin: 0 0 5px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 10px;
        font-weight: 500;
        line-height: 1.25;
      }

      .models-overview-details-modal__fact dd {
        min-width: 0;
        margin: 0;
      }

      .models-overview-details-modal__fact dd > span {
        display: block;
        overflow-wrap: anywhere;
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
      }

      .models-overview-details-modal__fact small {
        display: block;
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 10px;
        line-height: 1.45;
      }

      .models-overview-details-modal__capabilities {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }

      .models-overview-details-modal__capabilities span {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 0 9px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.68);
        font-size: 11px;
        line-height: 1;
      }

      .models-overview-details-modal__footer {
        min-height: 38px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .models-overview-details-modal__documentation {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        margin-right: auto;
        color: rgba(255, 255, 255, 0.56);
        font-size: 11px;
        line-height: 1;
        text-decoration: none;
        transition: color 120ms ease;
      }

      .models-overview-details-modal__documentation:hover {
        color: #fff;
      }

      .models-overview-details-modal__footer-spacer {
        margin-right: auto;
      }

      @media (max-width: 640px) {
        .models-overview-details-modal__facts {
          grid-template-columns: minmax(0, 1fr);
        }

        .models-overview-details-modal__documentation {
          display: none;
        }
      }
`;
