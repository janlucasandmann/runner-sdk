export const CALENDAR_UPGRADE_CSS = `
      .playground-calendar-upgrade-backdrop {
        position: fixed;
        inset: 0;
        z-index: 360;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        padding: 48px 20px;
        background:
          radial-gradient(circle at 50% 18%, rgba(102, 166, 255, 0.14), transparent 28%),
          radial-gradient(circle at 34% 22%, rgba(255, 255, 255, 0.06), transparent 20%),
          #000;
      }

      .playground-calendar-upgrade-backdrop::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(135deg, transparent 0 44%, rgba(255, 255, 255, 0.025) 45%, transparent 56%),
          radial-gradient(circle at 50% 50%, transparent 0 30%, rgba(0, 0, 0, 0.72) 72%);
      }

      .playground-calendar-upgrade-shell {
        position: relative;
        z-index: 1;
        width: min(100%, 460px);
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .playground-calendar-upgrade-close {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 2;
      }

      .playground-calendar-upgrade-headline {
        margin: 0 0 18px;
        color: #fff;
        font-size: 20px;
        line-height: 1.25;
        font-weight: 500;
        text-align: center;
      }

      .playground-calendar-upgrade-headline-price {
        color: #66a6ff;
      }

      .playground-calendar-upgrade-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
        margin-bottom: 34px;
        padding: 0 16px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .playground-calendar-upgrade-modal {
        width: min(384px, 100%);
        overflow: hidden;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background:
          linear-gradient(180deg, rgba(28, 86, 164, 0.96) 0, rgba(24, 58, 111, 0.94) 24%, rgba(24, 24, 24, 0.98) 47%, rgba(24, 24, 24, 0.98) 100%);
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.62);
      }

      .playground-calendar-upgrade-modal-top {
        padding: 24px 24px 18px;
      }

      .playground-calendar-upgrade-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .playground-calendar-upgrade-modal-title {
        margin: 0;
        font-size: 15px;
        line-height: 1.2;
        font-weight: 400;
        color: #fff;
      }

      .playground-calendar-upgrade-modal-offer {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.36);
        color: #66a6ff;
        font-size: 11px;
        font-weight: 600;
      }

      .playground-calendar-upgrade-price-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin-bottom: 12px;
      }

      .playground-calendar-upgrade-price-old {
        position: relative;
        color: rgba(255, 255, 255, 0.86);
        font-size: 28px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-calendar-upgrade-price-old::after {
        content: "";
        position: absolute;
        left: -2px;
        right: -2px;
        top: 50%;
        height: 2px;
        transform: rotate(-4deg);
        background: rgba(255, 255, 255, 0.8);
      }

      .playground-calendar-upgrade-price-new {
        color: #fff;
        font-size: 28px;
        line-height: 1;
        font-weight: 500;
      }

      .playground-calendar-upgrade-modal-copy {
        margin: 0 0 20px;
        color: #fff;
        font-size: 14px;
        line-height: 1.35;
        font-weight: 500;
      }

      .playground-calendar-upgrade-modal-button {
        min-height: 40px;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 0;
        border-radius: 999px;
        padding: 0 16px;
        background: #fff;
        color: #050505;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .playground-calendar-upgrade-modal-button:disabled {
        cursor: default;
        opacity: 0.65;
      }

      .playground-calendar-upgrade-feature-list {
        display: grid;
        gap: 2px;
        padding: 14px 24px 22px;
      }

      .playground-calendar-upgrade-modal-feature {
        display: flex;
        align-items: center;
        gap: 14px;
        min-height: 46px;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        font-weight: 600;
      }

      .playground-calendar-upgrade-modal-feature-icon {
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-calendar-upgrade-modal-feature-icon svg {
        width: 15px;
        height: 15px;
      }

`;
