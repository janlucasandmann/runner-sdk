export const APPLIANCE_ADMIN_CSS = `      .platform-appliance-overview {
        display: grid;
        width: 100%;
        gap: 24px;
      }

      .platform-appliance-overview__card-title {
        margin: 0;
        color: #fff;
        letter-spacing: 0;
        font-weight: 400;
      }

      .platform-appliance-overview__warning {
        color: #f6c76b;
        font-size: 12px;
      }

      .platform-appliance-overview__metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 24px;
      }

      .platform-appliance-metric {
        display: grid;
        min-width: 0;
        gap: 7px;
      }

      .platform-appliance-metric__label,
      .platform-appliance-metric__detail,
      .platform-appliance-capacity__footer,
      .platform-appliance-overview__detail-label {
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
      }

      .platform-appliance-metric__value {
        overflow: hidden;
        color: #fff;
        font-size: 24px;
        line-height: 1.1;
        font-weight: 400;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .platform-appliance-overview__grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
        gap: 24px;
      }

      .platform-appliance-overview__card {
        display: grid;
        align-content: start;
        gap: 24px;
        padding: 20px;
      }

      .platform-appliance-overview__card-title {
        font-size: 14px;
      }

      .platform-appliance-capacity {
        display: grid;
        gap: 10px;
      }

      .platform-appliance-capacity__header,
      .platform-appliance-capacity__footer,
      .platform-appliance-overview__detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .platform-appliance-capacity__label,
      .platform-appliance-capacity__value,
      .platform-appliance-overview__detail-value {
        color: #fff;
        font-size: 12px;
      }

      .platform-appliance-capacity__track {
        width: 100%;
        height: 6px;
        overflow: hidden;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.1);
      }

      .platform-appliance-capacity__fill {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: #85df7b;
      }

      .platform-appliance-overview__details {
        display: grid;
      }

      .platform-appliance-overview__detail-row {
        min-height: 34px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .platform-appliance-overview__detail-row:last-child {
        border-bottom: 0;
      }

      .platform-appliance-overview__loading {
        min-height: 320px;
      }

      .platform-appliance-overview .is-spinning {
        animation: playground-spin 0.8s linear infinite;
      }

      @media (max-width: 980px) {
        .platform-appliance-overview__metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .platform-appliance-overview__grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 620px) {
        .platform-appliance-overview__metrics {
          grid-template-columns: 1fr;
        }
      }
`;
