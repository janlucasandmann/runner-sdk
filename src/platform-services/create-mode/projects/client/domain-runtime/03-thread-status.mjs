export const PROJECTS_DOMAIN_RUNTIME_03_FRAGMENT = `
      const PLAYGROUND_TASK_THREAD_ACTIVE_STATUSES = new Set([
        "active",
        "created",
        "pending",
        "queued",
        "ready",
        "running",
        "starting",
      ]);
      const PLAYGROUND_TASK_THREAD_TERMINAL_STATUSES = new Set([
        "archived",
        "cancelled",
        "canceled",
        "complete",
        "completed",
        "deleted",
        "done",
        "failed",
        "finished",
        "succeeded",
        "success",
      ]);

      function readPlaygroundTaskThreadStatusValue(payload, keys) {
        const candidates = [
          payload,
          payload?.thread,
          payload?.data,
          payload?.data?.thread,
        ];
        for (const candidate of candidates) {
          if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
            continue;
          }
          for (const key of keys) {
            const value = candidate[key];
            if (typeof value === "string" && value.trim()) {
              return value.trim();
            }
          }
        }
        return "";
      }

      function resolvePlaygroundTaskThreadStatus(status, completedAt, updatedAt) {
        const normalizedStatus = String(status || "").trim().toLowerCase();
        if (normalizedStatus === "permission asked" || normalizedStatus === "permission_asked") {
          return "permission_asked";
        }
        if (PLAYGROUND_TASK_THREAD_TERMINAL_STATUSES.has(normalizedStatus)) {
          return normalizedStatus;
        }

        const completedAtMs = Date.parse(String(completedAt || ""));
        if (Number.isFinite(completedAtMs)) {
          const updatedAtMs = Date.parse(String(updatedAt || ""));
          const completionPrecedesNewActivity = Number.isFinite(updatedAtMs)
            && updatedAtMs > completedAtMs + 1000;
          if (!completionPrecedesNewActivity) {
            return "completed";
          }
        }
        return normalizedStatus || "unavailable";
      }

      function normalizePlaygroundTaskThreadStatusSnapshot(payload, fallbackThreadId) {
        const threadId = readPlaygroundTaskThreadStatusValue(payload, ["threadId", "thread_id", "id"])
          || String(fallbackThreadId || "").trim();
        const completedAt = readPlaygroundTaskThreadStatusValue(payload, [
          "completedAt",
          "completed_at",
          "finishedAt",
          "finished_at",
          "endedAt",
          "ended_at",
        ]);
        const updatedAt = readPlaygroundTaskThreadStatusValue(payload, ["updatedAt", "updated_at"]);
        const status = resolvePlaygroundTaskThreadStatus(
          readPlaygroundTaskThreadStatusValue(payload, ["status"]),
          completedAt,
          updatedAt
        );
        return {
          id: threadId,
          status,
          completedAt,
          updatedAt,
        };
      }

      function getPlaygroundTaskThreadSummaryRecords(payload, fallbackTask = {}) {
        const details = payload?.details && typeof payload.details === "object" && !Array.isArray(payload.details)
          ? payload.details
          : {};
        const summaryItems = Array.isArray(details.threadSummaries)
          ? details.threadSummaries
          : Array.isArray(details.linkedThreads)
            ? details.linkedThreads
            : [];
        const lastStartedThread = details.lastStartedThreadSummary
          || details.lastStartedThread
          || null;
        const recordsById = new Map();

        summaryItems.concat(lastStartedThread ? [lastStartedThread] : []).forEach((item) => {
          const source = item?.thread && typeof item.thread === "object" && !Array.isArray(item.thread)
            ? item.thread
            : item;
          const threadId = readPlaygroundTaskThreadStatusValue(source, ["id", "threadId", "thread_id"]);
          if (!threadId) {
            return;
          }
          const title = readPlaygroundTaskThreadStatusValue(source, ["title", "name"])
            || "Thread " + threadId;
          const status = resolvePlaygroundTaskThreadStatus(
            readPlaygroundTaskThreadStatusValue(source, ["status"]),
            readPlaygroundTaskThreadStatusValue(source, [
              "completedAt",
              "completed_at",
              "finishedAt",
              "finished_at",
              "endedAt",
              "ended_at",
            ]),
            readPlaygroundTaskThreadStatusValue(source, ["updatedAt", "updated_at"])
          );
          recordsById.set(threadId, normalizeThreadItem({
            id: threadId,
            title,
            status,
          }));
        });

        const linkedThreadIds = [];
        const lastStartedThreadId = String(fallbackTask?.lastStartedThreadId || "").trim();
        if (lastStartedThreadId) {
          linkedThreadIds.push(lastStartedThreadId);
        }
        normalizePlaygroundIdList(fallbackTask?.linkedThreadIds).forEach((threadId) => {
          if (threadId) {
            linkedThreadIds.push(threadId);
          }
        });
        linkedThreadIds.forEach((threadId) => {
          if (!recordsById.has(threadId)) {
            recordsById.set(threadId, normalizeThreadItem({
              id: threadId,
              title: "Thread " + threadId,
              status: "unavailable",
            }));
          }
        });

        return Array.from(recordsById.values());
      }

      function isPlaygroundTaskThreadStatusActive(status) {
        return PLAYGROUND_TASK_THREAD_ACTIVE_STATUSES.has(String(status || "").trim().toLowerCase());
      }

      function mergePlaygroundTaskThreadStatusSnapshots(threads, snapshots, context = {}) {
        const snapshotById = new Map();
        (Array.isArray(snapshots) ? snapshots : []).forEach((snapshot) => {
          const threadId = String(snapshot?.id || "").trim();
          if (threadId) {
            snapshotById.set(threadId, snapshot);
          }
        });
        if (snapshotById.size === 0) {
          return Array.isArray(threads) ? threads : [];
        }

        let didChange = false;
        const nextThreads = (Array.isArray(threads) ? threads : []).map((thread) => {
          const threadId = String(thread?.id || "").trim();
          const snapshot = snapshotById.get(threadId);
          if (!snapshot) {
            return thread;
          }
          snapshotById.delete(threadId);
          const nextStatus = String(snapshot.status || thread?.status || "").trim();
          const nextCompletedAt = String(snapshot.completedAt || thread?.completedAt || "").trim();
          const nextUpdatedAt = String(snapshot.updatedAt || thread?.updatedAt || "").trim();
          if (
            nextStatus === String(thread?.status || "").trim()
            && nextCompletedAt === String(thread?.completedAt || "").trim()
            && nextUpdatedAt === String(thread?.updatedAt || "").trim()
          ) {
            return thread;
          }
          didChange = true;
          return {
            ...thread,
            status: nextStatus,
            completedAt: nextCompletedAt,
            updatedAt: nextUpdatedAt,
          };
        });

        snapshotById.forEach((snapshot, threadId) => {
          didChange = true;
          nextThreads.push({
            id: threadId,
            title: "Thread " + threadId,
            status: snapshot.status,
            projectId: String(context.projectId || "").trim(),
            completedAt: snapshot.completedAt,
            updatedAt: snapshot.updatedAt,
            metadata: {
              runnerPlayground: {
                taskPreview: {
                  taskId: String(context.taskId || "").trim(),
                  projectId: String(context.projectId || "").trim(),
                  ticketNumber: String(context.ticketNumber || "").trim(),
                  title: String(context.taskTitle || "Untitled Task").trim(),
                },
              },
            },
          });
        });

        return didChange ? nextThreads : (Array.isArray(threads) ? threads : []);
      }
`;
