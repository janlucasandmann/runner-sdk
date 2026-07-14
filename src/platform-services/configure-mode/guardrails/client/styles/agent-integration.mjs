export const GUARDRAILS_AGENT_INTEGRATION_CSS = `      .playground-agents-detail-guardrails-section .playground-plugins-section-header {
        align-items: center;
      }

      .playground-agents-detail-guardrails-section .playground-plugins-toolbar-controls {
        margin-left: auto;
      }

      .playground-agents-detail-guardrails-section .playground-project-overview-threads-table-header,
      .playground-agents-detail-guardrails-section .playground-project-overview-threads-table-row {
        grid-template-columns: minmax(0, 1.45fr) minmax(80px, 0.5fr) minmax(0, 1.65fr) minmax(92px, 0.52fr) 28px;
      }

      .playground-agents-detail-guardrails-section .playground-project-overview-threads-table {
        max-width: 100%;
        min-width: 0;
        overflow: hidden;
      }

      .playground-agents-detail-guardrail-resource-title {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 9px;
      }

      .playground-agents-detail-guardrail-icon {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid rgba(84, 229, 166, 0.58);
        color: #54e5a6;
        background: transparent;
        box-shadow: inset 0 0 0 2px rgba(84, 229, 166, 0.12);
      }

      .playground-agents-detail-guardrails-section .playground-project-overview-thread-cell.is-prompts,
      .playground-agents-detail-guardrails-section .playground-project-overview-thread-cell.is-description {
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.62);
      }

      .playground-agents-detail-guardrails-section .playground-project-overview-thread-cell.is-prompts,
      .playground-agents-detail-guardrails-section .playground-project-overview-thread-cell.is-date {
        white-space: nowrap;
      }

      .playground-agents-detail-guardrail-import-shell .playground-tasks-toolbar-popup-menu {
        left: auto;
        right: 0;
        transform-origin: top right;
      }

      .playground-agents-detail-guardrail-import-menu {
        min-width: 260px;
        max-width: 340px;
      }

      .playground-agents-detail-guardrail-import-menu .tb-popup-empty-state {
        padding: 10px 12px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.35;
      }

`;
