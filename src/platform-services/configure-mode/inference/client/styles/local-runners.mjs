export const INFERENCE_STYLE_LOCAL_RUNNERS = `      .playground-settings-local-runners-card {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .playground-settings-local-runners-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-settings-local-runners-actions {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
      }

      .playground-settings-local-runners-refresh {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        min-height: 30px;
        padding: 6px 12px;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.86);
        font-size: 12px;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
      }

      .playground-settings-local-runners-refresh.is-primary {
        background: rgba(255, 255, 255, 0.92);
        color: rgba(0, 0, 0, 0.92);
      }

      .playground-settings-local-runners-refresh:disabled {
        cursor: default;
        opacity: 0.55;
      }

      .playground-settings-local-runner-onboarding {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 14px;
        padding: 14px;
        border: 1px solid rgba(126, 255, 255, 0.12);
        border-radius: 18px;
        background: rgba(126, 255, 255, 0.045);
      }

      .playground-settings-local-runner-onboarding > .playground-settings-local-runner-command-stack,
      .playground-settings-local-runner-onboarding > .playground-settings-muted-copy,
      .playground-settings-local-runner-onboarding > .playground-settings-inline-status {
        grid-column: 1 / -1;
      }

      .playground-settings-local-runner-onboarding > .playground-settings-local-binding-form-actions {
        align-self: start;
        justify-content: flex-end;
      }

      .playground-settings-local-runner-onboarding-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
      }

      .playground-settings-local-runner-onboarding-copy {
        margin-top: 6px;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-settings-local-runner-command-stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .playground-settings-local-runner-command {
        min-width: 0;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.24);
        color: rgba(255, 255, 255, 0.78);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 11px;
        line-height: 1.55;
        overflow-x: auto;
        white-space: pre;
      }

      .playground-settings-local-binding-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-settings-local-binding-form-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
      }

      .playground-settings-local-binding-form-title {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.3;
      }

      .playground-settings-local-binding-form-copy {
        margin-top: 5px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.55;
      }

      .playground-settings-local-binding-form-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .playground-settings-local-runners-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .playground-settings-local-runner-card {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 14px;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.035);
      }

      .playground-settings-local-runner-main {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .playground-settings-local-runner-identity {
        min-width: 0;
        display: flex;
        align-items: flex-start;
        gap: 11px;
      }

      .playground-settings-local-runner-icon {
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(126, 255, 255, 0.09);
        color: #7effff;
      }

      .playground-settings-local-runner-name {
        color: rgba(255, 255, 255, 0.92);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
      }

      .playground-settings-local-runner-meta {
        margin-top: 4px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.45;
        word-break: break-word;
      }

      .playground-settings-local-runner-status {
        flex: 0 0 auto;
        padding: 5px 9px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.62);
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
      }

      .playground-settings-local-runner-status.is-online {
        background: rgba(126, 255, 255, 0.12);
        color: #7effff;
      }

      .playground-settings-local-runner-facts {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .playground-settings-local-runner-fact {
        min-width: 0;
        padding: 10px;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.18);
      }

      .playground-settings-local-runner-fact-label {
        color: rgba(255, 255, 255, 0.42);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .playground-settings-local-runner-fact-value {
        margin-top: 7px;
        color: rgba(255, 255, 255, 0.82);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        word-break: break-word;
      }

      .playground-settings-local-runner-bindings {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .playground-settings-local-runner-binding {
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 10px;
        align-items: center;
        padding: 9px 10px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.045);
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px;
        line-height: 1.35;
      }

      .playground-settings-local-runner-binding-path {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-settings-local-runner-binding-pill {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        white-space: nowrap;
      }

      .playground-settings-local-runners-empty {
        padding: 18px;
        border: 1px dashed rgba(255, 255, 255, 0.11);
        border-radius: 18px;
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
        line-height: 1.6;
      }

      @media (max-width: 980px) {
        .playground-settings-runtime-grid,
        .playground-settings-runtime-capabilities,
        .playground-settings-local-runner-facts {
          grid-template-columns: 1fr;
        }

        .playground-settings-local-runners-header,
        .playground-settings-local-runner-main {
          flex-direction: column;
        }

        .playground-settings-local-runners-actions {
          width: 100%;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        .playground-settings-local-runner-onboarding {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-settings-local-binding-form-top {
          flex-direction: column;
        }

        .playground-settings-local-binding-form-actions {
          justify-content: flex-start;
        }

        .playground-settings-local-runner-binding {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;

