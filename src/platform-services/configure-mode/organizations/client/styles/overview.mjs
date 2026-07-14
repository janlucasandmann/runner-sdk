export const ORGANIZATIONS_OVERVIEW_CSS = `      .playground-team-page.is-organization-overview-page,
      .playground-team-page.is-team-overview-page {
        background-image:
          linear-gradient(
            to bottom,
            transparent,
            transparent 200px,
            #000 400px
          ),
          url('/img/bg/organizations.webp');
        background-position: top center;
        background-repeat: no-repeat;
        background-size: 100% 100%, 100% auto;
      }

      .playground-organization-overview-page.is-develop-configure-page {
        background: transparent;
      }

      .playground-organization-overview-content {
        background: transparent;
      }

      .playground-organization-overview-hero-intro {
        height: 280px;
        min-height: 280px;
        padding: 0;
        box-sizing: border-box;
        color: #fff;
        text-shadow: none;
      }

      .playground-organization-overview-hero-title {
        margin: 0;
        max-width: 620px;
        font-size: 18px;
        font-weight: 500;
        line-height: 1.1;
        letter-spacing: 0;
      }

      .playground-organization-overview-hero-description {
        max-width: 320px;
        margin: 14px 0 0;
        color: rgba(255, 255, 255, 0.76);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.6;
      }

      .playground-organization-overview-hero-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 24px;
        text-shadow: none;
      }

      .playground-organization-overview-docs-button {
        background: #fff;
        color: #000;
        font-size: 12px;
      }

      .playground-organization-overview-docs-button:hover {
        background: rgba(255, 255, 255, 0.9);
        color: #000;
      }

      .playground-team-overview-page.playground-organization-overview-page.is-develop-configure-page .playground-organization-overview-table-section {
        background: rgba(255, 255, 255, 0.075) !important;
        -webkit-backdrop-filter: blur(50px) !important;
        backdrop-filter: blur(50px) !important;
      }

      .playground-team-overview-page.playground-organization-overview-page.is-develop-configure-page .playground-organization-overview-sticky-table-header,
      .playground-team-overview-page.playground-organization-overview-page.is-develop-configure-page .playground-organization-overview-toolbar-row {
        background: transparent !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      @media (max-width: 720px) {
        .playground-organization-overview-hero-intro {
          height: 280px;
          min-height: 280px;
          padding: 0;
        }

        .playground-organization-overview-hero-title {
          font-size: 18px;
        }
      }
`;
