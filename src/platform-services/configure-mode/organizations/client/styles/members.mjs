export const ORGANIZATIONS_MEMBERS_CSS = `      .playground-organization-admin-page.is-members-page .playground-team-shell {
        gap: 0;
      }

      .playground-organization-members-card {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-members-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding: 28px 24px 24px;
      }

      .playground-organization-members-heading {
        min-width: 0;
      }

      .playground-organization-members-title {
        margin: 0;
        color: #fff;
        font-size: 18px;
        font-weight: 400;
        line-height: 1.25;
        letter-spacing: 0;
      }

      .playground-organization-members-description {
        max-width: 680px;
        margin: 8px 0 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.5;
        letter-spacing: 0;
      }

      .playground-organization-members-invite-button {
        flex: 0 0 auto;
      }

      .playground-organization-members-tabs {
        padding: 22px 24px 0;
      }

      .playground-organization-members-tab-bar .platform-detail-tab-bar__list {
        flex: 0 1 auto;
        gap: 28px;
      }

      .playground-organization-members-tab-bar .platform-detail-tab-bar__tab {
        min-height: 32px;
        padding-bottom: 10px;
        font-size: 12px;
      }

      .playground-organization-members-tab-label {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .playground-organization-members-tab-count {
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.58);
        font-size: 10px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-organization-members-tab-bar .platform-detail-tab-bar__tab.is-active .playground-organization-members-tab-count {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
      }

      .playground-organization-members-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 18px 24px 20px;
      }

      .playground-organization-members-search.platform-search {
        flex: 1 1 auto;
        width: auto;
        min-width: 0;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-members-table {
        min-width: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-organization-members-platform-data-table {
        --platform-data-table-minimal-inline-padding: 24px;
        --platform-data-table-surface: transparent;
        --platform-data-table-body-background: transparent;
        --platform-data-table-row-background: transparent;
        --platform-data-table-header-background: transparent;
        --platform-data-table-sticky-background: transparent;
        gap: 0;
      }

      .playground-organization-members-platform-data-table .platform-data-table__surface,
      .playground-organization-members-platform-data-table .platform-data-table__sticky,
      .playground-organization-members-platform-data-table .platform-data-table__header-group,
      .playground-organization-members-platform-data-table .platform-data-table__scroll,
      .playground-organization-members-platform-data-table .platform-data-table__body {
        background: transparent;
      }

      .playground-organization-members-card .platform-data-table.is-minimalistic-ui .platform-data-table__header {
        min-height: 44px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-organization-members-platform-data-table .platform-data-table__row {
        min-height: 58px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        background: rgba(0, 0, 0, 0.08);
      }

      .playground-organization-members-platform-data-table .platform-data-table__row:hover {
        background: rgba(255, 255, 255, 0.0375);
      }

      .playground-organization-members-card .platform-data-table.is-minimalistic-ui .platform-data-table__footer,
      .playground-organization-members-card .platform-data-table.is-minimalistic-ui .platform-data-table__pagination {
        min-height: 42px;
        padding-top: 6px;
        padding-bottom: 6px;
        border-top: 0;
        background: transparent;
      }

      .playground-organization-member-role-selector {
        max-width: 100%;
      }

      .playground-organization-member-role-selector .platform-selector__trigger {
        min-height: 28px;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-organization-member-role-label {
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .playground-organization-member-workspace-label {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-organization-members-platform-data-table .playground-team-member-avatar {
        width: 26px;
        height: 26px;
        flex: 0 0 26px;
      }

      @media (max-width: 720px) {
        .playground-organization-members-header {
          align-items: stretch;
          flex-direction: column;
          padding: 22px 20px 18px;
        }

        .playground-organization-members-invite-button {
          align-self: flex-start;
        }

        .playground-organization-members-tabs {
          padding-right: 20px;
          padding-left: 20px;
        }

        .playground-organization-members-controls {
          align-items: stretch;
          flex-direction: column;
          padding-right: 20px;
          padding-left: 20px;
        }

        .playground-organization-members-search.platform-search {
          width: 100%;
        }

        .playground-organization-members-platform-data-table {
          --platform-data-table-minimal-inline-padding: 20px;
        }
      }
`;
