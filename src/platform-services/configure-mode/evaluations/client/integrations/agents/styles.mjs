export const EVALUATIONS_AGENT_STYLES = `      .playground-agents-detail-evaluations-section .playground-project-overview-threads-table-header,
      .playground-agents-detail-evaluations-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(180px, 1.4fr) minmax(82px, 0.42fr) minmax(108px, 0.56fr) minmax(76px, 0.38fr) minmax(92px, 0.48fr) 24px;
        gap: 12px;
      }

      .playground-agents-detail-evaluation-version-section .playground-project-overview-threads-table-header,
      .playground-agents-detail-evaluation-version-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(120px, 0.8fr) minmax(86px, 0.44fr) minmax(96px, 0.48fr) minmax(112px, 0.58fr) minmax(86px, 0.42fr) 24px;
        gap: 12px;
      }

      .playground-agents-detail-evaluations-section .playground-project-overview-thread-cell,
      .playground-agents-detail-evaluation-version-section .playground-project-overview-thread-cell {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }

      .playground-agents-detail-evaluation-score,
      .playground-agents-detail-evaluation-version {
        color: rgba(255, 255, 255, 0.92);
        font-size: 12px;
        font-weight: 500;
      }

      .playground-agents-detail-evaluation-env {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-width: 0;
        max-width: 100%;
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-agents-detail-evaluation-env svg {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.68);
      }

      .playground-agents-detail-evaluation-status {
        display: inline-flex;
        align-items: center;
        width: max-content;
        max-width: 100%;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(45, 212, 137, 0.18);
        color: rgba(190, 255, 221, 0.95);
        font-size: 11px;
        line-height: 1;
        text-transform: lowercase;
      }

      .playground-agents-detail-evaluation-status.is-running {
        background: rgba(102, 166, 255, 0.18);
        color: rgba(198, 224, 255, 0.95);
      }

      .playground-agents-detail-evaluation-status.is-failed {
        background: rgba(255, 92, 122, 0.16);
        color: rgba(255, 195, 205, 0.95);
      }

      .playground-agents-detail-evaluation-detail-back {
        margin: 0 0 8px;
      }

      .playground-agents-detail-evaluation-modal .playground-mission-control-modal-body {
        gap: 14px;
      }

      .playground-agents-detail-evaluation-modal-error {
        color: rgba(255, 158, 176, 0.95);
        font-size: 12px;
        line-height: 1.45;
      }
`;
