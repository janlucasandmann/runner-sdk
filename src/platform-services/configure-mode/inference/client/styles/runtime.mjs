export const INFERENCE_STYLE_RUNTIME = `      .playground-settings-runtime-card {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .playground-settings-runtime-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .playground-settings-runtime-target {
        position: relative;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        background: rgba(0, 0, 0, 0.2);
      }

      .playground-settings-runtime-target-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .playground-settings-runtime-target-title {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
      }

      .playground-settings-runtime-target-icon {
        width: 15px;
        height: 15px;
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-settings-runtime-status {
        flex: 0 0 auto;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.62);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: 1;
      }

      .playground-settings-runtime-status.is-active {
        background: rgba(255, 255, 255, 0.92);
        color: rgba(0, 0, 0, 0.9);
      }

      .playground-settings-runtime-status.is-foundation {
        background: rgba(126, 255, 255, 0.12);
        color: #7effff;
      }

      .playground-settings-runtime-target-copy {
        margin: 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-settings-runtime-capabilities {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .playground-settings-runtime-capability {
        min-width: 0;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-settings-runtime-capability-label {
        color: rgba(255, 255, 255, 0.45);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.12em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .playground-settings-runtime-capability-value {
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.84);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-settings-runtime-note {
        padding-top: 2px;
        color: rgba(255, 255, 255, 0.46);
        font-size: 12px;
        line-height: 1.6;
      }
`;

