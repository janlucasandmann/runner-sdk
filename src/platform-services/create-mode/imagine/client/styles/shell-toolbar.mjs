/** Imagine-owned additions to the shared Files-style toolbar primitives. */
export const IMAGINE_SHELL_TOOLBAR_CSS = String.raw`
      .playground-imagine-media-mode-selector {
        max-width: 120px;
      }

      .playground-imagine-media-mode-selector .playground-files-inline-selector {
        min-height: 0;
        gap: 5px;
        color: rgba(255, 255, 255, 0.72);
        font-size: 12px !important;
        line-height: 1;
        font-weight: 400 !important;
      }

      .playground-imagine-media-mode-selector .playground-files-inline-selector span {
        font-size: 12px !important;
        font-weight: 400 !important;
      }

      .playground-imagine-media-mode-selector .playground-files-inline-selector:hover,
      .playground-imagine-media-mode-selector .playground-files-inline-selector.active {
        color: #fff;
      }

      .playground-imagine-media-mode-selector .playground-files-inline-selector-chevron {
        width: 12px;
        height: 12px;
      }

      .playground-imagine-media-mode-menu {
        width: 156px;
      }
`;
