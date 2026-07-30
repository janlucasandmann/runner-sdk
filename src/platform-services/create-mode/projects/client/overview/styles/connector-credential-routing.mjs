export const PROJECT_OVERVIEW_CONNECTOR_CREDENTIAL_ROUTING_CSS_FRAGMENT = `
      .playground-project-connector-credentials {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 22px;
        margin-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-project-connector-credentials-header h4 {
        margin: 0;
        color: #ffffff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-project-connector-credentials-header p,
      .playground-project-connector-credentials-error,
      .playground-project-connector-credentials-loading {
        max-width: 720px;
        margin: 4px 0 0;
        color: rgba(255, 255, 255, 0.56);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-project-connector-credentials-error {
        color: #f7a7a7;
      }

      .playground-project-connector-credentials-list {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .playground-project-connector-credential-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(180px, auto);
        align-items: center;
        gap: 20px;
        min-height: 64px;
        padding: 12px 0;
      }

      .playground-project-connector-credential-service {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .playground-project-connector-credential-service > span:last-child {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .playground-project-connector-credential-service strong {
        color: #ffffff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-project-connector-credential-service small {
        overflow: hidden;
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        font-weight: 400;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-project-connector-credential-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex: 0 0 24px;
        overflow: hidden;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.08);
      }

      .playground-project-connector-credential-icon img {
        display: block;
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .playground-project-connector-credential-icon svg {
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-project-connector-credential-selector {
        min-width: 190px;
      }

      .playground-project-connector-credential-selector-trigger {
        justify-content: flex-end;
        min-height: 30px;
        padding-right: 0;
        padding-left: 10px;
        border: 0;
        background: transparent;
      }

      @media (max-width: 720px) {
        .playground-project-connector-credential-row {
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
        }

        .playground-project-connector-credential-selector {
          width: 100%;
        }

        .playground-project-connector-credential-selector-trigger {
          justify-content: space-between;
          width: 100%;
          padding: 0;
        }
      }
`;
