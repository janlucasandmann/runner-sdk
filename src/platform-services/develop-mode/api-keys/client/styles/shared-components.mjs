export const API_KEYS_SHARED_COMPONENTS_CSS = `      .playground-settings-api-key-card,
      .playground-settings-trigger-card,
      .playground-settings-scope-option {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
      }

      .playground-settings-api-key-card.is-revoked {
        border-color: rgba(239, 68, 68, 0.3);
        opacity: 0.6;
      }

      .playground-settings-trigger-card,
      .playground-settings-scope-option {
        cursor: pointer;
        text-align: left;
      }

      .playground-settings-trigger-card:hover,
      .playground-settings-scope-option:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-settings-scope-option.is-active {
        border-color: rgba(137, 182, 255, 0.26);
        background: rgba(137, 182, 255, 0.08);
      }

      .playground-settings-api-key-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-settings-api-key-title-wrap {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .playground-settings-api-key-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-settings-api-key-name {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-settings-api-key-badge {
        display: inline-flex;
        align-items: center;
        min-height: 20px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 600;
      }

      .playground-settings-api-key-badge.is-neutral {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(209, 213, 219, 0.9);
      }

      .playground-settings-api-key-badge.is-primary {
        background: rgba(59, 130, 246, 0.2);
        color: rgba(147, 197, 253, 0.98);
      }

      .playground-settings-api-key-badge.is-danger {
        background: rgba(239, 68, 68, 0.2);
        color: rgba(248, 113, 113, 0.98);
      }

      .playground-settings-api-key-description,
      .playground-settings-api-key-managed-copy {
        margin: 0;
        font-size: 12px;
        line-height: 1.5;
      }

      .playground-settings-api-key-description {
        color: rgba(156, 163, 175, 0.95);
      }

      .playground-settings-api-key-managed-copy {
        color: rgba(107, 114, 128, 0.95);
      }

      .playground-settings-api-key-revoke {
        min-width: 74px;
        min-height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        border-radius: 10px;
        border: 0;
        background: transparent;
        color: rgba(156, 163, 175, 0.95);
        font-size: 12px;
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
      }

      .playground-settings-api-key-revoke:hover {
        background: rgba(239, 68, 68, 0.08);
        color: rgba(248, 113, 113, 0.98);
      }

      .playground-settings-api-key-preview {
        display: block;
        width: 100%;
        font-family: SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        color: rgba(156, 163, 175, 0.95);
        overflow-wrap: anywhere;
      }

      .playground-settings-api-key-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-settings-api-key-stat {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
      }

      .playground-settings-api-key-stat-label {
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(107, 114, 128, 0.95);
      }

      .playground-settings-api-key-stat-value {
        margin-top: 6px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.96);
      }

      .playground-settings-api-key-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        font-size: 10px;
        color: rgba(156, 163, 175, 0.95);
      }

      .playground-settings-created-key-notice {
        position: relative;
        padding: 16px;
        border-radius: 14px;
        border: 1px solid rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.08);
      }

      .playground-settings-created-key-row {
        display: block;
      }

      .playground-settings-created-key-title {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 400;
        color: #fff;
      }

      .playground-settings-created-key-copy {
        margin: 0 0 12px;
        font-size: 12px;
        color: rgba(209, 213, 219, 0.82);
      }

      .playground-settings-inline-code,
      .playground-settings-code {
        display: block;
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.36);
        color: #d1e0ff;
        font-family: SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .playground-settings-code-row {
        display: flex;
        align-items: stretch;
        gap: 10px;
      }

      .playground-settings-created-key-secret {
        position: relative;
        min-width: 0;
      }

      .playground-settings-created-key-value.playground-settings-code {
        box-sizing: border-box;
        padding-right: 52px;
        color: rgba(255, 255, 255, 0.8);
      }

      .playground-settings-created-key-copy-button.playground-settings-icon-button {
        position: absolute;
        top: 50%;
        right: 6px;
        width: 30px;
        min-width: 30px;
        height: 30px;
        transform: translateY(-50%);
      }

      .playground-settings-created-key-dismiss-button.playground-settings-icon-button {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .playground-settings-icon-button {
        width: 36px;
        min-width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.72);
        cursor: pointer;
      }

      .playground-settings-inline-button {
        min-height: 34px;
      }

      .playground-settings-api-key-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
`;
