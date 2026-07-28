export const PROJECT_MILESTONES_RUNTIME_FRAGMENT = `
          const PROJECT_MILESTONE_CHART_COLORS = Object.freeze([
            "#7effff",
            "#4da3ff",
            "#636bdc",
            "#85df7b",
            "#ffc400",
            "#ff9c43",
            "#f45b69",
            "#c59cff",
          ]);

          function getProjectOverviewMilestoneStatusPresentation(status) {
            const normalizedStatus = String(status || "planned").trim().toLowerCase();
            if (normalizedStatus === "completed") {
              return { label: "Completed", variant: "green", rank: 3 };
            }
            if (normalizedStatus === "active") {
              return { label: "Active", variant: "blue", rank: 2 };
            }
            return { label: "Planned", variant: "gray", rank: 1 };
          }

          function getProjectOverviewMilestoneProgress(release) {
            const releaseId = String(release?.id || "").trim();
            const linkedTasks = releaseId
              ? normalizedOverviewTasks.filter((task) => String(task?.releaseId || "").trim() === releaseId)
              : [];
            const recordedTaskCount = Math.max(0, Number(release?.taskCount || 0));
            const recordedOpenTaskCount = Math.max(0, Number(release?.openTaskCount || 0));
            const shouldUseRecordedProgress = recordedTaskCount > linkedTasks.length;
            const total = shouldUseRecordedProgress
              ? recordedTaskCount
              : linkedTasks.length;
            const completed = shouldUseRecordedProgress
              ? Math.max(0, Math.min(total, total - recordedOpenTaskCount))
              : linkedTasks.filter((task) => String(task?.status || "").trim().toLowerCase() === "done").length;
            return {
              total,
              completed,
              percent: total > 0 ? Math.round((completed / total) * 100) : 0,
              linkedTasks,
            };
          }

          function getProjectOverviewMilestoneRecords() {
            return (Array.isArray(releases) ? releases : [])
              .map((release) => normalizePlaygroundTaskReleaseRecord(release))
              .filter((release) => String(release?.id || "").trim())
              .sort((left, right) => (
                typeof compareTaskReleaseOrder === "function"
                  ? compareTaskReleaseOrder(left, right)
                  : String(left?.name || "").localeCompare(String(right?.name || ""))
              ));
          }

          function parseProjectOverviewMilestoneTimestamp(...values) {
            for (const value of values) {
              if (typeof value === "number" && Number.isFinite(value)) {
                return value > 0 && value < 100000000000 ? value * 1000 : value;
              }
              const normalizedValue = String(value || "").trim();
              if (!normalizedValue) continue;
              const numericValue = Number(normalizedValue);
              if (Number.isFinite(numericValue) && numericValue > 0) {
                return numericValue < 100000000000 ? numericValue * 1000 : numericValue;
              }
              const parsedValue = Date.parse(normalizedValue);
              if (Number.isFinite(parsedValue)) {
                return parsedValue;
              }
            }
            return 0;
          }

          function formatProjectOverviewMilestoneDate(value, options = {}) {
            const timestamp = parseProjectOverviewMilestoneTimestamp(value);
            if (!timestamp) return options.fallback || "No target";
            try {
              return new Intl.DateTimeFormat(undefined, options.includeYear
                ? { month: "short", day: "numeric", year: "numeric" }
                : { month: "short", day: "numeric" }
              ).format(new Date(timestamp));
            } catch {
              return options.fallback || "No target";
            }
          }

          function buildProjectOverviewMilestoneTimeline() {
            const bucketCount = 30;
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const bucketEndTimes = Array.from({ length: bucketCount }, (_, index) => {
              const bucketDate = new Date(today);
              bucketDate.setDate(today.getDate() - (bucketCount - index - 1));
              return bucketDate.getTime();
            });
            return {
              bucketEndTimes,
              labels: bucketEndTimes.map((timestamp) =>
                formatProjectOverviewMilestoneDate(timestamp, { fallback: "" })
              ),
            };
          }

          function buildProjectOverviewMilestoneSeries(release, bucketEndTimes, color, seriesIndex) {
            const progress = getProjectOverviewMilestoneProgress(release);
            const total = Math.max(0, progress.total);
            const linkedTasks = Array.isArray(progress.linkedTasks) ? progress.linkedTasks : [];
            const lastBucketIndex = Math.max(0, bucketEndTimes.length - 1);
            const values = bucketEndTimes.map((bucketEndTime, bucketIndex) => {
              if (bucketIndex === lastBucketIndex) {
                return progress.percent;
              }
              if (!total || !linkedTasks.length) {
                return 0;
              }
              const completedAtBucket = linkedTasks.filter((task) => {
                if (String(task?.status || "").trim().toLowerCase() !== "done") {
                  return false;
                }
                const completedAt = parseProjectOverviewMilestoneTimestamp(
                  task?.completedAt,
                  task?.finishedAt,
                  task?.closedAt
                );
                return completedAt > 0 && completedAt <= bucketEndTime;
              }).length;
              return Math.round((completedAtBucket / total) * 100);
            });
            return {
              id: String(release?.id || "milestone-" + seriesIndex),
              label: String(release?.name || "Untitled Milestone"),
              values,
              color,
              type: "line",
              valueKind: "percent",
              fill: false,
            };
          }

          function buildProjectOverviewMilestonesAnalytics(milestoneRecords) {
            const timeline = buildProjectOverviewMilestoneTimeline();
            const progressRecords = milestoneRecords.map((release) =>
              getProjectOverviewMilestoneProgress(release)
            );
            const completedCount = milestoneRecords.filter((release) =>
              getPlaygroundTaskReleaseStatus(release) === "completed"
            ).length;
            const activeCount = milestoneRecords.filter((release) =>
              getPlaygroundTaskReleaseStatus(release) === "active"
            ).length;
            const averageProgress = progressRecords.length > 0
              ? Math.round(
                  progressRecords.reduce((sum, progress) => sum + progress.percent, 0)
                  / progressRecords.length
                )
              : 0;
            return {
              title: "Milestone progress",
              ariaLabel: "Milestone progress over the last 30 days",
              loading: Boolean(taskLoadState?.status === "loading" && milestoneRecords.length === 0),
              error: taskLoadState?.status === "error"
                ? String(taskLoadState?.error || "Milestone analytics unavailable")
                : null,
              hasData: milestoneRecords.length > 0,
              labels: timeline.labels,
              metrics: [
                { id: "total", label: "Milestones", value: milestoneRecords.length, color: "#7effff" },
                { id: "active", label: "Active", value: activeCount, color: "#4da3ff" },
                { id: "completed", label: "Completed", value: completedCount, color: "#85df7b" },
                { id: "progress", label: "Average progress", value: averageProgress + "%", color: "#636bdc" },
              ],
              series: milestoneRecords.map((release, index) =>
                buildProjectOverviewMilestoneSeries(
                  release,
                  timeline.bucketEndTimes,
                  PROJECT_MILESTONE_CHART_COLORS[index % PROJECT_MILESTONE_CHART_COLORS.length],
                  index
                )
              ),
            };
          }

          function buildProjectOverviewMilestoneRows(milestoneRecords) {
            return milestoneRecords.map((release) => {
              const status = getProjectOverviewMilestoneStatusPresentation(
                getPlaygroundTaskReleaseStatus(release)
              );
              const progress = getProjectOverviewMilestoneProgress(release);
              const targetLabel = release?.endAt
                ? formatProjectOverviewMilestoneDate(release.endAt, { includeYear: true })
                : "No target";
              const updatedTimestamp = parseProjectOverviewMilestoneTimestamp(
                release?.updatedAt,
                release?.createdAt
              );
              const updatedLabel = updatedTimestamp
                ? formatProjectOverviewMilestoneDate(updatedTimestamp, { includeYear: true, fallback: "-" })
                : "-";
              const name = String(release?.name || "Untitled Milestone").trim() || "Untitled Milestone";
              return {
                id: String(release.id),
                name,
                statusLabel: status.label,
                statusVariant: status.variant,
                statusRank: status.rank,
                progressPercent: progress.percent,
                ticketCount: progress.total,
                completedTicketCount: progress.completed,
                targetLabel,
                updatedLabel,
                updatedTimestamp,
                searchText: [
                  name,
                  status.label,
                  targetLabel,
                  String(release?.description || ""),
                  (Array.isArray(release?.successCriteria) ? release.successCriteria : []).join(" "),
                ].join(" "),
                source: release,
              };
            });
          }

          function renderProjectOverviewMilestonesPanel() {
            const milestoneRecords = getProjectOverviewMilestoneRecords();
            const rows = buildProjectOverviewMilestoneRows(milestoneRecords);
            return React.createElement(ProjectMilestonesOverviewPage, {
              rows,
              analytics: buildProjectOverviewMilestonesAnalytics(milestoneRecords),
              loading: Boolean(taskLoadState?.status === "loading" && rows.length === 0),
              error: taskLoadState?.status === "error"
                ? String(taskLoadState?.error || "Unable to load milestones")
                : "",
              onCreate: () => {
                if (typeof openReleaseComposer === "function") {
                  openReleaseComposer();
                }
              },
              onOpen: (row) => {
                if (typeof openReleaseComposerForEdit === "function" && row?.source) {
                  openReleaseComposerForEdit(row.source);
                }
              },
            });
          }
`;
