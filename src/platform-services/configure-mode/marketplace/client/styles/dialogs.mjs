export const MARKETPLACE_STYLE_DIALOGS = String.raw`      .playground-resource-templates-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0, 0, 0, 0.62);
        backdrop-filter: blur(18px);
      }

      .playground-resource-templates-modal {
        width: min(100%, 680px);
        max-height: min(760px, calc(100dvh - 48px));
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 18px;
        background: #202020;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
      }

      .playground-resource-templates-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        padding: 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-resource-templates-modal-title {
        margin: 0;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 500;
      }

      .playground-resource-templates-modal-type {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
      }

      .playground-resource-templates-modal-close {
        width: 30px;
        height: 30px;
        flex: 0 0 30px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        cursor: pointer;
      }

      .playground-resource-templates-modal-body {
        overflow: auto;
        padding: 18px;
      }

      .playground-resource-templates-modal-copy {
        margin: 0 0 16px;
        color: rgba(255, 255, 255, 0.66);
        font-size: 13px;
        line-height: 1.55;
      }

      .playground-resource-templates-modal-section {
        margin-top: 18px;
      }

      .playground-resource-templates-modal-section h3 {
        margin: 0 0 9px;
        font-size: 13px;
        font-weight: 500;
      }

      .playground-resource-templates-modal-list {
        margin: 0;
        padding-left: 18px;
        color: rgba(255, 255, 255, 0.66);
        font-size: 12px;
        line-height: 1.6;
      }

      .playground-resource-templates-modal-projects {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-resource-templates-project-option {
        min-height: 42px;
        border: 0;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.07);
        color: #fff;
        padding: 10px 12px;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .playground-resource-templates-project-option:hover {
        background: rgba(255, 255, 255, 0.11);
      }

      @media (max-width: 980px) {
        .playground-resource-templates-page-inner {
          padding: 30px 18px 42px;
        }

        .playground-resource-templates-toolbar .playground-plugins-search-shell {
          flex: 1 1 100%;
          width: 100%;
          min-width: 0;
          max-width: none;
        }

        .playground-resource-templates-resource-table .playground-resource-templates-col-difficulty,
        .playground-resource-templates-resource-table .playground-resource-templates-col-setup,
        .playground-resource-templates-resource-table th:nth-child(3),
        .playground-resource-templates-resource-table td:nth-child(3),
        .playground-resource-templates-resource-table th:nth-child(4),
        .playground-resource-templates-resource-table td:nth-child(4) {
          display: none;
        }
      }
`;
