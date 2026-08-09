export const FILES_RESPONSIVE_CSS = `
      @media (max-width: 980px) {
        .playground-files-shell {
          grid-template-columns: minmax(0, 1fr);
          height: auto;
          transition: none;
        }

        .playground-files-shell.has-preview {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-files-shell.is-browser-minimized,
        .playground-files-shell.is-browser-minimized.has-preview,
        .playground-files-shell.is-browser-minimized.has-preview.has-file-chat {
          grid-template-columns: minmax(0, 1fr);
        }

        .playground-files-browser,
        .playground-files-preview,
        .playground-files-chat-sidebar {
          min-height: 220px;
        }

        .playground-files-browser {
          border: 0;
        }

        .playground-files-shell.is-browser-minimized .playground-files-browser {
          visibility: visible;
          pointer-events: auto;
        }

        .playground-files-topbar,
        .playground-files-control-row {
          flex-wrap: wrap;
        }

        .playground-files-topbar-actions,
        .playground-files-control-actions,
        .playground-files-path-strip {
          width: 100%;
        }

        .playground-files-topbar-actions {
          justify-content: flex-end;
        }

        .playground-files-path-strip {
          justify-content: space-between;
        }

        .playground-files-preview {
          max-width: none;
          max-height: 0;
          padding: 0;
          transform: translateY(16px);
        }

        .playground-files-shell.has-preview .playground-files-preview {
          max-height: 720px;
          padding: 0;
          transform: translateY(0);
          border-left: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .playground-files-chat-sidebar {
          max-width: none;
          max-height: 0;
          padding: 0;
          transform: translateY(16px);
        }

        .playground-files-shell.has-file-chat .playground-files-chat-sidebar {
          max-height: 720px;
          padding: 0;
          transform: translateY(0);
          border-left: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .playground-files-chat-resize-handle,
        .playground-files-browser-minimized-toggle {
          display: none;
        }

        .playground-files-search-popover {
          position: fixed;
          left: 12px;
          right: 12px;
          width: auto;
          top: 76px;
          max-height: min(420px, calc(100vh - 96px));
        }

        .playground-files-toolbar-menu,
        .playground-files-toolbar-menu-wide {
          max-width: calc(100vw - 24px);
        }

        .playground-files-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .playground-files-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
`;
