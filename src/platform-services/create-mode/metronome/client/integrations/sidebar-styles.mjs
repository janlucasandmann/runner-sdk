export const METRONOME_SIDEBAR_CSS = `
      .sidebar-metronome-run-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sidebar-metronome-run-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: inherit;
      }

      .sidebar-metronome-run-icon svg {
        width: 12px;
        height: 12px;
      }

      .sidebar-metronome-run-icon.is-loop {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
        border-radius: 5px;
        background: linear-gradient(180deg, #9a72df 0%, #6542a8 100%);
        color: #fff;
      }

      .sidebar-metronome-run-icon.is-mission-control {
        width: 20px;
        height: 20px;
        flex-basis: 20px;
        border-radius: 5px;
        background: linear-gradient(180deg, #3159a8 0%, #172f68 100%);
        box-shadow: inset 0 0 0 1px rgba(137, 178, 255, 0.16), 0 1px 2px rgba(0, 0, 0, 0.28);
        color: #fff;
      }

      .sidebar-metronome-run-icon.is-loop svg,
      .sidebar-metronome-run-icon.is-mission-control svg {
        filter: drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.28));
      }

      .sidebar-metronome-run-threads {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-left: 18px;
        padding-left: 8px;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
      }

      .sidebar-thread-item.is-metronome-child {
        padding-left: 8px;
        padding-right: 54px;
      }

      .sidebar-thread-item.is-metronome-child .sidebar-thread-title {
        color: var(--sidebar-link-color);
      }
`;
