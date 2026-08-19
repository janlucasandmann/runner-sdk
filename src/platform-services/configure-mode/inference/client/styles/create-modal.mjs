export const INFERENCE_STYLE_CREATE_MODAL = `      .inference-create-endpoint-modal__header {
        padding-top: 24px;
      }

      .inference-create-endpoint-modal__body {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .inference-create-endpoint-modal__grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .inference-create-endpoint-modal__field {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        font-weight: 400;
      }

      .inference-create-endpoint-modal__field.is-span-2 {
        grid-column: 1 / -1;
      }

      .inference-create-endpoint-modal__field em {
        color: rgba(255, 255, 255, 0.38);
        font-style: normal;
      }

      .inference-create-endpoint-modal__field small,
      .inference-create-endpoint-modal__default small {
        color: rgba(255, 255, 255, 0.45);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;
      }

      .inference-create-endpoint-modal__field input,
      .inference-create-endpoint-modal__selector-trigger {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        min-height: 36px;
        padding: 0 11px;
        border: none;
        border-radius: 8px;
        outline: none;
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
      }

      .inference-create-endpoint-modal__field input::placeholder {
        color: rgba(255, 255, 255, 0.32);
      }

      .inference-create-endpoint-modal__field input:focus,
      .inference-create-endpoint-modal__selector-trigger:focus-visible {
        border: none;
        box-shadow: 0 0 0 1px #4da3ff;
      }

      .inference-create-endpoint-modal__default {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .inference-create-endpoint-modal__default > span {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .inference-create-endpoint-modal__default strong {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
      }

      .inference-create-endpoint-modal__error {
        margin: 0;
        color: #ff8c8b;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
      }

      .inference-create-endpoint-modal__spinner {
        animation: playground-spin 0.8s linear infinite;
      }

      @media (max-width: 640px) {
        .inference-create-endpoint-modal__grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .inference-create-endpoint-modal__field.is-span-2 {
          grid-column: auto;
        }
      }
`;
