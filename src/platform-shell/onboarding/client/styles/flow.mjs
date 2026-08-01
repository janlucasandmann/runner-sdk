export const ONBOARDING_FLOW_CSS = String.raw`        .playground-onboarding-header {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 24px 24px 0;
        }
  
        .playground-onboarding-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }
  
        .playground-onboarding-header-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
  
        .playground-onboarding-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
  
        .playground-onboarding-kicker {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }
  
        .playground-onboarding-title {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
          line-height: 1.12;
          color: rgba(255, 255, 255, 0.98);
        }
  
        .playground-onboarding-step-meta {
          width: 100%;
        }
  
        .playground-onboarding-progress {
          width: 100%;
        }
  
        .playground-onboarding-progress-track {
          width: 100%;
          height: 2px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
  
        .playground-onboarding-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: rgba(255, 255, 255, 1);
          transition: width 180ms ease;
        }
  
        .playground-onboarding-progress-label {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.58);
        }
  
        .playground-onboarding-close {
          width: 36px;
          height: 36px;
          padding: 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: rgba(255, 255, 255, 0.72);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
  
        .playground-onboarding-close:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
  
        .playground-onboarding-body {
          min-height: 0;
          overflow: auto;
          padding: 24px;
        }
  
        .playground-onboarding-step {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
  
        .playground-onboarding-concept-step {
          min-height: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 24px;
        }
  
        .playground-onboarding-concept-hero {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(280px, 0.88fr);
          align-items: center;
          gap: 24px;
        }
  
        .playground-onboarding-concept-copy-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 16px;
          text-align: left;
        }
  
        .playground-onboarding-concept-preview-panel {
          width: 100%;
          min-height: 248px;
          border-radius: 5px;
          background:
            linear-gradient(180deg, rgba(8, 15, 26, 0.42) 0%, rgba(8, 15, 26, 0.72) 100%),
            url("/img/agent-profile-pics/starbg.jpeg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
          padding-left: 24px;
          padding-top: 24px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: hidden;
        }
  
        .playground-onboarding-concept-preview-image {
          width: auto;
          height: auto;
          max-width: 100%;
          border-radius: 5px 0 5px 0;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: visible;
        }
  
        .playground-onboarding-concept-preview-asset {
          display: block;
          width: auto;
          height: auto;
          border-radius: inherit;
          max-width: min(100%, 560px);
          max-height: 244px;
          object-fit: contain;
          object-position: right bottom;
        }
  
        .playground-onboarding-concept-visual,
        .playground-onboarding-concept-image,
        .playground-onboarding-concept-icon {
          display: none;
        }
  
        .playground-onboarding-concept-title {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.12;
          color: rgba(255, 255, 255, 0.98);
        }
  
        .playground-onboarding-concept-copy {
          margin: 0;
          max-width: 420px;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.62);
        }
  
        .playground-onboarding-concept-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
  
        .playground-onboarding-detail-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
  
        .playground-onboarding-detail-card {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-left: 0;
        }
  
        .playground-onboarding-detail-card-title {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.92);
        }
  
        .playground-onboarding-detail-card-copy {
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.58);
        }
  
        .playground-onboarding-plan-panel {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 14px;
        }
  
        .playground-onboarding-plan-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
  
        .playground-onboarding-plan-features-inline {
          width: 100%;
          max-width: 420px;
          margin-top: 8px;
        }
  
        .playground-onboarding-plan-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.68);
        }
  
        .playground-onboarding-plan-feature-icon {
          width: 15px;
          height: 15px;
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.88);
          flex-shrink: 0;
        }
  
        .playground-onboarding-plan-price {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 34px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.98);
        }
  
        .playground-onboarding-plan-price-after {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.52);
        }
  
        .playground-onboarding-plan-price-copy {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.52);
        }
  
        .playground-onboarding-plan-offer {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.76);
        }
  
        .playground-onboarding-plan-cta {
          width: 100%;
          margin-top: 16px;
          background: #fff;
          color: #111;
          border-radius: 999px;
        }
  
        .playground-onboarding-hero {
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }
  
        .playground-onboarding-hero-logo {
          width: 52px;
          height: 52px;
          padding: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #111;
          object-fit: contain;
          flex-shrink: 0;
        }
  
        .playground-onboarding-hero-copy {
          min-width: 0;
          flex: 1;
        }
  
        .playground-onboarding-hero-title {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.12;
          color: rgba(255, 255, 255, 0.98);
        }
  
        .playground-onboarding-hero-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.66);
        }
  
        .playground-onboarding-feature-grid,
        .playground-onboarding-grid,
        .playground-onboarding-connector-grid {
          display: grid;
          gap: 12px;
        }
  
        .playground-onboarding-feature-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
  
        .playground-onboarding-grid {
          grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
          align-items: start;
        }
  
        .playground-onboarding-feature-card,
        .playground-onboarding-panel,
        .playground-onboarding-connector-card,
        .playground-onboarding-sdk-card,
        .playground-onboarding-auth-card {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }
  
        .playground-onboarding-feature-card {
          padding: 16px;
        }
  
        .playground-onboarding-feature-icon {
          width: 18px;
          height: 18px;
          margin-bottom: 14px;
          color: rgba(255, 255, 255, 0.92);
        }
  
        .playground-onboarding-feature-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.96);
        }
  
        .playground-onboarding-feature-copy,
        .playground-onboarding-panel-copy,
        .playground-onboarding-sdk-note,
        .playground-onboarding-auth-copy {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.6);
        }
  
        .playground-onboarding-panel {
          padding: 14px;
        }
  
        .playground-onboarding-panel-title {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
  
        .playground-onboarding-presets {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
  
        .playground-onboarding-preset {
          width: 100%;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
        }
  
        .playground-onboarding-preset:hover {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.04);
        }
  
        .playground-onboarding-preset.is-active {
          border-color: rgba(125, 176, 255, 0.36);
          background: rgba(125, 176, 255, 0.12);
        }
  
        .playground-onboarding-preset-title {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.96);
        }
  
        .playground-onboarding-preset-copy {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.58);
        }
  
        .playground-onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
  
        .playground-onboarding-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
  
        .playground-onboarding-label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.74);
        }
  
        .playground-onboarding-input,
        .playground-onboarding-select,
        .playground-onboarding-textarea {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          background: #212121;
          color: rgba(255, 255, 255, 0.96);
          outline: none;
          font-size: 13px;
          line-height: 1.5;
        }
  
        .playground-onboarding-input,
        .playground-onboarding-select {
          min-height: 42px;
          padding: 0 14px;
        }
  
        .playground-onboarding-textarea {
          min-height: 168px;
          padding: 12px 14px;
          resize: vertical;
        }
  
        .playground-onboarding-helper {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.5);
        }
  
        .playground-onboarding-status {
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.64);
        }
  
        .playground-onboarding-status.is-success {
          border-color: rgba(88, 211, 126, 0.22);
          background: rgba(88, 211, 126, 0.12);
          color: rgba(195, 255, 208, 0.92);
        }
  
        .playground-onboarding-status.is-error {
          border-color: rgba(248, 113, 113, 0.22);
          background: rgba(248, 113, 113, 0.12);
          color: rgba(255, 205, 205, 0.92);
        }
  
        .playground-onboarding-connector-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
  
        .playground-onboarding-connector-card {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
  
        .playground-onboarding-connector-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
  
        .playground-onboarding-connector-logo {
          width: 18px;
          height: 18px;
          object-fit: contain;
          flex-shrink: 0;
        }
  
        .playground-onboarding-connector-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.96);
        }
  
        .playground-onboarding-connector-copy {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.58);
        }
  
        .playground-onboarding-connector-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
  
        .playground-onboarding-connector-status {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.56);
        }
  
        .playground-onboarding-connector-status.is-connected {
          color: rgba(195, 255, 208, 0.92);
        }
  
        .playground-onboarding-upload-zone {
          border: 1px dashed rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.02);
          min-height: 164px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          cursor: pointer;
          transition: border-color 160ms ease, background-color 160ms ease;
        }
  
        .playground-onboarding-upload-zone.is-dragging {
          border-color: rgba(125, 176, 255, 0.34);
          background: rgba(125, 176, 255, 0.08);
        }
  
        .playground-onboarding-upload-icon {
          width: 18px;
          height: 18px;
          color: rgba(255, 255, 255, 0.92);
        }
  
        .playground-onboarding-upload-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.96);
        }
  
        .playground-onboarding-upload-copy {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.56);
        }
  
        .playground-onboarding-upload-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
  
        .playground-onboarding-upload-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
  
        .playground-onboarding-upload-item-main {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }
  
        .playground-onboarding-upload-item-name {
          min-width: 0;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.92);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
  
        .playground-onboarding-upload-item-meta {
          flex-shrink: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.52);
        }
  
        .playground-onboarding-sdk-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-radius: 15px;
        }
  
        .playground-onboarding-sdk-title-row,
        .playground-onboarding-key-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
  
        .playground-onboarding-sdk-title {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.96);
        }
  
        .playground-onboarding-key-value {
          min-width: 0;
          flex: 1;
          padding: 12px 14px;
          border-radius: 14px;
          background: #212121;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.88);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
  
        .playground-onboarding-key-actions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
  
        .playground-onboarding-icon-button {
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.82);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
  
        .playground-onboarding-icon-button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
  
        .playground-onboarding-code {
          margin: 0;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: #111;
          color: rgba(255, 255, 255, 0.9);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          line-height: 1.65;
          white-space: pre-wrap;
          word-break: break-word;
        }
  
        .playground-onboarding-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
  
        .playground-onboarding-footer-actions {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
  
        .playground-onboarding-button {
          min-height: 36px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
  
        .playground-onboarding-button:hover {
          background: rgba(255, 255, 255, 0.08);
        }
  
        .playground-onboarding-button.is-primary {
          background: #fff;
          color: #111;
          border-color: rgba(255, 255, 255, 0.16);
        }
  
        .playground-onboarding-button.is-primary:hover {
          background: rgba(255, 255, 255, 0.92);
        }
  
        .playground-onboarding-button.is-ghost {
          background: transparent;
          border-color: transparent;
          color: rgba(255, 255, 255, 0.56);
        }
  
        .playground-onboarding-button:disabled,
        .playground-onboarding-icon-button:disabled,
        .playground-onboarding-preset:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
  
        .playground-onboarding-auth-card {
          width: min(480px, 100%);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
  
        .playground-onboarding-auth-actions,
        .playground-onboarding-auth-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
  
        .playground-onboarding-auth-button {
          width: 100%;
          justify-content: center;
        }
  
        .playground-onboarding-auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.38);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
  
        .playground-onboarding-auth-divider::before,
        .playground-onboarding-auth-divider::after {
          content: "";
          flex: 1 1 auto;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }
  
        .playground-onboarding-auth-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.96);
          font-size: 13px;
          outline: none;
          transition: border-color 160ms ease, background-color 160ms ease;
        }
  
        .playground-onboarding-auth-input::placeholder {
          color: rgba(255, 255, 255, 0.36);
        }
  
        .playground-onboarding-auth-input:focus {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.05);
        }
  
        .playground-onboarding-auth-help {
          margin: -2px 0 0;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.5);
        }
  
        .playground-onboarding-auth-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.98);
        }
  
        @media (max-width: 920px) {
          .playground-onboarding-grid,
          .playground-onboarding-feature-grid,
          .playground-onboarding-connector-grid,
          .playground-onboarding-detail-grid,
          .playground-onboarding-plan-panel {
            grid-template-columns: 1fr;
          }
  
          .playground-onboarding-concept-hero {
            grid-template-columns: 1fr;
          }
  
          .playground-onboarding-concept-copy-column {
            gap: 14px;
          }
  
          .playground-onboarding-concept-preview-panel {
            min-height: 200px;
          }
        }
  
        .playground-onboarding-pane {
          min-width: 0;
          min-height: 0;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          padding: 18px 28px 20px;
        }
  
        .playground-onboarding-screen-surface.is-welcome .playground-onboarding-pane.is-config.is-welcome {
          opacity: 0;
          transform: translateX(-100%);
          transition:
            opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
  
        .playground-onboarding-screen-surface.is-welcome.is-welcome-video-started .playground-onboarding-pane.is-config.is-welcome {
          opacity: 1;
          transform: translateX(0);
        }
  
        .playground-onboarding-screen-surface.is-welcome .playground-onboarding-pane.is-explain.is-welcome {
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-leaving .playground-onboarding-pane.is-config {
          opacity: 0;
          transform: translateX(-100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-welcome.is-onboarding-transition-leaving .playground-onboarding-pane.is-config.is-welcome {
          opacity: 0;
          transform: translateX(-100%);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-leaving .playground-onboarding-pane.is-explain {
          opacity: 0;
          transform: translateX(100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-entering .playground-onboarding-pane.is-config {
          animation: playgroundOnboardingPaneInLeft 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-entering .playground-onboarding-pane.is-explain {
          animation: playgroundOnboardingPaneInRight 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-pane-transition-leaving .playground-onboarding-pane.is-config {
          opacity: 0;
          transform: translateX(-100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-pane-transition-leaving .playground-onboarding-pane.is-explain {
          opacity: 0;
          transform: translateX(100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-pane-transition-entering .playground-onboarding-pane.is-config {
          animation: playgroundOnboardingPaneInLeft 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-pane-transition-entering .playground-onboarding-pane.is-explain {
          animation: playgroundOnboardingPaneInRight 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-free-exit-active .playground-onboarding-pane.is-config {
          opacity: 0;
          transform: translateX(-100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-free-exit-active .playground-onboarding-pane.is-explain {
          opacity: 0;
          transform: translateX(100%);
          transition:
            opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }
  
        .playground-onboarding-screen-surface.is-onboarding-free-exit-fading .playground-onboarding-video-bg {
          opacity: 0;
        }
  
        .playground-onboarding-transition-loader {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
  
        .playground-onboarding-transition-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.36);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: rgba(255, 255, 255, 0.94);
          font-size: 13px;
          font-weight: 400;
          line-height: 1;
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          opacity: 0;
          transform: scale(0);
          transform-origin: center center;
        }
  
        .playground-onboarding-transition-dot-loader {
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
  
        .playground-onboarding-transition-dot {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          animation: playgroundOnboardingTransitionDot 0.95s ease-in-out infinite;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-loading .playground-onboarding-transition-label {
          animation: playgroundOnboardingTransitionLabelIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
  
        .playground-onboarding-screen-surface.is-onboarding-transition-hiding-label .playground-onboarding-transition-label {
          animation: playgroundOnboardingTransitionLabelOut 220ms cubic-bezier(0.64, 0, 0.78, 0) both;
        }
  
        .playground-onboarding-pane.is-config {
          background: rgba(0, 0, 0, 0.70);
          backdrop-filter: blur(100px);
          -webkit-backdrop-filter: blur(100px);
        }
  
        .playground-onboarding-pane.is-config.is-welcome {
          padding-top: 18px;
        }
  
        .playground-onboarding-pane.is-explain {
          position: relative;
          overflow: hidden;
          background: transparent;
        }
  
        .playground-onboarding-pane.is-explain > *:not(.playground-onboarding-video-bg) {
          position: relative;
          z-index: 1;
        }
  
        .playground-onboarding-video-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          background: #000;
          opacity: 1;
          transition: opacity 420ms ease;
        }
  
        .playground-onboarding-video-bg-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
  
        .playground-onboarding-video-bg-video {
          opacity: 0;
          transition: opacity 700ms ease;
        }
  
        .playground-onboarding-video-bg-video.is-ready {
          opacity: 1;
        }
  
        .playground-onboarding-video-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8));
        }
  
        .playground-onboarding-pane-top,
        .playground-onboarding-pane-bottom,
        .playground-onboarding-back-button,
        .playground-onboarding-step-count,
        .playground-onboarding-progress-group,
        .playground-onboarding-config-heading,
        .playground-onboarding-option-card,
        .playground-onboarding-agent-row,
        .playground-onboarding-connector-row,
        .playground-onboarding-resource-row,
        .playground-onboarding-plan-action-row,
        .playground-onboarding-explain-bullet,
        .playground-onboarding-dots {
          display: flex;
          align-items: center;
        }
  
        .playground-onboarding-pane-top {
          flex: 0 0 auto;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
        }
  
        .playground-onboarding-back-button,
        .playground-onboarding-close {
          width: auto;
          height: auto;
          min-height: 32px;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.82);
          font-size: 13px;
          font-weight: 400;
          gap: 8px;
        }
  
        .playground-onboarding-back-button:hover,
        .playground-onboarding-close:hover {
          background: transparent;
          color: #fff;
        }
  
        .playground-onboarding-step-count {
          gap: 8px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 12px;
          font-weight: 400;
        }
  
        .playground-onboarding-config-scroll {
          min-height: 0;
          flex: 1 1 auto;
          overflow: auto;
          padding-right: 2px;
          scrollbar-width: none;
        }
  
        .playground-onboarding-pane.is-welcome .playground-onboarding-config-scroll {
          display: flex;
          align-items: center;
        }
  
        .playground-onboarding-config-scroll::-webkit-scrollbar {
          display: none;
        }
  
        .playground-onboarding-config-stack {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
  
        .playground-onboarding-pane.is-welcome .playground-onboarding-config-stack {
          min-height: 100%;
          justify-content: center;
        }
  
        .playground-onboarding-pane.is-computer .playground-onboarding-config-scroll,
        .playground-onboarding-pane.is-agents .playground-onboarding-config-scroll,
        .playground-onboarding-pane.is-connectors .playground-onboarding-config-scroll,
        .playground-onboarding-pane.is-plan .playground-onboarding-config-scroll {
          display: flex;
          align-items: center;
        }
  
        .playground-onboarding-pane.is-computer .playground-onboarding-config-stack,
        .playground-onboarding-pane.is-agents .playground-onboarding-config-stack,
        .playground-onboarding-pane.is-connectors .playground-onboarding-config-stack,
        .playground-onboarding-pane.is-plan .playground-onboarding-config-stack {
          justify-content: center;
        }
  
        .playground-onboarding-config-heading {
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
        }
  
        .playground-onboarding-config-heading.is-plain {
          gap: 0;
          padding-bottom: 0;
          border-bottom: 0;
        }
  
        .playground-onboarding-config-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }
  
        .playground-onboarding-config-title {
          margin: 0;
          color: rgba(255, 255, 255, 0.96);
          font-size: 20px;
          font-weight: 500;
          line-height: 1.25;
        }
  
        .playground-onboarding-config-copy {
          margin: 4px 0 0;
          max-width: 620px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.55;
        }
  
        .playground-onboarding-pane.is-agents .playground-onboarding-config-copy {
          max-width: none;
          white-space: nowrap;
        }
  
        .playground-onboarding-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
  
        .playground-onboarding-section-title {
          color: rgba(255, 255, 255, 0.86);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
        }
  
        .playground-onboarding-option-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
  
        .playground-onboarding-option-card {
          min-height: 82px;
          align-items: flex-start;
          flex-direction: column;
          gap: 6px;
          padding: 13px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          color: inherit;
          text-align: left;
          cursor: pointer;
        }
  
        .playground-onboarding-option-card.is-active {
          border-color: rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.10);
        }
  
        .playground-onboarding-option-title {
          color: rgba(255, 255, 255, 0.94);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.25;
        }
  
        .playground-onboarding-option-copy {
          color: rgba(255, 255, 255, 0.52);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.45;
        }
  
        .playground-onboarding-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
  
        .playground-onboarding-form-grid.is-single {
          grid-template-columns: minmax(0, 1fr);
        }
  
        .playground-onboarding-field {
          gap: 7px;
        }
  
        .playground-onboarding-label {
          color: rgba(255, 255, 255, 0.68);
          font-size: 12px;
          font-weight: 400;
        }
  
        .playground-onboarding-input,
        .playground-onboarding-select,
        .playground-onboarding-textarea {
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.10);
        }
  
        .playground-onboarding-select {
          color-scheme: dark;
        }
  
        .playground-onboarding-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 0 0 auto;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.10);
        }
  
        .playground-onboarding-agent-list,
        .playground-onboarding-connector-list,
        .playground-onboarding-resource-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
  
        .playground-onboarding-agent-list,
        .playground-onboarding-connector-list {
          gap: 14px;
        }
  
        .playground-onboarding-agent-row,
        .playground-onboarding-connector-row,
        .playground-onboarding-resource-row {
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
  
        .playground-onboarding-agent-row,
        .playground-onboarding-connector-row {
          padding: 0;
          padding-bottom: 12px;
          border: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 0;
          background: transparent;
        }
  
        .playground-onboarding-row-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
        }
  
        .playground-onboarding-row-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.86);
          flex: 0 0 auto;
        }
  
        .playground-onboarding-connector-logo,
        .playground-onboarding-row-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          object-fit: cover;
          display: block;
          flex: 0 0 auto;
        }
  
        .playground-onboarding-connector-logo {
          border-radius: 0;
          object-fit: contain;
        }
  
        .playground-onboarding-connector-logo.is-github {
          filter: invert(1);
          opacity: 0.9;
        }
  
        .playground-onboarding-connector-logo-fallback {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.86);
          background: rgba(255, 255, 255, 0.08);
          flex: 0 0 auto;
        }
  
        .playground-onboarding-row-title {
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.25;
        }
  
        .playground-onboarding-row-copy {
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.50);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.35;
        }
  
        .playground-onboarding-row-status {
          flex: 0 0 auto;
          color: rgba(255, 255, 255, 0.60);
          font-size: 12px;
          font-weight: 400;
        }
  
        .playground-onboarding-agent-model {
          min-width: 180px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          color: rgba(255, 255, 255, 0.62);
          text-align: right;
        }
  
        .playground-onboarding-agent-model-name {
          color: rgba(255, 255, 255, 0.82);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.2;
        }
  
        .playground-onboarding-connector-action {
          flex: 0 0 auto;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.84);
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
        }
  
        .playground-onboarding-connector-action:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.10);
        }
  
        .playground-onboarding-connector-action.is-connected {
          border-color: transparent;
          background: transparent;
          color: rgba(255, 255, 255, 0.56);
          cursor: default;
        }
  
        .playground-onboarding-pane-bottom {
          flex: 0 0 auto;
          justify-content: space-between;
          gap: 14px;
          padding-top: 14px;
        }
  
        .playground-onboarding-dots {
          gap: 7px;
        }
  
        .playground-onboarding-progress-group {
          gap: 12px;
        }
  
        .playground-onboarding-dot {
          width: 7px;
          min-width: 7px;
          max-width: 7px;
          height: 7px;
          min-height: 7px;
          max-height: 7px;
          flex: 0 0 7px;
          display: block;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.24);
        }
  
        .playground-onboarding-dot.is-active {
          width: 7px;
          min-width: 7px;
          max-width: 7px;
          height: 7px;
          min-height: 7px;
          max-height: 7px;
          background: #fff;
        }
  
        .playground-onboarding-footer-actions {
          gap: 10px;
        }
  
        .playground-onboarding-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          padding: 0 16px;
          border-radius: 999px;
          font-weight: 400;
        }
  
        .playground-onboarding-button.is-link {
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.58);
        }
  
        .playground-onboarding-button.is-link:hover {
          background: transparent;
          color: #fff;
        }
  
        .playground-onboarding-button.is-primary {
          background: #fff;
          color: #000;
        }
  
        .playground-onboarding-button-loader {
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
  
        .playground-onboarding-button-loader-dot {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: currentColor;
          animation: playgroundOnboardingTransitionDot 0.95s ease-in-out infinite;
        }
  
        .playground-onboarding-free-plan-link {
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.50);
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
        }
  
        .playground-onboarding-free-plan-link:hover {
          background: transparent;
          color: rgba(255, 255, 255, 0.74);
        }
  
        .playground-onboarding-explain-inner {
          width: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
  
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-pane-top,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-pane-top,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-pane-top,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-pane-top {
          display: none;
        }
  
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-inner,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-inner,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-explain-inner,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-explain-inner {
          align-items: center;
        }
  
        .playground-onboarding-explain-kicker {
          color: rgba(255, 255, 255, 0.46);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }
  
        .playground-onboarding-explain-title {
          margin: 0;
          color: rgba(255, 255, 255, 0.98);
          font-size: 34px;
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: 0;
        }
  
        .playground-onboarding-explain-copy {
          margin: 0;
          max-width: 560px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
        }
  
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-copy,
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-list,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-copy,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-list,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-explain-copy,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-explain-list,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-explain-copy,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-explain-list {
          width: min(100%, 520px);
          max-width: 520px;
        }
  
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-connectors .playground-onboarding-explain-title,
        .playground-onboarding-pane.is-explain.is-plan .playground-onboarding-explain-title {
          font-weight: 500;
        }
  
        .playground-onboarding-explain-visual {
          width: min(180px, 34vw);
          height: auto;
          display: block;
          margin: 0 0 10px;
        }
  
        .playground-onboarding-pane.is-explain.is-computer .playground-onboarding-explain-visual,
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-visual {
          width: 260px;
          max-width: min(260px, 54vw);
          margin-left: auto;
          margin-right: auto;
        }
  
        .playground-onboarding-pane.is-explain.is-agents .playground-onboarding-explain-visual {
          border-radius: 999px;
        }
  
        .playground-onboarding-explain-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 4px;
        }
  
        .playground-onboarding-explain-bullet {
          align-items: flex-start;
          gap: 12px;
        }
  
        .playground-onboarding-explain-bullet-icon {
          width: 18px;
          height: 18px;
          margin-top: 1px;
          color: rgba(255, 255, 255, 0.76);
          flex: 0 0 auto;
        }
  
        .playground-onboarding-explain-bullet-title {
          color: rgba(255, 255, 255, 0.92);
          font-size: 13px;
          font-weight: 500;
          line-height: 1.35;
        }
  
        .playground-onboarding-explain-bullet-copy {
          margin-top: 3px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.45;
        }
  
        .playground-onboarding-plan-card {
          width: min(100%, 380px);
          padding: 16px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0 auto;
        }
  
        .playground-onboarding-welcome-intro {
          width: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 28px;
          padding: 0 0 42px;
        }
  
        .playground-onboarding-welcome-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 16px;
          font-weight: 500;
          line-height: 1.35;
        }
  
        .playground-onboarding-welcome-kicker-icon {
          color: rgba(255, 255, 255, 0.94);
          flex: 0 0 auto;
        }
  
        .playground-onboarding-welcome-title {
          margin: 0;
          max-width: 660px;
          color: rgba(255, 255, 255, 0.98);
          font-size: clamp(38px, 4.3vw, 58px);
          font-weight: 500;
          line-height: 1.04;
          letter-spacing: 0;
        }
  
        .playground-onboarding-welcome-title-accent {
          color: inherit;
          font-style: normal;
          font-weight: inherit;
        }
  
        .playground-onboarding-welcome-copy {
          margin: 0;
          max-width: 640px;
          color: rgba(255, 255, 255, 0.64);
          font-size: 17px;
          font-weight: 400;
          line-height: 1.55;
        }
  
        .playground-onboarding-welcome-note {
          margin: -12px 0 0;
          max-width: 560px;
          color: rgba(255, 255, 255, 0.42);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
        }
  
        .playground-onboarding-welcome-prompt-stage {
          width: 100%;
          min-height: 100%;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
  
        .playground-onboarding-welcome-prompt-wrap {
          width: min(100%, 56rem);
          max-width: 56rem;
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 84px 0 98px;
        }
  
        .tb-runner-chat.playground-onboarding-welcome-runner-mock {
          width: 100%;
          max-width: 100%;
          height: auto;
          min-height: 0;
          flex: 0 1 auto;
          display: block;
          overflow: visible;
          background: transparent;
          position: relative;
          z-index: 1;
        }
  
        .playground-onboarding-welcome-prompt-stage .tb-input-width {
          width: 100%;
          max-width: 56rem;
          pointer-events: none;
        }
  
        .playground-onboarding-screen-surface.is-welcome .playground-onboarding-welcome-prompt-stage .embedded-runner-input {
          opacity: 0;
          transform: scale(0);
          transform-origin: center center;
        }
  
        .playground-onboarding-screen-surface.is-welcome.is-welcome-video-started .playground-onboarding-welcome-prompt-stage .embedded-runner-input {
          animation: playgroundOnboardingPromptIn 440ms cubic-bezier(0.22, 1, 0.36, 1) 620ms both;
        }
  
        .playground-onboarding-welcome-prompt-stage .tb-runner-chat.playground-onboarding-welcome-runner-mock .task-input-box {
          --tb-task-input-overlay: transparent;
          --tb-task-input-base-bg: rgba(0, 0, 0, 0.25);
          pointer-events: none;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
        }
  
        .playground-onboarding-welcome-prompt-stage .sidebar-textarea {
          height: 52px;
          overflow: hidden;
        }
  
        .playground-onboarding-welcome-input-guide {
          position: absolute;
          inset: 0;
          z-index: 20;
          opacity: 0;
          pointer-events: none;
        }
  
        .playground-onboarding-screen-surface.is-welcome.is-welcome-video-started .playground-onboarding-welcome-input-guide {
          animation: playgroundOnboardingGuideIn 340ms ease 820ms both;
        }
  
        .playground-onboarding-welcome-input-guide-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          z-index: 20;
        }
  
        .playground-onboarding-welcome-input-guide-line {
          stroke: rgba(255, 255, 255, 0.42);
          stroke-width: 1;
          stroke-linecap: round;
          stroke-dasharray: 1 6;
          vector-effect: non-scaling-stroke;
        }
  
        .playground-onboarding-welcome-input-guide-item {
          position: absolute;
          width: var(--playground-onboarding-guide-width, 120px);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          text-align: left;
          z-index: 21;
        }
  
        .playground-onboarding-welcome-input-guide-item-textarea {
          left: 20px;
          top: 20px;
          --playground-onboarding-guide-width: 270px;
        }
  
        .playground-onboarding-welcome-input-guide-item-attach {
          left: 6px;
          top: 218px;
          --playground-onboarding-guide-width: 78px;
        }
  
        .playground-onboarding-welcome-input-guide-item-context {
          left: 96px;
          top: 218px;
          --playground-onboarding-guide-width: 82px;
        }
  
        .playground-onboarding-welcome-input-guide-item-team {
          left: 208px;
          top: 218px;
          --playground-onboarding-guide-width: 132px;
        }
  
        .playground-onboarding-welcome-input-guide-item-computer {
          right: 48px;
          top: 218px;
          align-items: flex-end;
          text-align: right;
          --playground-onboarding-guide-width: 142px;
        }
  
        .playground-onboarding-welcome-input-guide-item-voice {
          right: 0;
          top: 20px;
          align-items: flex-end;
          text-align: right;
          --playground-onboarding-guide-width: 230px;
        }
  
        .playground-onboarding-welcome-input-guide-title {
          color: rgba(255, 255, 255, 0.84);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.25;
        }
  
        .playground-onboarding-welcome-input-guide-copy {
          max-width: 150px;
          color: rgba(255, 255, 255, 0.46);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.35;
        }
  
        .playground-onboarding-welcome-input-guide-item-textarea .playground-onboarding-welcome-input-guide-copy,
        .playground-onboarding-welcome-input-guide-item-voice .playground-onboarding-welcome-input-guide-copy {
          max-width: 100%;
        }
  
        @keyframes playgroundOnboardingPromptIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
  
        @keyframes playgroundOnboardingGuideIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
  
        @keyframes playgroundOnboardingPaneInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
  
        @keyframes playgroundOnboardingPaneInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
  
        @keyframes playgroundOnboardingTransitionLabelIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
  
        @keyframes playgroundOnboardingTransitionLabelOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0);
          }
        }
  
        @keyframes playgroundOnboardingTransitionDot {
          0%,
          80%,
          100% {
            opacity: 0.24;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-1px);
          }
        }
  
        @media (prefers-reduced-motion: reduce) {
          .playground-onboarding-screen-surface.is-welcome .playground-onboarding-pane.is-config.is-welcome,
          .playground-onboarding-screen-surface.is-welcome .playground-onboarding-welcome-prompt-stage .embedded-runner-input,
          .playground-onboarding-screen-surface.is-welcome .playground-onboarding-welcome-input-guide,
          .playground-onboarding-screen-surface.is-onboarding-transition-leaving .playground-onboarding-pane,
          .playground-onboarding-screen-surface.is-onboarding-transition-entering .playground-onboarding-pane,
          .playground-onboarding-screen-surface.is-onboarding-pane-transition-leaving .playground-onboarding-pane,
          .playground-onboarding-screen-surface.is-onboarding-pane-transition-entering .playground-onboarding-pane,
          .playground-onboarding-screen-surface.is-onboarding-free-exit-active .playground-onboarding-pane,
          .playground-onboarding-screen-surface.is-onboarding-free-exit-fading .playground-onboarding-video-bg,
          .playground-onboarding-transition-label {
            opacity: 1;
            transform: none;
            transition: none;
            animation: none;
          }
        }
  
        @media (max-width: 1040px) {
          .playground-onboarding-welcome-input-guide-copy {
            display: none;
          }
        }
  
        .playground-onboarding-computer-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.10);
          overflow: hidden;
        }
  
        .playground-onboarding-computer-section-title {
          color: rgba(255, 255, 255, 0.96);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.35;
        }
  
        .playground-onboarding-computer-upload-zone {
          min-height: 168px;
          border: 1px dashed rgba(255, 255, 255, 0.20);
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.14);
          overflow: hidden;
        }
  
        .playground-onboarding-computer-upload-zone.is-dragging {
          border-color: rgba(255, 255, 255, 0.46);
          background: rgba(255, 255, 255, 0.08);
        }
  
        .playground-onboarding-computer-upload-zone.is-busy {
          opacity: 0.76;
        }
  
        .playground-onboarding-computer-upload-zone.is-filled {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
  
        .playground-onboarding-computer-upload-button {
          width: 100%;
          min-height: 168px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 20px 16px;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.92);
          cursor: pointer;
        }
  
        .playground-onboarding-computer-upload-button:disabled {
          cursor: default;
        }
  
        .playground-onboarding-computer-upload-icon {
          width: 18px;
          height: 18px;
          color: rgba(255, 255, 255, 0.84);
        }
  
        .playground-onboarding-computer-upload-title {
          color: rgba(255, 255, 255, 0.96);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.35;
        }
  
        .playground-onboarding-computer-upload-copy {
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.35;
        }
  
        .playground-onboarding-computer-upload-zone.is-filled .playground-tasks-attachments-topline {
          justify-content: center;
          text-align: center;
          width: 100%;
        }
  
        .playground-onboarding-computer-upload-attachments-scope.tb-runner-chat {
          width: auto;
          height: auto;
          min-height: 0;
          flex: 0 0 auto;
          display: block;
          overflow: visible;
          background: transparent;
        }
  
        .playground-onboarding-computer-upload-zone.is-filled .playground-onboarding-computer-upload-attachments-scope .runner-attachments {
          width: auto;
          max-width: 100%;
          display: inline-flex;
          justify-content: center;
          flex-wrap: wrap;
          padding: 0;
          margin: 0 auto;
        }
  
        .playground-onboarding-computer-upload-list {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 12px;
        }
  
        .playground-onboarding-computer-upload-file {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.35;
        }
  
        .playground-onboarding-computer-upload-error {
          margin-top: 12px;
          color: rgb(252, 165, 165);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.4;
        }
  
        .playground-onboarding-computer-facts {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
  
        .playground-onboarding-computer-fact {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
  
        .playground-onboarding-computer-fact-label {
          color: rgba(255, 255, 255, 0.62);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.35;
        }
  
        .playground-onboarding-computer-fact-value {
          min-width: 0;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          font-weight: 500;
          line-height: 1.35;
          text-align: right;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
  
        .playground-onboarding-computer-select {
          width: auto;
          min-height: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          font-weight: 500;
          color-scheme: dark;
        }
  
        .playground-onboarding-plan-price {
          font-size: 34px;
        }
  
        .playground-onboarding-plan-action-row {
          justify-content: flex-start;
          gap: 10px;
          margin-top: 14px;
        }
  
        .playground-onboarding-plan-title-cta {
          align-self: stretch;
          border-radius: 15px;
        }
  
        @media (max-width: 920px) {
          .playground-onboarding-pane {
            min-height: 50vh;
          }
  
          .playground-onboarding-pane.is-explain {
            border-left: 0;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
          }
  
          .playground-onboarding-option-grid,
          .playground-onboarding-form-grid {
            grid-template-columns: 1fr;
          }
        }
`;
