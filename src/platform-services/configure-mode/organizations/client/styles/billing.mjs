export const ORGANIZATIONS_BILLING_CSS = `      .playground-organization-billing-panel {
        margin: 2px 0 4px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .playground-organization-billing-panel.is-consolidated {
        min-width: 0;
        margin: 0;
        gap: 16px;
      }

      .playground-organization-usage-panel.is-consolidated {
        gap: 0;
      }

      .playground-organization-admin-page.is-billing-page .playground-team-shell {
        gap: 24px;
      }

      .playground-organization-billing-page {
        width: 100%;
        min-width: 0;
        padding-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        box-sizing: border-box;
      }

      .playground-organization-billing-page .platform-button.is-secondary {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .playground-organization-billing-page .platform-button.is-secondary:hover:not(:disabled),
      .playground-organization-billing-page .platform-button.is-secondary.is-active {
        background: rgba(255, 255, 255, 0.15) !important;
      }

      .playground-organization-billing-surface {
        width: 100%;
        min-width: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
        box-sizing: border-box;
      }

      .playground-organization-billing-page-header {
        padding: 24px 24px 28px;
      }

      .playground-organization-billing-page-title {
        margin: 0;
        color: #fff;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-organization-billing-payment-section {
        padding: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-sizing: border-box;
      }

      .playground-organization-billing-section-heading,
      .playground-organization-billing-information-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-organization-billing-section-title {
        margin: 0;
        color: #fff;
        font-size: 14px;
        line-height: 1.3;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-organization-billing-payment-row {
        min-height: 64px;
        margin-top: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-organization-billing-payment-identity {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .playground-organization-billing-card-brand {
        min-width: 40px;
        height: 25px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 5px;
        color: rgba(255, 255, 255, 0.9);
        background: #000;
        font-size: 9px;
        line-height: 1;
        font-weight: 600;
        box-sizing: border-box;
      }

      .playground-organization-billing-payment-label {
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        line-height: 1.35;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-organization-billing-payment-empty {
        min-height: 64px;
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
      }

      .playground-organization-billing-payment-empty-title {
        color: rgba(255, 255, 255, 0.82);
        font-size: 13px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-organization-billing-payment-empty-description,
      .playground-organization-billing-information-description {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.45;
        font-weight: 400;
      }

      .playground-organization-billing-payment-loading {
        min-height: 80px;
      }

      .playground-organization-billing-information-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .playground-organization-billing-information-cell {
        min-width: 0;
        min-height: 148px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        box-sizing: border-box;
      }

      .playground-organization-billing-information-cell:nth-child(odd) {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-organization-billing-information-heading {
        width: 100%;
      }

      .playground-organization-billing-address {
        color: rgba(255, 255, 255, 0.76);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-organization-billing-credit-balance {
        margin-top: auto;
        color: #fff;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
      }

      .playground-organization-billing-invoices-table {
        --platform-data-table-minimal-inline-padding: 24px;
        gap: 0;
      }

      .playground-organization-billing-invoices-table > .platform-data-table__toolbar {
        min-height: 72px;
        padding: 0 24px;
        box-sizing: border-box;
      }

      .playground-organization-billing-invoices-table .platform-data-table__toolbar-title {
        font-size: 14px;
      }

      .playground-organization-billing-invoices-table > .platform-data-table__surface {
        background: transparent;
      }

      .playground-organization-billing-document-reference {
        display: block;
        min-width: 0;
        overflow: hidden;
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-organization-billing-documents-empty {
        min-height: 220px;
      }

      @media (max-width: 760px) {
        .playground-organization-billing-information-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-organization-billing-information-cell:nth-child(odd) {
          border-right: none;
        }

        .playground-organization-billing-page-header,
        .playground-organization-billing-payment-section,
        .playground-organization-billing-information-cell {
          padding-left: 18px;
          padding-right: 18px;
        }

        .playground-organization-billing-invoices-table {
          --platform-data-table-minimal-inline-padding: 18px;
        }

        .playground-organization-billing-invoices-table > .platform-data-table__toolbar {
          padding-right: 18px;
          padding-left: 18px;
        }
      }
`;
