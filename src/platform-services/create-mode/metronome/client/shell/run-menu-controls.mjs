export const METRONOME_APP_RUN_MENU_CONTROLS_SCRIPT = `
        function closeMetronomeRunActionMenu() {
          setMetronomeRunActionMenuState(null);
        }

        function getMetronomeRunActionMenuPlacement(event, options = {}) {
          const rect = event?.currentTarget?.getBoundingClientRect
            ? event.currentTarget.getBoundingClientRect()
            : { top: 24, bottom: 24, right: window.innerWidth - 24 };
          const menuWidth = Number(options.width || 280);
          const menuHeight = Number(options.height || 420);
          const openUpward = rect.bottom + menuHeight > window.innerHeight - 12 && rect.top - menuHeight >= 12;
          const top = openUpward
            ? Math.max(12, rect.top - menuHeight - 8)
            : Math.min(Math.max(12, rect.bottom + 8), Math.max(12, window.innerHeight - menuHeight - 12));
          const left = Math.min(
            Math.max(12, rect.right - menuWidth),
            Math.max(12, window.innerWidth - menuWidth - 12),
          );
          return { top, left };
        }

        function openMetronomeRunActionMenu(event, entry) {
          event.preventDefault();
          event.stopPropagation();
          const groupKey = String(entry?.key || getSidebarMetronomeRunGroupKey({ metronomeId: entry?.metronomeId, runId: entry?.runId }) || "").trim();
          if (!groupKey) {
            return;
          }
          const placement = getMetronomeRunActionMenuPlacement(event);
          setThreadActionMenuState(null);
          setThreadNavMenuOpen(false);
          setThreadTaskListMenuOpen(false);
          setMetronomeRunActionMenuState({
            key: groupKey,
            top: placement.top,
            left: placement.left,
            entry: entry && typeof entry === "object" ? entry : null,
          });
        }

`;
