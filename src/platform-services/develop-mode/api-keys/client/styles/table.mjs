export const API_KEYS_TABLE_CSS = `      .playground-settings-api-keys-table {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .playground-settings-api-keys-table-header,
      .playground-settings-api-keys-table-row {
        display: grid;
        grid-template-columns: minmax(0, 2.2fr) minmax(116px, 0.95fr) minmax(112px, 0.9fr) minmax(112px, 0.9fr) minmax(168px, 1.15fr) minmax(96px, 0.8fr) 32px;
        align-items: center;
        gap: 16px;
      }

      .playground-settings-api-keys-table-header {
        min-height: 34px;
        padding: 0 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 11px;
        line-height: 1.4;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.45);
        letter-spacing: 0.02em;
      }

      .playground-settings-api-keys-table-row {
        min-height: 50px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .playground-settings-api-keys-table-row:last-child {
        border-bottom: 0;
      }

      .playground-settings-api-keys-table-row:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .playground-settings-api-keys-cell {
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.56);
      }

      .playground-settings-api-keys-cell.is-name {
        color: rgba(255, 255, 255, 1);
      }

      .playground-settings-api-keys-cell.is-date,
      .playground-settings-api-keys-cell.is-permissions {
        white-space: nowrap;
      }

      .playground-settings-api-keys-cell.is-created-by,
      .playground-settings-api-keys-cell.is-secret {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-settings-api-keys-cell.is-secret {
        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
      }

      .playground-settings-api-keys-name-row {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .playground-settings-api-keys-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-settings-api-keys-pill {
        flex-shrink: 0;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.6);
        font-size: 10px;
        line-height: 1.2;
      }

      .playground-settings-api-keys-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .playground-settings-api-keys-action-button {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.94);
        transition: background 160ms ease, border-color 160ms ease, opacity 160ms ease;
      }

      .playground-settings-api-keys-action-button:hover {
        border-color: rgba(248, 113, 113, 0.2);
        background: rgba(239, 68, 68, 0.1);
      }

`;
