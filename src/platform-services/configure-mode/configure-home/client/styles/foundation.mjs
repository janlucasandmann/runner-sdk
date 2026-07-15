export const CONFIGURE_HOME_FOUNDATION_CSS = `      .playground-configure-home {
        width: 100%;
        min-height: 100%;
        overflow: auto;
        padding: 42px 50px 56px;
        box-sizing: border-box;
        background: #000;
      }

      .playground-configure-home-inner {
        width: min(100%, var(--playground-centered-page-max-width));
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 38px;
      }

      .playground-configure-announcement {
        width: max-content;
        max-width: 100%;
        min-height: 36px;
        padding: 0 10px 0 7px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.02);
        color: rgba(255, 255, 255, 0.92);
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 400;
        cursor: pointer;
        box-sizing: border-box;
      }

      .playground-configure-announcement-badge {
        min-height: 22px;
        padding: 0 10px;
        border-radius: 999px;
        background: #fff;
        color: #000;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 500;
      }

      .playground-configure-announcement-icon {
        width: 13px;
        height: 13px;
        color: rgba(255, 255, 255, 0.55);
      }

      .playground-configure-hero {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-configure-kicker {
        font-size: 13px;
        line-height: 1.4;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.42);
      }

      .playground-configure-title {
        margin: 0;
        font-size: 28px;
        line-height: 1.12;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-configure-card-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .playground-configure-feature-card {
        min-height: 180px;
        padding: 18px;
        border: 0;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.94);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        text-align: left;
        cursor: pointer;
        box-sizing: border-box;
        transition: background-color 160ms ease, transform 160ms ease;
      }

      .playground-configure-feature-card:hover {
        background: rgba(255, 255, 255, 0.11);
        transform: translateY(-1px);
      }

      .playground-configure-feature-art {
        width: 72px;
        height: 72px;
        border-radius: 22px;
        background:
          radial-gradient(circle at 72% 28%, rgba(77, 163, 255, 0.45), transparent 34%),
          radial-gradient(circle at 24% 72%, rgba(34, 197, 94, 0.3), transparent 36%),
          rgba(0, 0, 0, 0.2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .playground-configure-feature-icon {
        width: 26px;
        height: 26px;
      }

      .playground-configure-feature-label {
        width: 100%;
        text-align: center;
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.94);
      }

      .playground-configure-sections {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr);
        gap: 56px;
        align-items: flex-start;
      }

      .playground-configure-section {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-configure-section-title {
        margin: 0;
        font-size: 17px;
        line-height: 1.2;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-configure-resource-list,
      .playground-configure-action-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .playground-configure-resource-row,
      .playground-configure-action-row {
        width: 100%;
        min-height: 58px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.9);
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        text-align: left;
        cursor: pointer;
      }

      .playground-configure-resource-icon,
      .playground-configure-action-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.08);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-configure-resource-icon svg,
      .playground-configure-action-icon svg {
        width: 18px;
        height: 18px;
      }

      .playground-configure-row-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .playground-configure-row-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-configure-row-subtitle {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-configure-row-meta {
        min-width: 30px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        font-weight: 500;
        text-align: right;
      }

`;
