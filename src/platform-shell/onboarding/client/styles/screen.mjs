export const ONBOARDING_SCREEN_CSS = String.raw`        html.playground-onboarding-is-open,
        body.playground-onboarding-is-open {
          overflow: hidden;
          overscroll-behavior: none;
        }

        .playground-onboarding-screen {
          position: fixed;
          inset: 0;
          z-index: 2147482000;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          margin: 0;
          overflow: hidden;
          outline: none;
          background: #000;
          color-scheme: dark;
          isolation: isolate;
        }

        .playground-onboarding-screen-surface {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          overflow: hidden;
          background: #000;
        }

        .playground-onboarding-screen-surface.is-auth {
          grid-template-columns: minmax(0, 1fr);
          place-items: center;
          padding:
            max(24px, env(safe-area-inset-top))
            max(24px, env(safe-area-inset-right))
            max(24px, env(safe-area-inset-bottom))
            max(24px, env(safe-area-inset-left));
          background:
            radial-gradient(circle at 50% 0%, rgba(36, 62, 160, 0.22), transparent 44%),
            #050505;
        }

        @media (max-width: 920px) {
          .playground-onboarding-screen {
            overflow: auto;
          }

          .playground-onboarding-screen-surface {
            position: relative;
            inset: auto;
            min-height: 100%;
            height: auto;
            grid-template-columns: minmax(0, 1fr);
            overflow: visible;
          }
        }
`;
