export const CALENDAR_PROJECTS_PAGE_STATUS_SCRIPT = `
        function getPlaygroundScheduleStatusMeta(schedule) {
          if (!schedule) {
            return {
              label: "Planned",
              className: "is-planned",
            };
          }
          if (Number(schedule.runCount || 0) === 0) {
            return {
              label: "Planned",
              className: "is-planned",
            };
          }
          if (!schedule.enabled && schedule.scheduleType === "one-time") {
            return {
              label: "Completed",
              className: "is-completed",
            };
          }
          if (schedule.enabled) {
            return {
              label: "Active",
              className: "is-active",
            };
          }
          return {
            label: "Disabled",
            className: "is-disabled",
          };
        }

`;
