export const TEAMS_RESPONSIVE_CSS = `      @media (max-width: 900px) {
        .playground-team-shell {
          width: 100%;
        }

        .playground-team-page {
          padding: 24px 16px 44px;
        }

        .playground-team-hero,
        .playground-team-form,
        .playground-team-grid,
        .playground-team-overview-layout,
        .playground-team-inline-editor,
        .playground-team-inline-editor.is-resource-share {
          grid-template-columns: 1fr;
          flex-direction: column;
          align-items: stretch;
        }

        .playground-team-hero-meta {
          align-items: flex-start;
        }

        .playground-team-detail-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-team-detail-actions {
          justify-content: flex-start;
        }

        .playground-team-modal-form-grid {
          grid-template-columns: 1fr;
        }

        .playground-team-row {
          grid-template-columns: minmax(0, 1fr);
          align-items: stretch;
        }

        .playground-organization-billing-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .playground-team-role-pages {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-team-role-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .playground-organization-billing-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-organization-billing-header,
        .playground-organization-billing-activity-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .playground-team-role-list {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-team-role-permission-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }
`;

