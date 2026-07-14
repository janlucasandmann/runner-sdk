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

	      .playground-organization-billing-snapshot {
	        display: flex;
	        flex-direction: column;
	        gap: 12px;
	      }

	      .playground-organization-billing-tabs.playground-agents-overview-tabs {
	        width: 100%;
	        margin: 0;
	      }

	      .playground-organization-billing-panel.is-consolidated > .playground-settings-page.is-embedded {
	        width: 100%;
	        min-width: 0;
	        background: transparent;
	      }

	      .playground-organization-usage-panel.is-consolidated {
	        gap: 0;
	      }

      .playground-organization-billing-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-organization-billing-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        line-height: 1.15;
        font-weight: 500;
      }

      .playground-organization-billing-meta {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-organization-billing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }

      .playground-organization-billing-card {
        min-height: 82px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.04);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        box-sizing: border-box;
      }

      .playground-organization-billing-card-label {
        color: rgba(255, 255, 255, 0.48);
        font-size: 11px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-billing-card-value {
        color: rgba(255, 255, 255, 0.94);
        font-size: 18px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-organization-billing-card-subtitle {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 11px;
        line-height: 1.25;
        font-weight: 400;
      }

      .playground-organization-billing-activity {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-organization-billing-activity-row {
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .playground-organization-billing-activity-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .playground-organization-billing-activity-title {
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-billing-activity-meta,
      .playground-organization-billing-activity-amount {
        color: rgba(255, 255, 255, 0.46);
        font-size: 11px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-billing-activity-amount {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.72);
      }

`;
