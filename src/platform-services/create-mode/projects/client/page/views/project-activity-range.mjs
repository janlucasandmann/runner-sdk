export const PROJECT_ACTIVITY_RANGE_SCRIPT = `        function filterProjectWorkActivityEventsByTimeRange(
          events,
          timeRange
        ) {
          const rangeStart = Number(timeRange?.startAt);
          const rangeEnd = Number(timeRange?.endAt);
          if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd)) {
            return Array.isArray(events) ? events : [];
          }
          return (Array.isArray(events) ? events : []).filter((event) => {
            const eventTime = parseProjectWorkActivityTimestamp(event?.createdAt);
            return eventTime >= rangeStart && eventTime <= rangeEnd;
          });
        }

        function getProjectActivityPageGridStyle(chartHeight) {
          const normalizedHeight = Number(chartHeight);
          if (!Number.isFinite(normalizedHeight) || normalizedHeight <= 0) {
            return {
              gridTemplateRows: "repeat(2, minmax(0, 1fr))",
            };
          }
          return {
            gridTemplateRows:
              "min("
              + Math.max(240, normalizedHeight)
              + "px, calc(100% - 220px)) minmax(220px, 1fr)",
          };
        }

        function getProjectActivityOverviewProps(activityItems) {
          return {
            className: "playground-project-activity-overview",
            items: activityItems,
            resizable: true,
            minResizeHeight: 240,
            minSiblingHeight: 220,
            onHeightChange: setProjectOverviewActivityChartHeight,
            onTimeRangeChange: setProjectOverviewTaskActivityTimeRange,
            emptyTitle: normalizedSearchQuery
              ? "No matching activity"
              : selectedRelease
                ? "No milestone activity yet"
                : "No project activity yet",
            emptyDescription: normalizedSearchQuery
              ? "Clear the search to show all ticket work."
              : "Ticket work and agent runs will appear here over time.",
            ariaLabel: "Project ticket activity over time",
          };
        }

        function renderProjectActivityOverviewChart(activityItems) {
          return React.createElement(
            PlatformActivityOverview,
            getProjectActivityOverviewProps(activityItems)
          );
        }
`;
