export const GUARDRAILS_PAGE_OVERVIEW_CSS = `      .playground-guardrails-layout {
        width: 100%;
        min-height: 0;
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .playground-guardrails-overview-shell {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin: 0 auto;
      }

      .playground-guardrails-page .playground-guardrails-browser-header.playground-guardrails-overview-browser-header,
      .playground-guardrails-page .playground-guardrails-browser-body.playground-guardrails-overview-browser-body {
        width: 100%;
        max-width: none;
        padding-left: 24px;
        padding-right: 24px;
      }

      .playground-guardrails-page .playground-guardrails-overview-browser-header > .playground-files-library-header {
        width: min(100%, var(--playground-centered-page-max-width));
        max-width: var(--playground-centered-page-max-width);
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 12px;
      }

      .playground-guardrails-list-panel,
`;
