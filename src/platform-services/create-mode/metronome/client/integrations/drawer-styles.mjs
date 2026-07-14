export const METRONOME_DRAWER_CSS = `
      .playground-metronome-node-drawer {
        position: absolute;
        top: 0;
        right: 6px;
        bottom: 6px;
        z-index: 120;
        width: var(--playground-thread-task-detail-width);
        min-width: 0;
        display: flex;
        flex-direction: column;
        border-left: 0;
        background: transparent;
        opacity: 0;
        transform: translateX(100%);
        pointer-events: none;
        transition:
          transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
          opacity 220ms ease;
      }

      .playground-metronome-node-drawer.is-open {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }
`;
