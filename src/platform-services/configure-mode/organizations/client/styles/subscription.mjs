export const ORGANIZATIONS_SUBSCRIPTION_CSS = `      .playground-organization-admin-page.is-subscription-page .playground-team-shell {
        gap: 0;
      }

      .playground-organization-subscription-card {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-subscription-header {
        padding: 24px;
      }

      .playground-organization-subscription-title {
        margin: 0;
        color: #fff;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-organization-subscription-card > .playground-settings-banner {
        margin: 0 24px 16px;
      }

      .playground-organization-subscription-loading {
        min-height: 280px;
      }

      .playground-organization-subscription-section {
        box-sizing: border-box;
        padding: 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-organization-subscription-section.is-plan {
        padding-top: 0;
        border-top: 0;
      }

      .playground-organization-subscription-eyebrow {
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        line-height: 1.2;
        font-weight: 400;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .playground-organization-subscription-plan-row,
      .playground-organization-subscription-payg-row,
      .playground-organization-subscription-limit-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
      }

      .playground-organization-subscription-plan-row {
        margin-top: 12px;
      }

      .playground-organization-subscription-plan-copy,
      .playground-organization-subscription-payg-copy,
      .playground-organization-subscription-limit-copy {
        min-width: 0;
      }

      .playground-organization-subscription-plan-name {
        color: #fff;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-subscription-description,
      .playground-organization-subscription-section-description,
      .playground-organization-subscription-reset {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.5;
        font-weight: 400;
      }

      .playground-organization-subscription-plan-name + .playground-organization-subscription-description,
      .playground-organization-subscription-row-heading + .playground-organization-subscription-description,
      .playground-organization-subscription-row-title + .playground-organization-subscription-description {
        margin-top: 5px;
      }

      .playground-organization-subscription-upgrade {
        flex: 0 0 auto;
      }

      .playground-organization-subscription-section-description {
        margin-top: 16px;
      }

      .playground-organization-subscription-usage-list {
        display: grid;
        gap: 28px;
        margin-top: 28px;
      }

      .playground-organization-subscription-usage {
        min-width: 0;
      }

      .playground-organization-subscription-row-title {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        line-height: 1.35;
        font-weight: 400;
      }

      .playground-organization-subscription-usage-values {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 14px;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-subscription-usage-values span:last-child {
        color: rgba(255, 255, 255, 0.5);
      }

      .playground-organization-subscription-progress {
        position: relative;
        width: 100%;
        height: 7px;
        margin-top: 10px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-subscription-progress-value {
        position: absolute;
        inset: 0 auto 0 0;
        min-width: 0;
        border-radius: inherit;
        background: #4da3ff;
        transition: width 180ms ease;
      }

      .playground-organization-subscription-reset {
        margin-top: 10px;
      }

      .playground-organization-subscription-section.is-payg > .playground-organization-subscription-eyebrow {
        margin-bottom: 20px;
      }

      .playground-organization-subscription-row-heading {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .playground-organization-subscription-divider {
        height: 1px;
        margin: 24px 0;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-subscription-limit-controls {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 150px auto;
        align-items: center;
        gap: 12px;
        margin-top: 20px;
      }

      .playground-organization-subscription-limit-meter {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .playground-organization-subscription-limit-current {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.88);
        font-size: 12px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-subscription-limit-meter .playground-organization-subscription-progress {
        flex: 1 1 auto;
        min-width: 0;
        margin-top: 0;
      }

      .playground-organization-subscription-limit-input-shell {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 32px;
        min-width: 0;
        overflow: hidden;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-subscription-limit-input {
        width: 100%;
        min-width: 0;
        height: 100%;
        padding: 0 10px;
        border: 0;
        outline: 0;
        background: transparent;
        color: #fff;
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        appearance: textfield;
        -webkit-appearance: none;
      }

      .playground-organization-subscription-limit-input::-webkit-outer-spin-button,
      .playground-organization-subscription-limit-input::-webkit-inner-spin-button {
        margin: 0;
        appearance: none;
        -webkit-appearance: none;
      }

      .playground-organization-subscription-limit-input-shell > span {
        padding-right: 10px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 10px;
        line-height: 1;
      }

      .playground-organization-plan-chooser {
        position: fixed;
        inset: 0;
        z-index: 2147482600;
        box-sizing: border-box;
        overflow: auto;
        overscroll-behavior: contain;
        background: #000;
        color: #fff;
        animation: playground-organization-plan-chooser-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }

      @keyframes playground-organization-plan-chooser-in {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .playground-organization-plan-chooser-back {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        height: 34px;
        padding: 0 11px;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
        transition: color 140ms ease, background 140ms ease;
      }

      .playground-organization-plan-chooser-back:hover {
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
      }

      .playground-organization-plan-chooser-back:focus-visible,
      .playground-organization-plan-chooser-stepper button:focus-visible {
        outline: 2px solid rgba(77, 163, 255, 0.8);
        outline-offset: 2px;
      }

      .playground-organization-plan-chooser-main {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        padding: 48px 42px;
      }

      .playground-organization-plan-chooser-shell {
        position: relative;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-auto-flow: row;
        width: min(1480px, 100%);
        min-height: min(820px, calc(100vh - 96px));
        overflow: visible;
        border: 0;
        background: #080808;
      }

      .playground-organization-plan-chooser-shell::before,
      .playground-organization-plan-chooser-shell::after {
        position: absolute;
        content: "";
        pointer-events: none;
        border-color: rgba(255, 255, 255, 0.05);
        border-style: solid;
      }

      .playground-organization-plan-chooser-shell::before {
        top: 0;
        bottom: 0;
        left: 50%;
        width: 100vw;
        transform: translateX(-50%);
        border-width: 1px 0;
      }

      .playground-organization-plan-chooser-shell::after {
        top: 50%;
        left: 0;
        width: 100%;
        height: 100vh;
        transform: translateY(-50%);
        border-width: 0 1px;
      }

      .playground-organization-plan-chooser-intro {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        grid-column: 1;
        grid-row: 1;
        min-width: 0;
        box-sizing: border-box;
        overflow: hidden;
        padding: 40px 32px 32px;
        border-right: 1px solid rgba(255, 255, 255, 0.075);
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-organization-plan-chooser-intro-copy {
        min-width: 0;
      }

      .playground-organization-plan-chooser-runner-logo {
        display: block;
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .playground-organization-plan-chooser-intro h1 {
        max-width: 230px;
        margin: 34px 0 0;
        color: #fff;
        font-size: 34px;
        line-height: 1.08;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-organization-plan-chooser-catalog {
        display: contents;
      }

      .playground-organization-plan-chooser-catalog-header {
        position: relative;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        grid-column: 2 / -1;
        grid-row: 1;
        gap: 24px;
        box-sizing: border-box;
        overflow: hidden;
        padding: 40px 32px 32px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.075);
      }

      .playground-organization-plan-chooser-catalog-header::after {
        position: absolute;
        top: 0;
        right: 50%;
        bottom: 0;
        width: 1px;
        content: "";
        pointer-events: none;
        background: rgba(255, 255, 255, 0.075);
      }

      .playground-organization-plan-chooser-interval-switch {
        margin-left: auto;
        flex: 0 0 auto;
        min-width: 220px;
      }

      .playground-organization-plan-chooser-catalog > .playground-settings-banner,
      .playground-organization-plan-chooser-notice {
        grid-column: 1 / -1;
        margin: 14px 24px 0;
      }

      .playground-organization-plan-chooser-notice {
        box-sizing: border-box;
        padding: 12px 14px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.65);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-organization-plan-chooser-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: stretch;
        grid-column: 1 / -1;
        gap: 0;
        min-height: 0;
        margin: 0;
        overflow: visible;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0;
        background: transparent;
      }

      .playground-organization-plan-chooser-card {
        position: relative;
        display: flex;
        min-width: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.075);
        background: #080808;
      }

      .playground-organization-plan-chooser-card:last-child {
        border-right: 0;
      }

      .playground-organization-plan-chooser-card.is-highlighted {
        background: rgba(77, 163, 255, 0.055);
      }

      .playground-organization-plan-chooser-card.is-current:not(.is-highlighted) {
        background: rgba(255, 255, 255, 0.025);
      }

      .playground-organization-plan-chooser-card-accent {
        position: absolute;
        inset: 0 0 auto;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 40px;
        padding: 0 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.68);
        font-size: 10px;
        line-height: 1;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .playground-organization-plan-chooser-card.is-current .playground-organization-plan-chooser-card-accent {
        background: rgba(255, 255, 255, 0.1);
      }

      .playground-organization-plan-chooser-card.is-highlighted .playground-organization-plan-chooser-card-accent {
        background: #1d59be;
        color: #fff;
      }

      .playground-organization-plan-chooser-card-body {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-width: 0;
        min-height: 680px;
        padding: 68px 24px 24px;
      }

      .playground-organization-plan-chooser-plan-heading {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .playground-organization-plan-chooser-plan-name {
        margin: 0;
        color: #fff;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 400;
      }

      .playground-organization-plan-chooser-plan-audience {
        display: none;
      }

      .playground-organization-plan-chooser-plan-description {
        min-height: 55px;
        margin: 18px 0 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        line-height: 1.55;
        font-weight: 400;
      }

      .playground-organization-plan-chooser-features {
        display: grid;
        gap: 12px;
        margin: 22px 0 0;
        padding: 0;
        list-style: none;
      }

      .playground-organization-plan-chooser-features li {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 11px;
        line-height: 1.4;
      }

      .playground-organization-plan-chooser-features svg {
        flex: 0 0 auto;
        margin-top: 1px;
        color: #fff;
      }

      .playground-organization-plan-chooser-seats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 24px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.075);
        color: rgba(255, 255, 255, 0.68);
        font-size: 11px;
      }

      .playground-organization-plan-chooser-stepper {
        display: grid;
        grid-template-columns: 30px minmax(34px, auto) 30px;
        align-items: center;
        min-height: 30px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.045);
      }

      .playground-organization-plan-chooser-stepper button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
      }

      .playground-organization-plan-chooser-stepper button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.075);
        color: #fff;
      }

      .playground-organization-plan-chooser-stepper button:disabled {
        color: rgba(255, 255, 255, 0.18);
        cursor: default;
      }

      .playground-organization-plan-chooser-stepper > span {
        text-align: center;
        color: #fff;
        font-variant-numeric: tabular-nums;
      }

      .playground-organization-plan-chooser-card-footer {
        display: grid;
        gap: 16px;
        margin-top: auto;
        padding-top: 30px;
      }

      .playground-organization-plan-chooser-price {
        min-height: 48px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        line-height: 1.2;
      }

      .playground-organization-plan-chooser-price strong {
        color: #fff;
        font-size: 30px;
        line-height: 1;
        font-weight: 400;
        letter-spacing: 0;
      }

      .playground-organization-plan-chooser-price small {
        display: block;
        margin-top: 8px;
        color: rgba(255, 255, 255, 0.38);
        font-size: 9px;
        line-height: 1.3;
      }

      .playground-organization-plan-chooser-action {
        width: 100%;
        min-height: 36px;
      }

      .playground-organization-plan-chooser-action.is-current,
      .playground-organization-plan-chooser-action.is-current:hover,
      .playground-organization-plan-chooser-action.is-current:disabled,
      .playground-organization-plan-chooser-action.is-current:disabled:hover {
        background: rgba(255, 255, 255, 0.05) !important;
      }

      .playground-organization-plan-chooser-action > span,
      .playground-organization-plan-chooser-action {
        gap: 8px;
      }

      .playground-organization-plan-chooser-footer {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-column: 1 / -1;
        min-height: 70px;
      }

      .playground-organization-plan-chooser-footer-cell {
        display: flex;
        align-items: center;
        min-width: 0;
        box-sizing: border-box;
        padding: 14px 20px;
      }

      .playground-organization-plan-chooser-footer-cell + .playground-organization-plan-chooser-footer-cell {
        border-left: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-organization-plan-chooser-footer-cell:first-child {
        justify-content: flex-start;
      }

      @media (prefers-reduced-motion: reduce) {
        .playground-organization-plan-chooser {
          animation: none;
        }
      }

      @media (max-width: 1120px) {
        .playground-organization-plan-chooser-main {
          align-items: flex-start;
          padding: 36px 28px;
        }

        .playground-organization-plan-chooser-intro {
          padding: 28px 24px;
        }

        .playground-organization-plan-chooser-intro h1 {
          max-width: none;
          margin-top: 20px;
          font-size: 28px;
        }

      }

      @media (max-width: 720px) {
        .playground-organization-subscription-header,
        .playground-organization-subscription-section {
          padding-right: 20px;
          padding-left: 20px;
        }

        .playground-organization-subscription-plan-row,
        .playground-organization-subscription-payg-row {
          align-items: flex-start;
          flex-direction: column;
        }

        .playground-organization-subscription-limit-controls {
          grid-template-columns: 1fr;
        }

        .playground-organization-subscription-limit-input-shell {
          width: 100%;
        }

        .playground-organization-plan-chooser-main {
          padding: 16px 12px 28px;
        }

        .playground-organization-plan-chooser-intro {
          grid-column: 1;
          grid-row: 1;
          padding: 24px 20px;
          border-right: 0;
        }

        .playground-organization-plan-chooser-catalog-header {
          grid-column: 1;
          grid-row: 2;
          align-items: stretch;
          flex-direction: column;
          gap: 14px;
          padding: 18px 20px;
        }

        .playground-organization-plan-chooser-catalog-header::after {
          display: none;
        }

        .playground-organization-plan-chooser-interval-switch {
          margin-left: 0;
          width: 100%;
          min-width: 0;
        }

        .playground-organization-plan-chooser-grid {
          grid-column: 1;
          grid-template-columns: 1fr;
        }

        .playground-organization-plan-chooser-shell {
          grid-template-columns: 1fr;
          min-height: 0;
        }

        .playground-organization-plan-chooser-card {
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.075);
        }

        .playground-organization-plan-chooser-card:last-child {
          border-bottom: 0;
        }

        .playground-organization-plan-chooser-card-body {
          min-height: 0;
          padding-right: 20px;
          padding-left: 20px;
        }

        .playground-organization-plan-chooser-footer {
          grid-template-columns: 1fr;
        }

        .playground-organization-plan-chooser-footer-cell:not(:first-child) {
          display: none;
        }

        .playground-organization-plan-chooser-footer-cell + .playground-organization-plan-chooser-footer-cell {
          border-left: 0;
        }
      }
`;
