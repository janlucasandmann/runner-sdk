export const METRONOME_SIDEBAR_CSS = `
      .sidebar-metronome-run-group {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sidebar-metronome-run-item {
        width: 100%;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px 8px 10px;
        border-radius: 10px;
        color: var(--sidebar-link-color);
        position: relative;
        transition: background-color 160ms ease;
      }

      .sidebar-metronome-run-item:hover,
      .sidebar-metronome-run-item.is-active {
        background: rgba(255, 255, 255, 0.07);
      }

      .sidebar-metronome-run-item.is-active {
        color: var(--sidebar-link-active-color);
      }

      .sidebar-metronome-run-main {
        min-width: 0;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        text-align: left;
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

      .sidebar-metronome-run-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .sidebar-metronome-run-title {
        min-width: 0;
        color: inherit;
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sidebar-metronome-run-meta,
      .sidebar-metronome-run-time {
        color: rgba(255, 255, 255, 0.45);
        font-size: 10px;
        font-weight: 400;
        line-height: 12px;
        white-space: nowrap;
      }

      .sidebar-metronome-run-side {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      .sidebar-metronome-run-toggle {
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--sidebar-link-color);
        cursor: pointer;
        transition: background-color 160ms ease, color 160ms ease;
      }

      .sidebar-metronome-run-toggle:hover {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.96);
      }

      .sidebar-metronome-run-toggle svg {
        width: 11px;
        height: 11px;
        transition: transform 160ms ease;
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
