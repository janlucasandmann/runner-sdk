export const APP_SIDEBAR_STATUS_INDICATORS_SCRIPT = `        function handleStatusIndicatorDismiss(id) {
          if (String(id || "").startsWith("task-run:")) {
            const taskId = String(id || "").slice("task-run:".length);
            setTaskRunStates((current) => {
              if (!taskId || !current[taskId]) {
                return current;
              }
              const next = { ...current };
              delete next[taskId];
              return next;
            });
            removeStatusIndicatorItem(id);
            return;
          }
          setDismissedStatusIndicatorIds((current) => current.includes(id) ? current : [...current, id]);
        }

        function renderStatusIndicators() {
          return React.createElement(PlatformStatusIndicatorStack, {
            items: statusIndicatorItems,
            dismissedIds: dismissedStatusIndicatorIds,
            onDismiss: handleStatusIndicatorDismiss,
          });
        }

`;
